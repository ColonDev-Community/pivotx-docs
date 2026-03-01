/**
 * AETHERDRIFT — Player Entity
 * Player creation, movement, attack logic
 */

import { PlayerState, Platform, AttackHitbox } from '../types';
import {
  PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_MAX_HEALTH, PLAYER_SPEED,
  PLAYER_JUMP_FORCE, COYOTE_TIME, JUMP_BUFFER_TIME,
  VARIABLE_JUMP_MULTIPLIER, WALL_SLIDE_SPEED, WALL_JUMP_FORCE_X,
  WALL_JUMP_FORCE_Y, DASH_SPEED, DASH_DURATION, DASH_COOLDOWN,
  ATTACK_DURATION, ATTACK_DAMAGE, ATTACK_RANGE, COMBO_WINDOW,
  GRAVITY, MAX_FALL_SPEED, GROUND_FRICTION, AIR_FRICTION,
  KNOCKBACK_TIME, HEAL_COST, HEAL_AMOUNT, HEAL_COOLDOWN, HEAL_GLOW_DURATION,
} from '../constants';
import { checkAABBCollision, resolveYCollision, resolveXCollision } from '../systems/physics';

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createPlayer(x: number, y: number): PlayerState {
  return {
    x, y,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    vx: 0, vy: 0,
    health: PLAYER_MAX_HEALTH,
    maxHealth: PLAYER_MAX_HEALTH,
    speed: PLAYER_SPEED,
    jumpForce: PLAYER_JUMP_FORCE,
    isGrounded: false,
    isWallSliding: false,
    wallDir: 0,
    canDoubleJump: true,
    hasDoubleJumped: false,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    facingRight: true,
    isDashing: false,
    dashCooldown: 0,
    dashTimer: 0,
    dashDir: 1,
    isAttacking: false,
    attackTimer: 0,
    attackCombo: 0,
    comboTimer: 0,
    invincibleTimer: 0,
    knockbackTimer: 0,
    healCooldown: 0,
    healTimer: 0,
    chronoShards: 0,
    currentRealm: 0,
    totalKills: 0,
  };
}

// ─── Input Handling ──────────────────────────────────────────────────────────

export interface PlayerInput {
  left: boolean;
  right: boolean;
  jump: boolean;
  jumpPressed: boolean; // just pressed this frame
  jumpReleased: boolean;
  attack: boolean;
  attackPressed: boolean;
  dash: boolean;
  dashPressed: boolean;
  healPressed: boolean;
}

// ─── Update ──────────────────────────────────────────────────────────────────

export function updatePlayer(
  p: PlayerState,
  input: PlayerInput,
  platforms: Platform[],
  dt: number,
  screenW: number,
  screenH: number,
  groundY: number,
): AttackHitbox | null {
  let attack: AttackHitbox | null = null;

  // --- Timers ---
  if (p.invincibleTimer > 0) p.invincibleTimer -= dt;
  if (p.knockbackTimer > 0) p.knockbackTimer -= dt;
  if (p.dashCooldown > 0) p.dashCooldown -= dt;
  if (p.healCooldown > 0) p.healCooldown -= dt;
  if (p.healTimer > 0) p.healTimer -= dt;
  if (p.comboTimer > 0) {
    p.comboTimer -= dt;
    if (p.comboTimer <= 0) p.attackCombo = 0;
  }
  if (p.coyoteTimer > 0) p.coyoteTimer -= dt;
  if (p.jumpBufferTimer > 0) p.jumpBufferTimer -= dt;

  // --- Dash ---
  if (p.isDashing) {
    p.dashTimer -= dt;
    if (p.dashTimer <= 0) {
      p.isDashing = false;
      p.vx *= 0.3;
    } else {
      p.vx = DASH_SPEED * p.dashDir;
      p.vy = 0;
      // Still handle horizontal collision during dash
      p.x += p.vx * dt;
      resolvePlayerPlatformX(p, platforms, groundY);
      return null;
    }
  }

  // --- Knockback override ---
  if (p.knockbackTimer > 0) {
    p.vy += GRAVITY * dt;
    if (p.vy > MAX_FALL_SPEED) p.vy = MAX_FALL_SPEED;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    resolvePlayerPlatformY(p, platforms, groundY);
    resolvePlayerPlatformX(p, platforms, groundY);
    return null;
  }

  // --- Horizontal movement ---
  const moveDir = (input.left ? -1 : 0) + (input.right ? 1 : 0);
  if (moveDir !== 0) {
    p.facingRight = moveDir > 0;
    p.vx += moveDir * p.speed * (p.isGrounded ? 8 : 5) * dt;
    const maxSpd = p.speed;
    if (p.vx > maxSpd) p.vx = maxSpd;
    if (p.vx < -maxSpd) p.vx = -maxSpd;
  }

  // --- Friction ---
  const fric = p.isGrounded ? GROUND_FRICTION : AIR_FRICTION;
  if (moveDir === 0) p.vx *= fric;

  // --- Gravity ---
  if (!p.isGrounded) {
    p.vy += GRAVITY * dt;
    if (p.vy > MAX_FALL_SPEED) p.vy = MAX_FALL_SPEED;
  }

  // --- Wall sliding ---
  p.isWallSliding = false;
  p.wallDir = 0;
  if (!p.isGrounded && p.vy > 0) {
    const wallCheck = checkWallContact(p, platforms);
    if (wallCheck !== 0 && ((wallCheck < 0 && input.left) || (wallCheck > 0 && input.right))) {
      p.isWallSliding = true;
      p.wallDir = wallCheck;
      p.vy = Math.min(p.vy, WALL_SLIDE_SPEED);
      p.hasDoubleJumped = false; // reset double jump on wall
    }
  }

  // --- Jump buffer ---
  if (input.jumpPressed) {
    p.jumpBufferTimer = JUMP_BUFFER_TIME;
  }

  // --- Coyote time ---
  const wasGrounded = p.isGrounded;

  // --- Jump ---
  const canJump = p.isGrounded || p.coyoteTimer > 0;
  const wantsJump = p.jumpBufferTimer > 0;

  if (wantsJump && canJump) {
    p.vy = p.jumpForce;
    p.isGrounded = false;
    p.coyoteTimer = 0;
    p.jumpBufferTimer = 0;
    p.hasDoubleJumped = false;
  } else if (wantsJump && p.isWallSliding) {
    // Wall jump
    p.vx = -p.wallDir * WALL_JUMP_FORCE_X;
    p.vy = WALL_JUMP_FORCE_Y;
    p.isWallSliding = false;
    p.facingRight = p.wallDir < 0;
    p.jumpBufferTimer = 0;
    p.hasDoubleJumped = false;
  } else if (input.jumpPressed && !p.isGrounded && !p.isWallSliding && p.canDoubleJump && !p.hasDoubleJumped) {
    // Double jump
    p.vy = p.jumpForce * 0.85;
    p.hasDoubleJumped = true;
  }

  // --- Variable jump height ---
  if (input.jumpReleased && p.vy < 0) {
    p.vy *= VARIABLE_JUMP_MULTIPLIER;
  }

  // --- Dash ---
  if (input.dashPressed && p.dashCooldown <= 0 && !p.isDashing) {
    p.isDashing = true;
    p.dashTimer = DASH_DURATION;
    p.dashCooldown = DASH_COOLDOWN;
    p.dashDir = p.facingRight ? 1 : -1;
    p.invincibleTimer = DASH_DURATION;
    return null;
  }

  // --- Apply velocities ---
  p.x += p.vx * dt;
  p.y += p.vy * dt;

  // --- Platform collision ---
  resolvePlayerPlatformY(p, platforms, groundY);
  resolvePlayerPlatformX(p, platforms, groundY);

  // --- Ground check after collision ---
  if (!wasGrounded && p.isGrounded) {
    p.hasDoubleJumped = false;
    p.coyoteTimer = 0;
  }
  if (wasGrounded && !p.isGrounded) {
    p.coyoteTimer = COYOTE_TIME;
  }

  // --- World bounds ---
  if (p.x < 0) { p.x = 0; p.vx = 0; }
  if (p.y > groundY - p.height) {
    p.y = groundY - p.height;
    p.vy = 0;
    p.isGrounded = true;
    p.hasDoubleJumped = false;
  }

  // --- Heal ---
  if (input.healPressed && p.healCooldown <= 0 && p.health < p.maxHealth && p.chronoShards >= HEAL_COST) {
    p.health = Math.min(p.maxHealth, p.health + HEAL_AMOUNT);
    p.chronoShards -= HEAL_COST;
    p.healCooldown = HEAL_COOLDOWN;
    p.healTimer = HEAL_GLOW_DURATION;
  }

  // --- Attack ---
  if (p.isAttacking) {
    p.attackTimer -= dt;
    if (p.attackTimer <= 0) {
      p.isAttacking = false;
    }
  }

  if (input.attackPressed && !p.isAttacking) {
    p.isAttacking = true;
    p.attackTimer = ATTACK_DURATION;
    if (p.comboTimer > 0 && p.attackCombo < 2) {
      p.attackCombo++;
    } else {
      p.attackCombo = 0;
    }
    p.comboTimer = COMBO_WINDOW;

    // Create attack hitbox
    const dir = p.facingRight ? 1 : -1;
    const dmg = ATTACK_DAMAGE[p.attackCombo] || 1;
    attack = {
      x: p.facingRight ? p.x + p.width : p.x - ATTACK_RANGE,
      y: p.y + 2,
      width: ATTACK_RANGE,
      height: p.height - 4,
      damage: dmg,
      knockbackX: dir * 300,
      knockbackY: -150,
      lifetime: ATTACK_DURATION,
      active: true,
    };
  }

  return attack;
}

// ─── Collision Helpers ───────────────────────────────────────────────────────

function resolvePlayerPlatformY(p: PlayerState, platforms: Platform[], groundY: number) {
  p.isGrounded = false;

  // Ground
  if (p.y + p.height >= groundY) {
    p.y = groundY - p.height;
    p.vy = 0;
    p.isGrounded = true;
  }

  for (const plat of platforms) {
    if (plat.broken || plat.type === 'spike') continue;
    if (checkAABBCollision(p, plat)) {
      const resolved = resolveYCollision(p, plat);
      if (resolved === 'top') {
        p.isGrounded = true;
        p.vy = 0;
        // Mark breakable
        if (plat.type === 'breakable' && !plat.stepped) {
          plat.stepped = true;
        }
        // Ride moving platforms
        if (plat.type === 'moving_h') {
          p.x += plat.moveSpeed * Math.cos(plat.moveProgress) * 0.016;
        }
      } else if (resolved === 'bottom') {
        p.vy = Math.max(p.vy, 0);
      }
    }
  }
}

function resolvePlayerPlatformX(p: PlayerState, platforms: Platform[], _groundY: number) {
  for (const plat of platforms) {
    if (plat.broken || plat.type === 'spike') continue;
    if (checkAABBCollision(p, plat)) {
      resolveXCollision(p, plat);
    }
  }
}

function checkWallContact(p: PlayerState, platforms: Platform[]): number {
  // Check slightly left
  const leftProbe = { x: p.x - 2, y: p.y + 4, width: 2, height: p.height - 8 };
  // Check slightly right
  const rightProbe = { x: p.x + p.width, y: p.y + 4, width: 2, height: p.height - 8 };

  for (const plat of platforms) {
    if (plat.broken || plat.type === 'spike') continue;
    if (checkAABBCollision(leftProbe, plat)) return -1;
    if (checkAABBCollision(rightProbe, plat)) return 1;
  }
  return 0;
}

// ─── Damage ──────────────────────────────────────────────────────────────────

export function damagePlayer(p: PlayerState, dmg: number, fromX: number) {
  if (p.invincibleTimer > 0 || p.isDashing) return false;
  p.health -= dmg;
  p.invincibleTimer = 1.2;
  p.knockbackTimer = KNOCKBACK_TIME;
  const dir = p.x < fromX ? -1 : 1;
  p.vx = dir * 280;
  p.vy = -250;
  p.isAttacking = false;
  return true;
}
