import { useState, useRef, useEffect } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NoteTag, TagColor, TAG_COLORS } from '../types/note';
import { generateId } from '../lib/notesHelpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface TagPickerProps {
  tags: NoteTag[];
  onTagsChange: (tags: NoteTag[]) => void;
  availableTags?: NoteTag[];
}

const COLOR_OPTIONS: TagColor[] = [
  'gray', 'red', 'orange', 'amber', 'green', 
  'teal', 'blue', 'indigo', 'purple', 'pink'
];

export function TagPicker({ tags, onTagsChange, availableTags = [] }: TagPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState<TagColor>('blue');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleAddTag = () => {
    if (!newTagName.trim()) return;

    const newTag: NoteTag = {
      id: generateId(),
      name: newTagName.trim(),
      color: selectedColor,
    };

    onTagsChange([...tags, newTag]);
    setNewTagName('');
    setShowColorPicker(false);
  };

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(tags.filter((t) => t.id !== tagId));
  };

  const handleSelectExistingTag = (tag: NoteTag) => {
    if (!tags.find((t) => t.id === tag.id)) {
      onTagsChange([...tags, tag]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Filter available tags that aren't already added
  const suggestedTags = availableTags.filter(
    (at) => !tags.find((t) => t.id === at.id) && 
           at.name.toLowerCase().includes(newTagName.toLowerCase())
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Existing Tags */}
      {tags.map((tag) => {
        const colors = TAG_COLORS[tag.color];
        return (
          <span
            key={tag.id}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all',
              colors.bg,
              colors.text,
              colors.border
            )}
          >
            {tag.name}
            <button
              onClick={() => handleRemoveTag(tag.id)}
              className="hover:opacity-70 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        );
      })}

      {/* Add Tag Button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-muted-foreground hover:text-foreground gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="text-xs">Add tag</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-64 p-3 bg-popover border border-border shadow-xl z-50" 
          align="start"
          sideOffset={5}
        >
          <div className="space-y-3">
            {/* Tag Name Input */}
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Tag name..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8 text-sm"
              />
              <Button
                size="sm"
                onClick={handleAddTag}
                disabled={!newTagName.trim()}
                className="h-8 px-3"
              >
                Add
              </Button>
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <div 
                  className={cn(
                    'w-4 h-4 rounded-full border',
                    TAG_COLORS[selectedColor].bg,
                    TAG_COLORS[selectedColor].border
                  )} 
                />
                <span>Choose color</span>
              </button>

              {showColorPicker && (
                <div className="grid grid-cols-5 gap-2 p-2 bg-muted/50 rounded-lg">
                  {COLOR_OPTIONS.map((color) => {
                    const colors = TAG_COLORS[color];
                    return (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color);
                          setShowColorPicker(false);
                        }}
                        className={cn(
                          'w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all',
                          colors.bg,
                          colors.border,
                          selectedColor === color && 'ring-2 ring-foreground ring-offset-2 ring-offset-background'
                        )}
                      >
                        {selectedColor === color && (
                          <Check className={cn('h-3.5 w-3.5', colors.text)} />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Suggested Tags */}
            {suggestedTags.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">Suggestions</span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedTags.slice(0, 5).map((tag) => {
                    const colors = TAG_COLORS[tag.color];
                    return (
                      <button
                        key={tag.id}
                        onClick={() => handleSelectExistingTag(tag)}
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
                          'hover:opacity-80 transition-opacity',
                          colors.bg,
                          colors.text,
                          colors.border
                        )}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
