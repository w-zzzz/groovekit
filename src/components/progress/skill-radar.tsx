'use client';

import type { SkillProfile } from '@/types';
import { cn } from '@/lib/utils';

const AXES: { key: keyof SkillProfile; label: string }[] = [
  { key: 'timing', label: 'Timing' },
  { key: 'speed', label: 'Speed' },
  { key: 'dynamics', label: 'Dynamics' },
  { key: 'coordination', label: 'Coordination' },
  { key: 'reading', label: 'Reading' },
  { key: 'creativity', label: 'Creativity' },
];

export interface SkillRadarProps {
  skills: SkillProfile;
  size?: number;
  className?: string;
}

function round(n: number) {
  // Consistent rounding avoids server/client float-precision hydration mismatches.
  return Math.round(n * 1000) / 1000;
}

function polarPoint(cx: number, cy: number, radius: number, angleRad: number) {
  return {
    x: round(cx + radius * Math.sin(angleRad)),
    y: round(cy - radius * Math.cos(angleRad)),
  };
}

export function SkillRadar({ skills, size = 220, className }: SkillRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.36;
  const n = AXES.length;

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const axisLines = AXES.map((_, i) => {
    const angle = (i * 2 * Math.PI) / n;
    const outer = polarPoint(cx, cy, maxR, angle);
    return { x1: cx, y1: cy, x2: outer.x, y2: outer.y, angle, label: AXES[i].label };
  });

  const values = AXES.map((a) => Math.max(0, Math.min(100, skills[a.key])) / 100);
  const polygonPoints = values
    .map((v, i) => {
      const angle = (i * 2 * Math.PI) / n;
      const p = polarPoint(cx, cy, maxR * v, angle);
      return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
    })
    .join(' ');

  const labelRadius = maxR + 22;
  const labels = AXES.map((_, i) => {
    const angle = (i * 2 * Math.PI) / n;
    const p = polarPoint(cx, cy, labelRadius, angle);
    return { x: p.x, y: p.y, label: AXES[i].label };
  });

  return (
    <div className={cn('flex justify-center', className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible text-zinc-500">
        {gridLevels.map((lvl) => (
          <polygon
            key={lvl}
            points={axisLines
              .map(({ angle }) => {
                const p = polarPoint(cx, cy, maxR * lvl, angle);
                return `${p.x},${p.y}`;
              })
              .join(' ')}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.2}
            strokeWidth={1}
          />
        ))}
        {axisLines.map((line) => (
          <line
            key={`${line.x2}-${line.y2}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="currentColor"
            strokeOpacity={0.35}
            strokeWidth={1}
          />
        ))}
        <polygon
          points={polygonPoints}
          fill="rgb(251 191 36)"
          fillOpacity={0.28}
          stroke="rgb(251 191 36)"
          strokeOpacity={0.85}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        {labels.map((l) => (
          <text
            key={l.label}
            x={l.x}
            y={l.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-zinc-300 text-[10px] font-medium tracking-wide"
          >
            {l.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
