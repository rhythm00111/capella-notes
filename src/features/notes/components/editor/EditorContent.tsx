import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { SlashCommandMenu, SlashCommand } from './SlashCommandMenu';
import { FloatingFormatBar } from './FloatingFormatBar';
import { NoteLinkMenu } from './NoteLinkMenu';
import { Note } from '../../types/note';

interface EditorContentProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  allNotes: Note[];
  currentNoteId: string;
  onCreateLinkedNote: (title: string) => string;
}

export interface EditorContentRef {
  navigateToLine: (lineIndex: number) => void;
}

export const EditorContent = forwardRef<EditorContentRef, EditorContentProps>(
  (
    { title, content, onTitleChange, onContentChange, allNotes, currentNoteId, onCreateLinkedNote },
    ref
  ) => {
    const [localContent, setLocalContent] = useState(content);
    const [slashMenu, setSlashMenu] = useState<{
      isOpen: boolean;
      position: { top: number; left: number };
      query: string;
      startIndex: number;
    }>({
      isOpen: false,
      position: { top: 0, left: 0 },
      query: '',
      startIndex: 0,
    });

    const [linkMenu, setLinkMenu] = useState<{
      isOpen: boolean;
      position: { top: number; left: number };
      query: string;
      startIndex: number;
    }>({
      isOpen: false,
      position: { top: 0, left: 0 },
      query: '',
      startIndex: 0,
    });

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const titleRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      navigateToLine: (lineIndex: number) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const lines = localContent.split('\n');
        let charIndex = 0;

        for (let i = 0; i < lineIndex && i < lines.length; i++) {
          charIndex += lines[i].length + 1;
        }

        textarea.focus();
        textarea.setSelectionRange(charIndex, charIndex);

        const lineHeight = 28;
        textarea.scrollTop = lineIndex * lineHeight - textarea.clientHeight / 2;
      },
    }));

    // Sync local content with prop
    useEffect(() => {
      setLocalContent(content);
    }, [content]);

    // Auto-resize textarea
    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [localContent]);

    // Handle content change with slash command and [[link]] detection
    const handleContentChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        const cursorPos = e.target.selectionStart;

        setLocalContent(value);
        onContentChange(value);

        const textBeforeCursor = value.substring(0, cursorPos);

        // Detect [[ link trigger
        const lastDoubleBracket = textBeforeCursor.lastIndexOf('[[');
        const lastClosingBracket = textBeforeCursor.lastIndexOf(']]');

        if (lastDoubleBracket !== -1 && lastDoubleBracket > lastClosingBracket) {
          const textAfterBracket = textBeforeCursor.substring(lastDoubleBracket + 2);

          if (!textAfterBracket.includes('\n') && !textAfterBracket.includes(']]')) {
            const textarea = textareaRef.current;
            if (textarea) {
              const { top, left } = getCaretCoordinates(textarea, lastDoubleBracket);
              setLinkMenu({
                isOpen: true,
                position: { top: top + 24, left },
                query: textAfterBracket,
                startIndex: lastDoubleBracket,
              });
              setSlashMenu((prev) => ({ ...prev, isOpen: false }));
              return;
            }
          }
        }

        setLinkMenu((prev) => ({ ...prev, isOpen: false }));

        // Detect slash command
        const lastSlashIndex = textBeforeCursor.lastIndexOf('/');

        if (lastSlashIndex !== -1) {
          const textAfterSlash = textBeforeCursor.substring(lastSlashIndex + 1);

          if (!textAfterSlash.includes(' ') && !textAfterSlash.includes('\n')) {
            const textarea = textareaRef.current;
            if (textarea) {
              const { top, left } = getCaretCoordinates(textarea, lastSlashIndex);
              setSlashMenu({
                isOpen: true,
                position: { top: top + 24, left },
                query: textAfterSlash,
                startIndex: lastSlashIndex,
              });
            }
          } else {
            setSlashMenu((prev) => ({ ...prev, isOpen: false }));
          }
        } else {
          setSlashMenu((prev) => ({ ...prev, isOpen: false }));
        }
      },
      [onContentChange]
    );

    // Handle note link selection
    const handleLinkSelect = useCallback(
      (note: Note) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const cursorPos = textarea.selectionStart;
        const beforeLink = localContent.substring(0, linkMenu.startIndex);
        const afterCursor = localContent.substring(cursorPos);

        const linkText = `[[${note.title}]]`;
        const newContent = beforeLink + linkText + afterCursor;

        setLocalContent(newContent);
        onContentChange(newContent);
        setLinkMenu((prev) => ({ ...prev, isOpen: false }));

        setTimeout(() => {
          textarea.focus();
          const newCursorPos = beforeLink.length + linkText.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
      },
      [localContent, linkMenu.startIndex, onContentChange]
    );

    // Handle creating new note from link
    const handleLinkCreate = useCallback(
      (newTitle: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const cursorPos = textarea.selectionStart;
        const beforeLink = localContent.substring(0, linkMenu.startIndex);
        const afterCursor = localContent.substring(cursorPos);

        onCreateLinkedNote(newTitle);

        const linkText = `[[${newTitle}]]`;
        const newContent = beforeLink + linkText + afterCursor;

        setLocalContent(newContent);
        onContentChange(newContent);
        setLinkMenu((prev) => ({ ...prev, isOpen: false }));

        setTimeout(() => {
          textarea.focus();
          const newCursorPos = beforeLink.length + linkText.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
      },
      [localContent, linkMenu.startIndex, onContentChange, onCreateLinkedNote]
    );

    // Handle slash command selection
    const handleSlashCommand = useCallback(
      (command: SlashCommand) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const cursorPos = textarea.selectionStart;
        const beforeSlash = localContent.substring(0, slashMenu.startIndex);
        const afterCursor = localContent.substring(cursorPos);

        let insertText = '';

        switch (command.id) {
          case 'heading1':
            insertText = '# ';
            break;
          case 'heading2':
            insertText = '## ';
            break;
          case 'heading3':
            insertText = '### ';
            break;
          case 'bullet':
            insertText = '- ';
            break;
          case 'numbered':
            insertText = '1. ';
            break;
          case 'todo':
            insertText = '- [ ] ';
            break;
          case 'quote':
            insertText = '> ';
            break;
          case 'code':
            insertText = '```\n\n```';
            break;
          case 'divider':
            insertText = '\n---\n';
            break;
          case 'callout':
            insertText = '> 💡 ';
            break;
          case 'table':
            insertText =
              '| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |';
            break;
          case 'image':
            insertText = '![alt text](url)';
            break;
          case 'link':
            insertText = '[[';
            break;
          case 'math':
            insertText = '$$\n\n$$';
            break;
          default:
            insertText = '';
        }

        const newContent = beforeSlash + insertText + afterCursor;
        setLocalContent(newContent);
        onContentChange(newContent);
        setSlashMenu((prev) => ({ ...prev, isOpen: false }));

        setTimeout(() => {
          textarea.focus();
          const newCursorPos = beforeSlash.length + insertText.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
      },
      [localContent, slashMenu.startIndex, onContentChange]
    );

    // Handle format action from floating bar
    const handleFormat = useCallback(
      (action: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = localContent.substring(start, end);

        let wrappedText = selectedText;

        switch (action) {
          case 'bold':
            wrappedText = `**${selectedText}**`;
            break;
          case 'italic':
            wrappedText = `*${selectedText}*`;
            break;
          case 'underline':
            wrappedText = `<u>${selectedText}</u>`;
            break;
          case 'strikethrough':
            wrappedText = `~~${selectedText}~~`;
            break;
          case 'code':
            wrappedText = `\`${selectedText}\``;
            break;
          case 'highlight':
            wrappedText = `==${selectedText}==`;
            break;
          case 'link':
            wrappedText = `[${selectedText}](url)`;
            break;
        }

        const newContent = localContent.substring(0, start) + wrappedText + localContent.substring(end);
        setLocalContent(newContent);
        onContentChange(newContent);
      },
      [localContent, onContentChange]
    );

    // Handle keyboard shortcuts
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Handle Tab for indentation
        if (e.key === 'Tab') {
          e.preventDefault();
          const textarea = e.currentTarget;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;

          const newContent = localContent.substring(0, start) + '  ' + localContent.substring(end);
          setLocalContent(newContent);
          onContentChange(newContent);

          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 2;
          }, 0);
        }

        // Handle formatting shortcuts
        if (e.metaKey || e.ctrlKey) {
          const textarea = e.currentTarget;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const selectedText = localContent.substring(start, end);

          let wrappedText = '';

          switch (e.key.toLowerCase()) {
            case 'b':
              e.preventDefault();
              wrappedText = `**${selectedText}**`;
              break;
            case 'i':
              e.preventDefault();
              wrappedText = `*${selectedText}*`;
              break;
            case 'u':
              e.preventDefault();
              wrappedText = `<u>${selectedText}</u>`;
              break;
            case 'e':
              e.preventDefault();
              wrappedText = `\`${selectedText}\``;
              break;
            case 'k':
              e.preventDefault();
              const { top, left } = getCaretCoordinates(textarea, start);
              setLinkMenu({
                isOpen: true,
                position: { top: top + 24, left },
                query: selectedText,
                startIndex: start,
              });
              return;
            default:
              return;
          }

          const newContent =
            localContent.substring(0, start) + wrappedText + localContent.substring(end);
          setLocalContent(newContent);
          onContentChange(newContent);
        }
      },
      [localContent, onContentChange]
    );

    // Handle title key events
    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };

    return (
      <div ref={containerRef} className="editor-container">
        {/* Title */}
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onKeyDown={handleTitleKeyDown}
          placeholder="Untitled"
          className="editor-title text-foreground mb-8"
        />

        {/* Content */}
        <textarea
          ref={textareaRef}
          value={localContent}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          placeholder="Start writing, or type '/' for commands, '[[' to link..."
          className="editor-content"
        />

        {/* Slash Command Menu */}
        <SlashCommandMenu
          isOpen={slashMenu.isOpen}
          position={slashMenu.position}
          searchQuery={slashMenu.query}
          onSelect={handleSlashCommand}
          onClose={() => setSlashMenu((prev) => ({ ...prev, isOpen: false }))}
        />

        {/* Note Link Menu */}
        <NoteLinkMenu
          isOpen={linkMenu.isOpen}
          position={linkMenu.position}
          searchQuery={linkMenu.query}
          notes={allNotes}
          currentNoteId={currentNoteId}
          onSelect={handleLinkSelect}
          onCreate={handleLinkCreate}
          onClose={() => setLinkMenu((prev) => ({ ...prev, isOpen: false }))}
        />

        {/* Floating Format Bar */}
        <FloatingFormatBar containerRef={containerRef} onFormat={handleFormat} />
      </div>
    );
  }
);

EditorContent.displayName = 'EditorContent';

// Helper function to get caret coordinates in textarea
function getCaretCoordinates(
  element: HTMLTextAreaElement,
  position: number
): { top: number; left: number } {
  const rect = element.getBoundingClientRect();

  const mirror = document.createElement('div');
  const style = window.getComputedStyle(element);

  mirror.style.position = 'absolute';
  mirror.style.top = '-9999px';
  mirror.style.left = '-9999px';
  mirror.style.width = style.width;
  mirror.style.height = 'auto';
  mirror.style.fontSize = style.fontSize;
  mirror.style.fontFamily = style.fontFamily;
  mirror.style.fontWeight = style.fontWeight;
  mirror.style.lineHeight = style.lineHeight;
  mirror.style.letterSpacing = style.letterSpacing;
  mirror.style.padding = style.padding;
  mirror.style.border = style.border;
  mirror.style.whiteSpace = 'pre-wrap';
  mirror.style.wordWrap = 'break-word';

  const textContent = element.value.substring(0, position);
  mirror.textContent = textContent;

  const span = document.createElement('span');
  span.textContent = element.value.substring(position) || '.';
  mirror.appendChild(span);

  document.body.appendChild(mirror);

  const spanRect = span.getBoundingClientRect();
  const mirrorRect = mirror.getBoundingClientRect();

  document.body.removeChild(mirror);

  return {
    top: rect.top + (spanRect.top - mirrorRect.top) + window.scrollY,
    left: rect.left + (spanRect.left - mirrorRect.left),
  };
}
