import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SkillProfile } from '@/types';
import { levelFromXp, shouldIncrementStreak, isStreakActive, XP_AWARDS } from '@/lib/scoring/xp';

interface ProgressState {
  totalXp: number;
  level: number;
  streakDays: number;
  lastPracticeDate: string | null;
  streakFreezes: number;
  lessonsCompleted: string[];
  rudimentMastery: Record<number, 'bronze' | 'silver' | 'gold'>;
  gamesPlayed: number;
  highScores: Record<string, number>;
  practiceMinutes: number;
  unlockedAchievements: string[];
  skills: SkillProfile;

  addXp: (amount: number) => void;
  completeLesson: (lessonId: string) => void;
  setRudimentMastery: (rudimentId: number, level: 'bronze' | 'silver' | 'gold') => void;
  recordGame: (challengeId: string, score: number) => void;
  addPracticeMinutes: (minutes: number) => void;
  unlockAchievement: (id: string) => void;
  updateSkill: (skill: keyof SkillProfile, value: number) => void;
  checkAndUpdateStreak: () => void;
  useStreakFreeze: () => boolean;
  resetProgress: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      totalXp: 0,
      level: 1,
      streakDays: 0,
      lastPracticeDate: null,
      streakFreezes: 3,
      lessonsCompleted: [],
      rudimentMastery: {},
      gamesPlayed: 0,
      highScores: {},
      practiceMinutes: 0,
      unlockedAchievements: [],
      skills: { timing: 0, speed: 0, dynamics: 0, coordination: 0, reading: 0, creativity: 0 },

      addXp: (amount) => set((s) => {
        const newXp = s.totalXp + amount;
        return { totalXp: newXp, level: levelFromXp(newXp) };
      }),

      completeLesson: (lessonId) => set((s) => {
        if (s.lessonsCompleted.includes(lessonId)) return s;
        const newXp = s.totalXp + XP_AWARDS.lessonComplete;
        return {
          lessonsCompleted: [...s.lessonsCompleted, lessonId],
          totalXp: newXp,
          level: levelFromXp(newXp),
        };
      }),

      setRudimentMastery: (rudimentId, mastery) => set((s) => {
        const current = s.rudimentMastery[rudimentId];
        const order = ['bronze', 'silver', 'gold'] as const;
        if (current && order.indexOf(current) >= order.indexOf(mastery)) return s;
        const xpMap = { bronze: XP_AWARDS.rudimentBronze, silver: XP_AWARDS.rudimentSilver, gold: XP_AWARDS.rudimentGold };
        const newXp = s.totalXp + xpMap[mastery];
        return {
          rudimentMastery: { ...s.rudimentMastery, [rudimentId]: mastery },
          totalXp: newXp,
          level: levelFromXp(newXp),
        };
      }),

      recordGame: (challengeId, score) => set((s) => {
        const prevBest = s.highScores[challengeId] ?? 0;
        const newXp = s.totalXp + XP_AWARDS.gameComplete + (score === 100 ? XP_AWARDS.gamePerfect : 0);
        return {
          gamesPlayed: s.gamesPlayed + 1,
          highScores: { ...s.highScores, [challengeId]: Math.max(prevBest, score) },
          totalXp: newXp,
          level: levelFromXp(newXp),
        };
      }),

      addPracticeMinutes: (minutes) => set((s) => {
        const newXp = s.totalXp + minutes * XP_AWARDS.practiceMinute;
        return { practiceMinutes: s.practiceMinutes + minutes, totalXp: newXp, level: levelFromXp(newXp) };
      }),

      unlockAchievement: (id) => set((s) => {
        if (s.unlockedAchievements.includes(id)) return s;
        return { unlockedAchievements: [...s.unlockedAchievements, id] };
      }),

      updateSkill: (skill, value) => set((s) => ({
        skills: { ...s.skills, [skill]: Math.max(0, Math.min(100, value)) },
      })),

      checkAndUpdateStreak: () => set((s) => {
        const now = new Date().toISOString().split('T')[0];
        if (shouldIncrementStreak(s.lastPracticeDate)) {
          const active = isStreakActive(s.lastPracticeDate);
          const newStreak = active ? s.streakDays + 1 : 1;
          const bonusXp = XP_AWARDS.streakBonus(newStreak) + XP_AWARDS.dailyLogin;
          const newXp = s.totalXp + bonusXp;
          return {
            streakDays: newStreak,
            lastPracticeDate: now,
            totalXp: newXp,
            level: levelFromXp(newXp),
          };
        }
        return { lastPracticeDate: now };
      }),

      useStreakFreeze: () => {
        const s = get();
        if (s.streakFreezes <= 0) return false;
        set({ streakFreezes: s.streakFreezes - 1 });
        return true;
      },

      resetProgress: () => set({
        totalXp: 0,
        level: 1,
        streakDays: 0,
        lastPracticeDate: null,
        streakFreezes: 3,
        lessonsCompleted: [],
        rudimentMastery: {},
        gamesPlayed: 0,
        highScores: {},
        practiceMinutes: 0,
        unlockedAchievements: [],
        skills: { timing: 0, speed: 0, dynamics: 0, coordination: 0, reading: 0, creativity: 0 },
      }),
    }),
    { name: 'groovekit-progress' }
  )
);
