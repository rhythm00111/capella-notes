import { create } from 'zustand';
import { Note, Notebook, Folder, Block, AISuggestion, ViewMode, SortBy, FilterView, SyncState } from '@/types/notes';
import { processedNotes, sampleNotebooks, sampleFolders, allTags } from '@/data/sampleNotes';

interface NotesStore {
  // Data
  notes: Note[];
  notebooks: Notebook[];
  folders: Folder[];
  tags: string[];
  
  // UI State
  selectedNoteId: string | null;
  viewMode: ViewMode;
  sortBy: SortBy;
  searchQuery: string;
  selectedTags: string[];
  filterView: FilterView;
  selectedNotebookId: string | null;
  selectedFolderId: string | null;
  
  // Panel States
  aiPanelOpen: boolean;
  backlinksOpen: boolean;
  sidebarCollapsed: boolean;
  
  // Modal States
  quickCaptureOpen: boolean;
  voiceRecorderOpen: boolean;
  graphViewOpen: boolean;
  
  // Sync State
  syncState: SyncState;
  
  // Computed
  filteredNotes: Note[];
  selectedNote: Note | null;
  
  // Actions - Notes
  createNote: (partial?: Partial<Note>) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  restoreNote: (id: string) => void;
  permanentlyDeleteNote: (id: string) => void;
  selectNote: (id: string | null) => void;
  
  // Actions - Note Properties
  toggleFavorite: (id: string) => void;
  togglePinned: (id: string) => void;
  addTag: (noteId: string, tag: string) => void;
  removeTag: (noteId: string, tag: string) => void;
  updateBlocks: (noteId: string, blocks: Block[]) => void;
  updateTitle: (noteId: string, title: string) => void;
  
  // Actions - Backlinks
  addBacklink: (fromId: string, toId: string) => void;
  removeBacklink: (fromId: string, toId: string) => void;
  
  // Actions - AI
  applyAISuggestion: (noteId: string, suggestion: AISuggestion) => void;
  dismissAISuggestion: (noteId: string, suggestionId: string) => void;
  setAISuggestions: (noteId: string, suggestions: AISuggestion[]) => void;
  
  // Actions - UI
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (sort: SortBy) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  toggleTag: (tag: string) => void;
  setFilterView: (view: FilterView) => void;
  setSelectedNotebook: (id: string | null) => void;
  setSelectedFolder: (id: string | null) => void;
  
  // Actions - Panels
  toggleAIPanel: () => void;
  toggleBacklinks: () => void;
  toggleSidebar: () => void;
  
  // Actions - Modals
  openQuickCapture: () => void;
  closeQuickCapture: () => void;
  openVoiceRecorder: () => void;
  closeVoiceRecorder: () => void;
  openGraphView: () => void;
  closeGraphView: () => void;
  
  // Actions - Sync
  setSyncState: (state: Partial<SyncState>) => void;
  
  // Initialize
  initialize: () => void;
}

// Helper to create unique IDs
const createId = () => Math.random().toString(36).substring(2, 11);

// Helper to compute derived fields
const computeNoteFields = (blocks: Block[]) => ({
  plainText: blocks.map(b => b.content).join(' '),
  wordCount: blocks.reduce((count, block) => 
    count + block.content.split(/\s+/).filter(Boolean).length, 0
  ),
});

export const useNotesStore = create<NotesStore>()((set, get) => ({
    // Initial Data
    notes: processedNotes,
    notebooks: sampleNotebooks,
    folders: sampleFolders,
    tags: allTags,
    
    // Initial UI State
    selectedNoteId: null,
    viewMode: 'list',
    sortBy: 'recent',
    searchQuery: '',
    selectedTags: [],
    filterView: 'all',
    selectedNotebookId: null,
    selectedFolderId: null,
    
    // Panel States
    aiPanelOpen: true,
    backlinksOpen: false,
    sidebarCollapsed: false,
    
    // Modal States
    quickCaptureOpen: false,
    voiceRecorderOpen: false,
    graphViewOpen: false,
    
    // Sync State
    syncState: {
      status: 'saved',
      lastSaved: new Date(),
      pendingChanges: 0,
    },
    
    // Computed - will be updated by subscription
    filteredNotes: [],
    selectedNote: null,
    
    // Note Actions
    createNote: (partial = {}) => {
      const blocks = partial.blocks || [
        { id: createId(), type: 'paragraph' as const, content: '' },
      ];
      
      const note: Note = {
        id: createId(),
        title: partial.title || 'Untitled',
        blocks,
        ...computeNoteFields(blocks),
        tags: partial.tags || [],
        notebookId: partial.notebookId || get().selectedNotebookId || undefined,
        folderId: partial.folderId,
        linkedNotes: [],
        backlinks: [],
        aiSuggestions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        viewCount: 0,
        isFavorite: false,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
        wordCount: 0,
      };
      
      set(state => ({
        notes: [note, ...state.notes],
        selectedNoteId: note.id,
      }));
      
      return note;
    },
    
    updateNote: (id, updates) => {
      set(state => ({
        notes: state.notes.map(note => {
          if (note.id !== id) return note;
          
          const updatedBlocks = updates.blocks || note.blocks;
          return {
            ...note,
            ...updates,
            ...computeNoteFields(updatedBlocks),
            updatedAt: new Date(),
          };
        }),
        syncState: { ...state.syncState, status: 'saving', pendingChanges: state.syncState.pendingChanges + 1 },
      }));
      
      // Simulate save completion
      setTimeout(() => {
        set(state => ({
          syncState: { 
            ...state.syncState, 
            status: 'saved', 
            lastSaved: new Date(),
            pendingChanges: Math.max(0, state.syncState.pendingChanges - 1),
          },
        }));
      }, 500);
    },
    
    deleteNote: (id) => {
      set(state => ({
        notes: state.notes.map(note => 
          note.id === id ? { ...note, isDeleted: true, updatedAt: new Date() } : note
        ),
        selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
      }));
    },
    
    restoreNote: (id) => {
      set(state => ({
        notes: state.notes.map(note => 
          note.id === id ? { ...note, isDeleted: false, updatedAt: new Date() } : note
        ),
      }));
    },
    
    permanentlyDeleteNote: (id) => {
      set(state => ({
        notes: state.notes.filter(note => note.id !== id),
        selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
      }));
    },
    
    selectNote: (id) => {
      if (id) {
        set(state => ({
          notes: state.notes.map(note => 
            note.id === id ? { ...note, viewCount: note.viewCount + 1 } : note
          ),
          selectedNoteId: id,
        }));
      } else {
        set({ selectedNoteId: null });
      }
    },
    
    // Note Properties
    toggleFavorite: (id) => {
      set(state => ({
        notes: state.notes.map(note => 
          note.id === id ? { ...note, isFavorite: !note.isFavorite, updatedAt: new Date() } : note
        ),
      }));
    },
    
    togglePinned: (id) => {
      set(state => ({
        notes: state.notes.map(note => 
          note.id === id ? { ...note, isPinned: !note.isPinned, updatedAt: new Date() } : note
        ),
      }));
    },
    
    addTag: (noteId, tag) => {
      const normalizedTag = tag.toLowerCase().trim();
      set(state => ({
        notes: state.notes.map(note => 
          note.id === noteId && !note.tags.includes(normalizedTag)
            ? { ...note, tags: [...note.tags, normalizedTag], updatedAt: new Date() }
            : note
        ),
        tags: state.tags.includes(normalizedTag) ? state.tags : [...state.tags, normalizedTag].sort(),
      }));
    },
    
    removeTag: (noteId, tag) => {
      set(state => ({
        notes: state.notes.map(note => 
          note.id === noteId
            ? { ...note, tags: note.tags.filter(t => t !== tag), updatedAt: new Date() }
            : note
        ),
      }));
    },
    
    updateBlocks: (noteId, blocks) => {
      get().updateNote(noteId, { blocks });
    },
    
    updateTitle: (noteId, title) => {
      get().updateNote(noteId, { title });
    },
    
    // Backlinks
    addBacklink: (fromId, toId) => {
      set(state => ({
        notes: state.notes.map(note => {
          if (note.id === fromId && !note.linkedNotes.includes(toId)) {
            return { ...note, linkedNotes: [...note.linkedNotes, toId] };
          }
          if (note.id === toId && !note.backlinks.includes(fromId)) {
            return { ...note, backlinks: [...note.backlinks, fromId] };
          }
          return note;
        }),
      }));
    },
    
    removeBacklink: (fromId, toId) => {
      set(state => ({
        notes: state.notes.map(note => {
          if (note.id === fromId) {
            return { ...note, linkedNotes: note.linkedNotes.filter(id => id !== toId) };
          }
          if (note.id === toId) {
            return { ...note, backlinks: note.backlinks.filter(id => id !== fromId) };
          }
          return note;
        }),
      }));
    },
    
    // AI
    applyAISuggestion: (noteId, suggestion) => {
      const state = get();
      
      switch (suggestion.type) {
        case 'tag':
          state.addTag(noteId, suggestion.value as string);
          break;
        case 'link':
          const linkValue = suggestion.value as { noteId: string };
          state.addBacklink(noteId, linkValue.noteId);
          break;
      }
      
      // Mark suggestion as applied
      set(state => ({
        notes: state.notes.map(note => 
          note.id === noteId
            ? {
                ...note,
                aiSuggestions: note.aiSuggestions.map(s =>
                  s.id === suggestion.id ? { ...s, applied: true } : s
                ),
              }
            : note
        ),
      }));
    },
    
    dismissAISuggestion: (noteId, suggestionId) => {
      set(state => ({
        notes: state.notes.map(note => 
          note.id === noteId
            ? {
                ...note,
                aiSuggestions: note.aiSuggestions.filter(s => s.id !== suggestionId),
              }
            : note
        ),
      }));
    },
    
    setAISuggestions: (noteId, suggestions) => {
      set(state => ({
        notes: state.notes.map(note => 
          note.id === noteId
            ? { ...note, aiSuggestions: suggestions, lastAIAnalysis: new Date() }
            : note
        ),
      }));
    },
    
    // UI Actions
    setViewMode: (mode) => set({ viewMode: mode }),
    setSortBy: (sort) => set({ sortBy: sort }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setSelectedTags: (tags) => set({ selectedTags: tags }),
    toggleTag: (tag) => set(state => ({
      selectedTags: state.selectedTags.includes(tag)
        ? state.selectedTags.filter(t => t !== tag)
        : [...state.selectedTags, tag],
    })),
    setFilterView: (view) => set({ filterView: view, selectedNotebookId: null, selectedFolderId: null }),
    setSelectedNotebook: (id) => set({ 
      selectedNotebookId: id, 
      selectedFolderId: null,
      filterView: id ? 'notebook' : 'all',
    }),
    setSelectedFolder: (id) => set({ 
      selectedFolderId: id,
      filterView: id ? 'folder' : 'all',
    }),
    
    // Panel Actions
    toggleAIPanel: () => set(state => ({ aiPanelOpen: !state.aiPanelOpen })),
    toggleBacklinks: () => set(state => ({ backlinksOpen: !state.backlinksOpen })),
    toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    
    // Modal Actions
    openQuickCapture: () => set({ quickCaptureOpen: true }),
    closeQuickCapture: () => set({ quickCaptureOpen: false }),
    openVoiceRecorder: () => set({ voiceRecorderOpen: true }),
    closeVoiceRecorder: () => set({ voiceRecorderOpen: false }),
    openGraphView: () => set({ graphViewOpen: true }),
    closeGraphView: () => set({ graphViewOpen: false }),
    
    // Sync
    setSyncState: (state) => set(prev => ({ syncState: { ...prev.syncState, ...state } })),
    
    // Initialize
    initialize: () => {
      // Set up computed values subscriber
      const unsubscribe = useNotesStore.subscribe(
        (state) => [state.notes, state.searchQuery, state.selectedTags, state.filterView, 
                    state.selectedNotebookId, state.selectedFolderId, state.sortBy, state.selectedNoteId],
        () => {
          const state = get();
          
          // Filter notes
          let filtered = state.notes.filter(note => {
            // Base filter - exclude deleted unless in trash view
            if (state.filterView === 'trash') {
              return note.isDeleted;
            }
            if (note.isDeleted) return false;
            
            // View filter
            switch (state.filterView) {
              case 'favorites':
                if (!note.isFavorite) return false;
                break;
              case 'recent':
                const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                if (note.updatedAt < oneWeekAgo) return false;
                break;
              case 'notebook':
                if (note.notebookId !== state.selectedNotebookId) return false;
                break;
              case 'folder':
                if (note.folderId !== state.selectedFolderId) return false;
                break;
            }
            
            // Tag filter
            if (state.selectedTags.length > 0) {
              if (!state.selectedTags.some(tag => note.tags.includes(tag))) return false;
            }
            
            // Search filter
            if (state.searchQuery) {
              const query = state.searchQuery.toLowerCase();
              const matchesTitle = note.title.toLowerCase().includes(query);
              const matchesContent = note.plainText.toLowerCase().includes(query);
              const matchesTags = note.tags.some(tag => tag.toLowerCase().includes(query));
              if (!matchesTitle && !matchesContent && !matchesTags) return false;
            }
            
            return true;
          });
          
          // Sort notes
          filtered.sort((a, b) => {
            // Pinned notes always first
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            
            switch (state.sortBy) {
              case 'title':
                return a.title.localeCompare(b.title);
              case 'favorites':
                if (a.isFavorite && !b.isFavorite) return -1;
                if (!a.isFavorite && b.isFavorite) return 1;
                return b.updatedAt.getTime() - a.updatedAt.getTime();
              case 'created':
                return b.createdAt.getTime() - a.createdAt.getTime();
              case 'recent':
              default:
                return b.updatedAt.getTime() - a.updatedAt.getTime();
            }
          });
          
          // Find selected note
          const selectedNote = state.notes.find(n => n.id === state.selectedNoteId) || null;
          
          set({ filteredNotes: filtered, selectedNote });
        },
        { fireImmediately: true }
      );
    },
  }))
);

// Initialize store on import
useNotesStore.getState().initialize();
