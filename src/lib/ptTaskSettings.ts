import type { PTOptions, PTSession, PTTaskSettings, PTTaskType, PTTrack } from "@/types/pt";

const legacyTracks: PTTrack[] = ["SECURITY", "UI_UX", "AI", "DATA"];
const defaultNotice = "직접 제작한 연습용 과제이며 실제 기출 및 공식 전형과 다를 수 있습니다.";

export const ptTaskTypeLabels: Record<PTTaskType, string> = {
  SERVICE_IMPROVEMENT: "서비스 개선형",
  JOB_PROBLEM_SOLVING: "직무 문제 해결형",
};

// Missing settings belong to the original API. Explicit empty lists in the new
// contract must stay empty so unavailable choices cannot be submitted.
export function resolvePTTaskSettings(
  settings?: PTTaskSettings | null,
  defaults?: Pick<PTOptions, "preparationMinutes" | "presentationSeconds"> | null,
): PTTaskSettings {
  const trackSelectionRequired = settings?.trackSelectionRequired ?? true;
  const tracks = settings ? settings.allowedTracks : legacyTracks;
  const minutes = settings?.preparationMinutes ?? defaults?.preparationMinutes ?? [15, 20];
  const duration = settings?.presentationSeconds ?? defaults?.presentationSeconds ?? 300;
  return {
    taskType: settings?.taskType ?? "SERVICE_IMPROVEMENT",
    targetJobRole: settings?.targetJobRole?.trim() || null,
    trackSelectionRequired,
    allowedTracks: trackSelectionRequired && Array.isArray(tracks)
      ? [...new Set(tracks.filter((track) => legacyTracks.includes(track)))] : [],
    preparationMinutes: Array.isArray(minutes)
      ? [...new Set(minutes.filter((value) => Number.isSafeInteger(value) && value > 0))] : [],
    presentationSeconds: Number.isSafeInteger(duration) && duration > 0 ? duration : 300,
    practiceNotice: settings?.practiceNotice?.trim() || defaultNotice,
  };
}

export function ptTrackConfigurationError(settings: PTTaskSettings): string | null {
  return settings.trackSelectionRequired && !settings.allowedTracks.length
    ? "이 과제의 발표 분야 설정을 확인하지 못했어요. 다시 불러와 주세요." : null;
}

export function ptSessionTrackState(session: PTSession) {
  const settings = resolvePTTaskSettings(session.task.settings);
  const track = settings.trackSelectionRequired && session.track && settings.allowedTracks.includes(session.track)
    ? session.track : null;
  const error = ptTrackConfigurationError(settings);
  return { settings, track, error, ready: !error && (!settings.trackSelectionRequired || !!track) };
}

export function ptPresentationDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return minutes ? `${minutes}분${remainder ? ` ${remainder}초` : ""}` : `${remainder}초`;
}
