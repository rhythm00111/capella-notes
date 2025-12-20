import { Note, AISuggestion, TagSuggestion, LinkSuggestion, SummarySuggestion, DuplicateSuggestion, TaskSuggestion } from '@/types/notes';

// Utility for realistic async delays
const delay = (min: number, max: number) => 
  new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));

// Simple keyword extraction
const extractKeywords = (text: string): string[] => {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where',
    'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some',
    'such', 'no', 'not', 'only', 'same', 'so', 'than', 'too', 'very', 'just', 'can',
    'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their'
  ]);

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  // Count frequency
  const freq: Record<string, number> = {};
  words.forEach(word => {
    freq[word] = (freq[word] || 0) + 1;
  });

  // Return top keywords
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
};

// Levenshtein distance for similarity
const levenshteinDistance = (a: string, b: string): number => {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
};

// Calculate similarity between two strings (0-1)
const calculateSimilarity = (a: string, b: string): number => {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();
  const maxLen = Math.max(aLower.length, bLower.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(aLower, bLower);
  return 1 - distance / maxLen;
};

// Word overlap similarity
const wordOverlapSimilarity = (text1: string, text2: string): number => {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = [...words1].filter(w => words2.has(w)).length;
  const union = new Set([...words1, ...words2]).size;
  
  return union > 0 ? intersection / union : 0;
};

// Common tag patterns
const tagPatterns: Record<string, string[]> = {
  'productivity': ['task', 'todo', 'habit', 'routine', 'workflow', 'efficiency', 'organize'],
  'meeting': ['attendees', 'agenda', 'notes', 'action items', 'standup', 'sync'],
  'project': ['scope', 'timeline', 'budget', 'milestone', 'deadline', 'phase'],
  'learning': ['book', 'course', 'tutorial', 'notes', 'study', 'research'],
  'travel': ['trip', 'itinerary', 'flight', 'hotel', 'destination', 'vacation'],
  'recipe': ['ingredients', 'cook', 'recipe', 'food', 'meal', 'bake'],
  'development': ['code', 'react', 'typescript', 'api', 'bug', 'feature'],
  'design': ['ui', 'ux', 'color', 'typography', 'layout', 'component'],
  'client': ['client', 'project', 'budget', 'scope', 'contract'],
  'personal': ['journal', 'reflection', 'goals', 'ideas', 'thoughts'],
};

// Create unique ID
const createId = () => Math.random().toString(36).substring(2, 11);

export const mockAIService = {
  /**
   * Suggest tags based on note content
   */
  async suggestTags(text: string): Promise<TagSuggestion[]> {
    await delay(300, 800);
    
    const keywords = extractKeywords(text);
    const suggestions: TagSuggestion[] = [];
    
    // Match against tag patterns
    Object.entries(tagPatterns).forEach(([tag, patterns]) => {
      const matches = patterns.filter(p => 
        text.toLowerCase().includes(p) || keywords.includes(p)
      );
      if (matches.length > 0) {
        suggestions.push({
          id: createId(),
          type: 'tag',
          value: tag,
          confidence: Math.min(0.5 + matches.length * 0.15, 0.95),
          reason: `Content contains: ${matches.slice(0, 2).join(', ')}`,
          createdAt: new Date(),
        });
      }
    });
    
    // Add keyword-based suggestions
    keywords.slice(0, 3).forEach(keyword => {
      if (!suggestions.some(s => s.value === keyword)) {
        suggestions.push({
          id: createId(),
          type: 'tag',
          value: keyword,
          confidence: 0.6 + Math.random() * 0.2,
          reason: 'Frequently mentioned keyword',
          createdAt: new Date(),
        });
      }
    });
    
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  },

  /**
   * Suggest backlinks to other notes
   */
  async suggestBacklinks(text: string, allNotes: Note[]): Promise<LinkSuggestion[]> {
    await delay(400, 1000);
    
    const suggestions: LinkSuggestion[] = [];
    
    allNotes.forEach(note => {
      // Skip if text is from same note
      if (text === note.plainText) return;
      
      // Calculate relevance using multiple factors
      const titleSimilarity = wordOverlapSimilarity(text, note.title);
      const contentSimilarity = wordOverlapSimilarity(text, note.plainText);
      const tagOverlap = note.tags.filter(tag => 
        text.toLowerCase().includes(tag)
      ).length / Math.max(note.tags.length, 1);
      
      const relevance = (titleSimilarity * 0.3 + contentSimilarity * 0.5 + tagOverlap * 0.2);
      
      if (relevance > 0.1) {
        suggestions.push({
          id: createId(),
          type: 'link',
          value: {
            noteId: note.id,
            noteTitle: note.title,
            relevance,
          },
          confidence: Math.min(relevance + 0.3, 0.95),
          reason: `Similar topics and keywords`,
          createdAt: new Date(),
        });
      }
    });
    
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  },

  /**
   * Generate a summary of the note
   */
  async summarize(text: string): Promise<SummarySuggestion> {
    await delay(500, 1200);
    
    // Simple extractive summarization
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const keywords = extractKeywords(text);
    
    // Score sentences by keyword presence
    const scoredSentences = sentences.map(sentence => ({
      sentence: sentence.trim(),
      score: keywords.filter(k => sentence.toLowerCase().includes(k)).length,
    }));
    
    // Get top 2-3 sentences
    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(s => s.sentence);
    
    const summary = topSentences.length > 0 
      ? topSentences.join('. ') + '.'
      : 'This note covers various topics and requires manual review for summarization.';
    
    return {
      id: createId(),
      type: 'summary',
      value: summary,
      confidence: 0.75 + Math.random() * 0.15,
      createdAt: new Date(),
    };
  },

  /**
   * Find potential duplicate notes
   */
  async findDuplicates(note: Note, allNotes: Note[]): Promise<DuplicateSuggestion[]> {
    await delay(400, 900);
    
    const suggestions: DuplicateSuggestion[] = [];
    
    allNotes.forEach(otherNote => {
      if (otherNote.id === note.id || otherNote.isDeleted) return;
      
      // Check title similarity
      const titleSimilarity = calculateSimilarity(note.title, otherNote.title);
      
      // Check content similarity
      const contentSimilarity = wordOverlapSimilarity(note.plainText, otherNote.plainText);
      
      // Weighted average
      const similarity = titleSimilarity * 0.4 + contentSimilarity * 0.6;
      
      if (similarity > 0.5) {
        suggestions.push({
          id: createId(),
          type: 'duplicate',
          value: {
            noteId: otherNote.id,
            noteTitle: otherNote.title,
            similarity,
          },
          confidence: similarity,
          reason: `${Math.round(similarity * 100)}% similar content`,
          createdAt: new Date(),
        });
      }
    });
    
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  },

  /**
   * Mock voice transcription
   */
  async transcribeVoice(audioDuration: number): Promise<string> {
    await delay(1000, 2000);
    
    // Mock transcriptions based on duration
    const mockTranscriptions = [
      "Remember to follow up with the team about the Q4 launch timeline. Sarah mentioned needing the design specs by Friday.",
      "Quick note about the morning routine - try waking up 15 minutes earlier and doing some light stretching before checking emails.",
      "Idea for the product: what if we added a graph view for notes? It could show connections between related topics visually.",
      "Meeting note: Discussed budget allocation for next quarter. Marketing needs additional $10K for the campaign. Need to get approval.",
      "Research topic: Look into React Server Components and how they could improve our app's performance.",
    ];
    
    return mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
  },

  /**
   * Extract potential tasks from note content
   */
  async extractTasks(text: string): Promise<TaskSuggestion[]> {
    await delay(300, 700);
    
    const suggestions: TaskSuggestion[] = [];
    
    // Patterns that indicate tasks
    const taskPatterns = [
      /(?:need to|should|must|have to|todo|to-do|action item[s]?:?\s*)(.*?)(?:\.|$)/gi,
      /\[ \]\s*(.*?)(?:\n|$)/g,
      /(?:follow up|remember to|don't forget to)\s*(.*?)(?:\.|$)/gi,
    ];
    
    taskPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const task = match[1]?.trim();
        if (task && task.length > 5 && task.length < 200) {
          suggestions.push({
            id: createId(),
            type: 'task',
            value: task,
            confidence: 0.8 + Math.random() * 0.15,
            createdAt: new Date(),
          });
        }
      }
    });
    
    // Remove duplicates
    const unique = suggestions.filter((s, i) => 
      suggestions.findIndex(x => x.value === s.value) === i
    );
    
    return unique.slice(0, 5);
  },

  /**
   * Detect client/person names in text
   */
  async detectClients(text: string): Promise<string[]> {
    await delay(200, 500);
    
    // Simple pattern matching for names (capitalized words)
    const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g;
    const matches = text.match(namePattern) || [];
    
    // Filter out common non-names
    const nonNames = new Set(['Action Items', 'Next Steps', 'Key Decisions', 'Main Contact']);
    const clients = [...new Set(matches)].filter(m => !nonNames.has(m));
    
    return clients.slice(0, 5);
  },

  /**
   * Suggest a title based on content
   */
  async suggestTitle(text: string): Promise<string> {
    await delay(300, 600);
    
    const keywords = extractKeywords(text);
    const firstSentence = text.split(/[.!?]/)[0]?.trim() || '';
    
    // Use first sentence if short enough
    if (firstSentence.length > 5 && firstSentence.length < 60) {
      return firstSentence;
    }
    
    // Generate title from keywords
    if (keywords.length >= 2) {
      const title = keywords.slice(0, 3)
        .map(k => k.charAt(0).toUpperCase() + k.slice(1))
        .join(' - ');
      return title;
    }
    
    return 'Untitled Note';
  },

  /**
   * Analyze note and generate all suggestions
   */
  async analyzeNote(note: Note, allNotes: Note[]): Promise<AISuggestion[]> {
    await delay(500, 1000);
    
    const [tags, links, summary, duplicates, tasks] = await Promise.all([
      this.suggestTags(note.plainText),
      this.suggestBacklinks(note.plainText, allNotes),
      this.summarize(note.plainText),
      this.findDuplicates(note, allNotes),
      this.extractTasks(note.plainText),
    ]);
    
    return [...tags, ...links, summary, ...duplicates, ...tasks];
  },
};
