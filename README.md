# GrooveKit — The Complete Drum Learning Platform

A comprehensive, gamified web application that teaches drumming from beginner to expert. Play in-browser with zero setup — just open and groove.

## Features

- **Interactive Drum Pad** — 9-pad virtual kit with keyboard shortcuts (QWEASDZXC), 5 kit presets, real-time waveform visualization
- **Learning Hub** — 30 structured lessons across 3 tracks: Foundations, Technique, and Mastery
- **40 PAS Rudiments** — Complete International Drum Rudiment library with sticking patterns and difficulty ratings
- **Groove Explorer** — 60+ drum patterns across 10 genres with beat grid visualizations
- **Metronome** — Visual pulse ring, tap-tempo, 7 time signatures, subdivisions, accent patterns, speed-up mode
- **Beat Sequencer** — 16/32-step grid, 8 drum tracks, per-step velocity, swing, pattern save/share via URL
- **Rhythm Game** — Falling-note timing game with 3 difficulty modes, combo system, and accuracy scoring
- **Progress Dashboard** — XP levels, daily streaks, skill radar chart, 30 achievement badges

## Tech Stack

- **Next.js 15** (App Router, React 19, Turbopack)
- **TypeScript** — strict mode, zero errors
- **Tone.js** — synth-based drum sounds, no external audio files
- **Tailwind CSS v4** — dark studio theme, responsive design
- **Zustand v5** — state management with localStorage persistence
- **Motion** (Framer Motion) — animations and transitions
- **Vitest** — 112 unit + component tests
- **Playwright** — 15 E2E tests
- **GitHub Actions** — CI pipeline (lint, typecheck, test, e2e, build)

## Quick Start

```bash
# Clone
git clone https://github.com/w-zzzz/groovekit.git
cd groovekit

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Scripts


| Command              | Description                         |
| -------------------- | ----------------------------------- |
| `npm run dev`        | Start dev server with Turbopack     |
| `npm run build`      | Production build                    |
| `npm run start`      | Start production server             |
| `npm run lint`       | ESLint check                        |
| `npm run typecheck`  | TypeScript strict check             |
| `npm run test`       | Run unit + component tests (Vitest) |
| `npm run test:watch` | Watch mode for tests                |
| `npm run test:e2e`   | Run E2E tests (Playwright)          |


## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (app)/              # App shell with sidebar navigation
│   │   ├── pad/            # Interactive drum pad
│   │   ├── learn/          # Lesson hub + individual lessons
│   │   ├── rudiments/      # 40 PAS rudiment browser
│   │   ├── grooves/        # Genre-based groove explorer
│   │   ├── metronome/      # Visual metronome
│   │   ├── sequencer/      # Beat sequencer
│   │   ├── rhythm-game/    # Falling-note game
│   │   └── profile/        # Progress dashboard
│   └── page.tsx            # Landing page
├── components/             # React components by feature
├── lib/                    # Core libraries (audio, timing, scoring)
├── stores/                 # Zustand state management
├── data/                   # Static data (rudiments, grooves, lessons)
├── hooks/                  # Custom React hooks
└── types/                  # TypeScript type definitions

tests/
├── unit/                   # 60 unit tests
├── components/             # 52 component tests
└── e2e/                    # 15 E2E tests
```

## Audio

Drum sounds are synthesized in real-time using Tone.js — no sample files needed. Five kit presets (Acoustic, Electronic, 808, Jazz, Lo-Fi) use different synth parameters for distinct character.

## License

MIT