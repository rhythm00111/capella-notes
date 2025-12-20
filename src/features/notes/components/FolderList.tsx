import { useState } from 'react';
import { Folder, FolderPlus, Trash2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useNotesStore } from '../store/useNotesStore';
import { getFolderNoteCount } from '../lib/notesSelectors';
import { ALL_NOTES_FOLDER_ID } from '../types/folder';

export function FolderList() {
  const { folders, notes, activeFolderId, setActiveFolder, createFolder, deleteFolder } = useNotesStore();
  const [newFolderName, setNewFolderName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName('');
      setIsDialogOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateFolder();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-2">
              <FolderPlus className="h-4 w-4" />
              New Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Folder List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {folders.map((folder) => {
            const noteCount = getFolderNoteCount(notes, folder.id);
            const isAllNotes = folder.id === ALL_NOTES_FOLDER_ID;
            const isActive = activeFolderId === folder.id;

            return (
              <div
                key={folder.id}
                className={cn(
                  'group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
                onClick={() => setActiveFolder(folder.id)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Folder className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate text-sm font-medium">{folder.name}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="text-xs opacity-60">{noteCount}</span>
                  
                  {!isAllNotes && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFolder(folder.id);
                      }}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  
                  <ChevronRight className={cn(
                    'h-4 w-4 transition-transform',
                    isActive && 'rotate-90'
                  )} />
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
