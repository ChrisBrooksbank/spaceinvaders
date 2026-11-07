import { describe, expect, it } from 'vitest';
import { MAX_FRAME_DELTA, runFrame } from './loop';

describe('runFrame', () => {
  const dt = 1 / 60;

  it('steps once per whole dt and keeps the remainder', () => {
    let steps = 0;
    const acc = runFrame(0, 1000 / 30, dt, () => steps++);
    expect(steps).toBe(2);
    expect(acc).toBeLessThan(dt);
  });

  it('does not step for less than one dt', () => {
    let steps = 0;
    const acc = runFrame(0, 5, dt, () => steps++);
    expect(steps).toBe(0);
    expect(acc).toBeCloseTo(0.005);
  });

  it('caps huge frame deltas', () => {
    let steps = 0;
    runFrame(0, 60_000, dt, () => steps++);
    expect(steps).toBeLessThanOrEqual(Math.ceil(MAX_FRAME_DELTA / dt));
  });

  it('ignores negative deltas', () => {
    let steps = 0;
    expect(runFrame(0, -50, dt, () => steps++)).toBe(0);
    expect(steps).toBe(0);
  });
});
