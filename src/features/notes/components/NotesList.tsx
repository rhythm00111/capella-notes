import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNotesStore } from '../store/useNotesStore';
import {
  getNotesByFolder,
  sortNotesByRecent,
  filterNotesBySearch,
} from '../lib/notesSelectors';
import { ALL_NOTES_FOLDER_ID } from '../types/folder';
import { NoteCard } from './NoteCard';
import { NoteContextMenu } from './NoteContextMenu';
import { MoveFolderDialog } from './MoveFolderDialog';

export function NotesList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    notes, 
    folders, 
    activeFolderId, 
    activeNoteId, 
    searchQuery, 
    selectNote, 
    createNote, 
    showSubPages,
    deleteNote,
    duplicateNote,
    moveNote,
    updateNote,
    viewMode,
  } = useNotesStore();

  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [noteToMove, setNoteToMove] = useState<string | null>(null);
  const [noteToRename, setNoteToRename] = useState<string | null>(null);

  // Filter notes by folder (and sub-pages based on toggle)
  let filteredNotes = getNotesByFolder(notes, activeFolderId, showSubPages);

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

  // Context menu handlers
  const handleOpen = (noteId: string) => {
    selectNote(noteId);
    navigate(`/notes/${noteId}`);
  };

  const handleDuplicate = (noteId: string) => {
    const duplicate = duplicateNote(noteId);
    if (duplicate) {
      toast({ title: 'Note duplicated' });
    }
  };

  const handleRename = (noteId: string) => {
    // Navigate to editor focused on title
    navigate(`/notes/${noteId}`);
  };

  const handleDownload = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    const blob = new Blob([note.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title || 'untitled'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Note downloaded' });
  };

  const handleShare = () => {
    toast({ title: 'Share feature coming soon!' });
  };

  const handleMove = (noteId: string) => {
    setNoteToMove(noteId);
    setMoveDialogOpen(true);
  };

  const handleMoveConfirm = (folderId: string) => {
    if (noteToMove) {
      moveNote(noteToMove, folderId);
      toast({ title: 'Note moved' });
    }
  };

  const handleDelete = (noteId: string) => {
    deleteNote(noteId);
    toast({ title: 'Note moved to trash' });
  };

  const handleTogglePin = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      updateNote(noteId, { isPinned: !note.isPinned });
      toast({ title: note.isPinned ? 'Note unpinned' : 'Note pinned' });
    }
  };

  if (filteredNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
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

  const noteToMoveData = noteToMove ? notes.find((n) => n.id === noteToMove) : null;

  return (
    <>
      <ScrollArea className="flex-1">
        <div className={viewMode === 'grid' ? 'p-3 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3' : 'p-3 flex flex-col gap-3'}>
          <AnimatePresence mode="popLayout">
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <NoteContextMenu
                  onOpen={() => handleOpen(note.id)}
                  onDuplicate={() => handleDuplicate(note.id)}
                  onRename={() => handleRename(note.id)}
                  onDownload={() => handleDownload(note.id)}
                  onShare={handleShare}
                  onMove={() => handleMove(note.id)}
                  onDelete={() => handleDelete(note.id)}
                  onTogglePin={() => handleTogglePin(note.id)}
                  isPinned={note.isPinned}
                >
                  <div>
                    <NoteCard
                      note={note}
                      isSelected={note.id === activeNoteId}
                      folderName={getFolderName(note.folderId)}
                      onClick={() => handleOpen(note.id)}
                    />
                  </div>
                </NoteContextMenu>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      <MoveFolderDialog
        isOpen={moveDialogOpen}
        onClose={() => {
          setMoveDialogOpen(false);
          setNoteToMove(null);
        }}
        folders={folders}
        currentFolderId={noteToMoveData?.folderId || ALL_NOTES_FOLDER_ID}
        onMove={handleMoveConfirm}
      />
    </>
  );
}
