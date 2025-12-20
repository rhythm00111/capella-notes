import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { FileText, Plus, Search } from 'lucide-react';
import { Note } from '../../types/note';
import { cn } from '@/lib/utils';

interface NoteLinkMenuProps {
  isOpen: boolean;
  position: { top: number; left: number };
  searchQuery: string;
  notes: Note[];
  currentNoteId: string;
  onSelect: (note: Note) => void;
  onCreate: (title: string) => void;
  onClose: () => void;
}

export function NoteLinkMenu({
  isOpen,
  position,
  searchQuery,
  notes,
  currentNoteId,
  onSelect,
  onCreate,
  onClose,
}: NoteLinkMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Filter notes based on search
  const filteredNotes = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return notes
      .filter((note) => 
        note.id !== currentNoteId && 
        note.title.toLowerCase().includes(query)
      )
      .slice(0, 8); // Limit results
  }, [notes, searchQuery, currentNoteId]);

  const showCreateOption = searchQuery.length > 0 && 
    !filteredNotes.some(n => n.title.toLowerCase() === searchQuery.toLowerCase());

  const totalItems = filteredNotes.length + (showCreateOption ? 1 : 0);

  // Reset selection on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex < filteredNotes.length) {
          onSelect(filteredNotes[selectedIndex]);
        } else if (showCreateOption) {
          onCreate(searchQuery);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredNotes, totalItems, showCreateOption, searchQuery, onSelect, onCreate, onClose]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={menuRef}
      className="slash-menu custom-scrollbar"
      style={{
        top: position.top,
        left: position.left,
        width: '280px',
      }}
    >
      {/* Search hint */}
      <div className="px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground border-b border-border">
        <Search className="h-3 w-3" />
        <span>Link to note...</span>
      </div>

      {/* Results */}
      {filteredNotes.length > 0 && (
        <div className="py-1">
          {filteredNotes.map((note, index) => (
            <button
              key={note.id}
              onClick={() => onSelect(note)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={cn(
                'slash-menu-item w-full text-left',
                selectedIndex === index && 'selected'
              )}
            >
              <div className="slash-menu-item-icon">
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {note.title}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {note.content.substring(0, 50) || 'Empty note'}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Create new option */}
      {showCreateOption && (
        <div className="py-1 border-t border-border">
          <button
            onClick={() => onCreate(searchQuery)}
            onMouseEnter={() => setSelectedIndex(filteredNotes.length)}
            className={cn(
              'slash-menu-item w-full text-left',
              selectedIndex === filteredNotes.length && 'selected'
            )}
          >
            <div className="slash-menu-item-icon bg-primary/20 text-primary">
              <Plus className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">
                Create "{searchQuery}"
              </div>
              <div className="text-xs text-muted-foreground">
                New note
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Empty state */}
      {filteredNotes.length === 0 && !showCreateOption && (
        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
          No notes found
        </div>
      )}
    </div>,
    document.body
  );
}