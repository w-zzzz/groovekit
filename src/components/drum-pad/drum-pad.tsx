'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ensureAudioStarted, loadKit, playDrum } from '@/lib/audio/engine';
import { cn } from '@/lib/utils';
import { useAudioStore } from '@/stores/audio-store';
import {
  DRUM_PIECE_LABELS,
  KEYBOARD_MAP,
  type DrumPiece,
  type KitName,
} from '@/types';
import { useKeyboard } from '@/hooks/use-keyboard';
import { WaveformVisualizer } from './waveform-visualizer';

/** Row-major order matching KEYBOARD_MAP layout: Q W E / A S D / Z X C */
const GRID_LAYOUT: DrumPiece[][] = [
  ['crash', 'tom-high', 'ride'],
  ['hihat-closed', 'snare', 'hihat-open'],
  ['tom-mid', 'kick', 'tom-low'],
];

const KITS: KitName[] = ['acoustic', 'electronic', '808', 'jazz', 'lofi'];

function buildPieceToKey(): Record<DrumPiece, string> {
  const map = {} as Record<DrumPiece, string>;
  for (const [key, piece] of Object.entries(KEYBOARD_MAP)) {
    map[piece as DrumPiece] = key.toUpperCase();
  }
  return map;
}

const PIECE_TO_KEY = buildPieceToKey();

export function DrumPad() {
  const currentKit = useAudioStore((s) => s.currentKit);
  const setKit = useAudioStore((s) => s.setKit);

  const [litPieces, setLitPieces] = useState<Set<DrumPiece>>(() => new Set());
  const [wavePulse, setWavePulse] = useState(false);
  const flashTimeouts = useRef<Map<DrumPiece, ReturnType<typeof setTimeout>>>(new Map());
  const waveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadKit(currentKit);
  }, [currentKit]);

  const triggerFlash = useCallback((piece: DrumPiece) => {
    const existing = flashTimeouts.current.get(piece);
    if (existing) clearTimeout(existing);

    setLitPieces((prev) => {
      const next = new Set(prev);
      next.add(piece);
      return next;
    });

    const id = setTimeout(() => {
      flashTimeouts.current.delete(piece);
      setLitPieces((prev) => {
        const next = new Set(prev);
        next.delete(piece);
        return next;
      });
    }, 160);

    flashTimeouts.current.set(piece, id);

    if (waveTimeoutRef.current) clearTimeout(waveTimeoutRef.current);
    setWavePulse(true);
    waveTimeoutRef.current = setTimeout(() => {
      setWavePulse(false);
      waveTimeoutRef.current = null;
    }, 200);
  }, []);

  const hitDrum = useCallback(
    async (piece: DrumPiece) => {
      await ensureAudioStarted();
      loadKit(useAudioStore.getState().currentKit);
      playDrum(piece);
      triggerFlash(piece);
    },
    [triggerFlash],
  );

  useKeyboard(hitDrum);

  useEffect(() => {
    const timeouts = flashTimeouts.current;
    const waveTimeout = waveTimeoutRef;
    return () => {
      timeouts.forEach(clearTimeout);
      timeouts.clear();
      if (waveTimeout.current) clearTimeout(waveTimeout.current);
    };
  }, []);

  const kitLabels = useMemo(
    () =>
      ({
        acoustic: 'Acoustic',
        electronic: 'Electronic',
        '808': '808',
        jazz: 'Jazz',
        lofi: 'Lofi',
      }) satisfies Record<KitName, string>,
    [],
  );

  const onKitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const kit = e.target.value as KitName;
    setKit(kit);
    loadKit(kit);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 p-4 bg-background">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex flex-col gap-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Kit</span>
          <select
            value={currentKit}
            onChange={onKitChange}
            className={cn(
              'select-dark rounded-lg border border-border bg-card px-3 py-2.5 text-foreground',
              'min-h-11 touch-manipulation cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-accent/60 focus:ring-offset-2 focus:ring-offset-background',
            )}
          >
            {KITS.map((kit) => (
              <option key={kit} value={kit}>
                {kitLabels[kit]}
              </option>
            ))}
          </select>
        </label>

        <div className="w-full sm:w-auto sm:min-w-[280px]">
          <WaveformVisualizer width={320} height={100} pulse={wavePulse} />
        </div>
      </div>

      <div
        className="grid grid-cols-3 gap-2 sm:gap-3 select-none"
        role="group"
        aria-label="Drum pads"
      >
        {GRID_LAYOUT.flatMap((row) =>
          row.map((piece) => {
            const isLit = litPieces.has(piece);
            const keyHint = PIECE_TO_KEY[piece];

            return (
              <button
                key={piece}
                type="button"
                onClick={() => void hitDrum(piece)}
                className={cn(
                  'relative flex min-h-[5.5rem] sm:min-h-28 flex-col items-center justify-center gap-1',
                  'rounded-xl border border-border bg-card px-2 py-3 text-center touch-manipulation',
                  'transition-[box-shadow,transform,border-color,background-color] duration-150 ease-out',
                  'active:scale-[0.98]',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  'hover:bg-muted/50',
                  isLit &&
                    'border-accent shadow-[0_0_0_2px_rgba(245,158,11,0.45),0_0_24px_rgba(245,158,11,0.35)] bg-accent/10',
                )}
              >
                <span
                  className={cn(
                    'text-[10px] font-semibold uppercase tracking-wider sm:text-xs',
                    isLit ? 'text-accent' : 'text-muted-foreground',
                  )}
                >
                  {keyHint}
                </span>
                <span
                  className={cn(
                    'text-sm font-semibold leading-tight sm:text-base',
                    isLit ? 'text-accent' : 'text-foreground',
                  )}
                >
                  {DRUM_PIECE_LABELS[piece]}
                </span>
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
