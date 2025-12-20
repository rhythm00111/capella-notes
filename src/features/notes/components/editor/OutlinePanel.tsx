import { useMemo } from 'react';
import { FileText, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeadingItem {
  id: string;
  text: string;
  level: number;
  lineIndex: number;
}

interface OutlinePanelProps {
  content: string;
  onNavigate: (lineIndex: number) => void;
  activeHeading?: string;
}

export function OutlinePanel({ content, onNavigate, activeHeading }: OutlinePanelProps) {
  const headings = useMemo(() => {
    const lines = content.split('\n');
    const result: HeadingItem[] = [];
    
    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        result.push({
          id: `heading-${index}`,
          text,
          level,
          lineIndex: index,
        });
      }
    });
    
    return result;
  }, [content]);

  if (headings.length === 0) {
    return (
      <div className="p-4 text-center">
        <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No headings yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Use # for headings
        </p>
      </div>
    );
  }

  return (
    <div className="py-2">
      {headings.map((heading) => (
        <button
          key={heading.id}
          onClick={() => onNavigate(heading.lineIndex)}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm',
            'hover:bg-muted/50 transition-colors rounded-md mx-1',
            'text-muted-foreground hover:text-foreground',
            activeHeading === heading.id && 'text-primary bg-primary/10'
          )}
          style={{ paddingLeft: `${(heading.level - 1) * 12 + 12}px` }}
        >
          <ChevronRight className="h-3 w-3 flex-shrink-0 opacity-50" />
          <span className="truncate">{heading.text}</span>
        </button>
      ))}
    </div>
  );
}