import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  Code,
  Link,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormatAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut?: string;
  action: string;
}

const formatActions: FormatAction[] = [
  { icon: Bold, label: 'Bold', shortcut: '⌘B', action: 'bold' },
  { icon: Italic, label: 'Italic', shortcut: '⌘I', action: 'italic' },
  { icon: Underline, label: 'Underline', shortcut: '⌘U', action: 'underline' },
  { icon: Strikethrough, label: 'Strikethrough', action: 'strikethrough' },
  { icon: Highlighter, label: 'Highlight', shortcut: '⌘⇧H', action: 'highlight' },
  { icon: Code, label: 'Code', shortcut: '⌘E', action: 'code' },
  { icon: Link, label: 'Link', shortcut: '⌘K', action: 'link' },
];

interface FloatingFormatBarProps {
  containerRef: React.RefObject<HTMLElement>;
  onFormat: (action: string) => void;
}

export function FloatingFormatBar({ containerRef, onFormat }: FloatingFormatBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const barRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) {
      setIsVisible(false);
      return;
    }

    const range = sel.getRangeAt(0);
    const container = containerRef.current;

    if (!container || !container.contains(range.commonAncestorContainer)) {
      setIsVisible(false);
      return;
    }

    const rect = range.getBoundingClientRect();
    const barWidth = 280;

    const top = rect.top - 48 + window.scrollY;
    const left = Math.max(16, rect.left + (rect.width - barWidth) / 2);

    setPosition({ top, left: Math.min(left, window.innerWidth - barWidth - 16) });
    setIsVisible(true);
  }, [containerRef]);

  useEffect(() => {
    const handleSelectionChange = () => {
      requestAnimationFrame(updatePosition);
    };

    const handleMouseUp = () => {
      setTimeout(updatePosition, 10);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [updatePosition]);

  const handleFormat = (action: string) => {
    onFormat(action);
  };

  if (!isVisible) return null;

  return createPortal(
    <div
      ref={barRef}
      className="floating-format-bar fixed z-50"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {formatActions.map((action, index) => (
        <button
          key={action.action}
          onClick={() => handleFormat(action.action)}
          className={cn('format-btn', index === 3 && 'ml-1')}
          title={`${action.label}${action.shortcut ? ` (${action.shortcut})` : ''}`}
        >
          <action.icon className="h-4 w-4" />
        </button>
      ))}
    </div>,
    document.body
  );
}
