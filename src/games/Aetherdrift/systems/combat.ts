/**
 * AETHERDRIFT — Combat System
 * Attack resolution, knockback, damage
 */

import { AttackHitbox, EnemyState, BossState, Projectile, PlayerState } from '../types';
import { checkAABBCollision } from './physics';

// ─── Resolve player attack vs enemies ────────────────────────────────────────

export function resolveAttackVsEnemies(
  attack: AttackHitbox,
  enemies: EnemyState[],
): EnemyState[] {
  const hit: EnemyState[] = [];
  if (!attack.active) return hit;

  for (const e of enemies) {
    if (!e.active || e.stunTimer > 0) continue;
    if (checkAABBCollision(attack, e)) {
      e.health -= attack.damage;
      e.stunTimer = 0.3;
      e.hitFlashTimer = 0.15;
      e.vx = attack.knockbackX;
      e.vy = attack.knockbackY;
      hit.push(e);
    }
  }
  return hit;
}

// ─── Resolve player attack vs boss ───────────────────────────────────────────

export function resolveAttackVsBoss(
  attack: AttackHitbox,
  boss: BossState,
): boolean {
  if (!attack.active || !boss.active || boss.invincibleTimer > 0) return false;
  if (checkAABBCollision(attack, boss)) {
    boss.health -= attack.damage;
    boss.hitFlashTimer = 0.15;
    boss.stunTimer = 0.15;
    return true;
  }
  return false;
}

// ─── Check enemy contact damage vs player ────────────────────────────────────

export function checkEnemyContactDamage(
  player: PlayerState,
  enemies: EnemyState[],
): { enemy: EnemyState; damage: number } | null {
  if (player.invincibleTimer > 0 || player.isDashing) return null;

  for (const e of enemies) {
    if (!e.active) continue;
    if (checkAABBCollision(player, e)) {
      return { enemy: e, damage: e.damage };
    }
  }
  return null;
}

// ─── Check boss contact damage vs player ─────────────────────────────────────

export function checkBossContactDamage(
  player: PlayerState,
  boss: BossState,
): boolean {
  if (player.invincibleTimer > 0 || player.isDashing || !boss.active) return false;
  return checkAABBCollision(player, boss);
}

// ─── Check projectile hits ───────────────────────────────────────────────────

export function updateProjectiles(
  projectiles: Projectile[],
  player: PlayerState,
  enemies: EnemyState[],
  dt: number,
): { playerHit: boolean; enemiesHit: EnemyState[] } {
  const result = { playerHit: false, enemiesHit: [] as EnemyState[] };

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    proj.x += proj.vx * dt;
    proj.y += proj.vy * dt;
    proj.lifetime -= dt;

    if (proj.lifetime <= 0) {
      projectiles.splice(i, 1);
      continue;
    }

    if (proj.isPlayer) {
      // Player projectile vs enemies
      for (const e of enemies) {
        if (!e.active) continue;
        if (checkAABBCollision(proj, e)) {
          e.health -= proj.damage;
          e.hitFlashTimer = 0.15;
          e.stunTimer = 0.2;
          result.enemiesHit.push(e);
          projectiles.splice(i, 1);
          break;
        }
      }
    } else {
      // Enemy projectile vs player
      if (player.invincibleTimer <= 0 && !player.isDashing && checkAABBCollision(proj, player)) {
        result.playerHit = true;
        projectiles.splice(i, 1);
      }
    }
  }
  return result;
}

// ─── Create a projectile ─────────────────────────────────────────────────────

export function createProjectile(
  x: number, y: number,
  vx: number, vy: number,
  damage: number, color: string,
  isPlayer: boolean,
): Projectile {
  return {
    x, y,
    width: 8, height: 8,
    vx, vy,
    damage,
    color,
    lifetime: 3,
    isPlayer,
    size: 6,
  };
}
