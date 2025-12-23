import { 
  Library, 
  GraduationCap, 
  Briefcase, 
  Wallet, 
  Heart, 
  BookOpen,
  Home,
  Code,
  Music,
  Camera,
  Plane,
  ShoppingBag,
  Utensils,
  Dumbbell,
  Car,
  Gamepad2,
  Palette,
  Film,
  Tag
} from 'lucide-react';
import { NoteTag, TAG_COLORS } from '../../types/note';
import { cn } from '@/lib/utils';

// Map common tag names to icons
const getTagIcon = (tagName: string) => {
  const name = tagName.toLowerCase();
  
  if (name.includes('library') || name.includes('book')) return Library;
  if (name.includes('university') || name.includes('school') || name.includes('education')) return GraduationCap;
  if (name.includes('business') || name.includes('work') || name.includes('project')) return Briefcase;
  if (name.includes('wallet') || name.includes('finance') || name.includes('money')) return Wallet;
  if (name.includes('health') || name.includes('medical') || name.includes('wellness')) return Heart;
  if (name.includes('learning') || name.includes('study') || name.includes('course')) return BookOpen;
  if (name.includes('home') || name.includes('personal')) return Home;
  if (name.includes('code') || name.includes('dev') || name.includes('tech')) return Code;
  if (name.includes('music') || name.includes('audio')) return Music;
  if (name.includes('photo') || name.includes('camera')) return Camera;
  if (name.includes('travel') || name.includes('trip')) return Plane;
  if (name.includes('shopping') || name.includes('buy')) return ShoppingBag;
  if (name.includes('food') || name.includes('recipe') || name.includes('cook')) return Utensils;
  if (name.includes('fitness') || name.includes('gym') || name.includes('exercise')) return Dumbbell;
  if (name.includes('car') || name.includes('auto')) return Car;
  if (name.includes('game') || name.includes('gaming')) return Gamepad2;
  if (name.includes('art') || name.includes('design') || name.includes('creative')) return Palette;
  if (name.includes('movie') || name.includes('film') || name.includes('video')) return Film;
  
  return Tag; // Default icon
};

interface EditorTagRowProps {
  tags: NoteTag[];
}

export function EditorTagRow({ tags }: EditorTagRowProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap min-h-[28px]">
      {/* Tags with icons */}
      {tags.map((tag) => {
        const colors = TAG_COLORS[tag.color];
        const IconComponent = getTagIcon(tag.name);
        
        return (
          <span
            key={tag.id}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium',
              'transition-colors duration-150',
              colors.bg,
              colors.text
            )}
          >
            <IconComponent className="h-3.5 w-3.5" />
            {tag.name}
          </span>
        );
      })}
    </div>
  );
}
