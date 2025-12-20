import React, { useEffect } from 'react';
import { useNotesStore, getSelectedNote } from '@/hooks/useNotesStore';
import { NotesSidebar } from '@/components/notes/NotesSidebar';
import { NotesListView } from '@/components/notes/NotesListView';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { AIInsightsPanel } from '@/components/notes/AIInsightsPanel';
import { QuickCaptureModal } from '@/components/notes/QuickCaptureModal';
import { Toaster } from '@/components/ui/toaster';

const Index = () => {
  const store = useNotesStore();
  const { aiPanelOpen, openQuickCapture } = store;
  const selectedNote = getSelectedNote(store);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openQuickCapture();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openQuickCapture]);

  return (
    <>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Left Sidebar */}
        <div className="w-[280px] flex-shrink-0 h-full">
          <NotesSidebar />
        </div>
        
        {/* Middle - Notes List */}
        <div className="w-[320px] flex-shrink-0 h-full">
          <NotesListView />
        </div>
        
        {/* Right - Editor */}
        <div className="flex flex-1 min-w-0 h-full">
          <div className="flex-1 min-w-0 h-full">
            <NoteEditor />
          </div>
          
          {/* AI Panel */}
          {aiPanelOpen && selectedNote && (
            <div className="w-[300px] flex-shrink-0 h-full">
              <AIInsightsPanel />
            </div>
          )}
        </div>
      </div>
      
      {/* Modals */}
      <QuickCaptureModal />
      <Toaster />
    </>
  );
};

export default Index;
