'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { DrumPiece, TimingGrade } from '@/types';
import { DRUM_PIECE_LABELS, KEYBOARD_MAP } from '@/types';
import { calculateAccuracy, gradeTimingAccuracy, timingScore } from '@/lib/timing/calculator';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/stores/progress-store';

type GamePhase = 'idle' | 'countdown' | 'playing' | 'results';
type Difficulty = 'easy' | 'medium' | 'hard';

const LANES: Record<Difficulty, DrumPiece[]> = {
  easy: ['kick', 'snare'],
  medium: ['kick', 'snare', 'hihat-closed'],
  hard: ['crash', 'tom-high', 'hihat-closed', 'snare', 'kick'],
};

const MISS_LATE_MS = 110;
const INPUT_WINDOW_MS = 120;

function pieceKeyLabel(piece: DrumPiece): string {
  const pair = Object.entries(KEYBOARD_MAP).find(([, p]) => p === piece);
  return pair ? pair[0].toUpperCase() : '?';
}

interface GameNote {
  id: string;
  piece: DrumPiece;
  laneIndex: number;
  hitTimeMs: number;
  resolved: boolean;
  grade?: TimingGrade;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  bpm: number;
  buildHits: () => { hitTimeMs: number; piece: DrumPiece }[];
}

function sixteenthMs(bpm: number) {
  return (60000 / bpm) * 0.25;
}

function rockBarHits(barIndex: number, bpm: number): { hitTimeMs: number; piece: DrumPiece }[] {
  const s = sixteenthMs(bpm);
  const base = barIndex * 16 * s;
  return [
    { hitTimeMs: base + 0 * s, piece: 'kick' as DrumPiece },
    { hitTimeMs: base + 4 * s, piece: 'snare' as DrumPiece },
    { hitTimeMs: base + 8 * s, piece: 'kick' as DrumPiece },
    { hitTimeMs: base + 12 * s, piece: 'snare' as DrumPiece },
  ];
}

function mediumBarHits(barIndex: number, bpm: number): { hitTimeMs: number; piece: DrumPiece }[] {
  const s = sixteenthMs(bpm);
  const base = barIndex * 16 * s;
  const hits: { hitTimeMs: number; piece: DrumPiece }[] = [];
  for (let step = 0; step < 16; step += 2) {
    hits.push({ hitTimeMs: base + step * s, piece: 'hihat-closed' });
  }
  hits.push(
    { hitTimeMs: base + 0 * s, piece: 'kick' },
    { hitTimeMs: base + 4 * s, piece: 'snare' },
    { hitTimeMs: base + 8 * s, piece: 'kick' },
    { hitTimeMs: base + 12 * s, piece: 'snare' }
  );
  return hits;
}

function hardBarHits(barIndex: number, bpm: number): { hitTimeMs: number; piece: DrumPiece }[] {
  const s = sixteenthMs(bpm);
  const base = barIndex * 16 * s;
  const hits: { hitTimeMs: number; piece: DrumPiece }[] = [];
  for (let step = 0; step < 16; step++) {
    const t = base + step * s;
    if (step % 2 === 0) hits.push({ hitTimeMs: t, piece: 'hihat-closed' });
    if (step % 4 === 0) hits.push({ hitTimeMs: t, piece: 'kick' });
    if (step % 4 === 2) hits.push({ hitTimeMs: t, piece: 'snare' });
    if (step === 6 || step === 14) hits.push({ hitTimeMs: t, piece: 'tom-high' });
    if (step === 0 && barIndex % 2 === 0) hits.push({ hitTimeMs: t, piece: 'crash' });
  }
  return hits;
}

const CHALLENGES: Challenge[] = [
  {
    id: 'challenge-backbeat',
    name: 'Backbeat Basics',
    description: 'Four bars of classic kick and snare.',
    bpm: 92,
    buildHits: () => {
      const bpm = 92;
      const out: { hitTimeMs: number; piece: DrumPiece }[] = [];
      for (let b = 0; b < 4; b++) out.push(...rockBarHits(b, bpm));
      return out.sort((a, b) => a.hitTimeMs - b.hitTimeMs);
    },
  },
  {
    id: 'challenge-hat-drive',
    name: 'Hat Drive',
    description: 'Six bars with steady hi-hats and backbeat.',
    bpm: 100,
    buildHits: () => {
      const bpm = 100;
      const out: { hitTimeMs: number; piece: DrumPiece }[] = [];
      for (let b = 0; b < 6; b++) out.push(...mediumBarHits(b, bpm));
      return out.sort((a, b) => a.hitTimeMs - b.hitTimeMs);
    },
  },
  {
    id: 'challenge-full-kit',
    name: 'Full Kit Rush',
    description: 'Eight bars across the whole kit — stay relaxed.',
    bpm: 108,
    buildHits: () => {
      const bpm = 108;
      const out: { hitTimeMs: number; piece: DrumPiece }[] = [];
      for (let b = 0; b < 8; b++) out.push(...hardBarHits(b, bpm));
      return out.sort((a, b) => a.hitTimeMs - b.hitTimeMs);
    },
  },
];

function buildGameNotes(challenge: Challenge, lanes: DrumPiece[]): GameNote[] {
  const laneIndex = (piece: DrumPiece) => lanes.indexOf(piece);
  return challenge
    .buildHits()
    .map((h, i) => {
      const li = laneIndex(h.piece);
      if (li < 0) return null;
      return {
        id: `${challenge.id}-${i}-${h.hitTimeMs}`,
        piece: h.piece,
        laneIndex: li,
        hitTimeMs: h.hitTimeMs,
        resolved: false,
      };
    })
    .filter((n): n is GameNote => n !== null);
}

function gradeLabel(g: TimingGrade): string {
  switch (g) {
    case 'perfect':
      return 'Perfect!';
    case 'great':
      return 'Great';
    case 'good':
      return 'Good';
    case 'miss':
      return 'Miss';
  }
}

export function RhythmGameView({ className }: { className?: string }) {
  const recordGame = useProgressStore((s) => s.recordGame);

  const [phase, setPhase] = useState<GamePhase>('idle');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [countdownTick, setCountdownTick] = useState(3);

  const [notes, setNotes] = useState<GameNote[]>([]);
  const notesRef = useRef<GameNote[]>([]);
  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  const [songTimeMs, setSongTimeMs] = useState(0);

  const [grades, setGrades] = useState<TimingGrade[]>([]);

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [popup, setPopup] = useState<{ grade: TimingGrade; at: number } | null>(null);
  const [resultsAccuracy, setResultsAccuracy] = useState(0);
  const [resultsScore, setResultsScore] = useState(0);
  const [resultsBreakdown, setResultsBreakdown] = useState<Record<TimingGrade, number>>({
    perfect: 0,
    great: 0,
    good: 0,
    miss: 0,
  });

  const playStartRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const recordedRef = useRef(false);
  const comboRef = useRef(0);
  const challengeRef = useRef(CHALLENGES[0]);

  const lanes = LANES[difficulty];

  const [boardLayout, setBoardLayout] = useState({ hitY: 320, ppm: 0.18 });

  const accuracy = useMemo(() => calculateAccuracy(grades), [grades]);

  const stopLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const layoutBoard = useCallback(() => {
    const el = boardRef.current;
    if (!el) return;
    const h = el.clientHeight;
    const hitY = Math.max(120, h * 0.82);
    const ppm = (hitY - 32) / 1600;
    setBoardLayout({ hitY, ppm });
  }, []);

  const pushGrade = useCallback((g: TimingGrade) => {
    setGrades((prev) => [...prev, g]);
    setScore((s) => s + timingScore(g));
    if (g === 'miss') {
      comboRef.current = 0;
      setCombo(0);
    } else {
      comboRef.current += 1;
      setCombo(comboRef.current);
      setMaxCombo((m) => Math.max(m, comboRef.current));
    }
    setPopup({ grade: g, at: performance.now() });
  }, []);

  const finishToResults = useCallback(
    (finalGrades: TimingGrade[]) => {
      stopLoop();
      playStartRef.current = null;
      const acc = calculateAccuracy(finalGrades);
      const totalScore = finalGrades.reduce((s, g) => s + timingScore(g), 0);
      const breakdown: Record<TimingGrade, number> = { perfect: 0, great: 0, good: 0, miss: 0 };
      for (const x of finalGrades) breakdown[x]++;
      setResultsAccuracy(acc);
      setResultsScore(totalScore);
      setResultsBreakdown(breakdown);
      setPhase('results');
    },
    [stopLoop]
  );

  const gameLoop = useRef<() => void>(() => {});

  gameLoop.current = () => {
    const start = playStartRef.current;
    if (start == null) return;

    const now = performance.now();
    const t = now - start;
    setSongTimeMs(t);

    const noteList = notesRef.current;
    let mutated = false;
    let missCount = 0;
    const nextNotes = noteList.map((n) => {
      if (n.resolved) return n;
      if (t > n.hitTimeMs + MISS_LATE_MS) {
        mutated = true;
        missCount++;
        return { ...n, resolved: true, grade: 'miss' as TimingGrade };
      }
      return n;
    });

    if (mutated) {
      notesRef.current = nextNotes;
      setNotes(nextNotes);
      if (missCount > 0) {
        setGrades((prev) => [...prev, ...Array.from({ length: missCount }, (): TimingGrade => 'miss')]);
        comboRef.current = 0;
        setCombo(0);
        setPopup({ grade: 'miss', at: performance.now() });
      }
    }

    const resolvedAll = nextNotes.every((n) => n.resolved);
    const lastHit = nextNotes.length ? Math.max(...nextNotes.map((n) => n.hitTimeMs)) : 0;
    if (resolvedAll && t > lastHit + MISS_LATE_MS + 250) {
      const chronological = [...nextNotes].sort((a, b) => a.hitTimeMs - b.hitTimeMs);
      const gList = chronological.map((n) => n.grade!);
      finishToResults(gList);
      return;
    }

    rafRef.current = requestAnimationFrame(() => gameLoop.current());
  };

  useLayoutEffect(() => {
    if (phase !== 'countdown' && phase !== 'playing') return;
    layoutBoard();
  }, [phase, countdownTick, layoutBoard]);

  useEffect(() => {
    if (phase !== 'playing') return;
    playStartRef.current = performance.now();
    rafRef.current = requestAnimationFrame(() => gameLoop.current());
    return () => stopLoop();
  }, [phase, stopLoop]);

  useEffect(() => {
    if (!popup) return;
    const t = window.setTimeout(() => setPopup(null), 420);
    return () => window.clearTimeout(t);
  }, [popup]);

  useEffect(() => {
    if (phase !== 'results') return;
    if (recordedRef.current) return;
    recordedRef.current = true;
    recordGame(challengeRef.current.id, resultsAccuracy);
  }, [phase, resultsAccuracy, recordGame]);

  const startCountdown = useCallback(() => {
    recordedRef.current = false;
    challengeRef.current = CHALLENGES[challengeIndex];
    const built = buildGameNotes(CHALLENGES[challengeIndex], LANES[difficulty]);
    notesRef.current = built;
    setNotes(built);
    setGrades([]);
    setScore(0);
    comboRef.current = 0;
    setCombo(0);
    setMaxCombo(0);
    setSongTimeMs(0);
    setCountdownTick(3);
    setPhase('countdown');
  }, [challengeIndex, difficulty]);

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdownTick < 0) {
      setPhase('playing');
      return;
    }
    if (countdownTick === 0) {
      const t = window.setTimeout(() => setCountdownTick(-1), 500);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setCountdownTick((c) => c - 1), 700);
    return () => window.clearTimeout(t);
  }, [phase, countdownTick]);

  const tryHitLane = useCallback(
    (laneIdx: number) => {
      if (phase !== 'playing') return false;
      if (laneIdx < 0 || laneIdx >= lanes.length) return false;
      const start = playStartRef.current;
      if (start == null) return false;
      const pressT = performance.now() - start;

      const list = notesRef.current;
      const candidates = list.filter(
        (n) =>
          !n.resolved &&
          n.laneIndex === laneIdx &&
          Math.abs(pressT - n.hitTimeMs) <= INPUT_WINDOW_MS,
      );
      if (!candidates.length) return false;

      const target = candidates.reduce((best, n) =>
        Math.abs(pressT - n.hitTimeMs) < Math.abs(pressT - best.hitTimeMs) ? n : best,
      );

      const offset = pressT - target.hitTimeMs;
      const g = gradeTimingAccuracy(offset);
      if (g === 'miss') return false;

      const graded: GameNote = { ...target, resolved: true, grade: g };
      const next = list.map((n) => (n.id === target.id ? graded : n));
      notesRef.current = next;
      setNotes(next);
      pushGrade(g);
      return true;
    },
    [phase, lanes, pushGrade],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (phase !== 'playing' || e.repeat) return;
      const key = e.key.toLowerCase();
      const piece = KEYBOARD_MAP[key];
      if (!piece) return;
      const laneIdx = lanes.indexOf(piece);
      if (laneIdx < 0) return;
      if (tryHitLane(laneIdx)) e.preventDefault();
    },
    [phase, lanes, tryHitLane],
  );

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  useEffect(() => {
    const onResize = () => layoutBoard();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [layoutBoard]);

  const laneWidthPct = 100 / lanes.length;
  const { hitY, ppm } = boardLayout;

  return (
    <div
      className={cn(
        'mx-auto flex max-w-3xl flex-col gap-6 rounded-2xl border border-zinc-800 bg-zinc-950/90 p-6 text-zinc-100 shadow-xl shadow-black/40',
        className
      )}
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Rhythm challenge</h2>
          <p className="text-sm text-zinc-400">Press the keys or tap a lane when notes cross the line.</p>
        </div>
        <div className="flex gap-6 text-sm tabular-nums">
          <div>
            <p className="text-zinc-500">Score</p>
            <p className="text-lg font-semibold text-amber-400">{score}</p>
          </div>
          <div>
            <p className="text-zinc-500">Accuracy</p>
            <p className="text-lg font-semibold text-zinc-100">{accuracy}%</p>
          </div>
          <div>
            <p className="text-zinc-500">Combo</p>
            <p className="text-lg font-semibold text-emerald-400">{combo}</p>
          </div>
        </div>
      </header>

      {phase === 'idle' && (
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Difficulty</p>
            <div className="flex flex-wrap gap-2">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    'rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors',
                    difficulty === d
                      ? 'border-amber-500/60 bg-amber-950/40 text-amber-100'
                      : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500'
                  )}
                >
                  {d === 'easy' && 'Easy — 2 lanes'}
                  {d === 'medium' && 'Medium — 3 lanes'}
                  {d === 'hard' && 'Hard — 5 lanes'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Challenge</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {CHALLENGES.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setChallengeIndex(i)}
                  className={cn(
                    'rounded-xl border p-4 text-left text-sm transition-colors',
                    challengeIndex === i
                      ? 'border-amber-500/50 bg-amber-950/30'
                      : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-600'
                  )}
                >
                  <p className="font-semibold text-zinc-100">{c.name}</p>
                  <p className="mt-1 text-xs text-zinc-500">{c.description}</p>
                  <p className="mt-2 text-xs tabular-nums text-amber-400/90">{c.bpm} BPM</p>
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={startCountdown}
            className="w-full rounded-xl bg-amber-500 py-3 text-center text-sm font-semibold text-zinc-950 transition hover:bg-amber-400"
          >
            Start
          </button>
        </div>
      )}

      {(phase === 'countdown' || phase === 'playing') && (
        <div className="relative">
          {phase === 'countdown' && countdownTick > 0 && (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-black/55 text-6xl font-bold text-amber-400">
              {countdownTick}
            </div>
          )}
          {phase === 'countdown' && countdownTick === 0 && (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-black/40 text-4xl font-bold text-emerald-400">
              Go!
            </div>
          )}

          {popup && phase === 'playing' && (
            <div
              className={cn(
                'pointer-events-none absolute left-1/2 top-8 z-10 -translate-x-1/2 rounded-full px-4 py-1 text-sm font-bold shadow-lg',
                popup.grade === 'perfect' && 'bg-amber-400 text-zinc-950',
                popup.grade === 'great' && 'bg-emerald-500 text-white',
                popup.grade === 'good' && 'bg-sky-600 text-white',
                popup.grade === 'miss' && 'bg-zinc-700 text-zinc-200'
              )}
            >
              {gradeLabel(popup.grade)}
            </div>
          )}

          <div
            ref={boardRef}
            className="relative h-[min(52vh,420px)] w-full overflow-hidden rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950"
          >
            <div
              className="pointer-events-none absolute inset-x-0 border-b-2 border-amber-400/90 shadow-[0_0_20px_rgba(251,191,36,0.25)]"
              style={{ top: hitY }}
            />

            <div className="absolute inset-x-0 bottom-0 top-0 flex">
              {lanes.map((piece, laneIdx) => (
                <div
                  key={piece}
                  className="relative border-r border-zinc-800/80 last:border-r-0"
                  style={{ width: `${laneWidthPct}%` }}
                >
                  {notes
                    .filter((n) => n.laneIndex === laneIdx)
                    .map((n) => {
                      const y = hitY - (n.hitTimeMs - songTimeMs) * ppm;
                      if (n.resolved && n.grade && n.grade !== 'miss') {
                        return null;
                      }
                      return (
                        <div
                          key={n.id}
                          className={cn(
                            'absolute left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border-2 shadow-md',
                            n.resolved && n.grade === 'miss'
                              ? 'border-zinc-600 bg-zinc-800/40 opacity-40'
                              : 'border-amber-400/70 bg-amber-500/25'
                          )}
                          style={{ top: y, transform: 'translate(-50%, -50%)' }}
                        />
                      );
                    })}
                </div>
              ))}
            </div>

            <div className="absolute inset-x-0 bottom-0 flex border-t border-zinc-800 bg-zinc-950/95">
              {lanes.map((piece, laneIdx) => (
                <button
                  key={piece}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    tryHitLane(laneIdx);
                  }}
                  aria-label={`Hit ${DRUM_PIECE_LABELS[piece]} lane`}
                  className="flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 border-r border-zinc-800/80 px-1 py-2 text-center last:border-r-0 transition-colors hover:bg-zinc-900/60 active:bg-amber-500/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-400 touch-manipulation"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                    {pieceKeyLabel(piece)}
                  </span>
                  <span className="text-xs font-medium text-zinc-200">{DRUM_PIECE_LABELS[piece]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === 'results' && (
        <div className="space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="text-lg font-semibold text-zinc-50">Results</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-zinc-500">Total score</p>
              <p className="text-2xl font-bold text-amber-400">{resultsScore}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-zinc-500">Accuracy</p>
              <p className="text-2xl font-bold text-zinc-100">{resultsAccuracy}%</p>
            </div>
            <div>
              <p className="text-xs uppercase text-zinc-500">Max combo</p>
              <p className="text-2xl font-bold text-emerald-400">{maxCombo}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-zinc-500">Challenge</p>
              <p className="text-sm font-medium text-zinc-200">{challengeRef.current.name}</p>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs uppercase text-zinc-500">Grade breakdown</p>
            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              {(['perfect', 'great', 'good', 'miss'] as const).map((g) => (
                <div key={g} className="rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 capitalize">
                  <span className="text-zinc-400">{g}</span>
                  <span className="ml-2 font-semibold tabular-nums text-zinc-100">{resultsBreakdown[g]}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setPhase('idle');
              setNotes([]);
              notesRef.current = [];
            }}
            className="w-full rounded-xl border border-zinc-600 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
          >
            Back to menu
          </button>
        </div>
      )}
    </div>
  );
}
