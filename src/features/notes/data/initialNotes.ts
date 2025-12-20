import { Note } from '../types/note';
import { Folder, ALL_NOTES_FOLDER } from '../types/folder';

// Initial folders - just "All Notes" (default)
export const initialFolders: Folder[] = [ALL_NOTES_FOLDER];

// Initial notes - empty slate
export const initialNotes: Note[] = [];
