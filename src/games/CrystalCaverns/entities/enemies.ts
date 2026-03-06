/**
 * CRYSTAL CAVERNS — Enemy Entities
 * Enemy creation and update logic
 */

import { Enemy } from '../types';
import { SLIME_COLOR, BAT_COLOR, SPIKE_COLOR } from '../constants';

// ─── Factory Functions ───────────────────────────────────────────────────────

export function createSlime(x: number, y: number, patrolRange: number = 100): Enemy {
  return {
    x, y,
    width: 24, height: 18,
    vx: 0, vy: 0,
    type: 'slime',
    speed: 50,
    patrolDir: 1,
    patrolRange,
    originX: x,
    color: SLIME_COLOR,
    animTimer: 0,
    active: true,
    damage: 1,
  };
}

export function createBat(x: number, y: number, patrolRange: number = 120): Enemy {
  return {
    x, y,
    width: 20, height: 16,
    vx: 0, vy: 0,
    type: 'bat',
    speed: 70,
    patrolDir: 1,
    patrolRange,
    originX: x,
    color: BAT_COLOR,
    animTimer: 0,
    active: true,
    damage: 1,
  };
}

export function createSpike(x: number, y: number): Enemy {
  return {
    x, y,
    width: 24, height: 12,
    vx: 0, vy: 0,
    type: 'spike',
    speed: 0,
    patrolDir: 0,
    patrolRange: 0,
    originX: x,
    color: SPIKE_COLOR,
    animTimer: 0,
    active: true,
    damage: 1,
  };
}

// ─── Update ──────────────────────────────────────────────────────────────────

export function updateEnemies(enemies: Enemy[], dt: number): void {
  for (const e of enemies) {
    if (!e.active) continue;

    e.animTimer += dt;

    switch (e.type) {
      case 'slime':
        updateSlime(e, dt);
        break;
      case 'bat':
        updateBat(e, dt);
        break;
      case 'spike':
        // static — no movement
        break;
    }
  }
}

function updateSlime(e: Enemy, dt: number): void {
  e.x += e.speed * e.patrolDir * dt;

  // Reverse direction at patrol limits
  if (e.x > e.originX + e.patrolRange) {
    e.patrolDir = -1;
  } else if (e.x < e.originX - e.patrolRange) {
    e.patrolDir = 1;
  }

  // Slight bob animation
  e.vy = Math.sin(e.animTimer * 4) * 0.5;
}

function updateBat(e: Enemy, dt: number): void {
  e.x += e.speed * e.patrolDir * dt;

  if (e.x > e.originX + e.patrolRange) {
    e.patrolDir = -1;
  } else if (e.x < e.originX - e.patrolRange) {
    e.patrolDir = 1;
  }

  // Flying sine wave
  e.y += Math.sin(e.animTimer * 5) * 1.2;
}
