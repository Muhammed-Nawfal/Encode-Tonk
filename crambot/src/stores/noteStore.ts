import { create } from 'zustand';
// import { sync } from '@tonk/keepsync';
import { StateCreator } from 'zustand';

export interface Note {
  id: string;
  content: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface AICard {
  id: string;
  noteId: string;
  type: 'summary' | 'flashcard' | 'revision';
  content: string;
  metadata: {
    confidence: number;
    generatedAt: Date;
  };
}

export interface NoteState {
  notes: Note[];
  aiCards: AICard[];
  isProcessing: boolean;
  error: string | null;
  // Actions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addAICard: (card: Omit<AICard, 'id'>) => void;
  deleteAICard: (id: string) => void;
  setProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
}

export const useNoteStore = create<NoteState>(
  // Remove sync middleware
  (set) => ({
    notes: [],
    aiCards: [],
    isProcessing: false,
    error: null,

    addNote: (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newNote: Note = {
        ...noteData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set((state: NoteState) => ({
        notes: [...state.notes, newNote],
      }));
    },

    updateNote: (id: string, updates: Partial<Note>) => {
      set((state: NoteState) => ({
        notes: state.notes.map((note: Note) =>
          note.id === id
            ? { ...note, ...updates, updatedAt: new Date() }
            : note
        ),
      }));
    },

    deleteNote: (id: string) => {
      set((state: NoteState) => ({
        notes: state.notes.filter((note) => note.id !== id),
        // Also delete associated AI cards
        aiCards: state.aiCards.filter((card) => card.noteId !== id),
      }));
    },

    addAICard: (cardData: Omit<AICard, 'id'>) => {
      const newCard: AICard = {
        ...cardData,
        id: crypto.randomUUID(),
      };
      set((state: NoteState) => ({
        aiCards: [...state.aiCards, newCard],
      }));
    },

    deleteAICard: (id: string) => {
      set((state: NoteState) => ({
        aiCards: state.aiCards.filter((card) => card.id !== id),
      }));
    },

    setProcessing: (isProcessing: boolean) => {
      set({ isProcessing });
    },

    setError: (error: string | null) => {
      set({ error });
    },
  })
); 