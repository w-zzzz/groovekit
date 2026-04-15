import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/audio/engine', () => {
  const transport = {
    stop: vi.fn(),
    start: vi.fn(),
    bpm: { value: 120 },
    swing: 0,
    swingSubdivision: '16n',
    scheduleRepeat: vi.fn(),
    cancel: vi.fn(),
    clear: vi.fn(),
  };
  return {
    clearTransport: vi.fn(),
    ensureAudioStarted: vi.fn().mockResolvedValue(undefined),
    getTransport: vi.fn(() => transport),
    playDrum: vi.fn(),
    loadKit: vi.fn(),
  };
});

import type { DrumPiece, Velocity } from '@/types';
import { DRUM_PIECES } from '@/types';
import { SequencerGrid } from '@/components/sequencer/sequencer-grid';
import { SequencerView } from '@/components/sequencer/sequencer-view';

const SEQUENCER_PIECES: DrumPiece[] = [
  'kick',
  'snare',
  'hihat-closed',
  'hihat-open',
  'tom-high',
  'tom-mid',
  'tom-low',
  'crash',
];

function emptyGrid(steps: number): Record<DrumPiece, (Velocity | null)[]> {
  return Object.fromEntries(DRUM_PIECES.map((p) => [p, Array(steps).fill(null)])) as Record<
    DrumPiece,
    (Velocity | null)[]
  >;
}

describe('Sequencer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders 128 sequencer cells (8 pieces × 16 steps)', () => {
    const noop = () => {};
    render(
      <SequencerGrid
        pieces={SEQUENCER_PIECES}
        steps={16}
        grid={emptyGrid(16)}
        currentStep={-1}
        isPlaying={false}
        onToggleStep={noop}
        onCycleVelocity={noop}
      />
    );
    expect(screen.getAllByRole('button')).toHaveLength(128);
  });

  it('displays step numbers 1–16 in the grid header row', () => {
    const noop = () => {};
    render(
      <SequencerGrid
        pieces={SEQUENCER_PIECES}
        steps={16}
        grid={emptyGrid(16)}
        currentStep={-1}
        isPlaying={false}
        onToggleStep={noop}
        onCycleVelocity={noop}
      />
    );
    for (let step = 1; step <= 16; step++) {
      expect(screen.getByText(String(step))).toBeInTheDocument();
    }
  });

  it('renders Play / Stop control', () => {
    render(<SequencerView />);
    expect(screen.getByRole('button', { name: /^play$/i })).toBeInTheDocument();
  });

  it('renders the tempo slider with the default store tempo (120 BPM)', () => {
    render(<SequencerView />);
    const tempoLabel = screen.getByText(/tempo · 120 bpm/i);
    const tempoSlider = within(tempoLabel.closest('label')!).getByRole('slider');
    expect(tempoSlider).toHaveValue('120');
  });

  it('renders a Clear control in the transport bar', () => {
    render(<SequencerView />);
    expect(screen.getByRole('button', { name: /^clear$/i })).toBeInTheDocument();
  });

  it('renders a pattern Save button', () => {
    render(<SequencerView />);
    expect(screen.getByRole('button', { name: /^save$/i })).toBeInTheDocument();
  });
});
