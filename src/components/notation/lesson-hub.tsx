'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { LESSONS, LESSON_TRACKS } from '@/data/lessons';
import { useProgressStore } from '@/stores/progress-store';
import { cn } from '@/lib/utils';
import type { Lesson, LessonTrack } from '@/types';

function lessonsForTrack(track: LessonTrack): Lesson[] {
  return LESSONS.filter((l) => l.track === track).sort((a, b) => a.order - b.order);
}

function isLessonUnlocked(lesson: Lesson, completed: string[]): boolean {
  if (lesson.order === 1) return true;
  const prev = lessonsForTrack(lesson.track).find((l) => l.order === lesson.order - 1);
  if (!prev) return true;
  return completed.includes(prev.id);
}

export function LessonHub() {
  const lessonsCompleted = useProgressStore((s) => s.lessonsCompleted);

  return (
    <div className="space-y-10">
      {LESSON_TRACKS.map((track) => {
        const list = lessonsForTrack(track.key);
        return (
          <section
            key={track.key}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <header className="px-5 py-4 border-b border-border bg-muted/20">
              <h2 className={cn('text-sm font-semibold tracking-tight', track.color)}>
                {track.label}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {track.description}
              </p>
            </header>
            <ul className="divide-y divide-border">
              {list.map((lesson) => {
                const done = lessonsCompleted.includes(lesson.id);
                const unlocked = isLessonUnlocked(lesson, lessonsCompleted);
                const row = (
                  <>
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border',
                        done
                          ? 'border-accent/40 bg-accent/10 text-accent'
                          : 'bg-muted/50 text-muted-foreground'
                      )}
                    >
                      {done ? <Check className="h-4 w-4" strokeWidth={2.5} /> : lesson.order}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'text-sm font-medium text-foreground truncate',
                          !unlocked && 'text-muted-foreground'
                        )}
                      >
                        {lesson.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {lesson.description}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
                      +{lesson.xpReward} XP
                    </span>
                  </>
                );
                if (!unlocked) {
                  return (
                    <li key={lesson.id}>
                      <div
                        className="flex items-center gap-3 px-5 py-3 opacity-45 cursor-not-allowed select-none"
                        aria-disabled
                      >
                        {row}
                      </div>
                    </li>
                  );
                }
                return (
                  <li key={lesson.id}>
                    <Link
                      href={`/learn/${lesson.id}`}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/40"
                    >
                      {row}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
