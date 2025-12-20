import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MoreHorizontal, Trash2, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface EditorTopBarProps {
  title: string;
  onTitleChange: (title: string) => void;
  onDelete: () => void;
  isSaving: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function EditorTopBar({
  title,
  onTitleChange,
  onDelete,
  isSaving,
  isFavorite = false,
  onToggleFavorite,
}: EditorTopBarProps) {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);

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

  const handleBack = () => {
    navigate('/notes');
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
        {/* Save Status */}
        <div className={cn('save-status', isSaving ? 'saving' : 'saved')}>
          <span className={cn('save-dot', isSaving ? 'saving' : 'saved')} />
          <span className="hidden sm:inline">
            {isSaving ? 'Saving...' : 'Saved'}
          </span>
          {isSaving ? (
            <Loader2 className="h-3 w-3 animate-spin sm:hidden" />
          ) : (
            <Check className="h-3 w-3 sm:hidden" />
          )}
        </div>

        {/* Favorite Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFavorite}
          className={cn(
            'btn-icon',
            isFavorite && 'text-warning'
          )}
        >
          <Star className={cn('h-5 w-5', isFavorite && 'fill-current')} />
        </Button>

        {/* More Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="btn-icon">
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