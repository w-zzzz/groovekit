import { create } from 'zustand';
import type { DrumPiece, Velocity, SequencerPattern } from '@/types';
import { DRUM_PIECES } from '@/types';

function createEmptyGrid(steps: number): Record<DrumPiece, (Velocity | null)[]> {
  const grid = {} as Record<DrumPiece, (Velocity | null)[]>;
  for (const piece of DRUM_PIECES) {
    grid[piece] = Array(steps).fill(null);
  }
  return grid;
}

interface SequencerState {
  steps: number;
  tempo: number;
  swing: number;
  grid: Record<DrumPiece, (Velocity | null)[]>;
  currentStep: number;
  isPlaying: boolean;
  patterns: SequencerPattern[];

  toggleStep: (piece: DrumPiece, step: number) => void;
  setStepVelocity: (piece: DrumPiece, step: number, vel: Velocity | null) => void;
  setTempo: (bpm: number) => void;
  setSwing: (swing: number) => void;
  setSteps: (steps: number) => void;
  setCurrentStep: (step: number) => void;
  setPlaying: (playing: boolean) => void;
  clearGrid: () => void;
  savePattern: (name: string) => void;
  loadPattern: (id: string) => void;
  toShareableUrl: () => string;
}

export const useSequencerStore = create<SequencerState>((set, get) => ({
  steps: 16,
  tempo: 120,
  swing: 0,
  grid: createEmptyGrid(16),
  currentStep: -1,
  isPlaying: false,
  patterns: [],

  toggleStep: (piece, step) => set((s) => {
    const row = [...s.grid[piece]];
    row[step] = row[step] ? null : 'normal';
    return { grid: { ...s.grid, [piece]: row } };
  }),

  setStepVelocity: (piece, step, vel) => set((s) => {
    const row = [...s.grid[piece]];
    row[step] = vel;
    return { grid: { ...s.grid, [piece]: row } };
  }),

  setTempo: (bpm) => set({ tempo: Math.max(30, Math.min(300, bpm)) }),
  setSwing: (swing) => set({ swing: Math.max(0, Math.min(1, swing)) }),

  setSteps: (steps) => set((s) => {
    const newGrid = {} as Record<DrumPiece, (Velocity | null)[]>;
    for (const piece of DRUM_PIECES) {
      const old = s.grid[piece];
      newGrid[piece] = Array(steps).fill(null).map((_, i) => old[i] ?? null);
    }
    return { steps, grid: newGrid };
  }),

  setCurrentStep: (step) => set({ currentStep: step }),
  setPlaying: (playing) => set({ isPlaying: playing, currentStep: playing ? 0 : -1 }),

  clearGrid: () => set((s) => ({ grid: createEmptyGrid(s.steps) })),

  savePattern: (name) => set((s) => {
    const pattern: SequencerPattern = {
      id: Date.now().toString(36),
      name,
      steps: s.steps,
      tempo: s.tempo,
      swing: s.swing,
      grid: JSON.parse(JSON.stringify(s.grid)),
    };
    return { patterns: [...s.patterns, pattern] };
  }),

  loadPattern: (id) => set((s) => {
    const pattern = s.patterns.find((p) => p.id === id);
    if (!pattern) return s;
    return {
      steps: pattern.steps,
      tempo: pattern.tempo,
      swing: pattern.swing,
      grid: JSON.parse(JSON.stringify(pattern.grid)),
    };
  }),

  toShareableUrl: () => {
    const s = get();
    const data = { s: s.steps, t: s.tempo, w: s.swing, g: s.grid };
    const encoded = btoa(JSON.stringify(data));
    return `${typeof window !== 'undefined' ? window.location.origin : ''}/sequencer?p=${encoded}`;
  },
}));
