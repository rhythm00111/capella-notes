import { create } from 'zustand';
import { Note } from '../types/note';
import { Folder, ALL_NOTES_FOLDER_ID, ALL_NOTES_FOLDER } from '../types/folder';
import { initialNotes, initialFolders } from '../data/initialNotes';
import { createId } from '../lib/notesHelpers';

interface NotesStore {
  // Data
  notes: Note[];
  folders: Folder[];
  
  // UI State
  activeFolderId: string;
  activeNoteId: string | null;
  searchQuery: string;
  
  // Actions - Folders
  createFolder: (name: string) => Folder;
  deleteFolder: (id: string) => void;
  
  // Actions - Notes
  createNote: (title?: string) => Note;
  updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => void;
  deleteNote: (id: string) => void;
  
  // Actions - Navigation
  setActiveFolder: (id: string) => void;
  setActiveNote: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useNotesStore = create<NotesStore>()((set, get) => ({
  // Initial Data
  notes: initialNotes,
  folders: initialFolders,
  
  // Initial UI State
  activeFolderId: ALL_NOTES_FOLDER_ID,
  activeNoteId: null,
  searchQuery: '',
  
  // Folder Actions
  createFolder: (name: string) => {
    const folder: Folder = {
      id: createId(),
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set(state => ({
      folders: [...state.folders, folder],
    }));
    
    return folder;
  },
  
  deleteFolder: (id: string) => {
    // Cannot delete "All Notes" folder
    if (id === ALL_NOTES_FOLDER_ID) return;
    
    set(state => ({
      // Remove folder
      folders: state.folders.filter(f => f.id !== id),
      // Move notes from deleted folder to "All Notes"
      notes: state.notes.map(note => 
        note.folderId === id 
          ? { ...note, folderId: ALL_NOTES_FOLDER_ID, updatedAt: new Date() }
          : note
      ),
      // Reset active folder if it was deleted
      activeFolderId: state.activeFolderId === id ? ALL_NOTES_FOLDER_ID : state.activeFolderId,
    }));
  },
  
  // Note Actions
  createNote: (title?: string) => {
    const { activeFolderId } = get();
    
    const note: Note = {
      id: createId(),
      title: title || 'Untitled',
      content: '',
      folderId: activeFolderId === ALL_NOTES_FOLDER_ID ? ALL_NOTES_FOLDER_ID : activeFolderId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set(state => ({
      notes: [note, ...state.notes],
      activeNoteId: note.id,
    }));
    
    return note;
  },
  
  updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => {
    set(state => ({
      notes: state.notes.map(note =>
        note.id === id
          ? { ...note, ...updates, updatedAt: new Date() }
          : note
      ),
    }));
  },
  
  deleteNote: (id: string) => {
    set(state => ({
      notes: state.notes.filter(note => note.id !== id),
      activeNoteId: state.activeNoteId === id ? null : state.activeNoteId,
    }));
  },
  
  // Navigation Actions
  setActiveFolder: (id: string) => {
    set({ activeFolderId: id, activeNoteId: null });
  },
  
  setActiveNote: (id: string | null) => {
    set({ activeNoteId: id });
  },
  
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },
}));
