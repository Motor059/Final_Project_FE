export interface DocumentItem {
  docId: number;
  fileName: string;
  createdAt: string;
}

export interface DocumentListResponse {
  documents: DocumentItem[];
}

export interface DocumentRenameResponse {
  docId: number;
  fileName: string;
}