'use client';

import { use } from 'react';
import { LessonView } from '@/components/notation/lesson-view';

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <LessonView lessonId={id} />
    </div>
  );
}
