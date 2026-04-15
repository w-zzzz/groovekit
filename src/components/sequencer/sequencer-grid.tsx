'use client';

import { useCallback, useRef } from 'react';
import type { DrumPiece, Velocity } from '@/types';
import { cn } from '@/lib/utils';

const LONG_PRESS_MS = 450;

const DOT_SIZE: Record<Velocity, string> = {
  ghost: 'h-1 w-1',
  normal: 'h-1.5 w-1.5',
  accent: 'h-2.5 w-2.5',
};

export interface SequencerGridProps {
  pieces: DrumPiece[];
  steps: number;
  grid: Record<DrumPiece, (Velocity | null)[]>;
  currentStep: number;
  isPlaying: boolean;
  onToggleStep: (piece: DrumPiece, step: number) => void;
  onCycleVelocity: (piece: DrumPiece, step: number) => void;
}

export function SequencerGrid({
  pieces,
  steps,
  grid,
  currentStep,
  isPlaying,
  onToggleStep,
  onCycleVelocity,
}: SequencerGridProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handlePointerDown = useCallback(
    (piece: DrumPiece, step: number) => {
      longPressTriggered.current = false;
      clearLongPressTimer();
      longPressTimer.current = setTimeout(() => {
        longPressTriggered.current = true;
        onCycleVelocity(piece, step);
        longPressTimer.current = null;
      }, LONG_PRESS_MS);
    },
    [clearLongPressTimer, onCycleVelocity]
  );

  const handlePointerUp = useCallback(() => {
    clearLongPressTimer();
  }, [clearLongPressTimer]);

  const handleCellClick = useCallback(
    (piece: DrumPiece, step: number) => {
      if (longPressTriggered.current) {
        longPressTriggered.current = false;
        return;
      }
      onToggleStep(piece, step);
    },
    [onToggleStep]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, piece: DrumPiece, step: number) => {
      e.preventDefault();
      onCycleVelocity(piece, step);
    },
    [onCycleVelocity]
  );

  return (
    <div className="min-w-0 flex-1 overflow-x-auto py-0.5 pr-2">
      <div className="flex min-w-0">
        {Array.from({ length: steps }, (_, step) => {
          const isPlayhead = isPlaying && currentStep === step;
          const beatStart = step % 4 === 0;

          return (
            <div
              key={step}
              className={cn(
                'flex shrink-0 flex-col',
                isPlayhead && 'bg-muted/30',
                beatStart && step > 0 && 'border-l-2 border-border'
              )}
            >
              <div
                className={cn(
                  'flex h-8 min-h-8 w-9 min-w-9 shrink-0 items-center justify-center text-[10px] font-mono text-muted-foreground',
                  isPlayhead && 'text-foreground'
                )}
              >
                {step + 1}
              </div>
              {pieces.map((piece) => {
                const vel = grid[piece][step];
                const active = vel !== null;

                return (
                  <button
                    key={`${piece}-${step}`}
                    type="button"
                    className={cn(
                      'relative m-0.5 flex size-8 min-h-8 min-w-8 shrink-0 items-center justify-center rounded border border-border transition-colors',
                      active
                        ? 'bg-amber-500/25 hover:bg-amber-500/35'
                        : 'bg-muted/40 hover:bg-muted/70',
                      isPlayhead && 'ring-1 ring-accent/40 ring-inset'
                    )}
                    aria-label={`${piece} step ${step + 1}${active ? ` ${vel}` : ' off'}`}
                    aria-pressed={active}
                    onClick={() => handleCellClick(piece, step)}
                    onContextMenu={(e) => handleContextMenu(e, piece, step)}
                    onPointerDown={() => handlePointerDown(piece, step)}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                  >
                    {active && vel && (
                      <span
                        className={cn(
                          'rounded-full bg-amber-400',
                          DOT_SIZE[vel]
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
