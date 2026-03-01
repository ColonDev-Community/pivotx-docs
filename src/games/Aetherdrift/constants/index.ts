/**
 * AETHERDRIFT — Game Constants & Realm Definitions
 */

import { Realm } from '../types';

// ─── Physics ─────────────────────────────────────────────────────────────────

export const GRAVITY = 1800;
export const MAX_FALL_SPEED = 900;
export const GROUND_FRICTION = 0.82;
export const AIR_FRICTION = 0.96;

// ─── Player ──────────────────────────────────────────────────────────────────

export const PLAYER_SPEED = 300;
export const PLAYER_JUMP_FORCE = -560;
export const PLAYER_WIDTH = 18;
export const PLAYER_HEIGHT = 30;
export const PLAYER_MAX_HEALTH = 5;

export const COYOTE_TIME = 0.1;
export const JUMP_BUFFER_TIME = 0.12;
export const VARIABLE_JUMP_MULTIPLIER = 0.45; // cut jump short

export const WALL_SLIDE_SPEED = 80;
export const WALL_JUMP_FORCE_X = 360;
export const WALL_JUMP_FORCE_Y = -500;

export const DASH_SPEED = 650;
export const DASH_DURATION = 0.14;
export const DASH_COOLDOWN = 0.5;

export const ATTACK_DURATION = 0.18;
export const ATTACK_RANGE = 28;
export const ATTACK_DAMAGE = [1, 1, 2]; // combo hits
export const COMBO_WINDOW = 0.4;

export const INVINCIBLE_TIME = 1.2;
export const KNOCKBACK_TIME = 0.2;
export const KNOCKBACK_FORCE_X = 280;
export const KNOCKBACK_FORCE_Y = -250;

export const HEAL_COST = 10; // chrono shards
export const HEAL_AMOUNT = 1;
export const HEAL_COOLDOWN = 2.0; // seconds
export const HEAL_GLOW_DURATION = 0.5; // visual effect duration

// ─── Camera ──────────────────────────────────────────────────────────────────

export const CAMERA_SMOOTH = 6;
export const CAMERA_LOOK_AHEAD = 70;
export const CAMERA_VERTICAL_OFFSET = -80;

// ─── Level ───────────────────────────────────────────────────────────────────

export const GROUND_Y_OFFSET = 100; // ground is screenH - this
export const MIN_PLATFORM_GAP = 60;
export const MAX_PLATFORM_GAP = 200;

// ─── Colors ──────────────────────────────────────────────────────────────────

export const PLAYER_BODY_COLOR = '#d4e0ff';
export const PLAYER_HAIR_COLOR = '#8be9fd';
export const PLAYER_EYE_COLOR = '#ff79c6';
export const PLAYER_CAPE_COLOR = '#bd93f9';
export const PLAYER_SWORD_COLOR = '#f1fa8c';

export const HEALTH_FULL_COLOR = '#ff5555';
export const HEALTH_EMPTY_COLOR = '#44475a';
export const SHARD_COLOR = '#8be9fd';
export const HUD_TEXT_COLOR = '#f8f8f2';
export const HUD_BG_COLOR = '#282a36cc';

// ─── Realms ──────────────────────────────────────────────────────────────────

export const REALMS: Realm[] = [
  {
    id: 0,
    name: 'Sky Ruins',
    subtitle: 'The Crumbling Heights',
    bgGradient: ['#0b1628', '#152244', '#1e3a5f'],
    platformColor: '#4a6a8a',
    platformAccent: '#7ab8cc',
    groundColor: '#3a5a6a',
    enemyTypes: ['sprite', 'crawler'],
    bossType: 'colossus',
    ambientColor: '#66ccff22',
    levelWidth: 4500,
    difficulty: 1,
  },
  {
    id: 1,
    name: 'Ember Depths',
    subtitle: 'The Molten Forge',
    bgGradient: ['#1a0a0a', '#2d1212', '#4a1a0a'],
    platformColor: '#6a4a3a',
    platformAccent: '#ff6633',
    groundColor: '#5a3a2a',
    enemyTypes: ['firewisp', 'magmaslug'],
    bossType: 'drake',
    ambientColor: '#ff440022',
    levelWidth: 5000,
    difficulty: 2,
  },
  {
    id: 2,
    name: 'Void Spire',
    subtitle: 'The Shattered Boundary',
    bgGradient: ['#0a0014', '#14002a', '#200040'],
    platformColor: '#5a3a8a',
    platformAccent: '#cc66ff',
    groundColor: '#3a2060',
    enemyTypes: ['voidshade'],
    bossType: 'devourer',
    ambientColor: '#aa44ff22',
    levelWidth: 5500,
    difficulty: 3,
  },
];

// ─── Enemy Templates ─────────────────────────────────────────────────────────

export const ENEMY_TEMPLATES = {
  sprite: {
    width: 16, height: 16,
    health: 2, damage: 1, speed: 60,
    behavior: 'fly_sine' as const,
    patrolRange: 120,
    detectionRange: 200,
    attackCooldown: 0,
    color: '#66eeff', glowColor: '#33aacc',
    points: 50,
  },
  crawler: {
    width: 22, height: 16,
    health: 3, damage: 1, speed: 80,
    behavior: 'patrol' as const,
    patrolRange: 150,
    detectionRange: 180,
    attackCooldown: 0,
    color: '#88aa66', glowColor: '#556633',
    points: 75,
  },
  firewisp: {
    width: 14, height: 14,
    health: 2, damage: 1, speed: 100,
    behavior: 'fly_chase' as const,
    patrolRange: 200,
    detectionRange: 250,
    attackCooldown: 0,
    color: '#ff8844', glowColor: '#cc5500',
    points: 80,
  },
  magmaslug: {
    width: 26, height: 18,
    health: 5, damage: 2, speed: 40,
    behavior: 'patrol' as const,
    patrolRange: 100,
    detectionRange: 220,
    attackCooldown: 2.0,
    color: '#cc4422', glowColor: '#ff6644',
    points: 120,
  },
  voidshade: {
    width: 18, height: 24,
    health: 4, damage: 2, speed: 120,
    behavior: 'teleport' as const,
    patrolRange: 250,
    detectionRange: 300,
    attackCooldown: 3.0,
    color: '#aa55ff', glowColor: '#7722cc',
    points: 150,
  },
};

// ─── Boss Templates ──────────────────────────────────────────────────────────

export const BOSS_TEMPLATES = {
  colossus: {
    width: 60, height: 70,
    health: 30, damage: 2, speed: 100,
    color: '#7a9aba', glowColor: '#aaccee',
    name: 'Stone Colossus',
  },
  drake: {
    width: 55, height: 50,
    health: 40, damage: 2, speed: 140,
    color: '#dd6622', glowColor: '#ff8844',
    name: 'Infernal Drake',
  },
  devourer: {
    width: 50, height: 60,
    health: 50, damage: 3, speed: 160,
    color: '#9944dd', glowColor: '#bb66ff',
    name: 'Aether Devourer',
  },
};
