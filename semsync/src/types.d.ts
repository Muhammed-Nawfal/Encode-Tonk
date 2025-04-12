declare module '@tonk/keepsync' {
  export interface SyncEngineConfig {
    url: string;
    name: string;
    onSync?: (docId: string) => void;
    onError?: (error: Error) => void;
  }

  export function configureSyncEngine(config: SyncEngineConfig): void;
  export function sync<T>(
    store: (set: (fn: (state: T) => T) => void) => T,
    config: { docId: string; initTimeout?: number; onInitError?: (error: Error) => void }
  ): (set: (fn: (state: T) => T) => void) => T;
}

declare module 'zustand' {
  export interface StoreApi<T> {
    getState: () => T;
    setState: (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: boolean) => void;
    subscribe: (listener: (state: T, prevState: T) => void) => () => void;
    destroy: () => void;
  }

  export type StateCreator<T> = (
    set: (fn: (state: T) => T) => void,
    get: () => T,
    api: StoreApi<T>
  ) => T;

  export function create<T>(initializer: StateCreator<T>): (selector?: (state: T) => unknown) => T;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
} 