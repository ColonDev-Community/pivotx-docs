/**
 * CRYSTAL CAVERNS — Level Generator
 * Builds the level data: tilemap, platforms, crystals, enemies
 */

import { LevelData, Crystal, Enemy, PlatformData } from '../types';
import { TILE_SIZE, CRYSTAL_COLORS } from '../constants';
import { createSlime, createBat, createSpike } from '../entities/enemies';

// ─── Tile IDs ────────────────────────────────────────────────────────────────
// These reference frame indices in a conceptual spritesheet.
// For our procedural rendering we use them as tile type identifiers.
//
//  0 = ground top-left     1 = ground top-mid     2 = ground top-right
//  3 = ground mid-left     4 = ground mid-mid     5 = ground mid-right
//  6 = stone block         7 = dark stone
//  8 = crystal ore         9 = moss stone

export const SOLID_TILES = new Set([0, 1, 2, 3, 4, 5, 6, 7, 9]);

// ─── Level 1 ─────────────────────────────────────────────────────────────────

export function generateLevel(level: number): LevelData {
  // Level dimensions
  const cols = 50;
  const rows = 18;
  const tileSize = TILE_SIZE;

  // Initialize empty map
  const tileMap: number[][] = [];
  for (let r = 0; r < rows; r++) {
    tileMap.push(new Array(cols).fill(-1));
  }

  // Ground floor (bottom 2 rows)
  for (let c = 0; c < cols; c++) {
    tileMap[rows - 2][c] = 1; // ground top
    tileMap[rows - 1][c] = 4; // ground fill
  }

  // Ground top edge variants
  tileMap[rows - 2][0] = 0;           // left edge
  tileMap[rows - 2][cols - 1] = 2;    // right edge
  tileMap[rows - 1][0] = 3;           // fill left
  tileMap[rows - 1][cols - 1] = 5;    // fill right

  // Floating platforms (row 12)
  addPlatformTiles(tileMap, 5, 12, 5);
  addPlatformTiles(tileMap, 14, 12, 4);
  addPlatformTiles(tileMap, 24, 12, 6);
  addPlatformTiles(tileMap, 35, 12, 5);
  addPlatformTiles(tileMap, 44, 12, 4);

  // Higher platforms (row 9)
  addPlatformTiles(tileMap, 9, 9, 4);
  addPlatformTiles(tileMap, 19, 9, 5);
  addPlatformTiles(tileMap, 30, 9, 4);
  addPlatformTiles(tileMap, 40, 9, 5);

  // Top platforms (row 6)
  addPlatformTiles(tileMap, 13, 6, 5);
  addPlatformTiles(tileMap, 25, 6, 6);
  addPlatformTiles(tileMap, 37, 6, 4);

  // Stone walls / obstacles
  addWall(tileMap, 22, rows - 4, 3);
  addWall(tileMap, 33, rows - 5, 4);
  addWall(tileMap, 42, rows - 3, 2);

  // Gaps in the ground floor
  for (let c = 11; c <= 13; c++) {
    tileMap[rows - 2][c] = -1;
    tileMap[rows - 1][c] = -1;
  }
  for (let c = 28; c <= 30; c++) {
    tileMap[rows - 2][c] = -1;
    tileMap[rows - 1][c] = -1;
  }

  // ── Crystals ──
  const crystals: Crystal[] = [];
  const crystalPositions = [
    // On floating platforms
    { x: 6, y: 11 }, { x: 8, y: 11 },
    { x: 15, y: 11 }, { x: 16, y: 11 },
    { x: 25, y: 11 }, { x: 27, y: 11 },
    { x: 36, y: 11 }, { x: 38, y: 11 },
    // On higher platforms
    { x: 10, y: 8 }, { x: 11, y: 8 },
    { x: 20, y: 8 }, { x: 22, y: 8 },
    { x: 31, y: 8 },
    { x: 41, y: 8 }, { x: 43, y: 8 },
    // On top platforms
    { x: 14, y: 5 }, { x: 16, y: 5 },
    { x: 27, y: 5 }, { x: 29, y: 5 },
    { x: 38, y: 5 },
    // On ground
    { x: 3, y: rows - 3 }, { x: 17, y: rows - 3 },
    { x: 45, y: rows - 3 },
  ];

  crystalPositions.forEach((pos, i) => {
    crystals.push({
      x: pos.x * tileSize + 6,
      y: pos.y * tileSize + 4,
      width: 16,
      height: 20,
      collected: false,
      bobTimer: Math.random() * Math.PI * 2,
      sparkleTimer: Math.random() * 3,
      color: CRYSTAL_COLORS[i % CRYSTAL_COLORS.length],
      value: 1,
    });
  });

  // ── Enemies ──
  const enemies: Enemy[] = [
    // Ground slimes
    createSlime(6 * tileSize, (rows - 3) * tileSize + 2, 80),
    createSlime(18 * tileSize, (rows - 3) * tileSize + 2, 100),
    createSlime(38 * tileSize, (rows - 3) * tileSize + 2, 60),
    // Platform slimes
    createSlime(26 * tileSize, 11 * tileSize + 2, 50),
    // Bats
    createBat(12 * tileSize, 7 * tileSize, 100),
    createBat(28 * tileSize, 4 * tileSize, 120),
    createBat(40 * tileSize, 7 * tileSize, 80),
    // Spikes in gaps
    createSpike(11 * tileSize, (rows - 2) * tileSize - 12),
    createSpike(12 * tileSize, (rows - 2) * tileSize - 12),
    createSpike(29 * tileSize, (rows - 2) * tileSize - 12),
  ];

  // ── Additional logical platforms (one-way for jump-through) ──
  const platforms: PlatformData[] = [];
  // No extra logical platforms needed — tilemap handles collision

  return {
    platforms,
    crystals,
    enemies,
    playerStart: { x: 2 * tileSize, y: (rows - 3) * tileSize },
    worldWidth: cols * tileSize,
    worldHeight: rows * tileSize,
    tileMap,
    tileSize,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function addPlatformTiles(map: number[][], startCol: number, row: number, length: number): void {
  if (row < 0 || row >= map.length) return;
  for (let c = 0; c < length; c++) {
    const col = startCol + c;
    if (col >= 0 && col < map[0].length) {
      if (c === 0) map[row][col] = 0;        // left edge
      else if (c === length - 1) map[row][col] = 2; // right edge
      else map[row][col] = 1;                // middle
    }
  }
}

function addWall(map: number[][], col: number, startRow: number, height: number): void {
  for (let r = 0; r < height; r++) {
    const row = startRow + r;
    if (row >= 0 && row < map.length && col >= 0 && col < map[0].length) {
      map[row][col] = r === 0 ? 6 : 7; // stone top / stone fill
    }
  }
}
