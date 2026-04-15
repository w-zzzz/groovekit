import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/audio/engine', () => ({
  ensureAudioStarted: vi.fn().mockResolvedValue(undefined),
  loadKit: vi.fn(),
  playDrum: vi.fn(),
}));

import { playDrum, ensureAudioStarted, loadKit } from '@/lib/audio/engine';
import { DrumPad } from '@/components/drum-pad/drum-pad';

describe('DrumPad', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders 9 drum pad buttons', () => {
    render(<DrumPad />);
    const group = screen.getByRole('group', { name: /drum pads/i });
    expect(within(group).getAllByRole('button')).toHaveLength(9);
  });

  it('shows the correct drum piece label on each pad', () => {
    render(<DrumPad />);
    const group = screen.getByRole('group', { name: /drum pads/i });
    const labels = [
      'Crash',
      'Tom Hi',
      'Ride',
      'HH Closed',
      'Snare',
      'HH Open',
      'Tom Mid',
      'Kick',
      'Tom Lo',
    ];
    for (const label of labels) {
      expect(within(group).getByRole('button', { name: new RegExp(label, 'i') })).toBeInTheDocument();
    }
  });

  it('shows keyboard shortcut hints on each pad', () => {
    render(<DrumPad />);
    const group = screen.getByRole('group', { name: /drum pads/i });
    const hints = ['Q', 'W', 'E', 'A', 'S', 'D', 'Z', 'X', 'C'];
    for (const key of hints) {
      expect(within(group).getByRole('button', { name: new RegExp(`^${key}`) })).toBeInTheDocument();
    }
  });

  it('exposes the kit field with a visible Kit label', () => {
    render(<DrumPad />);
    expect(screen.getByText('Kit')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /kit/i })).toBeInTheDocument();
  });

  it('loads the current kit on mount', () => {
    render(<DrumPad />);
    expect(loadKit).toHaveBeenCalledWith('acoustic');
  });

  it('renders the kit selector with 5 kit options', () => {
    render(<DrumPad />);
    const kitSelect = screen.getByRole('combobox', { name: /kit/i });
    const options = within(kitSelect).getAllByRole('option');
    expect(options).toHaveLength(5);
    expect(options.map((o) => o.getAttribute('value'))).toEqual([
      'acoustic',
      'electronic',
      '808',
      'jazz',
      'lofi',
    ]);
  });

  it("defaults the kit selector to 'acoustic'", () => {
    render(<DrumPad />);
    expect(screen.getByRole('combobox', { name: /kit/i })).toHaveValue('acoustic');
  });

  it('calls playDrum when a pad is clicked', async () => {
    render(<DrumPad />);
    fireEvent.click(screen.getByRole('button', { name: /kick/i }));
    await waitFor(() => {
      expect(ensureAudioStarted).toHaveBeenCalled();
      expect(playDrum).toHaveBeenCalledWith('kick');
    });
  });
});
