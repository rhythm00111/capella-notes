import { forwardRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useNotesStore } from '../store/useNotesStore';
import {
  getNotesByFolder,
  sortNotesByRecent,
  filterNotesBySearch,
} from '../lib/notesSelectors';
import { ALL_NOTES_FOLDER_ID } from '../types/folder';
import { NoteCard } from './NoteCard';

export const NotesList = forwardRef<HTMLDivElement>(function NotesList(_, ref) {
  const { notes, folders, activeFolderId, activeNoteId, searchQuery, selectNote, createNote } =
    useNotesStore();

  // Filter notes by folder
  let filteredNotes = getNotesByFolder(notes, activeFolderId);

  // Apply search filter
  filteredNotes = filterNotesBySearch(filteredNotes, searchQuery);

  // Sort by recent (pinned first)
  filteredNotes = sortNotesByRecent(filteredNotes);

  // Get folder name for display
  const getFolderName = (folderId: string): string | undefined => {
    if (activeFolderId !== ALL_NOTES_FOLDER_ID) return undefined;
    if (folderId === ALL_NOTES_FOLDER_ID) return undefined;
    const folder = folders.find((f) => f.id === folderId);
    return folder?.name;
  };

  if (filteredNotes.length === 0) {
    return (
      <div ref={ref} className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">No notes yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create your first note to get started
        </p>
        <Button onClick={() => createNote()} className="btn-premium">
          Create Note
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea ref={ref} className="flex-1">
      <div className="p-3 space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredNotes.map((note) => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <NoteCard
                note={note}
                isSelected={note.id === activeNoteId}
                folderName={getFolderName(note.folderId)}
                onClick={() => selectNote(note.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
});

NotesList.displayName = 'NotesList';
