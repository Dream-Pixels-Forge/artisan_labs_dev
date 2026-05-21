import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Screen, Sequence, VideoInfo } from '@/types';
import {
  saveSequenceToDB,
  deleteSequenceFromDB,
  clearAllSequencesFromDB,
  loadAllSequencesFromDB,
} from '@/lib/indexed-db';

interface AppState {
  // Navigation
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;

  // Sequences
  sequences: Sequence[];
  hydrateSequences: () => Promise<void>;
  addSequence: (sequence: Sequence) => void;
  removeSequence: (id: string) => void;
  renameSequence: (id: string, name: string) => void;
  clearSequences: () => void;

  // Current video
  currentVideo: VideoInfo | null;
  setCurrentVideo: (video: VideoInfo | null) => void;

  // Current sequence being worked on (from sequencer -> scroll trigger -> archive)
  currentSequence: Sequence | null;
  setCurrentSequence: (sequence: Sequence | null) => void;

  // Boot state
  isBooting: boolean;
  setBooting: (val: boolean) => void;

  // Sidebar — start collapsed so it never overlaps content
  sidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;

  // Extracted frame count (live during extraction)
  extractedCount: number;
  setExtractedCount: (val: number) => void;

  // Is extracting
  isExtracting: boolean;
  setIsExtracting: (val: boolean) => void;

  // Frame count for scroll trigger (from last extraction or video)
  lastSequenceFrameCount: number;
  setLastSequenceFrameCount: (val: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Navigation
      activeScreen: 'dashboard',
      setActiveScreen: (screen) => set({ activeScreen: screen }),

      // Sequences — NOT persisted in localStorage due to large frame data.
      // Now persisted using IndexedDB Blobs, keeping Zustand store synchronized.
      sequences: [],
      hydrateSequences: async () => {
        try {
          const loaded = await loadAllSequencesFromDB();
          // Deduplicate by ID to prevent duplicate key errors
          const seen = new Set<string>();
          const unique = loaded.filter((s) => {
            if (seen.has(s.id)) return false;
            seen.add(s.id);
            return true;
          });
          set({ sequences: unique });
        } catch (error) {
          console.error('[Store] Failed to hydrate sequences from IndexedDB:', error);
        }
      },
      addSequence: (sequence) => {
        set((state) => {
          // Prevent duplicate IDs
          if (state.sequences.some((s) => s.id === sequence.id)) {
            return state;
          }
          return { sequences: [...state.sequences, sequence] };
        });
        // Async save to IndexedDB
        saveSequenceToDB(sequence).catch((err) =>
          console.error('[Store] Failed to save sequence to IndexedDB:', err)
        );
      },
      removeSequence: (id) => {
        set((state) => {
          const target = state.sequences.find((s) => s.id === id);
          // Async delete from IndexedDB, passing frames for Object URL cleanup
          deleteSequenceFromDB(id, target?.frames).catch((err) =>
            console.error('[Store] Failed to delete sequence from IndexedDB:', err)
          );
          return { sequences: state.sequences.filter((s) => s.id !== id) };
        });
      },
      renameSequence: (id, name) => {
        set((state) => {
          const updated = state.sequences.map((s) =>
            s.id === id ? { ...s, name } : s
          );
          const target = updated.find((s) => s.id === id);
          if (target) {
            saveSequenceToDB(target).catch((err) =>
              console.error('[Store] Failed to save renamed sequence to IndexedDB:', err)
            );
          }
          return { sequences: updated };
        });
      },
      clearSequences: () => {
        set((state) => {
          // Async clear from IndexedDB, passing sequences for Object URL cleanup
          clearAllSequencesFromDB(state.sequences).catch((err) =>
            console.error('[Store] Failed to clear sequences from IndexedDB:', err)
          );
          return { sequences: [] };
        });
      },

      // Current video
      currentVideo: null,
      setCurrentVideo: (video) => set({ currentVideo: video }),

      // Current sequence being worked on
      currentSequence: null,
      setCurrentSequence: (sequence) => set({ currentSequence: sequence }),

      // Boot state — starts true, the BootSplash component handles the timer
      isBooting: true,
      setBooting: (val) => set({ isBooting: val }),

      // Sidebar — start collapsed so content is never blocked
      sidebarOpen: false,
      setSidebarOpen: (val) => set({ sidebarOpen: val }),

      // Extracted frame count (live during extraction)
      extractedCount: 0,
      setExtractedCount: (val) => set({ extractedCount: val }),

      // Is extracting
      isExtracting: false,
      setIsExtracting: (val) => set({ isExtracting: val }),

      // Frame count for scroll trigger
      lastSequenceFrameCount: 0,
      setLastSequenceFrameCount: (val) => set({ lastSequenceFrameCount: val }),
    }),
    {
      name: 'artisan-labs-store',
      // Persist only small metadata, not sequences with base64 frames
      partialize: (state) => ({
        activeScreen: state.activeScreen,
      }),
    }
  )
);

// ---------------------------------------------------------------------------
// Convenience helper: create a new Sequence with a generated ID
// ---------------------------------------------------------------------------
export function createSequenceId(): string {
  return uuidv4();
}
