import { Note } from '../types/note';
import { ALL_NOTES_FOLDER_ID } from '../types/folder';

// Get notes filtered by folder
export const getNotesByFolder = (notes: Note[], folderId: string): Note[] => {
  if (folderId === ALL_NOTES_FOLDER_ID) {
    return notes;
  }
  return notes.filter(note => note.folderId === folderId);
};

// Get note by ID
export const getNoteById = (notes: Note[], noteId: string | null): Note | null => {
  if (!noteId) return null;
  return notes.find(note => note.id === noteId) || null;
};

// Sort notes by updated date (most recent first)
export const sortNotesByRecent = (notes: Note[]): Note[] => {
  return [...notes].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
};

// Get folder note count
export const getFolderNoteCount = (notes: Note[], folderId: string): number => {
  if (folderId === ALL_NOTES_FOLDER_ID) {
    return notes.length;
  }
  return notes.filter(note => note.folderId === folderId).length;
};
