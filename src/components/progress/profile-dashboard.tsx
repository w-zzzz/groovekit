'use client';

import { useState } from 'react';
import { Flame, Trophy } from 'lucide-react';
import { ACHIEVEMENTS } from '@/data/achievements';
import { xpToNextLevel } from '@/lib/scoring/xp';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/stores/progress-store';
import { SkillRadar } from './skill-radar';
import { XpBar } from './xp-bar';

export function ProfileDashboard({ className }: { className?: string }) {
  const totalXp = useProgressStore((s) => s.totalXp);
  const level = useProgressStore((s) => s.level);
  const streakDays = useProgressStore((s) => s.streakDays);
  const practiceMinutes = useProgressStore((s) => s.practiceMinutes);
  const lessonsCompleted = useProgressStore((s) => s.lessonsCompleted.length);
  const gamesPlayed = useProgressStore((s) => s.gamesPlayed);
  const rudimentMastery = useProgressStore((s) => s.rudimentMastery);
  const skills = useProgressStore((s) => s.skills);
  const unlocked = useProgressStore((s) => s.unlockedAchievements);
  const resetProgress = useProgressStore((s) => s.resetProgress);

  const { current, required } = xpToNextLevel(totalXp);
  const rudimentsMastered = Object.values(rudimentMastery).filter((m) => m === 'gold').length;
  const unlockedSet = new Set(unlocked);
  const totalAchievements = ACHIEVEMENTS.length;
  const [confirmingReset, setConfirmingReset] = useState(false);

  return (
    <div className={cn('mx-auto max-w-5xl space-y-10 px-4 text-zinc-100', className)}>
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-xl shadow-black/40 backdrop-blur-sm">
        <XpBar level={level} currentXpInLevel={current} requiredXpForNext={required} />
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-orange-500/20 bg-orange-950/20 px-4 py-3">
          <Flame className="h-8 w-8 shrink-0 text-orange-400" aria-hidden />
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Streak</p>
            <p className="text-lg font-semibold tabular-nums text-zinc-100">
              {streakDays} {streakDays === 1 ? 'day' : 'days'}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">Skill profile</h2>
          <SkillRadar skills={skills} size={260} className="lg:scale-110" />
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">Summary</h2>
          <dl className="space-y-4 text-sm">
            <div className="flex justify-between gap-4 border-b border-zinc-800/80 pb-3">
              <dt className="text-zinc-400">Practice</dt>
              <dd className="font-medium tabular-nums text-zinc-100">{practiceMinutes} min</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-zinc-800/80 pb-3">
              <dt className="text-zinc-400">Lessons done</dt>
              <dd className="font-medium tabular-nums text-zinc-100">{lessonsCompleted}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-zinc-800/80 pb-3">
              <dt className="text-zinc-400">Games played</dt>
              <dd className="font-medium tabular-nums text-zinc-100">{gamesPlayed}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-400">Rudiments mastered</dt>
              <dd className="font-medium tabular-nums text-zinc-100">{rudimentsMastered}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            <Trophy className="h-4 w-4 text-amber-400/80" aria-hidden />
            Achievements
            <span className="font-normal normal-case tracking-normal text-zinc-500">
              <span className="tabular-nums text-zinc-300">{unlockedSet.size}</span>
              <span className="text-zinc-600"> / {totalAchievements}</span>
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {ACHIEVEMENTS.map((a) => {
            const isUnlocked = unlockedSet.has(a.id);
            return (
              <article
                key={a.id}
                className={cn(
                  'flex flex-col rounded-xl border p-3 transition-colors',
                  isUnlocked
                    ? 'border-amber-500/40 bg-amber-950/25 shadow-[0_0_0_1px_rgba(251,191,36,0.08)]'
                    : 'border-zinc-800 bg-zinc-950/60 opacity-60 grayscale'
                )}
              >
                <div className="mb-2 text-2xl" aria-hidden>
                  {a.icon}
                </div>
                <h3 className={cn('text-sm font-semibold', isUnlocked ? 'text-zinc-50' : 'text-zinc-500')}>{a.name}</h3>
                <p className="mt-1 line-clamp-3 text-xs leading-snug text-zinc-500">{a.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Danger zone
        </h2>
        <p className="mb-4 text-sm text-zinc-400">
          Permanently erase all XP, streaks, achievements, and skill progress from this device.
        </p>
        {confirmingReset ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-zinc-100">
              This can&apos;t be undone. Reset everything?
            </span>
            <button
              type="button"
              onClick={() => {
                resetProgress();
                setConfirmingReset(false);
              }}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            >
              Yes, reset
            </button>
            <button
              type="button"
              onClick={() => setConfirmingReset(false)}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingReset(true)}
            className="rounded-lg border border-red-500/40 bg-red-950/30 px-4 py-2 text-sm font-semibold text-red-300 transition-colors hover:border-red-500/70 hover:bg-red-950/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            Reset progress
          </button>
        )}
      </section>
    </div>
  );
}
