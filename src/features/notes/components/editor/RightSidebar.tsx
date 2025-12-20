import { useState } from 'react';
import { 
  PanelRightClose, 
  PanelRight,
  Sparkles,
  Clock,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIAssistantPanel } from './AIAssistantPanel';
import { VersionHistoryPanel, NoteVersion } from './VersionHistoryPanel';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface RightSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  content: string;
  title: string;
  onUpdateContent: (content: string) => void;
  versions: NoteVersion[];
  onRestoreVersion: (version: NoteVersion) => void;
  createdAt?: Date;
  updatedAt?: Date;
  wordCount: number;
}

export function RightSidebar({
  isOpen,
  onToggle,
  content,
  title,
  onUpdateContent,
  versions,
  onRestoreVersion,
  createdAt,
  updatedAt,
  wordCount,
}: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState('ai');

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <>
      {/* Toggle button when sidebar is collapsed */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="fixed right-4 top-20 z-40 btn-icon"
        >
          <PanelRight className="h-5 w-5" />
        </Button>
      )}

      {/* AI Floating Button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className={cn(
            'fixed right-6 bottom-6 z-50',
            'w-14 h-14 rounded-full',
            'bg-gradient-to-br from-primary to-primary/80',
            'shadow-lg shadow-primary/30',
            'flex items-center justify-center',
            'hover:scale-105 transition-transform duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background'
          )}
        >
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed right-0 top-16 bottom-0 z-30',
          'bg-sidebar border-l border-border',
          'transition-all duration-250 ease-out',
          isOpen ? 'w-72' : 'w-0 overflow-hidden border-none'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <span className="text-sm font-medium text-foreground">Tools</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <PanelRightClose className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="w-full justify-start gap-0 h-10 bg-transparent border-b border-border rounded-none px-2">
            <TabsTrigger 
              value="ai" 
              className="flex-1 gap-1.5 data-[state=active]:bg-muted rounded-md text-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="flex-1 gap-1.5 data-[state=active]:bg-muted rounded-md text-xs"
            >
              <Clock className="h-3.5 w-3.5" />
              History
            </TabsTrigger>
            <TabsTrigger 
              value="info" 
              className="flex-1 gap-1.5 data-[state=active]:bg-muted rounded-md text-xs"
            >
              <Info className="h-3.5 w-3.5" />
              Info
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto custom-scrollbar" style={{ height: 'calc(100% - 88px)' }}>
            <TabsContent value="ai" className="mt-0">
              <AIAssistantPanel
                content={content}
                onUpdateContent={onUpdateContent}
              />
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <VersionHistoryPanel
                versions={versions}
                currentContent={content}
                currentTitle={title}
                onRestore={onRestoreVersion}
              />
            </TabsContent>

            <TabsContent value="info" className="mt-0">
              <div className="p-3 space-y-4">
                <div className="flex items-center gap-2 text-foreground">
                  <Info className="h-4 w-4" />
                  <span className="text-sm font-medium">Metadata</span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Words</span>
                    <span className="font-medium">{wordCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Reading time</span>
                    <span className="font-medium">{readingTime} min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Characters</span>
                    <span className="font-medium">{content.length.toLocaleString()}</span>
                  </div>
                  
                  <div className="border-t border-border pt-3 mt-3">
                    {createdAt && (
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Created</span>
                        <span className="font-medium text-xs">
                          {format(createdAt, 'MMM d, yyyy')}
                        </span>
                      </div>
                    )}
                    {updatedAt && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Modified</span>
                        <span className="font-medium text-xs">
                          {format(updatedAt, 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </aside>
    </>
  );
}
