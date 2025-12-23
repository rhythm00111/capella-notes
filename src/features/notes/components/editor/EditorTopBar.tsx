import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MoreHorizontal, Trash2, Keyboard, Tag, Plus, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { KeyboardShortcutsHelp } from '../KeyboardShortcutsHelp';
import { useNotesStore } from '../../store/useNotesStore';
import { NoteTag, TagColor, TAG_COLORS } from '../../types/note';
import { generateId } from '../../lib/notesHelpers';

const COLOR_OPTIONS: TagColor[] = [
  'gray', 'red', 'orange', 'amber', 'green', 
  'teal', 'blue', 'indigo', 'purple', 'pink'
];

interface EditorTopBarProps {
  title: string;
  onTitleChange: (title: string) => void;
  onDelete: () => void;
  isSaving: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  lastSaved?: Date;
  onAISummarize?: () => void;
  tags?: NoteTag[];
  onTagsChange?: (tags: NoteTag[]) => void;
  availableTags?: NoteTag[];
}

export function EditorTopBar({
  title,
  onTitleChange,
  onDelete,
  isSaving,
  isFavorite = false,
  onToggleFavorite,
  lastSaved,
  onAISummarize,
  tags = [],
  onTagsChange,
  availableTags = [],
}: EditorTopBarProps) {
  const navigate = useNavigate();
  const selectNote = useNotesStore((state) => state.selectNote);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);
  
  // Tag creation state
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState<TagColor>('blue');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (tagPopoverOpen && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [tagPopoverOpen]);

  const handleAddTag = () => {
    if (!newTagName.trim() || !onTagsChange) return;

    const newTag: NoteTag = {
      id: generateId(),
      name: newTagName.trim(),
      color: selectedColor,
    };

    onTagsChange([...tags, newTag]);
    setNewTagName('');
    setShowColorPicker(false);
    setTagPopoverOpen(false);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleBack = () => {
    // Clear active note FIRST to prevent re-navigation
    selectNote(null);
    // Use replace to prevent double history entries
    navigate('/notes', { replace: true });
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (localTitle !== title) {
      onTitleChange(localTitle);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleBlur();
    }
    if (e.key === 'Escape') {
      setLocalTitle(title);
      setIsEditingTitle(false);
    }
  };

  return (
    <header
      className={cn(
        'editor-top-bar',
        isScrolled && 'scrolled'
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
      </div>

      {/* Center Section - Title */}
      <div className="flex-1 flex justify-center px-4">
        {isEditingTitle ? (
          <input
            type="text"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            autoFocus
            className="text-lg font-semibold bg-transparent outline-none text-center w-full max-w-md border-b-2 border-primary pb-1"
            placeholder="Untitled"
          />
        ) : (
          <button
            onClick={() => setIsEditingTitle(true)}
            className="text-lg font-semibold text-foreground hover:text-primary transition-colors truncate max-w-md"
          >
            {title || 'Untitled'}
          </button>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Add Tag Button */}
        {onTagsChange && (
          <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-foreground hidden sm:flex"
              >
                <Tag className="h-4 w-4" />
                <span className="text-sm">Add tag</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-72 p-4 bg-popover border border-border shadow-xl" 
              align="end"
              sideOffset={8}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Tag name</label>
                  <div className="flex gap-2">
                    <Input
                      ref={tagInputRef}
                      placeholder="Enter tag name..."
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                {/* Color Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Choose color</label>
                  <div className="grid grid-cols-5 gap-2">
                    {COLOR_OPTIONS.map((color) => {
                      const colors = TAG_COLORS[color];
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={cn(
                            'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all',
                            colors.bg,
                            colors.border,
                            selectedColor === color && 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110'
                          )}
                        >
                          {selectedColor === color && (
                            <Check className={cn('h-4 w-4', colors.text)} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preview & Add */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Preview:</span>
                    {newTagName && (
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
                          TAG_COLORS[selectedColor].bg,
                          TAG_COLORS[selectedColor].text
                        )}
                      >
                        {newTagName}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={handleAddTag}
                    disabled={!newTagName.trim()}
                    className="h-8"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* AI Summarize Button - Text only, no icon */}
        {onAISummarize && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAISummarize}
            className="text-muted-foreground hover:text-primary hidden sm:flex"
            aria-label="AI Summarize"
          >
            AI Summarize
          </Button>
        )}

        {/* Keyboard Shortcuts Help */}
        <KeyboardShortcutsHelp 
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="btn-icon hidden md:flex"
              aria-label="View keyboard shortcuts"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
          }
        />

        {/* Favorite Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFavorite}
          className={cn(
            'btn-icon',
            isFavorite && 'text-warning'
          )}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites (⌘⇧F)'}
        >
          <Star className={cn('h-5 w-5', isFavorite && 'fill-current')} />
        </Button>

        {/* More Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="btn-icon"
              aria-label="More actions"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <span>Export as Markdown</span>
              <span className="ml-auto kbd">⌘E</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Duplicate note</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Move to folder</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span>View history</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Delete Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="btn-icon text-muted-foreground hover:text-destructive"
              aria-label="Delete note"
              title="Delete note"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this note?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your note.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
}