import type { ArchiveCompany, ArchiveFilters, ArchiveRecord } from "@/types/archive";

export const archiveCompanyLabels = { large: "대기업 SW", service: "서비스 기업", fintech: "금융 IT" };
export const archiveRoles = ["백엔드", "프론트엔드", "풀스택", "데이터", "IT 개발", "기타"];
export const initialArchiveFilters: ArchiveFilters = { companyId: null, companyType: "all", format: "all", stage: "all", role: "all" };
export const archiveReportReasons = [
  { value: "FALSE_INFO", title: "허위 정보", description: "실제 면접과 다른 내용이에요" },
  { value: "AD", title: "광고, 홍보", description: "강의나 서비스 홍보가 목적이에요" },
  { value: "INAPPROPRIATE", title: "부적절한 내용", description: "욕설, 비방, 개인정보가 담겨 있어요" },
  { value: "COPIED", title: "다른 사이트에서 복사", description: "다른 커뮤니티나 사이트의 글을 옮겼어요" },
  { value: "NDA", title: "비밀유지 위반", description: "회사가 공개하지 말라고 한 내용이에요" },
];

export function normalizeCompanyName(value: string) {
  return value.normalize("NFKC").replace(/\(주\)|㈜|주식회사/g, "").replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();
}
export function searchArchiveCompanies(companies: ArchiveCompany[], query: string) {
  const value = normalizeCompanyName(query);
  if (!value) return [];
  return companies.map((company) => {
    const score = Math.max(...[company.display, company.name, ...company.aliases].map((key) => {
      const normalized = normalizeCompanyName(key);
      return normalized === value ? 3 : normalized.startsWith(value) ? 2 : normalized.includes(value) ? 1 : 0;
    }));
    return { company, score };
  }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score || Number(b.company.listed) - Number(a.company.listed)).slice(0, 6).map((item) => item.company);
}
export function filterArchiveRecords(records: ArchiveRecord[], filters: ArchiveFilters) {
  return records.filter((record) => (!filters.companyId || record.companyId === filters.companyId)
    && (filters.companyType === "all" || record.companyType === filters.companyType)
    && (filters.format === "all" || record.format === filters.format)
    && (filters.stage === "all" || record.stage === filters.stage)
    && (filters.role === "all" || (filters.role === "기타" ? !archiveRoles.slice(0, -1).includes(record.role) && !!record.role : record.role === filters.role)));
}
export function archiveLikeCount(record: ArchiveRecord, liked: Record<string, boolean>) {
  return record.questions.reduce((sum, question) => sum + question.likes + Number(!!liked[question.id]), 0);
}
export function localInterviewMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
