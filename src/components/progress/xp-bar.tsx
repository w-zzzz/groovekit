'use client';

import { cn } from '@/lib/utils';
import { getLevelTitle } from '@/lib/scoring/xp';

export interface XpBarProps {
  level: number;
  currentXpInLevel: number;
  requiredXpForNext: number;
  className?: string;
}

export function XpBar({ level, currentXpInLevel, requiredXpForNext, className }: XpBarProps) {
  const title = getLevelTitle(level);
  const progress = requiredXpForNext > 0 ? Math.min(1, currentXpInLevel / requiredXpForNext) : 1;

  return (
    <div className={cn('w-full space-y-2', className)}>
      <div className="flex items-baseline justify-between gap-3 text-zinc-100">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold tabular-nums">Lv {level}</span>
          <span className="text-sm font-medium text-amber-400/90">{title}</span>
        </div>
        <span className="text-xs tabular-nums text-zinc-400">
          {Math.floor(currentXpInLevel)} / {Math.floor(requiredXpForNext)} XP
        </span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-zinc-800 ring-1 ring-zinc-700/80">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.35)] transition-[width] duration-500 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
