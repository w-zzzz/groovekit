export type DrumPiece =
  | 'kick'
  | 'snare'
  | 'hihat-closed'
  | 'hihat-open'
  | 'tom-high'
  | 'tom-mid'
  | 'tom-low'
  | 'crash'
  | 'ride';

export type KitName = 'acoustic' | 'electronic' | '808' | 'jazz' | 'lofi';

export type Velocity = 'ghost' | 'normal' | 'accent';

export interface DrumHit {
  piece: DrumPiece;
  velocity: Velocity;
  timestamp: number;
}

export type RudimentCategory = 'rolls' | 'diddles' | 'flams' | 'drags';

export interface Rudiment {
  id: number;
  name: string;
  category: RudimentCategory;
  sticking: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export type Genre =
  | 'rock'
  | 'pop'
  | 'funk'
  | 'jazz'
  | 'latin'
  | 'metal'
  | 'hiphop'
  | 'reggae'
  | 'country'
  | 'electronic';

export type TimeSignature = '2/4' | '3/4' | '4/4' | '5/4' | '6/8' | '7/8' | '12/8';

export interface Groove {
  id: string;
  name: string;
  genre: Genre;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tempo: number;
  timeSignature: TimeSignature;
  grid: Record<DrumPiece, boolean[]>;
  trending?: boolean;
}

export type LessonTrack = 'foundations' | 'technique' | 'mastery';

export interface Lesson {
  id: string;
  track: LessonTrack;
  order: number;
  title: string;
  description: string;
  content: string;
  exercise?: {
    pattern: Record<DrumPiece, boolean[]>;
    tempo: number;
    timeSignature: TimeSignature;
  };
  xpReward: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: AchievementCondition;
}

export type AchievementCondition =
  | { type: 'xp_total'; threshold: number }
  | { type: 'streak_days'; threshold: number }
  | { type: 'lessons_completed'; threshold: number }
  | { type: 'rudiments_mastered'; threshold: number }
  | { type: 'games_played'; threshold: number }
  | { type: 'level_reached'; threshold: number }
  | { type: 'practice_minutes'; threshold: number };

export type TimingGrade = 'perfect' | 'great' | 'good' | 'miss';

export interface SkillProfile {
  timing: number;
  speed: number;
  dynamics: number;
  coordination: number;
  reading: number;
  creativity: number;
}

export type Subdivision = 'quarter' | 'eighth' | 'sixteenth' | 'triplet';

export interface SequencerPattern {
  id: string;
  name: string;
  steps: number;
  tempo: number;
  swing: number;
  grid: Record<DrumPiece, (Velocity | null)[]>;
}

export const DRUM_PIECES: DrumPiece[] = [
  'kick', 'snare', 'hihat-closed', 'hihat-open',
  'tom-high', 'tom-mid', 'tom-low', 'crash', 'ride',
];

export const DRUM_PIECE_LABELS: Record<DrumPiece, string> = {
  'kick': 'Kick',
  'snare': 'Snare',
  'hihat-closed': 'HH Closed',
  'hihat-open': 'HH Open',
  'tom-high': 'Tom Hi',
  'tom-mid': 'Tom Mid',
  'tom-low': 'Tom Lo',
  'crash': 'Crash',
  'ride': 'Ride',
};

export const KEYBOARD_MAP: Record<string, DrumPiece> = {
  'q': 'crash',
  'w': 'tom-high',
  'e': 'ride',
  'a': 'hihat-closed',
  's': 'snare',
  'd': 'hihat-open',
  'z': 'tom-mid',
  'x': 'kick',
  'c': 'tom-low',
};

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Rookie',
  5: 'Beginner',
  10: 'Learner',
  15: 'Player',
  20: 'Drummer',
  25: 'Performer',
  30: 'Skilled',
  35: 'Expert',
  40: 'Virtuoso',
  45: 'Master',
  50: 'Legend',
};
