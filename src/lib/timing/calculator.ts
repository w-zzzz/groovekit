import type { TimingGrade, Subdivision } from '@/types';

export function bpmToMs(bpm: number): number {
  return 60000 / bpm;
}

export function msToBpm(ms: number): number {
  return 60000 / ms;
}

export function subdivisionMultiplier(sub: Subdivision): number {
  switch (sub) {
    case 'quarter': return 1;
    case 'eighth': return 0.5;
    case 'sixteenth': return 0.25;
    case 'triplet': return 1 / 3;
  }
}

export function subdivisionInterval(bpm: number, sub: Subdivision): number {
  return bpmToMs(bpm) * subdivisionMultiplier(sub);
}

export function swingOffset(bpm: number, swingAmount: number): number {
  const eighthMs = bpmToMs(bpm) * 0.5;
  return eighthMs * swingAmount * 0.33;
}

export function gradeTimingAccuracy(offsetMs: number): TimingGrade {
  const abs = Math.abs(offsetMs);
  if (abs <= 25) return 'perfect';
  if (abs <= 50) return 'great';
  if (abs <= 100) return 'good';
  return 'miss';
}

export const TIMING_THRESHOLDS = {
  perfect: 25,
  great: 50,
  good: 100,
} as const;

export function timingScore(grade: TimingGrade): number {
  switch (grade) {
    case 'perfect': return 100;
    case 'great': return 75;
    case 'good': return 50;
    case 'miss': return 0;
  }
}

export function calculateAccuracy(grades: TimingGrade[]): number {
  if (grades.length === 0) return 0;
  const total = grades.reduce((sum, g) => sum + timingScore(g), 0);
  return Math.round(total / grades.length);
}

export function beatsPerMeasure(timeSignature: string): number {
  const [beats] = timeSignature.split('/').map(Number);
  return beats;
}

export function beatUnit(timeSignature: string): number {
  const parts = timeSignature.split('/').map(Number);
  return parts[1];
}

export function measureDurationMs(bpm: number, timeSignature: string): number {
  const beats = beatsPerMeasure(timeSignature);
  const unit = beatUnit(timeSignature);
  const quarterMs = bpmToMs(bpm);
  return (quarterMs * beats * 4) / unit;
}

export function stepDurationMs(bpm: number, steps: number): number {
  const barMs = bpmToMs(bpm) * 4;
  return barMs / steps;
}
