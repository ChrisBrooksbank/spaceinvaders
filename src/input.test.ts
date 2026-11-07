import { describe, expect, it } from 'vitest';
import { InputState } from './input';

describe('InputState', () => {
  it('starts with nothing pressed', () => {
    expect(new InputState().snapshot()).toEqual({
      left: false,
      right: false,
      fire: false,
      start: false,
    });
  });

  it.each([['ArrowLeft'], ['a'], ['A']])('%s maps to left', (key) => {
    const s = new InputState();
    s.press(key);
    expect(s.left).toBe(true);
    expect(s.right).toBe(false);
  });

  it.each([['ArrowRight'], ['d'], ['D']])('%s maps to right', (key) => {
    const s = new InputState();
    s.press(key);
    expect(s.right).toBe(true);
  });

  it('maps Space to fire and Enter to start', () => {
    const s = new InputState();
    s.press(' ');
    s.press('Enter');
    expect(s.fire).toBe(true);
    expect(s.start).toBe(true);
  });

  it('release stops the action, even with two keys for it held', () => {
    const s = new InputState();
    s.press('ArrowLeft');
    s.press('a');
    s.release('ArrowLeft');
    expect(s.left).toBe(true);
    s.release('a');
    expect(s.left).toBe(false);
  });

  it('clear releases everything', () => {
    const s = new InputState();
    s.press('ArrowRight');
    s.clear();
    expect(s.right).toBe(false);
  });
});
