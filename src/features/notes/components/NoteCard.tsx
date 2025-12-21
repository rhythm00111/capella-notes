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

export function NoteCard({ note, isSelected, folderName, onClick }: NoteCardProps) {
  const preview = getPreview(note.content);
  const formattedDate = formatRelativeDate(note.updatedAt);

  return (
    <div
      onClick={onClick}
      className={cn('note-card group cursor-pointer p-4', isSelected && 'selected')}
    >
      {/* Title */}
      <div className="flex items-center gap-2">
        <h3 className="font-medium text-foreground truncate flex-1">
          {note.title || 'Untitled'}
        </h3>
        {note.isPinned && <Pin className="h-3 w-3 text-primary flex-shrink-0" />}
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
