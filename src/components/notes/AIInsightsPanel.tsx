import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Tag, Link2, FileText, CheckSquare, Sparkles, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotesStore } from '@/hooks/useNotesStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export function AIInsightsPanel() {
  const { selectedNote, notes, applyAISuggestion, dismissAISuggestion, addBacklink } = useNotesStore();

  if (!selectedNote) return null;

  const tagSuggestions = selectedNote.aiSuggestions.filter(s => s.type === 'tag' && !s.applied);
  const linkSuggestions = selectedNote.aiSuggestions.filter(s => s.type === 'link' && !s.applied);
  const summarySuggestion = selectedNote.aiSuggestions.find(s => s.type === 'summary');
  const taskSuggestions = selectedNote.aiSuggestions.filter(s => s.type === 'task' && !s.applied);

  // Get backlinks
  const backlinks = selectedNote.backlinks.map(id => notes.find(n => n.id === id)).filter(Boolean);

  return (
    <aside className="ai-panel w-ai-panel flex flex-col h-full">
      <div className="flex-shrink-0 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">AI Insights</h3>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Suggested Tags */}
          {tagSuggestions.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Tag className="h-3 w-3" /> Suggested Tags
              </h4>
              <div className="space-y-2">
                {tagSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="ai-suggestion-card flex items-center justify-between">
                    <div>
                      <span className="tag tag-blue">{suggestion.value as string}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {Math.round(suggestion.confidence * 100)}%
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => applyAISuggestion(selectedNote.id, suggestion)}
                      className="h-7 px-2"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Suggested Links */}
          {linkSuggestions.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Link2 className="h-3 w-3" /> Suggested Links
              </h4>
              <div className="space-y-2">
                {linkSuggestions.map((suggestion) => {
                  const value = suggestion.value as { noteId: string; noteTitle: string; relevance: number };
                  return (
                    <div key={suggestion.id} className="ai-suggestion-card">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{value.noteTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round(value.relevance * 100)}% relevant
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => applyAISuggestion(selectedNote.id, suggestion)}
                          className="h-7 px-2 flex-shrink-0"
                        >
                          <Link2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Summary */}
          {summarySuggestion && (
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <FileText className="h-3 w-3" /> Summary
              </h4>
              <div className="ai-suggestion-card">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {summarySuggestion.value as string}
                </p>
                <Button size="sm" variant="ghost" className="mt-2 h-7 text-xs">
                  <RefreshCw className="h-3 w-3 mr-1" /> Regenerate
                </Button>
              </div>
            </section>
          )}

          {/* Extracted Tasks */}
          {taskSuggestions.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <CheckSquare className="h-3 w-3" /> Extracted Tasks
              </h4>
              <div className="space-y-2">
                {taskSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="ai-suggestion-card flex items-start gap-2">
                    <CheckSquare className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-sm flex-1">{suggestion.value as string}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Backlinks */}
          {backlinks.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Backlinks ({backlinks.length})
              </h4>
              <div className="space-y-2">
                {backlinks.map((note) => note && (
                  <div key={note.id} className="ai-suggestion-card cursor-pointer hover:border-primary/30">
                    <p className="text-sm font-medium">{note.title}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
