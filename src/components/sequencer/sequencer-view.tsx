'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSequencerStore } from '@/stores/sequencer-store';
import {
  clearTransport,
  ensureAudioStarted,
  getTransport,
  playDrum,
} from '@/lib/audio/engine';
import type { DrumPiece, Velocity } from '@/types';
import { DRUM_PIECE_LABELS } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SequencerGrid } from '@/components/sequencer/sequencer-grid';

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

function nextVelocity(current: Velocity | null): Velocity {
  if (current === null) return 'ghost';
  if (current === 'ghost') return 'normal';
  if (current === 'normal') return 'accent';
  return 'ghost';
}

export function SequencerView() {
  const steps = useSequencerStore((s) => s.steps);
  const tempo = useSequencerStore((s) => s.tempo);
  const swing = useSequencerStore((s) => s.swing);
  const grid = useSequencerStore((s) => s.grid);
  const currentStep = useSequencerStore((s) => s.currentStep);
  const isPlaying = useSequencerStore((s) => s.isPlaying);
  const patterns = useSequencerStore((s) => s.patterns);

  const toggleStep = useSequencerStore((s) => s.toggleStep);
  const setStepVelocity = useSequencerStore((s) => s.setStepVelocity);
  const setTempo = useSequencerStore((s) => s.setTempo);
  const setSwing = useSequencerStore((s) => s.setSwing);
  const setSteps = useSequencerStore((s) => s.setSteps);
  const setPlaying = useSequencerStore((s) => s.setPlaying);
  const clearGrid = useSequencerStore((s) => s.clearGrid);
  const savePattern = useSequencerStore((s) => s.savePattern);
  const loadPattern = useSequencerStore((s) => s.loadPattern);
  const toShareableUrl = useSequencerStore((s) => s.toShareableUrl);
  const loadFromEncoded = useSequencerStore((s) => s.loadFromEncoded);

  const searchParams = useSearchParams();
  const sharedPatternParam = searchParams?.get('p') ?? null;

  const [copied, setCopied] = useState(false);
  const [loadValue, setLoadValue] = useState('');
  const [shareError, setShareError] = useState<string | null>(null);
  const [saveName, setSaveName] = useState('');
  const [saveOpen, setSaveOpen] = useState(false);
  const saveInputRef = useRef<HTMLInputElement | null>(null);
  const shareLinkRef = useRef<HTMLInputElement | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const handledShareParamRef = useRef<string | null>(null);

  const gridRef = useRef(grid);
  const stepsRef = useRef(steps);
  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { stepsRef.current = steps; }, [steps]);

  const handleCycleVelocity = useCallback(
    (piece: DrumPiece, step: number) => {
      const cur = useSequencerStore.getState().grid[piece][step];
      setStepVelocity(piece, step, nextVelocity(cur));
    },
    [setStepVelocity]
  );

  useEffect(() => {
    if (!isPlaying) {
      clearTransport();
      getTransport().stop();
      return;
    }

    let alive = true;
    let stepIndex = 0;

    const run = async () => {
      await ensureAudioStarted();
      if (!alive) return;

      clearTransport();
      const transport = getTransport();
      transport.bpm.value = tempo;
      transport.swing = swing;
      transport.swingSubdivision = '16n';

      const interval = steps === 16 ? '16n' : '32n';

      transport.scheduleRepeat(() => {
        const g = gridRef.current;
        const total = stepsRef.current;
        const idx = stepIndex % total;
        stepIndex += 1;

        useSequencerStore.getState().setCurrentStep(idx);

        for (const piece of SEQUENCER_PIECES) {
          const vel = g[piece][idx];
          if (vel) {
            playDrum(piece, vel);
          }
        }
      }, interval);

      transport.start();
    };

    void run();

    return () => {
      alive = false;
      clearTransport();
      getTransport().stop();
    };
  }, [isPlaying, tempo, swing, steps]);

  useEffect(() => {
    return () => {
      clearTransport();
      getTransport().stop();
    };
  }, []);

  useEffect(() => {
    if (!sharedPatternParam) return;
    if (handledShareParamRef.current === sharedPatternParam) return;
    handledShareParamRef.current = sharedPatternParam;
    loadFromEncoded(sharedPatternParam);
  }, [sharedPatternParam, loadFromEncoded]);

  useEffect(() => {
    if (!saveOpen) return;
    const id = window.setTimeout(() => saveInputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [saveOpen]);

  const handlePlayStop = useCallback(async () => {
    if (isPlaying) {
      clearTransport();
      getTransport().stop();
      setPlaying(false);
      return;
    }
    await ensureAudioStarted();
    setPlaying(true);
  }, [isPlaying, setPlaying]);

  const openSaveDialog = useCallback(() => {
    setSaveName('');
    setSaveOpen(true);
  }, []);

  const confirmSave = useCallback(() => {
    const trimmed = saveName.trim();
    if (!trimmed) return;
    savePattern(trimmed);
    setSaveOpen(false);
    setSaveName('');
  }, [saveName, savePattern]);

  const cancelSave = useCallback(() => {
    setSaveOpen(false);
    setSaveName('');
  }, []);

  const handleShare = useCallback(async () => {
    const url = toShareableUrl();
    setShareUrl(url);
    setShareError(null);
    const hasAsyncClipboard =
      typeof navigator !== 'undefined' &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function' &&
      window.isSecureContext;
    if (hasAsyncClipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
        return;
      } catch {
        // Fall through to the inline copy affordance.
      }
    }
    // Inline fallback: render a read-only input, select its contents, and let
    // the user copy with their system shortcut. This works on every browser,
    // including http:// LAN deploys where the Async Clipboard API is blocked.
    setShareError('Copy blocked — press Ctrl/Cmd+C to copy the link below.');
    window.requestAnimationFrame(() => {
      const el = shareLinkRef.current;
      if (el) {
        el.focus();
        el.select();
      }
    });
  }, [toShareableUrl]);

  const handleLoadChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      if (!id) return;
      loadPattern(id);
      setLoadValue('');
    },
    [loadPattern]
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 text-foreground md:p-6">
      <header className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end lg:gap-6">
          <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Tempo · {tempo} BPM</span>
            <input
              type="range"
              min={30}
              max={300}
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
              className="accent-accent w-full"
            />
          </label>

          <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-sm">
            <span className="text-muted-foreground">
              Swing · {Math.round(swing * 100)}%
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(swing * 100)}
              onChange={(e) => setSwing(Number(e.target.value) / 100)}
              className="accent-accent w-full"
            />
          </label>

          <div className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Steps</span>
            <div className="flex rounded-lg border border-border p-0.5">
              <button
                type="button"
                onClick={() => setSteps(16)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  steps === 16
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                16
              </button>
              <button
                type="button"
                onClick={() => setSteps(32)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  steps === 32
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                32
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void handlePlayStop()}>
              {isPlaying ? 'Stop' : 'Play'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (isPlaying) {
                  clearTransport();
                  getTransport().stop();
                  setPlaying(false);
                }
                clearGrid();
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      </header>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            Pattern
          </span>
          {saveOpen ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                confirmSave();
              }}
              className="flex flex-wrap items-center gap-2"
            >
              <label htmlFor="pattern-name" className="sr-only">
                Pattern name
              </label>
              <input
                id="pattern-name"
                ref={saveInputRef}
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') cancelSave();
                }}
                placeholder="Pattern name"
                maxLength={60}
                className="h-9 min-w-[10rem] rounded-lg border border-border bg-muted/30 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Button type="submit" size="sm" disabled={!saveName.trim()}>
                Save
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={cancelSave}>
                Cancel
              </Button>
            </form>
          ) : (
            <Button type="button" size="sm" onClick={openSaveDialog}>
              Save
            </Button>
          )}

          <div className="flex items-center gap-2">
            <label htmlFor="sequencer-load" className="sr-only">
              Load pattern
            </label>
            <select
              id="sequencer-load"
              value={loadValue}
              onChange={handleLoadChange}
              className="select-dark h-9 min-w-[10rem] rounded-lg border border-border bg-muted/30 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Load…</option>
              {patterns.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <Button type="button" size="sm" variant="secondary" onClick={() => void handleShare()}>
            {copied ? 'Copied' : 'Share URL'}
          </Button>
        </div>

        {shareUrl && (shareError || copied) && (
          <div
            className={cn(
              'flex flex-col gap-2 rounded-xl border p-3 text-sm sm:flex-row sm:items-center',
              shareError
                ? 'border-amber-500/40 bg-amber-950/20 text-amber-100'
                : 'border-emerald-500/30 bg-emerald-950/20 text-emerald-100'
            )}
            role="status"
            aria-live="polite"
          >
            <span className="flex-1">{shareError ?? 'Link copied to clipboard.'}</span>
            <label htmlFor="share-link" className="sr-only">
              Shareable link
            </label>
            <input
              id="share-link"
              ref={shareLinkRef}
              type="text"
              readOnly
              value={shareUrl}
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 rounded-md border border-border bg-background/40 px-2 py-1 text-xs text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        )}

        <div className="flex min-w-0 gap-0 rounded-lg border border-border bg-card">
          <div className="sticky left-0 z-10 flex shrink-0 flex-col border-r border-border bg-card py-0.5 pl-3 pr-2">
            <div className="h-8 shrink-0" aria-hidden />
            {SEQUENCER_PIECES.map((piece) => (
              <div
                key={piece}
                className="flex h-8 min-h-8 shrink-0 items-center text-xs font-medium text-muted-foreground"
              >
                {DRUM_PIECE_LABELS[piece]}
              </div>
            ))}
          </div>
          <SequencerGrid
            pieces={SEQUENCER_PIECES}
            steps={steps}
            grid={grid}
            currentStep={currentStep}
            isPlaying={isPlaying}
            onToggleStep={toggleStep}
            onCycleVelocity={handleCycleVelocity}
          />
        </div>
      </section>
    </div>
  );
}
