import { useState, useMemo } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Clock, 
  RotateCcw,
  ChevronDown,
  ChevronRight,
  FileText,
  Diff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface NoteVersion {
  id: string;
  timestamp: Date;
  title: string;
  content: string;
  wordCount: number;
  trigger: 'auto' | 'manual' | 'ai' | 'title';
}

interface VersionHistoryPanelProps {
  versions: NoteVersion[];
  currentContent: string;
  currentTitle: string;
  onRestore: (version: NoteVersion) => void;
}

export function VersionHistoryPanel({
  versions,
  currentContent,
  currentTitle,
  onRestore,
}: VersionHistoryPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [diffDialogOpen, setDiffDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<NoteVersion | null>(null);

  const groupedVersions = useMemo(() => {
    const groups: { [key: string]: NoteVersion[] } = {};
    
    versions.forEach(version => {
      const dateKey = format(version.timestamp, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(version);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, items]) => ({
        date,
        label: format(new Date(date), 'MMMM d, yyyy'),
        versions: items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
      }));
  }, [versions]);

  const getTriggerLabel = (trigger: NoteVersion['trigger']) => {
    switch (trigger) {
      case 'auto': return 'Auto-save';
      case 'manual': return 'Manual save';
      case 'ai': return 'AI action';
      case 'title': return 'Title change';
      default: return 'Saved';
    }
  };

  const getTriggerColor = (trigger: NoteVersion['trigger']) => {
    switch (trigger) {
      case 'ai': return 'text-primary';
      case 'manual': return 'text-accent-blue';
      case 'title': return 'text-accent-warning';
      default: return 'text-muted-foreground';
    }
  };

  const handleViewDiff = (version: NoteVersion) => {
    setSelectedVersion(version);
    setDiffDialogOpen(true);
  };

  const computeDiff = (oldContent: string, newContent: string) => {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    
    const diff: { type: 'added' | 'removed' | 'unchanged'; content: string }[] = [];
    
    const maxLength = Math.max(oldLines.length, newLines.length);
    
    for (let i = 0; i < maxLength; i++) {
      const oldLine = oldLines[i] || '';
      const newLine = newLines[i] || '';
      
      if (oldLine === newLine) {
        if (oldLine) diff.push({ type: 'unchanged', content: oldLine });
      } else {
        if (oldLine) diff.push({ type: 'removed', content: oldLine });
        if (newLine) diff.push({ type: 'added', content: newLine });
      }
    }
    
    return diff;
  };

  if (versions.length === 0) {
    return (
      <div className="p-3 text-center">
        <Clock className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-xs text-muted-foreground">
          No version history yet
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Versions are saved automatically as you edit
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="p-3 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 text-foreground">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">Version History</span>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {groupedVersions.map((group) => (
            <div key={group.date}>
              {/* Date Header */}
              <div className="text-xs font-medium text-muted-foreground mb-2">
                {group.label}
              </div>

              {/* Versions for this day */}
              <div className="space-y-1 border-l-2 border-border ml-2">
                {group.versions.map((version) => {
                  const isExpanded = expandedId === version.id;
                  
                  return (
                    <div
                      key={version.id}
                      className="relative"
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-[5px] top-3 w-2 h-2 rounded-full bg-muted-foreground" />
                      
                      {/* Version item */}
                      <div
                        className={cn(
                          'ml-4 p-2 rounded-lg cursor-pointer',
                          'hover:bg-muted/50 transition-colors',
                          isExpanded && 'bg-muted/50'
                        )}
                        onClick={() => setExpandedId(isExpanded ? null : version.id)}
                      >
                        {/* Header */}
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span className="text-xs font-medium">
                            {format(version.timestamp, 'h:mm a')}
                          </span>
                          <span className={cn('text-xs', getTriggerColor(version.trigger))}>
                            {getTriggerLabel(version.trigger)}
                          </span>
                        </div>

                        {/* Expanded content */}
                        {isExpanded && (
                          <div className="mt-2 ml-5 space-y-2">
                            {/* Preview */}
                            <div className="text-xs text-muted-foreground line-clamp-3">
                              {version.content.substring(0, 150)}
                              {version.content.length > 150 && '...'}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{version.wordCount} words</span>
                              <span>{formatDistanceToNow(version.timestamp, { addSuffix: true })}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDiff(version);
                                }}
                                className="h-7 text-xs gap-1.5"
                              >
                                <Diff className="h-3 w-3" />
                                View Diff
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRestore(version);
                                }}
                                className="h-7 text-xs gap-1.5 text-primary hover:text-primary"
                              >
                                <RotateCcw className="h-3 w-3" />
                                Restore
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Diff Dialog */}
      <Dialog open={diffDialogOpen} onOpenChange={setDiffDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Diff className="h-5 w-5" />
              Version Comparison
            </DialogTitle>
          </DialogHeader>
          
          {selectedVersion && (
            <div className="flex-1 overflow-auto custom-scrollbar">
              {/* Version info */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                <div className="text-sm text-muted-foreground">
                  Comparing with version from {format(selectedVersion.timestamp, 'MMM d, yyyy h:mm a')}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onRestore(selectedVersion);
                    setDiffDialogOpen(false);
                  }}
                  className="gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restore This Version
                </Button>
              </div>

              {/* Diff view */}
              <div className="font-mono text-sm space-y-0.5">
                {computeDiff(selectedVersion.content, currentContent).map((line, index) => (
                  <div
                    key={index}
                    className={cn(
                      'px-3 py-1 rounded',
                      line.type === 'added' && 'bg-primary/10 text-primary',
                      line.type === 'removed' && 'bg-destructive/10 text-destructive',
                      line.type === 'unchanged' && 'text-muted-foreground'
                    )}
                  >
                    <span className="mr-2 opacity-50">
                      {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                    </span>
                    {line.content || '\u00A0'}
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
