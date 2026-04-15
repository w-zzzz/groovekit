import { describe, it, expect } from 'vitest';
import {
  bpmToMs,
  msToBpm,
  subdivisionMultiplier,
  subdivisionInterval,
  swingOffset,
  gradeTimingAccuracy,
  timingScore,
  calculateAccuracy,
  beatsPerMeasure,
  beatUnit,
  measureDurationMs,
  stepDurationMs,
} from '@/lib/timing/calculator';

describe('timing calculator', () => {
  describe('bpmToMs', () => {
    it('maps 120 BPM to 500ms per quarter note', () => {
      expect(bpmToMs(120)).toBe(500);
    });

    it('maps 60 BPM to 1000ms per quarter note', () => {
      expect(bpmToMs(60)).toBe(1000);
    });

    it('maps 240 BPM to 250ms per quarter note', () => {
      expect(bpmToMs(240)).toBe(250);
    });
  });

  describe('msToBpm', () => {
    it('inverts bpmToMs for 120 BPM', () => {
      expect(msToBpm(500)).toBe(120);
    });

    it('inverts bpmToMs for 60 BPM', () => {
      expect(msToBpm(1000)).toBe(60);
    });

    it('inverts bpmToMs for 240 BPM', () => {
      expect(msToBpm(250)).toBe(240);
    });
  });

  describe('subdivisionMultiplier', () => {
    it('returns 1 for quarter notes', () => {
      expect(subdivisionMultiplier('quarter')).toBe(1);
    });

    it('returns 0.5 for eighth notes', () => {
      expect(subdivisionMultiplier('eighth')).toBe(0.5);
    });

    it('returns 0.25 for sixteenth notes', () => {
      expect(subdivisionMultiplier('sixteenth')).toBe(0.25);
    });

    it('returns one third for triplets', () => {
      expect(subdivisionMultiplier('triplet')).toBeCloseTo(1 / 3);
    });
  });

  describe('subdivisionInterval', () => {
    it('combines BPM and subdivision (120 BPM sixteenth = 125ms)', () => {
      expect(subdivisionInterval(120, 'sixteenth')).toBe(125);
    });

    it('combines BPM and triplet subdivision', () => {
      expect(subdivisionInterval(120, 'triplet')).toBeCloseTo((500 * 1) / 3);
    });
  });

  describe('swingOffset', () => {
    it('returns 0 when swing amount is 0', () => {
      expect(swingOffset(120, 0)).toBe(0);
    });

    it('returns max eighth-based offset when swing is 1.0', () => {
      const eighthMs = bpmToMs(120) * 0.5;
      expect(swingOffset(120, 1)).toBe(eighthMs * 0.33);
    });

    it('scales linearly with swing amount', () => {
      expect(swingOffset(100, 0.5)).toBeCloseTo(swingOffset(100, 1) * 0.5);
    });
  });

  describe('gradeTimingAccuracy', () => {
    it('treats 0ms as perfect', () => {
      expect(gradeTimingAccuracy(0)).toBe('perfect');
    });

    it('treats 25ms as perfect', () => {
      expect(gradeTimingAccuracy(25)).toBe('perfect');
    });

    it('treats 26ms as great', () => {
      expect(gradeTimingAccuracy(26)).toBe('great');
    });

    it('treats 50ms as great', () => {
      expect(gradeTimingAccuracy(50)).toBe('great');
    });

    it('treats 51ms as good', () => {
      expect(gradeTimingAccuracy(51)).toBe('good');
    });

    it('treats 100ms as good', () => {
      expect(gradeTimingAccuracy(100)).toBe('good');
    });

    it('treats 101ms as miss', () => {
      expect(gradeTimingAccuracy(101)).toBe('miss');
    });

    it('uses absolute value for negative offsets', () => {
      expect(gradeTimingAccuracy(-25)).toBe('perfect');
      expect(gradeTimingAccuracy(-50)).toBe('great');
      expect(gradeTimingAccuracy(-100)).toBe('good');
      expect(gradeTimingAccuracy(-101)).toBe('miss');
    });
  });

  describe('timingScore', () => {
    it('maps grades to fixed scores', () => {
      expect(timingScore('perfect')).toBe(100);
      expect(timingScore('great')).toBe(75);
      expect(timingScore('good')).toBe(50);
      expect(timingScore('miss')).toBe(0);
    });
  });

  describe('calculateAccuracy', () => {
    it('returns 0 for an empty grade list', () => {
      expect(calculateAccuracy([])).toBe(0);
    });

    it('returns 100 when every hit is perfect', () => {
      expect(calculateAccuracy(['perfect', 'perfect', 'perfect'])).toBe(100);
    });

    it('returns the rounded mean score for mixed grades', () => {
      expect(calculateAccuracy(['perfect', 'great'])).toBe(Math.round((100 + 75) / 2));
      expect(calculateAccuracy(['good', 'miss', 'perfect'])).toBe(
        Math.round((50 + 0 + 100) / 3),
      );
    });
  });

  describe('beatsPerMeasure', () => {
    it('parses the numerator of common signatures', () => {
      expect(beatsPerMeasure('4/4')).toBe(4);
      expect(beatsPerMeasure('3/4')).toBe(3);
      expect(beatsPerMeasure('7/8')).toBe(7);
    });
  });

  describe('beatUnit', () => {
    it('parses the denominator', () => {
      expect(beatUnit('4/4')).toBe(4);
      expect(beatUnit('6/8')).toBe(8);
    });
  });

  describe('measureDurationMs', () => {
    it('computes one 4/4 bar at 120 BPM as 2000ms', () => {
      expect(measureDurationMs(120, '4/4')).toBe(2000);
    });
  });

  describe('stepDurationMs', () => {
    it('divides one 4/4 bar across 16 steps at 120 BPM', () => {
      expect(stepDurationMs(120, 16)).toBe(125);
    });
  });
});
