import { useState } from 'react';
import { X, Sparkles, RefreshCw, Check } from 'lucide-react';
import { Note } from '../types/note';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getPreview } from '../lib/notesHelpers';

interface AISummarizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
}

export function AISummarizeModal({ isOpen, onClose, notes }: AISummarizeModalProps) {
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaries, setSummaries] = useState<Record<string, string>>({});

  const handleGenerate = async () => {
    if (selectedNotes.length === 0) return;
    
    setIsGenerating(true);

    // Simulate AI generation with delay
    setTimeout(() => {
      const newSummaries: Record<string, string> = {};
      selectedNotes.forEach((noteId) => {
        const note = notes.find((n) => n.id === noteId);
        if (note) {
          const preview = getPreview(note.content, 150);
          newSummaries[noteId] = `Summary of "${note.title || 'Untitled'}": ${preview || 'This note covers key topics and ideas.'}`;
        }
      });
      setSummaries(newSummaries);
      setIsGenerating(false);
    }, 2000);
  };

  const toggleNote = (noteId: string) => {
    setSelectedNotes((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId]
    );
  };

  const selectAll = () => {
    setSelectedNotes(notes.map((n) => n.id));
  };

  const clearSelection = () => {
    setSelectedNotes([]);
    setSummaries({});
  };

  const handleClose = () => {
    setSelectedNotes([]);
    setSummaries({});
    setIsGenerating(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 gap-0 bg-card border-border">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-foreground">
                AI Summarize Notes
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Select notes to generate AI summaries
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Selection Controls */}
        <div className="px-6 py-3 bg-muted/30 border-b border-border flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {selectedNotes.length} of {notes.length} selected
          </span>
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={selectAll}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Select all
            </button>
            <span className="text-muted-foreground">|</span>
            <button
              onClick={clearSelection}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Notes List */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-2">
            {notes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No notes available to summarize
              </div>
            ) : (
              notes.map((note) => (
                <label
                  key={note.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={selectedNotes.includes(note.id)}
                    onCheckedChange={() => toggleNote(note.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground truncate">
                      {note.title || 'Untitled'}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {getPreview(note.content, 120) || 'No content'}
                    </p>

                    {/* Summary if generated */}
                    {summaries[note.id] && (
                      <div className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <div className="flex items-center gap-2 text-xs text-primary mb-1">
                          <Check className="h-3 w-3" />
                          Summary Generated
                        </div>
                        <p className="text-xs text-foreground/80">
                          {summaries[note.id]}
                        </p>
                      </div>
                    )}
                  </div>
                </label>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={selectedNotes.length === 0 || isGenerating}
            className="btn-premium gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Summaries
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
