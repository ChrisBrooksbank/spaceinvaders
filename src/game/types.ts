export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Keys the game cares about, already resolved from raw keyboard state. */
export interface Input {
  left: boolean;
  right: boolean;
  fire: boolean;
  start: boolean;
}

export type Phase = 'start' | 'playing' | 'gameover';

/** 0 = top row (30 pts), 1 = middle rows (20 pts), 2 = bottom rows (10 pts). */
export type InvaderType = 0 | 1 | 2;

export interface Bullet extends Rect {
  /** Vertical velocity in px/s; negative moves up. */
  vy: number;
}

export interface Invader extends Rect {
  type: InvaderType;
  row: number;
  col: number;
  alive: boolean;
}

export interface Player extends Rect {
  lives: number;
}

export interface Shield extends Rect {
  /** Row-major grid of cells; true = intact. */
  cells: boolean[][];
}

export interface InvaderGroup {
  invaders: Invader[];
  /** 1 = moving right, -1 = moving left. */
  direction: 1 | -1;
  /** Time accumulated toward the next marching step. */
  stepTimer: number;
  /** Time accumulated toward the next invader shot. */
  fireTimer: number;
  /** Time at which the next shot is due. */
  nextFireAt: number;
}

export interface GameState {
  phase: Phase;
  level: number;
  score: number;
  highScore: number;
  player: Player;
  playerBullet: Bullet | null;
  invaderBullets: Bullet[];
  invaders: InvaderGroup;
  shields: Shield[];
}
