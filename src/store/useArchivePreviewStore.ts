import { create } from "zustand";
import { createArchivePreviewData } from "@/lib/archivePreviewData";
import { normalizeCompanyName } from "@/lib/archiveDisplay";
import type { ArchiveCompany, ArchiveRecord, ArchiveSubmission } from "@/types/archive";

interface ArchivePreviewState {
  companies: ArchiveCompany[];
  records: ArchiveRecord[];
  liked: Record<string, boolean>;
  addedCount: number;
  toast: string;
  reset: () => void;
  toggleLike: (id: string) => void;
  addRecord: (submission: ArchiveSubmission) => boolean;
  reportRecord: (id: string) => void;
  deleteRecord: (id: string) => void;
  notify: (message: string) => void;
}
let nextPreviewId = 1;
let toastTimer: ReturnType<typeof setTimeout> | null = null;
const initialState = () => ({ ...createArchivePreviewData(), liked: {} as Record<string, boolean>, addedCount: 0, toast: "" });

export const useArchivePreviewStore = create<ArchivePreviewState>((set, get) => ({
  ...initialState(),
  reset: () => {
    if (toastTimer !== null) clearTimeout(toastTimer);
    toastTimer = null;
    nextPreviewId = 1;
    set(initialState());
  },
  notify: (message) => {
    if (toastTimer !== null) clearTimeout(toastTimer);
    set({ toast: message });
    toastTimer = setTimeout(() => { set({ toast: "" }); toastTimer = null; }, 2400);
  },
  toggleLike: (id) => set((previous) => ({ liked: { ...previous.liked, [id]: !previous.liked[id] } })),
  addRecord: (submission) => {
    const current = get();
    const questions = submission.questions.map((question) => question.trim()).filter(Boolean);
    if (questions.length === 0 || questions.length > 20 - current.addedCount) return false;
    const number = nextPreviewId++;
    const existing = current.companies.find((company) => company.id === submission.company.id
      || [company.display, company.name, ...company.aliases].some((value) => normalizeCompanyName(value) === normalizeCompanyName(submission.company.display)));
    const company = existing ?? { ...submission.company, id: `preview-company-${number}` };
    const record: ArchiveRecord = {
      id: `preview-record-${number}`, companyId: company.id, companyType: submission.companyType,
      format: submission.format, stage: submission.stage, period: submission.period,
      role: submission.role, tip: submission.tip, mine: true, reported: false, order: 1000 + number,
      questions: questions.map((text, index) => ({ id: `preview-question-${number}-${index}`, text, likes: 0 })),
    };
    set({ companies: existing ? current.companies : [...current.companies, company], records: [record, ...current.records], addedCount: current.addedCount + questions.length });
    get().notify(`미리보기에 질문 ${questions.length}개를 추가했어요.`);
    return true;
  },
  reportRecord: (id) => {
    const record = get().records.find((item) => item.id === id);
    if (!record || record.mine || record.reported) return;
    set((previous) => ({ records: previous.records.map((item) => item.id === id ? { ...item, reported: true } : item) }));
    get().notify("신고 상태를 표시했어요. 실제 전송은 하지 않아요.");
  },
  deleteRecord: (id) => {
    const current = get();
    const record = current.records.find((item) => item.id === id);
    if (!record?.mine) return;
    const liked = { ...current.liked };
    for (const question of record.questions) delete liked[question.id];
    set({ records: current.records.filter((item) => item.id !== id), liked });
    get().notify(`미리보기에서 질문 ${record.questions.length}개를 삭제했어요.`);
  },
}));
