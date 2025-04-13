/**
 * @fileoverview Zustand store for managing notes with real-time sync capabilities.
 * Handles CRUD operations for notes and maintains sync state using keepsync.
 */

import { create } from 'zustand';
import { sync } from '@tonk/keepsync';

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Core state interface defining all properties that can be read
 */
interface NotesState {
  /** Data state - contains the actual notes data */
  data: {
    notes: Note[];
    tags: string[];
  };
  /** UI state - contains loading and error states */
  ui: {
    isLoading: boolean;
    error: string | null;
  };
}

/**
 * Actions interface defining all ways the state can be modified
 */
interface NotesActions {
  /** Creates a new note and adds it to the store */
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  /** Updates an existing note by ID */
  updateNote: (id: string, updates: Partial<Note>) => void;
  /** Removes a note from the store by ID */
  deleteNote: (id: string) => void;
  /** Retrieves a note by its ID */
  getNoteById: (id: string) => Note | undefined;
  /** Retrieves recent notes, sorted by updatedAt */
  getRecentNotes: (limit?: number) => Note[];
  /** Filters notes by tag */
  getNotesByTag: (tag: string) => Note[];

  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;

  /** Sets the loading state */
  setLoading: (isLoading: boolean) => void;
  /** Sets an error message */
  setError: (error: string | null) => void;
}

/**
 * Combined type for the complete store
 */
type NotesStore = NotesState & NotesActions;

// @ts-ignore
// @ts-ignore
/**
 * Creates a Zustand store for managing notes with sync capabilities
 */
export const useNotesStore = create<NotesStore>(
  sync(
    (set, get) => ({
      // Initial state
      data: {
        notes: [],
        tags: [],
      },
      ui: {
        isLoading: false,
        error: null,
      },

      // Note management actions
      addNote: (noteData) => {
        const newNote: Note = {
          id: crypto.randomUUID(),
          ...noteData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const existingTags = new Set(get().data.tags);
        const newTags = noteData.tags.filter(tag => !existingTags.has(tag));

        set((state) => ({
          data: {
            notes: [...state.data.notes, newNote],
            tags: [...state.data.tags, ...newTags],
          },
        }));
      },

      updateNote: (id, updates) => {
        set((state) => ({
          data: {
            ...state.data,
            notes: state.data.notes.map((note) =>
                note.id === id
                    ? { ...note, ...updates, updatedAt: new Date().toISOString() }
                    : note
            ),
          },
        }));
      },

      deleteNote: (id) => {
        set((state) => ({
          data: {
            ...state.data,
            notes: state.data.notes.filter((note) => note.id !== id),
          },
        }));
      },

      getNoteById: (id) => {
        return get().data.notes.find((note) => note.id === id);
      },

      getRecentNotes: (limit = 5) => {
        return [...get().data.notes]
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, limit);
      },

      getNotesByTag: (tag) => {
        return get().data.notes.filter((note) => note.tags.includes(tag));
      },

      addTag: (tag) => {
        set((state) => ({
          data: {
            ...state.data,
            tags: state.data.tags.includes(tag)
                ? state.data.tags
                : [...state.data.tags, tag],
          },
        }));
      },

      removeTag: (tag) => {
        set((state) => ({
          data: {
            notes: state.data.notes.map((note) => ({
              ...note,
              tags: note.tags.filter((t) => t !== tag),
            })),
            tags: state.data.tags.filter((t) => t !== tag),
          },
        }));
      },

      setLoading: (isLoading) => {
        set((state) => ({
          ui: { ...state.ui, isLoading },
        }));
      },

      setError: (error) => {
        set((state) => ({
          ui: { ...state.ui, error },
        }));
      },
    }),
      {
        docId: 'notes',
        initTimeout: 30000,
        onInitError: (error) => {
          useNotesStore.getState().setError(error.message);
          console.error('Notes sync initialization error:', error);
        },
          server: 'ws://localhost:6080/sync', // 👈 Add this line
      }
  )
);