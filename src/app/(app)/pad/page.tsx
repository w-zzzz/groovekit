'use client';

import { DrumPad } from '@/components/drum-pad/drum-pad';

export default function PadPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Drum Pad</h1>
      <DrumPad />
    </div>
  );
}
