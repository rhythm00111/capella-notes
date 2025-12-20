// Note type definition

export interface Note {
  id: string;
  folderId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  isPinned: boolean;
  aiSummary?: string;
  aiLastGenerated?: string;
}
