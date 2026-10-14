import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getMyInfo, updateNickname } from "@/api/userApi";
import { getAuthVersion } from "@/lib/authStorage";
import useDocuments from "@/hooks/useDocuments";
import type { UserResponse } from "@/types/user";

export default function useMyPage() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const updateNicknameInStore = useAuthStore((state) => state.updateNicknameInStore);
  const removeAccount = useAuthStore((state) => state.withdraw);
  const isWithdrawing = useAuthStore((state) => state.isWithdrawing);
  const documentState = useDocuments(isLoggedIn);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(isLoggedIn);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setUser(null);
      setIsError(false);
      setIsLoading(false);
      return;
    }
    const version = getAuthVersion();
    let active = true;
    const fetchUser = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const data = await getMyInfo();
        if (active && version === getAuthVersion()) setUser(data);
      } catch (error) {
        if (active && version === getAuthVersion()) {
          console.error("마이페이지 사용자 조회 실패:", error);
          setIsError(true);
        }
      } finally {
        if (active && version === getAuthVersion()) setIsLoading(false);
      }
    };
    void fetchUser();
    return () => { active = false; };
  }, [isLoggedIn]);

  const changeNickname = async (nickname: string) => {
    const version = getAuthVersion();
    await updateNickname(nickname);
    if (version !== getAuthVersion() || useAuthStore.getState().isWithdrawing) return;
    setUser((current) => current ? { ...current, nickname } : current);
    updateNicknameInStore(nickname);
  };
  return {
    ...documentState,
    user: isLoggedIn ? user : null,
    isLoading: isLoggedIn && (isLoading || documentState.isLoading),
    isError: isError || documentState.isError || !isLoggedIn,
    changeNickname, removeAccount, isWithdrawing,
  };
}
