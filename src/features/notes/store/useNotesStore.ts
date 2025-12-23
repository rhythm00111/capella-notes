import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Note, NoteTag } from '../types/note';
import { Folder, ALL_NOTES_FOLDER_ID, ALL_NOTES_FOLDER } from '../types/folder';
import { initialNotes, initialFolders } from '../data/initialNotes';
import { generateId } from '../lib/notesHelpers';
import { STORAGE_KEY, DEFAULT_FOLDER_COLOR } from '../lib/notesConstants';
import { getAllDescendants, removeSubPageMarker, canNestSubPage } from '../lib/subPageHelpers';

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
  showSubPages: boolean;
  viewMode: 'grid' | 'list';
  allCardsExpanded: boolean;
}

// Actions
interface NotesActions {
  // Folder actions
  createFolder: (name: string) => void;
  deleteFolder: (id: string) => void;
  selectFolder: (id: string) => void;

  // Note actions
  createNote: (folderId?: string, title?: string) => Note;
  createSubPage: (parentId: string, title?: string) => Note | null;
  updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'isPinned' | 'tags'>>) => void;
  deleteNote: (id: string) => void;
  deleteSubPage: (subPageId: string) => void;
  selectNote: (id: string | null) => void;
  duplicateNote: (noteId: string) => Note | null;
  moveNote: (noteId: string, folderId: string) => void;
  getNoteBreadcrumbs: (noteId: string) => Array<{ id: string; title: string }>;
  getChildNotes: (noteId: string) => Note[];
  getParentNote: (noteId: string) => Note | null;
  getAllTags: () => NoteTag[];

  // Trash actions
  restoreNote: (noteId: string) => void;
  permanentDeleteNote: (noteId: string) => void;
  emptyTrash: () => void;
  getDeletedNotes: () => Note[];

  // UI actions
  setSearchQuery: (query: string) => void;
  openCreateFolderDialog: () => void;
  closeCreateFolderDialog: () => void;
  openCreateNoteDialog: () => void;
  closeCreateNoteDialog: () => void;
  toggleShowSubPages: () => void;
  setCurrentView: (view: 'notes' | 'trash') => void;
  currentView: 'notes' | 'trash';

  // Panel state
  isFolderPanelCollapsed: boolean;
  toggleFolderPanel: () => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  toggleAllCardsExpanded: () => void;

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
      showSubPages: false,
      viewMode: 'list' as const,
      currentView: 'notes' as const,
      isFolderPanelCollapsed: true,
      allCardsExpanded: false,

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
        set({ activeFolderId: id, activeNoteId: null, currentView: 'notes' });
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
        
        if (!parentNote) return null;
        
        // Check max depth (3 levels)
        if (!canNestSubPage(notes, parentId, 3)) {
          console.warn('Maximum nesting depth reached');
          return null;
        }
        
        const subPage: Note = {
          id: generateId(),
          title: title || 'Untitled Sub-page',
          content: '',
          folderId: parentNote.folderId,
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
                ? { ...note, childIds: [...(note.childIds || []), subPage.id], updatedAt: new Date().toISOString() }
                : note
            ),
          ],
          activeNoteId: subPage.id,
        }));

        return subPage;
      },

      duplicateNote: (noteId: string) => {
        const { notes } = get();
        const note = notes.find((n) => n.id === noteId);
        if (!note) return null;

        const duplicate: Note = {
          ...note,
          id: generateId(),
          title: `${note.title} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPinned: false,
          parentId: null,
          childIds: [],
          isSubPage: false,
        };

        set((state) => ({
          notes: [duplicate, ...state.notes],
        }));

        return duplicate;
      },

      moveNote: (noteId: string, folderId: string) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? { ...note, folderId, updatedAt: new Date().toISOString() }
              : note
          ),
        }));
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

      getChildNotes: (noteId: string) => {
        const { notes } = get();
        const parentNote = notes.find((n) => n.id === noteId);
        
        if (!parentNote?.childIds?.length) return [];
        
        return notes
          .filter((n) => parentNote.childIds!.includes(n.id) && !n.isDeleted)
          .sort((a, b) => {
            const aIndex = parentNote.childIds!.indexOf(a.id);
            const bIndex = parentNote.childIds!.indexOf(b.id);
            return aIndex - bIndex;
          });
      },

      getParentNote: (noteId: string) => {
        const { notes } = get();
        const note = notes.find((n) => n.id === noteId);
        
        if (!note?.parentId) return null;
        
        return notes.find((n) => n.id === note.parentId && !n.isDeleted) || null;
      },

      updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'isPinned' | 'tags'>>) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
          ),
        }));
      },

      getAllTags: () => {
        const { notes } = get();
        const tagMap = new Map<string, NoteTag>();
        
        notes.forEach((note) => {
          note.tags?.forEach((tag) => {
            if (!tagMap.has(tag.id)) {
              tagMap.set(tag.id, tag);
            }
          });
        });
        
        return Array.from(tagMap.values());
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

      deleteSubPage: (subPageId: string) => {
        const { notes, activeNoteId } = get();
        const subPage = notes.find((n) => n.id === subPageId);
        
        if (!subPage?.isSubPage || !subPage.parentId) {
          // If not a sub-page, use regular delete
          get().deleteNote(subPageId);
          return;
        }

        const parentNote = notes.find((n) => n.id === subPage.parentId);
        if (!parentNote) return;

        // Get all descendants to delete
        const descendantIds = getAllDescendants(notes, subPageId);
        const idsToDelete = [subPageId, ...descendantIds];

        // Check if we need to navigate away
        const needsNavigation = idsToDelete.includes(activeNoteId || '');

        // Remove sub-page marker from parent content
        const updatedParentContent = removeSubPageMarker(parentNote.content, subPage.title);

        set((state) => ({
          notes: state.notes.map((note) => {
            // Mark sub-page and descendants as deleted
            if (idsToDelete.includes(note.id)) {
              return { ...note, isDeleted: true, updatedAt: new Date().toISOString() };
            }
            // Update parent note
            if (note.id === parentNote.id) {
              return {
                ...note,
                content: updatedParentContent,
                childIds: (note.childIds || []).filter((id) => id !== subPageId),
                updatedAt: new Date().toISOString(),
              };
            }
            return note;
          }),
          // Navigate to parent if we deleted the current note
          activeNoteId: needsNavigation ? parentNote.id : state.activeNoteId,
        }));
      },

      selectNote: (id: string | null) => {
        set({ activeNoteId: id });
      },

      // Trash Actions
      restoreNote: (noteId: string) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? { ...note, isDeleted: false, updatedAt: new Date().toISOString() }
              : note
          ),
        }));
      },

      permanentDeleteNote: (noteId: string) => {
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== noteId),
        }));
      },

      emptyTrash: () => {
        set((state) => ({
          notes: state.notes.filter((n) => !n.isDeleted),
        }));
      },

      getDeletedNotes: () => {
        const { notes } = get();
        return notes.filter((n) => n.isDeleted);
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

      toggleShowSubPages: () => {
        set((state) => ({ showSubPages: !state.showSubPages }));
      },

      setCurrentView: (view: 'notes' | 'trash') => {
        set({ currentView: view });
      },

      toggleFolderPanel: () => {
        set((state) => ({ isFolderPanelCollapsed: !state.isFolderPanelCollapsed }));
      },

      setViewMode: (mode: 'grid' | 'list') => {
        set({ viewMode: mode });
      },

      toggleAllCardsExpanded: () => {
        set((state) => ({ allCardsExpanded: !state.allCardsExpanded }));
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
        showSubPages: state.showSubPages,
        viewMode: state.viewMode,
        isFolderPanelCollapsed: state.isFolderPanelCollapsed,
      }),
    }
  )
);
