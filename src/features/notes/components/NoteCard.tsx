import { forwardRef } from 'react';
import { Clock, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Note } from '../types/note';
import { getPreview, formatRelativeDate } from '../lib/notesHelpers';

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  folderName?: string;
  onClick: () => void;
}

export const NoteCard = forwardRef<HTMLDivElement, NoteCardProps>(
  ({ note, isSelected, folderName, onClick }, ref) => {
    const preview = getPreview(note.content);
    const formattedDate = formatRelativeDate(note.updatedAt);

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn('note-card group cursor-pointer p-4', isSelected && 'selected')}
        role="button"
        tabIndex={0}
        aria-label={`Note: ${note.title || 'Untitled'}`}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
      >
        {/* Title */}
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-foreground truncate flex-1">
            {note.title || 'Untitled'}
          </h3>
          {note.isPinned && <Pin className="h-3 w-3 text-primary flex-shrink-0" aria-label="Pinned" />}
        </div>

        {/* Preview */}
        {preview && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{preview}</p>
        )}

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between gap-2">
          {folderName && <span className="tag tag-default text-xs">{folderName}</span>}

          <span className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0 ml-auto">
            <Clock className="h-3 w-3" />
            {formattedDate}
          </span>
        </div>
      </div>
    );
  }
);

NoteCard.displayName = 'NoteCard';
