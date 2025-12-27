import { useNavigate } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { Note } from '../../types/note';
import { getSubPagePreview } from '../../lib/subPageHelpers';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SubPagesSectionProps {
  childNotes: Note[];
  onCreateSubPage: () => void;
  canCreateSubPage: boolean;
  className?: string;
}

export function SubPagesSection({ 
  childNotes, 
  onCreateSubPage, 
  canCreateSubPage,
  className 
}: SubPagesSectionProps) {
  const navigate = useNavigate();

  // Only show section if there are child notes or user can create sub-pages
  if (childNotes.length === 0 && !canCreateSubPage) {
    return null;
  }

  return (
    <div className={cn('mt-8', className)}>
      {/* Notion-style Divider with Label */}
      <div className="relative flex items-center mb-4">
        <div className="flex-grow border-t border-border/50" />
        <span className="mx-3 text-xs uppercase tracking-wide text-muted-foreground font-medium">
          Sub-pages
        </span>
        <div className="flex-grow border-t border-border/50" />
      </div>

      {/* Sub-pages List */}
      {childNotes.length > 0 ? (
        <ul className="space-y-1">
          {childNotes.map((child) => (
            <li key={child.id}>
              <button
                onClick={() => navigate(`/notes/${child.id}`)}
                className="group flex items-center gap-2 w-full rounded-lg px-3 py-2 text-left hover:bg-muted/50 transition-colors"
              >
                <FileText className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-foreground/90 group-hover:text-foreground transition-colors block truncate">
                    {child.title || 'Untitled'}
                  </span>
                  {getSubPagePreview(child.content) && (
                    <span className="text-xs text-muted-foreground truncate block">
                      {getSubPagePreview(child.content, 60)}
                    </span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground py-2 text-center">
          No sub-pages yet
        </p>
      )}

      {/* Add Sub-page Button */}
      {canCreateSubPage && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onCreateSubPage}
          className="mt-3 w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add sub-page
        </Button>
      )}
    </div>
  );
}
