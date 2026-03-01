/**
 * AETHERDRIFT — Particle System
 * Creation & update of particle effects
 */

import { Particle } from '../types';
import { GRAVITY } from '../constants';

// ─── Update ──────────────────────────────────────────────────────────────────

export function updateParticles(particles: Particle[], dt: number) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.gravity) p.vy += GRAVITY * 0.5 * dt;
    p.life -= dt;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

// ─── Spawners ────────────────────────────────────────────────────────────────

export function spawnJumpDust(particles: Particle[], x: number, y: number) {
  for (let i = 0; i < 5; i++) {
    particles.push({
      x: x + (Math.random() - 0.5) * 16,
      y,
      vx: (Math.random() - 0.5) * 60,
      vy: -20 - Math.random() * 40,
      life: 0.3 + Math.random() * 0.2,
      maxLife: 0.5,
      color: '#ffffff66',
      size: 2 + Math.random() * 3,
      gravity: false,
      shape: 'circle',
    });
  }
}

export function spawnLandDust(particles: Particle[], x: number, y: number) {
  for (let i = 0; i < 8; i++) {
    particles.push({
      x: x + (Math.random() - 0.5) * 20,
      y,
      vx: (Math.random() - 0.5) * 100,
      vy: -10 - Math.random() * 30,
      life: 0.2 + Math.random() * 0.3,
      maxLife: 0.5,
      color: '#aaaaaa44',
      size: 3 + Math.random() * 3,
      gravity: false,
      shape: 'rect',
    });
  }
}

export function spawnDashTrail(particles: Particle[], x: number, y: number, h: number, color: string) {
  for (let i = 0; i < 3; i++) {
    particles.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y + Math.random() * h,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.5) * 20,
      life: 0.15 + Math.random() * 0.15,
      maxLife: 0.3,
      color,
      size: 4 + Math.random() * 6,
      gravity: false,
      shape: 'rect',
    });
  }
}

export function spawnHitSparks(particles: Particle[], x: number, y: number, color: string) {
  for (let i = 0; i < 10; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * 120;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.2 + Math.random() * 0.3,
      maxLife: 0.5,
      color,
      size: 2 + Math.random() * 3,
      gravity: true,
      shape: 'circle',
    });
  }
}

export function spawnDeathBurst(particles: Particle[], x: number, y: number, color: string) {
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 50 + Math.random() * 200;
    particles.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 50,
      life: 0.3 + Math.random() * 0.5,
      maxLife: 0.8,
      color,
      size: 3 + Math.random() * 5,
      gravity: true,
      shape: Math.random() > 0.5 ? 'circle' : 'rect',
    });
  }
}

export function spawnCollectSparkle(particles: Particle[], x: number, y: number, color: string) {
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 80;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 40,
      life: 0.3 + Math.random() * 0.4,
      maxLife: 0.7,
      color,
      size: 2 + Math.random() * 3,
      gravity: false,
      shape: 'circle',
    });
  }
}

export function spawnAmbientParticle(particles: Particle[], color: string, screenW: number, screenH: number, camX: number, camY: number) {
  particles.push({
    x: camX + Math.random() * screenW,
    y: camY + Math.random() * screenH,
    vx: (Math.random() - 0.5) * 15,
    vy: -8 - Math.random() * 12,
    life: 2 + Math.random() * 3,
    maxLife: 5,
    color,
    size: 1 + Math.random() * 3,
    gravity: false,
    shape: 'circle',
  });
}

export function spawnShockwave(particles: Particle[], x: number, y: number, color: string) {
  for (let i = 0; i < 15; i++) {
    const dir = i < 8 ? -1 : 1;
    particles.push({
      x: x + dir * (i % 8) * 25,
      y: y - 2,
      vx: dir * (40 + Math.random() * 60),
      vy: -30 - Math.random() * 50,
      life: 0.2 + Math.random() * 0.2,
      maxLife: 0.4,
      color,
      size: 4 + Math.random() * 4,
      gravity: true,
      shape: 'rect',
    });
  }
}

export function spawnBossProjectileTrail(particles: Particle[], x: number, y: number, color: string) {
  particles.push({
    x: x + (Math.random() - 0.5) * 6,
    y: y + (Math.random() - 0.5) * 6,
    vx: (Math.random() - 0.5) * 20,
    vy: (Math.random() - 0.5) * 20,
    life: 0.15 + Math.random() * 0.1,
    maxLife: 0.25,
    color,
    size: 2 + Math.random() * 3,
    gravity: false,
    shape: 'circle',
  });
}

export function spawnHealEffect(particles: Particle[], x: number, y: number) {
  for (let i = 0; i < 16; i++) {
    const angle = (Math.PI * 2 / 16) * i;
    const speed = 30 + Math.random() * 50;
    particles.push({
      x: x + Math.cos(angle) * 12,
      y: y + Math.sin(angle) * 12,
      vx: Math.cos(angle) * speed * 0.3,
      vy: -30 - Math.random() * 60,
      life: 0.4 + Math.random() * 0.4,
      maxLife: 0.8,
      color: i % 2 === 0 ? '#44ff8866' : '#88ffbb66',
      size: 3 + Math.random() * 3,
      gravity: false,
      shape: 'circle',
    });
  }
}
