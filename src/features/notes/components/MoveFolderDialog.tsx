import { useState } from 'react';
import { FolderInput, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Folder } from '../types/folder';

interface MoveFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Folder[];
  currentFolderId: string;
  onMove: (folderId: string) => void;
}

export function MoveFolderDialog({
  isOpen,
  onClose,
  folders,
  currentFolderId,
  onMove,
}: MoveFolderDialogProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const handleMove = () => {
    if (selectedFolderId) {
      onMove(selectedFolderId);
      onClose();
      setSelectedFolderId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderInput className="h-5 w-5" />
            Move to folder
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-64">
          <div className="space-y-1">
            {folders.map((folder) => {
              const isCurrentFolder = folder.id === currentFolderId;
              const isSelected = folder.id === selectedFolderId;

              return (
                <button
                  key={folder.id}
                  onClick={() => !isCurrentFolder && setSelectedFolderId(folder.id)}
                  disabled={isCurrentFolder}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors',
                    isCurrentFolder
                      ? 'opacity-50 cursor-not-allowed bg-muted'
                      : isSelected
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted'
                  )}
                >
                  <span className="text-sm font-medium truncate">{folder.name}</span>
                  {isCurrentFolder && (
                    <span className="text-xs text-muted-foreground">Current</span>
                  )}
                  {isSelected && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={!selectedFolderId}>
            Move
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
