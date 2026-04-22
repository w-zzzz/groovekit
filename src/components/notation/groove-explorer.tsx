'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { GROOVES } from '@/data/grooves';
import { cn } from '@/lib/utils';
import type { DrumPiece, Genre, Groove } from '@/types';

const GENRE_ORDER: Genre[] = [
  'rock',
  'pop',
  'funk',
  'jazz',
  'latin',
  'metal',
  'hiphop',
  'reggae',
  'country',
  'electronic',
];

const GENRE_LABEL: Record<Genre, string> = {
  rock: 'Rock',
  pop: 'Pop',
  funk: 'Funk',
  jazz: 'Jazz',
  latin: 'Latin',
  metal: 'Metal',
  hiphop: 'Hip-hop',
  reggae: 'Reggae',
  country: 'Country',
  electronic: 'Electronic',
};

const ROW_PRIORITY: DrumPiece[] = [
  'kick',
  'snare',
  'hihat-closed',
  'hihat-open',
  'ride',
  'crash',
  'tom-high',
  'tom-mid',
  'tom-low',
];

const DOT_COLORS: Record<DrumPiece, string> = {
  kick: 'bg-amber-400',
  snare: 'bg-rose-400',
  'hihat-closed': 'bg-slate-200',
  'hihat-open': 'bg-slate-400',
  'tom-high': 'bg-emerald-400',
  'tom-mid': 'bg-emerald-500',
  'tom-low': 'bg-emerald-600',
  crash: 'bg-yellow-300',
  ride: 'bg-cyan-300',
};

const genresInData = GENRE_ORDER.filter((g) => GROOVES.some((x) => x.genre === g));

function activeRows(grid: Groove['grid']): DrumPiece[] {
  const len = grid.kick.length;
  return ROW_PRIORITY.filter((piece) => {
    const row = grid[piece];
    return row.length === len && row.some(Boolean);
  });
}

function MiniBeatGrid({ groove }: { groove: Groove }) {
  const rows = activeRows(groove.grid);
  const steps = groove.grid.kick.length;
  if (rows.length === 0) return null;

  return (
    <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-muted/25 p-3">
      <div className="inline-flex flex-col gap-1">
        {rows.map((piece) => (
          <div key={piece} className="flex items-center gap-1.5">
            <span className="w-10 shrink-0 text-[9px] uppercase tracking-tighter text-muted-foreground text-right">
              {piece === 'hihat-closed'
                ? 'HH'
                : piece === 'hihat-open'
                  ? 'HHo'
                  : piece.slice(0, 3)}
            </span>
            <div className="flex gap-0.5">
              {Array.from({ length: steps }, (_, i) => {
                const hit = groove.grid[piece][i];
                return (
                  <div
                    key={i}
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-background/60 border border-border/50"
                  >
                    {hit ? (
                      <span className={cn('h-2 w-2 rounded-full', DOT_COLORS[piece])} />
                    ) : (
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/15" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DifficultyDots({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Difficulty ${level}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            i <= level ? 'bg-foreground' : 'bg-muted-foreground/20'
          )}
        />
      ))}
    </div>
  );
}

export function GrooveExplorer() {
  const [genre, setGenre] = useState<Genre | 'all'>('all');
  const [difficulty, setDifficulty] = useState<'all' | 1 | 2 | 3 | 4 | 5>('all');
  const [trendingOnly, setTrendingOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GROOVES.filter((g) => {
      if (genre !== 'all' && g.genre !== genre) return false;
      if (difficulty !== 'all' && g.difficulty !== difficulty) return false;
      if (trendingOnly && !g.trending) return false;
      if (q.length > 0) {
        const haystack = `${g.name} ${GENRE_LABEL[g.genre]}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [genre, difficulty, trendingOnly, query]);

  return (
    <div className="space-y-6">
      <label className="relative block">
        <span className="sr-only">Search grooves</span>
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setExpandedId(null);
          }}
          placeholder="Search grooves by name or genre…"
          className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Genre</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                setGenre('all');
                setExpandedId(null);
              }}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                genre === 'all'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              All
            </button>
            {genresInData.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setGenre(g);
                  setExpandedId(null);
                }}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  genre === g
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {GENRE_LABEL[g]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Difficulty
            <select
              value={difficulty}
              onChange={(e) => {
                const v = e.target.value;
                setDifficulty(v === 'all' ? 'all' : (Number(v) as 1 | 2 | 3 | 4 | 5));
                setExpandedId(null);
              }}
              className="min-w-[8rem] rounded-lg border border-border bg-card px-2.5 py-2 text-sm font-normal text-foreground normal-case focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Any</option>
              {[1, 2, 3, 4, 5].map((d) => (
                <option key={d} value={d}>
                  {d} / 5
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            role="switch"
            aria-checked={trendingOnly}
            onClick={() => {
              setTrendingOnly((v) => !v);
              setExpandedId(null);
            }}
            className={cn(
              'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
              trendingOnly
                ? 'border-accent bg-accent/15 text-accent'
                : 'border-border bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            Trending
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((groove) => {
          const open = expandedId === groove.id;
          return (
            <div
              key={groove.id}
              className={cn(
                'rounded-xl border border-border bg-card overflow-hidden transition-shadow',
                open && 'ring-1 ring-border'
              )}
            >
              <button
                type="button"
                onClick={() => setExpandedId(open ? null : groove.id)}
                className="flex w-full flex-col gap-3 p-4 text-left hover:bg-muted/25 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{groove.name}</h3>
                  {groove.trending && (
                    <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-accent">
                      Hot
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-md border border-border bg-muted/40 px-2 py-0.5 font-medium text-foreground/90">
                    {GENRE_LABEL[groove.genre]}
                  </span>
                  <span className="tabular-nums">{groove.tempo} BPM</span>
                  <span className="rounded-md border border-border px-2 py-0.5 tabular-nums">
                    {groove.timeSignature}
                  </span>
                </div>
                <DifficultyDots level={groove.difficulty} />
              </button>
              {open && <MiniBeatGrid groove={groove} />}
            </div>
          );
        })}
      </div>

      {list.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-12">No grooves match these filters.</p>
      )}
    </div>
  );
}
