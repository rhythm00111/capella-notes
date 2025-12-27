import { useNavigate } from 'react-router-dom';
import { Plus, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Note } from '../../types/note';
import { SubPageCard } from '../SubPageCard';
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
  const [isExpanded, setIsExpanded] = useState(true);

  if (childNotes.length === 0 && !canCreateSubPage) {
    return null;
  }

  return (
    <div className={cn('mt-8 pt-6 border-t border-border', className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <FileText className="w-4 h-4" />
          <span>Sub-pages</span>
          {childNotes.length > 0 && (
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
              {childNotes.length}
            </span>
          )}
        </button>

        {canCreateSubPage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCreateSubPage}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add sub-page
          </Button>
        )}
      </div>

      {/* Sub-pages List */}
      {isExpanded && (
        <div className="space-y-2">
          {childNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No sub-pages yet. Create one with <code className="text-xs bg-muted px-1 py-0.5 rounded">/page</code> or click "Add sub-page".
            </p>
          ) : (
            childNotes.map((child) => (
              <SubPageCard
                key={child.id}
                title={child.title}
                preview={getSubPagePreview(child.content)}
                onClick={() => navigate(`/notes/${child.id}`)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
