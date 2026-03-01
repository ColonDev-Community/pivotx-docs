/**
 * AETHERDRIFT — Level Generator
 * Procedural level generation per realm
 */

import { Platform, EnemyState, Collectible, BossState, Realm } from '../types';
import { createPlatform, createGroundSegment } from '../objects/platforms';
import { createCollectible } from '../objects/collectibles';
import { createEnemy } from '../entities/enemies';
import { createBoss } from '../entities/enemies';
import { GROUND_Y_OFFSET } from '../constants';

export interface LevelData {
  platforms: Platform[];
  enemies: EnemyState[];
  collectibles: Collectible[];
  boss: BossState;
  groundY: number;
  bossGateX: number;
}

// ─── Main Generator ──────────────────────────────────────────────────────────

export function generateLevel(realm: Realm, screenH: number): LevelData {
  const groundY = screenH - GROUND_Y_OFFSET;
  const levelW = realm.levelWidth;
  const platforms: Platform[] = [];
  const enemies: EnemyState[] = [];
  const collectibles: Collectible[] = [];

  const pColor = realm.platformColor;
  const pAccent = realm.platformAccent;
  const gColor = realm.groundColor;

  // ── Continuous ground (no gaps — player won't fall) ─────────────────────
  // Build ground as contiguous segments that tile seamlessly
  let gx = 0;
  const segMinLen = 200;
  const segMaxLen = 500;

  while (gx < levelW) {
    const segLen = Math.min(
      segMinLen + Math.random() * (segMaxLen - segMinLen),
      levelW - gx, // don't overshoot level width
    );
    platforms.push(createGroundSegment(gx, groundY, segLen, gColor, pAccent));

    // Sprinkle shards along ground
    const shardCount = Math.floor(segLen / 80);
    for (let i = 0; i < shardCount; i++) {
      if (Math.random() < 0.6) {
        collectibles.push(createCollectible(
          gx + 30 + i * 80 + Math.random() * 20,
          groundY - 25,
          'shard',
        ));
      }
    }

    gx += segLen;
  }

  // ── Floating platforms (higher routes) ─────────────────────────────────
  const floatCount = Math.floor(levelW / 350) + realm.difficulty * 3;
  for (let i = 0; i < floatCount; i++) {
    const px = 200 + Math.random() * (levelW - 800);
    const py = groundY - 120 - Math.random() * 200;
    const pw = 50 + Math.random() * 80;
    const isMoving = Math.random() < 0.2 + realm.difficulty * 0.05;
    const isBreakable = Math.random() < 0.1;

    const type = isMoving
      ? (Math.random() > 0.5 ? 'moving_h' : 'moving_v')
      : isBreakable ? 'breakable' : 'solid';

    platforms.push(createPlatform(
      px, py, pw, 14,
      type, pColor, pAccent,
      isMoving ? 1.5 + Math.random() : 0,
      isMoving ? 40 + Math.random() * 60 : 0,
    ));

    // Shard on platform
    if (Math.random() < 0.5) {
      collectibles.push(createCollectible(
        px + pw / 2 - 5,
        py - 20,
        Math.random() < 0.15 ? 'big_shard' : 'shard',
      ));
    }
  }

  // ── Spike platforms (hazards) ──────────────────────────────────────────
  const spikeCount = realm.difficulty * 2 + 1;
  for (let i = 0; i < spikeCount; i++) {
    const sx = 400 + Math.random() * (levelW - 1000);
    platforms.push(createPlatform(
      sx, groundY - 8, 40 + Math.random() * 40, 8,
      'spike', '#cc3344', '#ff4455',
    ));
  }

  // ── Enemies ────────────────────────────────────────────────────────────
  const enemyCount = 6 + realm.difficulty * 4;
  const spacing = (levelW - 800) / enemyCount;

  for (let i = 0; i < enemyCount; i++) {
    const ex = 300 + i * spacing + (Math.random() - 0.5) * spacing * 0.5;
    const eType = realm.enemyTypes[Math.floor(Math.random() * realm.enemyTypes.length)];
    const template = { sprite: true, firewisp: true } as Record<string, boolean>;
    const isFlyer = template[eType] || false;
    const ey = isFlyer
      ? groundY - 100 - Math.random() * 120
      : groundY - 20;

    enemies.push(createEnemy(eType, ex, ey));
  }

  // ── Health pickups ─────────────────────────────────────────────────────
  const healthCount = 2 + realm.difficulty;
  for (let i = 0; i < healthCount; i++) {
    collectibles.push(createCollectible(
      300 + Math.random() * (levelW - 600),
      groundY - 60 - Math.random() * 160,
      'health',
    ));
  }

  // ── Boss ───────────────────────────────────────────────────────────────
  const bossGateX = levelW - 350;
  const boss = createBoss(
    realm.bossType,
    bossGateX + 150,
    groundY - 80,
  );

  return {
    platforms,
    enemies,
    collectibles,
    boss,
    groundY,
    bossGateX,
  };
}
