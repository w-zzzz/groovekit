'use client';

import { LessonHub } from '@/components/notation/lesson-hub';

export default function LearnPage() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Learn Drums</h1>
      <LessonHub />
    </div>
  );
}
