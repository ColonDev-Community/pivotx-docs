/**
 * AETHERDRIFT — Type Definitions
 * All interfaces and types for the game
 */

// ─── Geometry ────────────────────────────────────────────────────────────────

export interface Vec2 {
  x: number;
  y: number;
}

export interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Entity extends AABB {
  vx: number;
  vy: number;
}

// ─── Player ──────────────────────────────────────────────────────────────────

export interface PlayerState extends Entity {
  health: number;
  maxHealth: number;
  speed: number;
  jumpForce: number;
  // Movement state
  isGrounded: boolean;
  isWallSliding: boolean;
  wallDir: number; // -1 left, 1 right, 0 none
  canDoubleJump: boolean;
  hasDoubleJumped: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  facingRight: boolean;
  // Dash
  isDashing: boolean;
  dashCooldown: number;
  dashTimer: number;
  dashDir: number;
  // Combat
  isAttacking: boolean;
  attackTimer: number;
  attackCombo: number;
  comboTimer: number;
  invincibleTimer: number;
  knockbackTimer: number;
  // Heal
  healCooldown: number;
  healTimer: number; // visual glow duration
  // Progression
  chronoShards: number;
  currentRealm: number;
  totalKills: number;
}

// ─── Enemies ─────────────────────────────────────────────────────────────────

export type EnemyType = 'sprite' | 'crawler' | 'firewisp' | 'magmaslug' | 'voidshade';

export type EnemyBehavior = 'patrol' | 'chase' | 'fly_sine' | 'fly_chase' | 'teleport';

export interface EnemyState extends Entity {
  type: EnemyType;
  health: number;
  maxHealth: number;
  damage: number;
  speed: number;
  behavior: EnemyBehavior;
  patrolDir: number;
  patrolRange: number;
  color: string;
  glowColor: string;
  detectionRange: number;
  attackCooldown: number;
  lastAttack: number;
  stunTimer: number;
  animTimer: number;
  spawnX: number;
  spawnY: number;
  active: boolean;
  hitFlashTimer: number;
}

// ─── Bosses ──────────────────────────────────────────────────────────────────

export type BossType = 'colossus' | 'drake' | 'devourer';

export interface BossState extends Entity {
  type: BossType;
  health: number;
  maxHealth: number;
  damage: number;
  phase: number;
  phaseTimer: number;
  attackPattern: number;
  attackTimer: number;
  color: string;
  glowColor: string;
  stunTimer: number;
  active: boolean;
  defeated: boolean;
  invincibleTimer: number;
  hitFlashTimer: number;
  facingRight: boolean;
  shockwaveTimer: number;
  chargeTimer: number;
  isCharging: boolean;
}

// ─── Platforms ────────────────────────────────────────────────────────────────

export type PlatformType = 'solid' | 'moving_h' | 'moving_v' | 'breakable' | 'spike';

export interface Platform extends AABB {
  type: PlatformType;
  color: string;
  accentColor: string;
  moveSpeed: number;
  moveRange: number;
  moveOriginX: number;
  moveOriginY: number;
  moveProgress: number;
  breakTimer: number;
  broken: boolean;
  stepped: boolean;
}

// ─── Collectibles ────────────────────────────────────────────────────────────

export type CollectibleType = 'shard' | 'health' | 'big_shard';

export interface Collectible extends AABB {
  type: CollectibleType;
  color: string;
  glowColor: string;
  collected: boolean;
  bobPhase: number;
  value: number;
}

// ─── Particles ───────────────────────────────────────────────────────────────

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  gravity: boolean;
  shape: 'circle' | 'rect';
}

// ─── Projectiles ─────────────────────────────────────────────────────────────

export interface Projectile extends Entity {
  damage: number;
  color: string;
  lifetime: number;
  isPlayer: boolean;
  size: number;
}

// ─── Attack ──────────────────────────────────────────────────────────────────

export interface AttackHitbox extends AABB {
  damage: number;
  knockbackX: number;
  knockbackY: number;
  lifetime: number;
  active: boolean;
}

// ─── Camera ──────────────────────────────────────────────────────────────────

export interface Camera {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  shakeAmount: number;
  shakeDecay: number;
}

// ─── Realm ───────────────────────────────────────────────────────────────────

export type RealmId = 0 | 1 | 2;

export interface Realm {
  id: RealmId;
  name: string;
  subtitle: string;
  bgGradient: [string, string, string];
  platformColor: string;
  platformAccent: string;
  groundColor: string;
  enemyTypes: EnemyType[];
  bossType: BossType;
  ambientColor: string;
  levelWidth: number;
  difficulty: number;
}

// ─── Game State ──────────────────────────────────────────────────────────────

export type GamePhase =
  | 'title'
  | 'realm_intro'
  | 'playing'
  | 'boss_intro'
  | 'boss'
  | 'realm_clear'
  | 'game_over'
  | 'victory';

export interface GameState {
  phase: GamePhase;
  currentRealm: RealmId;
  realmsCompleted: [boolean, boolean, boolean];
  score: number;
  playTime: number;
  phaseTimer: number; // for timed transitions
  bossTriggered: boolean;
}
