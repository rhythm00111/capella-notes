import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Note } from '../types/note';
import { Folder, ALL_NOTES_FOLDER_ID, ALL_NOTES_FOLDER } from '../types/folder';
import { initialNotes, initialFolders } from '../data/initialNotes';
import { generateId } from '../lib/notesHelpers';
import { STORAGE_KEY, DEFAULT_FOLDER_COLOR } from '../lib/notesConstants';

// State shape
interface NotesState {
  // Raw data
  notes: Note[];
  folders: Folder[];

  // Selection state
  activeFolderId: string;
  activeNoteId: string | null;

  // UI state
  searchQuery: string;
  isCreatingFolder: boolean;
  isCreatingNote: boolean;
}

// Actions
interface NotesActions {
  // Folder actions
  createFolder: (name: string) => void;
  deleteFolder: (id: string) => void;
  selectFolder: (id: string) => void;

  // Note actions
  createNote: (folderId?: string, title?: string) => Note;
  createSubPage: (parentId: string, title?: string) => Note;
  updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'isPinned'>>) => void;
  deleteNote: (id: string) => void;
  selectNote: (id: string | null) => void;
  getNoteBreadcrumbs: (noteId: string) => Array<{ id: string; title: string }>;

  // UI actions
  setSearchQuery: (query: string) => void;
  openCreateFolderDialog: () => void;
  closeCreateFolderDialog: () => void;
  openCreateNoteDialog: () => void;
  closeCreateNoteDialog: () => void;

  // Legacy aliases for compatibility
  setActiveFolder: (id: string) => void;
  setActiveNote: (id: string | null) => void;
}

export const useNotesStore = create<NotesState & NotesActions>()(
  persist(
    (set, get) => ({
      // Initial Data
      notes: initialNotes,
      folders: initialFolders,

      // Initial UI State
      activeFolderId: ALL_NOTES_FOLDER_ID,
      activeNoteId: null,
      searchQuery: '',
      isCreatingFolder: false,
      isCreatingNote: false,

      // Folder Actions
      createFolder: (name: string) => {
        const { folders } = get();
        const folder: Folder = {
          id: generateId(),
          name,
          color: DEFAULT_FOLDER_COLOR,
          icon: '📁',
          createdAt: new Date().toISOString(),
          order: folders.length,
        };

        set((state) => ({
          folders: [...state.folders, folder],
          isCreatingFolder: false,
        }));
      },

      deleteFolder: (id: string) => {
        // Cannot delete "All Notes" folder
        if (id === ALL_NOTES_FOLDER_ID) return;

        set((state) => ({
          // Remove folder
          folders: state.folders.filter((f) => f.id !== id),
          // Move notes from deleted folder to "All Notes"
          notes: state.notes.map((note) =>
            note.folderId === id
              ? { ...note, folderId: ALL_NOTES_FOLDER_ID, updatedAt: new Date().toISOString() }
              : note
          ),
          // Reset active folder if it was deleted
          activeFolderId: state.activeFolderId === id ? ALL_NOTES_FOLDER_ID : state.activeFolderId,
        }));
      },

      selectFolder: (id: string) => {
        set({ activeFolderId: id, activeNoteId: null });
      },

      // Note Actions
      createNote: (folderId?: string, title?: string) => {
        const { activeFolderId } = get();
        const targetFolderId = folderId || activeFolderId;

        const note: Note = {
          id: generateId(),
          title: title || 'Untitled',
          content: '',
          folderId: targetFolderId === ALL_NOTES_FOLDER_ID ? ALL_NOTES_FOLDER_ID : targetFolderId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDeleted: false,
          isPinned: false,
          parentId: null,
          childIds: [],
          isSubPage: false,
        };

        set((state) => ({
          notes: [note, ...state.notes],
          activeNoteId: note.id,
          isCreatingNote: false,
        }));

        return note;
      },

      createSubPage: (parentId: string, title?: string) => {
        const { notes } = get();
        const parentNote = notes.find((n) => n.id === parentId);
        
        const subPage: Note = {
          id: generateId(),
          title: title || 'Untitled Sub-page',
          content: '',
          folderId: parentNote?.folderId || ALL_NOTES_FOLDER_ID,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDeleted: false,
          isPinned: false,
          parentId,
          childIds: [],
          isSubPage: true,
        };

        set((state) => ({
          notes: [
            subPage,
            ...state.notes.map((note) =>
              note.id === parentId
                ? { ...note, childIds: [...(note.childIds || []), subPage.id] }
                : note
            ),
          ],
          activeNoteId: subPage.id,
        }));

        return subPage;
      },

      getNoteBreadcrumbs: (noteId: string) => {
        const { notes } = get();
        const breadcrumbs: Array<{ id: string; title: string }> = [];
        
        let currentNote = notes.find((n) => n.id === noteId);
        
        while (currentNote) {
          breadcrumbs.unshift({ id: currentNote.id, title: currentNote.title });
          
          if (currentNote.parentId) {
            currentNote = notes.find((n) => n.id === currentNote!.parentId);
          } else {
            break;
          }
        }
        
        return breadcrumbs;
      },

      updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'isPinned'>>) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
          ),
        }));
      },

      deleteNote: (id: string) => {
        // Soft delete
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, isDeleted: true, updatedAt: new Date().toISOString() }
              : note
          ),
          activeNoteId: state.activeNoteId === id ? null : state.activeNoteId,
        }));
      },

      selectNote: (id: string | null) => {
        set({ activeNoteId: id });
      },

      // UI Actions
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      openCreateFolderDialog: () => {
        set({ isCreatingFolder: true });
      },

      closeCreateFolderDialog: () => {
        set({ isCreatingFolder: false });
      },

      openCreateNoteDialog: () => {
        set({ isCreatingNote: true });
      },

      closeCreateNoteDialog: () => {
        set({ isCreatingNote: false });
      },

      // Legacy aliases
      setActiveFolder: (id: string) => {
        set({ activeFolderId: id, activeNoteId: null });
      },

      setActiveNote: (id: string | null) => {
        set({ activeNoteId: id });
      },
    }),
    {
      name: STORAGE_KEY,
      // Only persist data, not UI state
      partialize: (state) => ({
        notes: state.notes,
        folders: state.folders,
        activeFolderId: state.activeFolderId,
        activeNoteId: state.activeNoteId,
      }),
    }
  )
);
