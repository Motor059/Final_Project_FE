import { create } from 'zustand';
import { deleteMyAccount, getMyInfo } from '@/api/userApi';
import { getHistoryList } from '@/api/historyApi';
import type { UserResponse } from '@/types/user';
import { authApi, type KakaoLoginResponse } from '@/api/authApi';
import { clearAuthStorage, getAuthVersion, hasMemberSession, readCachedUser, saveAuthSession } from '@/lib/authStorage';
import { useInterviewStore } from '@/store/useInterviewStore';
import type { LastInterviewSetting } from '@/types/setup';
import { latestInterviewSetting } from '@/lib/interviewSetup';

interface AuthState {
  isLoggedIn: boolean;
  user: UserResponse | null;
  lastSetting: LastInterviewSetting | null;
  isWithdrawing: boolean;
  sessionVersion: number;
  externalSessionVersion: number;
  syncSession: (external?: boolean) => void;
  completeLogin: (data: KakaoLoginResponse) => void;
  clearSession: () => void;
  fetchUserInfo: (options?: { includeLastSetting?: boolean }) => Promise<UserResponse | null>;
  withdraw: () => Promise<void>;
  logout: () => Promise<void>;
  updateNicknameInStore: (nickname: string) => void;
}

const initialLoginState = hasMemberSession();
const initialUser = readCachedUser();
const initialSessionVersion = getAuthVersion();
let withdrawal: { version: number; promise: Promise<void> } | null = null;
let profileRevision = 0;
interface ProfileRequest {
  version: number;
  revision: number;
  includeLastSetting: boolean;
  promise: Promise<UserResponse | null>;
}
let profileRequest: ProfileRequest | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: initialLoginState,
  user: initialUser,
  lastSetting: null,
  isWithdrawing: false,
  sessionVersion: initialSessionVersion,
  externalSessionVersion: 0,

  syncSession: (external = false) => {
    const version = getAuthVersion();
    const member = hasMemberSession();
    const cachedUser = member ? readCachedUser() : null;
    const current = get();
    if (version !== current.sessionVersion) {
      profileRevision++;
      profileRequest = null;
      set({ sessionVersion: version, externalSessionVersion: current.externalSessionVersion + Number(external),
        isLoggedIn: member, user: cachedUser, lastSetting: null, isWithdrawing: false });
      useInterviewStore.getState().resetInterview();
    } else if (member && cachedUser && (!current.isLoggedIn || current.user?.id !== cachedUser.id ||
      current.user.nickname !== cachedUser.nickname || current.user.createdAt !== cachedUser.createdAt)) {
      profileRevision++;
      set({ isLoggedIn: true, user: cachedUser });
    } else if (!member && (current.isLoggedIn || current.user)) {
      set({ isLoggedIn: false, user: null, lastSetting: null });
    }
  },

  completeLogin: (data) => {
    if (!data.accessToken || !data.refreshToken || !data.user || !Number.isSafeInteger(data.user.id)) {
      throw new Error('로그인 응답을 확인하지 못했습니다. 다시 시도해 주세요.');
    }
    saveAuthSession(data, data.user);
    get().syncSession();
  },

  clearSession: () => {
    clearAuthStorage();
    get().syncSession();
  },

  fetchUserInfo: (options = {}) => {
    const version = getAuthVersion();
    if (get().isWithdrawing) return Promise.resolve(null);
    if (!hasMemberSession()) {
      set({ isLoggedIn: false, user: null, lastSetting: null });
      return Promise.resolve(null);
    }
    if (profileRequest?.version === version && profileRequest.revision === profileRevision) {
      profileRequest.includeLastSetting ||= options.includeLastSetting !== false;
      return profileRequest.promise;
    }
    const isCurrent = () => version === getAuthVersion() && hasMemberSession() && !get().isWithdrawing;
    const operation: ProfileRequest = {
      version,
      revision: profileRevision,
      includeLastSetting: options.includeLastSetting !== false,
      promise: Promise.resolve(null),
    };
    operation.promise = (async () => {
      try {
        const userInfo = await getMyInfo();
        if (!isCurrent()) return null;
        if (!userInfo || !Number.isSafeInteger(userInfo.id) || userInfo.id <= 0 || typeof userInfo.nickname !== 'string' || !userInfo.nickname.trim()) {
          throw new Error('프로필 응답을 확인하지 못했습니다. 다시 시도해 주세요.');
        }
        // A response started before a nickname change must not restore the old nickname.
        if (operation.revision === profileRevision) {
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
          set({ isLoggedIn: true, user: userInfo });
        }
        const currentUser = get().user;

        if (currentUser && operation.includeLastSetting) {
          void getHistoryList().then((historyData) => {
            if (!isCurrent() || get().user?.id !== currentUser.id) return;
            set({ lastSetting: latestInterviewSetting(historyData?.sessions || []) });
          }).catch((error) => {
            if (!isCurrent()) return;
            console.warn('최근 면접 설정 조회 실패:', error);
          });
        }
        return currentUser;
      } catch (error) {
        if (!isCurrent()) return null;
        console.error('유저 정보 조회 실패:', error);
        throw error;
      } finally {
        if (profileRequest === operation) profileRequest = null;
      }
    })();
    profileRequest = operation;
    return operation.promise;
  },

  updateNicknameInStore: (nickname) => {
    const currentUser = get().user;
    if (!currentUser || !get().isLoggedIn || get().isWithdrawing || !hasMemberSession()) return;
    profileRevision++;
    const updatedUser = { ...currentUser, nickname };
    localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  withdraw: () => {
    const version = getAuthVersion();
    if (withdrawal?.version === version) return withdrawal.promise;
    if (!get().isLoggedIn || !hasMemberSession()) {
      return Promise.reject(new Error('로그인 후 다시 시도해 주세요.'));
    }
    set({ isWithdrawing: true });
    const promise: Promise<void> = (async () => {
      try {
        await deleteMyAccount();
        if (version !== getAuthVersion()) throw new Error('로그인 상태가 변경되었습니다. 현재 계정을 확인해 주세요.');
        get().clearSession();
        window.location.replace('/');
      } finally {
        if (version === getAuthVersion()) set({ isWithdrawing: false });
        if (withdrawal?.version === version) withdrawal = null;
      }
    })();
    withdrawal = { version, promise };
    return promise;
  },

  logout: async () => {
    if (get().isWithdrawing) return;
    const version = getAuthVersion();
    try {
      if (hasMemberSession()) await authApi.logout();
    } catch (error) {
      console.warn('서버 로그아웃 통신 실패. 로컬 데이터만 삭제합니다.', error);
    } finally {
      if (version === getAuthVersion()) {
        get().clearSession();
        window.location.replace('/');
      }
    }
  },
}));
