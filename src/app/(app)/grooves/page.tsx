'use client';

import { GrooveExplorer } from '@/components/notation/groove-explorer';

export default function GroovesPage() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Groove Explorer</h1>
      <GrooveExplorer />
    </div>
  );
}
