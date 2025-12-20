import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotesStore } from '../store/useNotesStore';
import { getNoteById } from '../lib/notesSelectors';
import { EditorTopBar } from '../components/editor/EditorTopBar';
import { EditorContent, EditorContentRef } from '../components/editor/EditorContent';
import { EditorSidebar } from '../components/editor/EditorSidebar';
import { RightSidebar } from '../components/editor/RightSidebar';
import { NoteVersion } from '../components/editor/VersionHistoryPanel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createId } from '../lib/notesHelpers';

export function NoteEditor() {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const { notes, updateNote, deleteNote, setActiveNote, createNote } = useNotesStore();
  
  const note = getNoteById(notes, noteId || null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [versions, setVersions] = useState<NoteVersion[]>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const versionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const editorRef = useRef<EditorContentRef>(null);

  // Sync local state with note data
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note?.id]);

  // Clear active note on unmount
  useEffect(() => {
    return () => {
      setActiveNote(null);
    };
  }, [setActiveNote]);

  // Auto-save with debounce
  const handleSave = (updates: { title?: string; content?: string }) => {
    if (!noteId) return;
    
    setIsSaving(true);
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      updateNote(noteId, updates);
      setIsSaving(false);
    }, 500);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    handleSave({ title: value });
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    handleSave({ content: value });
  };

  const handleDelete = () => {
    if (noteId) {
      deleteNote(noteId);
      navigate('/notes');
    }
  };

  const handleCreateLinkedNote = useCallback((newTitle: string): string => {
    const newNote = createNote(newTitle);
    return newNote.id;
  }, [createNote]);

  const handleNavigateToLine = useCallback((lineIndex: number) => {
    editorRef.current?.navigateToLine(lineIndex);
  }, []);

  // Handle case where note doesn't exist
  if (!note) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
          <h3 className="text-lg font-medium text-foreground mb-2">Note not found</h3>
          <Button onClick={() => navigate('/notes')} variant="outline">
            Back to Notes
          </Button>
        </div>
      </div>
    );
  }

  const wordCount = content.split(/\s+/).filter(w => w).length;

  // Create version snapshot
  const createVersionSnapshot = useCallback((trigger: NoteVersion['trigger']) => {
    if (!noteId || !content) return;
    
    const newVersion: NoteVersion = {
      id: createId(),
      timestamp: new Date(),
      title,
      content,
      wordCount,
      trigger,
    };
    
    setVersions(prev => [newVersion, ...prev].slice(0, 50)); // Keep last 50 versions
  }, [noteId, title, content, wordCount]);

  // Auto-create version every 5 minutes
  useEffect(() => {
    if (versionTimeoutRef.current) {
      clearTimeout(versionTimeoutRef.current);
    }
    
    versionTimeoutRef.current = setTimeout(() => {
      if (content.trim()) {
        createVersionSnapshot('auto');
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => {
      if (versionTimeoutRef.current) {
        clearTimeout(versionTimeoutRef.current);
      }
    };
  }, [content, createVersionSnapshot]);

  const handleRestoreVersion = useCallback((version: NoteVersion) => {
    setTitle(version.title);
    setContent(version.content);
    if (noteId) {
      updateNote(noteId, { title: version.title, content: version.content });
    }
  }, [noteId, updateNote]);

  const handleAIContentUpdate = useCallback((newContent: string) => {
    createVersionSnapshot('ai');
    setContent(newContent);
    if (noteId) {
      updateNote(noteId, { content: newContent });
    }
  }, [noteId, updateNote, createVersionSnapshot]);

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <EditorTopBar
        title={title}
        onTitleChange={handleTitleChange}
        onDelete={handleDelete}
        isSaving={isSaving}
        isFavorite={isFavorite}
        onToggleFavorite={() => setIsFavorite(!isFavorite)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <EditorSidebar
          isOpen={leftSidebarOpen}
          onToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
          content={content}
          currentNoteId={noteId || ''}
          currentNoteTitle={title}
          allNotes={notes}
          onNavigateToLine={handleNavigateToLine}
        />

        {/* Main Editor */}
        <main 
          className={cn(
            "flex-1 overflow-auto custom-scrollbar transition-all duration-250",
            leftSidebarOpen && "ml-60",
            rightSidebarOpen && "mr-72"
          )}
        >
          <EditorContent
            ref={editorRef}
            title={title}
            content={content}
            onTitleChange={handleTitleChange}
            onContentChange={handleContentChange}
            allNotes={notes}
            currentNoteId={noteId || ''}
            onCreateLinkedNote={handleCreateLinkedNote}
          />
        </main>

        {/* Right Sidebar */}
        <RightSidebar
          isOpen={rightSidebarOpen}
          onToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
          content={content}
          title={title}
          onUpdateContent={handleAIContentUpdate}
          versions={versions}
          onRestoreVersion={handleRestoreVersion}
          createdAt={note.createdAt}
          updatedAt={note.updatedAt}
          wordCount={wordCount}
        />
      </div>
    </div>
  );
}