import { describe, expect, it } from 'vitest';
import { createInitialState } from './game/update';
import { render } from './render';

function fakeCtx() {
  const texts: string[] = [];
  let rects = 0;
  const ctx = {
    fillRect: () => {
      rects++;
    },
    fillText: (t: string) => {
      texts.push(t);
    },
  } as unknown as CanvasRenderingContext2D;
  return { ctx, texts, rects: () => rects };
}

describe('render', () => {
  it('draws HUD and start screen without mutating state', () => {
    const state = createInitialState(() => 0.5, 120);
    const snapshot = JSON.stringify(state);
    const { ctx, texts, rects } = fakeCtx();
    render(ctx, state);
    expect(JSON.stringify(state)).toBe(snapshot);
    expect(rects()).toBeGreaterThan(0);
    expect(texts).toContain('SCORE 0');
    expect(texts).toContain('HI 120');
    expect(texts).toContain('LIVES 3');
    expect(texts).toContain('Press ENTER to start');
  });

  it('draws game over screen', () => {
    const state = { ...createInitialState(() => 0.5), phase: 'gameover' as const };
    const { ctx, texts } = fakeCtx();
    render(ctx, state);
    expect(texts).toContain('GAME OVER');
    expect(texts).toContain('Press ENTER to restart');
  });

  it('shows no overlay text while playing', () => {
    const state = { ...createInitialState(() => 0.5), phase: 'playing' as const };
    const { ctx, texts } = fakeCtx();
    render(ctx, state);
    expect(texts).not.toContain('GAME OVER');
    expect(texts).not.toContain('Press ENTER to start');
  });
});
