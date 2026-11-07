import type { Input } from './game/types';

const LEFT_KEYS = ['ArrowLeft', 'a', 'A'];
const RIGHT_KEYS = ['ArrowRight', 'd', 'D'];
const FIRE_KEYS = [' ', 'Space'];
const START_KEYS = ['Enter'];

/** Pure keyboard state: tracks pressed keys and derives the game Input. */
export class InputState {
  private readonly pressed = new Set<string>();

  press(key: string): void {
    this.pressed.add(key);
  }

  release(key: string): void {
    this.pressed.delete(key);
  }

  clear(): void {
    this.pressed.clear();
  }

  private any(keys: string[]): boolean {
    return keys.some((k) => this.pressed.has(k));
  }

  get left(): boolean {
    return this.any(LEFT_KEYS);
  }

  get right(): boolean {
    return this.any(RIGHT_KEYS);
  }

  get fire(): boolean {
    return this.any(FIRE_KEYS);
  }

  get start(): boolean {
    return this.any(START_KEYS);
  }

  snapshot(): Input {
    return { left: this.left, right: this.right, fire: this.fire, start: this.start };
  }
}

const HANDLED = [...LEFT_KEYS, ...RIGHT_KEYS, ...FIRE_KEYS, ...START_KEYS];

/** Thin DOM binding; returns an unbind function. */
export function bindKeyboard(target: Window, state: InputState): () => void {
  const down = (e: KeyboardEvent): void => {
    if (HANDLED.includes(e.key)) e.preventDefault();
    state.press(e.key);
  };
  const up = (e: KeyboardEvent): void => state.release(e.key);
  const blur = (): void => state.clear();
  target.addEventListener('keydown', down);
  target.addEventListener('keyup', up);
  target.addEventListener('blur', blur);
  return () => {
    target.removeEventListener('keydown', down);
    target.removeEventListener('keyup', up);
    target.removeEventListener('blur', blur);
  };
}
