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

// Unicode-safe, URL-safe base64 so shared patterns round-trip through email
// clients, chat apps, and browsers that may percent-encode `+` and `/`.
function encodeBase64Url(input: string): string {
  if (typeof window === 'undefined') return '';
  const utf8 = new TextEncoder().encode(input);
  let binary = '';
  for (const byte of utf8) binary += String.fromCharCode(byte);
  return window
    .btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function decodeBase64Url(input: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    let s = input.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4 !== 0) s += '=';
    const binary = window.atob(s);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

function sanitizeLoadedGrid(
  raw: unknown,
  steps: number,
): Record<DrumPiece, (Velocity | null)[]> | null {
  if (!raw || typeof raw !== 'object') return null;
  const src = raw as Record<string, unknown>;
  const out = createEmptyGrid(steps);
  for (const piece of DRUM_PIECES) {
    const row = src[piece];
    if (!Array.isArray(row)) continue;
    for (let i = 0; i < Math.min(steps, row.length); i++) {
      const cell = row[i];
      if (cell === 'ghost' || cell === 'normal' || cell === 'accent') {
        out[piece][i] = cell;
      } else {
        out[piece][i] = null;
      }
    }
  }
  return out;
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
  loadFromEncoded: (encoded: string) => boolean;
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
    const encoded = encodeBase64Url(JSON.stringify(data));
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/sequencer?p=${encoded}`;
  },

  loadFromEncoded: (encoded) => {
    const json = decodeBase64Url(encoded);
    if (!json) return false;
    let data: unknown;
    try {
      data = JSON.parse(json);
    } catch {
      return false;
    }
    if (!data || typeof data !== 'object') return false;
    const d = data as { s?: unknown; t?: unknown; w?: unknown; g?: unknown };
    const steps = d.s === 32 ? 32 : 16;
    const tempo =
      typeof d.t === 'number' && Number.isFinite(d.t)
        ? Math.max(30, Math.min(300, d.t))
        : 120;
    const swing =
      typeof d.w === 'number' && Number.isFinite(d.w)
        ? Math.max(0, Math.min(1, d.w))
        : 0;
    const grid = sanitizeLoadedGrid(d.g, steps);
    if (!grid) return false;
    set({ steps, tempo, swing, grid, currentStep: -1, isPlaying: false });
    return true;
  },
}));
