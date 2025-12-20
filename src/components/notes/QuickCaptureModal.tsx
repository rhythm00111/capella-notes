import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Image, Send } from 'lucide-react';
import { useNotesStore } from '@/hooks/useNotesStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function QuickCaptureModal() {
  const { quickCaptureOpen, closeQuickCapture, createNote, selectNote } = useNotesStore();
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const handleSave = () => {
    if (!content.trim()) return;
    
    const note = createNote({
      title: content.split('\n')[0].slice(0, 50) || 'Quick Note',
      blocks: [{ id: Math.random().toString(36).substring(2, 11), type: 'paragraph', content }],
      tags: tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
    });
    
    selectNote(note.id);
    setContent('');
    setTags('');
    closeQuickCapture();
  };

  return (
    <Dialog open={quickCaptureOpen} onOpenChange={(open) => !open && closeQuickCapture()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Quick Capture
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="min-h-[150px] resize-none"
            autoFocus
          />
          
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma separated)"
            className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-transparent text-sm focus:outline-none focus:border-primary/30"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Mic className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Image className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={closeQuickCapture}>Cancel</Button>
              <Button onClick={handleSave} disabled={!content.trim()} className="btn-premium">
                <Send className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
