import { useEffect, useRef, useCallback } from 'react';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Note, Notebook, Folder } from '@/types/notes';
import { useNotesStore } from './useNotesStore';

// IndexedDB Schema
interface NotesDB extends DBSchema {
  notes: {
    key: string;
    value: Note;
    indexes: {
      'by-updated': Date;
      'by-notebook': string;
      'by-folder': string;
    };
  };
  notebooks: {
    key: string;
    value: Notebook;
  };
  folders: {
    key: string;
    value: Folder;
  };
  sync: {
    key: string;
    value: {
      lastSync: Date;
      version: number;
    };
  };
}

const DB_NAME = 'capella-notes';
const DB_VERSION = 1;

// Initialize database
const initDB = async (): Promise<IDBPDatabase<NotesDB>> => {
  return openDB<NotesDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Notes store
      if (!db.objectStoreNames.contains('notes')) {
        const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
        notesStore.createIndex('by-updated', 'updatedAt');
        notesStore.createIndex('by-notebook', 'notebookId');
        notesStore.createIndex('by-folder', 'folderId');
      }
      
      // Notebooks store
      if (!db.objectStoreNames.contains('notebooks')) {
        db.createObjectStore('notebooks', { keyPath: 'id' });
      }
      
      // Folders store
      if (!db.objectStoreNames.contains('folders')) {
        db.createObjectStore('folders', { keyPath: 'id' });
      }
      
      // Sync metadata store
      if (!db.objectStoreNames.contains('sync')) {
        db.createObjectStore('sync', { keyPath: 'key' });
      }
    },
  });
};

// BroadcastChannel for multi-tab sync
const SYNC_CHANNEL = 'capella-notes-sync';

interface SyncMessage {
  type: 'note-updated' | 'note-deleted' | 'note-created' | 'full-sync';
  payload?: unknown;
  timestamp: number;
}

export function useLocalSync() {
  const dbRef = useRef<IDBPDatabase<NotesDB> | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { notes, notebooks, folders, setSyncState } = useNotesStore();
  
  // Initialize database
  useEffect(() => {
    const setup = async () => {
      try {
        dbRef.current = await initDB();
        
        // Set up broadcast channel for multi-tab sync
        if (typeof BroadcastChannel !== 'undefined') {
          channelRef.current = new BroadcastChannel(SYNC_CHANNEL);
          
          channelRef.current.onmessage = (event: MessageEvent<SyncMessage>) => {
            handleSyncMessage(event.data);
          };
        }
        
        // Load initial data from IndexedDB
        await loadFromDB();
        
        setSyncState({ status: 'saved', lastSaved: new Date() });
      } catch (error) {
        console.error('Failed to initialize local sync:', error);
        setSyncState({ status: 'error' });
      }
    };
    
    setup();
    
    return () => {
      channelRef.current?.close();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);
  
  // Handle incoming sync messages from other tabs
  const handleSyncMessage = useCallback((message: SyncMessage) => {
    // In a real implementation, we would update the store based on the message
    console.log('Sync message received:', message);
  }, []);
  
  // Load data from IndexedDB
  const loadFromDB = useCallback(async () => {
    if (!dbRef.current) return;
    
    try {
      const [storedNotes, storedNotebooks, storedFolders] = await Promise.all([
        dbRef.current.getAll('notes'),
        dbRef.current.getAll('notebooks'),
        dbRef.current.getAll('folders'),
      ]);
      
      // If we have stored data, use it (in real implementation, merge with initial data)
      if (storedNotes.length > 0) {
        console.log(`Loaded ${storedNotes.length} notes from IndexedDB`);
      }
    } catch (error) {
      console.error('Failed to load from IndexedDB:', error);
    }
  }, []);
  
  // Save notes to IndexedDB with debounce
  const saveNotes = useCallback(async (notesToSave: Note[]) => {
    if (!dbRef.current) return;
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Debounce save by 500ms
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setSyncState({ status: 'saving' });
        
        const tx = dbRef.current!.transaction('notes', 'readwrite');
        
        await Promise.all([
          ...notesToSave.map(note => tx.store.put(note)),
          tx.done,
        ]);
        
        // Broadcast update to other tabs
        channelRef.current?.postMessage({
          type: 'note-updated',
          payload: notesToSave.map(n => n.id),
          timestamp: Date.now(),
        } as SyncMessage);
        
        setSyncState({ status: 'saved', lastSaved: new Date(), pendingChanges: 0 });
      } catch (error) {
        console.error('Failed to save to IndexedDB:', error);
        setSyncState({ status: 'error' });
        
        // Handle quota exceeded
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.warn('Storage quota exceeded. Consider cleaning up old notes.');
        }
      }
    }, 500);
  }, [setSyncState]);
  
  // Save notebooks to IndexedDB
  const saveNotebooks = useCallback(async (notebooksToSave: Notebook[]) => {
    if (!dbRef.current) return;
    
    try {
      const tx = dbRef.current.transaction('notebooks', 'readwrite');
      await Promise.all([
        ...notebooksToSave.map(nb => tx.store.put(nb)),
        tx.done,
      ]);
    } catch (error) {
      console.error('Failed to save notebooks:', error);
    }
  }, []);
  
  // Save folders to IndexedDB
  const saveFolders = useCallback(async (foldersToSave: Folder[]) => {
    if (!dbRef.current) return;
    
    try {
      const tx = dbRef.current.transaction('folders', 'readwrite');
      await Promise.all([
        ...foldersToSave.map(f => tx.store.put(f)),
        tx.done,
      ]);
    } catch (error) {
      console.error('Failed to save folders:', error);
    }
  }, []);
  
  // Delete note from IndexedDB
  const deleteNoteFromDB = useCallback(async (noteId: string) => {
    if (!dbRef.current) return;
    
    try {
      await dbRef.current.delete('notes', noteId);
      
      channelRef.current?.postMessage({
        type: 'note-deleted',
        payload: noteId,
        timestamp: Date.now(),
      } as SyncMessage);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  }, []);
  
  // Watch for changes and save
  useEffect(() => {
    // Only save if we have notes and DB is ready
    if (notes.length > 0 && dbRef.current) {
      saveNotes(notes);
    }
  }, [notes, saveNotes]);
  
  useEffect(() => {
    if (notebooks.length > 0 && dbRef.current) {
      saveNotebooks(notebooks);
    }
  }, [notebooks, saveNotebooks]);
  
  useEffect(() => {
    if (folders.length > 0 && dbRef.current) {
      saveFolders(folders);
    }
  }, [folders, saveFolders]);
  
  return {
    saveNotes,
    saveNotebooks,
    saveFolders,
    deleteNoteFromDB,
    loadFromDB,
  };
}

// Export storage stats helper
export const getStorageStats = async () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
      percentUsed: ((estimate.usage || 0) / (estimate.quota || 1)) * 100,
    };
  }
  return null;
};
