'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LESSONS, LESSON_TRACKS } from '@/data/lessons';
import { Button } from '@/components/ui/button';
import { useProgressStore } from '@/stores/progress-store';
import { cn } from '@/lib/utils';
import type { DrumPiece } from '@/types';
import { DRUM_PIECE_LABELS } from '@/types';

const ROW_ORDER: DrumPiece[] = [
  'crash',
  'ride',
  'hihat-open',
  'hihat-closed',
  'tom-high',
  'tom-mid',
  'tom-low',
  'snare',
  'kick',
];

const CELL_COLORS: Record<DrumPiece, string> = {
  kick: 'bg-amber-500',
  snare: 'bg-rose-500',
  'hihat-closed': 'bg-slate-300',
  'hihat-open': 'bg-slate-400',
  'tom-high': 'bg-emerald-500',
  'tom-mid': 'bg-emerald-600',
  'tom-low': 'bg-emerald-700',
  crash: 'bg-yellow-400',
  ride: 'bg-cyan-400',
};

function patternRows(pattern: Record<DrumPiece, boolean[]>): DrumPiece[] {
  const steps = pattern.kick?.length ?? 16;
  return ROW_ORDER.filter((piece) => {
    const row = pattern[piece];
    return row && row.length === steps && row.some(Boolean);
  });
}

function ExerciseGrid({ pattern }: { pattern: Record<DrumPiece, boolean[]> }) {
  const rows = patternRows(pattern);
  const steps = pattern.kick?.length ?? 16;
  if (rows.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 overflow-x-auto">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
        Exercise pattern ({steps} steps)
      </p>
      <div className="inline-flex flex-col gap-1 min-w-0">
        {rows.map((piece) => (
          <div key={piece} className="flex items-center gap-2">
            <span className="w-24 shrink-0 text-[11px] text-muted-foreground truncate text-right">
              {DRUM_PIECE_LABELS[piece]}
            </span>
            <div className="flex gap-0.5">
              {pattern[piece].map((hit, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-5 w-5 shrink-0 rounded-sm border border-border/60',
                    hit ? CELL_COLORS[piece] : 'bg-background/80'
                  )}
                  title={`Step ${i + 1}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LessonView({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const completeLesson = useProgressStore((s) => s.completeLesson);
  const lessonsCompleted = useProgressStore((s) => s.lessonsCompleted);

  const lesson = LESSONS.find((l) => l.id === lessonId);
  const trackMeta = lesson ? LESSON_TRACKS.find((t) => t.key === lesson.track) : undefined;
  const done = lesson ? lessonsCompleted.includes(lesson.id) : false;

  if (!lesson) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">Lesson not found.</p>
        <Link href="/learn" className="mt-4 inline-block text-sm font-medium text-accent hover:underline">
          Back to Learn
        </Link>
      </div>
    );
  }

  const handleComplete = () => {
    completeLesson(lesson.id);
    router.push('/learn');
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/learn"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Learn
      </Link>

      <header className="mt-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {trackMeta && (
            <span
              className={cn(
                'rounded-md border border-border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                trackMeta.color
              )}
            >
              {trackMeta.label}
            </span>
          )}
          <span className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            +{lesson.xpReward} XP
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{lesson.title}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">{lesson.description}</p>
      </header>

      <article className="mt-8 rounded-xl border border-border bg-card p-6">
        <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
          {lesson.content}
        </div>
        {lesson.exercise && (
          <div className="mt-8">
            <ExerciseGrid pattern={lesson.exercise.pattern} />
            <p className="mt-3 text-xs text-muted-foreground">
              Suggested tempo: {lesson.exercise.tempo} BPM · {lesson.exercise.timeSignature}
            </p>
          </div>
        )}
      </article>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button type="button" onClick={handleComplete} disabled={done}>
          {done ? 'Already completed' : 'Complete Lesson'}
        </Button>
        {done && (
          <span className="text-xs text-muted-foreground">Progress saved — you can review anytime.</span>
        )}
      </div>
    </div>
  );
}
