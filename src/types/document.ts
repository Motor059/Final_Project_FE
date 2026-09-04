export interface DocumentItem {
  docId: number;
  fileName: string;
  createdAt: string;
}

export interface DocumentRenameResponse {
  docId: number;
  fileName: string;
}