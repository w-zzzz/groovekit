'use client';

import { useMemo, useState } from 'react';
import { Search, Star } from 'lucide-react';
import { RUDIMENTS } from '@/data/rudiments';
import { useProgressStore } from '@/stores/progress-store';
import { cn } from '@/lib/utils';
import type { RudimentCategory } from '@/types';

const CATEGORY_TABS: { key: RudimentCategory; label: string }[] = [
  { key: 'rolls', label: 'Rolls' },
  { key: 'diddles', label: 'Diddles' },
  { key: 'flams', label: 'Flams' },
  { key: 'drags', label: 'Drags' },
];

const DIFFICULTY_OPTIONS: Array<'all' | 1 | 2 | 3 | 4 | 5> = ['all', 1, 2, 3, 4, 5];

function DifficultyDots({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Difficulty ${level} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={cn(
            'h-2 w-2 rounded-full',
            i <= level ? 'bg-foreground' : 'bg-muted-foreground/25'
          )}
        />
      ))}
    </div>
  );
}

function MasteryBadge({
  rudimentId,
  mastery,
}: {
  rudimentId: number;
  mastery: Record<number, 'bronze' | 'silver' | 'gold'> | undefined;
}) {
  const tier = mastery?.[rudimentId];
  if (!tier) {
    return <Star className="h-4 w-4 shrink-0 text-muted-foreground/35" strokeWidth={1.5} />;
  }
  const cls =
    tier === 'bronze'
      ? 'text-amber-700 fill-amber-700/90'
      : tier === 'silver'
        ? 'text-slate-300 fill-slate-400/80'
        : 'text-yellow-400 fill-yellow-400/85';
  return <Star className={cn('h-4 w-4 shrink-0', cls)} strokeWidth={1.5} />;
}

export function RudimentBrowser() {
  const rudimentMastery = useProgressStore((s) => s.rudimentMastery);
  const [category, setCategory] = useState<RudimentCategory>('rolls');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 1 | 2 | 3 | 4 | 5>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RUDIMENTS.filter((r) => {
      if (r.category !== category) return false;
      if (difficultyFilter !== 'all' && r.difficulty !== difficultyFilter) return false;
      if (q.length > 0) {
        const haystack = `${r.name} ${r.sticking} ${r.description ?? ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [category, difficultyFilter, query]);

  return (
    <div className="space-y-6">
      <label className="relative block">
        <span className="sr-only">Search rudiments</span>
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
          placeholder="Search rudiments, sticking, description…"
          className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setCategory(tab.key);
                setExpandedId(null);
              }}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                category === tab.key
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="whitespace-nowrap">Difficulty</span>
          <select
            value={difficultyFilter}
            onChange={(e) => {
              const v = e.target.value;
              setDifficultyFilter(v === 'all' ? 'all' : (Number(v) as 1 | 2 | 3 | 4 | 5));
              setExpandedId(null);
            }}
            className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {DIFFICULTY_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d === 'all' ? 'All levels' : `${d} / 5`}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => {
          const open = expandedId === r.id;
          return (
            <div
              key={r.id}
              className={cn(
                'rounded-xl border border-border bg-card transition-colors',
                open && 'ring-1 ring-border'
              )}
            >
              <button
                type="button"
                onClick={() => setExpandedId(open ? null : r.id)}
                className="flex w-full flex-col gap-3 p-4 text-left hover:bg-muted/30 transition-colors rounded-xl"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground leading-snug">{r.name}</h3>
                  <MasteryBadge rudimentId={r.id} mastery={rudimentMastery} />
                </div>
                <p className="font-mono text-xs text-muted-foreground leading-relaxed break-all">
                  {r.sticking}
                </p>
                <DifficultyDots level={r.difficulty} />
              </button>
              {open && (
                <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mb-2">
                      Sticking
                    </p>
                    <p className="font-mono text-base text-foreground tracking-wide break-all">
                      {r.sticking}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">No rudiments match this filter.</p>
      )}
    </div>
  );
}
