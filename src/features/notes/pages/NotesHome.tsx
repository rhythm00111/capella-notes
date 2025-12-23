import { useNavigate } from 'react-router-dom';
import { useNotesStore } from '../store/useNotesStore';
import { FolderList } from '../components/FolderList';
import { NotesList } from '../components/NotesList';
import { NotesTopBar } from '../components/NotesTopBar';
import { TrashView } from '../components/TrashView';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

export function NotesHome() {
  const { 
    activeNoteId, 
    currentView, 
    restoreNote, 
    permanentDeleteNote, 
    emptyTrash,
    getDeletedNotes,
    isFolderPanelCollapsed,
  } = useNotesStore();
  const navigate = useNavigate();

  // Navigate to editor when a note is selected
  // Only navigate if we're on the home page and a note is selected AND the note exists
  const notes = useNotesStore((state) => state.notes);
  const selectNote = useNotesStore((state) => state.selectNote);
  
  useEffect(() => {
    if (activeNoteId) {
      // Check if the note actually exists and is not deleted
      const noteExists = notes.some((n) => n.id === activeNoteId && !n.isDeleted);
      if (noteExists) {
        navigate(`/notes/${activeNoteId}`, { replace: false });
      } else {
        // Clear the invalid activeNoteId
        selectNote(null);
      }
    }
  }, [activeNoteId, navigate, notes, selectNote]);

  const deletedNotes = getDeletedNotes();

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      {/* Top Bar - Full Width */}
      {currentView === 'notes' && <NotesTopBar />}
      
      {/* Content Area - Sidebar + Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Folders */}
        <div 
          className={cn(
            'flex-shrink-0 h-full border-r border-border bg-sidebar transition-all duration-200',
            isFolderPanelCollapsed ? 'w-[52px]' : 'w-[200px]'
          )}
        >
          <FolderList />
        </div>

        {/* Main Content - Notes List or Trash */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-auto">
          {currentView === 'trash' ? (
            <TrashView
              deletedNotes={deletedNotes}
              onRestore={restoreNote}
              onPermanentDelete={permanentDeleteNote}
              onEmptyTrash={emptyTrash}
            />
          ) : (
            <NotesList />
          )}
        </div>
      </div>
    </div>
  );
}
