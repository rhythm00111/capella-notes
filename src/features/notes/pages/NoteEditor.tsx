import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotesStore } from '../store/useNotesStore';
import { getNoteById } from '../lib/notesSelectors';

export function NoteEditor() {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const { notes, updateNote, deleteNote, setActiveNote } = useNotesStore();
  
  const note = getNoteById(notes, noteId || null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      updateNote(noteId, updates);
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

  const handleBack = () => {
    // Force save before navigating
    if (noteId && saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      updateNote(noteId, { title, content });
    }
    setActiveNote(null);
    navigate('/notes');
  };

  const handleDelete = () => {
    if (noteId) {
      deleteNote(noteId);
      navigate('/notes');
    }
  };

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

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      {/* Top Bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Notes
        </Button>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Auto-saved
          </span>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Title */}
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled"
            className="w-full text-3xl font-bold bg-transparent outline-none placeholder:text-muted-foreground/40 mb-6"
          />
          
          {/* Content */}
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Start writing..."
            className="w-full min-h-[60vh] bg-transparent outline-none resize-none text-foreground placeholder:text-muted-foreground/40 leading-relaxed"
          />
        </div>
      </ScrollArea>
    </div>
  );
}
