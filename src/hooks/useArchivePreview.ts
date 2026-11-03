import { useArchivePreviewStore } from "@/store/useArchivePreviewStore";

export default function useArchivePreview() {
  const model = useArchivePreviewStore();
  return { ...model, remainingQuestions: 20 - model.addedCount };
}
