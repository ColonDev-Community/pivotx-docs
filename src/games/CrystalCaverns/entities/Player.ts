/**
 * CRYSTAL CAVERNS — Player Entity
 * Player creation, movement, and physics
 */

import { PlayerState, PlatformData } from '../types';
import {
  PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_MAX_HEALTH,
  PLAYER_SPEED, PLAYER_JUMP_FORCE,
  GRAVITY, MAX_FALL_SPEED, GROUND_FRICTION,
  INVINCIBLE_TIME,
  ANIM_IDLE_FPS, ANIM_RUN_FPS,
} from '../constants';

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createPlayer(x: number, y: number): PlayerState {
  return {
    x, y,
    vx: 0, vy: 0,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    speed: PLAYER_SPEED,
    jumpForce: PLAYER_JUMP_FORCE,
    isGrounded: false,
    facingRight: true,
    animState: 'idle',
    animFrame: 0,
    animTimer: 0,
    crystals: 0,
    invincibleTimer: 0,
    health: PLAYER_MAX_HEALTH,
    maxHealth: PLAYER_MAX_HEALTH,
  };
}

// ─── Input ───────────────────────────────────────────────────────────────────

export interface PlayerInput {
  left: boolean;
  right: boolean;
  jump: boolean;
}

// ─── Update ──────────────────────────────────────────────────────────────────

export function updatePlayer(
  p: PlayerState,
  input: PlayerInput,
  platforms: PlatformData[],
  tileCollider: (px: number, py: number, pw: number, ph: number) => { x: number; y: number; landed: boolean; hitHead: boolean; hitWall: boolean },
  dt: number,
): void {
  // ── Invincibility timer ──
  if (p.invincibleTimer > 0) {
    p.invincibleTimer -= dt;
  }

  // ── Horizontal input ──
  p.vx = 0;
  if (input.left) {
    p.vx = -p.speed;
    p.facingRight = false;
  }
  if (input.right) {
    p.vx = p.speed;
    p.facingRight = true;
  }

  // ── Jump ──
  if (input.jump && p.isGrounded) {
    p.vy = p.jumpForce;
    p.isGrounded = false;
  }

  // ── Gravity ──
  p.vy += GRAVITY * dt;
  if (p.vy > MAX_FALL_SPEED) p.vy = MAX_FALL_SPEED;

  // ── Move ──
  p.x += p.vx * dt;
  p.y += p.vy * dt;

  // ── Tile collision ──
  p.isGrounded = false;
  const result = tileCollider(p.x, p.y, p.width, p.height);
  p.x = result.x;
  p.y = result.y;
  if (result.landed) {
    p.vy = 0;
    p.isGrounded = true;
  }
  if (result.hitHead) {
    p.vy = 0;
  }

  // ── Platform collision ──
  for (const plat of platforms) {
    if (!boxOverlap(p, plat)) continue;

    const depth = overlapDepth(p, plat);
    if (!depth) continue;

    if (depth.dy < depth.dx) {
      if (p.vy > 0 && p.y + p.height - plat.y < p.height * 0.5) {
        p.y = plat.y - p.height;
        p.vy = 0;
        p.isGrounded = true;
      } else if (p.vy < 0 && !plat.oneWay) {
        p.y = plat.y + plat.height;
        p.vy = 0;
      }
    } else if (!plat.oneWay) {
      if (p.vx > 0) p.x -= depth.dx;
      else p.x += depth.dx;
      p.vx = 0;
    }
  }

  // ── Friction ──
  if (p.isGrounded && p.vx === 0) {
    p.vx *= GROUND_FRICTION;
  }

  // ── Animation state ──
  updateAnimation(p, dt);
}

// ─── Animation ───────────────────────────────────────────────────────────────

function updateAnimation(p: PlayerState, dt: number): void {
  let newState = p.animState;

  if (!p.isGrounded) {
    newState = p.vy < 0 ? 'jump' : 'fall';
  } else if (Math.abs(p.vx) > 10) {
    newState = 'run';
  } else {
    newState = 'idle';
  }

  if (newState !== p.animState) {
    p.animState = newState;
    p.animFrame = 0;
    p.animTimer = 0;
  }

  const fps = p.animState === 'run' ? ANIM_RUN_FPS : ANIM_IDLE_FPS;
  p.animTimer += dt;
  if (p.animTimer >= 1 / fps) {
    p.animTimer -= 1 / fps;
    p.animFrame++;
  }
}

// ─── Damage ──────────────────────────────────────────────────────────────────

export function damagePlayer(p: PlayerState, damage: number): boolean {
  if (p.invincibleTimer > 0) return false;
  p.health -= damage;
  p.invincibleTimer = INVINCIBLE_TIME;
  p.vy = -200; // knockback up
  return true;
}

// ─── Collision Helpers ───────────────────────────────────────────────────────

function boxOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function overlapDepth(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): { dx: number; dy: number } | null {
  const dx = Math.min(a.x + a.width - b.x, b.x + b.width - a.x);
  const dy = Math.min(a.y + a.height - b.y, b.y + b.height - a.y);
  if (dx <= 0 || dy <= 0) return null;
  return { dx, dy };
}
