/**
 * CRYSTAL CAVERNS — Camera System
 * Smooth follow and screen shake
 */

import { CameraState } from '../types';
import { CAMERA_SMOOTH, CAMERA_SHAKE_DECAY } from '../constants';

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createCamera(): CameraState {
  return {
    x: 0, y: 0,
    targetX: 0, targetY: 0,
    shakeAmount: 0,
    shakeX: 0, shakeY: 0,
  };
}

// ─── Update ──────────────────────────────────────────────────────────────────

export function updateCamera(
  cam: CameraState,
  targetX: number,
  targetY: number,
  viewW: number,
  viewH: number,
  worldW: number,
  worldH: number,
): void {
  // Desired camera position (centre target on screen)
  cam.targetX = targetX - viewW / 2;
  cam.targetY = targetY - viewH / 2;

  // Smooth lerp
  cam.x += (cam.targetX - cam.x) * CAMERA_SMOOTH;
  cam.y += (cam.targetY - cam.y) * CAMERA_SMOOTH;

  // Clamp to world bounds
  cam.x = Math.max(0, Math.min(cam.x, worldW - viewW));
  cam.y = Math.max(0, Math.min(cam.y, worldH - viewH));

  // Screen shake
  if (cam.shakeAmount > 0.1) {
    cam.shakeX = (Math.random() - 0.5) * cam.shakeAmount;
    cam.shakeY = (Math.random() - 0.5) * cam.shakeAmount;
    cam.shakeAmount *= CAMERA_SHAKE_DECAY;
  } else {
    cam.shakeX = 0;
    cam.shakeY = 0;
    cam.shakeAmount = 0;
  }
}

// ─── Shake ───────────────────────────────────────────────────────────────────

export function addScreenShake(cam: CameraState, amount: number): void {
  cam.shakeAmount = Math.min(20, cam.shakeAmount + amount);
}

// ─── World-to-Screen Transform ───────────────────────────────────────────────

export function worldToScreen(
  worldX: number,
  worldY: number,
  cam: CameraState,
): { x: number; y: number } {
  return {
    x: worldX - cam.x + cam.shakeX,
    y: worldY - cam.y + cam.shakeY,
  };
}
