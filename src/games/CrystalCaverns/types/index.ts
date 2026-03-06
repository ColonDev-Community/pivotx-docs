/**
 * CRYSTAL CAVERNS — Type Definitions
 * All interfaces and types for the platformer game
 */

// ─── Geometry ────────────────────────────────────────────────────────────────

export interface Vec2 {
  x: number;
  y: number;
}

// ─── Player ──────────────────────────────────────────────────────────────────

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  speed: number;
  jumpForce: number;
  isGrounded: boolean;
  facingRight: boolean;
  // Animation
  animState: 'idle' | 'run' | 'jump' | 'fall';
  animFrame: number;
  animTimer: number;
  // Collectibles
  crystals: number;
  // Invincibility (after damage)
  invincibleTimer: number;
  health: number;
  maxHealth: number;
}

// ─── Crystal Collectible ────────────────────────────────────────────────────

export interface Crystal {
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
  bobTimer: number;
  sparkleTimer: number;
  color: string;
  value: number;
}

// ─── Enemy ───────────────────────────────────────────────────────────────────

export type EnemyType = 'slime' | 'bat' | 'spike';

export interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  type: EnemyType;
  speed: number;
  patrolDir: number;
  patrolRange: number;
  originX: number;
  color: string;
  animTimer: number;
  active: boolean;
  damage: number;
}

// ─── Particle ────────────────────────────────────────────────────────────────

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

// ─── Platform (logical, for collision) ───────────────────────────────────────

export interface PlatformData {
  x: number;
  y: number;
  width: number;
  height: number;
  oneWay: boolean;
  color: string;
}

// ─── Level ───────────────────────────────────────────────────────────────────

export interface LevelData {
  platforms: PlatformData[];
  crystals: Crystal[];
  enemies: Enemy[];
  playerStart: Vec2;
  worldWidth: number;
  worldHeight: number;
  /** Tilemap grid (row-major, -1 = empty) */
  tileMap: number[][];
  /** Tile size in pixels */
  tileSize: number;
}

// ─── Camera ──────────────────────────────────────────────────────────────────

export interface CameraState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  shakeAmount: number;
  shakeX: number;
  shakeY: number;
}

// ─── Game State ──────────────────────────────────────────────────────────────

export type GamePhase = 'title' | 'playing' | 'gameover' | 'win';

export interface GameState {
  phase: GamePhase;
  score: number;
  totalCrystals: number;
  playTime: number;
  level: number;
}
