import React, { useEffect } from 'react';
import { useNotesStore } from '@/hooks/useNotesStore';
import { useLocalSync } from '@/hooks/useLocalSync';
import { NotesSidebar } from '@/components/notes/NotesSidebar';
import { NotesListView } from '@/components/notes/NotesListView';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { AIInsightsPanel } from '@/components/notes/AIInsightsPanel';
import { QuickCaptureModal } from '@/components/notes/QuickCaptureModal';
import { Toaster } from '@/components/ui/toaster';

const Index = () => {
  const { aiPanelOpen, selectedNote, openQuickCapture } = useNotesStore();
  
  // Initialize local sync
  useLocalSync();
  
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
        <NotesSidebar />
        
        {/* Middle - Notes List */}
        <NotesListView />
        
        {/* Right - Editor */}
        <div className="flex flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <NoteEditor />
          </div>
          
          {/* AI Panel */}
          {aiPanelOpen && selectedNote && <AIInsightsPanel />}
        </div>
      </div>
      
      {/* Modals */}
      <QuickCaptureModal />
      <Toaster />
    </>
  );
};

export default Index;
