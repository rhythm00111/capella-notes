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
  
  // Sub-page support (Notion-style pages inside pages)
  parentId?: string | null;
  childIds?: string[];
  isSubPage?: boolean;
  
  // AI-ready fields (for future integration)
  aiSummary?: string;
  aiLastGenerated?: string;
}

// For building page hierarchy
export interface NoteHierarchy {
  note: Note;
  children: NoteHierarchy[];
  depth: number;
}
