import { useState } from 'react';
import { Trash2, RotateCcw, Trash, AlertTriangle, ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Note } from '../types/note';
import { useNotesStore } from '../store/useNotesStore';

interface TrashViewProps {
  deletedNotes: Note[];
  onRestore: (noteId: string) => void;
  onPermanentDelete: (noteId: string) => void;
  onEmptyTrash: () => void;
}

export function TrashView({
  deletedNotes,
  onRestore,
  onPermanentDelete,
  onEmptyTrash,
}: TrashViewProps) {
  const setCurrentView = useNotesStore((state) => state.setCurrentView);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const getDaysAgo = (dateStr: string) => {
    const days = Math.floor(
      (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
    );
    return days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`;
  };

  if (deletedNotes.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Back Button */}
        <div className="px-4 pt-3">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('notes')}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Notes
          </Button>
        </div>
        
        <div className="flex flex-col items-center justify-center flex-1 py-12 px-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Trash2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">Trash is empty</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Deleted notes will appear here. You can restore them or delete permanently.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Back Button */}
      <div className="px-4 pt-3">
        <Button
          variant="ghost"
          onClick={() => setCurrentView('notes')}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Notes
        </Button>
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Trash</h2>
          <span className="text-sm text-muted-foreground">({deletedNotes.length})</span>
        </div>

        {deletedNotes.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEmptyConfirm(true)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            Empty Trash
          </Button>
        )}
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <AnimatePresence mode="popLayout">
          {deletedNotes.map((note) => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="group p-4 bg-card border border-border rounded-lg hover:border-muted-foreground/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">
                    {note.title || 'Untitled'}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Deleted {getDaysAgo(note.updatedAt)}
                  </p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRestore(note.id)}
                    className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                    title="Restore note"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setNoteToDelete(note.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    title="Delete permanently"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty Trash Confirmation */}
      <AlertDialog open={showEmptyConfirm} onOpenChange={setShowEmptyConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <AlertDialogTitle>Empty Trash?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {deletedNotes.length} note
                  {deletedNotes.length !== 1 ? 's' : ''}. This action cannot be undone.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onEmptyTrash();
                setShowEmptyConfirm(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Empty Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single Note Delete Confirmation */}
      <AlertDialog open={!!noteToDelete} onOpenChange={() => setNoteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This note will be permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (noteToDelete) {
                  onPermanentDelete(noteToDelete);
                  setNoteToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
