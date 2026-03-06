/**
 * CRYSTAL CAVERNS — Physics System
 * Tilemap-based collision resolution
 */

import { TILE_SIZE } from '../constants';

// ─── Tilemap Collision Resolver ──────────────────────────────────────────────

/**
 * Creates a collision resolver function for a tilemap.
 * Returns adjusted x, y and collision flags.
 */
export function createTileCollider(
  tileMap: number[][],
  solidTiles: Set<number>,
  tileSize: number = TILE_SIZE,
) {
  const rows = tileMap.length;
  const cols = tileMap.length > 0 ? tileMap[0].length : 0;

  function isSolid(worldX: number, worldY: number): boolean {
    const col = Math.floor(worldX / tileSize);
    const row = Math.floor(worldY / tileSize);
    if (row < 0 || row >= rows || col < 0 || col >= cols) return false;
    const tile = tileMap[row][col];
    return tile >= 0 && solidTiles.has(tile);
  }

  return function resolve(
    px: number, py: number, pw: number, ph: number,
  ): { x: number; y: number; landed: boolean; hitHead: boolean; hitWall: boolean } {
    let landed = false;
    let hitHead = false;
    let hitWall = false;

    // Check bottom (feet)
    const feetY = py + ph;
    const leftX = px + 2;
    const rightX = px + pw - 2;

    if (isSolid(leftX, feetY) || isSolid(rightX, feetY)) {
      const tileRow = Math.floor(feetY / tileSize);
      py = tileRow * tileSize - ph;
      landed = true;
    }

    // Check top (head)
    const headY = py;
    if (isSolid(leftX, headY) || isSolid(rightX, headY)) {
      const tileRow = Math.floor(headY / tileSize);
      py = (tileRow + 1) * tileSize;
      hitHead = true;
    }

    // Check right side
    const midY = py + ph * 0.3;
    const lowY = py + ph * 0.7;
    if (isSolid(px + pw, midY) || isSolid(px + pw, lowY)) {
      const tileCol = Math.floor((px + pw) / tileSize);
      px = tileCol * tileSize - pw;
      hitWall = true;
    }

    // Check left side
    if (isSolid(px, midY) || isSolid(px, lowY)) {
      const tileCol = Math.floor(px / tileSize);
      px = (tileCol + 1) * tileSize;
      hitWall = true;
    }

    return { x: px, y: py, landed, hitHead, hitWall };
  };
}

// ─── AABB Helpers ────────────────────────────────────────────────────────────

export function boxOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
