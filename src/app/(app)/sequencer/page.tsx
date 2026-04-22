'use client';

import { Suspense } from 'react';
import { SequencerView } from '@/components/sequencer/sequencer-view';

export default function SequencerPage() {
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Beat Sequencer</h1>
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading sequencer…</div>}>
        <SequencerView />
      </Suspense>
    </div>
  );
}
