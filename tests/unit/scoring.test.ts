import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  XP_AWARDS,
  xpForLevel,
  levelFromXp,
  xpToNextLevel,
  getLevelTitle,
  isStreakActive,
  shouldIncrementStreak,
  checkAchievement,
} from '@/lib/scoring/xp';

describe('XP and scoring', () => {
  describe('xpForLevel', () => {
    it('returns 100 for level 1', () => {
      expect(xpForLevel(1)).toBe(100);
    });

    it('returns a higher requirement for level 2 than level 1', () => {
      expect(xpForLevel(2)).toBeGreaterThan(xpForLevel(1));
    });

    it('increases monotonically for successive levels', () => {
      for (let level = 2; level <= 25; level++) {
        expect(xpForLevel(level)).toBeGreaterThan(xpForLevel(level - 1));
      }
    });
  });

  describe('levelFromXp', () => {
    it('places 0 XP at level 1', () => {
      expect(levelFromXp(0)).toBe(1);
    });

    it('keeps 100 XP at level 1 (threshold to advance is higher)', () => {
      expect(levelFromXp(100)).toBe(1);
    });

    it('reaches level 5 once cumulative thresholds are met', () => {
      expect(levelFromXp(2718)).toBe(4);
      expect(levelFromXp(2719)).toBe(5);
    });
  });

  describe('xpToNextLevel', () => {
    it('returns non-negative current at 0 total XP', () => {
      const info = xpToNextLevel(0);
      expect(info.current).toBeGreaterThanOrEqual(0);
      expect(info.required).toBe(xpForLevel(2));
      expect(info.progress).toBeGreaterThanOrEqual(0);
      expect(info.progress).toBeLessThanOrEqual(1);
    });

    it('returns 100 current at 100 total XP for level 1', () => {
      const info = xpToNextLevel(100);
      expect(info.current).toBe(100);
      expect(info.required).toBe(xpForLevel(2));
    });

    it('progress is clamped between 0 and 1', () => {
      const { progress } = xpToNextLevel(0);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
      const high = xpToNextLevel(50000);
      expect(high.progress).toBeLessThanOrEqual(1);
    });

    it('current is always non-negative', () => {
      for (const xp of [0, 50, 100, 500, 1500, 5000]) {
        expect(xpToNextLevel(xp).current).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('getLevelTitle', () => {
    it('labels level 1 as Rookie', () => {
      expect(getLevelTitle(1)).toBe('Rookie');
    });

    it('labels level 5 as Beginner', () => {
      expect(getLevelTitle(5)).toBe('Beginner');
    });

    it('labels level 50 as Legend', () => {
      expect(getLevelTitle(50)).toBe('Legend');
    });

    it('uses the highest title threshold not above the level', () => {
      expect(getLevelTitle(3)).toBe('Rookie');
      expect(getLevelTitle(4)).toBe('Rookie');
      expect(getLevelTitle(7)).toBe('Beginner');
    });
  });

  describe('isStreakActive', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-04-15T14:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns false when there is no last practice date', () => {
      expect(isStreakActive(null)).toBe(false);
    });

    it('returns true when the last session was one day ago', () => {
      const yesterday = new Date('2026-04-14T14:00:00.000Z').toISOString();
      expect(isStreakActive(yesterday)).toBe(true);
    });

    it('returns false when the last session was several days ago', () => {
      const threeDaysAgo = new Date('2026-04-12T14:00:00.000Z').toISOString();
      expect(isStreakActive(threeDaysAgo)).toBe(false);
    });
  });

  describe('shouldIncrementStreak', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 3, 15, 18, 30, 0));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns true when streak has never been recorded', () => {
      expect(shouldIncrementStreak(null)).toBe(true);
    });

    it('returns false when the last practice day is today', () => {
      const now = new Date();
      const earlierToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);
      expect(shouldIncrementStreak(earlierToday.toISOString())).toBe(false);
    });

    it('returns true when the last practice day was not today', () => {
      const now = new Date();
      const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 22, 0, 0);
      expect(shouldIncrementStreak(yesterday.toISOString())).toBe(true);
    });
  });

  describe('checkAchievement', () => {
    const baseState = {
      totalXp: 0,
      streakDays: 0,
      lessonsCompleted: 0,
      rudimentsMastered: 0,
      gamesPlayed: 0,
      level: 1,
      practiceMinutes: 0,
    };

    it('evaluates xp_total', () => {
      const condition = { type: 'xp_total' as const, threshold: 500 };
      expect(checkAchievement(condition, { ...baseState, totalXp: 500 })).toBe(true);
      expect(checkAchievement(condition, { ...baseState, totalXp: 499 })).toBe(false);
    });

    it('evaluates streak_days', () => {
      const condition = { type: 'streak_days' as const, threshold: 7 };
      expect(checkAchievement(condition, { ...baseState, streakDays: 7 })).toBe(true);
      expect(checkAchievement(condition, { ...baseState, streakDays: 6 })).toBe(false);
    });

    it('evaluates lessons_completed', () => {
      const condition = { type: 'lessons_completed' as const, threshold: 10 };
      expect(checkAchievement(condition, { ...baseState, lessonsCompleted: 10 })).toBe(true);
      expect(checkAchievement(condition, { ...baseState, lessonsCompleted: 9 })).toBe(false);
    });

    it('evaluates rudiments_mastered', () => {
      const condition = { type: 'rudiments_mastered' as const, threshold: 5 };
      expect(checkAchievement(condition, { ...baseState, rudimentsMastered: 5 })).toBe(true);
      expect(checkAchievement(condition, { ...baseState, rudimentsMastered: 4 })).toBe(false);
    });

    it('evaluates games_played', () => {
      const condition = { type: 'games_played' as const, threshold: 3 };
      expect(checkAchievement(condition, { ...baseState, gamesPlayed: 3 })).toBe(true);
      expect(checkAchievement(condition, { ...baseState, gamesPlayed: 2 })).toBe(false);
    });

    it('evaluates level_reached', () => {
      const condition = { type: 'level_reached' as const, threshold: 15 };
      expect(checkAchievement(condition, { ...baseState, level: 15 })).toBe(true);
      expect(checkAchievement(condition, { ...baseState, level: 14 })).toBe(false);
    });

    it('evaluates practice_minutes', () => {
      const condition = { type: 'practice_minutes' as const, threshold: 120 };
      expect(checkAchievement(condition, { ...baseState, practiceMinutes: 120 })).toBe(true);
      expect(checkAchievement(condition, { ...baseState, practiceMinutes: 119 })).toBe(false);
    });
  });

  describe('XP_AWARDS', () => {
    it('exposes positive numeric awards', () => {
      expect(XP_AWARDS.lessonComplete).toBeGreaterThan(0);
      expect(XP_AWARDS.rudimentPractice).toBeGreaterThan(0);
      expect(XP_AWARDS.rudimentBronze).toBeGreaterThan(0);
      expect(XP_AWARDS.rudimentSilver).toBeGreaterThan(0);
      expect(XP_AWARDS.rudimentGold).toBeGreaterThan(0);
      expect(XP_AWARDS.gameComplete).toBeGreaterThan(0);
      expect(XP_AWARDS.gamePerfect).toBeGreaterThan(0);
      expect(XP_AWARDS.dailyLogin).toBeGreaterThan(0);
      expect(XP_AWARDS.practiceMinute).toBeGreaterThan(0);
    });

    it('caps streak bonus growth while staying positive', () => {
      expect(XP_AWARDS.streakBonus(1)).toBeGreaterThan(0);
      expect(XP_AWARDS.streakBonus(100)).toBe(50);
    });
  });
});
