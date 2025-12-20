import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotesStore } from '../store/useNotesStore';
import { getNoteById } from '../lib/notesSelectors';
import { EditorTopBar } from '../components/editor/EditorTopBar';
import { EditorContent } from '../components/editor/EditorContent';
import { Button } from '@/components/ui/button';

export function NoteEditor() {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const { notes, updateNote, deleteNote, setActiveNote } = useNotesStore();
  
  const note = getNoteById(notes, noteId || null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
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
      <EditorTopBar
        title={title}
        onTitleChange={handleTitleChange}
        onDelete={handleDelete}
        isSaving={isSaving}
        isFavorite={isFavorite}
        onToggleFavorite={() => setIsFavorite(!isFavorite)}
      />

      <main className="flex-1 overflow-auto custom-scrollbar">
        <EditorContent
          title={title}
          content={content}
          onTitleChange={handleTitleChange}
          onContentChange={handleContentChange}
        />
      </main>
    </div>
  );
}
