import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { SkillProfile } from '@/types';

const mockSkills: SkillProfile = {
  timing: 62,
  speed: 58,
  dynamics: 54,
  coordination: 50,
  reading: 46,
  creativity: 42,
};

vi.mock('@/stores/progress-store', () => ({
  useProgressStore: vi.fn((selector: (s: unknown) => unknown) => {
    const state = {
      totalXp: 500,
      level: 5,
      streakDays: 7,
      lastPracticeDate: '2026-04-14',
      streakFreezes: 2,
      lessonsCompleted: ['a', 'b'],
      rudimentMastery: { 1: 'gold' as const, 2: 'gold' as const },
      gamesPlayed: 12,
      highScores: {},
      practiceMinutes: 90,
      unlockedAchievements: ['first-beat'],
      skills: mockSkills,
    };
    return selector(state);
  }),
}));

import { useProgressStore } from '@/stores/progress-store';
import { XpBar } from '@/components/progress/xp-bar';
import { SkillRadar } from '@/components/progress/skill-radar';
import { ProfileDashboard } from '@/components/progress/profile-dashboard';
import { getLevelTitle } from '@/lib/scoring/xp';

describe('XpBar', () => {
  it('renders the level number', () => {
    render(<XpBar level={4} currentXpInLevel={25} requiredXpForNext={100} />);
    expect(screen.getByText(/lv 4/i)).toBeInTheDocument();
  });

  it('renders the level title from getLevelTitle', () => {
    const level = 4;
    render(<XpBar level={level} currentXpInLevel={25} requiredXpForNext={100} />);
    expect(screen.getByText(getLevelTitle(level))).toBeInTheDocument();
  });

  it('renders XP progress text', () => {
    render(<XpBar level={2} currentXpInLevel={30.7} requiredXpForNext={80.2} />);
    expect(screen.getByText('30 / 80 XP')).toBeInTheDocument();
  });

  it('sets the progress bar width from current and required XP', () => {
    const { container } = render(
      <XpBar level={2} currentXpInLevel={40} requiredXpForNext={100} />
    );
    const fill = container.querySelector('[style*="width"]');
    expect(fill).not.toBeNull();
    expect(fill).toHaveStyle({ width: '40%' });
  });
});

describe('SkillRadar', () => {
  it('renders an SVG chart', () => {
    const { container } = render(<SkillRadar skills={mockSkills} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders all six axis labels', () => {
    render(<SkillRadar skills={mockSkills} />);
    const labels = ['Timing', 'Speed', 'Dynamics', 'Coordination', 'Reading', 'Creativity'];
    for (const label of labels) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });
});

describe('ProfileDashboard', () => {
  it('renders the streak display from the progress store', () => {
    render(<ProfileDashboard />);
    expect(screen.getByText('Streak')).toBeInTheDocument();
    expect(screen.getByText('7 days')).toBeInTheDocument();
    expect(useProgressStore).toHaveBeenCalled();
  });

  it('renders the summary stats section', () => {
    render(<ProfileDashboard />);
    expect(screen.getByRole('heading', { name: /summary/i })).toBeInTheDocument();
    expect(screen.getByText('Practice')).toBeInTheDocument();
    expect(screen.getByText('90 min')).toBeInTheDocument();
  });

  it('renders the achievements section', () => {
    render(<ProfileDashboard />);
    const achievementsHeading = screen.getByRole('heading', {
      name: /achievements/i,
    });
    expect(achievementsHeading).toBeInTheDocument();
    const section = achievementsHeading.closest('section')!;
    expect(within(section).getAllByRole('article').length).toBeGreaterThan(0);
  });
});
