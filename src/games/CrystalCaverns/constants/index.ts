/**
 * CRYSTAL CAVERNS — Game Constants
 * All tuning values, colors, and configuration
 */

// ─── Physics ─────────────────────────────────────────────────────────────────

export const GRAVITY = 1200;
export const MAX_FALL_SPEED = 800;
export const GROUND_FRICTION = 0.85;

// ─── Player ──────────────────────────────────────────────────────────────────

export const PLAYER_SPEED = 220;
export const PLAYER_JUMP_FORCE = -480;
export const PLAYER_WIDTH = 20;
export const PLAYER_HEIGHT = 28;
export const PLAYER_MAX_HEALTH = 3;
export const INVINCIBLE_TIME = 1.5;

// ─── Tile ────────────────────────────────────────────────────────────────────

export const TILE_SIZE = 32;

// ─── Camera ──────────────────────────────────────────────────────────────────

export const CAMERA_SMOOTH = 0.08;
export const CAMERA_SHAKE_DECAY = 0.9;

// ─── Animation FPS ───────────────────────────────────────────────────────────

export const ANIM_IDLE_FPS = 4;
export const ANIM_RUN_FPS = 8;
export const ANIM_JUMP_FPS = 2;

// ─── Colors ──────────────────────────────────────────────────────────────────

// Player
export const PLAYER_BODY_COLOR = '#4fc3f7';
export const PLAYER_EYE_COLOR = '#ffffff';
export const PLAYER_OUTLINE_COLOR = '#0288d1';

// World
export const BG_COLOR = '#0a0a2e';
export const BG_GRADIENT_TOP = '#0d1b2a';
export const BG_GRADIENT_MID = '#1b2838';
export const BG_GRADIENT_BOT = '#0a0a1a';

export const GROUND_COLOR = '#5d4037';
export const GROUND_TOP_COLOR = '#4caf50';
export const STONE_COLOR = '#455a64';
export const STONE_LIGHT_COLOR = '#607d8b';

// Crystals
export const CRYSTAL_COLORS = ['#e040fb', '#7c4dff', '#00e5ff', '#76ff03', '#ffd740'];

// Enemies
export const SLIME_COLOR = '#66bb6a';
export const BAT_COLOR = '#ab47bc';
export const SPIKE_COLOR = '#ef5350';

// Particles
export const JUMP_DUST_COLOR = '#8d6e63';
export const LAND_DUST_COLOR = '#a1887f';
export const CRYSTAL_SPARKLE_COLOR = '#fff176';
export const DAMAGE_COLOR = '#ff5252';

// HUD
export const HUD_BG_COLOR = '#1a1a2ecc';
export const HUD_TEXT_COLOR = '#e0e0e0';
export const HEALTH_FULL_COLOR = '#ef5350';
export const HEALTH_EMPTY_COLOR = '#424242';
