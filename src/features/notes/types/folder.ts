// Folder type definition

export interface Folder {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Default folder ID constant
export const ALL_NOTES_FOLDER_ID = 'all-notes';

// Default "All Notes" folder (virtual, cannot be deleted)
export const ALL_NOTES_FOLDER: Folder = {
  id: ALL_NOTES_FOLDER_ID,
  name: 'All Notes',
  createdAt: new Date(),
  updatedAt: new Date(),
};
