'use client';

import { RudimentBrowser } from '@/components/notation/rudiment-browser';

export default function RudimentsPage() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">40 PAS Drum Rudiments</h1>
      <RudimentBrowser />
    </div>
  );
}
