import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/audio/engine', () => {
  const transport = {
    stop: vi.fn(),
    start: vi.fn(),
    bpm: { value: 120 },
    swing: 0,
    swingSubdivision: '16n',
    scheduleRepeat: vi.fn(() => 1),
    cancel: vi.fn(),
    clear: vi.fn(),
  };
  return {
    ensureAudioStarted: vi.fn().mockResolvedValue(undefined),
    getTransport: vi.fn(() => transport),
    scheduleRepeat: vi.fn(() => 1),
    clearTransport: vi.fn(() => {
      transport.cancel();
      transport.stop();
    }),
    loadKit: vi.fn(),
    playDrum: vi.fn(),
    Tone: {
      getContext: () => ({ state: 'running' }),
      start: vi.fn().mockResolvedValue(undefined),
      getTransport: () => transport,
      now: () => 0,
      Synth: class MockSynth {
        toDestination() {
          return this;
        }
        dispose() {}
        triggerAttackRelease() {}
      },
      Draw: {
        schedule: (fn: () => void) => {
          fn();
        },
      },
    },
  };
});

import { MetronomeView } from '@/components/metronome/metronome-view';

describe('MetronomeView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the tempo value and BPM label', () => {
    render(<MetronomeView />);
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('BPM')).toBeInTheDocument();
  });

  it('renders all six time signature controls', () => {
    render(<MetronomeView />);
    for (const ts of ['2/4', '3/4', '4/4', '5/4', '6/8', '7/8']) {
      expect(screen.getByRole('button', { name: ts })).toBeInTheDocument();
    }
  });

  it('renders all four subdivision controls', () => {
    render(<MetronomeView />);
    for (const label of ['Quarter', 'Eighth', 'Sixteenth', 'Triplet']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    }
  });

  it('renders the play / stop control', () => {
    render(<MetronomeView />);
    expect(screen.getByRole('button', { name: /^play$/i })).toBeInTheDocument();
  });

  it('renders accent pattern beat toggles inside the accent group', () => {
    render(<MetronomeView />);
    const accentGroup = screen.getByRole('group', { name: /accent per beat/i });
    const beatButtons = within(accentGroup).getAllByRole('button');
    expect(beatButtons.length).toBeGreaterThanOrEqual(1);
    for (const btn of beatButtons) {
      expect(btn).toHaveAttribute('aria-pressed');
    }
  });
});
