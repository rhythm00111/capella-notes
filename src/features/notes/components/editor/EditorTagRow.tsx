import { Plus } from 'lucide-react';
import { NoteTag, TAG_COLORS } from '../../types/note';
import { cn } from '@/lib/utils';

interface EditorTagRowProps {
  tags: NoteTag[];
  onAddTag?: () => void;
}

export function EditorTagRow({ tags, onAddTag }: EditorTagRowProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap min-h-[24px]">
      {tags.map((tag) => {
        const colors = TAG_COLORS[tag.color];
        return (
          <span
            key={tag.id}
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium',
              'transition-colors duration-150',
              colors.bg,
              colors.text,
              'border border-transparent'
            )}
          >
            {tag.name}
          </span>
        );
      })}
      
      {onAddTag && (
        <button
          onClick={onAddTag}
          className={cn(
            'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px]',
            'text-muted-foreground/50 hover:text-muted-foreground',
            'hover:bg-muted/50 transition-all duration-150'
          )}
        >
          <Plus className="h-3 w-3" />
          <span>Add tag</span>
        </button>
      )}
    </div>
  );
}
