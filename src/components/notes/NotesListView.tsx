import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Grid3X3, 
  List, 
  Star, 
  MoreHorizontal, 
  Pin,
  Trash2,
  Archive,
  Download,
  Sparkles,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotesStore } from '@/hooks/useNotesStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Note, SortBy } from '@/types/notes';

// Tag color mapping
const tagColors: Record<string, string> = {
  productivity: 'tag-blue',
  habits: 'tag-green',
  wellness: 'tag-green',
  books: 'tag-purple',
  meetings: 'tag-amber',
  planning: 'tag-amber',
  client: 'tag-rose',
  project: 'tag-rose',
  travel: 'tag-blue',
  recipes: 'tag-green',
  development: 'tag-purple',
  react: 'tag-blue',
  design: 'tag-purple',
};

function NoteCard({ note, isSelected, onClick, onMenuAction }: {
  note: Note;
  isSelected: boolean;
  onClick: () => void;
  onMenuAction: (action: string) => void;
}) {
  // Get first 2 lines of content
  const preview = useMemo(() => {
    const textBlocks = note.blocks.filter(b => 
      ['paragraph', 'list', 'quote'].includes(b.type) && b.content
    );
    return textBlocks.slice(0, 2).map(b => b.content).join(' ').slice(0, 120);
  }, [note.blocks]);

  // Format date
  const formattedDate = useMemo(() => {
    const now = new Date();
    const diff = now.getTime() - note.updatedAt.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const mins = Math.floor(diff / (1000 * 60));
        return mins <= 1 ? 'Just now' : `${mins}m ago`;
      }
      return `${hours}h ago`;
    }
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return note.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, [note.updatedAt]);

  const hasAISuggestions = note.aiSuggestions.filter(s => !s.applied).length > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={onClick}
      className={cn(
        'note-card group cursor-pointer p-4',
        isSelected && 'selected'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {note.isPinned && (
            <Pin className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
          )}
          <h3 className="font-medium text-foreground truncate">
            {note.title || 'Untitled'}
          </h3>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          {hasAISuggestions && (
            <Badge className="bg-primary/10 text-primary px-1.5 py-0.5">
              <Sparkles className="h-3 w-3" />
            </Badge>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMenuAction('favorite');
            }}
            className={cn(
              'p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity',
              note.isFavorite && 'opacity-100'
            )}
          >
            <Star 
              className={cn(
                'h-4 w-4',
                note.isFavorite 
                  ? 'fill-amber-400 text-amber-400' 
                  : 'text-muted-foreground hover:text-amber-400'
              )} 
            />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onMenuAction('pin')}>
                <Pin className="mr-2 h-4 w-4" />
                {note.isPinned ? 'Unpin' : 'Pin'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMenuAction('archive')}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMenuAction('export')}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onMenuAction('delete')}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {preview}
        </p>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          {note.tags.slice(0, 3).map((tag) => (
            <span 
              key={tag} 
              className={cn('tag', tagColors[tag] || 'tag-default')}
            >
              {tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="tag tag-default">+{note.tags.length - 3}</span>
          )}
        </div>
        
        <span className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
          <Clock className="h-3 w-3" />
          {formattedDate}
        </span>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  const { createNote, filterView } = useNotesStore();
  
  const getMessage = () => {
    switch (filterView) {
      case 'favorites':
        return { title: 'No favorites yet', desc: 'Star notes to see them here' };
      case 'recent':
        return { title: 'No recent notes', desc: 'Notes edited in the last week appear here' };
      case 'trash':
        return { title: 'Trash is empty', desc: 'Deleted notes will appear here' };
      default:
        return { title: 'No notes yet', desc: 'Create your first note to get started' };
    }
  };
  
  const { title, desc } = getMessage();
  
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <List className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{desc}</p>
      {filterView !== 'trash' && (
        <Button onClick={() => createNote()} className="btn-premium">
          Create Note
        </Button>
      )}
    </div>
  );
}

export function NotesListView() {
  const {
    filteredNotes,
    selectedNoteId,
    viewMode,
    sortBy,
    selectedTags,
    filterView,
    selectNote,
    setViewMode,
    setSortBy,
    toggleTag,
    toggleFavorite,
    togglePinned,
    deleteNote,
  } = useNotesStore();

  const handleMenuAction = (noteId: string, action: string) => {
    switch (action) {
      case 'favorite':
        toggleFavorite(noteId);
        break;
      case 'pin':
        togglePinned(noteId);
        break;
      case 'delete':
        deleteNote(noteId);
        break;
      // Add more actions as needed
    }
  };

  const getViewTitle = () => {
    switch (filterView) {
      case 'favorites': return 'Favorites';
      case 'recent': return 'Recent';
      case 'trash': return 'Trash';
      case 'notebook': return 'Notebook';
      case 'folder': return 'Folder';
      default: return 'All Notes';
    }
  };

  return (
    <div className="flex h-full w-notes-list flex-col border-r border-border bg-background">
      {/* Toolbar */}
      <div className="flex-shrink-0 border-b border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">
            {getViewTitle()}
          </h2>
          <span className="text-sm text-muted-foreground">
            {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
          </span>
        </div>
        
        <div className="flex items-center justify-between gap-2">
          {/* View Toggle */}
          <div className="flex items-center rounded-lg bg-muted p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'list' 
                  ? 'bg-background shadow-sm text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'grid' 
                  ? 'bg-background shadow-sm text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>
          
          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
            <SelectTrigger className="w-[130px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="favorites">Favorites</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filter Tags */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {selectedTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className="tag tag-blue flex items-center gap-1"
              >
                {tag}
                <span className="text-xs opacity-60">×</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes List */}
      <ScrollArea className="flex-1">
        {filteredNotes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className={cn(
            'p-3 gap-3',
            viewMode === 'grid' 
              ? 'grid grid-cols-1 lg:grid-cols-2' 
              : 'flex flex-col'
          )}>
            <AnimatePresence mode="popLayout">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isSelected={note.id === selectedNoteId}
                  onClick={() => selectNote(note.id)}
                  onMenuAction={(action) => handleMenuAction(note.id, action)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
