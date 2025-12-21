import { useState } from 'react';
import { Sparkles, RefreshCw, ChevronDown, ChevronUp, X, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AISummaryCardProps {
  content: string;
  noteId: string;
}

export function AISummaryCard({ content, noteId }: AISummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);

  const wordCount = content.split(/\s+/).filter(Boolean).length;

  // Don't show if content is too short
  if (wordCount < 200 && !summary) return null;

  const generateSummary = async () => {
    setIsGenerating(true);
    setError(null);

    // Simulate AI call with delay
    setTimeout(() => {
      try {
        // Extract first few meaningful words for mock summary
        const words = content.split(/\s+/).filter(Boolean);
        const topicWords = words.slice(0, 5).join(' ');

        const mockSummary = `This note discusses ${topicWords}... The content covers key concepts and ideas across approximately ${wordCount} words. Main themes include the primary topics mentioned in the first section, supporting details throughout, and concluding thoughts that tie the content together.`;

        setSummary(mockSummary);
        setGeneratedAt(new Date());
        setIsGenerating(false);
      } catch (e) {
        setError('Failed to generate summary. Please try again.');
        setIsGenerating(false);
      }
    }, 2000);
  };

  const regenerate = () => {
    setSummary(null);
    setError(null);
    generateSummary();
  };

  const dismiss = () => {
    setSummary(null);
    setError(null);
    setGeneratedAt(null);
  };

  // Show generate button if no summary yet
  if (!summary && !isGenerating && !error) {
    return (
      <Button
        onClick={generateSummary}
        variant="outline"
        size="sm"
        className="gap-2 mb-4"
      >
        <Sparkles className="h-4 w-4" />
        Generate AI Summary
      </Button>
    );
  }

  return (
    <div
      className={cn(
        'mb-6 rounded-xl border transition-all duration-200',
        error ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-card'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-6 h-6 rounded-md flex items-center justify-center',
              error ? 'bg-destructive/10' : 'bg-primary/10'
            )}
          >
            {error ? (
              <AlertCircle className="h-3.5 w-3.5 text-destructive" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-foreground">AI Summary</h4>
            {generatedAt && !error && (
              <p className="text-xs text-muted-foreground">
                Generated {generatedAt.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {summary && !isGenerating && !error && (
            <Button
              variant="ghost"
              size="icon"
              onClick={regenerate}
              className="h-7 w-7"
              title="Regenerate"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 w-7"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={dismiss}
            className="h-7 w-7"
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 py-3">
          {isGenerating ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Generating summary...</span>
            </div>
          ) : error ? (
            <div className="space-y-2">
              <p className="text-sm text-destructive">{error}</p>
              <Button
                onClick={regenerate}
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {summary}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
