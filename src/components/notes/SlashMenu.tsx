import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Image,
  Minus,
  Mic
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BlockType, Block } from '@/types/notes';

interface SlashMenuItem {
  type: BlockType;
  label: string;
  icon: React.ElementType;
  description: string;
  extra?: Partial<Block>;
}

const menuItems: SlashMenuItem[] = [
  { type: 'paragraph', label: 'Text', icon: Type, description: 'Plain text' },
  { type: 'heading', label: 'Heading 1', icon: Heading1, description: 'Large heading', extra: { level: 1 } },
  { type: 'heading', label: 'Heading 2', icon: Heading2, description: 'Medium heading', extra: { level: 2 } },
  { type: 'heading', label: 'Heading 3', icon: Heading3, description: 'Small heading', extra: { level: 3 } },
  { type: 'list', label: 'Bullet List', icon: List, description: 'Simple list' },
  { type: 'numbered-list', label: 'Numbered List', icon: ListOrdered, description: 'Ordered list' },
  { type: 'checkbox', label: 'To-do', icon: CheckSquare, description: 'Checkbox item' },
  { type: 'quote', label: 'Quote', icon: Quote, description: 'Block quote' },
  { type: 'code', label: 'Code', icon: Code, description: 'Code block' },
  { type: 'divider', label: 'Divider', icon: Minus, description: 'Horizontal line' },
];

interface SlashMenuProps {
  position: { x: number; y: number };
  onSelect: (type: BlockType, extra?: Partial<Block>) => void;
  onClose: () => void;
}

export function SlashMenu({ position, onSelect, onClose }: SlashMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filter, setFilter] = useState('');

  const filteredItems = menuItems.filter(item =>
    item.label.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => (i + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => (i - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = filteredItems[selectedIndex];
        if (item) onSelect(item.type, item.extra);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredItems, selectedIndex, onSelect, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="slash-menu"
      style={{ left: position.x, top: position.y }}
      onClick={(e) => e.stopPropagation()}
    >
      {filteredItems.map((item, index) => (
        <button
          key={`${item.type}-${item.label}`}
          onClick={() => onSelect(item.type, item.extra)}
          className={cn('slash-menu-item', index === selectedIndex && 'selected')}
        >
          <item.icon className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">{item.label}</div>
            <div className="text-xs text-muted-foreground">{item.description}</div>
          </div>
        </button>
      ))}
    </motion.div>
  );
}
