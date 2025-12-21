// Sub-page parsing and utility functions

import { Note } from '../types/note';

// Parse [[Page: Title]] markers from content
interface SubPageMatch {
  fullMatch: string;
  title: string;
  startIndex: number;
  endIndex: number;
}

export const parseSubPageMarkers = (content: string): SubPageMatch[] => {
  const regex = /\[\[Page:\s*([^\]]+)\]\]/g;
  const matches: SubPageMatch[] = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    matches.push({
      fullMatch: match[0],
      title: match[1].trim(),
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return matches;
};

// Insert a sub-page marker at cursor position
export const insertSubPageMarker = (
  content: string,
  cursorPosition: number,
  title: string = 'Untitled Sub-page'
): { newContent: string; newCursorPosition: number } => {
  const marker = `[[Page: ${title}]]`;
  const before = content.substring(0, cursorPosition);
  const after = content.substring(cursorPosition);
  
  // Add newlines before/after for better formatting
  const newContent = `${before}\n\n${marker}\n\n${after}`;
  const newCursorPosition = before.length + marker.length + 4;

  return { newContent, newCursorPosition };
};

// Remove a sub-page marker from content
export const removeSubPageMarker = (
  content: string,
  subPageTitle: string
): string => {
  // Escape special regex characters in title
  const escapedTitle = subPageTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\n*\\[\\[Page:\\s*${escapedTitle}\\]\\]\\n*`, 'g');
  return content.replace(regex, '\n\n').replace(/\n{3,}/g, '\n\n').trim();
};

// Get a preview of note content (first ~100 chars, cleaned)
export const getSubPagePreview = (content: string, maxLength: number = 100): string => {
  // Remove markdown syntax for preview
  const cleaned = content
    .replace(/^#+\s/gm, '') // Remove headings
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/\[\[Page:.*?\]\]/g, '') // Remove sub-page markers
    .replace(/\[\[(.+?)\]\]/g, '$1') // Remove note links
    .replace(/```[\s\S]+?```/g, '') // Remove code blocks
    .replace(/`(.+?)`/g, '$1') // Remove inline code
    .replace(/^>\s/gm, '') // Remove blockquotes
    .replace(/^-\s\[.\]\s/gm, '') // Remove checkboxes
    .replace(/^[-*]\s/gm, '') // Remove list markers
    .replace(/^\d+\.\s/gm, '') // Remove numbered list markers
    .replace(/---/g, '') // Remove dividers
    .trim();

  const lines = cleaned.split('\n').filter(line => line.trim());
  const preview = lines.slice(0, 2).join(' ').substring(0, maxLength);
  
  return preview + (preview.length >= maxLength ? '...' : '');
};

// Get all descendants of a note (for deletion)
export const getAllDescendants = (notes: Note[], noteId: string): string[] => {
  const note = notes.find(n => n.id === noteId);
  if (!note || !note.childIds?.length) return [];
  
  const descendants: string[] = [];
  
  for (const childId of note.childIds) {
    descendants.push(childId);
    descendants.push(...getAllDescendants(notes, childId));
  }
  
  return descendants;
};

// Get the depth of a note in the hierarchy
export const getNoteDepth = (notes: Note[], noteId: string): number => {
  let depth = 0;
  let currentNote = notes.find(n => n.id === noteId);
  
  while (currentNote?.parentId) {
    depth++;
    currentNote = notes.find(n => n.id === currentNote!.parentId);
  }
  
  return depth;
};

// Check if nesting would exceed max depth
export const canNestSubPage = (notes: Note[], parentId: string, maxDepth: number = 3): boolean => {
  const parentDepth = getNoteDepth(notes, parentId);
  return parentDepth < maxDepth;
};

// Get the root note of a sub-page hierarchy
export const getRootNote = (notes: Note[], noteId: string): Note | null => {
  let currentNote = notes.find(n => n.id === noteId);
  
  while (currentNote?.parentId) {
    const parent = notes.find(n => n.id === currentNote!.parentId);
    if (!parent) break;
    currentNote = parent;
  }
  
  return currentNote || null;
};
