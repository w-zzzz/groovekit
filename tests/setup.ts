import '@testing-library/jest-dom/vitest';

const store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
  get length() { return Object.keys(store).length; },
  key: (index: number) => Object.keys(store)[index] ?? null,
};
Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage, writable: true });

class MockAudioContext {
  createAnalyser() { return { connect: () => {}, fftSize: 0, frequencyBinCount: 0, getByteTimeDomainData: () => {} }; }
  createGain() { return { connect: () => {}, gain: { value: 1 } }; }
  createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { value: 0 } }; }
  resume() { return Promise.resolve(); }
  close() { return Promise.resolve(); }
  get currentTime() { return 0; }
  get destination() { return {}; }
}

Object.defineProperty(window, 'AudioContext', { value: MockAudioContext });
Object.defineProperty(window, 'webkitAudioContext', { value: MockAudioContext });

Object.defineProperty(window, 'matchMedia', {
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
