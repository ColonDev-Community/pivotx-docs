/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║                       CRYSTAL CAVERNS                                 ║
 * ╠═══════════════════════════════════════════════════════════════════════╣
 * ║                                                                       ║
 * ║  A side-scrolling platformer showcasing every new PivotX feature:     ║
 * ║  • Tilemap-based levels with collision                                ║
 * ║  • Camera following with smooth lerp & screen shake                   ║
 * ║  • Sprite-based entities with procedural rendering                    ║
 * ║  • Parallax scrolling backgrounds                                     ║
 * ║  • Collectible crystals with particle effects                         ║
 * ║  • Enemies: Slimes (patrol), Bats (flying), Spikes (static)          ║
 * ║  • AABB collision with tilemap solid tiles                            ║
 * ║  • Stomp-to-kill mechanics                                            ║
 * ║                                                                       ║
 * ║  CONTROLS:                                                            ║
 * ║    A/D or ←/→  Move                                                   ║
 * ║    W/↑/Space   Jump                                                   ║
 * ║    ESC         Exit to menu                                           ║
 * ║                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import {
  PivotCanvas,
  PivotCircle,
  PivotRectangle,
  PivotLabel,
} from 'pivotx/react';
import { useCrystalCaverns } from './hooks/useCrystalCaverns';
import {
  BG_COLOR, BG_GRADIENT_TOP, BG_GRADIENT_MID,
  GROUND_COLOR, GROUND_TOP_COLOR, STONE_COLOR, STONE_LIGHT_COLOR,
  PLAYER_BODY_COLOR, PLAYER_EYE_COLOR, PLAYER_OUTLINE_COLOR,
  SLIME_COLOR, BAT_COLOR, SPIKE_COLOR,
  HUD_BG_COLOR, HUD_TEXT_COLOR,
  HEALTH_FULL_COLOR, HEALTH_EMPTY_COLOR,
  TILE_SIZE,
} from './constants';

export default function CrystalCavernsGame() {
  const {
    screenSize, gameState, player, camera, particles,
    crystals, enemies, levelData, worldToScreen,
  } = useCrystalCaverns();

  const W = screenSize.width;
  const H = screenSize.height;
  const gs = gameState;
  const p = player;
  const cam = camera;

  // ── Parallax helper ────────────────────────────────────────────────────
  const parallax = (depth: number) => -(cam.x * depth) % W;

  // ── Player visibility (flicker when invincible) ────────────────────────
  const playerVisible = p.invincibleTimer <= 0 || Math.floor(p.invincibleTimer * 12) % 2 === 0;

  return (
    <PivotCanvas width={W} height={H} background={BG_COLOR}>

      {/* ══════════════ BACKGROUND ══════════════ */}

      {/* Sky gradient */}
      <PivotRectangle position={{ x: 0, y: 0 }} width={W} height={H * 0.4}
        fill={BG_GRADIENT_TOP} />
      <PivotRectangle position={{ x: 0, y: H * 0.4 }} width={W} height={H * 0.6}
        fill={BG_GRADIENT_MID} />

      {/* Parallax mountain layer (far) */}
      {[0, 1, 2].map(i => {
        const px = parallax(0.1) + i * 400 - 200;
        return (
          <React.Fragment key={`mtn-${i}`}>
            <PivotCircle center={{ x: px + 200, y: H * 0.65 }}
              radius={160 + i * 30} fill="#1a2a3a" />
            <PivotCircle center={{ x: px + 100, y: H * 0.7 }}
              radius={120 + i * 20} fill="#162636" />
          </React.Fragment>
        );
      })}

      {/* Parallax hills (mid) */}
      {[0, 1, 2, 3].map(i => {
        const px = parallax(0.3) + i * 300 - 150;
        return (
          <PivotCircle key={`hill-${i}`}
            center={{ x: px + 150, y: H * 0.75 }}
            radius={100 + i * 15} fill="#1e3a2f" />
        );
      })}

      {/* Parallax trees (near) */}
      {[0, 1, 2, 3, 4, 5].map(i => {
        const px = parallax(0.5) + i * 200 - 100;
        return (
          <React.Fragment key={`tree-${i}`}>
            <PivotRectangle position={{ x: px + 95, y: H * 0.65 }}
              width={10} height={60} fill="#3e2723" />
            <PivotCircle center={{ x: px + 100, y: H * 0.63 }}
              radius={25} fill="#2e7d32" />
          </React.Fragment>
        );
      })}

      {/* ══════════════ TITLE SCREEN ══════════════ */}

      {gs.phase === 'title' && (
        <>
          <PivotRectangle position={{ x: 0, y: 0 }} width={W} height={H}
            fill="rgba(0,0,0,0.6)" />

          <PivotLabel text="💎 CRYSTAL CAVERNS"
            position={{ x: W / 2, y: H * 0.3 }}
            font={`bold ${Math.min(W * 0.06, 52)}px 'Segoe UI', sans-serif`}
            fill="#e040fb" textAlign="center" />

          <PivotLabel text="Collect all crystals to win!"
            position={{ x: W / 2, y: H * 0.42 }}
            font={`${Math.min(W * 0.025, 20)}px 'Segoe UI', sans-serif`}
            fill="#aaa" textAlign="center" />

          <PivotLabel text="A/D or ←/→ — Move    |    W/↑/Space — Jump"
            position={{ x: W / 2, y: H * 0.52 }}
            font={`${Math.min(W * 0.02, 16)}px monospace`}
            fill="#888" textAlign="center" />

          <PivotLabel text="Stomp enemies from above! Avoid spikes!"
            position={{ x: W / 2, y: H * 0.58 }}
            font={`${Math.min(W * 0.02, 16)}px monospace`}
            fill="#888" textAlign="center" />

          <PivotLabel text="Press ENTER or SPACE to Start"
            position={{ x: W / 2, y: H * 0.72 }}
            font={`bold ${Math.min(W * 0.03, 24)}px 'Segoe UI', sans-serif`}
            fill="#00e5ff" textAlign="center" />

          <PivotLabel text="ESC to exit"
            position={{ x: W / 2, y: H * 0.82 }}
            font={`${Math.min(W * 0.018, 14)}px monospace`}
            fill="#555" textAlign="center" />
        </>
      )}

      {/* ══════════════ GAMEPLAY ══════════════ */}

      {gs.phase !== 'title' && levelData && (
        <>
          {/* ── Tilemap ── */}
          {levelData.tileMap.map((row, rowIdx) =>
            row.map((tile, colIdx) => {
              if (tile < 0) return null;
              const pos = worldToScreen(colIdx * TILE_SIZE, rowIdx * TILE_SIZE);
              // Cull tiles outside viewport
              if (pos.x < -TILE_SIZE || pos.x > W + TILE_SIZE ||
                  pos.y < -TILE_SIZE || pos.y > H + TILE_SIZE) return null;

              return renderTile(tile, pos.x, pos.y, TILE_SIZE, rowIdx, colIdx);
            })
          )}

          {/* ── Crystals ── */}
          {crystals.filter(c => !c.collected).map((c, i) => {
            const pos = worldToScreen(c.x, c.y);
            if (pos.x < -30 || pos.x > W + 30 || pos.y < -30 || pos.y > H + 30) return null;
            const bob = Math.sin(c.bobTimer * 3) * 4;
            const sparkle = Math.sin(c.sparkleTimer * 5) * 0.3 + 0.7;

            return (
              <React.Fragment key={`crystal-${i}`}>
                {/* Glow */}
                <PivotCircle center={{ x: pos.x + 8, y: pos.y + 10 + bob }}
                  radius={14} fill={`${c.color}22`} />
                {/* Crystal body */}
                <PivotRectangle position={{ x: pos.x + 2, y: pos.y + 2 + bob }}
                  width={12} height={16}
                  fill={c.color} stroke={`${c.color}88`} lineWidth={1} />
                {/* Crystal highlight */}
                <PivotRectangle position={{ x: pos.x + 5, y: pos.y + 4 + bob }}
                  width={4} height={6}
                  fill={`rgba(255,255,255,${sparkle * 0.5})`} />
              </React.Fragment>
            );
          })}

          {/* ── Enemies ── */}
          {enemies.filter(e => e.active).map((e, i) => {
            const pos = worldToScreen(e.x, e.y);
            if (pos.x < -40 || pos.x > W + 40 || pos.y < -40 || pos.y > H + 40) return null;

            return renderEnemy(e, pos.x, pos.y, i);
          })}

          {/* ── Player ── */}
          {playerVisible && (() => {
            const pos = worldToScreen(p.x, p.y);
            return (
              <React.Fragment>
                {/* Body */}
                <PivotRectangle
                  position={{ x: pos.x, y: pos.y + 8 }}
                  width={p.width} height={p.height - 8}
                  fill={PLAYER_BODY_COLOR}
                  stroke={PLAYER_OUTLINE_COLOR} lineWidth={1} />
                {/* Head */}
                <PivotCircle
                  center={{ x: pos.x + p.width / 2, y: pos.y + 8 }}
                  radius={10}
                  fill={PLAYER_BODY_COLOR}
                  stroke={PLAYER_OUTLINE_COLOR} lineWidth={1} />
                {/* Eyes */}
                <PivotCircle
                  center={{
                    x: pos.x + (p.facingRight ? p.width / 2 + 4 : p.width / 2 - 4),
                    y: pos.y + 7,
                  }}
                  radius={3}
                  fill={PLAYER_EYE_COLOR} />
                <PivotCircle
                  center={{
                    x: pos.x + (p.facingRight ? p.width / 2 + 4 : p.width / 2 - 4),
                    y: pos.y + 7,
                  }}
                  radius={1.5}
                  fill="#333" />
              </React.Fragment>
            );
          })()}

          {/* ── Particles ── */}
          {particles.map((part, i) => {
            const pos = worldToScreen(part.x, part.y);
            const alpha = Math.max(0, part.life / part.maxLife);
            return (
              <PivotCircle key={`p-${i}`}
                center={{ x: pos.x, y: pos.y }}
                radius={part.size * alpha}
                fill={part.color} />
            );
          })}

          {/* ═══════ HUD ═══════ */}

          {/* HUD background bar */}
          <PivotRectangle position={{ x: 0, y: 0 }} width={W} height={44}
            fill={HUD_BG_COLOR} />

          {/* Health hearts */}
          {Array.from({ length: p.maxHealth }).map((_, i) => (
            <PivotCircle key={`hp-${i}`}
              center={{ x: 24 + i * 28, y: 22 }}
              radius={10}
              fill={i < p.health ? HEALTH_FULL_COLOR : HEALTH_EMPTY_COLOR}
              stroke="#333" lineWidth={1} />
          ))}

          {/* Crystal count */}
          <PivotLabel
            text={`💎 ${p.crystals} / ${gs.totalCrystals}`}
            position={{ x: 140, y: 22 }}
            font="bold 16px 'Segoe UI', sans-serif"
            fill="#e040fb" textAlign="left" />

          {/* Score */}
          <PivotLabel
            text={`Score: ${gs.score}`}
            position={{ x: W - 20, y: 22 }}
            font="bold 16px 'Segoe UI', sans-serif"
            fill={HUD_TEXT_COLOR} textAlign="right" />

          {/* Timer */}
          <PivotLabel
            text={formatTime(gs.playTime)}
            position={{ x: W / 2, y: 22 }}
            font="14px monospace"
            fill="#888" textAlign="center" />
        </>
      )}

      {/* ══════════════ GAME OVER ══════════════ */}

      {gs.phase === 'gameover' && (
        <>
          <PivotRectangle position={{ x: 0, y: 0 }} width={W} height={H}
            fill="rgba(0,0,0,0.7)" />
          <PivotLabel text="GAME OVER"
            position={{ x: W / 2, y: H * 0.35 }}
            font={`bold ${Math.min(W * 0.07, 56)}px 'Segoe UI', sans-serif`}
            fill="#ef5350" textAlign="center" />
          <PivotLabel text={`Score: ${gs.score}  |  Crystals: ${p.crystals}/${gs.totalCrystals}`}
            position={{ x: W / 2, y: H * 0.48 }}
            font={`${Math.min(W * 0.025, 20)}px 'Segoe UI', sans-serif`}
            fill="#ccc" textAlign="center" />
          <PivotLabel text="Press ENTER to Retry"
            position={{ x: W / 2, y: H * 0.62 }}
            font={`bold ${Math.min(W * 0.025, 22)}px 'Segoe UI', sans-serif`}
            fill="#00e5ff" textAlign="center" />
        </>
      )}

      {/* ══════════════ WIN SCREEN ══════════════ */}

      {gs.phase === 'win' && (
        <>
          <PivotRectangle position={{ x: 0, y: 0 }} width={W} height={H}
            fill="rgba(0,0,0,0.7)" />
          <PivotLabel text="🎉 YOU WIN!"
            position={{ x: W / 2, y: H * 0.3 }}
            font={`bold ${Math.min(W * 0.07, 56)}px 'Segoe UI', sans-serif`}
            fill="#76ff03" textAlign="center" />
          <PivotLabel text="All crystals collected!"
            position={{ x: W / 2, y: H * 0.42 }}
            font={`${Math.min(W * 0.025, 20)}px 'Segoe UI', sans-serif`}
            fill="#ccc" textAlign="center" />
          <PivotLabel text={`Score: ${gs.score}  |  Time: ${formatTime(gs.playTime)}`}
            position={{ x: W / 2, y: H * 0.52 }}
            font={`${Math.min(W * 0.025, 20)}px 'Segoe UI', sans-serif`}
            fill="#aaa" textAlign="center" />
          <PivotLabel text="Press ENTER to Play Again"
            position={{ x: W / 2, y: H * 0.66 }}
            font={`bold ${Math.min(W * 0.025, 22)}px 'Segoe UI', sans-serif`}
            fill="#00e5ff" textAlign="center" />
        </>
      )}

    </PivotCanvas>
  );
}

// ─── Tile Renderer ───────────────────────────────────────────────────────────

function renderTile(
  tileId: number, x: number, y: number, size: number,
  _row: number, _col: number,
): React.ReactNode {
  const key = `tile-${_row}-${_col}`;

  switch (tileId) {
    case 0: // ground top-left
      return (
        <React.Fragment key={key}>
          <PivotRectangle position={{ x, y }} width={size} height={size}
            fill={GROUND_COLOR} />
          <PivotRectangle position={{ x, y }} width={size} height={4}
            fill={GROUND_TOP_COLOR} />
        </React.Fragment>
      );
    case 1: // ground top-mid
      return (
        <React.Fragment key={key}>
          <PivotRectangle position={{ x, y }} width={size} height={size}
            fill={GROUND_COLOR} />
          <PivotRectangle position={{ x, y }} width={size} height={4}
            fill={GROUND_TOP_COLOR} />
          {/* Grass detail */}
          <PivotRectangle position={{ x: x + 4, y: y - 2 }} width={2} height={4}
            fill="#66bb6a" />
          <PivotRectangle position={{ x: x + size - 8, y: y - 3 }} width={2} height={5}
            fill="#81c784" />
        </React.Fragment>
      );
    case 2: // ground top-right
      return (
        <React.Fragment key={key}>
          <PivotRectangle position={{ x, y }} width={size} height={size}
            fill={GROUND_COLOR} />
          <PivotRectangle position={{ x, y }} width={size} height={4}
            fill={GROUND_TOP_COLOR} />
        </React.Fragment>
      );
    case 3: // ground fill-left
    case 4: // ground fill-mid
    case 5: // ground fill-right
      return (
        <React.Fragment key={key}>
          <PivotRectangle position={{ x, y }} width={size} height={size}
            fill={GROUND_COLOR} />
          {/* Dirt texture dots */}
          <PivotCircle center={{ x: x + 8, y: y + 12 }} radius={2} fill="#4e342e" />
          <PivotCircle center={{ x: x + 22, y: y + 20 }} radius={1.5} fill="#4e342e" />
        </React.Fragment>
      );
    case 6: // stone top
      return (
        <React.Fragment key={key}>
          <PivotRectangle position={{ x, y }} width={size} height={size}
            fill={STONE_COLOR} stroke={STONE_LIGHT_COLOR} lineWidth={1} />
          <PivotRectangle position={{ x, y }} width={size} height={3}
            fill={STONE_LIGHT_COLOR} />
        </React.Fragment>
      );
    case 7: // dark stone fill
      return (
        <PivotRectangle key={key} position={{ x, y }}
          width={size} height={size}
          fill="#37474f" stroke="#263238" lineWidth={1} />
      );
    case 9: // moss stone
      return (
        <React.Fragment key={key}>
          <PivotRectangle position={{ x, y }} width={size} height={size}
            fill={STONE_COLOR} />
          <PivotRectangle position={{ x: x + 2, y: y + 2 }} width={8} height={4}
            fill="#558b2f" />
        </React.Fragment>
      );
    default:
      return (
        <PivotRectangle key={key} position={{ x, y }}
          width={size} height={size} fill="#555" />
      );
  }
}

// ─── Enemy Renderer ──────────────────────────────────────────────────────────

function renderEnemy(
  e: { type: string; width: number; height: number; patrolDir: number; animTimer: number; color: string },
  x: number, y: number, idx: number,
): React.ReactNode {
  const key = `enemy-${idx}`;

  switch (e.type) {
    case 'slime': {
      const squish = Math.sin(e.animTimer * 4) * 2;
      return (
        <React.Fragment key={key}>
          {/* Body */}
          <PivotRectangle
            position={{ x: x - squish / 2, y: y + squish }}
            width={e.width + squish} height={e.height - squish}
            fill={SLIME_COLOR} />
          {/* Highlight */}
          <PivotCircle center={{ x: x + 8, y: y + 6 + squish }}
            radius={3} fill="rgba(255,255,255,0.3)" />
          {/* Eyes */}
          <PivotCircle
            center={{ x: x + (e.patrolDir > 0 ? 16 : 6), y: y + 6 + squish }}
            radius={3} fill="white" />
          <PivotCircle
            center={{ x: x + (e.patrolDir > 0 ? 17 : 5), y: y + 6 + squish }}
            radius={1.5} fill="#333" />
        </React.Fragment>
      );
    }
    case 'bat': {
      const wingFlap = Math.sin(e.animTimer * 12) * 6;
      return (
        <React.Fragment key={key}>
          {/* Wings */}
          <PivotRectangle
            position={{ x: x - 6, y: y + wingFlap }}
            width={10} height={6} fill={BAT_COLOR} />
          <PivotRectangle
            position={{ x: x + e.width - 4, y: y + wingFlap }}
            width={10} height={6} fill={BAT_COLOR} />
          {/* Body */}
          <PivotCircle center={{ x: x + e.width / 2, y: y + e.height / 2 }}
            radius={8} fill={BAT_COLOR} />
          {/* Eyes */}
          <PivotCircle center={{ x: x + 7, y: y + 6 }} radius={2} fill="#ff5252" />
          <PivotCircle center={{ x: x + 13, y: y + 6 }} radius={2} fill="#ff5252" />
        </React.Fragment>
      );
    }
    case 'spike':
      return (
        <React.Fragment key={key}>
          {/* Spike triangles (drawn as small rects) */}
          {[0, 1, 2].map(i => (
            <React.Fragment key={`spike-${idx}-${i}`}>
              <PivotRectangle
                position={{ x: x + i * 8 + 1, y: y }}
                width={6} height={12} fill={SPIKE_COLOR} />
              <PivotRectangle
                position={{ x: x + i * 8 + 2, y: y }}
                width={4} height={4} fill="#ff8a80" />
            </React.Fragment>
          ))}
        </React.Fragment>
      );
    default:
      return <PivotRectangle key={key} position={{ x, y }}
        width={e.width} height={e.height} fill={e.color} />;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
