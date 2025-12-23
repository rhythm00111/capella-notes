import { forwardRef } from 'react';
import { Clock, Pin, FileText, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Note } from '../types/note';
import { getPreview, formatRelativeDate } from '../lib/notesHelpers';
import { useNotesStore } from '../store/useNotesStore';

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
    const getChildNotes = useNotesStore((state) => state.getChildNotes);
    
    // Get sub-pages for this note
    const subPages = getChildNotes(note.id);
    
    // Extract tags from content (simple #tag pattern)
    const extractTags = (content: string): string[] => {
      const tagPattern = /#(\w+)/g;
      const matches = content.match(tagPattern);
      if (!matches) return [];
      return [...new Set(matches.slice(0, 3))]; // Limit to 3 unique tags
    };
    
    const tags = extractTags(note.content);

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          'group cursor-pointer p-4 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm',
          'hover:border-[#063f47]/40 hover:bg-card hover:shadow-lg hover:shadow-[#063f47]/5',
          'transition-all duration-300 ease-out',
          'active:scale-[0.99]',
          isSelected && 'border-[#063f47]/60 bg-card shadow-md ring-1 ring-[#063f47]/20'
        )}
        role="button"
        tabIndex={0}
        aria-label={`Note: ${note.title || 'Untitled'}`}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
      >
        {/* Header with Title & Pin */}
        <div className="flex items-start gap-2">
          <h3 className="font-semibold text-foreground truncate flex-1 text-base leading-tight">
            {note.title || 'Untitled'}
          </h3>
          {note.isPinned && (
            <Pin className="h-3.5 w-3.5 text-[#063f47] flex-shrink-0 mt-0.5" aria-label="Pinned" />
          )}
        </div>

        {/* Preview */}
        {preview && (
          <p className="mt-2 text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed">
            {preview}
          </p>
        )}

        {/* Tags Section */}
        {tags.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#063f47]/10 text-[#063f47] border border-[#063f47]/20"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag.replace('#', '')}
              </span>
            ))}
          </div>
        )}

        {/* Sub-pages Section */}
        {subPages.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <FileText className="h-3 w-3" />
              <span className="font-medium">{subPages.length} sub-page{subPages.length > 1 ? 's' : ''}</span>
            </div>
            <div className="space-y-1">
              {subPages.slice(0, 2).map((subPage) => (
                <div
                  key={subPage.id}
                  className="flex items-center gap-2 text-xs text-muted-foreground/70 pl-4 py-1 rounded hover:bg-muted/50 transition-colors"
                >
                  <div className="w-1 h-1 rounded-full bg-[#063f47]/40" />
                  <span className="truncate">{subPage.title || 'Untitled'}</span>
                </div>
              ))}
              {subPages.length > 2 && (
                <span className="text-[10px] text-muted-foreground/50 pl-4">
                  +{subPages.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between gap-2">
          {folderName && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted text-muted-foreground">
              {folderName}
            </span>
          )}

          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 flex-shrink-0 ml-auto">
            <Clock className="h-3 w-3" />
            {formattedDate}
          </span>
        </div>
      </div>
    );
  }
);

NoteCard.displayName = 'NoteCard';
