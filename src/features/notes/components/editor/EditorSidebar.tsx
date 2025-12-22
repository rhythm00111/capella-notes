import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PanelLeftClose, 
  PanelLeft,
  List,
  Link2,
  FileText,
  Clock,
  Tags
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OutlinePanel } from './OutlinePanel';
import { BacklinksPanel } from './BacklinksPanel';
import { Note } from '../../types/note';
import { cn } from '@/lib/utils';

interface EditorSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  content: string;
  currentNoteId: string;
  currentNoteTitle: string;
  allNotes: Note[];
  onNavigateToLine: (lineIndex: number) => void;
}

export function EditorSidebar({
  isOpen,
  onToggle,
  content,
  currentNoteId,
  currentNoteTitle,
  allNotes,
  onNavigateToLine,
}: EditorSidebarProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('outline');

  const handleNavigateToNote = (noteId: string) => {
    navigate(`/notes/${noteId}`);
  };

  return (
    <>
      {/* Toggle button when sidebar is collapsed */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="fixed left-4 z-40 btn-icon"
          style={{ top: '80px' }} // Below top bar (64px + 16px margin)
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 bottom-0 z-30',
          'bg-sidebar border-r border-border',
          'transition-all duration-250 ease-out',
          isOpen ? 'w-60' : 'w-0 overflow-hidden border-none'
        )}
        style={{ top: '64px' }} // Start below the 64px top bar
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <span className="text-sm font-medium text-foreground">Document</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="w-full justify-start gap-0 h-10 bg-transparent border-b border-border rounded-none px-2">
            <TabsTrigger 
              value="outline" 
              className="flex-1 gap-1.5 data-[state=active]:bg-muted rounded-md text-xs"
            >
              <List className="h-3.5 w-3.5" />
              Outline
            </TabsTrigger>
            <TabsTrigger 
              value="backlinks" 
              className="flex-1 gap-1.5 data-[state=active]:bg-muted rounded-md text-xs"
            >
              <Link2 className="h-3.5 w-3.5" />
              Backlinks
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto custom-scrollbar" style={{ height: 'calc(100% - 88px)' }}>
            <TabsContent value="outline" className="mt-0">
              <OutlinePanel
                content={content}
                onNavigate={onNavigateToLine}
              />
            </TabsContent>

            <TabsContent value="backlinks" className="mt-0">
              <BacklinksPanel
                currentNoteId={currentNoteId}
                currentNoteTitle={currentNoteTitle}
                allNotes={allNotes}
                onNavigateToNote={handleNavigateToNote}
              />
            </TabsContent>
          </div>
        </Tabs>
      </aside>
    </>
  );
}