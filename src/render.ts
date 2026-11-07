import { FIELD_HEIGHT, FIELD_WIDTH, SHIELD_CELL_SIZE } from './game/constants';
import type { Bullet, GameState, Invader, InvaderType, Shield } from './game/types';

/** Drawing only: reads state, never mutates it. Expects a FIELD_WIDTH x FIELD_HEIGHT canvas. */

const INVADER_COLORS: Record<InvaderType, string> = {
  0: '#ff5ec4',
  1: '#5ee0ff',
  2: '#8dff5e',
};
const PLAYER_COLOR = '#5eff8d';
const SHIELD_COLOR = '#3fbf3f';
const PLAYER_BULLET_COLOR = '#ffffff';
const INVADER_BULLET_COLOR = '#ffd35e';
const TEXT_COLOR = '#ffffff';
const FONT = '16px monospace';

function drawInvader(ctx: CanvasRenderingContext2D, inv: Invader): void {
  const { x, y, width: w, height: h } = inv;
  ctx.fillStyle = INVADER_COLORS[inv.type];
  // Body, with a distinct silhouette per type.
  if (inv.type === 0) {
    ctx.fillRect(x + w * 0.25, y, w * 0.5, h * 0.6);
    ctx.fillRect(x, y + h * 0.4, w, h * 0.3);
  } else if (inv.type === 1) {
    ctx.fillRect(x + w * 0.1, y, w * 0.8, h * 0.7);
    ctx.fillRect(x, y + h * 0.3, w, h * 0.2);
  } else {
    ctx.fillRect(x, y, w, h * 0.7);
  }
  // Legs
  ctx.fillRect(x + w * 0.15, y + h * 0.7, w * 0.15, h * 0.3);
  ctx.fillRect(x + w * 0.7, y + h * 0.7, w * 0.15, h * 0.3);
  // Eyes
  ctx.fillStyle = '#000';
  ctx.fillRect(x + w * 0.3, y + h * 0.25, w * 0.12, h * 0.15);
  ctx.fillRect(x + w * 0.58, y + h * 0.25, w * 0.12, h * 0.15);
}

function drawShield(ctx: CanvasRenderingContext2D, shield: Shield): void {
  ctx.fillStyle = SHIELD_COLOR;
  shield.cells.forEach((rowCells, row) => {
    rowCells.forEach((intact, col) => {
      if (intact) {
        ctx.fillRect(
          shield.x + col * SHIELD_CELL_SIZE,
          shield.y + row * SHIELD_CELL_SIZE,
          SHIELD_CELL_SIZE,
          SHIELD_CELL_SIZE,
        );
      }
    });
  });
}

function drawBullet(ctx: CanvasRenderingContext2D, bullet: Bullet, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
}

function drawCenteredText(ctx: CanvasRenderingContext2D, text: string, y: number, size = 16): void {
  ctx.font = `${size}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillStyle = TEXT_COLOR;
  ctx.fillText(text, FIELD_WIDTH / 2, y);
}

function drawHud(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.font = FONT;
  ctx.fillStyle = TEXT_COLOR;
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE ${state.score}`, 10, 24);
  ctx.textAlign = 'center';
  ctx.fillText(`HI ${state.highScore}`, FIELD_WIDTH / 2, 24);
  ctx.textAlign = 'right';
  ctx.fillText(`LIVES ${state.player.lives}`, FIELD_WIDTH - 10, 24);
  ctx.textAlign = 'left';
  ctx.fillText(`LEVEL ${state.level}`, 10, FIELD_HEIGHT - 10);
}

function drawOverlay(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);
}

/** Draws the whole frame for the given state. */
export function render(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);

  for (const shield of state.shields) drawShield(ctx, shield);
  for (const inv of state.invaders.invaders) {
    if (inv.alive) drawInvader(ctx, inv);
  }

  const { player } = state;
  ctx.fillStyle = PLAYER_COLOR;
  ctx.fillRect(player.x, player.y + player.height * 0.4, player.width, player.height * 0.6);
  ctx.fillRect(player.x + player.width * 0.4, player.y, player.width * 0.2, player.height * 0.4);

  if (state.playerBullet) drawBullet(ctx, state.playerBullet, PLAYER_BULLET_COLOR);
  for (const b of state.invaderBullets) drawBullet(ctx, b, INVADER_BULLET_COLOR);

  drawHud(ctx, state);

  if (state.phase === 'start') {
    drawOverlay(ctx);
    drawCenteredText(ctx, 'SPACE INVADERS', FIELD_HEIGHT / 2 - 20, 32);
    drawCenteredText(ctx, 'Press ENTER to start', FIELD_HEIGHT / 2 + 20);
    drawCenteredText(ctx, 'Arrows / A D move, SPACE fires', FIELD_HEIGHT / 2 + 50);
  } else if (state.phase === 'gameover') {
    drawOverlay(ctx);
    drawCenteredText(ctx, 'GAME OVER', FIELD_HEIGHT / 2 - 40, 32);
    drawCenteredText(ctx, `Score ${state.score}`, FIELD_HEIGHT / 2);
    drawCenteredText(ctx, `High score ${state.highScore}`, FIELD_HEIGHT / 2 + 25);
    drawCenteredText(ctx, 'Press ENTER to restart', FIELD_HEIGHT / 2 + 60);
  }
}
