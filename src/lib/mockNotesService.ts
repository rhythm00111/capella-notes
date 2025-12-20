import { Note, Block, Notebook, Folder } from '@/types/notes';
import { processedNotes, sampleNotebooks, sampleFolders } from '@/data/sampleNotes';

// Create unique ID
const createId = () => Math.random().toString(36).substring(2, 11);

// Helper to compute word count
const computeWordCount = (blocks: Block[]): number => {
  return blocks.reduce((count, block) => {
    return count + block.content.split(/\s+/).filter(Boolean).length;
  }, 0);
};

// Helper to compute plain text
const computePlainText = (blocks: Block[]): string => {
  return blocks.map(b => b.content).join(' ');
};

// Simulate async delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockNotesService = {
  /**
   * Get all notes
   */
  async getNotes(): Promise<Note[]> {
    await delay(100);
    return [...processedNotes];
  },

  /**
   * Get a single note by ID
   */
  async getNote(id: string): Promise<Note | null> {
    await delay(50);
    return processedNotes.find(n => n.id === id) || null;
  },

  /**
   * Get all notebooks
   */
  async getNotebooks(): Promise<Notebook[]> {
    await delay(50);
    return [...sampleNotebooks];
  },

  /**
   * Get all folders
   */
  async getFolders(): Promise<Folder[]> {
    await delay(50);
    return [...sampleFolders];
  },

  /**
   * Create a new note
   */
  async createNote(partial: Partial<Note>): Promise<Note> {
    await delay(100);
    
    const blocks = partial.blocks || [
      {
        id: createId(),
        type: 'paragraph' as const,
        content: '',
      },
    ];
    
    const note: Note = {
      id: createId(),
      title: partial.title || 'Untitled',
      blocks,
      plainText: computePlainText(blocks),
      tags: partial.tags || [],
      notebookId: partial.notebookId,
      folderId: partial.folderId,
      linkedNotes: [],
      backlinks: [],
      aiSuggestions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 0,
      isFavorite: false,
      isPinned: false,
      isArchived: false,
      isDeleted: false,
      wordCount: computeWordCount(blocks),
    };
    
    return note;
  },

  /**
   * Update an existing note
   */
  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    await delay(50);
    
    const existingIndex = processedNotes.findIndex(n => n.id === id);
    if (existingIndex === -1) {
      throw new Error(`Note with id ${id} not found`);
    }
    
    const existing = processedNotes[existingIndex];
    const blocks = updates.blocks || existing.blocks;
    
    const updated: Note = {
      ...existing,
      ...updates,
      plainText: computePlainText(blocks),
      wordCount: computeWordCount(blocks),
      updatedAt: new Date(),
    };
    
    return updated;
  },

  /**
   * Delete a note (soft delete)
   */
  async deleteNote(id: string): Promise<void> {
    await delay(50);
    // In real implementation, would update the note to isDeleted: true
  },

  /**
   * Permanently delete a note
   */
  async permanentlyDeleteNote(id: string): Promise<void> {
    await delay(50);
    // In real implementation, would remove from storage
  },

  /**
   * Restore a deleted note
   */
  async restoreNote(id: string): Promise<void> {
    await delay(50);
    // In real implementation, would set isDeleted: false
  },

  /**
   * Create a task from note content
   */
  async createTaskFromNote(noteId: string, taskContent: string): Promise<string> {
    await delay(100);
    // Mock task creation - returns fake task ID
    return `task-${createId()}`;
  },

  /**
   * Import markdown content as a note
   */
  async importMarkdown(content: string, title?: string): Promise<Note> {
    await delay(200);
    
    const blocks: Block[] = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      // Parse markdown patterns
      if (trimmed.startsWith('# ')) {
        blocks.push({ id: createId(), type: 'heading', content: trimmed.slice(2), level: 1 });
      } else if (trimmed.startsWith('## ')) {
        blocks.push({ id: createId(), type: 'heading', content: trimmed.slice(3), level: 2 });
      } else if (trimmed.startsWith('### ')) {
        blocks.push({ id: createId(), type: 'heading', content: trimmed.slice(4), level: 3 });
      } else if (trimmed.startsWith('- [ ] ')) {
        blocks.push({ id: createId(), type: 'checkbox', content: trimmed.slice(6), checked: false });
      } else if (trimmed.startsWith('- [x] ')) {
        blocks.push({ id: createId(), type: 'checkbox', content: trimmed.slice(6), checked: true });
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        blocks.push({ id: createId(), type: 'list', content: trimmed.slice(2) });
      } else if (trimmed.startsWith('> ')) {
        blocks.push({ id: createId(), type: 'quote', content: trimmed.slice(2) });
      } else if (trimmed.startsWith('```')) {
        // Simplified code block handling
        blocks.push({ id: createId(), type: 'code', content: '', language: trimmed.slice(3) });
      } else if (trimmed === '---') {
        blocks.push({ id: createId(), type: 'divider', content: '' });
      } else {
        blocks.push({ id: createId(), type: 'paragraph', content: trimmed });
      }
    });
    
    return this.createNote({
      title: title || 'Imported Note',
      blocks: blocks.length > 0 ? blocks : [{ id: createId(), type: 'paragraph', content: '' }],
    });
  },

  /**
   * Export note to markdown
   */
  async exportMarkdown(note: Note): Promise<string> {
    await delay(100);
    
    const lines: string[] = [`# ${note.title}`, ''];
    
    note.blocks.forEach(block => {
      switch (block.type) {
        case 'heading':
          lines.push(`${'#'.repeat(block.level || 1)} ${block.content}`);
          break;
        case 'paragraph':
          lines.push(block.content);
          break;
        case 'list':
          lines.push(`- ${block.content}`);
          break;
        case 'numbered-list':
          lines.push(block.content);
          break;
        case 'checkbox':
          lines.push(`- [${block.checked ? 'x' : ' '}] ${block.content}`);
          break;
        case 'quote':
          lines.push(`> ${block.content}`);
          break;
        case 'code':
          lines.push(`\`\`\`${block.language || ''}`);
          lines.push(block.content);
          lines.push('```');
          break;
        case 'divider':
          lines.push('---');
          break;
        default:
          lines.push(block.content);
      }
      lines.push('');
    });
    
    // Add metadata
    if (note.tags.length > 0) {
      lines.push('---');
      lines.push(`Tags: ${note.tags.join(', ')}`);
    }
    
    return lines.join('\n');
  },

  /**
   * Export note to JSON
   */
  async exportJSON(note: Note): Promise<string> {
    await delay(50);
    return JSON.stringify(note, null, 2);
  },

  /**
   * Create a notebook
   */
  async createNotebook(notebook: Partial<Notebook>): Promise<Notebook> {
    await delay(100);
    
    return {
      id: createId(),
      name: notebook.name || 'New Notebook',
      color: notebook.color || 'blue',
      icon: notebook.icon,
      description: notebook.description,
      noteCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  /**
   * Create a folder
   */
  async createFolder(folder: Partial<Folder>): Promise<Folder> {
    await delay(100);
    
    if (!folder.notebookId) {
      throw new Error('Folder must belong to a notebook');
    }
    
    return {
      id: createId(),
      name: folder.name || 'New Folder',
      notebookId: folder.notebookId,
      parentId: folder.parentId,
      noteCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },
};
