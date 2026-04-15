import type { AchievementCondition } from '@/types';
import { LEVEL_TITLES } from '@/types';

export const XP_AWARDS = {
  lessonComplete: 100,
  rudimentPractice: 25,
  rudimentBronze: 50,
  rudimentSilver: 100,
  rudimentGold: 200,
  gameComplete: 50,
  gamePerfect: 150,
  dailyLogin: 10,
  streakBonus: (days: number) => Math.min(days * 5, 50),
  practiceMinute: 2,
} as const;

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

export function levelFromXp(totalXp: number): number {
  let level = 1;
  let xpNeeded = 0;
  while (xpNeeded + xpForLevel(level + 1) <= totalXp) {
    level++;
    xpNeeded += xpForLevel(level);
  }
  return level;
}

export function xpToNextLevel(totalXp: number): { current: number; required: number; progress: number } {
  const level = levelFromXp(totalXp);
  let xpAtLevel = 0;
  for (let i = 1; i <= level; i++) {
    xpAtLevel += xpForLevel(i);
  }
  const current = totalXp - xpAtLevel;
  const required = xpForLevel(level + 1);
  return { current, required, progress: required > 0 ? current / required : 0 };
}

export function getLevelTitle(level: number): string {
  const thresholds = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a);
  for (const t of thresholds) {
    if (level >= t) return LEVEL_TITLES[t];
  }
  return 'Rookie';
}

export function isStreakActive(lastPracticeDate: string | null): boolean {
  if (!lastPracticeDate) return false;
  const last = new Date(lastPracticeDate);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours < 48;
}

export function shouldIncrementStreak(lastPracticeDate: string | null): boolean {
  if (!lastPracticeDate) return true;
  const last = new Date(lastPracticeDate);
  const now = new Date();
  return last.toDateString() !== now.toDateString();
}

export function checkAchievement(
  condition: AchievementCondition,
  state: {
    totalXp: number;
    streakDays: number;
    lessonsCompleted: number;
    rudimentsMastered: number;
    gamesPlayed: number;
    level: number;
    practiceMinutes: number;
  }
): boolean {
  switch (condition.type) {
    case 'xp_total': return state.totalXp >= condition.threshold;
    case 'streak_days': return state.streakDays >= condition.threshold;
    case 'lessons_completed': return state.lessonsCompleted >= condition.threshold;
    case 'rudiments_mastered': return state.rudimentsMastered >= condition.threshold;
    case 'games_played': return state.gamesPlayed >= condition.threshold;
    case 'level_reached': return state.level >= condition.threshold;
    case 'practice_minutes': return state.practiceMinutes >= condition.threshold;
  }
}
