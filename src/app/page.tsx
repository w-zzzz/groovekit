import Link from 'next/link';
import { Disc3, GraduationCap, Drum, Music, Timer, Grid3X3, Gamepad2 } from 'lucide-react';

const FEATURES = [
  { href: '/pad', icon: Disc3, title: 'Drum Pad', desc: 'Play a virtual kit with keyboard, mouse, or touch' },
  { href: '/learn', icon: GraduationCap, title: 'Learn', desc: 'Structured lessons from basics to mastery' },
  { href: '/rudiments', icon: Drum, title: 'Rudiments', desc: 'All 40 PAS International Drum Rudiments' },
  { href: '/grooves', icon: Music, title: 'Grooves', desc: '100+ patterns across every genre' },
  { href: '/metronome', icon: Timer, title: 'Metronome', desc: 'Visual metronome with subdivisions and speed-up' },
  { href: '/sequencer', icon: Grid3X3, title: 'Sequencer', desc: 'Build and share your own beat patterns' },
  { href: '/rhythm-game', icon: Gamepad2, title: 'Rhythm Game', desc: 'Test your timing with falling-note challenges' },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="flex items-center gap-3 mb-6">
          <Disc3 className="w-12 h-12 text-accent animate-spin" style={{ animationDuration: '3s' }} />
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Groove<span className="text-accent">Kit</span>
          </h1>
        </div>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-12">
          The complete drum learning platform. From your first beat to total mastery.
        </p>
        <Link
          href="/pad"
          className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:bg-accent/90 transition-colors"
        >
          Start Playing
        </Link>
      </section>

      <section className="px-6 pb-24 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ href, icon: Icon, title, desc }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-start gap-4 p-5 rounded-xl border border-border bg-card hover:border-accent/40 transition-colors"
            >
              <div className="p-2.5 rounded-lg bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
