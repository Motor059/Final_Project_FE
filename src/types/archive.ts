export type ArchiveCompanyType = "large" | "service" | "fintech";
export type ArchiveFormat = "qa" | "pt";
export type ArchiveStage = "tech" | "exec";
export interface ArchiveCompany {
  id: string;
  name: string;
  display: string;
  listed: boolean;
  aliases: string[];
}
export interface ArchiveQuestion { id: string; text: string; likes: number }
export interface ArchiveRecord {
  id: string;
  companyId: string;
  companyType: ArchiveCompanyType;
  format: ArchiveFormat;
  stage: ArchiveStage;
  period: string;
  role: string;
  tip: string;
  mine: boolean;
  reported: boolean;
  order: number;
  questions: ArchiveQuestion[];
}
export interface ArchiveFilters {
  companyId: string | null;
  companyType: ArchiveCompanyType | "all";
  format: ArchiveFormat | "all";
  stage: ArchiveStage | "all";
  role: string;
}
export interface ArchiveSubmission {
  company: ArchiveCompany;
  companyType: ArchiveCompanyType;
  format: ArchiveFormat;
  stage: ArchiveStage;
  period: string;
  role: string;
  tip: string;
  questions: string[];
}
