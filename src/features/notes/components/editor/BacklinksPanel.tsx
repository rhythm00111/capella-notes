import { useMemo } from 'react';
import { Link2, ArrowUpRight } from 'lucide-react';
import { Note } from '../../types/note';
import { cn } from '@/lib/utils';

interface BacklinksPanelProps {
  currentNoteId: string;
  currentNoteTitle: string;
  allNotes: Note[];
  onNavigateToNote: (noteId: string) => void;
}

interface Backlink {
  noteId: string;
  noteTitle: string;
  context: string;
}

export function BacklinksPanel({
  currentNoteId,
  currentNoteTitle,
  allNotes,
  onNavigateToNote,
}: BacklinksPanelProps) {
  const backlinks = useMemo(() => {
    const result: Backlink[] = [];
    const searchPattern = new RegExp(`\\[\\[${escapeRegex(currentNoteTitle)}\\]\\]`, 'gi');
    
    allNotes.forEach((note) => {
      if (note.id === currentNoteId) return;
      
      const matches = note.content.match(searchPattern);
      if (matches && matches.length > 0) {
        // Find the context around the first match
        const matchIndex = note.content.search(searchPattern);
        const contextStart = Math.max(0, matchIndex - 30);
        const contextEnd = Math.min(note.content.length, matchIndex + 50);
        let context = note.content.substring(contextStart, contextEnd);
        
        if (contextStart > 0) context = '...' + context;
        if (contextEnd < note.content.length) context = context + '...';
        
        result.push({
          noteId: note.id,
          noteTitle: note.title,
          context: context.replace(/\n/g, ' '),
        });
      }
    });
    
    return result;
  }, [currentNoteId, currentNoteTitle, allNotes]);

  if (backlinks.length === 0) {
    return (
      <div className="p-4 text-center">
        <Link2 className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No backlinks</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Other notes linking here will appear
        </p>
      </div>
    );
  }

  return (
    <div className="py-2 space-y-1">
      <div className="px-3 py-1 text-xs text-muted-foreground">
        {backlinks.length} note{backlinks.length !== 1 ? 's' : ''} linking here
      </div>
      
      {backlinks.map((backlink) => (
        <button
          key={backlink.noteId}
          onClick={() => onNavigateToNote(backlink.noteId)}
          className={cn(
            'w-full text-left px-3 py-2 mx-1 rounded-md',
            'hover:bg-muted/50 transition-colors',
            'group'
          )}
        >
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span className="truncate">{backlink.noteTitle}</span>
            <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {backlink.context}
          </p>
        </button>
      ))}
    </div>
  );
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}