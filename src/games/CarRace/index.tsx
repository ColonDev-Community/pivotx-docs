/**
 * NITRO HIGHWAY - Endless Police Chase Racing Game
 * 
 * Features:
 * - Endless highway with increasing speed
 * - Police chase with AI cop cars
 * - Traffic vehicles to dodge
 * - Nitro boost system with visual flames
 * - Coin & fuel collection
 * - Lane-based movement with smooth steering
 * - Car damage & repair pickups
 * - Score multiplier from near-misses
 * - Day/night cycle
 * - Particle effects (sparks, smoke, explosions, tire marks)
 * - Wanted level system (more cops over time)
 * - Roadside scenery (trees, buildings, signs)
 * - Speedometer & HUD
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

interface CarState {
  x: number; y: number;
  width: number; height: number;
  speed: number; maxSpeed: number;
  targetX: number;
  health: number; maxHealth: number;
  fuel: number; maxFuel: number;
  nitro: number; maxNitro: number;
  nitroActive: boolean;
  steering: number; // -1 to 1
  tilt: number; // visual tilt
  invincibleUntil: number;
}

type TrafficColor = string;

interface TrafficCar {
  x: number; y: number;
  width: number; height: number;
  speed: number;
  color: TrafficColor;
  lane: number;
  honked: boolean;
}

interface PoliceCar {
  x: number; y: number;
  width: number; height: number;
  speed: number;
  lane: number;
  sirenPhase: number;
  health: number;
  chasing: boolean;
  shootCooldown: number;
  lastShot: number;
}

interface Pickup {
  x: number; y: number;
  width: number; height: number;
  type: 'coin' | 'fuel' | 'nitro' | 'repair' | 'shield';
  bobPhase: number;
}

interface Bullet {
  x: number; y: number;
  vx: number; vy: number;
  fromPolice: boolean;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  color: string;
  size: number;
}

interface RoadDecor {
  x: number; y: number;
  type: 'tree' | 'building' | 'sign' | 'lamp';
  side: 'left' | 'right';
  color: string;
  width: number; height: number;
}

interface TireMark {
  x: number; y: number;
  alpha: number;
}

interface GameState {
  playing: boolean;
  gameOver: boolean;
  score: number;
  distance: number;
  coins: number;
  baseSpeed: number;
  speedMultiplier: number;
  nearMissMultiplier: number;
  nearMissTimer: number;
  wantedLevel: number;
  wantedTimer: number;
  time: number;
  dayNightCycle: number; // 0-1, 0=day, 0.5=night
  shakeAmount: number;
  shakeX: number; shakeY: number;
  message: string;
  messageTimer: number;
  highSpeed: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const ROAD_WIDTH = 400;
const LANE_COUNT = 4;
const LANE_WIDTH = ROAD_WIDTH / LANE_COUNT;
const SHOULDER_WIDTH = 80;

const TRAFFIC_COLORS = ['#cc3333', '#3366cc', '#33aa33', '#cccc33', '#cc6600', '#9933cc', '#33cccc', '#ffffff'];

function laneX(lane: number, roadLeft: number): number {
  return roadLeft + lane * LANE_WIDTH + LANE_WIDTH / 2;
}

// ─────────────────────────────────────────────────────────────────────────────
// Game Hook
// ─────────────────────────────────────────────────────────────────────────────

function useCarGame(onExit: () => void) {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const W = screenSize.width;
  const H = screenSize.height;
  const roadLeft = (W - ROAD_WIDTH) / 2;

  const gameState = useRef<GameState>({
    playing: true, gameOver: false,
    score: 0, distance: 0, coins: 0,
    baseSpeed: 300, speedMultiplier: 1,
    nearMissMultiplier: 1, nearMissTimer: 0,
    wantedLevel: 1, wantedTimer: 0,
    time: 0, dayNightCycle: 0,
    shakeAmount: 0, shakeX: 0, shakeY: 0,
    message: 'NITRO HIGHWAY', messageTimer: 2,
    highSpeed: 0,
  });

  const player = useRef<CarState>({
    x: laneX(1, roadLeft), y: H - 150,
    width: 36, height: 70,
    speed: 300, maxSpeed: 800,
    targetX: laneX(1, roadLeft),
    health: 100, maxHealth: 100,
    fuel: 100, maxFuel: 100,
    nitro: 50, maxNitro: 100,
    nitroActive: false,
    steering: 0, tilt: 0,
    invincibleUntil: 0,
  });

  const traffic = useRef<TrafficCar[]>([]);
  const police = useRef<PoliceCar[]>([]);
  const pickups = useRef<Pickup[]>([]);
  const bullets = useRef<Bullet[]>([]);
  const particles = useRef<Particle[]>([]);
  const decor = useRef<RoadDecor[]>([]);
  const tireMarks = useRef<TireMark[]>([]);
  const roadLines = useRef<number[]>([]);
  const keys = useRef<Record<string, boolean>>({});
  const [, setTick] = useState(0);

  // Init road lines
  useEffect(() => {
    const lines: number[] = [];
    for (let y = -100; y < H + 100; y += 40) {
      lines.push(y);
    }
    roadLines.current = lines;
  }, [H]);

  // Init scenery
  useEffect(() => {
    const d: RoadDecor[] = [];
    for (let i = 0; i < 30; i++) {
      const side = Math.random() > 0.5 ? 'left' : 'right';
      const types: Array<'tree' | 'building' | 'sign' | 'lamp'> = ['tree', 'tree', 'building', 'sign', 'lamp'];
      const type = types[Math.floor(Math.random() * types.length)];
      d.push(createDecor(side, type, Math.random() * (H + 500) - 250, roadLeft));
    }
    decor.current = d;
  }, [roadLeft, H]);

  function createDecor(side: 'left' | 'right', type: 'tree' | 'building' | 'sign' | 'lamp', y: number, rl: number): RoadDecor {
    const baseX = side === 'left'
      ? rl - SHOULDER_WIDTH - 20 - Math.random() * 100
      : rl + ROAD_WIDTH + SHOULDER_WIDTH + 20 + Math.random() * 100;

    switch (type) {
      case 'tree':
        return { x: baseX, y, type, side, color: '#228833', width: 25, height: 30 };
      case 'building':
        return { x: baseX + (side === 'left' ? -30 : 0), y, type, side, color: '#555577', width: 60, height: 80 };
      case 'sign':
        return { x: baseX, y, type, side, color: '#44aa44', width: 20, height: 30 };
      case 'lamp':
        return { x: baseX, y, type, side, color: '#888888', width: 6, height: 40 };
    }
  }

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
      if (gameState.current.gameOver && e.key.toLowerCase() === 'r') {
        restartGame();
      }
    };
    const up = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [onExit]);

  const restartGame = useCallback(() => {
    const rl = (screenSize.width - ROAD_WIDTH) / 2;
    gameState.current = {
      playing: true, gameOver: false,
      score: 0, distance: 0, coins: 0,
      baseSpeed: 300, speedMultiplier: 1,
      nearMissMultiplier: 1, nearMissTimer: 0,
      wantedLevel: 1, wantedTimer: 0,
      time: 0, dayNightCycle: 0,
      shakeAmount: 0, shakeX: 0, shakeY: 0,
      message: 'GO!', messageTimer: 1.5,
      highSpeed: 0,
    };
    player.current = {
      x: laneX(1, rl), y: screenSize.height - 150,
      width: 36, height: 70,
      speed: 300, maxSpeed: 800,
      targetX: laneX(1, rl),
      health: 100, maxHealth: 100,
      fuel: 100, maxFuel: 100,
      nitro: 50, maxNitro: 100,
      nitroActive: false,
      steering: 0, tilt: 0,
      invincibleUntil: 0,
    };
    traffic.current = [];
    police.current = [];
    pickups.current = [];
    bullets.current = [];
    particles.current = [];
    tireMarks.current = [];
  }, [screenSize]);

  // Spawn helpers
  function spawnParticles(x: number, y: number, color: string, count: number, speed: number = 100) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = speed * (0.3 + Math.random() * 0.7);
      particles.current.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - speed * 0.3,
        life: 0.3 + Math.random() * 0.6,
        maxLife: 0.3 + Math.random() * 0.6,
        color, size: 2 + Math.random() * 4,
      });
    }
  }

  function addShake(amount: number) {
    gameState.current.shakeAmount = Math.max(gameState.current.shakeAmount, amount);
  }

  // ── GAME LOOP ──
  useGameLoop((dt: number) => {
    const gs = gameState.current;
    const p = player.current;
    if (!gs.playing || gs.gameOver) { setTick(t => t + 1); return; }

    gs.time += dt;

    // Day/night cycle (60 seconds per full cycle)
    gs.dayNightCycle = (gs.dayNightCycle + dt / 120) % 1;

    // Speed increases over time
    gs.baseSpeed = 300 + gs.distance * 0.01;
    const effectiveSpeed = Math.min(p.maxSpeed, gs.baseSpeed * (p.nitroActive ? 2 : 1));
    p.speed = effectiveSpeed;
    gs.highSpeed = Math.max(gs.highSpeed, effectiveSpeed);

    // Fuel consumption
    p.fuel -= dt * (p.nitroActive ? 8 : 2);
    if (p.fuel <= 0) {
      p.fuel = 0;
      gs.playing = true;
      gs.gameOver = true;
      gs.message = 'OUT OF FUEL!';
      gs.messageTimer = 5;
      spawnParticles(p.x, p.y, '#666', 20, 60);
    }

    // Nitro
    if (keys.current[' '] && p.nitro > 0 && p.fuel > 0) {
      p.nitroActive = true;
      p.nitro -= dt * 30;
      if (p.nitro <= 0) { p.nitro = 0; p.nitroActive = false; }
      // Flame particles
      spawnParticles(p.x, p.y + p.height / 2 + 5, '#ff6600', 2, 60);
      spawnParticles(p.x, p.y + p.height / 2 + 5, '#ffff00', 1, 40);
    } else {
      p.nitroActive = false;
    }

    // Screen shake
    if (gs.shakeAmount > 0) {
      gs.shakeAmount -= dt * 12;
      gs.shakeX = (Math.random() - 0.5) * gs.shakeAmount * 6;
      gs.shakeY = (Math.random() - 0.5) * gs.shakeAmount * 6;
    } else { gs.shakeX = 0; gs.shakeY = 0; }

    // Near miss multiplier decay
    if (gs.nearMissTimer > 0) {
      gs.nearMissTimer -= dt;
      if (gs.nearMissTimer <= 0) gs.nearMissMultiplier = 1;
    }

    // Message timer
    if (gs.messageTimer > 0) gs.messageTimer -= dt;

    // Distance & score
    gs.distance += effectiveSpeed * dt;
    gs.score += Math.floor(effectiveSpeed * dt * gs.nearMissMultiplier * 0.1);

    // Wanted level escalation
    gs.wantedTimer += dt;
    if (gs.wantedTimer > 20 + gs.wantedLevel * 10) {
      gs.wantedLevel = Math.min(5, gs.wantedLevel + 1);
      gs.wantedTimer = 0;
      gs.message = `WANTED LEVEL ${gs.wantedLevel}!`;
      gs.messageTimer = 2;
      addShake(1);
    }

    // ── Player steering ──
    const rl = roadLeft;
    if (keys.current['a'] || keys.current['arrowleft']) {
      p.steering = Math.max(-1, p.steering - dt * 5);
    } else if (keys.current['d'] || keys.current['arrowright']) {
      p.steering = Math.min(1, p.steering + dt * 5);
    } else {
      p.steering *= Math.pow(0.05, dt); // return to center
    }

    const steerSpeed = 350 + effectiveSpeed * 0.3;
    p.x += p.steering * steerSpeed * dt;

    // Clamp to road + shoulder
    const minX = rl - SHOULDER_WIDTH / 2;
    const maxX = rl + ROAD_WIDTH + SHOULDER_WIDTH / 2 - p.width;
    p.x = Math.max(minX, Math.min(maxX, p.x));

    // On shoulder = sparks + slow
    if (p.x < rl || p.x + p.width > rl + ROAD_WIDTH) {
      if (Math.random() < 0.3) {
        spawnParticles(
          p.x < rl ? p.x + p.width : p.x,
          p.y + p.height - 5, '#ffaa00', 1, 30
        );
      }
    }

    // Tilt
    p.tilt += (p.steering * 0.2 - p.tilt) * dt * 8;

    // ── Road scroll ──
    const scrollSpeed = effectiveSpeed;
    roadLines.current = roadLines.current.map(ly => {
      ly += scrollSpeed * dt;
      if (ly > H + 50) ly -= H + 150;
      return ly;
    });

    // ── Decor scroll ──
    decor.current.forEach(d => {
      d.y += scrollSpeed * dt;
      if (d.y > H + 100) {
        d.y = -100 - Math.random() * 200;
        const types: Array<'tree' | 'building' | 'sign' | 'lamp'> = ['tree', 'tree', 'building', 'sign', 'lamp'];
        const newType = types[Math.floor(Math.random() * types.length)];
        const nd = createDecor(d.side, newType, d.y, rl);
        d.type = nd.type; d.x = nd.x; d.color = nd.color;
        d.width = nd.width; d.height = nd.height;
      }
    });

    // ── Spawn traffic ──
    if (Math.random() < dt * (1.5 + gs.distance * 0.0002)) {
      const lane = Math.floor(Math.random() * LANE_COUNT);
      const tooClose = traffic.current.some(t =>
        t.lane === lane && Math.abs(t.y - (-80)) < 100
      );
      if (!tooClose) {
        const color = TRAFFIC_COLORS[Math.floor(Math.random() * TRAFFIC_COLORS.length)];
        traffic.current.push({
          x: laneX(lane, rl) - 16, y: -80,
          width: 32, height: 60,
          speed: effectiveSpeed * (0.3 + Math.random() * 0.4),
          color, lane, honked: false,
        });
      }
    }

    // Occasionally spawn oncoming traffic (from bottom, going up) for excitement
    if (Math.random() < dt * 0.2 && gs.distance > 2000) {
      const lane = Math.floor(Math.random() * LANE_COUNT);
      traffic.current.push({
        x: laneX(lane, rl) - 16, y: H + 80,
        width: 32, height: 60,
        speed: -(effectiveSpeed * 0.5),
        color: '#ff2222', lane, honked: false,
      });
    }

    // ── Spawn police ──
    if (Math.random() < dt * (0.15 * gs.wantedLevel) && police.current.length < gs.wantedLevel + 1) {
      const lane = Math.floor(Math.random() * LANE_COUNT);
      const fromBehind = Math.random() > 0.3;
      police.current.push({
        x: laneX(lane, rl) - 18, y: fromBehind ? H + 100 : -120,
        width: 36, height: 68,
        speed: fromBehind ? effectiveSpeed * 1.3 : effectiveSpeed * 0.7,
        lane, sirenPhase: 0, health: 30 + gs.wantedLevel * 10,
        chasing: true, shootCooldown: 2 - gs.wantedLevel * 0.15,
        lastShot: 0,
      });
    }

    // ── Spawn pickups ──
    if (Math.random() < dt * 0.5) {
      const lane = Math.floor(Math.random() * LANE_COUNT);
      const types: Array<'coin' | 'fuel' | 'nitro' | 'repair' | 'shield'> = ['coin', 'coin', 'coin', 'fuel', 'fuel', 'nitro', 'repair', 'shield'];
      const type = types[Math.floor(Math.random() * types.length)];
      pickups.current.push({
        x: laneX(lane, rl) - 10, y: -30,
        width: 20, height: 20,
        type, bobPhase: Math.random() * Math.PI * 2,
      });
    }

    // ── Update traffic ──
    traffic.current = traffic.current.filter(t => {
      const relSpeed = effectiveSpeed - t.speed;
      t.y += relSpeed * dt;

      // Near miss detection
      if (!t.honked) {
        const dx = Math.abs((t.x + t.width / 2) - (p.x + p.width / 2));
        const dy = Math.abs((t.y + t.height / 2) - (p.y + p.height / 2));
        if (dx < t.width + 15 && dy < t.height + 10 && dx > t.width * 0.4) {
          t.honked = true;
          gs.nearMissMultiplier = Math.min(8, gs.nearMissMultiplier + 1);
          gs.nearMissTimer = 3;
          gs.score += Math.floor(50 * gs.nearMissMultiplier);
          gs.message = `NEAR MISS x${gs.nearMissMultiplier.toFixed(0)}!`;
          gs.messageTimer = 1;
          spawnParticles(p.x + p.width / 2, p.y, '#ffff00', 5, 50);
        }
      }

      // Collision with player
      if (gs.time > p.invincibleUntil && carCollides(p, t)) {
        hitPlayer(20 + effectiveSpeed * 0.03);
        // Push traffic away
        t.y += 50;
        spawnParticles(
          (p.x + t.x) / 2 + 20, (p.y + t.y) / 2 + 30,
          '#ff8800', 15, 120
        );
        addShake(1.5);
      }

      return t.y > -200 && t.y < H + 200;
    });

    // ── Update police ──
    police.current = police.current.filter(cop => {
      cop.sirenPhase += dt * 6;

      // Chase AI
      const targetX = p.x;
      if (cop.chasing) {
        if (cop.x < targetX - 20) cop.x += 150 * dt;
        else if (cop.x > targetX + 20) cop.x -= 150 * dt;
      }

      // Movement
      const relSpeed = effectiveSpeed - cop.speed;
      cop.y += relSpeed * dt;

      // Try to match player Y position  
      if (cop.y < p.y - 150) cop.speed = effectiveSpeed * 0.6;
      else if (cop.y > p.y + 50) cop.speed = effectiveSpeed * 1.4;
      else cop.speed = effectiveSpeed * 1.05;

      // Shoot at player (wanted level 3+)
      if (gs.wantedLevel >= 3 && gs.time - cop.lastShot > cop.shootCooldown) {
        const dy = p.y - cop.y;
        const dx = p.x - cop.x;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 500 && len > 0) {
          bullets.current.push({
            x: cop.x + cop.width / 2, y: cop.y + cop.height / 2,
            vx: (dx / len) * 400, vy: (dy / len) * 400 - effectiveSpeed * 0.3,
            fromPolice: true,
          });
          cop.lastShot = gs.time;
        }
      }

      // Collision with player
      if (gs.time > p.invincibleUntil && carCollides(p, cop)) {
        hitPlayer(15);
        cop.health -= 20;
        spawnParticles(
          (p.x + cop.x) / 2 + 20, (p.y + cop.y) / 2 + 30,
          '#4444ff', 12, 100
        );
        addShake(1);
      }

      if (cop.health <= 0) {
        gs.score += 200 * gs.wantedLevel;
        spawnParticles(cop.x + cop.width / 2, cop.y + cop.height / 2, '#ff4400', 25, 180);
        spawnParticles(cop.x + cop.width / 2, cop.y + cop.height / 2, '#ffff00', 10, 120);
        addShake(2);
        gs.message = `COP DESTROYED! +${200 * gs.wantedLevel}`;
        gs.messageTimer = 1.5;
        return false;
      }

      return cop.y > -200 && cop.y < H + 200;
    });

    // ── Update pickups ──
    pickups.current = pickups.current.filter(pk => {
      pk.y += effectiveSpeed * dt;
      pk.bobPhase += dt * 5;

      if (carCollides(p, pk)) {
        switch (pk.type) {
          case 'coin':
            gs.coins++;
            gs.score += 100;
            spawnParticles(pk.x + 10, pk.y + 10, '#ffdd00', 6, 60);
            break;
          case 'fuel':
            p.fuel = Math.min(p.maxFuel, p.fuel + 25);
            spawnParticles(pk.x + 10, pk.y + 10, '#00cc44', 6, 60);
            gs.message = '+FUEL';
            gs.messageTimer = 0.8;
            break;
          case 'nitro':
            p.nitro = Math.min(p.maxNitro, p.nitro + 30);
            spawnParticles(pk.x + 10, pk.y + 10, '#ff6600', 8, 80);
            gs.message = '+NITRO';
            gs.messageTimer = 0.8;
            break;
          case 'repair':
            p.health = Math.min(p.maxHealth, p.health + 30);
            spawnParticles(pk.x + 10, pk.y + 10, '#00ff00', 8, 80);
            gs.message = '+REPAIR';
            gs.messageTimer = 0.8;
            break;
          case 'shield':
            p.invincibleUntil = gs.time + 5;
            spawnParticles(pk.x + 10, pk.y + 10, '#00aaff', 10, 100);
            gs.message = 'SHIELD 5s!';
            gs.messageTimer = 1;
            break;
        }
        return false;
      }

      return pk.y < H + 50;
    });

    // ── Update bullets ──
    bullets.current = bullets.current.filter(b => {
      b.x += b.vx * dt;
      b.y += b.vy * dt + effectiveSpeed * dt;

      // Hit player
      if (b.fromPolice && gs.time > p.invincibleUntil) {
        if (b.x > p.x && b.x < p.x + p.width && b.y > p.y && b.y < p.y + p.height) {
          hitPlayer(10);
          spawnParticles(b.x, b.y, '#ff0000', 4, 40);
          return false;
        }
      }

      return b.y > -50 && b.y < H + 50 && b.x > 0 && b.x < W;
    });

    // ── Tire marks when steering hard ──
    if (Math.abs(p.steering) > 0.6) {
      tireMarks.current.push(
        { x: p.x + 6, y: p.y + p.height - 5, alpha: 0.3 },
        { x: p.x + p.width - 6, y: p.y + p.height - 5, alpha: 0.3 },
      );
    }
    // Scroll & fade tire marks
    tireMarks.current = tireMarks.current.filter(tm => {
      tm.y += effectiveSpeed * dt;
      tm.alpha -= dt * 0.4;
      return tm.alpha > 0 && tm.y < H + 10;
    });
    // Limit marks
    if (tireMarks.current.length > 200) {
      tireMarks.current = tireMarks.current.slice(-200);
    }

    // ── Engine smoke particles at high speed ──
    if (effectiveSpeed > 500 && Math.random() < dt * effectiveSpeed * 0.01) {
      spawnParticles(p.x + p.width / 2, p.y + p.height, '#aaaaaa', 1, 20);
    }

    // ── Particles ──
    particles.current = particles.current.filter(pt => {
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt + effectiveSpeed * dt * 0.5;
      pt.vx *= 0.96;
      pt.vy *= 0.96;
      pt.life -= dt;
      return pt.life > 0;
    });

    // ── Game over check ──
    if (p.health <= 0) {
      gs.gameOver = true;
      gs.message = 'WRECKED!';
      gs.messageTimer = 99;
      spawnParticles(p.x + p.width / 2, p.y + p.height / 2, '#ff4400', 30, 200);
      spawnParticles(p.x + p.width / 2, p.y + p.height / 2, '#ffff00', 15, 150);
      addShake(3);
    }

    setTick(t => t + 1);
  });

  function carCollides(a: { x: number; y: number; width: number; height: number },
                       b: { x: number; y: number; width: number; height: number }): boolean {
    return a.x < b.x + b.width && a.x + a.width > b.x &&
           a.y < b.y + b.height && a.y + a.height > b.y;
  }

  function hitPlayer(damage: number) {
    const p = player.current;
    p.health -= damage;
    p.invincibleUntil = gameState.current.time + 0.5;
    addShake(damage * 0.05);
    spawnParticles(p.x + p.width / 2, p.y + p.height / 2, '#ff0000', 5, 60);
  }

  return {
    screenSize, gameState: gameState.current, player: player.current,
    traffic: traffic.current, police: police.current, pickups: pickups.current,
    bullets: bullets.current, particles: particles.current, decor: decor.current,
    tireMarks: tireMarks.current, roadLines: roadLines.current,
    roadLeft,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Renderer
// ─────────────────────────────────────────────────────────────────────────────

export default function CarGame() {
  const onExit = useExitToMenu();
  const {
    screenSize, gameState: gs, player, traffic, police, pickups,
    bullets, particles, decor, tireMarks, roadLines, roadLeft,
  } = useCarGame(onExit);

  const W = screenSize.width;
  const H = screenSize.height;
  const rl = roadLeft;
  const sx = gs.shakeX;
  const sy = gs.shakeY;

  // Day/night sky color
  const nightAmount = Math.sin(gs.dayNightCycle * Math.PI * 2) * 0.5 + 0.5;
  const skyR = Math.floor(10 + (1 - nightAmount) * 30);
  const skyG = Math.floor(10 + (1 - nightAmount) * 30);
  const skyB = Math.floor(20 + (1 - nightAmount) * 40);
  const skyColor = `rgb(${skyR},${skyG},${skyB})`;

  const pickupColor = (type: string): string => {
    switch (type) {
      case 'coin': return '#ffdd00';
      case 'fuel': return '#00cc44';
      case 'nitro': return '#ff6600';
      case 'repair': return '#00ff00';
      case 'shield': return '#00aaff';
      default: return '#fff';
    }
  };

  return (
    <div style={{
      margin: 0, padding: 0, overflow: 'hidden', background: '#000',
      width: '100vw', height: '100vh',
    }}>
      <PivotCanvas width={W} height={H} background={skyColor}>
        {/* Clear */}
        <PivotRectangle position={{ x: 0, y: 0 }} width={W} height={H} fill={skyColor} />

        {/* ── Grass / Dirt Shoulders ── */}
        <PivotRectangle position={{ x: 0 + sx, y: 0 + sy }} width={rl - SHOULDER_WIDTH + sx} height={H} fill="#1a3a1a" />
        <PivotRectangle position={{ x: rl + ROAD_WIDTH + SHOULDER_WIDTH + sx, y: 0 + sy }} width={W - rl - ROAD_WIDTH - SHOULDER_WIDTH} height={H} fill="#1a3a1a" />

        {/* Shoulders */}
        <PivotRectangle position={{ x: rl - SHOULDER_WIDTH + sx, y: 0 + sy }} width={SHOULDER_WIDTH} height={H} fill="#555544" />
        <PivotRectangle position={{ x: rl + ROAD_WIDTH + sx, y: 0 + sy }} width={SHOULDER_WIDTH} height={H} fill="#555544" />

        {/* ── Road Surface ── */}
        <PivotRectangle
          position={{ x: rl + sx, y: 0 + sy }}
          width={ROAD_WIDTH}
          height={H}
          fill="#333340"
        />

        {/* ── Road Lines ── */}
        {/* Side lines */}
        <PivotRectangle position={{ x: rl + sx, y: 0 + sy }} width={4} height={H} fill="#ffff00" />
        <PivotRectangle position={{ x: rl + ROAD_WIDTH - 4 + sx, y: 0 + sy }} width={4} height={H} fill="#ffff00" />

        {/* Dashed lane lines */}
        {roadLines.map((ly, i) => (
          <React.Fragment key={`rl${i}`}>
            {[1, 2, 3].map(lane => (
              <PivotRectangle
                key={`rl${i}l${lane}`}
                position={{ x: rl + lane * LANE_WIDTH - 2 + sx, y: ly + sy }}
                width={4}
                height={20}
                fill="rgba(255,255,255,0.4)"
              />
            ))}
          </React.Fragment>
        ))}

        {/* ── Tire marks ── */}
        {tireMarks.map((tm, i) => (
          <PivotRectangle
            key={`tm${i}`}
            position={{ x: tm.x + sx, y: tm.y + sy }}
            width={3}
            height={8}
            fill={`rgba(30,30,30,${tm.alpha})`}
          />
        ))}

        {/* ── Scenery / Decor ── */}
        {decor.map((d, i) => {
          if (d.type === 'tree') {
            return (
              <React.Fragment key={`d${i}`}>
                <PivotRectangle
                  position={{ x: d.x + d.width / 2 - 3 + sx, y: d.y + sy }}
                  width={6}
                  height={d.height * 0.6}
                  fill="#553311"
                />
                <PivotCircle
                  center={{ x: d.x + d.width / 2 + sx, y: d.y - d.height * 0.2 + sy }}
                  radius={d.width / 2}
                  fill={d.color}
                />
              </React.Fragment>
            );
          }
          if (d.type === 'building') {
            return (
              <PivotRectangle
                key={`d${i}`}
                position={{ x: d.x + sx, y: d.y + sy }}
                width={d.width}
                height={d.height}
                fill={d.color}
                stroke="#444466"
                lineWidth={1}
              />
            );
          }
          if (d.type === 'lamp') {
            return (
              <React.Fragment key={`d${i}`}>
                <PivotRectangle
                  position={{ x: d.x + sx, y: d.y + sy }}
                  width={d.width}
                  height={d.height}
                  fill={d.color}
                />
                {nightAmount > 0.3 && (
                  <PivotCircle
                    center={{ x: d.x + d.width / 2 + sx, y: d.y + sy }}
                    radius={15}
                    fill={`rgba(255,255,200,${nightAmount * 0.15})`}
                  />
                )}
              </React.Fragment>
            );
          }
          // sign
          return (
            <PivotRectangle
              key={`d${i}`}
              position={{ x: d.x + sx, y: d.y + sy }}
              width={d.width}
              height={d.height}
              fill={d.color}
              stroke="#fff"
              lineWidth={1}
            />
          );
        })}

        {/* ── Pickups ── */}
        {pickups.map((pk, i) => {
          const bob = Math.sin(pk.bobPhase) * 3;
          return (
            <React.Fragment key={`pk${i}`}>
              <PivotCircle
                center={{ x: pk.x + 10 + sx, y: pk.y + 10 + sy + bob }}
                radius={11}
                fill={pickupColor(pk.type)}
                stroke="#fff"
                lineWidth={1}
              />
              <PivotLabel
                text={pk.type === 'coin' ? '$' :
                      pk.type === 'fuel' ? 'F' :
                      pk.type === 'nitro' ? 'N' :
                      pk.type === 'repair' ? '+' : 'S'}
                position={{ x: pk.x + 10 + sx, y: pk.y + 10 + sy + bob }}
                font="bold 12px Arial"
                fill="#000"
                textAlign="center"
              />
            </React.Fragment>
          );
        })}

        {/* ── Traffic Cars ── */}
        {traffic.map((t, i) => (
          <React.Fragment key={`t${i}`}>
            {/* Shadow */}
            <PivotRectangle
              position={{ x: t.x + 4 + sx, y: t.y + 4 + sy }}
              width={t.width}
              height={t.height}
              fill="rgba(0,0,0,0.3)"
            />
            {/* Body */}
            <PivotRectangle
              position={{ x: t.x + sx, y: t.y + sy }}
              width={t.width}
              height={t.height}
              fill={t.color}
              stroke="#000"
              lineWidth={1}
            />
            {/* Roof */}
            <PivotRectangle
              position={{ x: t.x + 6 + sx, y: t.y + 15 + sy }}
              width={t.width - 12}
              height={t.height - 35}
              fill={`${t.color}bb`}
            />
            {/* Windshield */}
            <PivotRectangle
              position={{ x: t.x + 4 + sx, y: t.y + 8 + sy }}
              width={t.width - 8}
              height={10}
              fill="rgba(100,200,255,0.5)"
            />
            {/* Tail lights */}
            <PivotRectangle position={{ x: t.x + 2 + sx, y: t.y + t.height - 6 + sy }} width={6} height={4} fill="#ff0000" />
            <PivotRectangle position={{ x: t.x + t.width - 8 + sx, y: t.y + t.height - 6 + sy }} width={6} height={4} fill="#ff0000" />
          </React.Fragment>
        ))}

        {/* ── Police Cars ── */}
        {police.map((cop, i) => {
          const sirenColor = Math.sin(cop.sirenPhase) > 0 ? '#ff0000' : '#0044ff';
          return (
            <React.Fragment key={`cop${i}`}>
              {/* Shadow */}
              <PivotRectangle
                position={{ x: cop.x + 4 + sx, y: cop.y + 4 + sy }}
                width={cop.width}
                height={cop.height}
                fill="rgba(0,0,0,0.3)"
              />
              {/* Body - black and white */}
              <PivotRectangle
                position={{ x: cop.x + sx, y: cop.y + sy }}
                width={cop.width}
                height={cop.height}
                fill="#111111"
                stroke="#ffffff"
                lineWidth={2}
              />
              {/* White stripe */}
              <PivotRectangle
                position={{ x: cop.x + sx, y: cop.y + 20 + sy }}
                width={cop.width}
                height={15}
                fill="#ffffff"
              />
              {/* Siren */}
              <PivotRectangle
                position={{ x: cop.x + 4 + sx, y: cop.y + 2 + sy }}
                width={cop.width - 8}
                height={6}
                fill={sirenColor}
              />
              {/* Siren glow */}
              <PivotCircle
                center={{ x: cop.x + cop.width / 2 + sx, y: cop.y + 5 + sy }}
                radius={20}
                fill={`${sirenColor}22`}
              />
              {/* POLICE text */}
              <PivotLabel
                text="POLICE"
                position={{ x: cop.x + cop.width / 2 + sx, y: cop.y + cop.height / 2 + sy }}
                font="bold 8px Arial"
                fill="#ffffff"
                textAlign="center"
              />
            </React.Fragment>
          );
        })}

        {/* ── Player Car ── */}
        {!gs.gameOver && (
          <>
            {/* Shadow */}
            <PivotRectangle
              position={{ x: player.x + 5 + sx, y: player.y + 5 + sy }}
              width={player.width}
              height={player.height}
              fill="rgba(0,0,0,0.4)"
            />
            {/* Shield glow */}
            {gs.time < player.invincibleUntil && (
              <PivotCircle
                center={{ x: player.x + player.width / 2 + sx, y: player.y + player.height / 2 + sy }}
                radius={player.width + 10}
                fill="rgba(0,170,255,0.15)"
                stroke="rgba(0,170,255,0.5)"
                lineWidth={2}
              />
            )}
            {/* Body */}
            <PivotRectangle
              position={{ x: player.x + sx, y: player.y + sy }}
              width={player.width}
              height={player.height}
              fill={gs.time < player.invincibleUntil
                ? (Math.sin(gs.time * 20) > 0 ? '#00ddff' : '#0088aa')
                : '#00aaff'}
              stroke="#ffffff"
              lineWidth={2}
            />
            {/* Roof */}
            <PivotRectangle
              position={{ x: player.x + 6 + sx, y: player.y + 18 + sy }}
              width={player.width - 12}
              height={player.height - 40}
              fill="#0077cc"
            />
            {/* Windshield */}
            <PivotRectangle
              position={{ x: player.x + 4 + sx, y: player.y + 6 + sy }}
              width={player.width - 8}
              height={14}
              fill="rgba(150,220,255,0.6)"
            />
            {/* Headlights */}
            <PivotRectangle position={{ x: player.x + 2 + sx, y: player.y + sy }} width={6} height={5} fill="#ffff88" />
            <PivotRectangle position={{ x: player.x + player.width - 8 + sx, y: player.y + sy }} width={6} height={5} fill="#ffff88" />
            {/* Tail lights */}
            <PivotRectangle position={{ x: player.x + 2 + sx, y: player.y + player.height - 5 + sy }} width={6} height={4} fill="#ff3333" />
            <PivotRectangle position={{ x: player.x + player.width - 8 + sx, y: player.y + player.height - 5 + sy }} width={6} height={4} fill="#ff3333" />

            {/* Nitro flames */}
            {player.nitroActive && (
              <>
                <PivotCircle
                  center={{ x: player.x + 8 + sx, y: player.y + player.height + 8 + sy + Math.random() * 8 }}
                  radius={6 + Math.random() * 6}
                  fill={`rgba(255,${Math.floor(100 + Math.random() * 100)},0,0.8)`}
                />
                <PivotCircle
                  center={{ x: player.x + player.width - 8 + sx, y: player.y + player.height + 8 + sy + Math.random() * 8 }}
                  radius={6 + Math.random() * 6}
                  fill={`rgba(255,${Math.floor(100 + Math.random() * 100)},0,0.8)`}
                />
                <PivotCircle
                  center={{ x: player.x + player.width / 2 + sx, y: player.y + player.height + 15 + sy + Math.random() * 10 }}
                  radius={4 + Math.random() * 4}
                  fill="rgba(255,255,0,0.6)"
                />
              </>
            )}
          </>
        )}

        {/* ── Bullets ── */}
        {bullets.map((b, i) => (
          <PivotCircle
            key={`bl${i}`}
            center={{ x: b.x + sx, y: b.y + sy }}
            radius={3}
            fill={b.fromPolice ? '#ff4444' : '#ffff00'}
          />
        ))}

        {/* ── Particles ── */}
        {particles.map((pt, i) => {
          const alpha = Math.max(0, pt.life / pt.maxLife);
          return (
            <PivotCircle
              key={`pt${i}`}
              center={{ x: pt.x + sx, y: pt.y + sy }}
              radius={pt.size * alpha}
              fill={pt.color}
            />
          );
        })}

        {/* ═══════════ HUD ═══════════ */}

        {/* Speed */}
        <PivotLabel
          text={`${Math.floor(player.speed * 0.6)} km/h`}
          position={{ x: W - 20, y: H - 30 }}
          font="bold 28px Arial"
          fill={player.nitroActive ? '#ff6600' : '#fff'}
          textAlign="right"
        />

        {/* Health Bar */}
        <PivotRectangle position={{ x: 15, y: 15 }} width={204} height={16} fill="#333" stroke="#555" lineWidth={1} />
        <PivotRectangle
          position={{ x: 17, y: 17 }}
          width={Math.max(0, (player.health / player.maxHealth) * 200)}
          height={12}
          fill={player.health > 60 ? '#00ff44' : player.health > 30 ? '#ffaa00' : '#ff2200'}
        />
        <PivotLabel text="HP" position={{ x: 10, y: 23 }} font="bold 10px Arial" fill="#aaa" textAlign="right" />

        {/* Fuel Bar */}
        <PivotRectangle position={{ x: 15, y: 35 }} width={204} height={12} fill="#222" stroke="#444" lineWidth={1} />
        <PivotRectangle
          position={{ x: 17, y: 37 }}
          width={Math.max(0, (player.fuel / player.maxFuel) * 200)}
          height={8}
          fill={player.fuel > 30 ? '#00cc44' : '#ff4400'}
        />
        <PivotLabel text="FUEL" position={{ x: 10, y: 41 }} font="bold 8px Arial" fill="#888" textAlign="right" />

        {/* Nitro Bar */}
        <PivotRectangle position={{ x: 15, y: 51 }} width={204} height={10} fill="#111" stroke="#333" lineWidth={1} />
        <PivotRectangle
          position={{ x: 17, y: 53 }}
          width={Math.max(0, (player.nitro / player.maxNitro) * 200)}
          height={6}
          fill={player.nitroActive ? '#ff6600' : '#ff8844'}
        />
        <PivotLabel text="N2O" position={{ x: 10, y: 56 }} font="bold 8px Arial" fill="#665533" textAlign="right" />

        {/* Score */}
        <PivotLabel
          text={`SCORE: ${gs.score}`}
          position={{ x: 20, y: 78 }}
          font="bold 18px Arial"
          fill="#ffff00"
          textAlign="left"
        />

        {/* Distance */}
        <PivotLabel
          text={`${(gs.distance / 100).toFixed(1)} km`}
          position={{ x: 20, y: 98 }}
          font="14px Arial"
          fill="#aaa"
          textAlign="left"
        />

        {/* Coins */}
        <PivotLabel
          text={`$${gs.coins}`}
          position={{ x: 20, y: 115 }}
          font="bold 14px Arial"
          fill="#ffdd00"
          textAlign="left"
        />

        {/* Wanted Level */}
        <PivotLabel
          text={`${'★'.repeat(gs.wantedLevel)}${'☆'.repeat(5 - gs.wantedLevel)}`}
          position={{ x: W / 2, y: 20 }}
          font="bold 22px Arial"
          fill={gs.wantedLevel >= 4 ? '#ff2200' : gs.wantedLevel >= 2 ? '#ffaa00' : '#ffff00'}
          textAlign="center"
        />
        <PivotLabel
          text="WANTED"
          position={{ x: W / 2, y: 40 }}
          font="bold 10px Arial"
          fill="#ff6666"
          textAlign="center"
        />

        {/* Near miss multiplier */}
        {gs.nearMissMultiplier > 1 && gs.nearMissTimer > 0 && (
          <PivotLabel
            text={`NEAR MISS x${gs.nearMissMultiplier.toFixed(0)}`}
            position={{ x: W / 2, y: 70 }}
            font={`bold ${16 + gs.nearMissMultiplier * 2}px Arial`}
            fill="#ffff00"
            textAlign="center"
          />
        )}

        {/* Message */}
        {gs.messageTimer > 0 && !gs.gameOver && (
          <PivotLabel
            text={gs.message}
            position={{ x: W / 2, y: H / 2 - 40 }}
            font={`bold ${gs.message.includes('WANTED') || gs.message.includes('NITRO') ? 32 : 36}px Arial`}
            fill={gs.message.includes('WANTED') ? '#ff4400' :
                  gs.message.includes('FUEL') ? '#00cc44' :
                  gs.message.includes('NITRO') ? '#ff6600' :
                  gs.message.includes('MISS') ? '#ffff00' : '#ffffff'}
            textAlign="center"
          />
        )}

        {/* Controls hint */}
        <PivotLabel
          text="A/D or ←→: Steer | SPACE: Nitro | ESC: Menu"
          position={{ x: W / 2, y: H - 8 }}
          font="10px Arial"
          fill="#333"
          textAlign="center"
        />

        {/* ═══════════ GAME OVER ═══════════ */}
        {gs.gameOver && (
          <>
            <PivotRectangle position={{ x: 0, y: 0 }} width={W} height={H} fill="rgba(0,0,0,0.8)" />

            <PivotLabel
              text={gs.message === 'OUT OF FUEL!' ? 'OUT OF FUEL!' : 'WRECKED!'}
              position={{ x: W / 2, y: H / 2 - 100 }}
              font="bold 52px Arial"
              fill="#ff2222"
              textAlign="center"
            />

            <PivotLabel
              text={`Score: ${gs.score}`}
              position={{ x: W / 2, y: H / 2 - 40 }}
              font="bold 28px Arial"
              fill="#ffff00"
              textAlign="center"
            />

            <PivotLabel
              text={`Distance: ${(gs.distance / 100).toFixed(1)} km | Coins: ${gs.coins} | Top Speed: ${Math.floor(gs.highSpeed * 0.6)} km/h`}
              position={{ x: W / 2, y: H / 2 }}
              font="16px Arial"
              fill="#ccc"
              textAlign="center"
            />

            <PivotLabel
              text={`Wanted Level: ${'★'.repeat(gs.wantedLevel)}`}
              position={{ x: W / 2, y: H / 2 + 30 }}
              font="18px Arial"
              fill="#ff6666"
              textAlign="center"
            />

            <PivotLabel
              text="Press R to Race Again"
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
