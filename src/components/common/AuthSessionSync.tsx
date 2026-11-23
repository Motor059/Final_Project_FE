import { useEffect } from 'react';
import { AUTH_SESSION_STORAGE_KEYS } from '@/lib/authStorage';
import { useAuthStore } from '@/store/authStore';

export default function AuthSessionSync() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const sync = (external: boolean) => {
      useAuthStore.getState().syncSession(external);
      const state = useAuthStore.getState();
      if (state.isLoggedIn && !state.user) void state.fetchUserInfo({ includeLastSetting: false }).catch(() => {});
    };
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea && event.storageArea !== localStorage) return;
      if (event.key && !AUTH_SESSION_STORAGE_KEYS.includes(event.key)) return;
      clearTimeout(timer);
      timer = setTimeout(() => sync(true), 0);
    };
    const onLocalChange = () => sync(false);
    const onResume = () => sync(true);
    sync(true);
    window.addEventListener('storage', onStorage);
    window.addEventListener('devoir:auth-session-change', onLocalChange);
    window.addEventListener('focus', onResume);
    window.addEventListener('pageshow', onResume);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('devoir:auth-session-change', onLocalChange);
      window.removeEventListener('focus', onResume);
      window.removeEventListener('pageshow', onResume);
    };
  }, []);
  return null;
}
