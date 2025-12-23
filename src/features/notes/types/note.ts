// Note type definition

export type TagColor = 'gray' | 'red' | 'orange' | 'amber' | 'green' | 'teal' | 'blue' | 'indigo' | 'purple' | 'pink';

export interface NoteTag {
  id: string;
  name: string;
  color: TagColor;
}

export interface Note {
  id: string;
  folderId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  isPinned: boolean;
  
  // Tags
  tags?: NoteTag[];
  
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

// Available tag colors with their styling
export const TAG_COLORS: Record<TagColor, { bg: string; text: string; border: string }> = {
  gray: { bg: 'bg-gray-500/15', text: 'text-gray-400', border: 'border-gray-500/30' },
  red: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
  orange: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },
  amber: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  green: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  teal: { bg: 'bg-teal-500/15', text: 'text-teal-400', border: 'border-teal-500/30' },
  blue: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  indigo: { bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  purple: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
  pink: { bg: 'bg-pink-500/15', text: 'text-pink-400', border: 'border-pink-500/30' },
};
