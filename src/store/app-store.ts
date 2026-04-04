import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Screen, Sequence, VideoInfo } from '@/types';

interface AppState {
  // Navigation
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;

  // Sequences
  sequences: Sequence[];
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

      // Sequences — persisted to localStorage
      sequences: [],
      addSequence: (sequence) =>
        set((state) => ({
          sequences: [...state.sequences, sequence],
        })),
      removeSequence: (id) =>
        set((state) => ({
          sequences: state.sequences.filter((s) => s.id !== id),
        })),
      renameSequence: (id, name) =>
        set((state) => ({
          sequences: state.sequences.map((s) =>
            s.id === id ? { ...s, name } : s
          ),
        })),
      clearSequences: () => set({ sequences: [] }),

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
      // Only persist sequences to avoid bloating localStorage with
      // transient state such as currentVideo URLs, boot flags, etc.
      partialize: (state) => ({
        sequences: state.sequences,
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
