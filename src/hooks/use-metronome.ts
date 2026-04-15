'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Tone,
  ensureAudioStarted,
  getTransport,
  scheduleRepeat,
} from '@/lib/audio/engine';
import {
  beatsPerMeasure,
  measureDurationMs,
  msToBpm,
  subdivisionMultiplier,
} from '@/lib/timing/calculator';
import type { Subdivision, TimeSignature } from '@/types';

const TAP_WINDOW = 4;
const EPS = 1e-6;

function ticksPerBeat(sub: Subdivision): number {
  switch (sub) {
    case 'quarter':
      return 1;
    case 'eighth':
      return 2;
    case 'sixteenth':
      return 4;
    case 'triplet':
      return 3;
  }
}

function isBeatBoundary(tickIndex: number, sub: Subdivision): boolean {
  const m = subdivisionMultiplier(sub);
  const pos = tickIndex * m;
  return Math.abs(pos - Math.round(pos)) < EPS;
}

function defaultAccents(beats: number): boolean[] {
  return Array.from({ length: beats }, (_, i) => i === 0);
}

export interface UseMetronomeOptions {
  initialTempo?: number;
  initialTimeSignature?: TimeSignature;
  initialSubdivision?: Subdivision;
  /** Called on each notated beat (aligned to the audio clock). */
  onBeat?: (beatNumber: number) => void;
}

export function useMetronome(options: UseMetronomeOptions = {}) {
  const {
    initialTempo = 120,
    initialTimeSignature = '4/4',
    initialSubdivision = 'quarter',
    onBeat: onBeatOption,
  } = options;

  const onBeatRef = useRef(onBeatOption);
  useEffect(() => {
    onBeatRef.current = onBeatOption;
  }, [onBeatOption]);

  const [tempo, setTempo] = useState(initialTempo);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>(
    initialTimeSignature,
  );
  const [subdivision, setSubdivision] = useState<Subdivision>(
    initialSubdivision,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [accentPattern, setAccentPattern] = useState<boolean[]>(() =>
    defaultAccents(beatsPerMeasure(initialTimeSignature)),
  );
  const [speedUpEnabled, setSpeedUpEnabled] = useState(false);
  const [speedUpIncrement, setSpeedUpIncrement] = useState(1);
  const [speedUpBars, setSpeedUpBars] = useState(4);

  const [currentBeat, setCurrentBeat] = useState(1);
  const [pulseTick, setPulseTick] = useState(0);

  const globalTickRef = useRef(0);
  const scheduleIdRef = useRef<number | null>(null);
  const synthRef = useRef<Tone.Synth | null>(null);
  const measureIndexRef = useRef(0);
  const tapTimesRef = useRef<number[]>([]);

  const speedUpEnabledRef = useRef(speedUpEnabled);
  const speedUpIncrementRef = useRef(speedUpIncrement);
  const speedUpBarsRef = useRef(speedUpBars);
  const accentPatternRef = useRef(accentPattern);

  useEffect(() => {
    speedUpEnabledRef.current = speedUpEnabled;
  }, [speedUpEnabled]);
  useEffect(() => {
    speedUpIncrementRef.current = speedUpIncrement;
  }, [speedUpIncrement]);
  useEffect(() => {
    speedUpBarsRef.current = speedUpBars;
  }, [speedUpBars]);
  useEffect(() => {
    accentPatternRef.current = accentPattern;
  }, [accentPattern]);

  const beats = useMemo(
    () => beatsPerMeasure(timeSignature),
    [timeSignature],
  );

  const ticksPerMeasure = useMemo(
    () => beats * ticksPerBeat(subdivision),
    [beats, subdivision],
  );

  const intervalSeconds = useMemo(() => {
    const measureMs = measureDurationMs(tempo, timeSignature);
    const beatMs = measureMs / beats;
    const stepMs = beatMs * subdivisionMultiplier(subdivision);
    return stepMs / 1000;
  }, [tempo, timeSignature, beats, subdivision]);

  const resizeAccentsForBeats = useCallback((beatsCount: number) => {
    setAccentPattern((prev) => {
      if (prev.length === beatsCount) return prev;
      const next = defaultAccents(beatsCount);
      for (let i = 0; i < Math.min(prev.length, beatsCount); i++) {
        next[i] = prev[i]!;
      }
      return next;
    });
  }, []);

  const setTimeSignatureAndAccents = useCallback(
    (ts: TimeSignature) => {
      setTimeSignature(ts);
      resizeAccentsForBeats(beatsPerMeasure(ts));
    },
    [resizeAccentsForBeats],
  );

  const ensureSynth = useCallback(() => {
    if (synthRef.current) return synthRef.current;
    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.06,
        sustain: 0,
        release: 0.02,
      },
    }).toDestination();
    synthRef.current = synth;
    return synth;
  }, []);

  useEffect(() => {
    return () => {
      if (scheduleIdRef.current != null) {
        getTransport().clear(scheduleIdRef.current);
        scheduleIdRef.current = null;
      }
      synthRef.current?.dispose();
      synthRef.current = null;
    };
  }, []);

  const stop = useCallback(() => {
    if (scheduleIdRef.current != null) {
      getTransport().clear(scheduleIdRef.current);
      scheduleIdRef.current = null;
    }
    getTransport().stop();
    setIsPlaying(false);
    globalTickRef.current = 0;
    measureIndexRef.current = 0;
    setCurrentBeat(1);
    setPulseTick(0);
  }, []);

  const start = useCallback(async () => {
    await ensureAudioStarted();
    ensureSynth();
    globalTickRef.current = 0;
    measureIndexRef.current = 0;
    setPulseTick(0);
    setIsPlaying(true);
  }, [ensureSynth]);

  const togglePlay = useCallback(() => {
    if (isPlaying) stop();
    else void start();
  }, [isPlaying, start, stop]);

  const tapTempo = useCallback(() => {
    const now = performance.now();
    const nextTaps = [...tapTimesRef.current, now].slice(-TAP_WINDOW);
    tapTimesRef.current = nextTaps;

    if (nextTaps.length < 2) return;
    const intervals: number[] = [];
    for (let i = 1; i < nextTaps.length; i++) {
      intervals.push(nextTaps[i]! - nextTaps[i - 1]!);
    }
    const avgMs =
      intervals.reduce((sum, n) => sum + n, 0) / intervals.length;
    if (avgMs <= 0) return;
    const nextBpm = Math.round(msToBpm(avgMs));
    setTempo(() => Math.min(300, Math.max(30, nextBpm)));
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    let cancelled = false;

    const setup = async () => {
      await ensureAudioStarted();
      if (cancelled) return;

      if (scheduleIdRef.current != null) {
        getTransport().clear(scheduleIdRef.current);
        scheduleIdRef.current = null;
      }

      const transport = getTransport();
      transport.bpm.value = tempo;
      transport.start();

      const synth = ensureSynth();
      const id = scheduleRepeat((time) => {
        const tick = globalTickRef.current;
        const tickIndex = tick % ticksPerMeasure;
        const m = subdivisionMultiplier(subdivision);
        const positionInBeats = tickIndex * m;
        const beatIndex =
          (Math.floor(positionInBeats + EPS) % beats + beats) % beats;
        const beatNumber = beatIndex + 1;
        const onBeat = isBeatBoundary(tickIndex, subdivision);

        const accents = accentPatternRef.current;
        const isDownbeat = beatIndex === 0;

        let velocity = 0.22;
        if (onBeat) {
          const accented = Boolean(accents[beatIndex] ?? false);
          if (isDownbeat) {
            velocity = 0.95;
          } else if (accented) {
            velocity = 0.78;
          } else {
            velocity = 0.42;
          }
        }

        const note = onBeat ? 'B5' : 'G5';
        synth.triggerAttackRelease(note, '32n', time, velocity);

        const prevMeasure = measureIndexRef.current;
        const measureIndex = Math.floor(tick / ticksPerMeasure);
        measureIndexRef.current = measureIndex;

        if (
          speedUpEnabledRef.current &&
          measureIndex > prevMeasure &&
          measureIndex > 0 &&
          measureIndex % speedUpBarsRef.current === 0
        ) {
          const inc = speedUpIncrementRef.current;
          setTempo((b) => Math.min(300, b + inc));
        }

        Tone.Draw.schedule(() => {
          setCurrentBeat(beatNumber);
          if (onBeat) {
            setPulseTick((k) => k + 1);
            onBeatRef.current?.(beatNumber);
          }
        }, time);

        globalTickRef.current += 1;
      }, intervalSeconds);

      scheduleIdRef.current = id;
    };

    void setup();

    return () => {
      cancelled = true;
      if (scheduleIdRef.current != null) {
        getTransport().clear(scheduleIdRef.current);
        scheduleIdRef.current = null;
      }
    };
  }, [
    isPlaying,
    tempo,
    timeSignature,
    subdivision,
    beats,
    ticksPerMeasure,
    intervalSeconds,
    ensureSynth,
  ]);

  const toggleAccent = useCallback((beatIndex: number) => {
    setAccentPattern((prev) => {
      const next = [...prev];
      if (beatIndex < 0 || beatIndex >= next.length) return prev;
      next[beatIndex] = !next[beatIndex];
      return next;
    });
  }, []);

  const setAccentPatternSafe = useCallback((pattern: boolean[]) => {
    setAccentPattern(pattern.slice(0, beats));
  }, [beats]);

  return {
    tempo,
    setTempo,
    timeSignature,
    setTimeSignature: setTimeSignatureAndAccents,
    subdivision,
    setSubdivision,
    isPlaying,
    start,
    stop,
    togglePlay,
    accentPattern,
    toggleAccent,
    setAccentPattern: setAccentPatternSafe,
    speedUpEnabled,
    setSpeedUpEnabled,
    speedUpIncrement,
    setSpeedUpIncrement,
    speedUpBars,
    setSpeedUpBars,
    currentBeat,
    pulseTick,
    tapTempo,
    beats,
    ticksPerMeasure,
  };
}
