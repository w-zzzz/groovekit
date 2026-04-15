'use client';

import { MetronomeView } from '@/components/metronome/metronome-view';

export default function MetronomePage() {
  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Metronome</h1>
      <MetronomeView />
    </div>
  );
}
