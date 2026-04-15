'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Disc3,
  GraduationCap,
  Drum,
  Music,
  Timer,
  Grid3X3,
  Gamepad2,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/pad', label: 'Drum Pad', icon: Disc3 },
  { href: '/learn', label: 'Learn', icon: GraduationCap },
  { href: '/rudiments', label: 'Rudiments', icon: Drum },
  { href: '/grooves', label: 'Grooves', icon: Music },
  { href: '/metronome', label: 'Metronome', icon: Timer },
  { href: '/sequencer', label: 'Sequencer', icon: Grid3X3 },
  { href: '/rhythm-game', label: 'Rhythm Game', icon: Gamepad2 },
  { href: '/profile', label: 'Profile', icon: User },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-56 border-r border-border bg-card min-h-screen">
      <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <Disc3 className="w-7 h-7 text-accent" />
          <span className="text-lg font-bold tracking-tight">GrooveKit</span>
        </Link>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const mobileItems = NAV_ITEMS.slice(0, 5);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md">
      <div className="flex items-center justify-around h-16">
        {mobileItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-2 py-1 text-xs transition-colors',
                active ? 'text-accent' : 'text-muted-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
