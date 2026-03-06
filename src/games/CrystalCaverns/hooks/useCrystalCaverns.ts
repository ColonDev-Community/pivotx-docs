/**
 * CRYSTAL CAVERNS — Main Game Hook
 * Orchestrates all game systems: input, physics, camera, particles, combat
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { useGameLoop } from 'pivotx/react';
import { useExitToMenu } from '../../../hooks/useExitToMenu';
import {
  PlayerState, CameraState, GameState, Particle,
  Crystal, Enemy, LevelData,
} from '../types';
import { createPlayer, updatePlayer, PlayerInput } from '../entities/Player';
import { updateEnemies } from '../entities/enemies';
import { createCamera, updateCamera, addScreenShake, worldToScreen } from '../systems/camera';
import { createTileCollider } from '../systems/physics';
import { updateParticles, spawnJumpDust, spawnLandDust } from '../systems/particles';
import { updateCrystals } from '../systems/collectibles';
import { checkEnemyDamage } from '../systems/combat';
import { generateLevel, SOLID_TILES } from '../levels/generator';

export function useCrystalCaverns() {
  const onExit = useExitToMenu();
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [, setTick] = useState(0);

  // ── Game state refs ────────────────────────────────────────────────────
  const gameState = useRef<GameState>({
    phase: 'title',
    score: 0,
    totalCrystals: 0,
    playTime: 0,
    level: 1,
  });

  const player = useRef<PlayerState>(createPlayer(64, 400));
  const camera = useRef<CameraState>(createCamera());
  const particles = useRef<Particle[]>([]);
  const crystals = useRef<Crystal[]>([]);
  const enemies = useRef<Enemy[]>([]);
  const levelData = useRef<LevelData | null>(null);
  const tileCollider = useRef<ReturnType<typeof createTileCollider> | null>(null);

  // ── Input ──────────────────────────────────────────────────────────────
  const keys = useRef<Record<string, boolean>>({});
  const wasGrounded = useRef(false);

  // ── Resize ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Key handlers ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;

      if (e.key === 'Escape') {
        onExit();
        return;
      }

      // Start game from title
      if (gameState.current.phase === 'title' && (e.key === 'Enter' || e.key === ' ')) {
        startGame();
        e.preventDefault();
      }

      // Restart from gameover/win
      if ((gameState.current.phase === 'gameover' || gameState.current.phase === 'win') &&
          (e.key === 'Enter' || e.key === ' ')) {
        startGame();
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onExit]);

  // ── Start game ─────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    const level = generateLevel(1);
    levelData.current = level;
    tileCollider.current = createTileCollider(level.tileMap, SOLID_TILES, level.tileSize);

    player.current = createPlayer(level.playerStart.x, level.playerStart.y);
    camera.current = createCamera();
    particles.current = [];
    crystals.current = [...level.crystals.map(c => ({ ...c }))];
    enemies.current = [...level.enemies.map(e => ({ ...e }))];

    gameState.current = {
      phase: 'playing',
      score: 0,
      totalCrystals: level.crystals.length,
      playTime: 0,
      level: 1,
    };
  }, []);

  // ── Game loop ──────────────────────────────────────────────────────────
  useGameLoop((dt) => {
    dt = Math.min(dt, 0.05); // cap delta time

    const gs = gameState.current;
    const p = player.current;
    const cam = camera.current;

    if (gs.phase !== 'playing') {
      setTick(t => t + 1);
      return;
    }

    gs.playTime += dt;

    // ── Player input ──
    const input: PlayerInput = {
      left: keys.current['a'] || keys.current['arrowleft'],
      right: keys.current['d'] || keys.current['arrowright'],
      jump: keys.current['w'] || keys.current['arrowup'] || keys.current[' '],
    };

    const wasOnGround = p.isGrounded;

    // ── Update player ──
    if (tileCollider.current) {
      updatePlayer(p, input, levelData.current?.platforms || [], tileCollider.current, dt);
    }

    // ── Landing dust ──
    if (p.isGrounded && !wasOnGround && !wasGrounded.current) {
      spawnLandDust(particles.current, p.x + p.width / 2, p.y + p.height);
    }
    // ── Jump dust ──
    if (!p.isGrounded && wasOnGround) {
      spawnJumpDust(particles.current, p.x + p.width / 2, p.y + p.height);
    }
    wasGrounded.current = p.isGrounded;

    // ── Update enemies ──
    updateEnemies(enemies.current, dt);

    // ── Enemy damage ──
    const tookDamage = checkEnemyDamage(p, enemies.current, particles.current);
    if (tookDamage) {
      addScreenShake(cam, 8);
    }

    // ── Collect crystals ──
    const collected = updateCrystals(crystals.current, p, particles.current, dt);
    if (collected > 0) {
      gs.score += collected * 100;
    }

    // ── Check win ──
    const allCollected = crystals.current.every(c => c.collected);
    if (allCollected && crystals.current.length > 0) {
      gs.phase = 'win';
    }

    // ── Check death ──
    if (p.health <= 0) {
      gs.phase = 'gameover';
      addScreenShake(cam, 15);
    }

    // ── Fall into void ──
    if (levelData.current && p.y > levelData.current.worldHeight + 100) {
      p.health = 0;
      gs.phase = 'gameover';
    }

    // ── Update camera ──
    if (levelData.current) {
      updateCamera(
        cam,
        p.x + p.width / 2,
        p.y + p.height / 2,
        screenSize.width,
        screenSize.height,
        levelData.current.worldWidth,
        levelData.current.worldHeight,
      );
    }

    // ── Update particles ──
    updateParticles(particles.current, dt);

    setTick(t => t + 1);
  });

  return {
    screenSize,
    gameState: gameState.current,
    player: player.current,
    camera: camera.current,
    particles: particles.current,
    crystals: crystals.current,
    enemies: enemies.current,
    levelData: levelData.current,
    worldToScreen: (wx: number, wy: number) => worldToScreen(wx, wy, camera.current),
  };
}
