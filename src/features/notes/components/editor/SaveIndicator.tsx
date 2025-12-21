import { Check, Cloud, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SaveStatus = 'saved' | 'saving' | 'error' | 'idle';

interface SaveIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date;
  className?: string;
}

export function SaveIndicator({ status, lastSaved, className }: SaveIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'saved':
        return {
          icon: Check,
          text: 'Saved',
          colorClass: 'text-emerald-500',
          dotClass: 'bg-emerald-500',
        };
      case 'saving':
        return {
          icon: Loader2,
          text: 'Saving...',
          colorClass: 'text-muted-foreground',
          dotClass: 'bg-muted-foreground',
          animate: true,
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Save failed',
          colorClass: 'text-destructive',
          dotClass: 'bg-destructive',
        };
      default:
        return {
          icon: Cloud,
          text: 'Not saved',
          colorClass: 'text-muted-foreground',
          dotClass: 'bg-muted-foreground',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div 
      className={cn(
        'flex items-center gap-2 text-xs transition-colors duration-200',
        config.colorClass,
        className
      )}
      role="status"
      aria-live="polite"
    >
      <span className={cn(
        'w-2 h-2 rounded-full transition-colors',
        config.dotClass,
        config.animate && 'animate-pulse'
      )} />
      
      <Icon className={cn(
        'h-3.5 w-3.5',
        config.animate && 'animate-spin'
      )} />
      
      <span className="font-medium">{config.text}</span>
      
      {status === 'saved' && lastSaved && (
        <span className="text-muted-foreground">
          at {formatTime(lastSaved)}
        </span>
      )}
    </div>
  );
}
