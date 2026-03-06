/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║                        AETHERDRIFT                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════╣
 * ║                                                                       ║
 * ║  In the floating ruins of Aethermere, the Aether Core has shattered. ║
 * ║  You are Lyra, an Aether Runner — the last of an order trained to    ║
 * ║  navigate temporal fractures. The sky-islands crumble, the depths    ║
 * ║  burn, and the void consumes. Three Core Shards must be reclaimed    ║
 * ║  from the Realm Guardians before reality collapses.                   ║
 * ║                                                                       ║
 * ║  REALMS:                                                              ║
 * ║    I.   Sky Ruins     — The Crumbling Heights                        ║
 * ║    II.  Ember Depths  — The Molten Forge                             ║
 * ║    III. Void Spire    — The Shattered Boundary                       ║
 * ║                                                                       ║
 * ║  CONTROLS:                                                            ║
 * ║    A/D or ←/→  Move          W/↑/Space  Jump (double-jump!)          ║
 * ║    X or J      Attack        Z or K     Dash                         ║
 * ║    ESC         Exit                                                   ║
 * ║                                                                       ║
 * ║  FEATURES:                                                            ║
 * ║    • Coyote time & jump buffering for responsive platforming          ║
 * ║    • Variable jump height, wall slide, wall jump, double jump        ║
 * ║    • Invincible dash with cooldown                                    ║
 * ║    • 3-hit sword combo with knockback                                 ║
 * ║    • 5 enemy types across 3 biomes                                    ║
 * ║    • 3 multi-phase boss fights                                        ║
 * ║    • Procedurally generated levels                                    ║
 * ║    • Collectible Chrono Shards + health pickups                       ║
 * ║    • Particle effects, screen shake, parallax backgrounds             ║
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
import { useAetherdrift } from './hooks/useAetherdrift';
import { worldToScreen } from './systems/camera';
import {
  PLAYER_BODY_COLOR, PLAYER_HAIR_COLOR, PLAYER_EYE_COLOR,
  PLAYER_CAPE_COLOR, PLAYER_SWORD_COLOR,
  HEALTH_FULL_COLOR, HEALTH_EMPTY_COLOR,
  SHARD_COLOR, HUD_TEXT_COLOR, HUD_BG_COLOR,
  REALMS, HEAL_COST, HEAL_COOLDOWN,
} from './constants';

export default function AetherdriftGame() {
  const {
    screenSize, gameState, player, camera, platforms, enemies,
    boss, collectibles, particles, projectiles, attacks,
    realm,
  } = useAetherdrift();

  const W = screenSize.width;
  const H = screenSize.height;
  const gs = gameState;
  const p = player;
  const cam = camera;

  // ── Parallax helper ────────────────────────────────────────────────────
  const parallax = (depth: number) => -cam.x * depth;

  // ── Flicker for invincibility ──────────────────────────────────────────
  const playerVisible = p.invincibleTimer <= 0 || Math.floor(p.invincibleTimer * 15) % 2 === 0;

  return (
    <div style={{ margin: 0, padding: 0, overflow: 'hidden', background: realm.bgGradient[0], width: '100vw', height: '100vh' }}>
    <PivotCanvas width={W} height={H} background={realm.bgGradient[0]}>

      {/* ══════════════ BACKGROUND LAYERS ══════════════ */}

      {/* Sky gradient */}
      <PivotRectangle position={{ x: 0, y: 0 }} width={W} height={H * 0.4}
        fill={realm.bgGradient[1]} />
      <PivotRectangle position={{ x: 0, y: H * 0.4 }} width={W} height={H * 0.6}
        fill={realm.bgGradient[2]} />

      {/* Distant mountains / structures (parallax 0.15) */}
      {[0, 1, 2, 3, 4, 5].map(i => {
        const bx = parallax(0.15) + i * 350;
        const by = H * 0.45 + Math.sin(i * 1.7) * 40;
        const bw = 120 + (i % 3) * 50;
        const bh = 80 + (i % 2) * 60;
        const wrapped = ((bx % (350 * 6)) + 350 * 6) % (350 * 6);
        return (
          <PivotRectangle key={`bg1-${i}`}
            position={{ x: wrapped, y: by }}
            width={bw} height={bh}
            fill={`${realm.platformColor}33`} />
        );
      })}

      {/* Mid-ground pillars (parallax 0.3) */}
      {[0, 1, 2, 3, 4].map(i => {
        const bx = parallax(0.3) + i * 500 + 100;
        const by = H * 0.55 + Math.sin(i * 2.3) * 30;
        const wrapped = ((bx % (500 * 5)) + 500 * 5) % (500 * 5);
        return (
          <PivotRectangle key={`bg2-${i}`}
            position={{ x: wrapped, y: by }}
            width={30 + (i % 3) * 15} height={60 + (i % 2) * 40}
            fill={`${realm.platformAccent}22`} />
        );
      })}

      {/* ══════════════ PLATFORMS ══════════════ */}

      {platforms.map((plat, i) => {
        if (plat.broken) return null;
        const { sx, sy } = worldToScreen(plat.x, plat.y, cam);
        // Frustum cull
        if (sx + plat.width < -50 || sx > W + 50) return null;
        if (sy + plat.height < -50 || sy > H + 50) return null;

        if (plat.type === 'spike') {
          return (
            <React.Fragment key={`plat-${i}`}>
              <PivotRectangle
                position={{ x: sx, y: sy }}
                width={plat.width} height={plat.height}
                fill="#cc3344" />
              {/* Spike triangles visual */}
              {Array.from({ length: Math.floor(plat.width / 10) }).map((_, si) => (
                <PivotCircle key={`spike-${i}-${si}`}
                  center={{ x: sx + si * 10 + 5, y: sy }}
                  radius={4} fill="#ff4455" />
              ))}
            </React.Fragment>
          );
        }

        const isBreaking = plat.type === 'breakable' && plat.stepped;
        return (
          <React.Fragment key={`plat-${i}`}>
            {/* Platform body */}
            <PivotRectangle
              position={{ x: sx, y: sy }}
              width={plat.width} height={plat.height}
              fill={isBreaking ? '#ff884488' : plat.color}
              stroke={plat.accentColor}
              lineWidth={1} />
            {/* Top accent line */}
            <PivotRectangle
              position={{ x: sx, y: sy }}
              width={plat.width} height={2}
              fill={plat.accentColor} />
          </React.Fragment>
        );
      })}

      {/* ══════════════ COLLECTIBLES ══════════════ */}

      {collectibles.filter(c => !c.collected).map((c, i) => {
        const bobY = Math.sin(c.bobPhase) * 4;
        const { sx, sy } = worldToScreen(c.x, c.y + bobY, cam);
        if (sx + c.width < -20 || sx > W + 20) return null;

        if (c.type === 'health') {
          return (
            <React.Fragment key={`col-${i}`}>
              <PivotCircle center={{ x: sx + c.width / 2, y: sy + c.height / 2 }}
                radius={c.width / 2 + 3} fill={`${c.glowColor}33`} />
              <PivotCircle center={{ x: sx + c.width / 2, y: sy + c.height / 2 }}
                radius={c.width / 2} fill={c.color} />
              <PivotLabel text="+" position={{ x: sx + c.width / 2, y: sy + c.height / 2 }}
                font="bold 10px Arial" fill="#fff" textAlign="center" />
            </React.Fragment>
          );
        }

        // Shard (diamond shape via rotated rendering)
        return (
          <React.Fragment key={`col-${i}`}>
            <PivotCircle center={{ x: sx + c.width / 2, y: sy + c.height / 2 }}
              radius={c.width / 2 + 4} fill={`${c.glowColor}22`} />
            <PivotRectangle
              position={{ x: sx + 2, y: sy + 2 }}
              width={c.width - 4} height={c.height - 4}
              fill={c.color} stroke={c.glowColor} lineWidth={1} />
          </React.Fragment>
        );
      })}

      {/* ══════════════ ENEMIES ══════════════ */}

      {enemies.filter(e => e.active).map((e, i) => {
        const { sx, sy } = worldToScreen(e.x, e.y, cam);
        if (sx + e.width < -30 || sx > W + 30) return null;

        const flash = e.hitFlashTimer > 0;
        const color = flash ? '#ffffff' : e.color;
        const cx = sx + e.width / 2;
        const cy = sy + e.height / 2;

        switch (e.type) {
          case 'sprite':
            return (
              <React.Fragment key={`en-${i}`}>
                <PivotCircle center={{ x: cx, y: cy }} radius={e.width / 2 + 3}
                  fill={`${e.glowColor}44`} />
                <PivotCircle center={{ x: cx, y: cy }} radius={e.width / 2}
                  fill={color} />
                <PivotCircle center={{ x: cx - 3, y: cy - 2 }} radius={2}
                  fill="#fff" />
                <PivotCircle center={{ x: cx + 3, y: cy - 2 }} radius={2}
                  fill="#fff" />
              </React.Fragment>
            );
          case 'crawler':
            return (
              <React.Fragment key={`en-${i}`}>
                <PivotRectangle position={{ x: sx, y: sy }}
                  width={e.width} height={e.height}
                  fill={color} stroke={e.glowColor} lineWidth={1} />
                <PivotCircle center={{ x: sx + 5, y: sy + 4 }} radius={2}
                  fill="#ffff00" />
                <PivotCircle center={{ x: sx + e.width - 5, y: sy + 4 }} radius={2}
                  fill="#ffff00" />
              </React.Fragment>
            );
          case 'firewisp':
            return (
              <React.Fragment key={`en-${i}`}>
                <PivotCircle center={{ x: cx, y: cy }} radius={e.width / 2 + 5}
                  fill={`${e.glowColor}33`} />
                <PivotCircle center={{ x: cx, y: cy }} radius={e.width / 2 + 2}
                  fill={`${e.color}88`} />
                <PivotCircle center={{ x: cx, y: cy }} radius={e.width / 2 - 1}
                  fill={color} />
              </React.Fragment>
            );
          case 'magmaslug':
            return (
              <React.Fragment key={`en-${i}`}>
                <PivotRectangle position={{ x: sx, y: sy }}
                  width={e.width} height={e.height}
                  fill={color} />
                <PivotRectangle position={{ x: sx, y: sy }}
                  width={e.width} height={4}
                  fill={e.glowColor} />
                <PivotCircle center={{ x: sx + 6, y: sy + 8 }} radius={2}
                  fill="#ffcc00" />
                <PivotCircle center={{ x: sx + e.width - 6, y: sy + 8 }} radius={2}
                  fill="#ffcc00" />
              </React.Fragment>
            );
          case 'voidshade':
            return (
              <React.Fragment key={`en-${i}`}>
                <PivotCircle center={{ x: cx, y: cy }} radius={16}
                  fill={`${e.glowColor}22`} />
                <PivotRectangle position={{ x: sx, y: sy }}
                  width={e.width} height={e.height}
                  fill={`${color}cc`} />
                <PivotCircle center={{ x: cx, y: sy + 6 }} radius={3}
                  fill="#ff44ff" />
                {/* Cape trail */}
                <PivotRectangle
                  position={{ x: sx + 4, y: sy + e.height - 6 }}
                  width={e.width - 8} height={8}
                  fill={`${e.glowColor}66`} />
              </React.Fragment>
            );
          default:
            return null;
        }
      })}

      {/* ══════════════ BOSS ══════════════ */}

      {boss && boss.active && (() => {
        const b = boss;
        const { sx, sy } = worldToScreen(b.x, b.y, cam);
        const flash = b.hitFlashTimer > 0;
        const color = flash ? '#ffffff' : b.color;
        const cx = sx + b.width / 2;
        const cy = sy + b.height / 2;

        return (
          <React.Fragment>
            {/* Glow aura */}
            <PivotCircle center={{ x: cx, y: cy }}
              radius={Math.max(b.width, b.height) * 0.7}
              fill={`${b.glowColor}18`} />

            {/* Body */}
            <PivotRectangle position={{ x: sx, y: sy }}
              width={b.width} height={b.height}
              fill={color} stroke={b.glowColor} lineWidth={2} />

            {/* Eyes */}
            <PivotCircle
              center={{ x: cx - b.width * 0.2, y: sy + b.height * 0.25 }}
              radius={5} fill="#ff4444" />
            <PivotCircle
              center={{ x: cx + b.width * 0.2, y: sy + b.height * 0.25 }}
              radius={5} fill="#ff4444" />

            {/* Core/weak point */}
            <PivotCircle center={{ x: cx, y: cy + 5 }}
              radius={8} fill={b.glowColor}
              stroke="#fff" lineWidth={1} />

            {/* Phase 2+ indicator */}
            {b.phase >= 1 && (
              <PivotCircle center={{ x: cx, y: sy - 12 }}
                radius={6}
                fill={b.phase >= 2 ? '#ff2222' : '#ffaa00'}
                stroke="#fff" lineWidth={1} />
            )}

            {/* Boss health bar */}
            <PivotRectangle
              position={{ x: sx - 10, y: sy - 24 }}
              width={b.width + 20} height={8}
              fill="#22222288" stroke="#666" lineWidth={1} />
            <PivotRectangle
              position={{ x: sx - 10, y: sy - 24 }}
              width={(b.width + 20) * Math.max(0, b.health / b.maxHealth)}
              height={8}
              fill={b.health / b.maxHealth > 0.3 ? '#ff4444' : '#ff2222'} />
          </React.Fragment>
        );
      })()}

      {/* ══════════════ PROJECTILES ══════════════ */}

      {projectiles.map((proj, i) => {
        const { sx, sy } = worldToScreen(proj.x, proj.y, cam);
        return (
          <React.Fragment key={`proj-${i}`}>
            <PivotCircle center={{ x: sx, y: sy }}
              radius={proj.size + 2} fill={`${proj.color}44`} />
            <PivotCircle center={{ x: sx, y: sy }}
              radius={proj.size} fill={proj.color} />
          </React.Fragment>
        );
      })}

      {/* ══════════════ PLAYER ══════════════ */}

      {playerVisible && (() => {
        const { sx, sy } = worldToScreen(p.x, p.y, cam);
        const cx = sx + p.width / 2;
        const dir = p.facingRight ? 1 : -1;

        return (
          <React.Fragment>
            {/* Cape / scarf trail */}
            <PivotRectangle
              position={{
                x: p.facingRight ? sx - 8 : sx + p.width,
                y: sy + 4,
              }}
              width={10} height={p.height - 8}
              fill={`${PLAYER_CAPE_COLOR}88`} />

            {/* Body */}
            <PivotRectangle
              position={{ x: sx, y: sy + 8 }}
              width={p.width} height={p.height - 8}
              fill={PLAYER_BODY_COLOR} />

            {/* Head */}
            <PivotCircle
              center={{ x: cx, y: sy + 6 }}
              radius={8}
              fill={PLAYER_BODY_COLOR} />

            {/* Hair */}
            <PivotCircle
              center={{ x: cx - dir * 2, y: sy + 2 }}
              radius={6}
              fill={PLAYER_HAIR_COLOR} />

            {/* Eye */}
            <PivotCircle
              center={{ x: cx + dir * 3, y: sy + 6 }}
              radius={2}
              fill={PLAYER_EYE_COLOR} />

            {/* Dash effect */}
            {p.isDashing && (
              <PivotRectangle
                position={{
                  x: p.facingRight ? sx - 20 : sx + p.width,
                  y: sy + 5,
                }}
                width={20}
                height={p.height - 10}
                fill={`${PLAYER_CAPE_COLOR}44`} />
            )}

            {/* Attack sword */}
            {p.isAttacking && (
              <React.Fragment>
                <PivotRectangle
                  position={{
                    x: p.facingRight ? sx + p.width : sx - 26,
                    y: sy + 6 + (p.attackCombo * 4),
                  }}
                  width={26}
                  height={4}
                  fill={PLAYER_SWORD_COLOR} />
                {/* Slash arc */}
                <PivotCircle
                  center={{
                    x: p.facingRight ? sx + p.width + 20 : sx - 20,
                    y: sy + p.height / 2,
                  }}
                  radius={12}
                  fill={`${PLAYER_SWORD_COLOR}33`} />
              </React.Fragment>
            )}

            {/* Wall slide indicator */}
            {p.isWallSliding && (
              <PivotRectangle
                position={{
                  x: p.wallDir < 0 ? sx - 4 : sx + p.width,
                  y: sy + 8,
                }}
                width={4} height={p.height - 12}
                fill="#ffffff44" />
            )}

            {/* Heal glow */}
            {p.healTimer > 0 && (
              <React.Fragment>
                <PivotCircle
                  center={{ x: sx + p.width / 2, y: sy + p.height / 2 }}
                  radius={p.height * 0.7 * (p.healTimer / 0.5)}
                  fill={`rgba(68,255,136,${0.15 * (p.healTimer / 0.5)})`}
                  stroke={`rgba(68,255,136,${0.4 * (p.healTimer / 0.5)})`}
                  lineWidth={2} />
                <PivotLabel
                  text="+1"
                  position={{ x: sx + p.width / 2, y: sy - 10 - (0.5 - p.healTimer) * 30 }}
                  font="bold 14px 'Courier New'"
                  fill={`rgba(68,255,136,${Math.min(1, p.healTimer * 3)})`}
                  textAlign="center" />
              </React.Fragment>
            )}
          </React.Fragment>
        );
      })()}

      {/* ══════════════ ATTACK HITBOXES (debug-style flash) ══════════════ */}

      {attacks.map((atk, i) => {
        const { sx, sy } = worldToScreen(atk.x, atk.y, cam);
        return (
          <PivotRectangle key={`atk-${i}`}
            position={{ x: sx, y: sy }}
            width={atk.width} height={atk.height}
            fill={`${PLAYER_SWORD_COLOR}22`} />
        );
      })}

      {/* ══════════════ PARTICLES ══════════════ */}

      {particles.map((part, i) => {
        const { sx, sy } = worldToScreen(part.x, part.y, cam);
        if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) return null;
        const alpha = Math.min(1, part.life / part.maxLife);
        const size = part.size * alpha;

        if (part.shape === 'circle') {
          return (
            <PivotCircle key={`part-${i}`}
              center={{ x: sx, y: sy }}
              radius={size}
              fill={part.color} />
          );
        }
        return (
          <PivotRectangle key={`part-${i}`}
            position={{ x: sx - size / 2, y: sy - size / 2 }}
            width={size} height={size}
            fill={part.color} />
        );
      })}

      {/* ══════════════ HUD ══════════════ */}

      {(gs.phase === 'playing' || gs.phase === 'boss') && (
        <React.Fragment>
          {/* HUD Background */}
          <PivotRectangle
            position={{ x: 0, y: 0 }}
            width={W} height={50}
            fill={HUD_BG_COLOR} />

          {/* Health hearts */}
          {Array.from({ length: p.maxHealth }).map((_, i) => (
            <PivotCircle key={`heart-${i}`}
              center={{ x: 30 + i * 26, y: 25 }}
              radius={9}
              fill={i < p.health ? HEALTH_FULL_COLOR : HEALTH_EMPTY_COLOR}
              stroke={i < p.health ? '#ff7777' : '#555'}
              lineWidth={1} />
          ))}

          {/* Chrono shards count */}
          <PivotRectangle
            position={{ x: 30 + p.maxHealth * 26 + 10, y: 14 }}
            width={12} height={16}
            fill={SHARD_COLOR} />
          <PivotLabel
            text={`× ${p.chronoShards}`}
            position={{ x: 30 + p.maxHealth * 26 + 32, y: 24 }}
            font="bold 14px 'Courier New'"
            fill={HUD_TEXT_COLOR} textAlign="left" />

          {/* Score */}
          <PivotLabel
            text={`SCORE: ${gs.score}`}
            position={{ x: W - 20, y: 18 }}
            font="bold 14px 'Courier New'"
            fill={HUD_TEXT_COLOR} textAlign="right" />

          {/* Realm name */}
          <PivotLabel
            text={realm.name.toUpperCase()}
            position={{ x: W - 20, y: 38 }}
            font="11px 'Courier New'"
            fill={realm.platformAccent} textAlign="right" />

          {/* Dash cooldown indicator */}
          {p.dashCooldown > 0 && (
            <PivotRectangle
              position={{ x: 14, y: 44 }}
              width={80 * (1 - p.dashCooldown / 0.5)} height={3}
              fill={PLAYER_CAPE_COLOR} />
          )}
          {p.dashCooldown <= 0 && (
            <PivotLabel
              text="DASH ✓"
              position={{ x: 14, y: 46 }}
              font="9px 'Courier New'"
              fill="#8be9fd" textAlign="left" />
          )}

          {/* Heal cooldown indicator */}
          {p.healCooldown > 0 && (
            <PivotRectangle
              position={{ x: 100, y: 44 }}
              width={80 * (1 - p.healCooldown / HEAL_COOLDOWN)} height={3}
              fill="#44ff88" />
          )}
          {p.healCooldown <= 0 && p.chronoShards >= HEAL_COST && p.health < p.maxHealth && (
            <PivotLabel
              text={`HEAL ✓ (${HEAL_COST}◆)`}
              position={{ x: 100, y: 46 }}
              font="9px 'Courier New'"
              fill="#44ff88" textAlign="left" />
          )}
          {p.healCooldown <= 0 && (p.chronoShards < HEAL_COST || p.health >= p.maxHealth) && (
            <PivotLabel
              text={p.health >= p.maxHealth ? "HEAL (FULL)" : `HEAL (${HEAL_COST}◆)`}
              position={{ x: 100, y: 46 }}
              font="9px 'Courier New'"
              fill="#555" textAlign="left" />
          )}

          {/* Boss health (large bar at top) */}
          {gs.phase === 'boss' && boss && boss.active && (
            <React.Fragment>
              <PivotRectangle
                position={{ x: W * 0.2, y: H - 40 }}
                width={W * 0.6} height={12}
                fill="#22222288" stroke="#666" lineWidth={1} />
              <PivotRectangle
                position={{ x: W * 0.2, y: H - 40 }}
                width={W * 0.6 * Math.max(0, boss.health / boss.maxHealth)}
                height={12}
                fill={boss.health / boss.maxHealth > 0.3 ? '#dd4444' : '#ff2222'} />
              <PivotLabel
                text={`${REALMS[gs.currentRealm].bossType === 'colossus' ? 'STONE COLOSSUS' : REALMS[gs.currentRealm].bossType === 'drake' ? 'INFERNAL DRAKE' : 'AETHER DEVOURER'}`}
                position={{ x: W / 2, y: H - 56 }}
                font="bold 14px 'Courier New'"
                fill="#ff6666" textAlign="center" />
            </React.Fragment>
          )}

          {/* Kill counter */}
          <PivotLabel
            text={`KILLS: ${p.totalKills}`}
            position={{ x: W / 2, y: 24 }}
            font="11px 'Courier New'"
            fill="#888" textAlign="center" />
        </React.Fragment>
      )}

      {/* ══════════════ TITLE SCREEN ══════════════ */}

      {gs.phase === 'title' && (
        <React.Fragment>
          <PivotRectangle position={{ x: 0, y: 0 }} width={W} height={H}
            fill="#0a0a1acc" />

          {/* Floating ambient shapes */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
            <PivotCircle key={`title-orb-${i}`}
              center={{
                x: W * 0.15 + i * W * 0.1,
                y: H * 0.3 + Math.sin(Date.now() / 1000 + i) * 30,
              }}
              radius={3 + i % 3 * 2}
              fill={['#66ccff33', '#bd93f933', '#ff79c633'][i % 3]} />
          ))}

          <PivotLabel
            text="AETHERDRIFT"
            position={{ x: W / 2, y: H * 0.28 }}
            font={`bold ${Math.min(72, W * 0.08)}px 'Courier New'`}
            fill="#d4e0ff" textAlign="center" />

          <PivotLabel
            text="— The Shattered Core —"
            position={{ x: W / 2, y: H * 0.35 }}
            font={`${Math.min(20, W * 0.025)}px 'Courier New'`}
            fill="#8be9fd" textAlign="center" />

          {/* Story blurb */}
          <PivotLabel
            text="The sky-islands crumble. The Aether Core lies shattered."
            position={{ x: W / 2, y: H * 0.48 }}
            font="14px 'Courier New'"
            fill="#888" textAlign="center" />
          <PivotLabel
            text="Three realms. Three guardians. One last Aether Runner."
            position={{ x: W / 2, y: H * 0.52 }}
            font="14px 'Courier New'"
            fill="#888" textAlign="center" />

          {/* Controls */}
          <PivotLabel
            text="MOVE: A/D or ←/→    JUMP: W/Space    ATTACK: X    DASH: Z"
            position={{ x: W / 2, y: H * 0.63 }}
            font="12px 'Courier New'"
            fill="#666" textAlign="center" />

          <PivotLabel
            text={`HEAL: C or L (costs ${HEAL_COST} shards)    ESC: Exit`}
            position={{ x: W / 2, y: H * 0.68 }}
            font="12px 'Courier New'"
            fill="#666" textAlign="center" />

          <PivotLabel
            text="[ PRESS ENTER OR SPACE TO BEGIN ]"
            position={{ x: W / 2, y: H * 0.76 }}
            font={`bold 16px 'Courier New'`}
            fill={Math.floor(Date.now() / 600) % 2 === 0 ? '#00ccff' : '#0088aa'}
            textAlign="center" />

          <PivotLabel
            text="ESC to exit"
            position={{ x: W / 2, y: H * 0.85 }}
            font="11px 'Courier New'"
            fill="#444" textAlign="center" />
        </React.Fragment>
      )}

      {/* ══════════════ REALM INTRO ══════════════ */}

      {gs.phase === 'realm_intro' && (
        <React.Fragment>
          <PivotRectangle position={{ x: 0, y: 0 }} width={W} height={H}
            fill="#000000cc" />

          <PivotLabel
            text={`REALM ${gs.currentRealm + 1}`}
            position={{ x: W / 2, y: H * 0.35 }}
            font="bold 18px 'Courier New'"
            fill={realm.platformAccent} textAlign="center" />

          <PivotLabel
            text={realm.name.toUpperCase()}
            position={{ x: W / 2, y: H * 0.45 }}
            font={`bold ${Math.min(48, W * 0.06)}px 'Courier New'`}
            fill="#d4e0ff" textAlign="center" />

          <PivotLabel
            text={realm.subtitle}
            position={{ x: W / 2, y: H * 0.54 }}
            font="16px 'Courier New'"
            fill="#888" textAlign="center" />
        </React.Fragment>
      )}

      {/* ══════════════ BOSS INTRO ══════════════ */}

      {gs.phase === 'boss_intro' && (
        <React.Fragment>
          <PivotRectangle position={{ x: 0, y: 0 }} width={W} height={H}
            fill="#00000088" />
          <PivotLabel
            text="⚠ GUARDIAN APPROACHES ⚠"
            position={{ x: W / 2, y: H * 0.4 }}
            font="bold 28px 'Courier New'"
            fill="#ff4444" textAlign="center" />
          <PivotLabel
            text={realm.bossType === 'colossus' ? 'STONE COLOSSUS'
              : realm.bossType === 'drake' ? 'INFERNAL DRAKE'
              : 'AETHER DEVOURER'}
            position={{ x: W / 2, y: H * 0.52 }}
            font={`bold ${Math.min(36, W * 0.05)}px 'Courier New'`}
            fill="#ffcc44" textAlign="center" />
        </React.Fragment>
      )}

      {/* ══════════════ REALM CLEAR ══════════════ */}

      {gs.phase === 'realm_clear' && (
        <React.Fragment>
          <PivotRectangle position={{ x: 0, y: 0 }} width={W} height={H}
            fill="#000000cc" />

          <PivotLabel
            text="REALM CLEARED!"
            position={{ x: W / 2, y: H * 0.3 }}
            font="bold 36px 'Courier New'"
            fill="#44ff88" textAlign="center" />

          <PivotLabel
            text={`${realm.name} Guardian Defeated`}
            position={{ x: W / 2, y: H * 0.4 }}
            font="18px 'Courier New'"
            fill="#aaa" textAlign="center" />

          <PivotLabel
            text={`Chrono Shards: ${p.chronoShards}    Score: ${gs.score}    Kills: ${p.totalKills}`}
            position={{ x: W / 2, y: H * 0.52 }}
            font="14px 'Courier New'"
            fill="#888" textAlign="center" />

          <PivotLabel
            text={gs.currentRealm < 2
              ? "[ PRESS ENTER TO CONTINUE ]"
              : "[ PRESS ENTER FOR FINAL RESULTS ]"}
            position={{ x: W / 2, y: H * 0.68 }}
            font="bold 16px 'Courier New'"
            fill={Math.floor(Date.now() / 600) % 2 === 0 ? '#00ccff' : '#0088aa'}
            textAlign="center" />
        </React.Fragment>
      )}

      {/* ══════════════ GAME OVER ══════════════ */}

      {gs.phase === 'game_over' && (
        <React.Fragment>
          <PivotRectangle position={{ x: 0, y: 0 }} width={W} height={H}
            fill="#000000dd" />

          <PivotLabel
            text="AETHER FADED"
            position={{ x: W / 2, y: H * 0.3 }}
            font="bold 42px 'Courier New'"
            fill="#ff4455" textAlign="center" />

          <PivotLabel
            text="The sky-islands fall into silence..."
            position={{ x: W / 2, y: H * 0.4 }}
            font="16px 'Courier New'"
            fill="#888" textAlign="center" />

          <PivotLabel
            text={`Score: ${gs.score}    Shards: ${p.chronoShards}    Kills: ${p.totalKills}`}
            position={{ x: W / 2, y: H * 0.54 }}
            font="14px 'Courier New'"
            fill="#aaa" textAlign="center" />

          <PivotLabel
            text={`Realms Cleared: ${gs.realmsCompleted.filter(Boolean).length} / 3`}
            position={{ x: W / 2, y: H * 0.60 }}
            font="14px 'Courier New'"
            fill={realm.platformAccent} textAlign="center" />

          <PivotLabel
            text="[ PRESS ENTER TO RETRY ]"
            position={{ x: W / 2, y: H * 0.74 }}
            font="bold 16px 'Courier New'"
            fill={Math.floor(Date.now() / 600) % 2 === 0 ? '#00ccff' : '#0088aa'}
            textAlign="center" />
        </React.Fragment>
      )}

      {/* ══════════════ VICTORY ══════════════ */}

      {gs.phase === 'victory' && (
        <React.Fragment>
          <PivotRectangle position={{ x: 0, y: 0 }} width={W} height={H}
            fill="#0a0a2aee" />

          <PivotLabel
            text="✦ AETHER RESTORED ✦"
            position={{ x: W / 2, y: H * 0.22 }}
            font={`bold ${Math.min(44, W * 0.06)}px 'Courier New'`}
            fill="#8be9fd" textAlign="center" />

          <PivotLabel
            text="The Chrono Core is whole once more."
            position={{ x: W / 2, y: H * 0.33 }}
            font="18px 'Courier New'"
            fill="#bd93f9" textAlign="center" />

          <PivotLabel
            text="The sky-islands rise. Time flows unbroken."
            position={{ x: W / 2, y: H * 0.39 }}
            font="16px 'Courier New'"
            fill="#888" textAlign="center" />

          <PivotLabel
            text={`FINAL SCORE: ${gs.score}`}
            position={{ x: W / 2, y: H * 0.52 }}
            font="bold 24px 'Courier New'"
            fill="#f1fa8c" textAlign="center" />

          <PivotLabel
            text={`Chrono Shards: ${p.chronoShards}    Total Kills: ${p.totalKills}`}
            position={{ x: W / 2, y: H * 0.60 }}
            font="14px 'Courier New'"
            fill="#aaa" textAlign="center" />

          <PivotLabel
            text={`Play Time: ${Math.floor(gs.playTime / 60)}m ${Math.floor(gs.playTime % 60)}s`}
            position={{ x: W / 2, y: H * 0.66 }}
            font="14px 'Courier New'"
            fill="#888" textAlign="center" />

          <PivotLabel
            text="[ PRESS ENTER TO PLAY AGAIN ]"
            position={{ x: W / 2, y: H * 0.80 }}
            font="bold 16px 'Courier New'"
            fill={Math.floor(Date.now() / 600) % 2 === 0 ? '#00ccff' : '#0088aa'}
            textAlign="center" />
        </React.Fragment>
      )}

    </PivotCanvas>
    </div>
  );
}
