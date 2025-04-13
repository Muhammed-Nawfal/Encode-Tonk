import { create } from 'zustand';
import { sync } from '@tonk/keepsync';
import { StateCreator } from 'zustand';

export interface Note {
  id: string;
  content: string;
  title: string;
  createdAt: string;
  updatedAt: string;
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
  data: {
    notes: Note[];
    tags: string[];
  };
  ui: {
    isLoading: boolean;
    error: string | null;
  };
  aiCards: AICard[];
  
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addAICard: (card: Omit<AICard, 'id'>) => void;
  deleteAICard: (id: string) => void;
  setProcessing: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  getNoteById: (id: string) => Note | undefined;
  getRecentNotes: (limit?: number) => Note[];
  getNotesByTag: (tag: string) => Note[];
}

export const useNoteStore = create<NoteState>(
  sync(
    (set, get) => ({
      data: {
        notes: [],
        tags: [],
      },
      ui: {
        isLoading: false,
        error: null,
      },
      aiCards: [],

      addNote: (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newNote: Note = {
          ...noteData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        const existingTags = new Set(get().data.tags);
        const newTags = noteData.tags.filter(tag => !existingTags.has(tag));
        
        set((state: NoteState) => ({
          data: {
            notes: [...state.data.notes, newNote],
            tags: [...state.data.tags, ...newTags],
          }
        }));
        return newNote;
      },

      updateNote: (id: string, updates: Partial<Note>) => {
        set((state: NoteState) => ({
          data: {
            ...state.data,
            notes: state.data.notes.map((note: Note) =>
              note.id === id
                ? { ...note, ...updates, updatedAt: new Date().toISOString() }
                : note
            ),
          }
        }));
      },

      deleteNote: (id: string) => {
        set((state: NoteState) => ({
          data: {
            ...state.data,
            notes: state.data.notes.filter((note) => note.id !== id),
          },
          aiCards: state.aiCards.filter((card) => card.noteId !== id),
        }));
      },
      
      getNoteById: (id: string) => {
        return get().data.notes.find((note) => note.id === id);
      },

      getRecentNotes: (limit = 5) => {
        return [...get().data.notes]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, limit);
      },

      getNotesByTag: (tag: string) => {
        return get().data.notes.filter((note) => note.tags.includes(tag));
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

      setProcessing: (isLoading: boolean) => {
        set((state: NoteState) => ({
          ui: { ...state.ui, isLoading },
        }));
      },

      setError: (error: string | null) => {
        set((state: NoteState) => ({
          ui: { ...state.ui, error },
        }));
      },
    }),
    {
      docId: 'notes',
      initTimeout: 30000,
      onInitError: (error) => {
        console.error('Notes sync initialization error:', error);
      },
    }
  )
); 