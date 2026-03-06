/**
 * CRYSTAL CAVERNS — Combat System
 * Enemy-player collision and damage
 */

import { PlayerState, Enemy, Particle } from '../types';
import { boxOverlap } from './physics';
import { damagePlayer } from '../entities/Player';
import { spawnDamageParticles } from './particles';

// ─── Check Enemy Contact Damage ──────────────────────────────────────────────

export function checkEnemyDamage(
  player: PlayerState,
  enemies: Enemy[],
  particles: Particle[],
): boolean {
  if (player.invincibleTimer > 0) return false;

  for (const e of enemies) {
    if (!e.active) continue;

    if (boxOverlap(player, e)) {
      // Check if player is stomping on enemy (jumping on top)
      const playerBottom = player.y + player.height;
      const enemyTop = e.y;
      const isStomping = player.vy > 0 && playerBottom - enemyTop < e.height * 0.4;

      if (isStomping && e.type !== 'spike') {
        // Kill enemy by stomping
        e.active = false;
        player.vy = -250; // bounce
        spawnDamageParticles(
          particles,
          e.x + e.width / 2,
          e.y + e.height / 2,
        );
        return false;
      } else {
        // Player takes damage
        const damaged = damagePlayer(player, e.damage);
        if (damaged) {
          spawnDamageParticles(
            particles,
            player.x + player.width / 2,
            player.y + player.height / 2,
          );
          // Knockback away from enemy
          player.vx = player.x < e.x ? -150 : 150;
        }
        return damaged;
      }
    }
  }

  return false;
}
