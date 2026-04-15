import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatBPM(bpm: number): string {
  return `${Math.round(bpm)} BPM`;
}

export function bpmToMs(bpm: number): number {
  return 60000 / bpm;
}

export function msToBpm(ms: number): number {
  return 60000 / ms;
}
