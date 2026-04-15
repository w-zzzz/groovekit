import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  volume: number;
  showKeyboardHints: boolean;
  metronomeSound: 'click' | 'wood' | 'beep';
  setVolume: (vol: number) => void;
  toggleKeyboardHints: () => void;
  setMetronomeSound: (sound: 'click' | 'wood' | 'beep') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      volume: 0.8,
      showKeyboardHints: true,
      metronomeSound: 'click',
      setVolume: (vol) => set({ volume: Math.max(0, Math.min(1, vol)) }),
      toggleKeyboardHints: () => set((s) => ({ showKeyboardHints: !s.showKeyboardHints })),
      setMetronomeSound: (sound) => set({ metronomeSound: sound }),
    }),
    { name: 'groovekit-settings' }
  )
);
