// Folder type definition

export interface Folder {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
  order: number;
}

// Default folder ID constant
export const ALL_NOTES_FOLDER_ID = 'all-notes';

// Default "All Notes" folder (virtual, cannot be deleted)
export const ALL_NOTES_FOLDER: Folder = {
  id: ALL_NOTES_FOLDER_ID,
  name: 'All Notes',
  color: '#10B981',
  icon: '📁',
  createdAt: new Date().toISOString(),
  order: 0,
};
