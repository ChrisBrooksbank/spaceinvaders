import { describe, expect, it } from 'vitest';
import * as c from './constants';

describe('constants', () => {
  it('uses the specified grid, lives and points', () => {
    expect(c.INVADER_ROWS).toBe(5);
    expect(c.INVADER_COLS).toBe(11);
    expect(c.STARTING_LIVES).toBe(3);
    expect(c.INVADER_POINTS).toEqual([30, 20, 10]);
    expect(c.SHIELD_COUNT).toBe(4);
  });

  it('fits the invader grid inside the playfield', () => {
    const gridWidth = c.INVADER_COLS * c.INVADER_WIDTH + (c.INVADER_COLS - 1) * c.INVADER_SPACING_X;
    expect(c.INVADER_START_X + gridWidth + c.INVADER_STEP_X).toBeLessThan(c.FIELD_WIDTH);
  });

  it('places the player inside the playfield, below the shields', () => {
    expect(c.PLAYER_Y + c.PLAYER_HEIGHT).toBeLessThanOrEqual(c.FIELD_HEIGHT);
    expect(c.SHIELD_Y + c.SHIELD_ROWS * c.SHIELD_CELL_SIZE).toBeLessThan(c.PLAYER_Y);
  });
});
