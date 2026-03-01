/**
 * AETHERDRIFT — Enemy Entities
 * Enemy creation, AI behaviors, boss logic
 */

import { EnemyState, EnemyType, BossState, BossType, PlayerState, Projectile } from '../types';
import { ENEMY_TEMPLATES, BOSS_TEMPLATES, GRAVITY, MAX_FALL_SPEED } from '../constants';
import { distBetween, distX } from '../systems/physics';
import { createProjectile } from '../systems/combat';

// ─── Enemy Factory ───────────────────────────────────────────────────────────

export function createEnemy(type: EnemyType, x: number, y: number): EnemyState {
  const t = ENEMY_TEMPLATES[type];
  return {
    x, y,
    width: t.width,
    height: t.height,
    vx: 0, vy: 0,
    type,
    health: t.health,
    maxHealth: t.health,
    damage: t.damage,
    speed: t.speed,
    behavior: t.behavior,
    patrolDir: Math.random() > 0.5 ? 1 : -1,
    patrolRange: t.patrolRange,
    color: t.color,
    glowColor: t.glowColor,
    detectionRange: t.detectionRange,
    attackCooldown: t.attackCooldown,
    lastAttack: 0,
    stunTimer: 0,
    animTimer: Math.random() * Math.PI * 2,
    spawnX: x,
    spawnY: y,
    active: true,
    hitFlashTimer: 0,
  };
}

// ─── Enemy AI Update ─────────────────────────────────────────────────────────

export function updateEnemies(
  enemies: EnemyState[],
  player: PlayerState,
  dt: number,
  groundY: number,
  time: number,
): Projectile[] {
  const newProjectiles: Projectile[] = [];

  for (const e of enemies) {
    if (!e.active) continue;

    e.animTimer += dt;
    if (e.hitFlashTimer > 0) e.hitFlashTimer -= dt;
    if (e.stunTimer > 0) {
      e.stunTimer -= dt;
      // Apply knockback deceleration
      e.vx *= 0.9;
      e.vy += GRAVITY * dt;
      if (e.vy > MAX_FALL_SPEED) e.vy = MAX_FALL_SPEED;
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      // Ground clamp
      if (e.y + e.height > groundY) {
        e.y = groundY - e.height;
        e.vy = 0;
      }
      continue;
    }

    const dist = distBetween(e, player);
    const dx = distX(player, e);

    switch (e.behavior) {
      case 'patrol': {
        // Walk back and forth, chase if player is near
        if (dist < e.detectionRange) {
          // Chase
          const dir = dx > 0 ? 1 : -1;
          e.vx = dir * e.speed * 1.3;
        } else {
          // Patrol
          e.vx = e.patrolDir * e.speed;
          if (Math.abs(e.x - e.spawnX) > e.patrolRange) {
            e.patrolDir *= -1;
          }
        }
        // Gravity
        e.vy += GRAVITY * dt;
        if (e.vy > MAX_FALL_SPEED) e.vy = MAX_FALL_SPEED;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        // Ground
        if (e.y + e.height > groundY) {
          e.y = groundY - e.height;
          e.vy = 0;
        }
        // Magma slug fires projectiles
        if (e.type === 'magmaslug' && dist < e.detectionRange) {
          e.lastAttack += dt;
          if (e.lastAttack >= e.attackCooldown) {
            e.lastAttack = 0;
            const dir = dx > 0 ? 1 : -1;
            newProjectiles.push(createProjectile(
              e.x + e.width / 2, e.y + 4,
              dir * 180, -80,
              e.damage, e.glowColor, false,
            ));
          }
        }
        break;
      }

      case 'fly_sine': {
        // Float in a sine wave pattern
        e.x += e.patrolDir * e.speed * 0.5 * dt;
        e.y = e.spawnY + Math.sin(e.animTimer * 2) * 30;
        if (Math.abs(e.x - e.spawnX) > e.patrolRange) {
          e.patrolDir *= -1;
        }
        break;
      }

      case 'fly_chase': {
        // Fly toward player
        if (dist < e.detectionRange) {
          const angle = Math.atan2(
            player.y + player.height / 2 - (e.y + e.height / 2),
            player.x + player.width / 2 - (e.x + e.width / 2),
          );
          e.vx = Math.cos(angle) * e.speed;
          e.vy = Math.sin(angle) * e.speed;
        } else {
          // Idle hover
          e.vx *= 0.95;
          e.vy = Math.sin(e.animTimer * 2) * 20;
        }
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        break;
      }

      case 'teleport': {
        // Void shade: teleport near player periodically
        e.lastAttack += dt;
        if (e.lastAttack >= e.attackCooldown && dist < e.detectionRange) {
          e.lastAttack = 0;
          // Teleport to nearby position
          const side = Math.random() > 0.5 ? 1 : -1;
          e.x = player.x + side * (60 + Math.random() * 40);
          e.y = player.y - 10 + (Math.random() - 0.5) * 30;
          e.vx = -side * e.speed * 1.5;
          e.vy = 0;
        } else {
          e.vx *= 0.92;
          e.y = e.spawnY + Math.sin(e.animTimer * 1.5) * 15;
        }
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        // Ground clamp
        if (e.y + e.height > groundY) {
          e.y = groundY - e.height;
          e.vy = 0;
        }
        break;
      }
    }

    // Check death
    if (e.health <= 0) {
      e.active = false;
    }
  }

  return newProjectiles;
}

// ─── Boss Factory ────────────────────────────────────────────────────────────

export function createBoss(type: BossType, x: number, y: number): BossState {
  const t = BOSS_TEMPLATES[type];
  return {
    x, y,
    width: t.width,
    height: t.height,
    vx: 0, vy: 0,
    type,
    health: t.health,
    maxHealth: t.health,
    damage: t.damage,
    phase: 0,
    phaseTimer: 0,
    attackPattern: 0,
    attackTimer: 2, // initial delay
    color: t.color,
    glowColor: t.glowColor,
    stunTimer: 0,
    active: true,
    defeated: false,
    invincibleTimer: 0,
    hitFlashTimer: 0,
    facingRight: false,
    shockwaveTimer: 0,
    chargeTimer: 0,
    isCharging: false,
  };
}

// ─── Boss AI ─────────────────────────────────────────────────────────────────

export function updateBoss(
  boss: BossState,
  player: PlayerState,
  dt: number,
  groundY: number,
): Projectile[] {
  if (!boss.active) return [];
  const projectiles: Projectile[] = [];

  if (boss.hitFlashTimer > 0) boss.hitFlashTimer -= dt;
  if (boss.invincibleTimer > 0) boss.invincibleTimer -= dt;
  if (boss.stunTimer > 0) {
    boss.stunTimer -= dt;
    boss.vx *= 0.9;
    return [];
  }

  // Phase transitions
  const healthPct = boss.health / boss.maxHealth;
  if (healthPct <= 0.5 && boss.phase === 0) {
    boss.phase = 1;
    boss.invincibleTimer = 1.0;
    boss.attackTimer = 1.0;
  }
  if (healthPct <= 0.2 && boss.phase === 1) {
    boss.phase = 2;
    boss.invincibleTimer = 0.5;
  }

  // Face player
  boss.facingRight = player.x > boss.x;

  boss.attackTimer -= dt;
  boss.phaseTimer += dt;

  // Gravity for ground bosses
  if (boss.type !== 'devourer') {
    boss.vy += GRAVITY * dt;
    if (boss.vy > MAX_FALL_SPEED) boss.vy = MAX_FALL_SPEED;
  }

  switch (boss.type) {
    case 'colossus': {
      // Phase 0: slow chase + ground slam
      // Phase 1: faster + falling rocks (projectiles from above)
      const spd = boss.phase >= 1 ? 140 : 80;
      const dx = player.x - boss.x;
      boss.vx = Math.sign(dx) * spd;

      if (boss.attackTimer <= 0) {
        boss.attackPattern = (boss.attackPattern + 1) % 3;
        if (boss.attackPattern === 0) {
          // Ground slam shockwave
          boss.shockwaveTimer = 0.3;
          boss.attackTimer = boss.phase >= 1 ? 1.8 : 2.5;
          boss.vy = -200;
        } else if (boss.attackPattern === 1) {
          // Charge
          boss.isCharging = true;
          boss.chargeTimer = 0.6;
          boss.vx = Math.sign(dx) * 400;
          boss.attackTimer = boss.phase >= 1 ? 1.5 : 2.0;
        } else {
          // Falling rocks (projectiles)
          if (boss.phase >= 1) {
            for (let i = 0; i < 3; i++) {
              projectiles.push(createProjectile(
                player.x + (i - 1) * 80, player.y - 400,
                0, 250 + Math.random() * 100,
                boss.damage, boss.glowColor, false,
              ));
            }
          }
          boss.attackTimer = 2.0;
        }
      }

      if (boss.isCharging) {
        boss.chargeTimer -= dt;
        if (boss.chargeTimer <= 0) {
          boss.isCharging = false;
          boss.vx *= 0.2;
        }
      }
      break;
    }

    case 'drake': {
      // Flies horizontally, shoots fire
      const dx = player.x - boss.x;
      boss.vx = Math.sign(dx) * (boss.phase >= 1 ? 160 : 100);
      boss.y = Math.min(boss.y, groundY - boss.height - 20);
      boss.vy = Math.sin(boss.phaseTimer * 1.5) * 60;

      if (boss.attackTimer <= 0) {
        boss.attackPattern = (boss.attackPattern + 1) % 3;
        if (boss.attackPattern <= 1) {
          // Fire spray
          const count = boss.phase >= 1 ? 5 : 3;
          for (let i = 0; i < count; i++) {
            const angle = Math.atan2(
              player.y - boss.y,
              player.x - boss.x,
            ) + (i - Math.floor(count / 2)) * 0.25;
            projectiles.push(createProjectile(
              boss.x + boss.width / 2, boss.y + boss.height / 2,
              Math.cos(angle) * 220, Math.sin(angle) * 220,
              boss.damage, '#ff6633', false,
            ));
          }
          boss.attackTimer = boss.phase >= 1 ? 1.0 : 1.5;
        } else {
          // Dash attack
          boss.vx = Math.sign(dx) * 500;
          boss.chargeTimer = 0.4;
          boss.isCharging = true;
          boss.attackTimer = 2.0;
        }
      }

      if (boss.isCharging) {
        boss.chargeTimer -= dt;
        if (boss.chargeTimer <= 0) {
          boss.isCharging = false;
          boss.vx *= 0.1;
        }
      }
      break;
    }

    case 'devourer': {
      // Floats, teleports, fires void beams
      boss.vy = Math.sin(boss.phaseTimer * 2) * 40;
      const targetY = groundY - boss.height - 80;
      boss.y += (targetY - boss.y) * 2 * dt;

      const dx = player.x - boss.x;
      boss.vx = Math.sign(dx) * (boss.phase >= 1 ? 120 : 60);

      if (boss.attackTimer <= 0) {
        boss.attackPattern = (boss.attackPattern + 1) % 4;
        if (boss.attackPattern === 0) {
          // Void beam (line of projectiles)
          const dir = boss.facingRight ? 1 : -1;
          for (let i = 0; i < 6; i++) {
            projectiles.push(createProjectile(
              boss.x + boss.width / 2 + dir * 20,
              boss.y + boss.height / 2,
              dir * (200 + i * 30), (i - 3) * 20,
              boss.damage, '#aa44ff', false,
            ));
          }
          boss.attackTimer = boss.phase >= 2 ? 1.0 : 1.5;
        } else if (boss.attackPattern === 1) {
          // Teleport behind player
          const side = boss.x < player.x ? 1 : -1;
          boss.x = player.x + side * 120;
          boss.attackTimer = 0.8;
        } else if (boss.attackPattern === 2) {
          // Ring of projectiles
          const count = boss.phase >= 1 ? 12 : 8;
          for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            projectiles.push(createProjectile(
              boss.x + boss.width / 2,
              boss.y + boss.height / 2,
              Math.cos(angle) * 150,
              Math.sin(angle) * 150,
              boss.damage, '#cc66ff', false,
            ));
          }
          boss.attackTimer = boss.phase >= 2 ? 1.2 : 2.0;
        } else {
          // Summon gravity pull (slow player)
          boss.attackTimer = 1.5;
        }
      }
      break;
    }
  }

  // Apply velocity
  boss.x += boss.vx * dt;
  boss.y += boss.vy * dt;

  // Ground clamp for ground bosses
  if (boss.type !== 'devourer' && boss.y + boss.height > groundY) {
    boss.y = groundY - boss.height;
    boss.vy = 0;
    if (boss.shockwaveTimer > 0) {
      boss.shockwaveTimer -= dt;
    }
  }

  // Death check
  if (boss.health <= 0) {
    boss.active = false;
    boss.defeated = true;
  }

  return projectiles;
}
