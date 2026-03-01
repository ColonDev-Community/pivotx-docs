/**
 * AETHERDRIFT — Physics System
 * Gravity, AABB collision detection & resolution
 */

import { AABB, Entity } from '../types';

// ─── AABB Collision ──────────────────────────────────────────────────────────

export function checkAABBCollision(a: AABB, b: AABB): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// ─── Resolve Y axis (top/bottom) ─────────────────────────────────────────────

export function resolveYCollision(entity: Entity, solid: AABB): 'top' | 'bottom' | null {
  const overlapTop = (entity.y + entity.height) - solid.y;
  const overlapBottom = (solid.y + solid.height) - entity.y;

  if (overlapTop < overlapBottom && overlapTop < entity.height * 0.6 && entity.vy >= 0) {
    // Landing on top
    entity.y = solid.y - entity.height;
    return 'top';
  } else if (overlapBottom < overlapTop && overlapBottom < entity.height * 0.6 && entity.vy <= 0) {
    // Hitting bottom
    entity.y = solid.y + solid.height;
    return 'bottom';
  }
  return null;
}

// ─── Resolve X axis (left/right) ─────────────────────────────────────────────

export function resolveXCollision(entity: Entity, solid: AABB): 'left' | 'right' | null {
  const overlapLeft = (entity.x + entity.width) - solid.x;
  const overlapRight = (solid.x + solid.width) - entity.x;

  if (overlapLeft < overlapRight && overlapLeft < entity.width * 0.8) {
    entity.x = solid.x - entity.width;
    if (entity.vx > 0) entity.vx = 0;
    return 'left';
  } else if (overlapRight < overlapLeft && overlapRight < entity.width * 0.8) {
    entity.x = solid.x + solid.width;
    if (entity.vx < 0) entity.vx = 0;
    return 'right';
  }
  return null;
}

// ─── Distance between centers ────────────────────────────────────────────────

export function distBetween(a: AABB, b: AABB): number {
  const ax = a.x + a.width / 2;
  const ay = a.y + a.height / 2;
  const bx = b.x + b.width / 2;
  const by = b.y + b.height / 2;
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

export function distX(a: AABB, b: AABB): number {
  return (a.x + a.width / 2) - (b.x + b.width / 2);
}

// ─── Point in AABB ───────────────────────────────────────────────────────────

export function pointInAABB(px: number, py: number, box: AABB): boolean {
  return px >= box.x && px <= box.x + box.width && py >= box.y && py <= box.y + box.height;
}

// ─── Clamp ───────────────────────────────────────────────────────────────────

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

// ─── Lerp ────────────────────────────────────────────────────────────────────

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
