/** Longest real-time gap (seconds) accepted per frame, to avoid a spiral of death after tab stalls. */
export const MAX_FRAME_DELTA = 0.25;

/**
 * Fixed-timestep accumulator. Adds the (capped) frame delta in milliseconds,
 * runs `step` once per whole `dt`, and returns the leftover accumulator.
 */
export function runFrame(
  accumulator: number,
  deltaMs: number,
  dt: number,
  step: () => void,
): number {
  const delta = Math.min(Math.max(deltaMs / 1000, 0), MAX_FRAME_DELTA);
  let acc = accumulator + delta;
  while (acc >= dt) {
    step();
    acc -= dt;
  }
  return acc;
}
