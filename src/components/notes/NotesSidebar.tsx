import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Star, 
  Clock, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Folder,
  Tag,
  Sparkles,
  FileText,
  Link2,
  AlertCircle,
  Network
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotesStore } from '@/hooks/useNotesStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const notebookColors: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  purple: 'bg-purple-500',
  gray: 'bg-gray-500',
};

export function NotesSidebar() {
  const {
    notebooks,
    folders,
    tags,
    filterView,
    selectedNotebookId,
    selectedTags,
    searchQuery,
    filteredNotes,
    notes,
    setFilterView,
    setSelectedNotebook,
    setSelectedFolder,
    toggleTag,
    setSearchQuery,
    openQuickCapture,
    openGraphView,
  } = useNotesStore();

  const [notebooksOpen, setNotebooksOpen] = useState(true);
  const [foldersOpen, setFoldersOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [smartCollectionsOpen, setSmartCollectionsOpen] = useState(true);

  // Calculate counts
  const favoriteCount = notes.filter(n => n.isFavorite && !n.isDeleted).length;
  const recentCount = notes.filter(n => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return n.updatedAt >= oneWeekAgo && !n.isDeleted;
  }).length;
  const trashCount = notes.filter(n => n.isDeleted).length;
  const allCount = notes.filter(n => !n.isDeleted).length;

  // Smart collections (mocked)
  const needsOrganization = notes.filter(n => !n.notebookId && !n.isDeleted).length;
  const suggestedLinks = notes.filter(n => 
    n.aiSuggestions.some(s => s.type === 'link' && !s.applied)
  ).length;

  const navItems = [
    { id: 'all', label: 'All Notes', icon: FileText, count: allCount },
    { id: 'favorites', label: 'Favorites', icon: Star, count: favoriteCount },
    { id: 'recent', label: 'Recent', icon: Clock, count: recentCount },
    { id: 'trash', label: 'Trash', icon: Trash2, count: trashCount },
  ];

  const smartCollections = [
    { id: 'needs-org', label: 'Needs Organization', icon: AlertCircle, count: needsOrganization },
    { id: 'suggested-links', label: 'Suggested Links', icon: Link2, count: suggestedLinks },
  ];

  return (
    <aside className="flex h-full w-sidebar flex-col border-r border-sidebar-border bg-sidebar">
      {/* Header */}
      <div className="flex-shrink-0 p-4 pb-2">
        <Button 
          onClick={openQuickCapture}
          className="btn-premium w-full justify-start gap-2"
        >
          <Plus className="h-4 w-4" />
          Quick Capture
        </Button>
      </div>

      {/* Search */}
      <div className="flex-shrink-0 px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input pl-9"
          />
        </div>
      </div>

      {/* Scrollable Navigation */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-6 pb-6">
          {/* Main Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setFilterView(item.id as any)}
                className={cn(
                  'sidebar-item w-full justify-between',
                  filterView === item.id && 'active'
                )}
              >
                <span className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
                <Badge variant="secondary" className="text-xs font-normal">
                  {item.count}
                </Badge>
              </button>
            ))}
          </nav>

          {/* Notebooks */}
          <Collapsible open={notebooksOpen} onOpenChange={setNotebooksOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
                <span>Notebooks</span>
                {notebooksOpen ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-1 pt-1"
              >
                {notebooks.map((notebook) => (
                  <button
                    key={notebook.id}
                    onClick={() => setSelectedNotebook(notebook.id)}
                    className={cn(
                      'sidebar-item w-full justify-between',
                      selectedNotebookId === notebook.id && 'active'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className={cn('h-2.5 w-2.5 rounded-full', notebookColors[notebook.color])} />
                      {notebook.name}
                    </span>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {notebook.noteCount}
                    </Badge>
                  </button>
                ))}
              </motion.div>
            </CollapsibleContent>
          </Collapsible>

          {/* Folders (de-emphasized) */}
          <Collapsible open={foldersOpen} onOpenChange={setFoldersOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 hover:text-muted-foreground">
                <span>Folders</span>
                {foldersOpen ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-1 pt-1"
              >
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className="sidebar-item w-full justify-between opacity-70"
                  >
                    <span className="flex items-center gap-2">
                      <Folder className="h-4 w-4" />
                      {folder.name}
                    </span>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {folder.noteCount}
                    </Badge>
                  </button>
                ))}
              </motion.div>
            </CollapsibleContent>
          </Collapsible>

          {/* Tags Cloud */}
          <Collapsible open={tagsOpen} onOpenChange={setTagsOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
                <span className="flex items-center gap-1.5">
                  <Tag className="h-3 w-3" />
                  Tags
                </span>
                {tagsOpen ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-wrap gap-1.5 px-3 pt-2"
              >
                {tags.slice(0, 15).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'tag transition-all hover:scale-105',
                      selectedTags.includes(tag)
                        ? 'tag-blue'
                        : 'tag-default hover:bg-muted'
                    )}
                  >
                    {tag}
                  </button>
                ))}
                {tags.length > 15 && (
                  <span className="tag tag-default">+{tags.length - 15}</span>
                )}
              </motion.div>
            </CollapsibleContent>
          </Collapsible>

          {/* Smart Collections */}
          <Collapsible open={smartCollectionsOpen} onOpenChange={setSmartCollectionsOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  Smart Collections
                </span>
                {smartCollectionsOpen ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-1 pt-1"
              >
                {smartCollections.map((item) => (
                  <button
                    key={item.id}
                    className="sidebar-item w-full justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 text-primary" />
                      {item.label}
                    </span>
                    {item.count > 0 && (
                      <Badge className="bg-primary/10 text-primary text-xs font-normal">
                        {item.count}
                      </Badge>
                    )}
                  </button>
                ))}
              </motion.div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          onClick={openGraphView}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
        >
          <Network className="h-4 w-4" />
          Graph View
        </Button>
      </div>
    </aside>
  );
}
