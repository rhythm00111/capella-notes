import { useNavigate } from 'react-router-dom';
import { useNotesStore } from '../store/useNotesStore';
import { FolderList } from '../components/FolderList';
import { NotesList } from '../components/NotesList';
import { NotesTopBar } from '../components/NotesTopBar';
import { useEffect } from 'react';

export function NotesHome() {
  const { activeNoteId } = useNotesStore();
  const navigate = useNavigate();

  // Navigate to editor when a note is selected
  useEffect(() => {
    if (activeNoteId) {
      navigate(`/notes/${activeNoteId}`);
    }
  }, [activeNoteId, navigate]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Left Sidebar - Folders */}
      <div className="w-[240px] flex-shrink-0 h-full border-r border-border bg-sidebar">
        <FolderList />
      </div>

      {/* Main Content - Notes List */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <NotesTopBar />
        <NotesList />
      </div>
    </div>
  );
}
