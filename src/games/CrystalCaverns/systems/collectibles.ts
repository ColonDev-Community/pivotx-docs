/**
 * CRYSTAL CAVERNS — Collectibles System
 * Crystal collection logic
 */

import { Crystal, PlayerState, Particle } from '../types';
import { boxOverlap } from './physics';
import { spawnCrystalSparkle } from './particles';

// ─── Update Crystals ─────────────────────────────────────────────────────────

export function updateCrystals(
  crystals: Crystal[],
  player: PlayerState,
  particles: Particle[],
  dt: number,
): number {
  let collected = 0;

  for (const c of crystals) {
    if (c.collected) continue;

    // Bob animation
    c.bobTimer += dt;
    c.sparkleTimer += dt;

    // Check collection
    if (boxOverlap(player, c)) {
      c.collected = true;
      player.crystals += c.value;
      collected += c.value;
      spawnCrystalSparkle(
        particles,
        c.x + c.width / 2,
        c.y + c.height / 2,
        c.color,
      );
    }
  }

  return collected;
}
