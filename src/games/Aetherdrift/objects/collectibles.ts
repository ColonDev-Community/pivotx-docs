/**
 * AETHERDRIFT — Collectible Objects
 * Chrono shards, health pickups
 */

import { Collectible, CollectibleType } from '../types';

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createCollectible(
  x: number, y: number,
  type: CollectibleType,
): Collectible {
  const configs: Record<CollectibleType, { w: number; h: number; color: string; glow: string; value: number }> = {
    shard: { w: 10, h: 14, color: '#8be9fd', glow: '#66ccff', value: 1 },
    big_shard: { w: 16, h: 20, color: '#ffb86c', glow: '#ff9944', value: 10 },
    health: { w: 14, h: 14, color: '#ff5555', glow: '#ff3344', value: 1 },
  };
  const c = configs[type];
  return {
    x, y,
    width: c.w,
    height: c.h,
    type,
    color: c.color,
    glowColor: c.glow,
    collected: false,
    bobPhase: Math.random() * Math.PI * 2,
    value: c.value,
  };
}

// ─── Update ──────────────────────────────────────────────────────────────────

export function updateCollectibles(collectibles: Collectible[], dt: number) {
  for (const c of collectibles) {
    if (c.collected) continue;
    c.bobPhase += dt * 3;
    // Bob effect applied during rendering
  }
}
