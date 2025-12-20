import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNotesStore } from '../store/useNotesStore';
import { getFolderNoteCount } from '../lib/notesSelectors';

export function NotesTopBar() {
  const { folders, notes, activeFolderId, searchQuery, selectFolder, setSearchQuery, createNote } =
    useNotesStore();

  const noteCount = getFolderNoteCount(notes, activeFolderId);

  return (
    <div className="flex-shrink-0 border-b border-border p-4 space-y-3">
      {/* Title Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Notes</h1>
          <p className="text-sm text-muted-foreground">
            {noteCount} {noteCount === 1 ? 'note' : 'notes'}
          </p>
        </div>

        <Button onClick={() => createNote()} className="btn-premium gap-2">
          <Plus className="h-4 w-4" />
          New Note
        </Button>
      </div>

      {/* Controls Row */}
      <div className="flex items-center gap-3">
        {/* Folder Selector */}
        <Select value={activeFolderId} onValueChange={selectFolder}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select folder" />
          </SelectTrigger>
          <SelectContent>
            {folders.map((folder) => (
              <SelectItem key={folder.id} value={folder.id}>
                {folder.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
    </div>
  );
}
