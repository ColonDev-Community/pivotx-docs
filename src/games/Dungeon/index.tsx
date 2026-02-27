/**
 * DUNGEON OF SHADOWS - A Roguelike Dungeon Crawler
 * 
 * Features:
 * - Procedurally generated dungeon rooms with corridors
 * - Multiple enemy types (Slime, Skeleton, Demon, Boss)
 * - Melee & ranged combat with combo system
 * - Loot drops (Health, Shield, Speed, Damage, Multi-shot)
 * - Level progression with increasing difficulty
 * - Minimap, health/shield bars, kill counter
 * - Screen shake & particle effects
 * - Boss fights every 5 levels
 * - Permadeath with final stats screen
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
import { useExitToMenu } from '../../hooks/useExitToMenu';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Vec2 { x: number; y: number; }

interface Entity {
  x: number; y: number;
  width: number; height: number;
  vx: number; vy: number;
}

interface PlayerState extends Entity {
  health: number; maxHealth: number;
  shield: number; maxShield: number;
  damage: number;
  speed: number;
  fireRate: number;
  lastShot: number;
  multiShot: number;
  dashCooldown: number;
  lastDash: number;
  dashDuration: number;
  isDashing: boolean;
  dashVx: number; dashVy: number;
  invincibleUntil: number;
  kills: number;
  combo: number;
  comboTimer: number;
  xp: number;
  level: number;
  xpToNext: number;
}

type EnemyType = 'slime' | 'skeleton' | 'demon' | 'boss';

interface EnemyState extends Entity {
  type: EnemyType;
  health: number; maxHealth: number;
  damage: number;
  speed: number;
  fireRate: number;
  lastShot: number;
  lastAttack: number;
  attackCooldown: number;
  points: number;
  behavior: 'chase' | 'circle' | 'ranged' | 'boss';
  phase: number; // for boss AI
  color: string;
  stunUntil: number;
}

interface Bullet extends Entity {
  damage: number;
  color: string;
  isPlayerBullet: boolean;
  lifetime: number;
  maxLifetime: number;
  piercing: boolean;
}

type LootType = 'health' | 'shield' | 'speed' | 'damage' | 'multishot' | 'xp';

interface LootDrop extends Entity {
  type: LootType;
  lifetime: number;
  bobPhase: number;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  color: string;
  size: number;
}

interface Room {
  x: number; y: number;
  w: number; h: number;
  connected: boolean;
}

interface DungeonLevel {
  rooms: Room[];
  walls: Array<{ x: number; y: number; w: number; h: number }>;
  floor: Array<{ x: number; y: number; w: number; h: number }>;
  exits: Vec2[];
  spawnPoint: Vec2;
}

interface GameData {
  playing: boolean;
  paused: boolean;
  gameOver: boolean;
  score: number;
  level: number;
  time: number;
  screenShake: number;
  screenShakeX: number;
  screenShakeY: number;
  message: string;
  messageTimer: number;
  transitionTimer: number;
  transitioning: boolean;
}

interface Camera {
  x: number; y: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const TILE = 40;
const DUNGEON_W = 60;
const DUNGEON_H = 45;
const ENEMY_CONFIGS: Record<EnemyType, Partial<EnemyState>> = {
  slime: {
    width: 20, height: 20, health: 30, maxHealth: 30, damage: 8,
    speed: 60, fireRate: 0, attackCooldown: 1, points: 10,
    behavior: 'chase', color: '#44ff44',
  },
  skeleton: {
    width: 22, height: 28, health: 50, maxHealth: 50, damage: 12,
    speed: 80, fireRate: 2, attackCooldown: 0.8, points: 25,
    behavior: 'ranged', color: '#ddddaa',
  },
  demon: {
    width: 26, height: 26, health: 80, maxHealth: 80, damage: 18,
    speed: 100, fireRate: 1.2, attackCooldown: 0.6, points: 50,
    behavior: 'circle', color: '#ff4444',
  },
  boss: {
    width: 50, height: 50, health: 500, maxHealth: 500, damage: 25,
    speed: 70, fireRate: 0.5, attackCooldown: 0.4, points: 500,
    behavior: 'boss', color: '#ff00ff',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Dungeon Generation
// ─────────────────────────────────────────────────────────────────────────────

function generateDungeon(level: number): DungeonLevel {
  const rooms: Room[] = [];
  const numRooms = 5 + Math.min(level, 10);
  
  // Generate non-overlapping rooms
  for (let attempt = 0; attempt < 200 && rooms.length < numRooms; attempt++) {
    const w = 6 + Math.floor(Math.random() * 6);
    const h = 5 + Math.floor(Math.random() * 5);
    const x = 2 + Math.floor(Math.random() * (DUNGEON_W - w - 4));
    const y = 2 + Math.floor(Math.random() * (DUNGEON_H - h - 4));
    
    const overlap = rooms.some(r =>
      x < r.x + r.w + 2 && x + w + 2 > r.x &&
      y < r.y + r.h + 2 && y + h + 2 > r.y
    );
    
    if (!overlap) {
      rooms.push({ x, y, w, h, connected: false });
    }
  }

  // Build floor tiles from rooms
  const floorSet = new Set<string>();
  const floor: Array<{ x: number; y: number; w: number; h: number }> = [];

  rooms.forEach(room => {
    for (let rx = room.x; rx < room.x + room.w; rx++) {
      for (let ry = room.y; ry < room.y + room.h; ry++) {
        floorSet.add(`${rx},${ry}`);
      }
    }
    floor.push({ x: room.x * TILE, y: room.y * TILE, w: room.w * TILE, h: room.h * TILE });
  });

  // Connect rooms with corridors (MST-like)
  if (rooms.length > 1) {
    rooms[0].connected = true;
    const connected = [rooms[0]];
    const unconnected = rooms.slice(1);

    while (unconnected.length > 0) {
      let bestDist = Infinity;
      let bestCI = 0;
      let bestUI = 0;

      connected.forEach((cr, ci) => {
        unconnected.forEach((ur, ui) => {
          const cx1 = cr.x + cr.w / 2;
          const cy1 = cr.y + cr.h / 2;
          const cx2 = ur.x + ur.w / 2;
          const cy2 = ur.y + ur.h / 2;
          const dist = Math.abs(cx1 - cx2) + Math.abs(cy1 - cy2);
          if (dist < bestDist) {
            bestDist = dist;
            bestCI = ci;
            bestUI = ui;
          }
        });
      });

      const from = connected[bestCI];
      const to = unconnected[bestUI];

      // Carve corridor
      const fx = Math.floor(from.x + from.w / 2);
      const fy = Math.floor(from.y + from.h / 2);
      const tx = Math.floor(to.x + to.w / 2);
      const ty = Math.floor(to.y + to.h / 2);

      let cx = fx, cy = fy;
      while (cx !== tx) {
        floorSet.add(`${cx},${cy}`);
        floorSet.add(`${cx},${cy + 1}`);
        cx += cx < tx ? 1 : -1;
      }
      while (cy !== ty) {
        floorSet.add(`${cx},${cy}`);
        floorSet.add(`${cx + 1},${cy}`);
        cy += cy < ty ? 1 : -1;
      }

      to.connected = true;
      connected.push(to);
      unconnected.splice(bestUI, 1);
    }
  }

  // Build corridor floor rects
  floorSet.forEach(key => {
    const [sx, sy] = key.split(',').map(Number);
    const isInRoom = rooms.some(r =>
      sx >= r.x && sx < r.x + r.w && sy >= r.y && sy < r.y + r.h
    );
    if (!isInRoom) {
      floor.push({ x: sx * TILE, y: sy * TILE, w: TILE, h: TILE });
    }
  });

  // Build wall tiles
  const walls: Array<{ x: number; y: number; w: number; h: number }> = [];
  const wallSet = new Set<string>();
  
  floorSet.forEach(key => {
    const [fx, fy] = key.split(',').map(Number);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const wx = fx + dx;
        const wy = fy + dy;
        const wKey = `${wx},${wy}`;
        if (!floorSet.has(wKey) && !wallSet.has(wKey)) {
          wallSet.add(wKey);
          walls.push({ x: wx * TILE, y: wy * TILE, w: TILE, h: TILE });
        }
      }
    }
  });

  // Exits in last room
  const lastRoom = rooms[rooms.length - 1];
  const exits: Vec2[] = [{
    x: (lastRoom.x + lastRoom.w / 2) * TILE,
    y: (lastRoom.y + lastRoom.h / 2) * TILE
  }];

  // Spawn in first room
  const firstRoom = rooms[0];
  const spawnPoint: Vec2 = {
    x: (firstRoom.x + firstRoom.w / 2) * TILE,
    y: (firstRoom.y + firstRoom.h / 2) * TILE
  };

  return { rooms, walls, floor, exits, spawnPoint };
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────────────────────────────────────

function dist(a: Vec2, b: Vec2): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function normalize(v: Vec2): Vec2 {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  return len > 0 ? { x: v.x / len, y: v.y / len } : { x: 0, y: 0 };
}

function rectCollides(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function lootColor(type: LootType): string {
  switch (type) {
    case 'health': return '#00ff00';
    case 'shield': return '#00aaff';
    case 'speed': return '#ffff00';
    case 'damage': return '#ff4400';
    case 'multishot': return '#ff00ff';
    case 'xp': return '#aaffff';
  }
}

function lootLabel(type: LootType): string {
  switch (type) {
    case 'health': return '+HP';
    case 'shield': return '+SH';
    case 'speed': return '+SPD';
    case 'damage': return '+DMG';
    case 'multishot': return '+MULTI';
    case 'xp': return '+XP';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Game Hook
// ─────────────────────────────────────────────────────────────────────────────

function useDungeonGame(onExit: () => void) {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Core game state refs
  const gameData = useRef<GameData>({
    playing: true, paused: false, gameOver: false,
    score: 0, level: 1, time: 0,
    screenShake: 0, screenShakeX: 0, screenShakeY: 0,
    message: 'DUNGEON OF SHADOWS', messageTimer: 3,
    transitionTimer: 0, transitioning: false,
  });

  const player = useRef<PlayerState>({
    x: 0, y: 0, width: 20, height: 24, vx: 0, vy: 0,
    health: 100, maxHealth: 100,
    shield: 0, maxShield: 50,
    damage: 20, speed: 200, fireRate: 0.2, lastShot: 0,
    multiShot: 1,
    dashCooldown: 1.5, lastDash: -10, dashDuration: 0.15,
    isDashing: false, dashVx: 0, dashVy: 0,
    invincibleUntil: 0,
    kills: 0, combo: 0, comboTimer: 0,
    xp: 0, level: 1, xpToNext: 50,
  });

  const camera = useRef<Camera>({ x: 0, y: 0 });
  const dungeon = useRef<DungeonLevel>(generateDungeon(1));
  const enemies = useRef<EnemyState[]>([]);
  const bullets = useRef<Bullet[]>([]);
  const loot = useRef<LootDrop[]>([]);
  const particles = useRef<Particle[]>([]);
  const keys = useRef<Record<string, boolean>>({});
  const mouse = useRef<{ x: number; y: number; down: boolean }>({ x: 0, y: 0, down: false });
  const [, setTick] = useState(0);

  // Initialize level
  const initLevel = useCallback((lvl: number) => {
    const d = generateDungeon(lvl);
    dungeon.current = d;
    player.current.x = d.spawnPoint.x;
    player.current.y = d.spawnPoint.y;
    enemies.current = [];
    bullets.current = [];
    loot.current = [];

    // Spawn enemies in rooms (not first room)
    const isBossLevel = lvl % 5 === 0;
    d.rooms.forEach((room, i) => {
      if (i === 0) return; // player spawn room

      if (isBossLevel && i === d.rooms.length - 1) {
        // Boss in last room
        const boss = createEnemy('boss', lvl,
          (room.x + room.w / 2) * TILE,
          (room.y + room.h / 2) * TILE
        );
        enemies.current.push(boss);
      }

      const count = isBossLevel ? 1 + Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * (1 + lvl / 2));
      for (let j = 0; j < count; j++) {
        const ex = (room.x + 1 + Math.random() * (room.w - 2)) * TILE;
        const ey = (room.y + 1 + Math.random() * (room.h - 2)) * TILE;
        const types: EnemyType[] =
          lvl <= 2 ? ['slime'] :
          lvl <= 5 ? ['slime', 'skeleton'] :
          ['slime', 'skeleton', 'demon'];
        const type = types[Math.floor(Math.random() * types.length)];
        enemies.current.push(createEnemy(type, lvl, ex, ey));
      }
    });

    gameData.current.message = isBossLevel ? `BOSS LEVEL ${lvl}!` : `Level ${lvl}`;
    gameData.current.messageTimer = 2;
    gameData.current.transitioning = false;
    gameData.current.transitionTimer = 0;
  }, []);

  function createEnemy(type: EnemyType, lvl: number, x: number, y: number): EnemyState {
    const cfg = ENEMY_CONFIGS[type];
    const scale = 1 + (lvl - 1) * 0.15;
    return {
      x, y,
      width: cfg.width!, height: cfg.height!,
      vx: 0, vy: 0,
      type,
      health: Math.floor(cfg.health! * scale),
      maxHealth: Math.floor(cfg.maxHealth! * scale),
      damage: Math.floor(cfg.damage! * scale),
      speed: cfg.speed!,
      fireRate: cfg.fireRate!,
      lastShot: 0,
      lastAttack: 0,
      attackCooldown: cfg.attackCooldown!,
      points: Math.floor(cfg.points! * scale),
      behavior: cfg.behavior as 'chase' | 'circle' | 'ranged' | 'boss',
      phase: 0,
      color: cfg.color!,
      stunUntil: 0,
    };
  }

  // Add particles
  function spawnParticles(x: number, y: number, color: string, count: number, speed: number = 150) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = speed * (0.3 + Math.random() * 0.7);
      particles.current.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 0.3 + Math.random() * 0.5,
        maxLife: 0.3 + Math.random() * 0.5,
        color,
        size: 2 + Math.random() * 4,
      });
    }
  }

  function addScreenShake(amount: number) {
    gameData.current.screenShake = Math.max(gameData.current.screenShake, amount);
  }

  // Collides with dungeon walls?
  function collidesWithWalls(x: number, y: number, w: number, h: number): boolean {
    return dungeon.current.walls.some(wall =>
      rectCollides(x, y, w, h, wall.x, wall.y, wall.w, wall.h)
    );
  }

  // Is position on floor?
  function isOnFloor(x: number, y: number): boolean {
    return dungeon.current.floor.some(f =>
      x >= f.x && x < f.x + f.w && y >= f.y && y < f.y + f.h
    );
  }

  // Initialize
  useEffect(() => {
    initLevel(1);
  }, [initLevel]);

  // Resize
  useEffect(() => {
    const handleResize = () => setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
      if (e.key === 'Escape') onExit();
      if (e.key === ' ') e.preventDefault();
      // Restart on game over
      if (gameData.current.gameOver && e.key.toLowerCase() === 'r') {
        gameData.current = {
          playing: true, paused: false, gameOver: false,
          score: 0, level: 1, time: 0,
          screenShake: 0, screenShakeX: 0, screenShakeY: 0,
          message: 'DUNGEON OF SHADOWS', messageTimer: 3,
          transitionTimer: 0, transitioning: false,
        };
        player.current = {
          x: 0, y: 0, width: 20, height: 24, vx: 0, vy: 0,
          health: 100, maxHealth: 100,
          shield: 0, maxShield: 50,
          damage: 20, speed: 200, fireRate: 0.2, lastShot: 0,
          multiShot: 1,
          dashCooldown: 1.5, lastDash: -10, dashDuration: 0.15,
          isDashing: false, dashVx: 0, dashVy: 0,
          invincibleUntil: 0,
          kills: 0, combo: 0, comboTimer: 0,
          xp: 0, level: 1, xpToNext: 50,
        };
        particles.current = [];
        initLevel(1);
      }
    };
    const up = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [onExit, initLevel]);

  // Mouse
  useEffect(() => {
    const move = (e: MouseEvent) => { mouse.current.x = e.clientX; mouse.current.y = e.clientY; };
    const down = () => { mouse.current.down = true; };
    const up = () => { mouse.current.down = false; };
    window.addEventListener('mousemove', move);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
    };
  }, []);

  // ── GAME LOOP ──
  useGameLoop((dt: number) => {
    const gd = gameData.current;
    if (!gd.playing || gd.gameOver) return;

    const p = player.current;
    const W = screenSize.width;
    const H = screenSize.height;
    gd.time += dt;

    // ── Transition ──
    if (gd.transitioning) {
      gd.transitionTimer -= dt;
      if (gd.transitionTimer <= 0) {
        gd.level++;
        initLevel(gd.level);
      }
      setTick(t => t + 1);
      return;
    }

    // ── Message timer ──
    if (gd.messageTimer > 0) gd.messageTimer -= dt;

    // ── Screen shake ──
    if (gd.screenShake > 0) {
      gd.screenShake -= dt * 15;
      gd.screenShakeX = (Math.random() - 0.5) * gd.screenShake * 4;
      gd.screenShakeY = (Math.random() - 0.5) * gd.screenShake * 4;
    } else {
      gd.screenShakeX = 0;
      gd.screenShakeY = 0;
    }

    // ── Player combo ──
    if (p.comboTimer > 0) {
      p.comboTimer -= dt;
      if (p.comboTimer <= 0) p.combo = 0;
    }

    // ── Player movement ──
    let moveX = 0, moveY = 0;
    if (keys.current['a'] || keys.current['arrowleft']) moveX -= 1;
    if (keys.current['d'] || keys.current['arrowright']) moveX += 1;
    if (keys.current['w'] || keys.current['arrowup']) moveY -= 1;
    if (keys.current['s'] || keys.current['arrowdown']) moveY += 1;

    if (moveX !== 0 && moveY !== 0) {
      moveX *= 0.707;
      moveY *= 0.707;
    }

    // Dash
    const now = gd.time;
    if (keys.current[' '] && now - p.lastDash > p.dashCooldown && (moveX !== 0 || moveY !== 0)) {
      p.isDashing = true;
      p.lastDash = now;
      const dashSpeed = p.speed * 4;
      p.dashVx = moveX * dashSpeed;
      p.dashVy = moveY * dashSpeed;
      p.invincibleUntil = now + p.dashDuration;
      spawnParticles(p.x + p.width / 2, p.y + p.height / 2, '#00ffff', 8, 100);
    }

    if (p.isDashing && now - p.lastDash > p.dashDuration) {
      p.isDashing = false;
    }

    let newX: number, newY: number;
    if (p.isDashing) {
      newX = p.x + p.dashVx * dt;
      newY = p.y + p.dashVy * dt;
    } else {
      newX = p.x + moveX * p.speed * dt;
      newY = p.y + moveY * p.speed * dt;
    }

    // Wall collision
    if (!collidesWithWalls(newX, p.y, p.width, p.height) && isOnFloor(newX + p.width / 2, p.y + p.height / 2)) {
      p.x = newX;
    }
    if (!collidesWithWalls(p.x, newY, p.width, p.height) && isOnFloor(p.x + p.width / 2, newY + p.height / 2)) {
      p.y = newY;
    }

    // ── Camera ──
    camera.current.x = p.x + p.width / 2 - W / 2 + gd.screenShakeX;
    camera.current.y = p.y + p.height / 2 - H / 2 + gd.screenShakeY;

    // ── Player shooting (mouse) ──
    if (mouse.current.down && now - p.lastShot > p.fireRate) {
      const worldMouseX = mouse.current.x + camera.current.x;
      const worldMouseY = mouse.current.y + camera.current.y;
      const dx = worldMouseX - (p.x + p.width / 2);
      const dy = worldMouseY - (p.y + p.height / 2);
      const baseAngle = Math.atan2(dy, dx);

      const spread = p.multiShot > 1 ? 0.15 : 0;
      for (let i = 0; i < p.multiShot; i++) {
        const offset = (i - (p.multiShot - 1) / 2) * spread;
        const angle = baseAngle + offset;
        const bulletSpeed = 500;
        bullets.current.push({
          x: p.x + p.width / 2 - 3,
          y: p.y + p.height / 2 - 3,
          width: 6, height: 6,
          vx: Math.cos(angle) * bulletSpeed,
          vy: Math.sin(angle) * bulletSpeed,
          damage: p.damage * (1 + p.combo * 0.1),
          color: p.combo >= 10 ? '#ff4400' : p.combo >= 5 ? '#ffaa00' : '#ffff00',
          isPlayerBullet: true,
          lifetime: 0, maxLifetime: 1.5,
          piercing: false,
        });
      }
      p.lastShot = now;
    }

    // ── Update bullets ──
    bullets.current = bullets.current.filter(b => {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.lifetime += dt;

      // Wall collision
      if (collidesWithWalls(b.x, b.y, b.width, b.height)) {
        spawnParticles(b.x, b.y, b.color, 3, 50);
        return false;
      }

      return b.lifetime < b.maxLifetime;
    });

    // ── Update enemies ──
    enemies.current.forEach(enemy => {
      if (now < enemy.stunUntil) return;

      const px = p.x + p.width / 2;
      const py = p.y + p.height / 2;
      const ex = enemy.x + enemy.width / 2;
      const ey = enemy.y + enemy.height / 2;
      const d = dist({ x: px, y: py }, { x: ex, y: ey });
      const dir = normalize({ x: px - ex, y: py - ey });

      switch (enemy.behavior) {
        case 'chase': {
          if (d > 30) {
            const nx = enemy.x + dir.x * enemy.speed * dt;
            const ny = enemy.y + dir.y * enemy.speed * dt;
            if (!collidesWithWalls(nx, enemy.y, enemy.width, enemy.height)) enemy.x = nx;
            if (!collidesWithWalls(enemy.x, ny, enemy.width, enemy.height)) enemy.y = ny;
          }
          // Melee attack
          if (d < 35 && now - enemy.lastAttack > enemy.attackCooldown) {
            if (now > p.invincibleUntil) {
              dealDamageToPlayer(enemy.damage);
            }
            enemy.lastAttack = now;
          }
          break;
        }

        case 'ranged': {
          if (d > 200) {
            const nx = enemy.x + dir.x * enemy.speed * dt;
            const ny = enemy.y + dir.y * enemy.speed * dt;
            if (!collidesWithWalls(nx, enemy.y, enemy.width, enemy.height)) enemy.x = nx;
            if (!collidesWithWalls(enemy.x, ny, enemy.width, enemy.height)) enemy.y = ny;
          } else if (d < 100) {
            const nx = enemy.x - dir.x * enemy.speed * 0.5 * dt;
            const ny = enemy.y - dir.y * enemy.speed * 0.5 * dt;
            if (!collidesWithWalls(nx, enemy.y, enemy.width, enemy.height)) enemy.x = nx;
            if (!collidesWithWalls(enemy.x, ny, enemy.width, enemy.height)) enemy.y = ny;
          }
          // Shoot
          if (d < 400 && enemy.fireRate > 0 && now - enemy.lastShot > enemy.fireRate) {
            bullets.current.push({
              x: ex - 3, y: ey - 3, width: 6, height: 6,
              vx: dir.x * 250, vy: dir.y * 250,
              damage: enemy.damage, color: '#ff6666',
              isPlayerBullet: false, lifetime: 0, maxLifetime: 3,
              piercing: false,
            });
            enemy.lastShot = now;
          }
          break;
        }

        case 'circle': {
          const angle = Math.atan2(py - ey, px - ex) + Math.PI / 3;
          const circleSpeed = enemy.speed;
          const nx = enemy.x + Math.cos(angle) * circleSpeed * dt;
          const ny = enemy.y + Math.sin(angle) * circleSpeed * dt;
          if (!collidesWithWalls(nx, enemy.y, enemy.width, enemy.height)) enemy.x = nx;
          if (!collidesWithWalls(enemy.x, ny, enemy.width, enemy.height)) enemy.y = ny;

          if (d < 250 && enemy.fireRate > 0 && now - enemy.lastShot > enemy.fireRate) {
            bullets.current.push({
              x: ex - 3, y: ey - 3, width: 6, height: 6,
              vx: dir.x * 300, vy: dir.y * 300,
              damage: enemy.damage, color: '#ff2222',
              isPlayerBullet: false, lifetime: 0, maxLifetime: 2.5,
              piercing: false,
            });
            enemy.lastShot = now;
          }
          break;
        }

        case 'boss': {
          // Boss has phases based on health
          const healthPct = enemy.health / enemy.maxHealth;
          if (healthPct > 0.6) enemy.phase = 0;
          else if (healthPct > 0.3) enemy.phase = 1;
          else enemy.phase = 2;

          // Move toward player
          if (d > 80) {
            const spd = enemy.speed * (1 + enemy.phase * 0.3);
            const nx = enemy.x + dir.x * spd * dt;
            const ny = enemy.y + dir.y * spd * dt;
            if (!collidesWithWalls(nx, enemy.y, enemy.width, enemy.height)) enemy.x = nx;
            if (!collidesWithWalls(enemy.x, ny, enemy.width, enemy.height)) enemy.y = ny;
          }

          // Phase 0: single shots
          // Phase 1: triple shot
          // Phase 2: ring of bullets
          const rate = enemy.fireRate / (1 + enemy.phase * 0.5);
          if (now - enemy.lastShot > rate) {
            if (enemy.phase === 0) {
              bullets.current.push({
                x: ex - 4, y: ey - 4, width: 8, height: 8,
                vx: dir.x * 300, vy: dir.y * 300,
                damage: enemy.damage, color: '#ff00ff',
                isPlayerBullet: false, lifetime: 0, maxLifetime: 3,
                piercing: false,
              });
            } else if (enemy.phase === 1) {
              for (let s = -1; s <= 1; s++) {
                const a = Math.atan2(dir.y, dir.x) + s * 0.3;
                bullets.current.push({
                  x: ex - 4, y: ey - 4, width: 8, height: 8,
                  vx: Math.cos(a) * 280, vy: Math.sin(a) * 280,
                  damage: enemy.damage, color: '#ff44ff',
                  isPlayerBullet: false, lifetime: 0, maxLifetime: 3,
                  piercing: false,
                });
              }
            } else {
              const numBullets = 12;
              for (let i = 0; i < numBullets; i++) {
                const a = (i / numBullets) * Math.PI * 2 + gd.time;
                bullets.current.push({
                  x: ex - 3, y: ey - 3, width: 6, height: 6,
                  vx: Math.cos(a) * 200, vy: Math.sin(a) * 200,
                  damage: enemy.damage * 0.8, color: '#ff88ff',
                  isPlayerBullet: false, lifetime: 0, maxLifetime: 4,
                  piercing: false,
                });
              }
            }
            enemy.lastShot = now;
            if (enemy.phase >= 1) addScreenShake(0.3);
          }
          break;
        }
      }
    });

    // ── Bullet-Enemy collisions ──
    const bulletsToRemove = new Set<number>();
    const enemiesToRemove = new Set<number>();

    bullets.current.forEach((b, bi) => {
      if (!b.isPlayerBullet) return;
      enemies.current.forEach((enemy, ei) => {
        if (enemiesToRemove.has(ei)) return;
        if (rectCollides(b.x, b.y, b.width, b.height, enemy.x, enemy.y, enemy.width, enemy.height)) {
          enemy.health -= b.damage;
          enemy.stunUntil = now + 0.1;
          if (!b.piercing) bulletsToRemove.add(bi);
          spawnParticles(b.x + b.width / 2, b.y + b.height / 2, '#ffffff', 4, 80);

          // Knockback
          const kb = normalize({ x: enemy.x - p.x, y: enemy.y - p.y });
          const kbForce = 50;
          if (!collidesWithWalls(enemy.x + kb.x * kbForce * dt * 10, enemy.y, enemy.width, enemy.height))
            enemy.x += kb.x * kbForce * dt * 10;
          if (!collidesWithWalls(enemy.x, enemy.y + kb.y * kbForce * dt * 10, enemy.width, enemy.height))
            enemy.y += kb.y * kbForce * dt * 10;

          if (enemy.health <= 0) {
            enemiesToRemove.add(ei);
            gd.score += enemy.points * (1 + Math.floor(p.combo / 5));
            p.kills++;
            p.combo++;
            p.comboTimer = 3;

            // XP
            p.xp += enemy.points;
            if (p.xp >= p.xpToNext) {
              p.xp -= p.xpToNext;
              p.level++;
              p.xpToNext = Math.floor(p.xpToNext * 1.4);
              p.maxHealth += 10;
              p.health = Math.min(p.health + 20, p.maxHealth);
              p.damage += 3;
              gd.message = `LEVEL UP! Lv.${p.level}`;
              gd.messageTimer = 2;
              spawnParticles(p.x + p.width / 2, p.y + p.height / 2, '#ffff00', 20, 200);
              addScreenShake(0.5);
            }

            // Death effects
            const deathColor = enemy.type === 'boss' ? '#ff00ff' : enemy.color;
            spawnParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, deathColor,
              enemy.type === 'boss' ? 40 : 15, enemy.type === 'boss' ? 300 : 150);
            addScreenShake(enemy.type === 'boss' ? 2 : 0.5);

            // Loot drop
            if (Math.random() < (enemy.type === 'boss' ? 1 : 0.25)) {
              const types: LootType[] = ['health', 'shield', 'speed', 'damage', 'multishot', 'xp'];
              const weights = [30, 20, 15, 15, 5, 15];
              const totalWeight = weights.reduce((a, b) => a + b, 0);
              let r = Math.random() * totalWeight;
              let dropType: LootType = 'health';
              for (let i = 0; i < types.length; i++) {
                r -= weights[i];
                if (r <= 0) { dropType = types[i]; break; }
              }
              const numDrops = enemy.type === 'boss' ? 3 : 1;
              for (let d = 0; d < numDrops; d++) {
                loot.current.push({
                  x: enemy.x + enemy.width / 2 - 8 + (Math.random() - 0.5) * 30,
                  y: enemy.y + enemy.height / 2 - 8 + (Math.random() - 0.5) * 30,
                  width: 16, height: 16, vx: 0, vy: 0,
                  type: d === 0 ? dropType : types[Math.floor(Math.random() * types.length)],
                  lifetime: 15,
                  bobPhase: Math.random() * Math.PI * 2,
                });
              }
            }
          }
        }
      });
    });

    // ── Bullet-Player collisions ──
    bullets.current.forEach((b, bi) => {
      if (b.isPlayerBullet) return;
      if (now < p.invincibleUntil) return;
      if (rectCollides(b.x, b.y, b.width, b.height, p.x, p.y, p.width, p.height)) {
        dealDamageToPlayer(b.damage);
        bulletsToRemove.add(bi);
        spawnParticles(b.x, b.y, '#ff0000', 5, 60);
      }
    });

    // Remove dead
    bullets.current = bullets.current.filter((_, i) => !bulletsToRemove.has(i));
    enemies.current = enemies.current.filter((_, i) => !enemiesToRemove.has(i));

    // ── Loot pickup ──
    loot.current = loot.current.filter(l => {
      l.lifetime -= dt;
      l.bobPhase += dt * 4;
      if (l.lifetime <= 0) return false;

      if (rectCollides(p.x - 5, p.y - 5, p.width + 10, p.height + 10, l.x, l.y, l.width, l.height)) {
        switch (l.type) {
          case 'health': p.health = Math.min(p.maxHealth, p.health + 25); break;
          case 'shield': p.shield = Math.min(p.maxShield, p.shield + 20); break;
          case 'speed': p.speed += 15; break;
          case 'damage': p.damage += 5; break;
          case 'multishot': p.multiShot = Math.min(5, p.multiShot + 1); break;
          case 'xp': p.xp += 30; break;
        }
        spawnParticles(l.x + 8, l.y + 8, lootColor(l.type), 8, 80);
        gd.message = lootLabel(l.type);
        gd.messageTimer = 1;
        return false;
      }
      return true;
    });

    // ── Particles ──
    particles.current = particles.current.filter(pt => {
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vx *= 0.95;
      pt.vy *= 0.95;
      pt.life -= dt;
      return pt.life > 0;
    });

    // ── Level exit ──
    dungeon.current.exits.forEach(exit => {
      if (enemies.current.length === 0 && dist(
        { x: p.x + p.width / 2, y: p.y + p.height / 2 },
        exit
      ) < 40) {
        gd.transitioning = true;
        gd.transitionTimer = 1;
        gd.message = 'DESCENDING...';
        gd.messageTimer = 1;
        spawnParticles(exit.x, exit.y, '#00ff88', 20, 200);
      }
    });

    // ── Game over check ──
    if (p.health <= 0) {
      gd.playing = true;
      gd.gameOver = true;
      spawnParticles(p.x + p.width / 2, p.y + p.height / 2, '#ff0000', 30, 200);
      addScreenShake(2);
    }

    setTick(t => t + 1);
  });

  function dealDamageToPlayer(dmg: number) {
    const p = player.current;
    if (p.shield > 0) {
      const absorbed = Math.min(p.shield, dmg);
      p.shield -= absorbed;
      dmg -= absorbed;
      spawnParticles(p.x + p.width / 2, p.y + p.height / 2, '#00aaff', 4, 60);
    }
    p.health -= dmg;
    addScreenShake(0.8);
    p.invincibleUntil = gameData.current.time + 0.3;
    spawnParticles(p.x + p.width / 2, p.y + p.height / 2, '#ff0000', 6, 80);
  }

  return {
    screenSize,
    gameData: gameData.current,
    player: player.current,
    camera: camera.current,
    dungeon: dungeon.current,
    enemies: enemies.current,
    bullets: bullets.current,
    loot: loot.current,
    particles: particles.current,
    mouse: mouse.current,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Renderer
// ─────────────────────────────────────────────────────────────────────────────

export default function DungeonGame() {
  const onExit = useExitToMenu();
  const {
    screenSize, gameData, player, camera, dungeon,
    enemies, bullets, loot, particles, mouse,
  } = useDungeonGame(onExit);

  const W = screenSize.width;
  const H = screenSize.height;
  const cx = camera.x;
  const cy = camera.y;

  // Visible area culling helpers
  const visible = (x: number, y: number, w: number, h: number) =>
    x + w > cx && x < cx + W && y + h > cy && y < cy + H;

  return (
    <div style={{
      margin: 0, padding: 0, overflow: 'hidden', background: '#000',
      width: '100vw', height: '100vh', cursor: 'crosshair',
    }}>
      <PivotCanvas width={W} height={H} background="#0a0a12">
        {/* Clear */}
        <PivotRectangle position={{ x: 0, y: 0 }} width={W} height={H} fill="#0a0a12" />

        {/* ── Dungeon Floor ── */}
        {dungeon.floor.filter(f => visible(f.x, f.y, f.w, f.h)).map((f, i) => (
          <PivotRectangle
            key={`f${i}`}
            position={{ x: f.x - cx, y: f.y - cy }}
            width={f.w}
            height={f.h}
            fill="#1a1a2e"
            stroke="#222244"
            lineWidth={0.5}
          />
        ))}

        {/* ── Dungeon Walls ── */}
        {dungeon.walls.filter(w => visible(w.x, w.y, w.w, w.h)).map((w, i) => (
          <PivotRectangle
            key={`w${i}`}
            position={{ x: w.x - cx, y: w.y - cy }}
            width={w.w}
            height={w.h}
            fill="#2a2a4a"
            stroke="#3a3a6a"
            lineWidth={1}
          />
        ))}

        {/* ── Exit Portal ── */}
        {enemies.length === 0 && dungeon.exits.map((exit, i) => (
          <React.Fragment key={`exit${i}`}>
            <PivotCircle
              center={{ x: exit.x - cx, y: exit.y - cy }}
              radius={18 + Math.sin(gameData.time * 3) * 4}
              fill="rgba(0,255,136,0.3)"
              stroke="#00ff88"
              lineWidth={2}
            />
            <PivotCircle
              center={{ x: exit.x - cx, y: exit.y - cy }}
              radius={10}
              fill="#00ff88"
            />
            <PivotLabel
              text="EXIT"
              position={{ x: exit.x - cx, y: exit.y - cy - 30 }}
              font="bold 14px Arial"
              fill="#00ff88"
              textAlign="center"
            />
          </React.Fragment>
        ))}

        {/* ── Loot ── */}
        {loot.filter(l => visible(l.x, l.y, l.width, l.height)).map((l, i) => {
          const bob = Math.sin(l.bobPhase) * 3;
          return (
            <React.Fragment key={`l${i}`}>
              <PivotCircle
                center={{ x: l.x + 8 - cx, y: l.y + 8 - cy + bob }}
                radius={9}
                fill={lootColor(l.type)}
                stroke="#ffffff"
                lineWidth={l.lifetime < 3 ? (Math.sin(gameData.time * 10) > 0 ? 2 : 0) : 1}
              />
              <PivotLabel
                text={lootLabel(l.type)}
                position={{ x: l.x + 8 - cx, y: l.y - 8 - cy + bob }}
                font="bold 10px Arial"
                fill={lootColor(l.type)}
                textAlign="center"
              />
            </React.Fragment>
          );
        })}

        {/* ── Enemies ── */}
        {enemies.filter(e => visible(e.x, e.y, e.width, e.height)).map((enemy, i) => {
          const flash = gameData.time < enemy.stunUntil;
          return (
            <React.Fragment key={`e${i}`}>
              {/* Shadow */}
              <PivotCircle
                center={{ x: enemy.x + enemy.width / 2 - cx, y: enemy.y + enemy.height - cy + 3 }}
                radius={enemy.width / 2}
                fill="rgba(0,0,0,0.4)"
              />
              {/* Body */}
              <PivotRectangle
                position={{ x: enemy.x - cx, y: enemy.y - cy }}
                width={enemy.width}
                height={enemy.height}
                fill={flash ? '#ffffff' : enemy.color}
                stroke={enemy.type === 'boss' ? '#ffff00' : '#000'}
                lineWidth={enemy.type === 'boss' ? 3 : 1}
              />
              {/* Eyes */}
              <PivotCircle
                center={{ x: enemy.x + enemy.width * 0.3 - cx, y: enemy.y + enemy.height * 0.35 - cy }}
                radius={enemy.width * 0.1}
                fill={enemy.type === 'boss' ? '#ff0000' : '#ff4444'}
              />
              <PivotCircle
                center={{ x: enemy.x + enemy.width * 0.7 - cx, y: enemy.y + enemy.height * 0.35 - cy }}
                radius={enemy.width * 0.1}
                fill={enemy.type === 'boss' ? '#ff0000' : '#ff4444'}
              />
              {/* Health bar */}
              {enemy.health < enemy.maxHealth && (
                <>
                  <PivotRectangle
                    position={{ x: enemy.x - cx - 2, y: enemy.y - cy - 10 }}
                    width={enemy.width + 4}
                    height={5}
                    fill="#333"
                  />
                  <PivotRectangle
                    position={{ x: enemy.x - cx - 1, y: enemy.y - cy - 9 }}
                    width={(enemy.health / enemy.maxHealth) * (enemy.width + 2)}
                    height={3}
                    fill={enemy.type === 'boss' ? '#ff00ff' : '#ff0000'}
                  />
                </>
              )}
              {/* Boss label */}
              {enemy.type === 'boss' && (
                <PivotLabel
                  text={`BOSS P${enemy.phase + 1}`}
                  position={{ x: enemy.x + enemy.width / 2 - cx, y: enemy.y - cy - 18 }}
                  font="bold 12px Arial"
                  fill="#ff00ff"
                  textAlign="center"
                />
              )}
            </React.Fragment>
          );
        })}

        {/* ── Player ── */}
        {!gameData.gameOver && (
          <>
            {/* Shadow */}
            <PivotCircle
              center={{ x: player.x + player.width / 2 - cx, y: player.y + player.height - cy + 3 }}
              radius={player.width / 2 + 2}
              fill="rgba(0,0,0,0.5)"
            />
            {/* Dash trail */}
            {player.isDashing && (
              <PivotCircle
                center={{ x: player.x + player.width / 2 - cx, y: player.y + player.height / 2 - cy }}
                radius={20}
                fill="rgba(0,255,255,0.3)"
              />
            )}
            {/* Body */}
            <PivotRectangle
              position={{ x: player.x - cx, y: player.y - cy }}
              width={player.width}
              height={player.height}
              fill={gameData.time < player.invincibleUntil
                ? (Math.sin(gameData.time * 30) > 0 ? '#00ffff' : '#0088aa')
                : '#00ccff'}
              stroke="#ffffff"
              lineWidth={2}
            />
            {/* Eyes */}
            <PivotCircle
              center={{ x: player.x + player.width * 0.3 - cx, y: player.y + player.height * 0.3 - cy }}
              radius={2}
              fill="#ffffff"
            />
            <PivotCircle
              center={{ x: player.x + player.width * 0.7 - cx, y: player.y + player.height * 0.3 - cy }}
              radius={2}
              fill="#ffffff"
            />
            {/* Shield glow */}
            {player.shield > 0 && (
              <PivotCircle
                center={{ x: player.x + player.width / 2 - cx, y: player.y + player.height / 2 - cy }}
                radius={player.width / 2 + 6}
                stroke={`rgba(0,170,255,${0.3 + Math.sin(gameData.time * 4) * 0.2})`}
                lineWidth={2}
              />
            )}
            {/* Aim line */}
            <PivotLine
              start={{ x: player.x + player.width / 2 - cx, y: player.y + player.height / 2 - cy }}
              end={{ x: mouse.x, y: mouse.y }}
              stroke="rgba(255,255,0,0.15)"
              lineWidth={1}
            />
          </>
        )}

        {/* ── Bullets ── */}
        {bullets.filter(b => visible(b.x, b.y, b.width, b.height)).map((b, i) => (
          <React.Fragment key={`b${i}`}>
            <PivotCircle
              center={{ x: b.x + b.width / 2 - cx, y: b.y + b.height / 2 - cy }}
              radius={b.width / 2 + 1}
              fill={b.color}
            />
            {b.isPlayerBullet && (
              <PivotCircle
                center={{ x: b.x + b.width / 2 - cx, y: b.y + b.height / 2 - cy }}
                radius={b.width / 2 + 4}
                fill={`${b.color}33`}
              />
            )}
          </React.Fragment>
        ))}

        {/* ── Particles ── */}
        {particles.map((pt, i) => {
          const alpha = Math.max(0, pt.life / pt.maxLife);
          return (
            <PivotCircle
              key={`p${i}`}
              center={{ x: pt.x - cx, y: pt.y - cy }}
              radius={pt.size * alpha}
              fill={pt.color}
            />
          );
        })}

        {/* ═══════════════════════ HUD ═══════════════════════ */}
        
        {/* Health Bar */}
        <PivotRectangle position={{ x: 20, y: 20 }} width={204} height={18} fill="#333" stroke="#555" lineWidth={1} />
        <PivotRectangle
          position={{ x: 22, y: 22 }}
          width={Math.max(0, (player.health / player.maxHealth) * 200)}
          height={14}
          fill={player.health > 60 ? '#00ff44' : player.health > 30 ? '#ffaa00' : '#ff2200'}
        />
        <PivotLabel
          text={`HP ${Math.ceil(player.health)}/${player.maxHealth}`}
          position={{ x: 122, y: 29 }}
          font="bold 11px Arial"
          fill="#fff"
          textAlign="center"
        />

        {/* Shield Bar */}
        {player.maxShield > 0 && (
          <>
            <PivotRectangle position={{ x: 20, y: 42 }} width={204} height={12} fill="#222" stroke="#444" lineWidth={1} />
            <PivotRectangle
              position={{ x: 22, y: 44 }}
              width={Math.max(0, (player.shield / player.maxShield) * 200)}
              height={8}
              fill="#0088ff"
            />
            <PivotLabel
              text={`SH ${Math.ceil(player.shield)}`}
              position={{ x: 122, y: 49 }}
              font="bold 9px Arial"
              fill="#aaddff"
              textAlign="center"
            />
          </>
        )}

        {/* XP Bar */}
        <PivotRectangle position={{ x: 20, y: 58 }} width={204} height={8} fill="#111" stroke="#333" lineWidth={1} />
        <PivotRectangle
          position={{ x: 22, y: 60 }}
          width={Math.max(0, (player.xp / player.xpToNext) * 200)}
          height={4}
          fill="#aa88ff"
        />

        {/* Score & Stats */}
        <PivotLabel
          text={`Score: ${gameData.score}`}
          position={{ x: 20, y: 82 }}
          font="bold 16px Arial"
          fill="#ffff00"
          textAlign="left"
        />
        <PivotLabel
          text={`Lv.${player.level}  Floor ${gameData.level}  Kills: ${player.kills}`}
          position={{ x: 20, y: 102 }}
          font="13px Arial"
          fill="#aaa"
          textAlign="left"
        />
        <PivotLabel
          text={`DMG:${Math.floor(player.damage)} SPD:${Math.floor(player.speed)} MULTI:${player.multiShot}`}
          position={{ x: 20, y: 120 }}
          font="11px Arial"
          fill="#888"
          textAlign="left"
        />

        {/* Combo */}
        {player.combo >= 3 && (
          <PivotLabel
            text={`${player.combo}x COMBO!`}
            position={{ x: W / 2, y: 50 }}
            font={`bold ${18 + Math.min(player.combo, 20)}px Arial`}
            fill={player.combo >= 10 ? '#ff4400' : '#ffaa00'}
            textAlign="center"
          />
        )}

        {/* Dash cooldown */}
        {(() => {
          const dashReady = gameData.time - player.lastDash > player.dashCooldown;
          return (
            <PivotLabel
              text={dashReady ? '[SPACE] DASH READY' : `DASH ${Math.max(0, player.dashCooldown - (gameData.time - player.lastDash)).toFixed(1)}s`}
              position={{ x: W / 2, y: H - 25 }}
              font="bold 13px Arial"
              fill={dashReady ? '#00ffff' : '#666'}
              textAlign="center"
            />
          );
        })()}

        {/* Enemies remaining */}
        <PivotLabel
          text={`Enemies: ${enemies.length}`}
          position={{ x: W - 20, y: 25 }}
          font="bold 14px Arial"
          fill={enemies.length === 0 ? '#00ff88' : '#ff6666'}
          textAlign="right"
        />

        {/* Minimap */}
        {(() => {
          const mmScale = 3;
          const mmX = W - DUNGEON_W * mmScale - 15;
          const mmY = 45;
          return (
            <>
              <PivotRectangle
                position={{ x: mmX - 2, y: mmY - 2 }}
                width={DUNGEON_W * mmScale + 4}
                height={DUNGEON_H * mmScale + 4}
                fill="rgba(0,0,0,0.7)"
                stroke="#444"
                lineWidth={1}
              />
              {dungeon.rooms.map((room, i) => (
                <PivotRectangle
                  key={`mm${i}`}
                  position={{ x: mmX + room.x * mmScale, y: mmY + room.y * mmScale }}
                  width={room.w * mmScale}
                  height={room.h * mmScale}
                  fill="#1a1a2e"
                />
              ))}
              {/* Player dot */}
              <PivotCircle
                center={{
                  x: mmX + (player.x / TILE) * mmScale,
                  y: mmY + (player.y / TILE) * mmScale
                }}
                radius={2}
                fill="#00ccff"
              />
              {/* Enemy dots */}
              {enemies.map((e, i) => (
                <PivotCircle
                  key={`mme${i}`}
                  center={{
                    x: mmX + (e.x / TILE) * mmScale,
                    y: mmY + (e.y / TILE) * mmScale
                  }}
                  radius={e.type === 'boss' ? 3 : 1.5}
                  fill={e.color}
                />
              ))}
              {/* Exit dot */}
              {enemies.length === 0 && dungeon.exits.map((exit, i) => (
                <PivotCircle
                  key={`mex${i}`}
                  center={{
                    x: mmX + (exit.x / TILE) * mmScale,
                    y: mmY + (exit.y / TILE) * mmScale
                  }}
                  radius={2}
                  fill="#00ff88"
                />
              ))}
            </>
          );
        })()}

        {/* Message */}
        {gameData.messageTimer > 0 && (
          <PivotLabel
            text={gameData.message}
            position={{ x: W / 2, y: H / 2 - 50 }}
            font={`bold ${gameData.message.includes('BOSS') ? 36 : 28}px Arial`}
            fill={gameData.message.includes('BOSS') ? '#ff00ff' : 
                  gameData.message.includes('LEVEL UP') ? '#ffff00' : '#ffffff'}
            textAlign="center"
          />
        )}

        {/* Transition overlay */}
        {gameData.transitioning && (
          <PivotRectangle
            position={{ x: 0, y: 0 }}
            width={W}
            height={H}
            fill={`rgba(0,0,0,${1 - gameData.transitionTimer})`}
          />
        )}

        {/* Controls hint */}
        <PivotLabel
          text="WASD: Move | Mouse: Aim & Shoot | SPACE: Dash | ESC: Menu"
          position={{ x: W / 2, y: H - 8 }}
          font="11px Arial"
          fill="#444"
          textAlign="center"
        />

        {/* ═══════════ GAME OVER ═══════════ */}
        {gameData.gameOver && (
          <>
            <PivotRectangle position={{ x: 0, y: 0 }} width={W} height={H} fill="rgba(0,0,0,0.85)" />

            <PivotLabel
              text="YOU DIED"
              position={{ x: W / 2, y: H / 2 - 100 }}
              font="bold 56px Arial"
              fill="#ff2222"
              textAlign="center"
            />

            <PivotLabel
              text={`Final Score: ${gameData.score}`}
              position={{ x: W / 2, y: H / 2 - 40 }}
              font="bold 28px Arial"
              fill="#ffff00"
              textAlign="center"
            />

            <PivotLabel
              text={`Floor ${gameData.level} | Level ${player.level} | ${player.kills} Kills | Best Combo: ${player.combo}x`}
              position={{ x: W / 2, y: H / 2 }}
              font="18px Arial"
              fill="#ccc"
              textAlign="center"
            />

            <PivotLabel
              text={`Time: ${Math.floor(gameData.time / 60)}m ${Math.floor(gameData.time % 60)}s`}
              position={{ x: W / 2, y: H / 2 + 30 }}
              font="16px Arial"
              fill="#888"
              textAlign="center"
            />

            <PivotLabel
              text="Press R to Restart"
              position={{ x: W / 2, y: H / 2 + 80 }}
              font="bold 22px Arial"
              fill="#00ff88"
              textAlign="center"
            />

            <PivotLabel
              text="Press ESC for Menu"
              position={{ x: W / 2, y: H / 2 + 110 }}
              font="16px Arial"
              fill="#666"
              textAlign="center"
            />
          </>
        )}
      </PivotCanvas>
    </div>
  );
}
