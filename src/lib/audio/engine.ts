import * as Tone from 'tone';
import type { DrumPiece, KitName, Velocity } from '@/types';

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnySynth = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

interface SynthKit {
  name: KitName;
  synths: Record<DrumPiece, AnySynth>;
}

const VELOCITY_MAP: Record<Velocity, number> = {
  ghost: 0.3,
  normal: 0.7,
  accent: 1.0,
};

function createKickSynth(decay: number, pitchDecay: number) {
  return new Tone.MembraneSynth({
    pitchDecay,
    octaves: 6,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay, sustain: 0, release: 0.1 },
  }).toDestination();
}

function createSnareSynth(noiseType: 'white' | 'pink', decay: number) {
  const noise = new Tone.NoiseSynth({
    noise: { type: noiseType },
    envelope: { attack: 0.001, decay, sustain: 0, release: 0.05 },
  }).toDestination();
  const body = new Tone.MembraneSynth({
    pitchDecay: 0.01,
    octaves: 4,
    envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.05 },
  }).toDestination();
  return {
    triggerAttackRelease: (note: string, dur: string, time?: number, vel?: number) => {
      noise.triggerAttackRelease(dur, time, vel);
      body.triggerAttackRelease('C2', dur, time, vel);
    },
    _type: 'snare' as const,
  };
}

function createMetalSynth(freq: number, envelope: { decay: number }) {
  return new Tone.MetalSynth({
    envelope: { attack: 0.001, decay: envelope.decay, release: 0.05 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5,
  }).toDestination();
}

function createTomSynth(pitch: string, decay: number) {
  const synth = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 4,
    envelope: { attack: 0.001, decay, sustain: 0, release: 0.1 },
  }).toDestination();
  return {
    triggerAttackRelease: (_note: string, dur: string, time?: number, vel?: number) => {
      synth.triggerAttackRelease(pitch, dur, time, vel);
    },
    _type: 'tom' as const,
    _pitch: pitch,
  };
}

const KIT_CONFIGS: Record<KitName, () => SynthKit['synths']> = {
  acoustic: () => ({
    'kick': createKickSynth(0.2, 0.05),
    'snare': createSnareSynth('white', 0.15),
    'hihat-closed': createMetalSynth(400, { decay: 0.05 }),
    'hihat-open': createMetalSynth(400, { decay: 0.3 }),
    'tom-high': createTomSynth('G3', 0.2),
    'tom-mid': createTomSynth('D3', 0.25),
    'tom-low': createTomSynth('A2', 0.3),
    'crash': createMetalSynth(300, { decay: 1.2 }),
    'ride': createMetalSynth(500, { decay: 0.8 }),
  }),
  electronic: () => ({
    'kick': createKickSynth(0.15, 0.08),
    'snare': createSnareSynth('pink', 0.12),
    'hihat-closed': createMetalSynth(600, { decay: 0.03 }),
    'hihat-open': createMetalSynth(600, { decay: 0.2 }),
    'tom-high': createTomSynth('A3', 0.15),
    'tom-mid': createTomSynth('E3', 0.18),
    'tom-low': createTomSynth('B2', 0.22),
    'crash': createMetalSynth(350, { decay: 0.8 }),
    'ride': createMetalSynth(550, { decay: 0.5 }),
  }),
  '808': () => ({
    'kick': createKickSynth(0.5, 0.02),
    'snare': createSnareSynth('white', 0.2),
    'hihat-closed': createMetalSynth(800, { decay: 0.02 }),
    'hihat-open': createMetalSynth(800, { decay: 0.15 }),
    'tom-high': createTomSynth('G3', 0.3),
    'tom-mid': createTomSynth('D3', 0.35),
    'tom-low': createTomSynth('A2', 0.4),
    'crash': createMetalSynth(250, { decay: 1.5 }),
    'ride': createMetalSynth(450, { decay: 0.6 }),
  }),
  jazz: () => ({
    'kick': createKickSynth(0.12, 0.03),
    'snare': createSnareSynth('pink', 0.1),
    'hihat-closed': createMetalSynth(500, { decay: 0.04 }),
    'hihat-open': createMetalSynth(500, { decay: 0.25 }),
    'tom-high': createTomSynth('A3', 0.18),
    'tom-mid': createTomSynth('F3', 0.22),
    'tom-low': createTomSynth('C3', 0.26),
    'crash': createMetalSynth(280, { decay: 1.0 }),
    'ride': createMetalSynth(520, { decay: 1.2 }),
  }),
  lofi: () => ({
    'kick': createKickSynth(0.3, 0.04),
    'snare': createSnareSynth('pink', 0.18),
    'hihat-closed': createMetalSynth(350, { decay: 0.04 }),
    'hihat-open': createMetalSynth(350, { decay: 0.2 }),
    'tom-high': createTomSynth('F3', 0.2),
    'tom-mid': createTomSynth('C3', 0.25),
    'tom-low': createTomSynth('G2', 0.3),
    'crash': createMetalSynth(220, { decay: 1.0 }),
    'ride': createMetalSynth(400, { decay: 0.7 }),
  }),
};

let currentKit: SynthKit | null = null;

export async function ensureAudioStarted() {
  if (Tone.getContext().state !== 'running') {
    await Tone.start();
  }
}

export function loadKit(name: KitName): SynthKit {
  if (currentKit?.name === name) return currentKit;
  currentKit = { name, synths: KIT_CONFIGS[name]() };
  return currentKit;
}

export function playDrum(piece: DrumPiece, velocity: Velocity = 'normal') {
  if (!currentKit) loadKit('acoustic');
  const synth = currentKit!.synths[piece];
  if (!synth) return;
  const vel = VELOCITY_MAP[velocity];

  if (synth._type === 'snare' || synth._type === 'tom') {
    synth.triggerAttackRelease(synth._pitch ?? 'C2', '8n', undefined, vel);
  } else if (synth instanceof Tone.MembraneSynth) {
    synth.triggerAttackRelease('C1', '8n', undefined, vel);
  } else if (synth instanceof Tone.MetalSynth) {
    synth.triggerAttackRelease('8n', Tone.now(), vel);
  }
}

export function getTransport() {
  return Tone.getTransport();
}

export function scheduleRepeat(callback: (time: number) => void, interval: string | number) {
  return Tone.getTransport().scheduleRepeat(callback, interval);
}

export function clearTransport() {
  Tone.getTransport().cancel();
  Tone.getTransport().stop();
}

export { Tone };
