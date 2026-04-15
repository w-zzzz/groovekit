import type { Rudiment } from '@/types';

export const RUDIMENTS: Rudiment[] = [
  // ROLL RUDIMENTS (1-15)
  { id: 1, name: 'Single Stroke Roll', category: 'rolls', sticking: 'RLRL RLRL', description: 'Alternating single strokes', difficulty: 1 },
  { id: 2, name: 'Single Stroke Four', category: 'rolls', sticking: 'RLRL', description: 'Four alternating singles with accent', difficulty: 1 },
  { id: 3, name: 'Single Stroke Seven', category: 'rolls', sticking: 'RLRLRLR', description: 'Seven alternating singles', difficulty: 2 },
  { id: 4, name: 'Multiple Bounce Roll', category: 'rolls', sticking: 'zz zz zz zz', description: 'Buzz roll with multiple bounces per stroke', difficulty: 2 },
  { id: 5, name: 'Triple Stroke Roll', category: 'rolls', sticking: 'RRRLLL RRRLLL', description: 'Three strokes per hand', difficulty: 3 },
  { id: 6, name: 'Double Stroke Open Roll', category: 'rolls', sticking: 'RRLL RRLL', description: 'Two strokes per hand alternating', difficulty: 2 },
  { id: 7, name: 'Five Stroke Roll', category: 'rolls', sticking: 'RRLL R', description: 'Five strokes ending with accent', difficulty: 2 },
  { id: 8, name: 'Six Stroke Roll', category: 'rolls', sticking: 'R LL RR L', description: 'Six strokes with accented singles', difficulty: 3 },
  { id: 9, name: 'Seven Stroke Roll', category: 'rolls', sticking: 'RRLL RRL', description: 'Seven strokes ending with accent', difficulty: 3 },
  { id: 10, name: 'Nine Stroke Roll', category: 'rolls', sticking: 'RRLL RRLL R', description: 'Nine strokes ending with accent', difficulty: 3 },
  { id: 11, name: 'Ten Stroke Roll', category: 'rolls', sticking: 'RRLL RRLL RL', description: 'Ten strokes with two accented singles', difficulty: 3 },
  { id: 12, name: 'Eleven Stroke Roll', category: 'rolls', sticking: 'RRLL RRLL RRL', description: 'Eleven strokes ending with accent', difficulty: 4 },
  { id: 13, name: 'Thirteen Stroke Roll', category: 'rolls', sticking: 'RRLL RRLL RRLL R', description: 'Thirteen strokes ending with accent', difficulty: 4 },
  { id: 14, name: 'Fifteen Stroke Roll', category: 'rolls', sticking: 'RRLL RRLL RRLL RRLL', description: 'Fifteen strokes ending with accent', difficulty: 4 },
  { id: 15, name: 'Seventeen Stroke Roll', category: 'rolls', sticking: 'RRLL RRLL RRLL RRLL R', description: 'Seventeen strokes ending with accent', difficulty: 5 },

  // DIDDLE RUDIMENTS (16-19)
  { id: 16, name: 'Single Paradiddle', category: 'diddles', sticking: 'RLRR LRLL', description: 'Single-single-double alternating', difficulty: 2 },
  { id: 17, name: 'Double Paradiddle', category: 'diddles', sticking: 'RLRLRR LRLRLL', description: 'Four singles then double', difficulty: 3 },
  { id: 18, name: 'Triple Paradiddle', category: 'diddles', sticking: 'RLRLRLRR LRLRLRLL', description: 'Six singles then double', difficulty: 4 },
  { id: 19, name: 'Single Paradiddle-Diddle', category: 'diddles', sticking: 'RLRRLL LRLLRR', description: 'Paradiddle with extra diddle', difficulty: 4 },

  // FLAM RUDIMENTS (20-30)
  { id: 20, name: 'Flam', category: 'flams', sticking: 'lR rL', description: 'Grace note before main stroke', difficulty: 1 },
  { id: 21, name: 'Flam Accent', category: 'flams', sticking: 'lR L R rL R L', description: 'Flam followed by two taps in triplet', difficulty: 2 },
  { id: 22, name: 'Flam Tap', category: 'flams', sticking: 'lRR rLL', description: 'Flam followed by a tap', difficulty: 2 },
  { id: 23, name: 'Flamacue', category: 'flams', sticking: 'lR L R L rL', description: 'Flam pattern ending with accent', difficulty: 3 },
  { id: 24, name: 'Flam Paradiddle', category: 'flams', sticking: 'lR L RR rL R LL', description: 'Flam combined with paradiddle', difficulty: 3 },
  { id: 25, name: 'Single Flammed Mill', category: 'flams', sticking: 'lR R L L', description: 'Flam with inverted sticking', difficulty: 4 },
  { id: 26, name: 'Flam Paradiddle-Diddle', category: 'flams', sticking: 'lR L RRLL rL R LLRR', description: 'Flam with paradiddle-diddle', difficulty: 4 },
  { id: 27, name: 'Pataflafla', category: 'flams', sticking: 'lR L rL R', description: 'Alternating flams with taps', difficulty: 4 },
  { id: 28, name: 'Swiss Army Triplet', category: 'flams', sticking: 'lR R L rL L R', description: 'Flam triplet with Swiss feel', difficulty: 4 },
  { id: 29, name: 'Inverted Flam Tap', category: 'flams', sticking: 'lR lR rL rL', description: 'Flam taps with inverted sticking', difficulty: 4 },
  { id: 30, name: 'Flam Drag', category: 'flams', sticking: 'lR L L rL R R', description: 'Flam followed by a drag', difficulty: 3 },

  // DRAG RUDIMENTS (31-40)
  { id: 31, name: 'Drag', category: 'drags', sticking: 'llR rrL', description: 'Double grace notes before main stroke', difficulty: 1 },
  { id: 32, name: 'Single Drag Tap', category: 'drags', sticking: 'llR L rrL R', description: 'Drag followed by a tap', difficulty: 2 },
  { id: 33, name: 'Double Drag Tap', category: 'drags', sticking: 'llR llR L rrL rrL R', description: 'Two drags then a tap', difficulty: 3 },
  { id: 34, name: 'Lesson 25', category: 'drags', sticking: 'llR L R L', description: 'Drag in 26 American rudiment tradition', difficulty: 3 },
  { id: 35, name: 'Single Dragadiddle', category: 'drags', sticking: 'llR R L L', description: 'Drag combined with diddle', difficulty: 3 },
  { id: 36, name: 'Drag Paradiddle #1', category: 'drags', sticking: 'R llR L RR', description: 'Drag within a paradiddle', difficulty: 3 },
  { id: 37, name: 'Drag Paradiddle #2', category: 'drags', sticking: 'R llR L L R', description: 'Drag paradiddle variation 2', difficulty: 4 },
  { id: 38, name: 'Single Ratamacue', category: 'drags', sticking: 'llR L R L', description: 'Drag triplet ending with accent', difficulty: 3 },
  { id: 39, name: 'Double Ratamacue', category: 'drags', sticking: 'llR L R llR L R L', description: 'Two ratamacues in sequence', difficulty: 4 },
  { id: 40, name: 'Triple Ratamacue', category: 'drags', sticking: 'llR L R llR L R llR L R L', description: 'Three ratamacues in sequence', difficulty: 5 },
];

export const RUDIMENT_CATEGORIES = [
  { key: 'rolls' as const, label: 'Roll Rudiments', count: 15 },
  { key: 'diddles' as const, label: 'Diddle Rudiments', count: 4 },
  { key: 'flams' as const, label: 'Flam Rudiments', count: 11 },
  { key: 'drags' as const, label: 'Drag Rudiments', count: 10 },
] as const;
