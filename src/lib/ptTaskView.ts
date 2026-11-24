import type { PTTaskContent, PTTrack } from "@/types/pt";

export const ptTrackDescriptions: Record<PTTrack, string> = {
  SECURITY: "정보 접근·동의·오남용 방지 과정",
  UI_UX: "입력·동의·결과 이해·상담 연결",
  AI: "진단·추천·설명 품질",
  DATA: "품질·최신성·결측·검증 체계",
};

export function ptTaskParagraphs(text: string): string[] {
  if (typeof text !== "string") return [];
  return text.split(/\r?\n+/).map((part) => part.trim()).filter(Boolean);
}

export function ptTaskTextBlock(text: string): { title: string; detail: string } {
  const value = text.trim().replace(/^(?:[-•]\s+|\d+[.)]\s*)/, "");
  const separator = value.match(/^(.{1,70}?)(?:[：:](?!\/\/)\s*|\r?\n+)([\s\S]+)$/);
  if (separator) return { title: separator[1].trim(), detail: separator[2].trim() };
  const sentences = value.match(/^(.+?[.!?。])\s+([\s\S]+)$/);
  return sentences ? { title: sentences[1], detail: sentences[2] } : { title: value, detail: "" };
}

export function ptTaskProblems(content: PTTaskContent) {
  return ptTaskParagraphs(content.problemSituation).map(ptTaskTextBlock);
}

export function ptRelatedProblems(content: PTTaskContent, track?: PTTrack | null) {
  const guidance = track ? content.trackGuidance?.[track] ?? "" : "";
  return ptTaskProblems(content).flatMap((problem, index) => {
    const number = index + 1;
    const numbered = new RegExp(`(?:문제\\s*${number}(?!\\d)|(?:^|\\D)${number}\\s*번(?:째)?\\s*문제)`);
    const titleMentioned = problem.title.length >= 4 && guidance.includes(problem.title.replace(/[.!?。]$/, ""));
    return numbered.test(guidance) || titleMentioned ? [{ index, title: problem.title }] : [];
  });
}
