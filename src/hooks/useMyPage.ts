import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { updateNickname } from "@/api/userApi";
import { getAuthVersion } from "@/lib/authStorage";
import useDocuments from "@/hooks/useDocuments";

interface UserQuery { version: number; error: boolean; }

export default function useMyPage() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const cachedUser = useAuthStore((state) => state.user);
  const fetchUserInfo = useAuthStore((state) => state.fetchUserInfo);
  const updateNicknameInStore = useAuthStore((state) => state.updateNicknameInStore);
  const removeAccount = useAuthStore((state) => state.withdraw);
  const isWithdrawing = useAuthStore((state) => state.isWithdrawing);
  const documentState = useDocuments(isLoggedIn);
  const version = getAuthVersion();
  const [query, setQuery] = useState<UserQuery>(() => ({ version, error: false }));
  const current = query.version === version ? query : null;
  const user = cachedUser;
  const isError = !!current?.error && !user;

  useEffect(() => {
    if (!isLoggedIn) return;
    let active = true;
    const load = async () => {
      try {
        await fetchUserInfo({ includeLastSetting: false });
        if (active && version === getAuthVersion()) setQuery({ version, error: false });
      } catch (error) {
        if (active && version === getAuthVersion()) {
          console.error("마이페이지 사용자 조회 실패:", error);
          setQuery({ version, error: true });
        }
      }
    };
    void load();
    return () => { active = false; };
  }, [isLoggedIn, version, fetchUserInfo]);

  const changeNickname = async (nickname: string) => {
    if (!user) return;
    await updateNickname(nickname);
    if (version !== getAuthVersion() || useAuthStore.getState().isWithdrawing || useAuthStore.getState().user?.id !== user.id) return;
    setQuery({ version, error: false });
    updateNicknameInStore(nickname);
  };
  return {
    ...documentState,
    documentsError: documentState.isError,
    documentsLoading: documentState.isLoading,
    retryDocuments: documentState.retry,
    user: isLoggedIn ? user : null,
    isLoading: isLoggedIn && ((!user && !isError) || documentState.isLoading),
    isError: isLoggedIn && isError,
    changeNickname, removeAccount, isWithdrawing,
  };
}
