/** Playfield and gameplay constants. Units are canvas pixels and seconds. */

export const FIELD_WIDTH = 480;
export const FIELD_HEIGHT = 640;

/** Fixed simulation timestep in seconds. */
export const FIXED_DT = 1 / 60;

export const STARTING_LIVES = 3;

// Player
export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 20;
export const PLAYER_Y = FIELD_HEIGHT - 60;
export const PLAYER_SPEED = 240;

// Bullets
export const BULLET_WIDTH = 4;
export const BULLET_HEIGHT = 12;
export const PLAYER_BULLET_SPEED = 480;
export const INVADER_BULLET_SPEED = 220;

// Invaders
export const INVADER_ROWS = 5;
export const INVADER_COLS = 11;
export const INVADER_WIDTH = 28;
export const INVADER_HEIGHT = 20;
export const INVADER_SPACING_X = 12;
export const INVADER_SPACING_Y = 14;
export const INVADER_START_X = 30;
export const INVADER_START_Y = 80;
export const INVADER_STEP_X = 8;
export const INVADER_STEP_DOWN = 16;
/** Seconds between marching steps with a full grid (level 1). */
export const INVADER_BASE_STEP_INTERVAL = 0.8;
export const INVADER_MIN_STEP_INTERVAL = 0.05;
/** Multiplier applied to the step interval for each level beyond the first. */
export const LEVEL_SPEEDUP = 0.85;
export const INVADER_FIRE_MIN_INTERVAL = 0.6;
export const INVADER_FIRE_MAX_INTERVAL = 1.8;

/** Points by invader type index: 0 = top row, 1 = middle rows, 2 = bottom rows. */
export const INVADER_POINTS: readonly [number, number, number] = [30, 20, 10];

// Shields
export const SHIELD_COUNT = 4;
export const SHIELD_CELL_SIZE = 4;
export const SHIELD_COLS = 16;
export const SHIELD_ROWS = 10;
export const SHIELD_Y = PLAYER_Y - 80;
