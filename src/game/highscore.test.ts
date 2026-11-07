import { describe, expect, it } from 'vitest';
import {
  HIGH_SCORE_KEY,
  loadHighScore,
  nextHighScore,
  parseHighScore,
  saveHighScore,
  type ScoreStorage,
} from './highscore';

function fakeStorage(initial: Record<string, string> = {}): ScoreStorage {
  const data = { ...initial };
  return {
    getItem: (k) => data[k] ?? null,
    setItem: (k, v) => {
      data[k] = v;
    },
  };
}

const throwing: ScoreStorage = {
  getItem: () => {
    throw new Error('denied');
  },
  setItem: () => {
    throw new Error('denied');
  },
};

describe('highscore', () => {
  it('nextHighScore keeps the max', () => {
    expect(nextHighScore(100, 50)).toBe(100);
    expect(nextHighScore(100, 150)).toBe(150);
  });

  it('parseHighScore rejects invalid values', () => {
    expect(parseHighScore(null)).toBe(0);
    expect(parseHighScore('abc')).toBe(0);
    expect(parseHighScore('-5')).toBe(0);
    expect(parseHighScore('120')).toBe(120);
  });

  it('round-trips through storage', () => {
    const s = fakeStorage();
    expect(loadHighScore(s)).toBe(0);
    expect(saveHighScore(s, 340)).toBe(true);
    expect(loadHighScore(s)).toBe(340);
    expect(s.getItem(HIGH_SCORE_KEY)).toBe('340');
  });

  it('survives missing or throwing storage', () => {
    expect(loadHighScore(undefined)).toBe(0);
    expect(saveHighScore(undefined, 5)).toBe(false);
    expect(loadHighScore(throwing)).toBe(0);
    expect(saveHighScore(throwing, 5)).toBe(false);
  });
});
