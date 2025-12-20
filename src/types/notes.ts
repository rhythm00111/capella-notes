// Capella Notes - Core Type Definitions

export type BlockType = 
  | 'paragraph' 
  | 'heading' 
  | 'list' 
  | 'numbered-list'
  | 'checkbox' 
  | 'quote' 
  | 'code' 
  | 'image' 
  | 'divider' 
  | 'voice';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  level?: number; // for headings (1, 2, 3)
  checked?: boolean; // for checkboxes
  language?: string; // for code blocks
  imageUrl?: string; // for image blocks
  audioUrl?: string; // for voice blocks
  audioDuration?: number; // in seconds
  children?: Block[];
}

export type AISuggestionType = 
  | 'tag' 
  | 'link' 
  | 'summary' 
  | 'duplicate' 
  | 'organize'
  | 'task';

export interface AISuggestion {
  id: string;
  type: AISuggestionType;
  confidence: number; // 0-1
  value: unknown;
  reason?: string;
  createdAt: Date;
  applied?: boolean;
}

export interface TagSuggestion extends AISuggestion {
  type: 'tag';
  value: string;
}

export interface LinkSuggestion extends AISuggestion {
  type: 'link';
  value: {
    noteId: string;
    noteTitle: string;
    relevance: number;
  };
}

export interface SummarySuggestion extends AISuggestion {
  type: 'summary';
  value: string;
}

export interface DuplicateSuggestion extends AISuggestion {
  type: 'duplicate';
  value: {
    noteId: string;
    noteTitle: string;
    similarity: number;
  };
}

export interface TaskSuggestion extends AISuggestion {
  type: 'task';
  value: string;
}

export interface Note {
  id: string;
  title: string;
  blocks: Block[];
  plainText: string; // cached for search
  tags: string[];
  notebookId?: string;
  folderId?: string;
  linkedNotes: string[]; // manual [[links]]
  backlinks: string[]; // auto-computed
  aiSuggestions: AISuggestion[];
  lastAIAnalysis?: Date;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  isFavorite: boolean;
  isPinned: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  hasAudio?: boolean;
  audioUrl?: string;
  wordCount: number;
}

export interface Notebook {
  id: string;
  name: string;
  color: NotebookColor;
  icon?: string;
  description?: string;
  noteCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type NotebookColor = 
  | 'blue' 
  | 'green' 
  | 'amber' 
  | 'rose' 
  | 'purple' 
  | 'gray';

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  notebookId: string;
  noteCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ViewMode = 'list' | 'grid';
export type SortBy = 'recent' | 'title' | 'favorites' | 'created';
export type FilterView = 'all' | 'favorites' | 'recent' | 'trash' | 'notebook' | 'folder' | 'tag';

export interface SmartCollection {
  id: string;
  name: string;
  icon: string;
  count: number;
  query: () => boolean;
}

// Editor state types
export interface EditorState {
  activeBlockId: string | null;
  selectedBlocks: string[];
  isSlashMenuOpen: boolean;
  slashMenuPosition: { x: number; y: number } | null;
  isFloatingToolbarOpen: boolean;
  floatingToolbarPosition: { x: number; y: number } | null;
  selectedText: string;
}

// Search result types
export interface SearchResult {
  noteId: string;
  note: Note;
  matches: SearchMatch[];
  score: number;
}

export interface SearchMatch {
  field: 'title' | 'content' | 'tags';
  value: string;
  indices: [number, number][];
}

// Graph view types
export interface GraphNode {
  id: string;
  title: string;
  notebookId?: string;
  backlinkCount: number;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: 'link' | 'backlink';
}

// Export/Import types
export interface ExportOptions {
  format: 'markdown' | 'json' | 'html';
  includeMetadata: boolean;
  includeBacklinks: boolean;
}

// UI State types
export interface UIState {
  sidebarCollapsed: boolean;
  aiPanelOpen: boolean;
  backlinksOpen: boolean;
  graphViewOpen: boolean;
  quickCaptureOpen: boolean;
  voiceRecorderOpen: boolean;
  isMobile: boolean;
  isEditorFullscreen: boolean;
}

// Keyboard shortcuts
export interface KeyboardShortcut {
  key: string;
  modifiers: ('ctrl' | 'cmd' | 'shift' | 'alt')[];
  action: string;
  description: string;
}

// Save state
export type SaveStatus = 'saved' | 'saving' | 'error' | 'offline';

export interface SyncState {
  status: SaveStatus;
  lastSaved?: Date;
  pendingChanges: number;
}
