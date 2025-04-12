import { create } from 'zustand';
import { sync } from '@tonk/keepsync';

export interface ScheduleItem {
  id: string;
  type: 'class' | 'exam' | 'assignment';
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  dueDate?: string;
  course: string;
  location?: string;
  completed: boolean;
}

interface ScheduleState {
  schedules: ScheduleItem[];
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>) => void;
  removeScheduleItem: (id: string) => void;
  toggleComplete: (id: string) => void;
}

export const useScheduleStore = create<ScheduleState>(
  sync(
    (set: (fn: (state: ScheduleState) => ScheduleState) => void) => {
      const initialState: ScheduleState = {
        schedules: [],
        
        addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => {
          set((state: ScheduleState) => ({
            ...state,
            schedules: [...state.schedules, { ...item, id: crypto.randomUUID() }]
          }));
        },

        updateScheduleItem: (id: string, updates: Partial<ScheduleItem>) => {
          set((state: ScheduleState) => ({
            ...state,
            schedules: state.schedules.map((item: ScheduleItem) =>
              item.id === id ? { ...item, ...updates } : item
            )
          }));
        },

        removeScheduleItem: (id: string) => {
          set((state: ScheduleState) => ({
            ...state,
            schedules: state.schedules.filter((item: ScheduleItem) => item.id !== id)
          }));
        },

        toggleComplete: (id: string) => {
          set((state: ScheduleState) => ({
            ...state,
            schedules: state.schedules.map((item: ScheduleItem) =>
              item.id === id ? { ...item, completed: !item.completed } : item
            )
          }));
        }
      };
      return initialState;
    },
    {
      docId: 'semsync-schedules',
      initTimeout: 30000,
      onInitError: (error: Error) => console.error('Schedule sync initialization error:', error)
    }
  )
); 