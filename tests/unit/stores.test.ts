import { describe, it, expect, beforeEach } from 'vitest';
import { DRUM_PIECES } from '@/types';
import type { DrumHit, DrumPiece, Velocity } from '@/types';
import { useAudioStore } from '@/stores/audio-store';
import { useSequencerStore } from '@/stores/sequencer-store';
import { useProgressStore } from '@/stores/progress-store';
import { XP_AWARDS } from '@/lib/scoring/xp';

function emptySequencerGrid(steps: number): Record<DrumPiece, (Velocity | null)[]> {
  return Object.fromEntries(
    DRUM_PIECES.map((piece) => [piece, Array<Velocity | null>(steps).fill(null)]),
  ) as Record<DrumPiece, (Velocity | null)[]>;
}

const audioInitial = {
  currentKit: 'acoustic' as const,
  volume: 0.8,
  isPlaying: false,
  recording: [] as DrumHit[],
  isRecording: false,
};

const sequencerInitial = {
  steps: 16,
  tempo: 120,
  swing: 0,
  grid: emptySequencerGrid(16),
  currentStep: -1,
  isPlaying: false,
  patterns: [] as ReturnType<typeof useSequencerStore.getState>['patterns'],
};

const progressInitial = {
  totalXp: 0,
  level: 1,
  streakDays: 0,
  lastPracticeDate: null as string | null,
  streakFreezes: 3,
  lessonsCompleted: [] as string[],
  rudimentMastery: {} as Record<number, 'bronze' | 'silver' | 'gold'>,
  gamesPlayed: 0,
  highScores: {} as Record<string, number>,
  practiceMinutes: 0,
  unlockedAchievements: [] as string[],
  skills: { timing: 0, speed: 0, dynamics: 0, coordination: 0, reading: 0, creativity: 0 },
};

describe('audio store', () => {
  beforeEach(() => {
    useAudioStore.setState(audioInitial);
  });

  it('updates the active kit', () => {
    useAudioStore.getState().setKit('808');
    expect(useAudioStore.getState().currentKit).toBe('808');
  });

  it('clamps volume between 0 and 1', () => {
    useAudioStore.getState().setVolume(1.5);
    expect(useAudioStore.getState().volume).toBe(1);
    useAudioStore.getState().setVolume(-0.2);
    expect(useAudioStore.getState().volume).toBe(0);
  });

  it('records hits across start, add, and stop', () => {
    const hit: DrumHit = { piece: 'snare', velocity: 'normal', timestamp: 12 };
    useAudioStore.getState().startRecording();
    expect(useAudioStore.getState().isRecording).toBe(true);
    expect(useAudioStore.getState().recording).toEqual([]);

    useAudioStore.getState().addHit(hit);
    expect(useAudioStore.getState().recording).toEqual([hit]);

    const snapshot = useAudioStore.getState().stopRecording();
    expect(snapshot).toEqual([hit]);
    expect(useAudioStore.getState().isRecording).toBe(false);
  });

  it('clears recording state via clearRecording', () => {
    useAudioStore.getState().startRecording();
    useAudioStore.getState().addHit({ piece: 'kick', velocity: 'ghost', timestamp: 1 });
    useAudioStore.getState().clearRecording();
    expect(useAudioStore.getState().recording).toEqual([]);
    expect(useAudioStore.getState().isRecording).toBe(false);
  });
});

describe('sequencer store', () => {
  beforeEach(() => {
    useSequencerStore.setState(sequencerInitial);
  });

  it('toggles a step between empty and normal velocity', () => {
    const piece: DrumPiece = 'snare';
    useSequencerStore.getState().toggleStep(piece, 3);
    expect(useSequencerStore.getState().grid[piece][3]).toBe('normal');
    useSequencerStore.getState().toggleStep(piece, 3);
    expect(useSequencerStore.getState().grid[piece][3]).toBeNull();
  });

  it('writes explicit velocities', () => {
    useSequencerStore.getState().setStepVelocity('kick', 0, 'accent');
    expect(useSequencerStore.getState().grid.kick[0]).toBe('accent');
  });

  it('clamps tempo between 30 and 300 BPM', () => {
    useSequencerStore.getState().setTempo(20);
    expect(useSequencerStore.getState().tempo).toBe(30);
    useSequencerStore.getState().setTempo(400);
    expect(useSequencerStore.getState().tempo).toBe(300);
  });

  it('clamps swing between 0 and 1', () => {
    useSequencerStore.getState().setSwing(-0.5);
    expect(useSequencerStore.getState().swing).toBe(0);
    useSequencerStore.getState().setSwing(2);
    expect(useSequencerStore.getState().swing).toBe(1);
  });

  it('clears every lane while preserving step count', () => {
    useSequencerStore.getState().setStepVelocity('snare', 2, 'ghost');
    useSequencerStore.getState().clearGrid();
    const { grid, steps } = useSequencerStore.getState();
    expect(steps).toBe(16);
    for (const piece of DRUM_PIECES) {
      expect(grid[piece].every((cell) => cell === null)).toBe(true);
    }
  });

  it('resizes the grid and carries over existing hits when lengthening', () => {
    useSequencerStore.getState().setStepVelocity('ride', 4, 'normal');
    useSequencerStore.getState().setSteps(32);
    const { steps, grid } = useSequencerStore.getState();
    expect(steps).toBe(32);
    expect(grid.ride[4]).toBe('normal');
    expect(grid.ride[31]).toBeNull();
  });

  it('truncates rows when shortening the pattern', () => {
    useSequencerStore.getState().setStepVelocity('tom-high', 10, 'accent');
    useSequencerStore.getState().setSteps(8);
    expect(useSequencerStore.getState().steps).toBe(8);
    expect(useSequencerStore.getState().grid['tom-high']).toHaveLength(8);
  });
});

describe('progress store', () => {
  beforeEach(() => {
    globalThis.localStorage.removeItem('groovekit-progress');
    useProgressStore.setState(progressInitial);
  });

  it('adds XP and recomputes level', () => {
    useProgressStore.getState().addXp(500);
    const { totalXp, level } = useProgressStore.getState();
    expect(totalXp).toBe(500);
    expect(level).toBeGreaterThanOrEqual(1);
  });

  it('completes a lesson once and awards XP', () => {
    useProgressStore.getState().completeLesson('f1');
    const afterFirst = useProgressStore.getState();
    expect(afterFirst.lessonsCompleted).toEqual(['f1']);
    expect(afterFirst.totalXp).toBe(XP_AWARDS.lessonComplete);

    useProgressStore.getState().completeLesson('f1');
    const afterRepeat = useProgressStore.getState();
    expect(afterRepeat.lessonsCompleted).toEqual(['f1']);
    expect(afterRepeat.totalXp).toBe(XP_AWARDS.lessonComplete);
  });

  it('upgrades rudiment mastery without downgrading or double-counting same tier', () => {
    useProgressStore.getState().setRudimentMastery(3, 'bronze');
    const bronzeState = useProgressStore.getState();
    expect(bronzeState.rudimentMastery[3]).toBe('bronze');
    const xpAfterBronze = bronzeState.totalXp;

    useProgressStore.getState().setRudimentMastery(3, 'bronze');
    expect(useProgressStore.getState().totalXp).toBe(xpAfterBronze);

    useProgressStore.getState().setRudimentMastery(3, 'silver');
    expect(useProgressStore.getState().rudimentMastery[3]).toBe('silver');

    useProgressStore.getState().setRudimentMastery(3, 'bronze');
    expect(useProgressStore.getState().rudimentMastery[3]).toBe('silver');
  });

  it('increments games played for every recorded score', () => {
    expect(useProgressStore.getState().gamesPlayed).toBe(0);
    useProgressStore.getState().recordGame('challenge-a', 80);
    expect(useProgressStore.getState().gamesPlayed).toBe(1);
    useProgressStore.getState().recordGame('challenge-b', 90);
    expect(useProgressStore.getState().gamesPlayed).toBe(2);
  });
});
