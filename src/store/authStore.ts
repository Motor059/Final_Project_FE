import { create } from 'zustand';
import { deleteMyAccount, getMyInfo } from '@/api/userApi';
import { getHistoryList } from '@/api/historyApi';
import type { UserResponse } from '@/types/user';
import { authApi, type KakaoLoginResponse } from '@/api/authApi';
import { clearAuthStorage, getAuthVersion, readCachedUser, saveAuthSession } from '@/lib/authStorage';
import { useInterviewStore } from '@/store/useInterviewStore';
import type { LastInterviewSetting } from '@/types/setup';
import { latestInterviewSetting } from '@/lib/interviewSetup';

interface AuthState {
  isLoggedIn: boolean;
  user: UserResponse | null;
  lastSetting: LastInterviewSetting | null;
  isWithdrawing: boolean;
  completeLogin: (data: KakaoLoginResponse) => void;
  clearSession: () => void;
  fetchUserInfo: () => Promise<void>;
  withdraw: () => Promise<void>;
  logout: () => Promise<void>;
  updateNicknameInStore: (nickname: string) => void;
}

const initialLoginState = !!localStorage.getItem('accessToken');
const initialUser = readCachedUser();
let withdrawal: { version: number; promise: Promise<void> } | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: initialLoginState,
  user: initialUser,
  lastSetting: null,
  isWithdrawing: false,

  completeLogin: (data) => {
    if (!data.accessToken || !data.refreshToken || !data.user || !Number.isSafeInteger(data.user.id)) {
      throw new Error('로그인 응답을 확인하지 못했습니다. 다시 시도해 주세요.');
    }
    saveAuthSession(data, data.user);
    set({ isLoggedIn: true, user: data.user, lastSetting: null, isWithdrawing: false });
  },

  clearSession: () => {
    clearAuthStorage();
    set({ isLoggedIn: false, user: null, lastSetting: null, isWithdrawing: false });
    useInterviewStore.getState().resetInterview();
  },

  fetchUserInfo: async () => {
    const version = getAuthVersion();
    if (!localStorage.getItem('accessToken') || get().isWithdrawing) return;
    const isCurrent = () => version === getAuthVersion() && !get().isWithdrawing;
    try {
      const userInfo = await getMyInfo();
      if (!isCurrent()) return;
      if (!localStorage.getItem('accessToken')) {
        get().clearSession();
        return;
      }
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      set({ isLoggedIn: true, user: userInfo });

      void getHistoryList().then((historyData) => {
        if (!isCurrent() || !localStorage.getItem('accessToken') || get().user?.id !== userInfo.id) return;
        set({ lastSetting: latestInterviewSetting(historyData?.sessions || []) });
      }).catch((error) => {
        if (!isCurrent()) return;
        console.warn('최근 면접 설정 조회 실패:', error);
        if (!localStorage.getItem('accessToken')) get().clearSession();
      });
    } catch (error) {
      if (!isCurrent()) return;
      if (!localStorage.getItem('accessToken')) get().clearSession();
      console.error('유저 정보 조회 실패:', error);
      throw error;
    }
  },

  updateNicknameInStore: (nickname) => {
    const currentUser = get().user;
    if (!currentUser || !get().isLoggedIn || get().isWithdrawing || !localStorage.getItem('accessToken')) return;
    const updatedUser = { ...currentUser, nickname };
    localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  withdraw: () => {
    const version = getAuthVersion();
    if (withdrawal?.version === version) return withdrawal.promise;
    if (!get().isLoggedIn || !localStorage.getItem('accessToken')) {
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
      await authApi.logout();
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
