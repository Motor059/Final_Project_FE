import { getAuthVersion } from '@/lib/authStorage';

// Display the last successful read while refreshing, within the same login session only.
export function createSessionSnapshot<T>(maxAge = 60_000) {
  let entry: { version: number; receivedAt: number; data: T } | null = null;
  return {
    read(): T | null {
      return entry && localStorage.getItem('accessToken') && entry.version === getAuthVersion() &&
        Date.now() - entry.receivedAt < maxAge ? entry.data : null;
    },
    write(data: T, version: number) {
      if (version === getAuthVersion() && localStorage.getItem('accessToken')) entry = { version, receivedAt: Date.now(), data };
    },
  };
}
