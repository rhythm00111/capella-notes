import React from 'react';
import { motion } from 'framer-motion';
import { Bold, Italic, Code, Link, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingToolbarProps {
  position: { x: number; y: number };
  selectedText: string;
  onClose: () => void;
}

export function FloatingToolbar({ position, selectedText, onClose }: FloatingToolbarProps) {
  const handleAction = (action: string) => {
    console.log(`Action: ${action} on text: ${selectedText}`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 5, scale: 0.95 }}
      className="floating-toolbar fixed z-50"
      style={{ left: position.x, top: position.y, transform: 'translate(-50%, -100%)' }}
    >
      <button onClick={() => handleAction('bold')} className="p-1.5 rounded hover:bg-muted" title="Bold">
        <Bold className="h-4 w-4" />
      </button>
      <button onClick={() => handleAction('italic')} className="p-1.5 rounded hover:bg-muted" title="Italic">
        <Italic className="h-4 w-4" />
      </button>
      <button onClick={() => handleAction('code')} className="p-1.5 rounded hover:bg-muted" title="Code">
        <Code className="h-4 w-4" />
      </button>
      <button onClick={() => handleAction('link')} className="p-1.5 rounded hover:bg-muted" title="Link">
        <Link className="h-4 w-4" />
      </button>
      <div className="w-px h-5 bg-border mx-0.5" />
      <button onClick={() => handleAction('ai')} className="p-1.5 rounded hover:bg-muted text-primary" title="AI Actions">
        <Sparkles className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
