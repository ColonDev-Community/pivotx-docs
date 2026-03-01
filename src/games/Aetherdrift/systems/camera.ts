/**
 * AETHERDRIFT — Camera System
 * Smooth follow, look-ahead, screen shake
 */

import { Camera, PlayerState } from '../types';
import { CAMERA_SMOOTH, CAMERA_LOOK_AHEAD, CAMERA_VERTICAL_OFFSET } from '../constants';
import { lerp } from './physics';

export function createCamera(): Camera {
  return {
    x: 0, y: 0,
    targetX: 0, targetY: 0,
    shakeAmount: 0,
    shakeDecay: 0.9,
  };
}

export function updateCamera(
  cam: Camera,
  player: PlayerState,
  dt: number,
  screenW: number,
  screenH: number,
  levelWidth: number,
  groundY: number,
) {
  // Target: player center with look-ahead
  const lookAhead = player.facingRight ? CAMERA_LOOK_AHEAD : -CAMERA_LOOK_AHEAD;
  cam.targetX = player.x + player.width / 2 - screenW / 2 + lookAhead;
  cam.targetY = player.y + player.height / 2 - screenH / 2 + CAMERA_VERTICAL_OFFSET;

  // Smooth follow
  const smoothFactor = 1 - Math.exp(-CAMERA_SMOOTH * dt);
  cam.x = lerp(cam.x, cam.targetX, smoothFactor);
  cam.y = lerp(cam.y, cam.targetY, smoothFactor);

  // Clamp to level bounds
  cam.x = Math.max(0, Math.min(levelWidth - screenW, cam.x));
  cam.y = Math.max(0, Math.min(groundY + 100 - screenH, cam.y));

  // Screen shake decay
  if (cam.shakeAmount > 0.1) {
    cam.shakeAmount *= cam.shakeDecay;
  } else {
    cam.shakeAmount = 0;
  }
}

export function addScreenShake(cam: Camera, amount: number) {
  cam.shakeAmount = Math.min(25, cam.shakeAmount + amount);
}

export function getShakeOffset(cam: Camera): { sx: number; sy: number } {
  if (cam.shakeAmount < 0.5) return { sx: 0, sy: 0 };
  return {
    sx: (Math.random() - 0.5) * cam.shakeAmount,
    sy: (Math.random() - 0.5) * cam.shakeAmount,
  };
}

/** Convert world coordinates to screen coordinates */
export function worldToScreen(
  wx: number, wy: number,
  cam: Camera,
): { sx: number; sy: number } {
  const shake = getShakeOffset(cam);
  return {
    sx: wx - cam.x + shake.sx,
    sy: wy - cam.y + shake.sy,
  };
}
