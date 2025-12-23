import { useState } from 'react';
import { Plus, Search, ChevronDown, X, LayoutGrid, List, SlidersHorizontal, ChevronsUpDown, ChevronsDownUp } from 'lucide-react';
import { motion } from 'framer-motion';
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

export function NotesTopBar() {
  const { folders, notes, activeFolderId, searchQuery, selectFolder, setSearchQuery, createNote, viewMode, setViewMode, allCardsExpanded, toggleAllCardsExpanded } =
    useNotesStore();

  const [showAISummarize, setShowAISummarize] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('updated');

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
            {/* AI Summarize Button - Simplified without icon */}
            <motion.button
              onClick={() => setShowAISummarize(true)}
              disabled={activeNotes.length === 0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Hover Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="relative flex items-center gap-2">
                {/* Text */}
                <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors duration-300">
                  AI Summarize
                </span>
                
                {/* Beta Badge */}
                <span className="hidden sm:inline px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-primary/20 text-primary rounded-md">
                  Beta
                </span>
              </div>
              
              {/* Bottom Shine */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.button>

            {/* Expand/Collapse All Toggle */}
            <button
              onClick={toggleAllCardsExpanded}
              className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all duration-200 ${
                allCardsExpanded
                  ? 'bg-[#063f47]/10 border-[#063f47]/30 text-[#063f47]'
                  : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:border-border/80'
              }`}
              title={allCardsExpanded ? 'Collapse all cards' : 'Expand all cards'}
            >
              {allCardsExpanded ? (
                <ChevronsDownUp className="h-4 w-4" />
              ) : (
                <ChevronsUpDown className="h-4 w-4" />
              )}
              <span className="text-xs font-medium">{allCardsExpanded ? 'Collapse' : 'Expand'}</span>
            </button>

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
