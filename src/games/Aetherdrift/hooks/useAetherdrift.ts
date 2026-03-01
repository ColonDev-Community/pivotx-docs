/**
 * AETHERDRIFT — Main Game Hook
 * Orchestrates all game systems: input, physics, combat, camera, particles
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { useGameLoop } from 'pivotx/react';
import { useExitToMenu } from '../../../hooks/useExitToMenu';
import {
  PlayerState, EnemyState, BossState, Platform, Collectible,
  Particle, Projectile, AttackHitbox, Camera, GameState, RealmId,
} from '../types';
import { REALMS, GROUND_Y_OFFSET, HEAL_GLOW_DURATION } from '../constants';
import { createPlayer, updatePlayer, damagePlayer, PlayerInput } from '../entities/Player';
import { updateEnemies, updateBoss } from '../entities/enemies';
import { updatePlatforms } from '../objects/platforms';
import { updateCollectibles } from '../objects/collectibles';
import { createCamera, updateCamera, addScreenShake } from '../systems/camera';
import {
  updateParticles, spawnJumpDust, spawnLandDust, spawnDashTrail,
  spawnHitSparks, spawnDeathBurst, spawnCollectSparkle,
  spawnAmbientParticle, spawnShockwave, spawnBossProjectileTrail,
  spawnHealEffect,
} from '../systems/particles';
import {
  resolveAttackVsEnemies, resolveAttackVsBoss,
  checkEnemyContactDamage, checkBossContactDamage,
  updateProjectiles as updateProjectileSystem,
} from '../systems/combat';
import { checkAABBCollision } from '../systems/physics';
import { generateLevel, LevelData } from '../levels/generator';

export function useAetherdrift() {
  const onExit = useExitToMenu();
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [tick, setTick] = useState(0);

  // ── Game state refs ────────────────────────────────────────────────────
  const gameState = useRef<GameState>({
    phase: 'title',
    currentRealm: 0 as RealmId,
    realmsCompleted: [false, false, false],
    score: 0,
    playTime: 0,
    phaseTimer: 0,
    bossTriggered: false,
  });

  const player = useRef<PlayerState>(createPlayer(100, 400));
  const camera = useRef<Camera>(createCamera());

  const platforms = useRef<Platform[]>([]);
  const enemies = useRef<EnemyState[]>([]);
  const boss = useRef<BossState | null>(null);
  const collectibles = useRef<Collectible[]>([]);
  const particles = useRef<Particle[]>([]);
  const projectiles = useRef<Projectile[]>([]);
  const attacks = useRef<AttackHitbox[]>([]);

  const levelData = useRef<LevelData | null>(null);

  // ── Input ──────────────────────────────────────────────────────────────
  const keys = useRef<Record<string, boolean>>({});
  const keysJustPressed = useRef<Record<string, boolean>>({});
  const keysJustReleased = useRef<Record<string, boolean>>({});
  const prevKeys = useRef<Record<string, boolean>>({});

  const ambientTimer = useRef(0);
  const wasGrounded = useRef(false);

  // ── Resize ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Keyboard ───────────────────────────────────────────────────────────
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keys.current[k] = true;

      // Title / game over actions
      const gs = gameState.current;
      if (gs.phase === 'title' && (k === 'enter' || k === ' ')) {
        startGame();
      }
      if (gs.phase === 'game_over' && k === 'enter') {
        startGame();
      }
      if (gs.phase === 'victory' && k === 'enter') {
        startGame();
      }
      if (gs.phase === 'realm_clear' && k === 'enter') {
        nextRealm();
      }

      if (k === 'escape') onExit();
    };
    const up = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onExit]);

  // ── Start / Restart ────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    const gs = gameState.current;
    gs.phase = 'realm_intro';
    gs.currentRealm = 0 as RealmId;
    gs.realmsCompleted = [false, false, false];
    gs.score = 0;
    gs.playTime = 0;
    gs.phaseTimer = 0;
    gs.bossTriggered = false;

    loadRealm(0 as RealmId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenSize.height]);

  const loadRealm = useCallback((realmId: RealmId) => {
    const realm = REALMS[realmId];
    const data = generateLevel(realm, screenSize.height);
    levelData.current = data;

    platforms.current = data.platforms;
    enemies.current = data.enemies;
    boss.current = data.boss;
    boss.current.active = false; // activate when player reaches gate
    collectibles.current = data.collectibles;
    particles.current = [];
    projectiles.current = [];
    attacks.current = [];

    const p = createPlayer(80, data.groundY - 50);
    p.currentRealm = realmId;
    player.current = p;

    const cam = createCamera();
    cam.x = 0;
    cam.y = 0;
    camera.current = cam;

    gameState.current.currentRealm = realmId;
    gameState.current.phaseTimer = 0;
    gameState.current.bossTriggered = false;
    wasGrounded.current = false;
  }, [screenSize.height]);

  const nextRealm = useCallback(() => {
    const gs = gameState.current;
    const next = (gs.currentRealm + 1) as RealmId;
    if (next > 2) {
      gs.phase = 'victory';
      gs.phaseTimer = 0;
    } else {
      gs.phase = 'realm_intro';
      gs.phaseTimer = 0;
      loadRealm(next);
    }
  }, [loadRealm]);

  // ── Game Loop ──────────────────────────────────────────────────────────
  useGameLoop((rawDt: number) => {
    const dt = Math.min(rawDt, 0.05);
    const gs = gameState.current;
    const p = player.current;
    const cam = camera.current;
    const W = screenSize.width;
    const H = screenSize.height;

    // ── Compute just pressed / released ──────────────────────────────
    for (const k of Object.keys(keys.current)) {
      keysJustPressed.current[k] = keys.current[k] && !prevKeys.current[k];
      keysJustReleased.current[k] = !keys.current[k] && prevKeys.current[k];
    }
    for (const k of Object.keys(prevKeys.current)) {
      if (!(k in keys.current)) {
        keysJustReleased.current[k] = prevKeys.current[k];
      }
    }
    prevKeys.current = { ...keys.current };

    // ── Phase transitions ────────────────────────────────────────────
    if (gs.phase === 'realm_intro') {
      gs.phaseTimer += dt;
      if (gs.phaseTimer > 2.5) {
        gs.phase = 'playing';
        gs.phaseTimer = 0;
      }
      setTick(t => t + 1);
      return;
    }

    if (gs.phase === 'boss_intro') {
      gs.phaseTimer += dt;
      if (gs.phaseTimer > 2.0) {
        gs.phase = 'boss';
        gs.phaseTimer = 0;
        if (boss.current) boss.current.active = true;
      }
      setTick(t => t + 1);
      return;
    }

    if (gs.phase !== 'playing' && gs.phase !== 'boss') {
      setTick(t => t + 1);
      return;
    }

    gs.playTime += dt;
    const groundY = levelData.current?.groundY ?? (H - GROUND_Y_OFFSET);
    const realm = REALMS[gs.currentRealm];

    // ── Build input ──────────────────────────────────────────────────
    const input: PlayerInput = {
      left: keys.current['a'] || keys.current['arrowleft'],
      right: keys.current['d'] || keys.current['arrowright'],
      jump: keys.current['w'] || keys.current['arrowup'] || keys.current[' '],
      jumpPressed: keysJustPressed.current['w'] || keysJustPressed.current['arrowup'] || keysJustPressed.current[' '],
      jumpReleased: keysJustReleased.current['w'] || keysJustReleased.current['arrowup'] || keysJustReleased.current[' '],
      attack: keys.current['j'] || keys.current['x'],
      attackPressed: keysJustPressed.current['j'] || keysJustPressed.current['x'],
      dash: keys.current['k'] || keys.current['z'],
      dashPressed: keysJustPressed.current['k'] || keysJustPressed.current['z'],
      healPressed: keysJustPressed.current['c'] || keysJustPressed.current['l'],
    };

    // ── Update player ────────────────────────────────────────────────
    const prevGrounded = wasGrounded.current;
    const newAttack = updatePlayer(p, input, platforms.current, dt, W, H, groundY);

    // Jump/land particles
    if (!prevGrounded && p.isGrounded) {
      spawnLandDust(particles.current, p.x + p.width / 2, p.y + p.height);
    }
    if (prevGrounded && !p.isGrounded && p.vy < 0) {
      spawnJumpDust(particles.current, p.x + p.width / 2, p.y + p.height);
    }
    wasGrounded.current = p.isGrounded;

    // Dash trail
    if (p.isDashing) {
      spawnDashTrail(particles.current, p.x, p.y, p.height, '#bd93f966');
    }

    // Heal effect particles
    if (p.healTimer > 0 && p.healTimer > HEAL_GLOW_DURATION - 0.05) {
      spawnHealEffect(particles.current, p.x + p.width / 2, p.y + p.height / 2);
    }

    // ── Update platforms ─────────────────────────────────────────────
    updatePlatforms(platforms.current, dt);

    // ── Spike damage ─────────────────────────────────────────────────
    for (const plat of platforms.current) {
      if (plat.type === 'spike' && checkAABBCollision(p, plat)) {
        if (damagePlayer(p, 1, plat.x + plat.width / 2)) {
          addScreenShake(cam, 5);
          spawnHitSparks(particles.current, p.x + p.width / 2, p.y + p.height, '#ff4455');
        }
      }
    }

    // ── Update enemies ───────────────────────────────────────────────
    const enemyProjectiles = updateEnemies(enemies.current, p, dt, groundY, gs.playTime);
    projectiles.current.push(...enemyProjectiles);

    // ── Update boss ──────────────────────────────────────────────────
    if (gs.phase === 'boss' && boss.current?.active) {
      const bossProj = updateBoss(boss.current, p, dt, groundY);
      projectiles.current.push(...bossProj);

      // Boss shockwave particles
      if (boss.current.shockwaveTimer > 0) {
        spawnShockwave(particles.current, boss.current.x + boss.current.width / 2, groundY, boss.current.glowColor);
        addScreenShake(cam, 8);
        // Damage player if on ground near boss
        if (p.isGrounded && Math.abs(p.x - boss.current.x) < 200) {
          if (damagePlayer(p, boss.current.damage, boss.current.x + boss.current.width / 2)) {
            addScreenShake(cam, 5);
          }
        }
      }

      // Boss contact damage
      if (checkBossContactDamage(p, boss.current)) {
        if (damagePlayer(p, boss.current.damage, boss.current.x + boss.current.width / 2)) {
          addScreenShake(cam, 6);
          spawnHitSparks(particles.current, p.x + p.width / 2, p.y + p.height / 2, '#ff5555');
        }
      }

      // Boss defeated
      if (boss.current.defeated) {
        gs.realmsCompleted[gs.currentRealm] = true;
        gs.score += 1000;
        gs.phase = 'realm_clear';
        gs.phaseTimer = 0;
        spawnDeathBurst(particles.current,
          boss.current.x + boss.current.width / 2,
          boss.current.y + boss.current.height / 2,
          boss.current.glowColor,
        );
        addScreenShake(cam, 20);
      }
    }

    // ── Boss trigger ─────────────────────────────────────────────────
    if (gs.phase === 'playing' && levelData.current && !gs.bossTriggered) {
      if (p.x >= levelData.current.bossGateX) {
        gs.bossTriggered = true;
        gs.phase = 'boss_intro';
        gs.phaseTimer = 0;
      }
    }

    // ── Resolve player attacks ───────────────────────────────────────
    if (newAttack) {
      attacks.current.push(newAttack);
    }

    for (let i = attacks.current.length - 1; i >= 0; i--) {
      const atk = attacks.current[i];
      atk.lifetime -= dt;
      if (atk.lifetime <= 0) {
        attacks.current.splice(i, 1);
        continue;
      }
      // vs enemies
      const hitEnemies = resolveAttackVsEnemies(atk, enemies.current);
      for (const e of hitEnemies) {
        spawnHitSparks(particles.current, e.x + e.width / 2, e.y + e.height / 2, e.glowColor);
        addScreenShake(cam, 3);
        if (e.health <= 0) {
          spawnDeathBurst(particles.current, e.x + e.width / 2, e.y + e.height / 2, e.color);
          gs.score += 50;
          p.totalKills++;
        }
      }
      // vs boss
      if (boss.current?.active) {
        if (resolveAttackVsBoss(atk, boss.current)) {
          spawnHitSparks(particles.current, boss.current.x + boss.current.width / 2, boss.current.y + boss.current.height / 2, boss.current.glowColor);
          addScreenShake(cam, 4);
        }
      }
    }

    // ── Enemy contact damage ─────────────────────────────────────────
    const contactHit = checkEnemyContactDamage(p, enemies.current);
    if (contactHit) {
      if (damagePlayer(p, contactHit.damage, contactHit.enemy.x + contactHit.enemy.width / 2)) {
        addScreenShake(cam, 5);
        spawnHitSparks(particles.current, p.x + p.width / 2, p.y + p.height / 2, '#ff5555');
      }
    }

    // ── Projectile hits ──────────────────────────────────────────────
    const projResult = updateProjectileSystem(projectiles.current, p, enemies.current, dt);
    if (projResult.playerHit) {
      if (damagePlayer(p, 1, p.x)) {
        addScreenShake(cam, 4);
        spawnHitSparks(particles.current, p.x + p.width / 2, p.y + p.height / 2, '#ff5555');
      }
    }

    // Boss projectile trail particles
    for (const proj of projectiles.current) {
      if (!proj.isPlayer) {
        spawnBossProjectileTrail(particles.current, proj.x, proj.y, proj.color);
      }
    }

    // ── Collectibles ─────────────────────────────────────────────────
    updateCollectibles(collectibles.current, dt);
    for (const c of collectibles.current) {
      if (c.collected) continue;
      if (checkAABBCollision(p, c)) {
        c.collected = true;
        if (c.type === 'shard' || c.type === 'big_shard') {
          p.chronoShards += c.value;
          gs.score += c.value * 10;
          spawnCollectSparkle(particles.current, c.x + c.width / 2, c.y + c.height / 2, c.glowColor);
        } else if (c.type === 'health') {
          p.health = Math.min(p.maxHealth, p.health + 1);
          spawnCollectSparkle(particles.current, c.x + c.width / 2, c.y + c.height / 2, '#ff5555');
        }
      }
    }

    // ── Particles ────────────────────────────────────────────────────
    updateParticles(particles.current, dt);
    // Ambient particles
    ambientTimer.current += dt;
    if (ambientTimer.current > 0.15) {
      ambientTimer.current = 0;
      spawnAmbientParticle(particles.current, realm.ambientColor, W, H, cam.x, cam.y);
    }

    // Cap particles
    if (particles.current.length > 300) {
      particles.current.splice(0, particles.current.length - 300);
    }

    // ── Camera ───────────────────────────────────────────────────────
    updateCamera(cam, p, dt, W, H, realm.levelWidth, groundY);

    // ── Death check ──────────────────────────────────────────────────
    if (p.health <= 0 || p.y > groundY + 200) {
      gs.phase = 'game_over';
      gs.phaseTimer = 0;
      spawnDeathBurst(particles.current, p.x + p.width / 2, p.y + p.height / 2, '#ff5555');
    }

    setTick(t => t + 1);
  });

  return {
    screenSize,
    gameState: gameState.current,
    player: player.current,
    camera: camera.current,
    platforms: platforms.current,
    enemies: enemies.current,
    boss: boss.current,
    collectibles: collectibles.current,
    particles: particles.current,
    projectiles: projectiles.current,
    attacks: attacks.current,
    realm: REALMS[gameState.current.currentRealm],
    tick,
    onExit,
  };
}
