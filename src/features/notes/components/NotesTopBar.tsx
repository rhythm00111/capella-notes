import { useState } from 'react';
import { Plus, Search, ChevronDown, Sparkles, X, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNotesStore } from '../store/useNotesStore';
import { getFolderNoteCount } from '../lib/notesSelectors';
import { AISummarizeModal } from './AISummarizeModal';

type SortOption = 'updated' | 'created' | 'title-asc' | 'title-desc';
type ViewMode = 'grid' | 'list';

export function NotesTopBar() {
  const { folders, notes, activeFolderId, searchQuery, selectFolder, setSearchQuery, createNote } =
    useNotesStore();

  const [showAISummarize, setShowAISummarize] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const noteCount = getFolderNoteCount(notes, activeFolderId);
  const activeFolder = folders.find((f) => f.id === activeFolderId);
  const activeNotes = notes.filter((n) => !n.isDeleted);

  return (
    <>
      <div className="flex-shrink-0 border-b border-border p-4 space-y-4">
        {/* Row 1: Title + Primary Actions */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Title & Count */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-semibold text-foreground">Notes</h1>
            <p className="text-sm text-muted-foreground">
              {noteCount} {noteCount === 1 ? 'note' : 'notes'}
            </p>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            {/* AI Summarize Button */}
            <Button
              variant="outline"
              onClick={() => setShowAISummarize(true)}
              className="gap-2 text-primary border-primary/30 hover:bg-primary/10 hover:border-primary/50"
              disabled={activeNotes.length === 0}
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI Summarize</span>
            </Button>

            {/* View Toggle */}
            <div className="hidden md:flex items-center rounded-lg border border-border bg-muted/30 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* New Note Button */}
            <Button onClick={() => createNote()} className="btn-premium gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Note</span>
            </Button>
          </div>
        </div>

        {/* Row 2: Folder Selector + Search + Sort */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Folder Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[160px] justify-between">
                <span className="truncate">{activeFolder?.name || 'Select folder'}</span>
                <ChevronDown className="h-4 w-4 opacity-50 ml-2 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[160px]" align="start">
              {folders.map((folder) => (
                <DropdownMenuItem
                  key={folder.id}
                  onClick={() => selectFolder(folder.id)}
                  className={activeFolderId === folder.id ? 'bg-accent' : ''}
                >
                  {folder.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[150px]">
              <SlidersHorizontal className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Last Updated</SelectItem>
              <SelectItem value="created">Date Created</SelectItem>
              <SelectItem value="title-asc">Title (A-Z)</SelectItem>
              <SelectItem value="title-desc">Title (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* AI Summarize Modal */}
      <AISummarizeModal
        isOpen={showAISummarize}
        onClose={() => setShowAISummarize(false)}
        notes={activeNotes}
      />
    </>
  );
}
