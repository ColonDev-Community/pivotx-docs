/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║                    NEXUS 2500 — THE LAST SIGNAL                      ║
 * ╠═══════════════════════════════════════════════════════════════════════╣
 * ║                                                                       ║
 * ║  YEAR 2487. Humanity spans the stars. A mysterious signal — "The     ║
 * ║  Nexus" — pulses from the void beyond charted space. Every ship      ║
 * ║  sent to investigate has vanished.                                    ║
 * ║                                                                       ║
 * ║  You are Commander Kael Voss, pilot of the AEGIS-7, the last        ║
 * ║  warship of the Terran Defense Corps. Earth's AI defense grid has    ║
 * ║  gone rogue, drawn to the signal. Pirates blockade the trade lanes.  ║
 * ║  Alien bio-ships swarm the nebula. Ancient guardians protect the     ║
 * ║  signal's source. And at the heart of it all, the Nexus Core waits. ║
 * ║                                                                       ║
 * ║  Five chapters. One ship. The fate of a civilization.                ║
 * ║                                                                       ║
 * ║  CONTROLS:                                                            ║
 * ║    WASD / Arrow Keys — Move                                          ║
 * ║    SPACE — Fire weapons                                               ║
 * ║    SHIFT — Activate shield                                            ║
 * ║    E — Special weapon                                                 ║
 * ║    ESC — Exit                                                         ║
 * ║                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  PivotCanvas,
  PivotCircle,
  PivotRectangle,
  PivotLabel,
  PivotLine,
  useGameLoop,
} from 'pivotx/react';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface Vec2 { x: number; y: number; }

interface GameObject {
  x: number; y: number;
  width: number; height: number;
}

interface PlayerShip extends GameObject {
  health: number; maxHealth: number;
  shield: number; maxShield: number;
  energy: number; maxEnergy: number;
  speed: number;
  fireRate: number; lastShot: number;
  weaponLevel: number;
  specialCooldown: number; lastSpecial: number;
  shieldActive: boolean;
  invincibleUntil: number;
  combo: number; comboTimer: number;
  kills: number;
}

type EnemyVariant = 'drone' | 'fighter' | 'bomber' | 'elite' | 'pirate' | 'bioship' | 'biobomber' |
  'guardian' | 'sentinel' | 'boss_ai' | 'boss_pirate' | 'boss_bio' | 'boss_guardian' | 'boss_nexus';

interface Enemy extends GameObject {
  variant: EnemyVariant;
  health: number; maxHealth: number;
  vx: number; vy: number;
  speed: number;
  damage: number;
  fireRate: number; lastShot: number;
  points: number;
  behavior: 'straight' | 'zigzag' | 'circle' | 'chase' | 'boss';
  color: string;
  glowColor: string;
  phase: number;
  phaseTimer: number;
  spawnTimer: number;
}

interface Bullet extends GameObject {
  vx: number; vy: number;
  damage: number;
  color: string;
  isPlayer: boolean;
  piercing: boolean;
  lifetime: number;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  color: string;
  size: number;
}

interface PowerUp extends GameObject {
  type: 'health' | 'shield' | 'energy' | 'weapon' | 'special';
  vy: number;
  bobPhase: number;
}

interface Explosion {
  x: number; y: number;
  time: number; duration: number;
  size: number;
  color: string;
}

interface Star {
  x: number; y: number;
  speed: number;
  brightness: number;
  size: number;
}

interface Nebula {
  x: number; y: number;
  radius: number;
  color: string;
  alpha: number;
  speed: number;
}

type GamePhase = 'title' | 'story' | 'playing' | 'boss_intro' | 'boss_fight' |
  'chapter_complete' | 'game_over' | 'victory';

interface GameState {
  phase: GamePhase;
  score: number;
  chapter: number;         // 1-5
  wave: number;            // current wave within chapter
  maxWaves: number;        // waves per chapter
  waveTimer: number;
  waveDelay: number;       // time between waves
  enemiesAlive: number;
  bossDefeated: boolean;
  storyIndex: number;      // for scrolling story text
  storyTimer: number;
  screenShake: number;
  totalKills: number;
  highCombo: number;
  playTime: number;
  titleBlink: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// STORY / CHAPTER DATA
// ─────────────────────────────────────────────────────────────────────────────

interface ChapterData {
  title: string;
  subtitle: string;
  story: string[];
  bgColor: string;
  starColor: string;
  waves: number;
  enemyTypes: EnemyVariant[];
  bossType: EnemyVariant;
  bossName: string;
  bossStory: string;
}

const CHAPTERS: ChapterData[] = [
  {
    title: 'CHAPTER I',
    subtitle: 'GHOST IN THE MACHINE',
    story: [
      'The year is 2487.',
      'Humanity\'s AI defense grid—PROMETHEUS—has gone rogue.',
      'Drawn by a mysterious signal from beyond charted space,',
      'it turned Earth\'s own drones against its creators.',
      '',
      'You are Commander Kael Voss, last pilot of the Terran',
      'Defense Corps. Your ship, the AEGIS-7, is humanity\'s',
      'final hope.',
      '',
      'First mission: break through the drone blockade.',
      'Destroy the PROMETHEUS Core Ship.',
      '',
      'The signal grows stronger...',
    ],
    bgColor: '#050510',
    starColor: '#aabbff',
    waves: 5,
    enemyTypes: ['drone', 'fighter'],
    bossType: 'boss_ai',
    bossName: 'PROMETHEUS CORE',
    bossStory: 'The rogue AI\'s command vessel emerges from the drone swarm...',
  },
  {
    title: 'CHAPTER II',
    subtitle: 'THE IRON BLOCKADE',
    story: [
      'With PROMETHEUS silenced, you push beyond the asteroid belt.',
      'But the trade lanes are ruled by the Crimson Corsairs—',
      'a pirate fleet that has grown bold in humanity\'s chaos.',
      '',
      'Their leader, Admiral Raze, has weaponized stolen',
      'military tech. His flagship, "The Iron Maw," controls',
      'the only hypergate to the outer rim.',
      '',
      'There is no way around. Only through.',
      '',
      'The signal pulses. It\'s closer now...',
    ],
    bgColor: '#100808',
    starColor: '#ffaa88',
    waves: 6,
    enemyTypes: ['pirate', 'fighter', 'bomber'],
    bossType: 'boss_pirate',
    bossName: 'THE IRON MAW',
    bossStory: 'Admiral Raze\'s dreadnought decloaks ahead, cannons blazing...',
  },
  {
    title: 'CHAPTER III',
    subtitle: 'THE LIVING NEBULA',
    story: [
      'Beyond the hypergate lies the Scylla Nebula—',
      'a graveyard of ships. But these wrecks aren\'t empty.',
      '',
      'Alien organisms have fused with the derelict vessels,',
      'creating bio-mechanical horrors. The "Symbiotes" attack',
      'anything that enters their territory.',
      '',
      'Your scanners detect the signal source deeper in the',
      'nebula. To reach it, you must survive the living storm.',
      '',
      'Something ancient stirs in the cosmic fog...',
    ],
    bgColor: '#080510',
    starColor: '#88ffaa',
    waves: 7,
    enemyTypes: ['bioship', 'biobomber', 'elite'],
    bossType: 'boss_bio',
    bossName: 'THE LEVIATHAN',
    bossStory: 'A massive bio-ship, ancient beyond measure, blocks your path...',
  },
  {
    title: 'CHAPTER IV',
    subtitle: 'ECHOES OF ETERNITY',
    story: [
      'Past the nebula, you find it—a megastructure older than',
      'Earth itself. The Nexus Beacon.',
      '',
      'But it\'s guarded. Ancient constructs—Guardians—awaken',
      'as you approach. They were built by a civilization that',
      'vanished while humans still lived in caves.',
      '',
      'The Guardians don\'t speak, but their message is clear:',
      'TURN BACK.',
      '',
      'You can\'t. Not now. Not after everything.',
      'The signal screams in your mind...',
    ],
    bgColor: '#080818',
    starColor: '#ffddaa',
    waves: 8,
    enemyTypes: ['guardian', 'sentinel', 'elite'],
    bossType: 'boss_guardian',
    bossName: 'THE ARCHON',
    bossStory: 'The supreme Guardian materializes—a being of pure energy and ancient metal...',
  },
  {
    title: 'CHAPTER V',
    subtitle: 'THE LAST SIGNAL',
    story: [
      'You breach the Nexus Beacon\'s core.',
      '',
      'Inside is not a weapon. Not a trap.',
      'It\'s a message. A warning.',
      '',
      '"WE REACHED TOO FAR. WE BECAME WHAT WE FEARED.',
      ' THE VOID CONSUMES ALL WHO SEEK ITS HEART.',
      ' THIS BEACON IS OUR LAST ACT OF MERCY.',
      ' TURN BACK."',
      '',
      'But it\'s too late. The Nexus Core has awakened.',
      'It feeds on intelligence—AI, organic, all the same.',
      'Every ship ever sent here... absorbed. Waiting.',
      '',
      'This ends now. One final battle.',
      'For Earth. For every soul lost to the void.',
    ],
    bgColor: '#0a0015',
    starColor: '#ff88ff',
    waves: 10,
    enemyTypes: ['sentinel', 'elite', 'guardian', 'bioship'],
    bossType: 'boss_nexus',
    bossName: 'THE NEXUS CORE',
    bossStory: 'Reality bends. The Nexus Core manifests—an entity of pure cosmic hunger...',
  },
];

const VICTORY_TEXT = [
  'The Nexus Core shatters.',
  '',
  'For a moment, you see them—every pilot, every crew,',
  'every soul the Nexus consumed—released at last.',
  '',
  'The ancient beacon crumbles around you.',
  'The signal... is silent.',
  '',
  'You engage the hyperdrive. The journey home will take',
  '47 days. But for the first time in months, the stars',
  'feel welcoming.',
  '',
  'Earth receives your signal. A single word:',
  '',
  '"CLEAR."',
  '',
  'The galaxy mourns its dead. And celebrates its living.',
  '',
  'Commander Kael Voss retires from the TDC.',
  'The AEGIS-7 is placed in the Terran Museum of History.',
  '',
  'The void is silent. For now.',
  '',
  '— THE END —',
];

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const PLAYER_SPEED = 420;
const SHIELD_DRAIN = 25;       // energy per second while shielding
const SHIELD_ABSORB = 0.7;     // damage absorbed by shield
const SPECIAL_ENERGY_COST = 40;

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

function collides(a: GameObject, b: GameObject): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
         a.y < b.y + b.height && a.y + a.height > b.y;
}

function dist(a: Vec2, b: Vec2): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

function randRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function hexAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255).toString(16).padStart(2, '0');
  return hex + a;
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME HOOK
// ─────────────────────────────────────────────────────────────────────────────

function useNexus2500(onExit: () => void) {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // ---------- refs ----------
  const gameState = useRef<GameState>({
    phase: 'title',
    score: 0,
    chapter: 0,
    wave: 0,
    maxWaves: 5,
    waveTimer: 0,
    waveDelay: 3,
    enemiesAlive: 0,
    bossDefeated: false,
    storyIndex: 0,
    storyTimer: 0,
    screenShake: 0,
    totalKills: 0,
    highCombo: 0,
    playTime: 0,
    titleBlink: 0,
  });

  const player = useRef<PlayerShip>({
    x: 0, y: 0, width: 28, height: 36,
    health: 100, maxHealth: 100,
    shield: 50, maxShield: 50,
    energy: 100, maxEnergy: 100,
    speed: PLAYER_SPEED,
    fireRate: 0.12, lastShot: 0,
    weaponLevel: 1,
    specialCooldown: 3, lastSpecial: 0,
    shieldActive: false,
    invincibleUntil: 0,
    combo: 0, comboTimer: 0,
    kills: 0,
  });

  const enemies = useRef<Enemy[]>([]);
  const bullets = useRef<Bullet[]>([]);
  const particles = useRef<Particle[]>([]);
  const powerUps = useRef<PowerUp[]>([]);
  const explosions = useRef<Explosion[]>([]);
  const stars = useRef<Star[]>([]);
  const nebulae = useRef<Nebula[]>([]);
  const keys = useRef<Record<string, boolean>>({});
  const [, setTick] = useState(0);

  // ---------- init stars + nebulae ----------
  useEffect(() => {
    const W = screenSize.width;
    const H = screenSize.height;
    stars.current = Array.from({ length: 200 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      speed: 15 + Math.random() * 120,
      brightness: 0.15 + Math.random() * 0.85,
      size: 0.5 + Math.random() * 2.5,
    }));
    nebulae.current = Array.from({ length: 8 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      radius: 60 + Math.random() * 200,
      color: ['#2244aa', '#661166', '#116644', '#994422'][Math.floor(Math.random() * 4)],
      alpha: 0.03 + Math.random() * 0.06,
      speed: 5 + Math.random() * 15,
    }));
    player.current.x = W / 2 - 14;
    player.current.y = H - 100;
  }, [screenSize]);

  // ---------- resize ----------
  useEffect(() => {
    const handleResize = () => setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ---------- keyboard ----------
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
      if (e.key === ' ' || e.key === 'Shift') e.preventDefault();
      if (e.key === 'Escape') onExit();
    };
    const up = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [onExit]);

  // ---------- spawn helpers ----------
  const addExplosion = useCallback((x: number, y: number, size = 1, color = '#ff8800') => {
    explosions.current.push({ x, y, time: 0, duration: 0.5 + size * 0.3, size, color });
    for (let i = 0; i < 8 + size * 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 200 * size;
      particles.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.3 + Math.random() * 0.6,
        maxLife: 0.3 + Math.random() * 0.6,
        color,
        size: 1 + Math.random() * 3 * size,
      });
    }
  }, []);

  const addScreenShake = useCallback((amount: number) => {
    gameState.current.screenShake = Math.min(gameState.current.screenShake + amount, 20);
  }, []);

  const spawnEnemy = useCallback((variant: EnemyVariant, x?: number, y?: number) => {
    const W = screenSize.width;
    const ex = x ?? randRange(40, W - 80);
    const ey = y ?? randRange(-60, -30);

    const base: Partial<Enemy> = {
      x: ex, y: ey,
      vx: 0, vy: 0,
      fireRate: 2, lastShot: 0,
      phase: 0, phaseTimer: 0, spawnTimer: 0,
    };

    const configs: Record<EnemyVariant, Partial<Enemy>> = {
      drone:        { width: 20, height: 20, health: 30, maxHealth: 30, speed: 80, damage: 10, points: 50, behavior: 'straight', color: '#4488ff', glowColor: '#2244aa', vy: 80 },
      fighter:      { width: 24, height: 26, health: 50, maxHealth: 50, speed: 120, damage: 15, points: 100, behavior: 'zigzag', color: '#44aaff', glowColor: '#2266cc', vy: 60, vx: 100, fireRate: 1.5 },
      bomber:       { width: 30, height: 28, health: 80, maxHealth: 80, speed: 50, damage: 25, points: 150, behavior: 'straight', color: '#ff6644', glowColor: '#aa3322', vy: 50, fireRate: 2.5 },
      elite:        { width: 28, height: 30, health: 120, maxHealth: 120, speed: 110, damage: 20, points: 250, behavior: 'chase', color: '#ffaa00', glowColor: '#aa6600', fireRate: 1.2 },
      pirate:       { width: 26, height: 24, health: 60, maxHealth: 60, speed: 100, damage: 18, points: 120, behavior: 'zigzag', color: '#ff4444', glowColor: '#aa2222', vy: 70, vx: 80, fireRate: 1.8 },
      bioship:      { width: 22, height: 28, health: 70, maxHealth: 70, speed: 90, damage: 15, points: 130, behavior: 'circle', color: '#44ff88', glowColor: '#22aa44', fireRate: 2 },
      biobomber:    { width: 32, height: 30, health: 100, maxHealth: 100, speed: 40, damage: 30, points: 200, behavior: 'straight', color: '#88ff44', glowColor: '#44aa22', vy: 35, fireRate: 3 },
      guardian:     { width: 26, height: 26, health: 100, maxHealth: 100, speed: 95, damage: 22, points: 200, behavior: 'circle', color: '#ffdd44', glowColor: '#aaaa22', fireRate: 1.5 },
      sentinel:     { width: 30, height: 32, health: 150, maxHealth: 150, speed: 70, damage: 28, points: 300, behavior: 'chase', color: '#ff8844', glowColor: '#cc6622', fireRate: 1 },
      boss_ai:      { width: 80, height: 60, health: 800, maxHealth: 800, speed: 60, damage: 30, points: 2000, behavior: 'boss', color: '#4488ff', glowColor: '#2244ff', fireRate: 0.8, x: W / 2 - 40, y: -80 },
      boss_pirate:  { width: 90, height: 65, health: 1200, maxHealth: 1200, speed: 50, damage: 35, points: 3000, behavior: 'boss', color: '#ff4444', glowColor: '#cc2222', fireRate: 0.6, x: W / 2 - 45, y: -80 },
      boss_bio:     { width: 100, height: 80, health: 1800, maxHealth: 1800, speed: 40, damage: 40, points: 5000, behavior: 'boss', color: '#44ff88', glowColor: '#22cc44', fireRate: 0.5, x: W / 2 - 50, y: -100 },
      boss_guardian: { width: 90, height: 70, health: 2500, maxHealth: 2500, speed: 55, damage: 45, points: 7000, behavior: 'boss', color: '#ffdd44', glowColor: '#ccaa00', fireRate: 0.4, x: W / 2 - 45, y: -90 },
      boss_nexus:   { width: 120, height: 100, health: 4000, maxHealth: 4000, speed: 45, damage: 50, points: 15000, behavior: 'boss', color: '#cc44ff', glowColor: '#8800cc', fireRate: 0.3, x: W / 2 - 60, y: -120 },
    };

    const cfg = configs[variant];
    enemies.current.push({ ...base, variant, ...cfg } as Enemy);
  }, [screenSize.width]);

  const spawnPowerUp = useCallback((x: number, y: number) => {
    if (Math.random() > 0.25) return;
    const types: PowerUp['type'][] = ['health', 'shield', 'energy', 'weapon', 'special'];
    const type = types[Math.floor(Math.random() * types.length)];
    powerUps.current.push({
      x: x - 10, y, width: 20, height: 20, type, vy: 60, bobPhase: Math.random() * Math.PI * 2,
    });
  }, []);

  const firePlayerBullets = useCallback(() => {
    const p = player.current;
    const now = Date.now();
    if (now - p.lastShot < p.fireRate * 1000) return;
    p.lastShot = now;

    const cx = p.x + p.width / 2;
    const top = p.y;
    const lvl = p.weaponLevel;

    // Center shot always
    bullets.current.push({ x: cx - 2, y: top, width: 4, height: 14, vx: 0, vy: -700, damage: 20 + lvl * 5, color: '#00ffff', isPlayer: true, piercing: false, lifetime: 3 });

    if (lvl >= 2) {
      bullets.current.push({ x: cx - 12, y: top + 6, width: 3, height: 12, vx: -40, vy: -650, damage: 15 + lvl * 3, color: '#00ccff', isPlayer: true, piercing: false, lifetime: 3 });
      bullets.current.push({ x: cx + 10, y: top + 6, width: 3, height: 12, vx: 40, vy: -650, damage: 15 + lvl * 3, color: '#00ccff', isPlayer: true, piercing: false, lifetime: 3 });
    }
    if (lvl >= 3) {
      bullets.current.push({ x: cx - 20, y: top + 12, width: 3, height: 10, vx: -80, vy: -600, damage: 12 + lvl * 2, color: '#0088ff', isPlayer: true, piercing: false, lifetime: 3 });
      bullets.current.push({ x: cx + 18, y: top + 12, width: 3, height: 10, vx: 80, vy: -600, damage: 12 + lvl * 2, color: '#0088ff', isPlayer: true, piercing: false, lifetime: 3 });
    }
    if (lvl >= 4) {
      bullets.current.push({ x: cx - 4, y: top - 4, width: 8, height: 18, vx: 0, vy: -800, damage: 35 + lvl * 5, color: '#ffffff', isPlayer: true, piercing: true, lifetime: 3 });
    }
  }, []);

  const fireSpecial = useCallback(() => {
    const p = player.current;
    const now = Date.now();
    if (p.energy < SPECIAL_ENERGY_COST || now - p.lastSpecial < p.specialCooldown * 1000) return;
    p.energy -= SPECIAL_ENERGY_COST;
    p.lastSpecial = now;

    const cx = p.x + p.width / 2;
    const cy = p.y + p.height / 2;
    // Fire 12 bullets in a radial burst
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      bullets.current.push({
        x: cx - 3, y: cy - 3, width: 6, height: 6,
        vx: Math.cos(angle) * 500, vy: Math.sin(angle) * 500,
        damage: 40, color: '#ff00ff', isPlayer: true, piercing: true, lifetime: 1.5,
      });
    }
    addExplosion(cx, cy, 1.5, '#ff00ff');
    addScreenShake(5);
  }, [addExplosion, addScreenShake]);

  const enemyFire = useCallback((e: Enemy) => {
    const cx = e.x + e.width / 2;
    const by = e.y + e.height;
    const p = player.current;
    const dx = (p.x + p.width / 2) - cx;
    const dy = (p.y + p.height / 2) - by;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    const speed = 280 + gameState.current.chapter * 20;

    if (e.behavior === 'boss') {
      // Boss fires patterns
      const phase = e.phase % 3;
      if (phase === 0) {
        // Aimed triple shot
        for (let i = -1; i <= 1; i++) {
          const spread = i * 0.15;
          bullets.current.push({
            x: cx - 3, y: by, width: 6, height: 10,
            vx: (dx / d) * speed + Math.cos(spread) * 40,
            vy: (dy / d) * speed + Math.sin(spread) * 40,
            damage: e.damage, color: e.glowColor, isPlayer: false, piercing: false, lifetime: 4,
          });
        }
      } else if (phase === 1) {
        // Ring burst
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          bullets.current.push({
            x: cx - 2, y: e.y + e.height / 2, width: 5, height: 5,
            vx: Math.cos(angle) * speed * 0.8, vy: Math.sin(angle) * speed * 0.8,
            damage: e.damage * 0.7, color: e.color, isPlayer: false, piercing: false, lifetime: 3,
          });
        }
      } else {
        // Rapid aimed shots
        bullets.current.push({
          x: cx - 2, y: by, width: 4, height: 8,
          vx: (dx / d) * speed * 1.2, vy: (dy / d) * speed * 1.2,
          damage: e.damage * 0.5, color: e.glowColor, isPlayer: false, piercing: false, lifetime: 4,
        });
      }
    } else {
      bullets.current.push({
        x: cx - 2, y: by, width: 4, height: 8,
        vx: (dx / d) * speed * 0.7, vy: Math.abs((dy / d) * speed * 0.7) || speed * 0.5,
        damage: e.damage, color: e.glowColor, isPlayer: false, piercing: false, lifetime: 4,
      });
    }
  }, []);

  // ---------- start chapter ----------
  const startChapter = useCallback((chapterIndex: number) => {
    const ch = CHAPTERS[chapterIndex];
    const gs = gameState.current;
    gs.chapter = chapterIndex;
    gs.wave = 0;
    gs.maxWaves = ch.waves;
    gs.waveTimer = 2;
    gs.waveDelay = 2.5;
    gs.bossDefeated = false;
    gs.phase = 'story';
    gs.storyIndex = 0;
    gs.storyTimer = 0;
    enemies.current = [];
    bullets.current = [];
    // keep player state, restore some resources
    const p = player.current;
    p.health = Math.min(p.health + 30, p.maxHealth);
    p.shield = p.maxShield;
    p.energy = p.maxEnergy;
    p.x = screenSize.width / 2 - 14;
    p.y = screenSize.height - 100;
  }, [screenSize]);

  const startBoss = useCallback(() => {
    const gs = gameState.current;
    const ch = CHAPTERS[gs.chapter];
    gs.phase = 'boss_intro';
    gs.storyTimer = 0;
    enemies.current = [];
    bullets.current = [];
    setTimeout(() => {
      gs.phase = 'boss_fight';
      spawnEnemy(ch.bossType);
    }, 3000);
  }, [spawnEnemy]);

  const spawnWave = useCallback(() => {
    const gs = gameState.current;
    const ch = CHAPTERS[gs.chapter];
    const count = 3 + gs.wave * 2 + gs.chapter * 1;
    for (let i = 0; i < count; i++) {
      const variant = ch.enemyTypes[Math.floor(Math.random() * ch.enemyTypes.length)];
      setTimeout(() => spawnEnemy(variant), i * 400);
    }
    gs.wave++;
  }, [spawnEnemy]);

  // ---------- restart ----------
  const restart = useCallback(() => {
    const gs = gameState.current;
    gs.phase = 'title';
    gs.score = 0;
    gs.chapter = 0;
    gs.wave = 0;
    gs.totalKills = 0;
    gs.highCombo = 0;
    gs.playTime = 0;
    const p = player.current;
    p.health = 100; p.maxHealth = 100;
    p.shield = 50; p.maxShield = 50;
    p.energy = 100; p.maxEnergy = 100;
    p.weaponLevel = 1;
    p.combo = 0; p.comboTimer = 0; p.kills = 0;
    p.invincibleUntil = 0; p.shieldActive = false;
    enemies.current = [];
    bullets.current = [];
    particles.current = [];
    powerUps.current = [];
    explosions.current = [];
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN GAME LOOP
  // ─────────────────────────────────────────────────────────────────────────

  useGameLoop((dt: number) => {
    const gs = gameState.current;
    const { width: W, height: H } = screenSize;
    const p = player.current;

    // Always update visual effects
    stars.current.forEach(s => {
      s.y += s.speed * dt;
      if (s.y > H) { s.y = -2; s.x = Math.random() * W; }
    });
    nebulae.current.forEach(n => {
      n.y += n.speed * dt;
      if (n.y - n.radius > H) { n.y = -n.radius; n.x = Math.random() * W; }
    });
    particles.current = particles.current.filter(pt => {
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      return pt.life > 0;
    });
    explosions.current = explosions.current.filter(ex => {
      ex.time += dt;
      return ex.time < ex.duration;
    });
    gs.screenShake = Math.max(0, gs.screenShake - dt * 30);
    gs.titleBlink += dt;

    // ---------- TITLE ----------
    if (gs.phase === 'title') {
      if (keys.current['enter'] || keys.current[' ']) {
        keys.current['enter'] = false;
        keys.current[' '] = false;
        startChapter(0);
      }
      setTick(t => t + 1);
      return;
    }

    // ---------- STORY ----------
    if (gs.phase === 'story') {
      gs.storyTimer += dt;
      if (keys.current['enter'] || keys.current[' ']) {
        keys.current['enter'] = false;
        keys.current[' '] = false;
        gs.phase = 'playing';
        gs.waveTimer = 1.5;
      }
      setTick(t => t + 1);
      return;
    }

    // ---------- BOSS INTRO ----------
    if (gs.phase === 'boss_intro') {
      gs.storyTimer += dt;
      setTick(t => t + 1);
      return;
    }

    // ---------- CHAPTER COMPLETE ----------
    if (gs.phase === 'chapter_complete') {
      gs.storyTimer += dt;
      if ((keys.current['enter'] || keys.current[' ']) && gs.storyTimer > 1) {
        keys.current['enter'] = false;
        keys.current[' '] = false;
        if (gs.chapter < 4) {
          startChapter(gs.chapter + 1);
        } else {
          gs.phase = 'victory';
          gs.storyTimer = 0;
        }
      }
      setTick(t => t + 1);
      return;
    }

    // ---------- GAME OVER ----------
    if (gs.phase === 'game_over') {
      gs.storyTimer += dt;
      if ((keys.current['enter'] || keys.current[' ']) && gs.storyTimer > 1) {
        keys.current['enter'] = false;
        keys.current[' '] = false;
        restart();
      }
      setTick(t => t + 1);
      return;
    }

    // ---------- VICTORY ----------
    if (gs.phase === 'victory') {
      gs.storyTimer += dt;
      if ((keys.current['enter'] || keys.current[' ']) && gs.storyTimer > 2) {
        keys.current['enter'] = false;
        keys.current[' '] = false;
        restart();
      }
      setTick(t => t + 1);
      return;
    }

    // ---------- PLAYING / BOSS_FIGHT ----------
    gs.playTime += dt;

    // Player movement
    if (keys.current['a'] || keys.current['arrowleft'])  p.x = Math.max(0, p.x - p.speed * dt);
    if (keys.current['d'] || keys.current['arrowright']) p.x = Math.min(W - p.width, p.x + p.speed * dt);
    if (keys.current['w'] || keys.current['arrowup'])   p.y = Math.max(0, p.y - p.speed * dt);
    if (keys.current['s'] || keys.current['arrowdown']) p.y = Math.min(H - p.height, p.y + p.speed * dt);

    // Shield
    p.shieldActive = !!(keys.current['shift'] && p.energy > 5);
    if (p.shieldActive) {
      p.energy = Math.max(0, p.energy - SHIELD_DRAIN * dt);
      if (p.energy <= 0) p.shieldActive = false;
    } else {
      p.energy = Math.min(p.maxEnergy, p.energy + 8 * dt);
    }

    // Fire
    if (keys.current[' ']) firePlayerBullets();
    if (keys.current['e']) { fireSpecial(); keys.current['e'] = false; }

    // Combo timer
    if (p.comboTimer > 0) {
      p.comboTimer -= dt;
      if (p.comboTimer <= 0) {
        if (p.combo > gs.highCombo) gs.highCombo = p.combo;
        p.combo = 0;
      }
    }

    // Bullets
    bullets.current = bullets.current.filter(b => {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.lifetime -= dt;
      return b.lifetime > 0 && b.x > -50 && b.x < W + 50 && b.y > -50 && b.y < H + 50;
    });

    // PowerUps
    powerUps.current = powerUps.current.filter(pu => {
      pu.y += pu.vy * dt;
      pu.bobPhase += dt * 4;
      if (collides(pu, p)) {
        switch (pu.type) {
          case 'health': p.health = Math.min(p.maxHealth, p.health + 25); break;
          case 'shield': p.shield = Math.min(p.maxShield, p.shield + 20); break;
          case 'energy': p.energy = Math.min(p.maxEnergy, p.energy + 30); break;
          case 'weapon': p.weaponLevel = Math.min(4, p.weaponLevel + 1); break;
          case 'special': p.lastSpecial = 0; p.energy = p.maxEnergy; break;
        }
        addExplosion(pu.x + 10, pu.y + 10, 0.5, '#ffffff');
        return false;
      }
      return pu.y < H + 30;
    });

    // Enemy update
    enemies.current = enemies.current.filter(e => {
      e.spawnTimer += dt;
      const t = e.spawnTimer;

      // Movement
      switch (e.behavior) {
        case 'straight':
          e.y += e.vy * dt;
          e.x += e.vx * dt;
          break;
        case 'zigzag':
          e.y += (e.vy || e.speed * 0.5) * dt;
          e.x += Math.sin(t * 3) * e.speed * dt;
          break;
        case 'circle': {
          const centerX = e.x;
          e.x = centerX + Math.sin(t * 2) * 1.5;
          e.y += e.speed * 0.3 * dt;
          break;
        }
        case 'chase': {
          const dx = (p.x + p.width / 2) - (e.x + e.width / 2);
          const dy = (p.y + p.height / 2) - (e.y + e.height / 2);
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          e.x += (dx / d) * e.speed * 0.7 * dt;
          e.y += (dy / d) * e.speed * 0.4 * dt;
          break;
        }
        case 'boss': {
          // Boss movement pattern
          e.phaseTimer += dt;
          if (e.phaseTimer > 4) { e.phase = (e.phase + 1) % 3; e.phaseTimer = 0; }

          // Move to arena top
          if (e.y < 60) {
            e.y += 60 * dt;
          } else {
            // Horizontal sweep
            e.x += Math.sin(t * 0.8) * e.speed * 2 * dt;
            e.y = 60 + Math.sin(t * 0.5) * 30;
          }
          e.x = Math.max(10, Math.min(W - e.width - 10, e.x));
          break;
        }
      }

      // Boundary
      if (e.x < 0) e.x = 0;
      if (e.x > W - e.width) e.x = W - e.width;

      // Enemy fire
      const now = Date.now();
      if (now - e.lastShot > e.fireRate * 1000 && e.y > 0 && e.y < H * 0.7) {
        if (Math.random() < (e.behavior === 'boss' ? 0.8 : 0.4) * dt * 10) {
          enemyFire(e);
          e.lastShot = now;
        }
      }

      // Remove if off screen (non-boss)
      if (e.behavior !== 'boss' && e.y > H + 60) return false;
      return true;
    });

    // Player bullets vs enemies
    bullets.current = bullets.current.filter(b => {
      if (!b.isPlayer) return true;
      let alive = true;
      enemies.current = enemies.current.filter(e => {
        if (!alive && !b.piercing) return true;
        if (collides(b, e)) {
          e.health -= b.damage;
          if (!b.piercing) alive = false;
          if (e.health <= 0) {
            gs.score += e.points * (1 + Math.floor(p.combo / 5) * 0.5);
            gs.totalKills++;
            p.kills++;
            p.combo++;
            p.comboTimer = 3;
            const isBoss = e.behavior === 'boss';
            addExplosion(e.x + e.width / 2, e.y + e.height / 2, isBoss ? 3 : 1, e.color);
            addScreenShake(isBoss ? 12 : 3);
            spawnPowerUp(e.x + e.width / 2, e.y + e.height / 2);
            if (isBoss) {
              gs.bossDefeated = true;
              gs.phase = 'chapter_complete';
              gs.storyTimer = 0;
              // extra drops
              for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                  addExplosion(
                    e.x + Math.random() * e.width,
                    e.y + Math.random() * e.height,
                    2, e.glowColor
                  );
                }, i * 200);
              }
            }
            return false;
          } else {
            // Hit flash particle
            particles.current.push({
              x: b.x, y: b.y, vx: 0, vy: 0, life: 0.1, maxLife: 0.1,
              color: '#ffffff', size: 4,
            });
          }
        }
        return true;
      });
      return alive;
    });

    // Enemy bullets vs player
    if (Date.now() > p.invincibleUntil) {
      bullets.current = bullets.current.filter(b => {
        if (b.isPlayer) return true;
        if (collides(b, p)) {
          let dmg = b.damage;
          if (p.shieldActive) {
            dmg *= (1 - SHIELD_ABSORB);
            p.energy = Math.max(0, p.energy - 10);
          }
          if (p.shield > 0) {
            const absorbed = Math.min(p.shield, dmg * 0.5);
            p.shield -= absorbed;
            dmg -= absorbed;
          }
          p.health -= dmg;
          addExplosion(b.x, b.y, 0.5, '#ff4444');
          addScreenShake(2);

          if (p.health <= 0) {
            p.health = 0;
            gs.phase = 'game_over';
            gs.storyTimer = 0;
            addExplosion(p.x + p.width / 2, p.y + p.height / 2, 3, '#ff8800');
          }
          return false;
        }
        return true;
      });

      // Enemy collision
      enemies.current.forEach(e => {
        if (collides(e, p) && Date.now() > p.invincibleUntil) {
          let dmg = e.damage * 2;
          if (p.shieldActive) dmg *= (1 - SHIELD_ABSORB);
          p.health -= dmg;
          p.invincibleUntil = Date.now() + 500;
          addExplosion(p.x + p.width / 2, p.y + p.height / 2, 1, '#ff8800');
          addScreenShake(5);
          if (p.health <= 0) {
            p.health = 0;
            gs.phase = 'game_over';
            gs.storyTimer = 0;
          }
        }
      });
    }

    // Wave spawning (playing phase only)
    if (gs.phase === 'playing') {
      const aliveEnemies = enemies.current.length;
      if (aliveEnemies === 0) {
        gs.waveTimer -= dt;
        if (gs.waveTimer <= 0) {
          if (gs.wave >= gs.maxWaves) {
            startBoss();
          } else {
            spawnWave();
            gs.waveTimer = gs.waveDelay;
          }
        }
      }
    }

    // Shield regen
    if (!p.shieldActive && p.shield < p.maxShield) {
      p.shield = Math.min(p.maxShield, p.shield + 3 * dt);
    }

    setTick(t => t + 1);
  });

  return {
    screenSize,
    gameState: gameState.current,
    player: player.current,
    enemies: enemies.current,
    bullets: bullets.current,
    particles: particles.current,
    powerUps: powerUps.current,
    explosions: explosions.current,
    stars: stars.current,
    nebulae: nebulae.current,
    startChapter,
    restart,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDERER COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface Props { onExit: () => void; }

export default function Nexus2500Game({ onExit }: Props) {
  const {
    screenSize, gameState, player, enemies, bullets, particles,
    powerUps, explosions, stars, nebulae,
  } = useNexus2500(onExit);

  const { width: W, height: H } = screenSize;
  const gs = gameState;
  const ch = gs.chapter >= 0 && gs.chapter < CHAPTERS.length ? CHAPTERS[gs.chapter] : CHAPTERS[0];

  // Screen shake offset
  const shakeX = gs.screenShake > 0 ? (Math.random() - 0.5) * gs.screenShake : 0;
  const shakeY = gs.screenShake > 0 ? (Math.random() - 0.5) * gs.screenShake : 0;

  const bgColor = gs.phase === 'title' ? '#030012' : ch.bgColor;

  // ─────────────── POWER-UP COLORS ───────────────
  const puColors: Record<string, string> = {
    health: '#44ff44', shield: '#4488ff', energy: '#ffff44', weapon: '#ff8800', special: '#ff44ff',
  };

  // ─────────────── TITLE SCREEN ───────────────
  if (gs.phase === 'title') {
    const blink = Math.sin(gs.titleBlink * 3) > 0;
    return (
      <div style={{ margin: 0, padding: 0, overflow: 'hidden', background: '#000', width: '100vw', height: '100vh' }}>
        <PivotCanvas width={W} height={H} background="#030012">
          <PivotRectangle position={{ x: 0, y: 0 }} width={W} height={H} fill="#030012" />
          {/* Stars */}
          {stars.map((s, i) => (
            <PivotCircle key={`ts${i}`} center={{ x: s.x, y: s.y }} radius={s.size}
              fill={hexAlpha('#8888ff', s.brightness)} />
          ))}
          {/* Nebulae */}
          {nebulae.map((n, i) => (
            <PivotCircle key={`tn${i}`} center={{ x: n.x, y: n.y }} radius={n.radius}
              fill={hexAlpha(n.color, n.alpha)} />
          ))}
          {/* Title glow */}
          <PivotCircle center={{ x: W / 2, y: H * 0.3 }} radius={200}
            fill={hexAlpha('#4400aa', 0.08)} />
          <PivotCircle center={{ x: W / 2, y: H * 0.3 }} radius={120}
            fill={hexAlpha('#6600ff', 0.05)} />
          {/* Title text */}
          <PivotLabel text="N E X U S  2 5 0 0"
            position={{ x: W / 2, y: H * 0.25 }}
            font="bold 72px 'Courier New', monospace" fill="#cc88ff" textAlign="center" />
          <PivotLabel text="T H E   L A S T   S I G N A L"
            position={{ x: W / 2, y: H * 0.33 }}
            font="bold 28px 'Courier New', monospace" fill="#8866cc" textAlign="center" />
          {/* Tagline */}
          <PivotLabel text="Year 2487. A signal from the void calls. You are humanity's last hope."
            position={{ x: W / 2, y: H * 0.45 }}
            font="18px 'Courier New', monospace" fill="#887799" textAlign="center" />
          {/* Controls */}
          <PivotLabel text="CONTROLS"
            position={{ x: W / 2, y: H * 0.55 }}
            font="bold 20px 'Courier New', monospace" fill="#aaaacc" textAlign="center" />
          <PivotLabel text="WASD / Arrows — Move   |   SPACE — Fire   |   SHIFT — Shield   |   E — Special"
            position={{ x: W / 2, y: H * 0.60 }}
            font="16px 'Courier New', monospace" fill="#777799" textAlign="center" />
          <PivotLabel text="ESC — Exit to Menu"
            position={{ x: W / 2, y: H * 0.64 }}
            font="14px 'Courier New', monospace" fill="#555577" textAlign="center" />
          {/* Start prompt */}
          {blink && (
            <PivotLabel text="[  PRESS ENTER OR SPACE TO BEGIN  ]"
              position={{ x: W / 2, y: H * 0.78 }}
              font="bold 24px 'Courier New', monospace" fill="#ffffff" textAlign="center" />
          )}
          {/* Credits */}
          <PivotLabel text="Built with PivotX"
            position={{ x: W / 2, y: H - 40 }}
            font="14px 'Courier New', monospace" fill="#444466" textAlign="center" />
        </PivotCanvas>
      </div>
    );
  }

  // ─────────────── STORY SCREEN ───────────────
  if (gs.phase === 'story') {
    const lines = ch.story;
    const revealedChars = Math.floor(gs.storyTimer * 40); // typewriter speed
    let charCount = 0;
    return (
      <div style={{ margin: 0, padding: 0, overflow: 'hidden', background: '#000', width: '100vw', height: '100vh' }}>
        <PivotCanvas width={W} height={H} background={bgColor}>
          <PivotRectangle position={{ x: 0, y: 0 }} width={W} height={H} fill={bgColor} />
          {stars.map((s, i) => (
            <PivotCircle key={`ss${i}`} center={{ x: s.x, y: s.y }} radius={s.size * 0.7}
              fill={hexAlpha(ch.starColor, s.brightness * 0.5)} />
          ))}
          {/* Chapter title */}
          <PivotLabel text={ch.title}
            position={{ x: W / 2, y: 80 }}
            font="bold 40px 'Courier New', monospace" fill="#ffffff" textAlign="center" />
          <PivotLabel text={ch.subtitle}
            position={{ x: W / 2, y: 125 }}
            font="bold 22px 'Courier New', monospace" fill={ch.starColor} textAlign="center" />
          {/* Story lines with typewriter effect */}
          {lines.map((line, i) => {
            const lineStart = charCount;
            charCount += line.length;
            const visibleLen = Math.max(0, Math.min(line.length, revealedChars - lineStart));
            const text = line.substring(0, visibleLen);
            if (visibleLen === 0 && lineStart > revealedChars) return null;
            return (
              <PivotLabel key={`sl${i}`}
                text={text || ' '}
                position={{ x: W / 2, y: 190 + i * 30 }}
                font="18px 'Courier New', monospace"
                fill={hexAlpha('#ccccdd', Math.min(1, visibleLen / Math.max(1, line.length)))}
                textAlign="center" />
            );
          })}
          {/* Skip prompt */}
          <PivotLabel text="[  PRESS ENTER OR SPACE TO SKIP  ]"
            position={{ x: W / 2, y: H - 60 }}
            font="16px 'Courier New', monospace"
            fill={hexAlpha('#888888', 0.5 + Math.sin(gs.storyTimer * 3) * 0.5)}
            textAlign="center" />
        </PivotCanvas>
      </div>
    );
  }

  // ─────────────── BOSS INTRO ───────────────
  if (gs.phase === 'boss_intro') {
    return (
      <div style={{ margin: 0, padding: 0, overflow: 'hidden', background: '#000', width: '100vw', height: '100vh' }}>
        <PivotCanvas width={W} height={H} background="#000">
          <PivotRectangle position={{ x: 0, y: 0 }} width={W} height={H} fill="#000" />
          {stars.map((s, i) => (
            <PivotCircle key={`bs${i}`} center={{ x: s.x, y: s.y }} radius={s.size}
              fill={hexAlpha('#ff4444', s.brightness * 0.3)} />
          ))}
          {/* Warning flash */}
          <PivotRectangle position={{ x: 0, y: 0 }} width={W} height={H}
            fill={hexAlpha('#ff0000', 0.03 + Math.sin(gs.storyTimer * 8) * 0.03)} />
          <PivotLabel text="⚠  WARNING  ⚠"
            position={{ x: W / 2, y: H * 0.3 }}
            font="bold 48px 'Courier New', monospace" fill="#ff4444" textAlign="center" />
          <PivotLabel text={ch.bossName}
            position={{ x: W / 2, y: H * 0.43 }}
            font="bold 56px 'Courier New', monospace" fill="#ffffff" textAlign="center" />
          <PivotLabel text={ch.bossStory}
            position={{ x: W / 2, y: H * 0.55 }}
            font="18px 'Courier New', monospace" fill="#ff8888" textAlign="center" />
          <PivotLabel text="PREPARE FOR BATTLE"
            position={{ x: W / 2, y: H * 0.7 }}
            font="bold 24px 'Courier New', monospace"
            fill={hexAlpha('#ffaa00', 0.5 + Math.sin(gs.storyTimer * 5) * 0.5)}
            textAlign="center" />
        </PivotCanvas>
      </div>
    );
  }

  // ─────────────── CHAPTER COMPLETE ───────────────
  if (gs.phase === 'chapter_complete') {
    return (
      <div style={{ margin: 0, padding: 0, overflow: 'hidden', background: '#000', width: '100vw', height: '100vh' }}>
        <PivotCanvas width={W} height={H} background="#000510">
          <PivotRectangle position={{ x: 0, y: 0 }} width={W} height={H} fill="#000510" />
          {stars.map((s, i) => (
            <PivotCircle key={`cs${i}`} center={{ x: s.x, y: s.y }} radius={s.size}
              fill={hexAlpha('#44ff88', s.brightness * 0.4)} />
          ))}
          {/* Particles from boss explosion */}
          {particles.map((pt, i) => (
            <PivotCircle key={`cp${i}`} center={{ x: pt.x, y: pt.y }} radius={pt.size}
              fill={hexAlpha(pt.color, pt.life / pt.maxLife)} />
          ))}
          <PivotLabel text={`${ch.bossName} DESTROYED`}
            position={{ x: W / 2, y: H * 0.2 }}
            font="bold 40px 'Courier New', monospace" fill="#44ff88" textAlign="center" />
          <PivotLabel text={`${ch.title} COMPLETE`}
            position={{ x: W / 2, y: H * 0.3 }}
            font="bold 28px 'Courier New', monospace" fill="#ffffff" textAlign="center" />
          <PivotLabel text={`Score: ${Math.floor(gs.score)}`}
            position={{ x: W / 2, y: H * 0.42 }}
            font="24px 'Courier New', monospace" fill="#ffdd44" textAlign="center" />
          <PivotLabel text={`Kills: ${gs.totalKills}  |  Best Combo: ${gs.highCombo}x`}
            position={{ x: W / 2, y: H * 0.50 }}
            font="20px 'Courier New', monospace" fill="#aaaacc" textAlign="center" />
          <PivotLabel text={gs.chapter < 4 ? `Next: ${CHAPTERS[gs.chapter + 1].title} — ${CHAPTERS[gs.chapter + 1].subtitle}` : 'FINAL CHAPTER COMPLETE'}
            position={{ x: W / 2, y: H * 0.62 }}
            font="20px 'Courier New', monospace" fill="#8888cc" textAlign="center" />
          {gs.storyTimer > 1 && (
            <PivotLabel text="[  PRESS ENTER OR SPACE TO CONTINUE  ]"
              position={{ x: W / 2, y: H * 0.78 }}
              font="bold 20px 'Courier New', monospace"
              fill={hexAlpha('#ffffff', 0.5 + Math.sin(gs.storyTimer * 3) * 0.5)}
              textAlign="center" />
          )}
        </PivotCanvas>
      </div>
    );
  }

  // ─────────────── GAME OVER ───────────────
  if (gs.phase === 'game_over') {
    return (
      <div style={{ margin: 0, padding: 0, overflow: 'hidden', background: '#000', width: '100vw', height: '100vh' }}>
        <PivotCanvas width={W} height={H} background="#100505">
          <PivotRectangle position={{ x: 0, y: 0 }} width={W} height={H} fill="#100505" />
          {stars.map((s, i) => (
            <PivotCircle key={`gs${i}`} center={{ x: s.x, y: s.y }} radius={s.size}
              fill={hexAlpha('#ff4444', s.brightness * 0.2)} />
          ))}
          {particles.map((pt, i) => (
            <PivotCircle key={`gp${i}`} center={{ x: pt.x, y: pt.y }} radius={pt.size}
              fill={hexAlpha(pt.color, pt.life / pt.maxLife)} />
          ))}
          <PivotLabel text="MISSION FAILED"
            position={{ x: W / 2, y: H * 0.2 }}
            font="bold 56px 'Courier New', monospace" fill="#ff4444" textAlign="center" />
          <PivotLabel text="The AEGIS-7 has been destroyed."
            position={{ x: W / 2, y: H * 0.30 }}
            font="20px 'Courier New', monospace" fill="#ff8888" textAlign="center" />
          <PivotLabel text="The signal continues to pulse..."
            position={{ x: W / 2, y: H * 0.35 }}
            font="18px 'Courier New', monospace" fill="#884444" textAlign="center" />
          <PivotLabel text={`Chapter: ${CHAPTERS[gs.chapter].title} — ${CHAPTERS[gs.chapter].subtitle}`}
            position={{ x: W / 2, y: H * 0.47 }}
            font="20px 'Courier New', monospace" fill="#cccccc" textAlign="center" />
          <PivotLabel text={`Final Score: ${Math.floor(gs.score)}`}
            position={{ x: W / 2, y: H * 0.54 }}
            font="bold 28px 'Courier New', monospace" fill="#ffdd44" textAlign="center" />
          <PivotLabel text={`Kills: ${gs.totalKills}  |  Best Combo: ${gs.highCombo}x  |  Time: ${Math.floor(gs.playTime)}s`}
            position={{ x: W / 2, y: H * 0.61 }}
            font="18px 'Courier New', monospace" fill="#aaaaaa" textAlign="center" />
          {gs.storyTimer > 1 && (
            <PivotLabel text="[  PRESS ENTER OR SPACE TO RESTART  ]"
              position={{ x: W / 2, y: H * 0.78 }}
              font="bold 20px 'Courier New', monospace"
              fill={hexAlpha('#ffffff', 0.5 + Math.sin(gs.storyTimer * 3) * 0.5)}
              textAlign="center" />
          )}
        </PivotCanvas>
      </div>
    );
  }

  // ─────────────── VICTORY ───────────────
  if (gs.phase === 'victory') {
    const revealedLines = Math.floor(gs.storyTimer * 2);
    return (
      <div style={{ margin: 0, padding: 0, overflow: 'hidden', background: '#000', width: '100vw', height: '100vh' }}>
        <PivotCanvas width={W} height={H} background="#000818">
          <PivotRectangle position={{ x: 0, y: 0 }} width={W} height={H} fill="#000818" />
          {stars.map((s, i) => (
            <PivotCircle key={`vs${i}`} center={{ x: s.x, y: s.y }} radius={s.size}
              fill={hexAlpha('#ffffff', s.brightness * 0.6)} />
          ))}
          {/* Golden particles */}
          {particles.map((pt, i) => (
            <PivotCircle key={`vp${i}`} center={{ x: pt.x, y: pt.y }} radius={pt.size}
              fill={hexAlpha(pt.color, pt.life / pt.maxLife)} />
          ))}
          {/* Victory text crawl */}
          {VICTORY_TEXT.map((line, i) => {
            if (i > revealedLines) return null;
            const alpha = Math.min(1, (revealedLines - i) * 0.3 + 0.3);
            return (
              <PivotLabel key={`vl${i}`}
                text={line}
                position={{ x: W / 2, y: 60 + i * 28 }}
                font={line.startsWith('—') ? "bold 24px 'Courier New', monospace" : "18px 'Courier New', monospace"}
                fill={hexAlpha(line.startsWith('"') ? '#ffdd88' : '#ccccee', alpha)}
                textAlign="center" />
            );
          })}
          {/* Stats */}
          {gs.storyTimer > 12 && (
            <>
              <PivotRectangle position={{ x: W / 2 - 200, y: H - 200 }} width={400} height={130}
                fill={hexAlpha('#000000', 0.7)} stroke="#444466" lineWidth={1} />
              <PivotLabel text={`FINAL SCORE: ${Math.floor(gs.score)}`}
                position={{ x: W / 2, y: H - 180 }}
                font="bold 22px 'Courier New', monospace" fill="#ffdd44" textAlign="center" />
              <PivotLabel text={`Kills: ${gs.totalKills}  |  Best Combo: ${gs.highCombo}x`}
                position={{ x: W / 2, y: H - 150 }}
                font="16px 'Courier New', monospace" fill="#aaaacc" textAlign="center" />
              <PivotLabel text={`Mission Time: ${Math.floor(gs.playTime / 60)}m ${Math.floor(gs.playTime % 60)}s`}
                position={{ x: W / 2, y: H - 125 }}
                font="16px 'Courier New', monospace" fill="#aaaacc" textAlign="center" />
              <PivotLabel text="[  PRESS ENTER TO RETURN  ]"
                position={{ x: W / 2, y: H - 95 }}
                font="bold 16px 'Courier New', monospace"
                fill={hexAlpha('#ffffff', 0.5 + Math.sin(gs.storyTimer * 3) * 0.5)}
                textAlign="center" />
            </>
          )}
        </PivotCanvas>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GAMEPLAY RENDER (playing / boss_fight)
  // ═══════════════════════════════════════════════════════════════════════════

  const p = player;
  const healthPct = p.health / p.maxHealth;
  const shieldPct = p.shield / p.maxShield;
  const energyPct = p.energy / p.maxEnergy;

  return (
    <div style={{ margin: 0, padding: 0, overflow: 'hidden', background: '#000', width: '100vw', height: '100vh' }}>
      <PivotCanvas width={W} height={H} background={bgColor}>
        {/* Background */}
        <PivotRectangle position={{ x: shakeX, y: shakeY }} width={W} height={H} fill={bgColor} />

        {/* Nebulae */}
        {nebulae.map((n, i) => (
          <PivotCircle key={`n${i}`}
            center={{ x: n.x + shakeX, y: n.y + shakeY }}
            radius={n.radius}
            fill={hexAlpha(n.color, n.alpha)} />
        ))}

        {/* Stars */}
        {stars.map((s, i) => (
          <PivotCircle key={`s${i}`}
            center={{ x: s.x + shakeX, y: s.y + shakeY }}
            radius={s.size}
            fill={hexAlpha(ch.starColor, s.brightness)} />
        ))}

        {/* Particles */}
        {particles.map((pt, i) => (
          <PivotCircle key={`pt${i}`}
            center={{ x: pt.x + shakeX, y: pt.y + shakeY }}
            radius={pt.size * (pt.life / pt.maxLife)}
            fill={hexAlpha(pt.color, pt.life / pt.maxLife)} />
        ))}

        {/* Explosions */}
        {explosions.map((ex, i) => {
          const progress = ex.time / ex.duration;
          const r = ex.size * 30 * progress;
          return (
            <React.Fragment key={`ex${i}`}>
              <PivotCircle
                center={{ x: ex.x + shakeX, y: ex.y + shakeY }}
                radius={r}
                fill={hexAlpha(ex.color, (1 - progress) * 0.6)} />
              <PivotCircle
                center={{ x: ex.x + shakeX, y: ex.y + shakeY }}
                radius={r * 0.5}
                fill={hexAlpha('#ffffff', (1 - progress) * 0.4)} />
            </React.Fragment>
          );
        })}

        {/* Power-ups */}
        {powerUps.map((pu, i) => {
          const bob = Math.sin(pu.bobPhase) * 3;
          const col = puColors[pu.type] || '#ffffff';
          return (
            <React.Fragment key={`pu${i}`}>
              <PivotCircle
                center={{ x: pu.x + 10 + shakeX, y: pu.y + 10 + bob + shakeY }}
                radius={14} fill={hexAlpha(col, 0.15)} />
              <PivotRectangle
                position={{ x: pu.x + shakeX, y: pu.y + bob + shakeY }}
                width={pu.width} height={pu.height}
                fill={col} stroke="#ffffff" lineWidth={1} />
              <PivotLabel
                text={pu.type[0].toUpperCase()}
                position={{ x: pu.x + 10 + shakeX, y: pu.y + 14 + bob + shakeY }}
                font="bold 12px Arial" fill="#000" textAlign="center" />
            </React.Fragment>
          );
        })}

        {/* Enemies */}
        {enemies.map((e, i) => {
          const hpPct = e.health / e.maxHealth;
          const isBoss = e.behavior === 'boss';
          return (
            <React.Fragment key={`e${i}`}>
              {/* Glow */}
              <PivotCircle
                center={{ x: e.x + e.width / 2 + shakeX, y: e.y + e.height / 2 + shakeY }}
                radius={(isBoss ? e.width : e.width * 0.7)}
                fill={hexAlpha(e.glowColor, 0.08 + (isBoss ? 0.04 : 0))} />
              {/* Body */}
              <PivotRectangle
                position={{ x: e.x + shakeX, y: e.y + shakeY }}
                width={e.width} height={e.height}
                fill={e.color} stroke={e.glowColor} lineWidth={isBoss ? 3 : 1} />
              {/* Eye / core */}
              <PivotCircle
                center={{ x: e.x + e.width / 2 + shakeX, y: e.y + e.height / 2 + shakeY }}
                radius={isBoss ? 8 : 3}
                fill="#ffffff" />
              {/* HP bar */}
              {(isBoss || hpPct < 1) && (
                <>
                  <PivotRectangle
                    position={{ x: e.x + shakeX, y: e.y - 8 + shakeY }}
                    width={e.width} height={4}
                    fill="#333333" />
                  <PivotRectangle
                    position={{ x: e.x + shakeX, y: e.y - 8 + shakeY }}
                    width={e.width * hpPct} height={4}
                    fill={hpPct > 0.5 ? '#44ff44' : hpPct > 0.25 ? '#ffaa00' : '#ff4444'} />
                </>
              )}
              {/* Boss name */}
              {isBoss && (
                <PivotLabel
                  text={ch.bossName}
                  position={{ x: e.x + e.width / 2 + shakeX, y: e.y - 18 + shakeY }}
                  font="bold 14px 'Courier New', monospace" fill="#ff4444" textAlign="center" />
              )}
            </React.Fragment>
          );
        })}

        {/* Bullets */}
        {bullets.map((b, i) => (
          <React.Fragment key={`b${i}`}>
            {b.piercing && (
              <PivotCircle
                center={{ x: b.x + b.width / 2 + shakeX, y: b.y + b.height / 2 + shakeY }}
                radius={6} fill={hexAlpha(b.color, 0.2)} />
            )}
            <PivotRectangle
              position={{ x: b.x + shakeX, y: b.y + shakeY }}
              width={b.width} height={b.height}
              fill={b.color} />
          </React.Fragment>
        ))}

        {/* Player */}
        {p.health > 0 && (
          <>
            {/* Engine glow */}
            <PivotCircle
              center={{ x: p.x + p.width / 2 + shakeX, y: p.y + p.height + 5 + shakeY }}
              radius={8 + Math.random() * 4}
              fill={hexAlpha('#00aaff', 0.3)} />
            <PivotCircle
              center={{ x: p.x + p.width / 2 + shakeX, y: p.y + p.height + 3 + shakeY }}
              radius={4 + Math.random() * 2}
              fill={hexAlpha('#88ddff', 0.5)} />
            {/* Ship body */}
            <PivotRectangle
              position={{ x: p.x + 4 + shakeX, y: p.y + shakeY }}
              width={p.width - 8} height={p.height}
              fill="#88ccff" stroke="#44aaff" lineWidth={2} />
            {/* Wings */}
            <PivotRectangle
              position={{ x: p.x + shakeX, y: p.y + 10 + shakeY }}
              width={6} height={p.height - 12}
              fill="#6699cc" />
            <PivotRectangle
              position={{ x: p.x + p.width - 6 + shakeX, y: p.y + 10 + shakeY }}
              width={6} height={p.height - 12}
              fill="#6699cc" />
            {/* Cockpit */}
            <PivotCircle
              center={{ x: p.x + p.width / 2 + shakeX, y: p.y + 10 + shakeY }}
              radius={5} fill="#ffffff" />
            {/* Shield visual */}
            {p.shieldActive && (
              <PivotCircle
                center={{ x: p.x + p.width / 2 + shakeX, y: p.y + p.height / 2 + shakeY }}
                radius={28}
                fill={hexAlpha('#4488ff', 0.15)}
                stroke={hexAlpha('#44aaff', 0.6)}
                lineWidth={2} />
            )}
            {/* Invincibility flash */}
            {Date.now() < p.invincibleUntil && Date.now() % 100 < 50 && (
              <PivotCircle
                center={{ x: p.x + p.width / 2 + shakeX, y: p.y + p.height / 2 + shakeY }}
                radius={22}
                fill={hexAlpha('#ffffff', 0.2)} />
            )}
          </>
        )}

        {/* ═════════════════ HUD ═════════════════ */}

        {/* Top-left: Chapter & Wave */}
        <PivotRectangle position={{ x: 10, y: 10 }} width={250} height={55}
          fill={hexAlpha('#000000', 0.6)} stroke="#333355" lineWidth={1} />
        <PivotLabel text={`${ch.title}: ${ch.subtitle}`}
          position={{ x: 20, y: 30 }}
          font="bold 13px 'Courier New', monospace" fill="#aaaacc" textAlign="left" />
        <PivotLabel text={gs.phase === 'boss_fight' ? `BOSS FIGHT` : `Wave ${gs.wave} / ${gs.maxWaves}`}
          position={{ x: 20, y: 50 }}
          font="12px 'Courier New', monospace"
          fill={gs.phase === 'boss_fight' ? '#ff4444' : '#888899'}
          textAlign="left" />

        {/* Top-center: Score */}
        <PivotLabel text={`SCORE: ${Math.floor(gs.score)}`}
          position={{ x: W / 2, y: 28 }}
          font="bold 22px 'Courier New', monospace" fill="#ffdd44" textAlign="center" />

        {/* Combo */}
        {p.combo > 1 && (
          <PivotLabel text={`${p.combo}x COMBO!`}
            position={{ x: W / 2, y: 55 }}
            font={`bold ${16 + Math.min(p.combo, 10)}px 'Courier New', monospace`}
            fill={p.combo >= 10 ? '#ff44ff' : p.combo >= 5 ? '#ffaa00' : '#44ff44'}
            textAlign="center" />
        )}

        {/* Top-right: Kills */}
        <PivotLabel text={`KILLS: ${gs.totalKills}`}
          position={{ x: W - 20, y: 28 }}
          font="bold 16px 'Courier New', monospace" fill="#aaaaaa" textAlign="right" />

        {/* Bottom-left: Health, Shield, Energy bars */}
        <PivotRectangle position={{ x: 10, y: H - 80 }} width={220} height={65}
          fill={hexAlpha('#000000', 0.6)} stroke="#333355" lineWidth={1} />

        {/* Health bar */}
        <PivotLabel text="HP" position={{ x: 20, y: H - 63 }}
          font="bold 11px 'Courier New', monospace" fill="#ff4444" textAlign="left" />
        <PivotRectangle position={{ x: 45, y: H - 72 }} width={170} height={10}
          fill="#331111" />
        <PivotRectangle position={{ x: 45, y: H - 72 }} width={170 * healthPct} height={10}
          fill={healthPct > 0.5 ? '#44ff44' : healthPct > 0.25 ? '#ffaa00' : '#ff4444'} />
        <PivotLabel text={`${Math.ceil(p.health)}/${p.maxHealth}`}
          position={{ x: 130, y: H - 63 }}
          font="9px 'Courier New', monospace" fill="#ffffff" textAlign="center" />

        {/* Shield bar */}
        <PivotLabel text="SH" position={{ x: 20, y: H - 47 }}
          font="bold 11px 'Courier New', monospace" fill="#4488ff" textAlign="left" />
        <PivotRectangle position={{ x: 45, y: H - 56 }} width={170} height={10}
          fill="#112233" />
        <PivotRectangle position={{ x: 45, y: H - 56 }} width={170 * shieldPct} height={10}
          fill="#4488ff" />
        <PivotLabel text={`${Math.ceil(p.shield)}/${p.maxShield}`}
          position={{ x: 130, y: H - 47 }}
          font="9px 'Courier New', monospace" fill="#ffffff" textAlign="center" />

        {/* Energy bar */}
        <PivotLabel text="EN" position={{ x: 20, y: H - 31 }}
          font="bold 11px 'Courier New', monospace" fill="#ffdd44" textAlign="left" />
        <PivotRectangle position={{ x: 45, y: H - 40 }} width={170} height={10}
          fill="#222211" />
        <PivotRectangle position={{ x: 45, y: H - 40 }} width={170 * energyPct} height={10}
          fill="#ffdd44" />
        <PivotLabel text={`${Math.ceil(p.energy)}/${p.maxEnergy}`}
          position={{ x: 130, y: H - 31 }}
          font="9px 'Courier New', monospace" fill="#ffffff" textAlign="center" />

        {/* Bottom-right: Weapon level */}
        <PivotRectangle position={{ x: W - 170, y: H - 55 }} width={155} height={40}
          fill={hexAlpha('#000000', 0.6)} stroke="#333355" lineWidth={1} />
        <PivotLabel text={`WEAPON LVL ${p.weaponLevel}`}
          position={{ x: W - 92, y: H - 38 }}
          font="bold 13px 'Courier New', monospace" fill="#00ffff" textAlign="center" />
        {/* Weapon level pips */}
        {[1, 2, 3, 4].map(lvl => (
          <PivotRectangle key={`wlvl${lvl}`}
            position={{ x: W - 156 + (lvl - 1) * 36, y: H - 30 }}
            width={28} height={8}
            fill={lvl <= p.weaponLevel ? '#00ffff' : '#333344'} />
        ))}

        {/* ESC hint */}
        <PivotLabel text="ESC: Menu"
          position={{ x: W / 2, y: H - 15 }}
          font="12px 'Courier New', monospace" fill="#555566" textAlign="center" />

        {/* Wave incoming text */}
        {gs.phase === 'playing' && enemies.length === 0 && gs.wave < gs.maxWaves && (
          <PivotLabel text={`WAVE ${gs.wave + 1} INCOMING...`}
            position={{ x: W / 2, y: H / 2 - 20 }}
            font="bold 28px 'Courier New', monospace"
            fill={hexAlpha('#ffffff', 0.5 + Math.sin(Date.now() / 200) * 0.5)}
            textAlign="center" />
        )}

        {/* Boss incoming */}
        {gs.phase === 'playing' && enemies.length === 0 && gs.wave >= gs.maxWaves && (
          <PivotLabel text="⚠ BOSS APPROACHING ⚠"
            position={{ x: W / 2, y: H / 2 - 20 }}
            font="bold 32px 'Courier New', monospace"
            fill={hexAlpha('#ff4444', 0.5 + Math.sin(Date.now() / 150) * 0.5)}
            textAlign="center" />
        )}
      </PivotCanvas>
    </div>
  );
}
