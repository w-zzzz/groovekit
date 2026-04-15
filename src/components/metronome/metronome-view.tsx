'use client';

import { Play, Square } from 'lucide-react';
import { useMetronome } from '@/hooks/use-metronome';
import { cn } from '@/lib/utils';
import type { Subdivision, TimeSignature } from '@/types';

const TIME_SIGNATURES: TimeSignature[] = [
  '2/4',
  '3/4',
  '4/4',
  '5/4',
  '6/8',
  '7/8',
];

const SUBDIVISIONS: { value: Subdivision; label: string }[] = [
  { value: 'quarter', label: 'Quarter' },
  { value: 'eighth', label: 'Eighth' },
  { value: 'sixteenth', label: 'Sixteenth' },
  { value: 'triplet', label: 'Triplet' },
];

/**
 * Metronome UI. Audio scheduling uses Tone.Transport via `useMetronome`
 * and `@/lib/audio/engine` (`getTransport`, `scheduleRepeat`, `Tone`).
 */
export function MetronomeView() {
  const m = useMetronome();

  return (
    <>
      <style>{`
        @keyframes metronome-beat-pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
          }
          35% {
            transform: scale(1.15);
            box-shadow: 0 0 48px 10px rgba(245, 158, 11, 0.45);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
          }
        }
      `}</style>

      <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Metronome
          </h1>
          <p className="text-sm text-muted-foreground">
            Practice with precise timing, accents, and optional speed-up.
          </p>
        </header>

        <section className="flex flex-col items-center gap-6">
          <div className="relative flex h-64 w-64 items-center justify-center">
            <div
              key={m.pulseTick}
              className={cn(
                'absolute inset-0 rounded-full border-2 border-accent/45 bg-card',
              )}
              style={{
                animation:
                  m.isPlaying && m.pulseTick > 0
                    ? 'metronome-beat-pulse 0.16s ease-out forwards'
                    : undefined,
              }}
              aria-hidden
            />
            <div className="relative z-10 flex flex-col items-center gap-1">
              <span
                className="text-5xl font-semibold tabular-nums text-accent"
                aria-live="polite"
                aria-atomic="true"
              >
                {m.currentBeat}
              </span>
              <span className="text-sm text-muted-foreground">Beat</span>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => m.togglePlay()}
                className={cn(
                  'inline-flex h-14 min-w-[8rem] items-center justify-center gap-2 rounded-lg px-6 text-base font-medium transition-colors',
                  m.isPlaying
                    ? 'bg-destructive text-white hover:opacity-90'
                    : 'bg-accent text-accent-foreground hover:opacity-90',
                )}
                aria-pressed={m.isPlaying}
              >
                {m.isPlaying ? (
                  <>
                    <Square className="h-5 w-5" aria-hidden />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" aria-hidden />
                    Play
                  </>
                )}
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline justify-between gap-4">
                <label
                  htmlFor="metronome-tempo"
                  className="text-sm font-medium text-foreground"
                >
                  Tempo
                </label>
                <span className="tabular-nums text-lg font-semibold text-accent">
                  {m.tempo}{' '}
                  <span className="text-sm font-normal text-muted-foreground">
                    BPM
                  </span>
                </span>
              </div>
              <input
                id="metronome-tempo"
                type="range"
                min={30}
                max={300}
                value={m.tempo}
                onChange={(e) =>
                  m.setTempo(
                    Math.min(300, Math.max(30, Number(e.target.value) || 30)),
                  )
                }
                className="accent-accent h-2 w-full cursor-pointer appearance-none rounded-full bg-muted"
              />
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => m.tapTempo()}
                  className="rounded-md border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80"
                >
                  Tap tempo
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <span className="text-sm font-medium text-foreground">
                  Time signature
                </span>
                <div className="flex flex-wrap gap-2">
                  {TIME_SIGNATURES.map((ts) => (
                    <button
                      key={ts}
                      type="button"
                      onClick={() => m.setTimeSignature(ts)}
                      className={cn(
                        'rounded-md border px-3 py-1.5 text-sm transition-colors',
                        m.timeSignature === ts
                          ? 'border-accent bg-muted text-accent'
                          : 'border-border bg-card text-foreground hover:bg-muted',
                      )}
                    >
                      {ts}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-foreground">
                  Subdivision
                </span>
                <div className="flex flex-wrap gap-2">
                  {SUBDIVISIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => m.setSubdivision(value)}
                      className={cn(
                        'rounded-md border px-3 py-1.5 text-sm transition-colors',
                        m.subdivision === value
                          ? 'border-accent bg-muted text-accent'
                          : 'border-border bg-card text-foreground hover:bg-muted',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-foreground">
                Accent pattern
              </span>
              <div
                className="flex flex-wrap items-center gap-2"
                role="group"
                aria-label="Accent per beat"
              >
                {m.accentPattern.map((on, i) => (
                  <button
                    key={`${m.beats}-${i}`}
                    type="button"
                    onClick={() => m.toggleAccent(i)}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium transition-colors',
                      on
                        ? 'border-accent bg-accent/15 text-accent'
                        : 'border-border bg-muted text-muted-foreground hover:text-foreground',
                    )}
                    aria-pressed={on}
                    aria-label={`Beat ${i + 1} accent ${on ? 'on' : 'off'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4">
              <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={m.speedUpEnabled}
                  onChange={(e) => m.setSpeedUpEnabled(e.target.checked)}
                  className="accent-accent h-4 w-4 rounded border-border"
                />
                Speed-up mode
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label
                    htmlFor="speed-up-inc"
                    className="text-xs text-muted-foreground"
                  >
                    BPM increment
                  </label>
                  <input
                    id="speed-up-inc"
                    type="number"
                    min={1}
                    max={50}
                    value={m.speedUpIncrement}
                    onChange={(e) =>
                      m.setSpeedUpIncrement(
                        Math.min(
                          50,
                          Math.max(1, Math.round(Number(e.target.value) || 1)),
                        ),
                      )
                    }
                    disabled={!m.speedUpEnabled}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground disabled:opacity-50"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="speed-up-bars"
                    className="text-xs text-muted-foreground"
                  >
                    Bars between increments
                  </label>
                  <input
                    id="speed-up-bars"
                    type="number"
                    min={1}
                    max={64}
                    value={m.speedUpBars}
                    onChange={(e) =>
                      m.setSpeedUpBars(
                        Math.min(
                          64,
                          Math.max(1, Math.round(Number(e.target.value) || 1)),
                        ),
                      )
                    }
                    disabled={!m.speedUpEnabled}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export {
  clearTransport,
  getTransport,
  scheduleRepeat,
  Tone,
} from '@/lib/audio/engine';
