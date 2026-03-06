/**
 * CRYSTAL CAVERNS — Particle System
 * Particle creation and update
 */

import { Particle } from '../types';
import {
  JUMP_DUST_COLOR, LAND_DUST_COLOR,
  CRYSTAL_SPARKLE_COLOR, DAMAGE_COLOR,
} from '../constants';

// ─── Update ──────────────────────────────────────────────────────────────────

export function updateParticles(particles: Particle[], dt: number): void {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 200 * dt; // gravity on particles
    p.life -= dt;

    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

// ─── Spawners ────────────────────────────────────────────────────────────────

export function spawnJumpDust(particles: Particle[], x: number, y: number): void {
  for (let i = 0; i < 6; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 80,
      vy: -Math.random() * 60 - 20,
      life: 0.3 + Math.random() * 0.2,
      maxLife: 0.5,
      color: JUMP_DUST_COLOR,
      size: 2 + Math.random() * 3,
    });
  }
}

export function spawnLandDust(particles: Particle[], x: number, y: number): void {
  for (let i = 0; i < 8; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 120,
      vy: -Math.random() * 40 - 10,
      life: 0.2 + Math.random() * 0.3,
      maxLife: 0.5,
      color: LAND_DUST_COLOR,
      size: 2 + Math.random() * 4,
    });
  }
}

export function spawnCrystalSparkle(particles: Particle[], x: number, y: number, color: string): void {
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 80;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 40,
      life: 0.4 + Math.random() * 0.4,
      maxLife: 0.8,
      color: Math.random() > 0.5 ? color : CRYSTAL_SPARKLE_COLOR,
      size: 2 + Math.random() * 3,
    });
  }
}

export function spawnDamageParticles(particles: Particle[], x: number, y: number): void {
  for (let i = 0; i < 10; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * 100;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 60,
      life: 0.3 + Math.random() * 0.3,
      maxLife: 0.6,
      color: DAMAGE_COLOR,
      size: 3 + Math.random() * 4,
    });
  }
}
