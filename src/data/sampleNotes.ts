import { Note, Notebook, Folder } from '@/types/notes';

// Empty sample data - start with a blank slate
export const sampleNotebooks: Notebook[] = [];

export const sampleFolders: Folder[] = [];

export const sampleNotes: Note[] = [];

// Processed notes (empty)
export const processedNotes: Note[] = [];

// All unique tags (empty)
export const allTags: string[] = [];

// Smart collections (all zeros)
export const smartCollections = [
  {
    id: 'needs-organization',
    name: 'Needs Organization',
    icon: '📋',
    count: 0,
  },
  {
    id: 'duplicates-found',
    name: 'Duplicates Found',
    icon: '📄',
    count: 0,
  },
  {
    id: 'suggested-links',
    name: 'Suggested Links',
    icon: '🔗',
    count: 0,
  },
];
