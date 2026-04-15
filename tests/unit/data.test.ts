import { describe, it, expect } from 'vitest';
import { RUDIMENTS, RUDIMENT_CATEGORIES } from '@/data/rudiments';
import { GROOVES } from '@/data/grooves';
import { LESSONS } from '@/data/lessons';
import { ACHIEVEMENTS } from '@/data/achievements';
import type { Genre, TimeSignature } from '@/types';

const GENRES: Genre[] = [
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

function expectedGrooveSteps(timeSignature: TimeSignature): number {
  if (timeSignature === '3/4' || timeSignature === '6/8') return 12;
  if (timeSignature === '5/4') return 20;
  if (timeSignature === '7/8') return 14;
  return 16;
}

describe('rudiments data', () => {
  it('defines exactly 40 rudiments', () => {
    expect(RUDIMENTS).toHaveLength(40);
  });

  it('matches declared category counts', () => {
    const rolls = RUDIMENTS.filter((r) => r.category === 'rolls').length;
    const diddles = RUDIMENTS.filter((r) => r.category === 'diddles').length;
    const flams = RUDIMENTS.filter((r) => r.category === 'flams').length;
    const drags = RUDIMENTS.filter((r) => r.category === 'drags').length;
    expect(rolls).toBe(15);
    expect(diddles).toBe(4);
    expect(flams).toBe(11);
    expect(drags).toBe(10);
    for (const cat of RUDIMENT_CATEGORIES) {
      expect(RUDIMENTS.filter((r) => r.category === cat.key).length).toBe(cat.count);
    }
  });

  it('requires core fields and difficulty in range', () => {
    for (const r of RUDIMENTS) {
      expect(r.name.trim().length).toBeGreaterThan(0);
      expect(r.sticking.trim().length).toBeGreaterThan(0);
      expect(r.difficulty).toBeGreaterThanOrEqual(1);
      expect(r.difficulty).toBeLessThanOrEqual(5);
    }
  });
});

describe('grooves data', () => {
  it('keeps genre, difficulty, tempo, and time signature in valid ranges', () => {
    for (const g of GROOVES) {
      expect(GENRES).toContain(g.genre);
      expect(g.difficulty).toBeGreaterThanOrEqual(1);
      expect(g.difficulty).toBeLessThanOrEqual(5);
      expect(g.tempo).toBeGreaterThanOrEqual(30);
      expect(g.tempo).toBeLessThanOrEqual(300);
    }
  });

  it('aligns each groove grid length with its time signature', () => {
    for (const g of GROOVES) {
      const expected = expectedGrooveSteps(g.timeSignature);
      for (const row of Object.values(g.grid)) {
        expect(row).toHaveLength(expected);
      }
    }
  });
});

describe('lessons data', () => {
  it('lists 30 lessons with 10 per track', () => {
    expect(LESSONS).toHaveLength(30);
    const foundations = LESSONS.filter((l) => l.track === 'foundations');
    const technique = LESSONS.filter((l) => l.track === 'technique');
    const mastery = LESSONS.filter((l) => l.track === 'mastery');
    expect(foundations).toHaveLength(10);
    expect(technique).toHaveLength(10);
    expect(mastery).toHaveLength(10);
  });

  it('uses sequential orders 1-10 inside each track', () => {
    for (const track of ['foundations', 'technique', 'mastery'] as const) {
      const orders = LESSONS.filter((l) => l.track === track)
        .map((l) => l.order)
        .sort((a, b) => a - b);
      expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    }
  });

  it('assigns positive XP rewards and unique ids', () => {
    const ids = new Set<string>();
    for (const lesson of LESSONS) {
      expect(lesson.xpReward).toBeGreaterThan(0);
      expect(ids.has(lesson.id)).toBe(false);
      ids.add(lesson.id);
    }
    expect(ids.size).toBe(LESSONS.length);
  });
});

describe('achievements data', () => {
  const conditionTypes = new Set([
    'xp_total',
    'streak_days',
    'lessons_completed',
    'rudiments_mastered',
    'games_played',
    'level_reached',
    'practice_minutes',
  ]);

  it('defines at least 25 achievements', () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(25);
  });

  it('uses supported condition types and unique ids', () => {
    const ids = new Set<string>();
    for (const a of ACHIEVEMENTS) {
      expect(conditionTypes.has(a.condition.type)).toBe(true);
      expect(ids.has(a.id)).toBe(false);
      ids.add(a.id);
    }
  });
});
