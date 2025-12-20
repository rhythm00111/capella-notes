import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  MoreHorizontal,
  Sparkles,
  Plus,
  X,
  GripVertical,
  Trash2,
  FileDown,
  CheckSquare,
  Link2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotesStore, getSelectedNote } from '@/hooks/useNotesStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Block, BlockType } from '@/types/notes';
import { SlashMenu } from './SlashMenu';
import { FloatingToolbar } from './FloatingToolbar';

// Create unique ID
const createId = () => Math.random().toString(36).substring(2, 11);

interface EditorBlockProps {
  block: Block;
  isActive: boolean;
  onUpdate: (content: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onSelect: (text: string, rect: DOMRect | null) => void;
}

function EditorBlock({ 
  block, 
  isActive, 
  onUpdate, 
  onKeyDown, 
  onFocus,
  onSelect 
}: EditorBlockProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    onUpdate(target.textContent || '');
  }, [onUpdate]);

  const handleSelect = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      onSelect(selection.toString(), rect);
    } else {
      onSelect('', null);
    }
  }, [onSelect]);

  const getBlockStyles = () => {
    switch (block.type) {
      case 'heading':
        const sizes = { 1: 'text-2xl font-bold', 2: 'text-xl font-semibold', 3: 'text-lg font-medium' };
        return sizes[block.level as keyof typeof sizes] || sizes[1];
      case 'quote':
        return 'pl-4 border-l-2 border-primary/30 italic text-muted-foreground';
      case 'code':
        return 'font-mono text-sm bg-muted/50 rounded-md p-3';
      case 'list':
        return 'pl-4 before:content-["•"] before:absolute before:left-0 before:text-muted-foreground relative';
      case 'numbered-list':
        return 'pl-4';
      case 'checkbox':
        return 'pl-6';
      case 'divider':
        return '';
      default:
        return '';
    }
  };

  if (block.type === 'divider') {
    return (
      <div className="editor-block py-2">
        <hr className="border-t border-border" />
      </div>
    );
  }

  if (block.type === 'checkbox') {
    return (
      <div className="editor-block flex items-start gap-2 group">
        <span className="editor-block-handle">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </span>
        <input
          type="checkbox"
          checked={block.checked || false}
          onChange={() => {}}
          className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onMouseUp={handleSelect}
          className={cn(
            'flex-1 outline-none',
            block.checked && 'line-through text-muted-foreground'
          )}
        >
          {block.content}
        </div>
      </div>
    );
  }

  return (
    <div className="editor-block group">
      <span className="editor-block-handle">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </span>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onMouseUp={handleSelect}
        data-placeholder={block.type === 'paragraph' ? "Type '/' for commands..." : ''}
        className={cn(
          'outline-none min-h-[1.5em]',
          getBlockStyles(),
          !block.content && 'empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50'
        )}
      >
        {block.content}
      </div>
    </div>
  );
}

function TagInput({ tags, onAdd, onRemove }: {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}) {
  const [input, setInput] = useState('');
  const { tags: allTags } = useNotesStore();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = allTags
    .filter(t => !tags.includes(t) && t.toLowerCase().includes(input.toLowerCase()))
    .slice(0, 5);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      onAdd(input.trim().toLowerCase());
      setInput('');
      setShowSuggestions(false);
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      onRemove(tags[tags.length - 1]);
    }
  };

  return (
    <div className="relative flex flex-wrap items-center gap-1.5 px-4 py-2 border-b border-border">
      {tags.map((tag) => (
        <span key={tag} className="tag tag-blue flex items-center gap-1">
          {tag}
          <button onClick={() => onRemove(tag)} className="hover:text-destructive">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setShowSuggestions(true);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={tags.length === 0 ? "Add tags..." : ""}
        className="flex-1 min-w-[80px] bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg z-10 py-1">
          {suggestions.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                onAdd(tag);
                setInput('');
                setShowSuggestions(false);
              }}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-muted"
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function NoteEditor() {
  const store = useNotesStore();
  const {
    aiPanelOpen,
    syncState,
    selectNote,
    updateNote,
    updateTitle,
    updateBlocks,
    toggleFavorite,
    addTag,
    removeTag,
    deleteNote,
    toggleAIPanel,
  } = store;
  
  const selectedNote = getSelectedNote(store);

  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [floatingToolbarOpen, setFloatingToolbarOpen] = useState(false);
  const [floatingToolbarPosition, setFloatingToolbarPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState('');

  const handleBlockUpdate = useCallback((blockId: string, content: string) => {
    if (!selectedNote) return;
    
    // Check for slash command
    if (content === '/') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSlashMenuPosition({ x: rect.left, y: rect.bottom + 8 });
        setSlashMenuOpen(true);
      }
      return;
    }
    
    if (slashMenuOpen && !content.startsWith('/')) {
      setSlashMenuOpen(false);
    }
    
    const newBlocks = selectedNote.blocks.map(b =>
      b.id === blockId ? { ...b, content } : b
    );
    updateBlocks(selectedNote.id, newBlocks);
  }, [selectedNote, slashMenuOpen, updateBlocks]);

  const handleBlockKeyDown = useCallback((blockId: string, e: React.KeyboardEvent) => {
    if (!selectedNote) return;
    
    const blockIndex = selectedNote.blocks.findIndex(b => b.id === blockId);
    const block = selectedNote.blocks[blockIndex];
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      // Close slash menu if open
      if (slashMenuOpen) {
        setSlashMenuOpen(false);
        return;
      }
      
      // Create new block after current
      const newBlock: Block = {
        id: createId(),
        type: 'paragraph',
        content: '',
      };
      
      const newBlocks = [
        ...selectedNote.blocks.slice(0, blockIndex + 1),
        newBlock,
        ...selectedNote.blocks.slice(blockIndex + 1),
      ];
      
      updateBlocks(selectedNote.id, newBlocks);
      
      // Focus new block after render
      setTimeout(() => setActiveBlockId(newBlock.id), 0);
    }
    
    if (e.key === 'Backspace' && !block.content && selectedNote.blocks.length > 1) {
      e.preventDefault();
      
      const newBlocks = selectedNote.blocks.filter(b => b.id !== blockId);
      updateBlocks(selectedNote.id, newBlocks);
      
      // Focus previous block
      if (blockIndex > 0) {
        setActiveBlockId(selectedNote.blocks[blockIndex - 1].id);
      }
    }

    // Handle escape
    if (e.key === 'Escape') {
      setSlashMenuOpen(false);
      setFloatingToolbarOpen(false);
    }
  }, [selectedNote, slashMenuOpen, updateBlocks]);

  const handleSlashCommand = useCallback((blockType: BlockType, extra?: Partial<Block>) => {
    if (!selectedNote || !activeBlockId) return;
    
    const newBlocks = selectedNote.blocks.map(b =>
      b.id === activeBlockId ? { ...b, type: blockType, content: '', ...extra } : b
    );
    
    updateBlocks(selectedNote.id, newBlocks);
    setSlashMenuOpen(false);
  }, [selectedNote, activeBlockId, updateBlocks]);

  const handleTextSelect = useCallback((text: string, rect: DOMRect | null) => {
    if (text && rect) {
      setSelectedText(text);
      setFloatingToolbarPosition({ x: rect.left + rect.width / 2, y: rect.top - 8 });
      setFloatingToolbarOpen(true);
    } else {
      setFloatingToolbarOpen(false);
      setSelectedText('');
    }
  }, []);

  // Close menus on click outside
  useEffect(() => {
    const handleClick = () => {
      setSlashMenuOpen(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (!selectedNote) {
    return (
      <div className="flex h-full items-center justify-center bg-editor">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">Select a note</h3>
          <p className="text-sm text-muted-foreground">Choose a note from the list or create a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-editor">
      {/* Top Bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => selectNote(null)}
            className="md:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="saving-indicator">
            {syncState.status === 'saving' && (
              <>
                <span className="saving-dot" />
                <span>Saving...</span>
              </>
            )}
            {syncState.status === 'saved' && (
              <span className="text-muted-foreground/70">All changes saved</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleFavorite(selectedNote.id)}
          >
            <Star 
              className={cn(
                'h-4 w-4',
                selectedNote.isFavorite 
                  ? 'fill-amber-400 text-amber-400' 
                  : 'text-muted-foreground'
              )} 
            />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleAIPanel}
            className={cn(aiPanelOpen && 'bg-primary/10 text-primary')}
          >
            <Sparkles className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <FileDown className="mr-2 h-4 w-4" />
                Export as Markdown
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CheckSquare className="mr-2 h-4 w-4" />
                Create Task
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link2 className="mr-2 h-4 w-4" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => deleteNote(selectedNote.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Title */}
      <div className="flex-shrink-0 px-4 pt-6 pb-2">
        <input
          type="text"
          value={selectedNote.title}
          onChange={(e) => updateTitle(selectedNote.id, e.target.value)}
          placeholder="Untitled"
          className="w-full text-3xl font-bold bg-transparent outline-none placeholder:text-muted-foreground/40"
        />
      </div>

      {/* Tags */}
      <TagInput
        tags={selectedNote.tags}
        onAdd={(tag) => addTag(selectedNote.id, tag)}
        onRemove={(tag) => removeTag(selectedNote.id, tag)}
      />

      {/* Editor Content */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-4 space-y-1 min-h-full">
          {selectedNote.blocks.map((block) => (
            <EditorBlock
              key={block.id}
              block={block}
              isActive={activeBlockId === block.id}
              onUpdate={(content) => handleBlockUpdate(block.id, content)}
              onKeyDown={(e) => handleBlockKeyDown(block.id, e)}
              onFocus={() => setActiveBlockId(block.id)}
              onSelect={handleTextSelect}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Slash Menu */}
      <AnimatePresence>
        {slashMenuOpen && slashMenuPosition && (
          <SlashMenu
            position={slashMenuPosition}
            onSelect={handleSlashCommand}
            onClose={() => setSlashMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating Toolbar */}
      <AnimatePresence>
        {floatingToolbarOpen && floatingToolbarPosition && (
          <FloatingToolbar
            position={floatingToolbarPosition}
            selectedText={selectedText}
            onClose={() => setFloatingToolbarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
