import type { Groove, DrumPiece } from '@/types';

const e = (len: number) => Array(len).fill(false);
const p = (len: number, ...indices: number[]) => {
  const arr = Array(len).fill(false);
  indices.forEach(i => { arr[i] = true; });
  return arr;
};

function g(id: string, name: string, genre: Groove['genre'], difficulty: Groove['difficulty'], tempo: number, ts: Groove['timeSignature'], grid: Partial<Record<DrumPiece, boolean[]>>, trending?: boolean): Groove {
  const steps = ts === '3/4' ? 12 : ts === '6/8' ? 12 : ts === '5/4' ? 20 : ts === '7/8' ? 14 : 16;
  const full: Record<DrumPiece, boolean[]> = {
    kick: e(steps), snare: e(steps), 'hihat-closed': e(steps), 'hihat-open': e(steps),
    'tom-high': e(steps), 'tom-mid': e(steps), 'tom-low': e(steps), crash: e(steps), ride: e(steps),
  };
  for (const [k, v] of Object.entries(grid)) full[k as DrumPiece] = v!;
  return { id, name, genre, difficulty, tempo, timeSignature: ts, grid: full, trending };
}

export const GROOVES: Groove[] = [
  // ROCK (15)
  g('rock-1', 'Basic Rock', 'rock', 1, 100, '4/4', { kick: p(16,0,8), snare: p(16,4,12), 'hihat-closed': p(16,0,2,4,6,8,10,12,14) }),
  g('rock-2', 'Rock Shuffle', 'rock', 2, 110, '4/4', { kick: p(16,0,6,8), snare: p(16,4,12), 'hihat-closed': p(16,0,2,4,6,8,10,12,14) }),
  g('rock-3', 'Hard Rock', 'rock', 2, 120, '4/4', { kick: p(16,0,3,8,11), snare: p(16,4,12), 'hihat-closed': p(16,0,2,4,6,8,10,12,14) }),
  g('rock-4', 'Classic Backbeat', 'rock', 1, 95, '4/4', { kick: p(16,0,8), snare: p(16,4,12), ride: p(16,0,2,4,6,8,10,12,14) }),
  g('rock-5', 'Punk Rock', 'rock', 2, 170, '4/4', { kick: p(16,0,2,4,6,8,10,12,14), snare: p(16,4,12), 'hihat-closed': p(16,0,2,4,6,8,10,12,14) }),
  g('rock-6', 'Power Ballad', 'rock', 2, 72, '4/4', { kick: p(16,0,10), snare: p(16,4,12), 'hihat-closed': p(16,0,2,4,6,8,10,12,14) }),
  g('rock-7', 'Driving Rock', 'rock', 3, 140, '4/4', { kick: p(16,0,4,8,12), snare: p(16,4,12), 'hihat-closed': p(16,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15) }),
  g('rock-8', 'Half-Time Rock', 'rock', 2, 130, '4/4', { kick: p(16,0,10), snare: p(16,8), 'hihat-closed': p(16,0,2,4,6,8,10,12,14) }),
  g('rock-9', 'Indie Rock', 'rock', 2, 115, '4/4', { kick: p(16,0,7,8), snare: p(16,4,14), 'hihat-closed': p(16,0,2,4,6,8,10,12,14) }),
  g('rock-10', 'Alt Rock', 'rock', 3, 108, '4/4', { kick: p(16,0,5,8,13), snare: p(16,4,12), 'hihat-open': p(16,0,4,8,12) }),
  // POP (10)
  g('pop-1', 'Basic Pop', 'pop', 1, 110, '4/4', { kick: p(16,0,8), snare: p(16,4,12), 'hihat-closed': p(16,0,2,4,6,8,10,12,14) }),
  g('pop-2', 'Pop Syncopated', 'pop', 2, 100, '4/4', { kick: p(16,0,3,8,11), snare: p(16,4,12), 'hihat-closed': p(16,0,2,4,6,8,10,12,14) }),
  g('pop-3', 'Dance Pop', 'pop', 1, 120, '4/4', { kick: p(16,0,4,8,12), snare: p(16,4,12), 'hihat-closed': p(16,0,2,4,6,8,10,12,14) }),
  g('pop-4', 'Ballad Pop', 'pop', 1, 68, '4/4', { kick: p(16,0,10), snare: p(16,4,12), 'hihat-closed': p(16,0,4,8,12) }),
  g('pop-5', 'Modern Pop', 'pop', 2, 96, '4/4', { kick: p(16,0,5,8), snare: p(16,4,12), 'hihat-closed': p(16,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15) }),
  // FUNK (10)
  g('funk-1', 'Basic Funk', 'funk', 2, 100, '4/4', { kick: p(16,0,6,10), snare: p(16,4,12), 'hihat-closed': p(16,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15) }),
  g('funk-2', 'Funky Drummer', 'funk', 4, 98, '4/4', { kick: p(16,0,3,7,10), snare: p(16,4,8,12,15), 'hihat-closed': p(16,0,2,4,6,8,10,12,14) }),
  g('funk-3', 'Slap Funk', 'funk', 3, 108, '4/4', { kick: p(16,0,5,8,13), snare: p(16,4,11,12), 'hihat-closed': p(16,0,2,4,6,8,10,12,14) }),
  g('funk-4', 'Tower of Power', 'funk', 5, 104, '4/4', { kick: p(16,0,5,10), snare: p(16,2,4,7,12,15), 'hihat-closed': p(16,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15) }),
  g('funk-5', 'Disco Funk', 'funk', 2, 115, '4/4', { kick: p(16,0,4,8,12), snare: p(16,4,12), 'hihat-open': p(16,2,6,10,14) }),
  // JAZZ (10)
  g('jazz-1', 'Swing Ride', 'jazz', 2, 140, '4/4', { ride: p(16,0,3,4,7,8,11,12,15), 'hihat-closed': p(16,4,12) }),
  g('jazz-2', 'Jazz Waltz', 'jazz', 3, 150, '3/4', { ride: p(12,0,3,5,6,9,11), 'hihat-closed': p(12,3,9) }),
  g('jazz-3', 'Bop Comping', 'jazz', 4, 180, '4/4', { ride: p(16,0,3,4,7,8,11,12,15), snare: p(16,3,9,14), 'hihat-closed': p(16,4,12), kick: p(16,0,10) }),
  g('jazz-4', 'Slow Swing', 'jazz', 2, 100, '4/4', { ride: p(16,0,3,4,7,8,11,12,15), 'hihat-closed': p(16,4,12), kick: p(16,0,8) }),
  g('jazz-5', 'Fast Swing', 'jazz', 4, 220, '4/4', { ride: p(16,0,3,4,7,8,11,12,15), 'hihat-closed': p(16,4,12) }),
  // LATIN (10)
  g('latin-1', 'Bossa Nova', 'latin', 3, 130, '4/4', { kick: p(16,0,5,8,14), 'hihat-closed': p(16,0,2,4,6,8,10,12,14), snare: p(16,3,6,11,14) }),
  g('latin-2', 'Samba', 'latin', 4, 100, '4/4', { kick: p(16,0,3,8,11), 'hihat-closed': p(16,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15), snare: p(16,4,6,12,14) }),
  g('latin-3', 'Cha-Cha', 'latin', 2, 120, '4/4', { kick: p(16,0,4,8,12), 'hihat-closed': p(16,0,2,4,6,8,10,12,14), snare: p(16,4,12) }),
  g('latin-4', 'Afro-Cuban 6/8', 'latin', 4, 110, '6/8', { kick: p(12,0,6), 'hihat-closed': p(12,0,2,3,5,6,8,9,11), snare: p(12,3,9) }),
  g('latin-5', 'Mambo', 'latin', 3, 190, '4/4', { kick: p(16,4,12), 'hihat-closed': p(16,0,2,4,6,8,10,12,14), snare: p(16,6,14) }),
  // METAL (10)
  g('metal-1', 'Basic Metal', 'metal', 2, 140, '4/4', { kick: p(16,0,2,8,10), snare: p(16,4,12), 'hihat-closed': p(16,0,2,4,6,8,10,12,14) }),
  g('metal-2', 'Double Bass', 'metal', 4, 160, '4/4', { kick: p(16,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15), snare: p(16,4,12), 'hihat-closed': p(16,0,4,8,12) }),
  g('metal-3', 'Blast Beat', 'metal', 5, 200, '4/4', { kick: p(16,0,2,4,6,8,10,12,14), snare: p(16,1,3,5,7,9,11,13,15), 'hihat-closed': p(16,0,2,4,6,8,10,12,14) }),
  g('metal-4', 'Thrash', 'metal', 3, 180, '4/4', { kick: p(16,0,4,8,12), snare: p(16,4,12), 'hihat-closed': p(16,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15) }),
  g('metal-5', 'Half-Time Metal', 'metal', 2, 130, '4/4', { kick: p(16,0,2,10,12), snare: p(16,8), 'hihat-closed': p(16,0,2,4,6,8,10,12,14) }),
  // HIP-HOP (10)
  g('hiphop-1', 'Boom Bap', 'hiphop', 2, 90, '4/4', { kick: p(16,0,9), snare: p(16,4,12), 'hihat-closed': p(16,0,2,4,6,8,10,12,14) }),
  g('hiphop-2', 'Trap Beat', 'hiphop', 3, 140, '4/4', { kick: p(16,0,7,14), snare: p(16,4,12), 'hihat-closed': p(16,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15) }, true),
  g('hiphop-3', 'Lo-Fi Hip Hop', 'hiphop', 2, 75, '4/4', { kick: p(16,0,5,8), snare: p(16,4,13), 'hihat-closed': p(16,0,2,4,6,8,10,12,14) }),
  g('hiphop-4', 'Old School', 'hiphop', 1, 95, '4/4', { kick: p(16,0,8), snare: p(16,4,12), 'hihat-closed': p(16,0,2,4,6,8,10,12,14) }),
  g('hiphop-5', 'Drill', 'hiphop', 3, 140, '4/4', { kick: p(16,0,3,8,11), snare: p(16,6,14), 'hihat-closed': p(16,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15) }, true),
  // REGGAE (5)
  g('reggae-1', 'One Drop', 'reggae', 2, 80, '4/4', { kick: p(16,12), snare: p(16,12), 'hihat-closed': p(16,0,2,4,6,8,10,12,14) }),
  g('reggae-2', 'Steppers', 'reggae', 2, 75, '4/4', { kick: p(16,0,4,8,12), snare: p(16,12), 'hihat-closed': p(16,0,2,4,6,8,10,12,14) }),
  g('reggae-3', 'Rockers', 'reggae', 2, 85, '4/4', { kick: p(16,0,6,8,14), snare: p(16,4,12), 'hihat-closed': p(16,0,2,4,6,8,10,12,14) }),
  // COUNTRY (5)
  g('country-1', 'Train Beat', 'country', 3, 110, '4/4', { kick: p(16,0,8), snare: p(16,2,4,6,10,12,14), 'hihat-closed': p(16,0,2,4,6,8,10,12,14) }),
  g('country-2', 'Two-Step', 'country', 1, 120, '4/4', { kick: p(16,0,8), snare: p(16,4,12), 'hihat-closed': p(16,0,2,4,6,8,10,12,14) }),
  g('country-3', 'Country Shuffle', 'country', 2, 130, '4/4', { kick: p(16,0,6,8), snare: p(16,4,12), 'hihat-closed': p(16,0,3,4,7,8,11,12,15) }),
  // ELECTRONIC (10)
  g('edm-1', 'Four on Floor', 'electronic', 1, 128, '4/4', { kick: p(16,0,4,8,12), 'hihat-closed': p(16,2,6,10,14), snare: p(16,4,12) }),
  g('edm-2', 'House', 'electronic', 2, 124, '4/4', { kick: p(16,0,4,8,12), 'hihat-closed': p(16,0,2,4,6,8,10,12,14), snare: p(16,4,12), 'hihat-open': p(16,2,6,10,14) }),
  g('edm-3', 'DnB', 'electronic', 4, 174, '4/4', { kick: p(16,0,10), snare: p(16,4,12), 'hihat-closed': p(16,0,2,4,6,8,10,12,14) }),
  g('edm-4', 'Techno', 'electronic', 2, 130, '4/4', { kick: p(16,0,4,8,12), 'hihat-closed': p(16,1,3,5,7,9,11,13,15), snare: p(16,4,12) }),
  g('edm-5', 'Dubstep', 'electronic', 3, 140, '4/4', { kick: p(16,0,7), snare: p(16,4,12), 'hihat-closed': p(16,0,2,4,6,8,10,12,14) }, true),
];
