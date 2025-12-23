import { forwardRef, useState } from 'react';
import { Clock, Pin, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Note, TAG_COLORS } from '../types/note';
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
    const [isExpanded, setIsExpanded] = useState(false);
    const preview = getPreview(note.content);
    const formattedDate = formatRelativeDate(note.updatedAt);
    const getChildNotes = useNotesStore((state) => state.getChildNotes);
    
    // Get sub-pages for this note
    const subPages = getChildNotes(note.id);
    
    // Get color-coded tags from the note
    const tags = note.tags || [];
    
    // Check if there's expandable content
    const hasExpandableContent = tags.length > 0 || subPages.length > 0;

    const handleExpandClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsExpanded(!isExpanded);
    };

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          'group cursor-pointer p-4 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm',
          'hover:border-[#063f47]/40 hover:bg-card hover:shadow-lg hover:shadow-[#063f47]/5',
          'transition-all duration-300 ease-out',
          'active:scale-[0.99]',
          isSelected && 'border-[#063f47]/60 bg-card shadow-md ring-1 ring-[#063f47]/20',
          isExpanded && 'ring-1 ring-[#063f47]/30'
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

        {/* Expandable Content Indicator */}
        {hasExpandableContent && !isExpanded && (
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleExpandClick}
              className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              <ChevronDown className="h-3 w-3" />
              <span>
                {tags.length > 0 && `${tags.length} tag${tags.length > 1 ? 's' : ''}`}
                {tags.length > 0 && subPages.length > 0 && ' · '}
                {subPages.length > 0 && `${subPages.length} sub-page${subPages.length > 1 ? 's' : ''}`}
              </span>
            </button>
          </div>
        )}

        {/* Expanded Content - Tags & Sub-pages */}
        {isExpanded && hasExpandableContent && (
          <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Collapse Button */}
            <button
              onClick={handleExpandClick}
              className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              <ChevronUp className="h-3 w-3" />
              <span>Collapse</span>
            </button>

            {/* Color-coded Tags Section */}
            {tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {tags.map((tag) => {
                  const colors = TAG_COLORS[tag.color];
                  return (
                    <span
                      key={tag.id}
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border',
                        colors.bg,
                        colors.text,
                        colors.border
                      )}
                    >
                      {tag.name}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Sub-pages Section */}
            {subPages.length > 0 && (
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                  <FileText className="h-3 w-3" />
                  <span className="font-medium">{subPages.length} sub-page{subPages.length > 1 ? 's' : ''}</span>
                </div>
                <div className="space-y-1">
                  {subPages.map((subPage) => (
                    <div
                      key={subPage.id}
                      className="flex items-center gap-2 text-xs text-muted-foreground/70 pl-4 py-1 rounded hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-1 h-1 rounded-full bg-[#063f47]/40" />
                      <span className="truncate">{subPage.title || 'Untitled'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
