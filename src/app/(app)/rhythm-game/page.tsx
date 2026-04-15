'use client';

import { RhythmGameView } from '@/components/rhythm-game/rhythm-game-view';

export default function RhythmGamePage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Rhythm Game</h1>
      <RhythmGameView />
    </div>
  );
}
