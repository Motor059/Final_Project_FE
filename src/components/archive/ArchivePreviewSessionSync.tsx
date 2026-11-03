import { useLayoutEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { useArchivePreviewStore } from "@/store/useArchivePreviewStore";

export default function ArchivePreviewSessionSync() {
  const owner = useAuthStore((state) => state.isLoggedIn ? `member:${state.user?.id ?? "pending"}` : "guest");
  const previousOwner = useRef(owner);
  const reset = useArchivePreviewStore((state) => state.reset);
  useLayoutEffect(() => {
    if (previousOwner.current !== owner) {
      previousOwner.current = owner;
      reset();
    }
  }, [owner, reset]);
  return null;
}
