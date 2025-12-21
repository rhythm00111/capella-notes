import { FileText, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubPageCardProps {
  title: string;
  preview?: string;
  onClick: () => void;
  className?: string;
}

export function SubPageCard({ 
  title, 
  preview, 
  onClick,
  className 
}: SubPageCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full group my-3 p-4',
        'bg-card hover:bg-card/80',
        'border border-border hover:border-primary/30',
        'rounded-xl transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5',
        'text-left focus-ring',
        className
      )}
      aria-label={`Open sub-page: ${title}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
            {title || 'Untitled'}
          </h4>
          {preview && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {preview}
            </p>
          )}
        </div>
        
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-0.5 transition-colors" />
      </div>
    </button>
  );
}
