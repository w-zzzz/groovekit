'use client';

import { Flame } from 'lucide-react';
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

  const { current, required } = xpToNextLevel(totalXp);
  const rudimentsMastered = Object.values(rudimentMastery).filter((m) => m === 'gold').length;
  const unlockedSet = new Set(unlocked);

  return (
    <div className={cn('mx-auto max-w-5xl space-y-10 px-4 py-8 text-zinc-100', className)}>
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
        <p className="text-sm text-zinc-400">Your practice journey, skills, and milestones.</p>
      </header>

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
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Achievements <span className="font-normal text-zinc-600">({ACHIEVEMENTS.length})</span>
        </h2>
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
    </div>
  );
}
