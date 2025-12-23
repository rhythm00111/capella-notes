import { useState, useEffect } from 'react';
import { Folder, FolderPlus, Trash2, ChevronRight, ChevronLeft, FileText, PanelLeftClose, PanelLeft } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNotesStore } from '../store/useNotesStore';
import { getFolderNoteCount } from '../lib/notesSelectors';
import { ALL_NOTES_FOLDER_ID } from '../types/folder';

export function FolderList() {
  const { 
    folders, 
    notes, 
    activeFolderId, 
    selectFolder, 
    createFolder, 
    deleteFolder,
    currentView,
    setCurrentView,
    getDeletedNotes,
    isFolderPanelCollapsed,
    toggleFolderPanel,
  } = useNotesStore();
  const [newFolderName, setNewFolderName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const deletedNotes = getDeletedNotes();

  // Keyboard shortcut Cmd+\ to toggle panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        toggleFolderPanel();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFolderPanel]);

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

  // Collapsed view
  if (isFolderPanelCollapsed) {
    return (
      <TooltipProvider delayDuration={100}>
        <div className="flex flex-col h-full w-[52px] border-r border-border bg-sidebar transition-all duration-200">
          {/* Expand Button */}
          <div className="p-2 border-b border-border">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFolderPanel}
                  className="w-full"
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar (⌘\)</TooltipContent>
            </Tooltip>
          </div>

          {/* Icons */}
          <div className="flex-1 p-2 space-y-1">
            {/* All Notes */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    selectFolder(ALL_NOTES_FOLDER_ID);
                    setCurrentView('notes');
                  }}
                  className={cn(
                    'w-full p-2 rounded-lg transition-colors flex items-center justify-center',
                    activeFolderId === ALL_NOTES_FOLDER_ID && currentView === 'notes'
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <FileText className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">All Notes</TooltipContent>
            </Tooltip>

            {/* Folders */}
            {folders.filter(f => f.id !== ALL_NOTES_FOLDER_ID).map((folder) => (
              <Tooltip key={folder.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      selectFolder(folder.id);
                      setCurrentView('notes');
                    }}
                    className={cn(
                      'w-full p-2 rounded-lg transition-colors flex items-center justify-center',
                      activeFolderId === folder.id && currentView === 'notes'
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <Folder className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{folder.name}</TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Trash */}
          <div className="p-2 border-t border-border">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setCurrentView('trash')}
                  className={cn(
                    'w-full p-2 rounded-lg transition-colors flex items-center justify-center relative',
                    currentView === 'trash'
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Trash2 className="h-4 w-4" />
                  {deletedNotes.length > 0 && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-destructive rounded-full" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Trash ({deletedNotes.length})</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  // Expanded view
  return (
    <div className="flex flex-col h-full transition-all duration-200">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border flex items-center gap-2">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1 justify-start gap-2">
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

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFolderPanel}
          className="flex-shrink-0"
          title="Collapse sidebar (⌘\)"
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      {/* Folder List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {folders.map((folder) => {
            const noteCount = getFolderNoteCount(notes.filter(n => !n.isDeleted), folder.id);
            const isAllNotes = folder.id === ALL_NOTES_FOLDER_ID;
            const isActive = activeFolderId === folder.id && currentView === 'notes';

            return (
              <div
                key={folder.id}
                className={cn(
                  'group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
                onClick={() => {
                  selectFolder(folder.id);
                  setCurrentView('notes');
                }}
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

                  <ChevronRight
                    className={cn('h-4 w-4 transition-transform', isActive && 'rotate-90')}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Trash Section */}
      <div className="p-2 border-t border-border">
        <button
          onClick={() => setCurrentView('trash')}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors',
            currentView === 'trash'
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            <span className="text-sm font-medium">Trash</span>
          </div>
          {deletedNotes.length > 0 && (
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
              {deletedNotes.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
