import { create } from 'zustand';
import type { KitName, DrumHit } from '@/types';

interface AudioState {
  currentKit: KitName;
  volume: number;
  isPlaying: boolean;
  recording: DrumHit[];
  isRecording: boolean;
  setKit: (kit: KitName) => void;
  setVolume: (vol: number) => void;
  setPlaying: (playing: boolean) => void;
  startRecording: () => void;
  stopRecording: () => DrumHit[];
  addHit: (hit: DrumHit) => void;
  clearRecording: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  currentKit: 'acoustic',
  volume: 0.8,
  isPlaying: false,
  recording: [],
  isRecording: false,
  setKit: (kit) => set({ currentKit: kit }),
  setVolume: (vol) => set({ volume: Math.max(0, Math.min(1, vol)) }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  startRecording: () => set({ isRecording: true, recording: [] }),
  stopRecording: () => {
    const recording = get().recording;
    set({ isRecording: false });
    return recording;
  },
  addHit: (hit) => set((s) => ({ recording: [...s.recording, hit] })),
  clearRecording: () => set({ recording: [], isRecording: false }),
}));
