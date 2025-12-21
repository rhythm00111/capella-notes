import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: (e: KeyboardEvent) => void;
  preventDefault?: boolean;
  description?: string;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[], enabled = true) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    shortcuts.forEach(({ key, ctrl, meta, shift, alt, handler, preventDefault = true }) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      
      // Handle meta/ctrl based on platform
      const cmdKey = meta ? (isMac ? e.metaKey : e.ctrlKey) : true;
      const ctrlKey = ctrl !== undefined ? e.ctrlKey === ctrl : true;
      const shiftKey = shift !== undefined ? e.shiftKey === shift : true;
      const altKey = alt !== undefined ? e.altKey === alt : true;
      
      const keyMatch = e.key.toLowerCase() === key.toLowerCase();

      if (keyMatch && cmdKey && ctrlKey && shiftKey && altKey) {
        if (preventDefault) e.preventDefault();
        handler(e);
      }
    });
  }, [shortcuts, enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// Common keyboard shortcut definitions
export const SHORTCUTS = {
  SAVE: { key: 's', meta: true },
  BOLD: { key: 'b', meta: true },
  ITALIC: { key: 'i', meta: true },
  UNDERLINE: { key: 'u', meta: true },
  LINK: { key: 'k', meta: true },
  CODE: { key: 'e', meta: true },
  NEW_NOTE: { key: 'n', meta: true },
  SEARCH: { key: 'p', meta: true },
  ESCAPE: { key: 'Escape' },
} as const;

export type ShortcutKey = keyof typeof SHORTCUTS;
