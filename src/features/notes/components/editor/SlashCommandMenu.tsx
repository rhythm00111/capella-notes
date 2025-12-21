import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  Table,
  Image,
  Link,
  AlertCircle,
  Calculator,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlashCommand {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
  group: string;
}

const slashCommands: SlashCommand[] = [
  // Structure
  { id: 'subpage', label: 'Sub-page', description: 'Create a page inside this note', icon: FileText, keywords: ['page', 'nested', 'child'], group: 'Structure' },
  { id: 'heading1', label: 'Heading 1', description: 'Big section heading', icon: Heading1, keywords: ['h1', 'title', 'heading'], group: 'Structure' },
  { id: 'heading2', label: 'Heading 2', description: 'Medium section heading', icon: Heading2, keywords: ['h2', 'subtitle'], group: 'Structure' },
  { id: 'heading3', label: 'Heading 3', description: 'Small section heading', icon: Heading3, keywords: ['h3', 'subheading'], group: 'Structure' },
  { id: 'divider', label: 'Divider', description: 'Separate content sections', icon: Minus, keywords: ['hr', 'line', 'separator'], group: 'Structure' },
  
  // Lists
  { id: 'bullet', label: 'Bullet List', description: 'Create a bullet list', icon: List, keywords: ['ul', 'unordered', 'list'], group: 'Lists' },
  { id: 'numbered', label: 'Numbered List', description: 'Create a numbered list', icon: ListOrdered, keywords: ['ol', 'ordered', 'number'], group: 'Lists' },
  { id: 'todo', label: 'To-do List', description: 'Track tasks with checkboxes', icon: CheckSquare, keywords: ['check', 'task', 'checkbox'], group: 'Lists' },
  
  // Blocks
  { id: 'quote', label: 'Quote', description: 'Capture a quote', icon: Quote, keywords: ['blockquote', 'citation'], group: 'Blocks' },
  { id: 'code', label: 'Code Block', description: 'Display code with syntax', icon: Code, keywords: ['codeblock', 'snippet', 'pre'], group: 'Blocks' },
  { id: 'callout', label: 'Callout', description: 'Highlight important info', icon: AlertCircle, keywords: ['info', 'warning', 'note'], group: 'Blocks' },
  
  // Advanced
  { id: 'table', label: 'Table', description: 'Add a table', icon: Table, keywords: ['grid', 'spreadsheet'], group: 'Advanced' },
  { id: 'image', label: 'Image', description: 'Upload or embed image', icon: Image, keywords: ['picture', 'photo', 'media'], group: 'Advanced' },
  { id: 'link', label: 'Link to Note', description: 'Link to another note', icon: Link, keywords: ['internal', 'reference'], group: 'Advanced' },
  { id: 'math', label: 'Math Equation', description: 'Write LaTeX equations', icon: Calculator, keywords: ['latex', 'formula', 'equation'], group: 'Advanced' },
];

interface SlashCommandMenuProps {
  isOpen: boolean;
  position: { top: number; left: number };
  searchQuery: string;
  onSelect: (command: SlashCommand) => void;
  onClose: () => void;
}

export function SlashCommandMenu({
  isOpen,
  position,
  searchQuery,
  onSelect,
  onClose,
}: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Filter commands based on search
  const filteredCommands = slashCommands.filter((cmd) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(query) ||
      cmd.id.toLowerCase().includes(query) ||
      cmd.keywords.some(k => k.includes(query))
    );
  });

  // Group filtered commands
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = [];
    acc[cmd.group].push(cmd);
    return acc;
  }, {} as Record<string, SlashCommand[]>);

  // Reset selection when filtered results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onSelect(filteredCommands[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onSelect, onClose]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen || filteredCommands.length === 0) return null;

  let flatIndex = 0;

  return createPortal(
    <div
      ref={menuRef}
      className="slash-menu custom-scrollbar"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {Object.entries(groupedCommands).map(([group, commands]) => (
        <div key={group}>
          <div className="slash-menu-group">{group}</div>
          {commands.map((command) => {
            const itemIndex = flatIndex++;
            const isSelected = itemIndex === selectedIndex;
            
            return (
              <button
                key={command.id}
                onClick={() => onSelect(command)}
                className={cn(
                  'slash-menu-item w-full text-left',
                  isSelected && 'selected'
                )}
                onMouseEnter={() => setSelectedIndex(itemIndex)}
              >
                <div className="slash-menu-item-icon">
                  <command.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">
                    {command.label}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {command.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ))}
    </div>,
    document.body
  );
}

export { slashCommands };
export type { SlashCommand };