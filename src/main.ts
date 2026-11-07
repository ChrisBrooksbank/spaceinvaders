import { FIELD_HEIGHT, FIELD_WIDTH, FIXED_DT } from './game/constants';
import { loadHighScore, saveHighScore } from './game/highscore';
import type { GameState } from './game/types';
import { createInitialState, update } from './game/update';
import { InputState, bindKeyboard } from './input';
import { render } from './render';
import { runFrame } from './loop';
import { AudioEngine } from './audio';
import { detectSounds } from './game/sounds';

const canvas = document.getElementById('game') as HTMLCanvasElement | null;
if (!canvas) {
  throw new Error('Canvas element #game not found');
}
const ctx = canvas.getContext('2d');
if (!ctx) {
  throw new Error('2D canvas context unavailable');
}

canvas.width = FIELD_WIDTH;
canvas.height = FIELD_HEIGHT;

let storage: Storage | undefined;
try {
  storage = window.localStorage;
} catch {
  storage = undefined;
}

const input = new InputState();
bindKeyboard(window, input);

const audio = new AudioEngine();
window.addEventListener('keydown', (e) => {
  audio.unlock();
  if ((e.key === 'm' || e.key === 'M') && !e.repeat) audio.toggleMute();
});

let state: GameState = createInitialState(Math.random, loadHighScore(storage));
let accumulator = 0;
let last: number | null = null;

function frame(now: number): void {
  const result = runFrame(accumulator, last === null ? 0 : now - last, FIXED_DT, () => {
    const prev = state;
    state = update(state, input.snapshot(), FIXED_DT);
    audio.play(detectSounds(prev, state));
    if (state.highScore > prev.highScore) saveHighScore(storage, state.highScore);
  });
  accumulator = result;
  last = now;
  render(ctx as CanvasRenderingContext2D, state);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
