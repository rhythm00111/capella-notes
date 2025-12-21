import { ReactNode } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  ExternalLink,
  Copy,
  Edit3,
  Download,
  Share2,
  FolderInput,
  Trash2,
  Pin,
  PinOff,
} from 'lucide-react';

interface NoteContextMenuProps {
  children: ReactNode;
  onOpen: () => void;
  onDuplicate: () => void;
  onRename: () => void;
  onDownload: () => void;
  onShare: () => void;
  onMove: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  isPinned?: boolean;
}

export function NoteContextMenu({
  children,
  onOpen,
  onDuplicate,
  onRename,
  onDownload,
  onShare,
  onMove,
  onDelete,
  onTogglePin,
  isPinned,
}: NoteContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={onOpen} className="gap-2">
          <ExternalLink className="h-4 w-4" />
          Open
          <ContextMenuShortcut>Enter</ContextMenuShortcut>
        </ContextMenuItem>
        
        <ContextMenuItem onClick={onTogglePin} className="gap-2">
          {isPinned ? (
            <>
              <PinOff className="h-4 w-4" />
              Unpin
            </>
          ) : (
            <>
              <Pin className="h-4 w-4" />
              Pin
            </>
          )}
          <ContextMenuShortcut>⌘P</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem onClick={onDuplicate} className="gap-2">
          <Copy className="h-4 w-4" />
          Duplicate
          <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem onClick={onRename} className="gap-2">
          <Edit3 className="h-4 w-4" />
          Rename
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={onDownload} className="gap-2">
          <Download className="h-4 w-4" />
          Download
        </ContextMenuItem>

        <ContextMenuItem onClick={onShare} className="gap-2 opacity-50" disabled>
          <Share2 className="h-4 w-4" />
          Share
          <ContextMenuShortcut className="text-xs">Soon</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem onClick={onMove} className="gap-2">
          <FolderInput className="h-4 w-4" />
          Move to folder
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={onDelete} className="gap-2 text-destructive focus:text-destructive">
          <Trash2 className="h-4 w-4" />
          Delete
          <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
