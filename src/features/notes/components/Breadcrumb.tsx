import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  id: string;
  title: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (id: string) => void;
  className?: string;
}

export function Breadcrumb({ items, onNavigate, className }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav 
      className={cn(
        'flex items-center gap-1.5 mb-6 pb-4 border-b border-border overflow-x-auto',
        className
      )}
      aria-label="Breadcrumb navigation"
    >
      <button
        onClick={() => onNavigate('home')}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted focus-ring flex-shrink-0"
        aria-label="Go to notes home"
      >
        <Home className="w-4 h-4" />
      </button>
      
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center gap-1.5 flex-shrink-0">
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" aria-hidden="true" />
          <button
            onClick={() => onNavigate(item.id)}
            className={cn(
              'text-sm transition-colors p-1 rounded-md hover:bg-muted focus-ring max-w-[150px] truncate',
              index === items.length - 1
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            )}
            aria-current={index === items.length - 1 ? 'page' : undefined}
          >
            {item.title || 'Untitled'}
          </button>
        </div>
      ))}
    </nav>
  );
}
