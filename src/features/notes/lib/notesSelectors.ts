// Selectors - derived data from store state

import { useNotesStore } from '../store/useNotesStore';
import { Note } from '../types/note';
import { Folder, ALL_NOTES_FOLDER_ID } from '../types/folder';

// Get the currently selected note
export const useSelectedNote = (): Note | null => {
  const notes = useNotesStore((state) => state.notes);
  const activeNoteId = useNotesStore((state) => state.activeNoteId);
  return notes.find((n) => n.id === activeNoteId && !n.isDeleted) || null;
};

// Get notes in the active folder (excludes deleted)
export const useNotesInActiveFolder = (): Note[] => {
  const notes = useNotesStore((state) => state.notes);
  const activeFolderId = useNotesStore((state) => state.activeFolderId);
  return getNotesByFolder(notes, activeFolderId);
};

// Get folder by ID
export const useFolder = (folderId: string): Folder | undefined => {
  const folders = useNotesStore((state) => state.folders);
  return folders.find((f) => f.id === folderId);
};

// Get active folder
export const useActiveFolder = (): Folder | undefined => {
  const folders = useNotesStore((state) => state.folders);
  const activeFolderId = useNotesStore((state) => state.activeFolderId);
  return folders.find((f) => f.id === activeFolderId);
};

// Pure function: Get notes filtered by folder (excludes deleted)
export const getNotesByFolder = (notes: Note[], folderId: string): Note[] => {
  const activeNotes = notes.filter((note) => !note.isDeleted);
  if (folderId === ALL_NOTES_FOLDER_ID) {
    return activeNotes;
  }
  return activeNotes.filter((note) => note.folderId === folderId);
};

// Pure function: Get note by ID (excludes deleted)
export const getNoteById = (notes: Note[], noteId: string | null): Note | null => {
  if (!noteId) return null;
  return notes.find((note) => note.id === noteId && !note.isDeleted) || null;
};

// Pure function: Sort notes by updated date (most recent first), pinned first
export const sortNotesByRecent = (notes: Note[]): Note[] => {
  return [...notes].sort((a, b) => {
    // Pinned notes first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    // Then by date
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
};

// Pure function: Get folder note count (excludes deleted)
export const getFolderNoteCount = (notes: Note[], folderId: string): number => {
  const activeNotes = notes.filter((note) => !note.isDeleted);
  if (folderId === ALL_NOTES_FOLDER_ID) {
    return activeNotes.length;
  }
  return activeNotes.filter((note) => note.folderId === folderId).length;
};

// Pure function: Filter notes by search query
export const filterNotesBySearch = (notes: Note[], query: string): Note[] => {
  if (!query.trim()) return notes;
  const lowerQuery = query.toLowerCase();
  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery)
  );
};
