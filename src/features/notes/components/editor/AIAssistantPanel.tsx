import { useState } from 'react';
import { 
  Sparkles, 
  FileText, 
  RefreshCw, 
  PenLine,
  Wand2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AIAssistantPanelProps {
  content: string;
  onUpdateContent: (newContent: string) => void;
}

type AIAction = 'summarize' | 'rewrite' | 'continue' | 'improve';

interface AIActionItem {
  id: AIAction;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const AI_ACTIONS: AIActionItem[] = [
  {
    id: 'summarize',
    label: 'Summarize',
    description: 'Create a concise summary of your note',
    icon: FileText,
  },
  {
    id: 'rewrite',
    label: 'Rewrite',
    description: 'Make it clearer and more concise',
    icon: RefreshCw,
  },
  {
    id: 'continue',
    label: 'Continue Writing',
    description: 'AI continues where you left off',
    icon: PenLine,
  },
  {
    id: 'improve',
    label: 'Improve',
    description: 'Fix grammar and enhance style',
    icon: Wand2,
  },
];

export function AIAssistantPanel({ content, onUpdateContent }: AIAssistantPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAction, setActiveAction] = useState<AIAction | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [previousContent, setPreviousContent] = useState<string | null>(null);

  const handleAction = async (action: AIAction) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setActiveAction(action);
    setPreviousContent(content);

    // Simulate AI processing (in real implementation, this would call an AI API)
    await new Promise(resolve => setTimeout(resolve, 1500));

    let result = '';
    
    switch (action) {
      case 'summarize':
        result = generateSummary(content);
        break;
      case 'rewrite':
        result = rewriteContent(content);
        break;
      case 'continue':
        result = continueWriting(content);
        break;
      case 'improve':
        result = improveContent(content);
        break;
    }

    setLastResult(result);
    onUpdateContent(result);
    setIsProcessing(false);
    setActiveAction(null);
  };

  const handleUndo = () => {
    if (previousContent) {
      onUpdateContent(previousContent);
      setPreviousContent(null);
      setLastResult(null);
    }
  };

  return (
    <div className="p-3 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-primary">
        <Sparkles className="h-4 w-4" />
        <span className="text-sm font-medium">AI Assistant</span>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground">
        Use AI to help you write, edit, and organize your notes.
      </p>

      {/* Actions */}
      <div className="space-y-2">
        {AI_ACTIONS.map((action) => {
          const Icon = action.icon;
          const isActive = activeAction === action.id;
          
          return (
            <button
              key={action.id}
              onClick={() => handleAction(action.id)}
              disabled={isProcessing || !content.trim()}
              className={cn(
                'w-full flex items-start gap-3 p-3 rounded-lg text-left',
                'bg-muted/50 hover:bg-muted transition-colors duration-150',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'border border-transparent hover:border-border',
                isActive && 'bg-primary/10 border-primary/20'
              )}
            >
              <div className={cn(
                'mt-0.5 p-1.5 rounded-md',
                isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
              )}>
                {isActive ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">
                  {action.label}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {action.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Undo Button */}
      {previousContent && lastResult && (
        <div className="pt-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            className="w-full text-xs"
          >
            Undo Last AI Action
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!content.trim() && (
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            Start writing to use AI features
          </p>
        </div>
      )}
    </div>
  );
}

// Helper functions to simulate AI actions
function generateSummary(content: string): string {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length <= 3) return content;
  
  // Simple summary: take first line as header, add "Summary:" section
  const summary = `## Summary\n\n${lines.slice(0, 2).join(' ').substring(0, 200)}...\n\n---\n\n${content}`;
  return summary;
}

function rewriteContent(content: string): string {
  // Simple rewrite: clean up whitespace and add structure
  const lines = content.split('\n');
  const cleaned = lines
    .map(line => line.trim())
    .filter(line => line)
    .join('\n\n');
  return cleaned;
}

function continueWriting(content: string): string {
  // Simple continuation: add placeholder continuation
  const continuations = [
    '\n\nFurthermore, this leads us to consider the broader implications of these ideas.',
    '\n\nBuilding on this foundation, we can explore additional perspectives.',
    '\n\nThis naturally brings us to the next important point to address.',
  ];
  const randomContinuation = continuations[Math.floor(Math.random() * continuations.length)];
  return content + randomContinuation;
}

function improveContent(content: string): string {
  // Simple improvement: capitalize sentences and clean formatting
  const sentences = content.split('. ');
  const improved = sentences
    .map(s => s.trim())
    .filter(s => s)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('. ');
  return improved;
}
