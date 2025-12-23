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
  // Only navigate if we're on the home page and a note is selected
  useEffect(() => {
    if (activeNoteId) {
      navigate(`/notes/${activeNoteId}`, { replace: false });
    }
  }, [activeNoteId, navigate]);

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
