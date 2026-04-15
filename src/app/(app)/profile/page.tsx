'use client';

import { ProfileDashboard } from '@/components/progress/profile-dashboard';

export default function ProfilePage() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Progress</h1>
      <ProfileDashboard />
    </div>
  );
}
