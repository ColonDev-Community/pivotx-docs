/**
 * AETHERDRIFT — Platform Objects
 * Platform creation and update (moving/breakable)
 */

import { Platform, PlatformType } from '../types';

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createPlatform(
  x: number, y: number,
  w: number, h: number,
  type: PlatformType,
  color: string,
  accent: string,
  moveSpeed = 0,
  moveRange = 0,
): Platform {
  return {
    x, y,
    width: w,
    height: h,
    type,
    color,
    accentColor: accent,
    moveSpeed,
    moveRange,
    moveOriginX: x,
    moveOriginY: y,
    moveProgress: Math.random() * Math.PI * 2,
    breakTimer: 0,
    broken: false,
    stepped: false,
  };
}

// ─── Update moving and breakable platforms ───────────────────────────────────

export function updatePlatforms(platforms: Platform[], dt: number) {
  for (const p of platforms) {
    switch (p.type) {
      case 'moving_h':
        p.moveProgress += p.moveSpeed * dt;
        p.x = p.moveOriginX + Math.sin(p.moveProgress) * p.moveRange;
        break;
      case 'moving_v':
        p.moveProgress += p.moveSpeed * dt;
        p.y = p.moveOriginY + Math.sin(p.moveProgress) * p.moveRange;
        break;
      case 'breakable':
        if (p.stepped && !p.broken) {
          p.breakTimer += dt;
          if (p.breakTimer > 0.5) {
            p.broken = true;
          }
        }
        break;
    }
  }
}

// ─── Create ground segment ───────────────────────────────────────────────────

export function createGroundSegment(
  x: number,
  groundY: number,
  width: number,
  color: string,
  accent: string,
): Platform {
  return createPlatform(x, groundY, width, 60, 'solid', color, accent);
}
