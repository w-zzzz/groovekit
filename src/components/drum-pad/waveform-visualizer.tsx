'use client';

import { useEffect, useRef } from 'react';

const BG = '#0A0A0F';
const AMBER = '#F59E0B';

export interface WaveformVisualizerProps {
  width?: number;
  height?: number;
  /** Boosts amplitude and scroll speed while true (e.g. tied to pad hits). */
  pulse?: boolean;
}

export function WaveformVisualizer({
  width = 320,
  height = 120,
  pulse = false,
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pulseRef = useRef(pulse);

  useEffect(() => {
    pulseRef.current = pulse;
  }, [pulse]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let raf = 0;
    let phase = 0;

    const draw = () => {
      const boosted = pulseRef.current;
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, width, height);

      const mid = height / 2;
      const baseAmp = height * 0.16;
      const amp = boosted ? height * 0.38 : baseAmp;
      phase += boosted ? 0.28 : 0.11;

      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.beginPath();

      for (let x = 0; x <= width; x += 1) {
        const wobble = Math.sin(x * 0.09 + phase * 1.4) * 0.25 + 0.75;
        const y =
          mid +
          Math.sin(x * 0.06 + phase) * amp * wobble +
          Math.sin(x * 0.18 + phase * 2.1) * (boosted ? amp * 0.35 : amp * 0.12);

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();

      if (boosted) {
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
        ctx.lineWidth = 4;
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-lg border border-border bg-background"
      aria-hidden
    />
  );
}
