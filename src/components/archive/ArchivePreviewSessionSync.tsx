import { useLayoutEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { useArchivePreviewStore } from "@/store/useArchivePreviewStore";

export default function ArchivePreviewSessionSync() {
  const sessionVersion = useAuthStore((state) => state.sessionVersion);
  const previousVersion = useRef(sessionVersion);
  const reset = useArchivePreviewStore((state) => state.reset);
  useLayoutEffect(() => {
    if (previousVersion.current !== sessionVersion) {
      previousVersion.current = sessionVersion;
      reset();
    }
  }, [sessionVersion, reset]);
  return null;
}
