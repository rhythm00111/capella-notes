import { useState } from 'react';
import { Keyboard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  title: string;
  shortcuts: ShortcutItem[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Text Formatting',
    shortcuts: [
      { keys: ['⌘', 'B'], description: 'Bold text' },
      { keys: ['⌘', 'I'], description: 'Italic text' },
      { keys: ['⌘', 'U'], description: 'Underline text' },
      { keys: ['⌘', 'E'], description: 'Inline code' },
      { keys: ['⌘', 'K'], description: 'Insert link' },
    ],
  },
  {
    title: 'Editor Actions',
    shortcuts: [
      { keys: ['⌘', 'S'], description: 'Save note' },
      { keys: ['/'], description: 'Open slash commands' },
      { keys: ['[['], description: 'Link to note' },
      { keys: ['Tab'], description: 'Indent' },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['⌘', 'N'], description: 'New note' },
      { keys: ['⌘', 'P'], description: 'Quick search' },
      { keys: ['Esc'], description: 'Close menu' },
    ],
  },
];

interface KeyboardShortcutsHelpProps {
  trigger?: React.ReactNode;
}

export function KeyboardShortcutsHelp({ trigger }: KeyboardShortcutsHelpProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-2">
            <Keyboard className="h-4 w-4" />
            <span className="hidden sm:inline">Shortcuts</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                {group.title}
              </h4>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm text-foreground">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="kbd min-w-[24px] text-center"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
