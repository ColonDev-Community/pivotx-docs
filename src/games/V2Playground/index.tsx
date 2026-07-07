// ─── V2 Playground ────────────────────────────────────────────────────────────
//
// Live demo of the pIvotX 2.0 engines working together:
// - Input:    Keyboard (arrows/WASD + space) & GamepadInput (stick + A)
// - UI:       PivotUI JSX widgets — joystick, jump button, HP bar, HUD text
// - Physics:  stepBody with moving platforms (they carry you!), one-way
//             ledges, maxFallSpeed
// - Sound:    synthesized SFX (no audio files!) — one-shot jumps with random
//             pitch, coin dings, music fade-in, live volume slider
//
import { useRef, useState, useEffect } from 'react';
import {
  PivotCanvas,
  PivotRectangle,
  PivotCircle,
  PivotLabel,
  PivotUI,
  PivotButton,
  PivotProgressBar,
  PivotJoystick,
  PivotSlider,
  PivotUIText,
  useGameLoop,
  Keyboard,
  GamepadInput,
  stepBody,
  Sound,
  UIJoystick,
} from 'pivotx/react';
import type { PhysicsBody, StaticRect } from 'pivotx/react';
import { useExitToMenu } from '../../hooks/useExitToMenu';

const MOVE_SPEED = 260;
const JUMP_POWER = -620;
const MAX_ENERGY = 3;

interface Coin { x: number; y: number; taken: boolean }

// ── Synthesized sounds (v2 Sound engine — no audio files needed) ────────
function makeTone(freq: number, duration: number, type: 'sine' | 'square' | 'saw'): Sound {
  const ctx = Sound.getAudioContext();
  const length = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    const t = i / ctx.sampleRate;
    const envelope = Math.max(0, 1 - t / duration);
    const wave =
      type === 'sine' ? Math.sin(2 * Math.PI * freq * t) :
      type === 'square' ? (Math.sin(2 * Math.PI * freq * t) > 0 ? 1 : -1) :
      2 * ((freq * t) % 1) - 1;
    data[i] = wave * envelope * 0.25;
  }
  return new Sound(buffer);
}

const sfx = {
  jump: makeTone(340, 0.18, 'square'),
  coin: makeTone(880, 0.25, 'sine'),
  bgm: makeTone(110, 2.0, 'saw'),
};
sfx.bgm.loop = true;

export default function V2PlaygroundGame() {
  const onExit = useExitToMenu();
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const W = size.w, H = size.h;

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onExit(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onExit]);

  // ── Game state (refs — no re-render cost) ────────────────────────────
  const player = useRef<PhysicsBody>({
    x: 120, y: 100, vx: 0, vy: 0, width: 28, height: 28, grounded: false,
  });
  const platforms = useRef<StaticRect[]>([
    { x: 0, y: H - 48, w: W, h: 48 },
    { x: W * 0.08, y: H - 190, w: 150, h: 14, oneWay: true },
    { x: W * 0.62, y: H - 270, w: 150, h: 14, oneWay: true },
    { x: W * 0.3, y: H - 360, w: 120, h: 16, vx: 90 },
  ]);
  const coins = useRef<Coin[]>([
    { x: W * 0.15, y: H - 225, taken: false },
    { x: W * 0.69, y: H - 305, taken: false },
    { x: W * 0.5, y: H - 410, taken: false },
  ]);
  const stickRef = useRef<UIJoystick | null>(null);
  const jumpQueued = useRef(false);
  const energy = useRef(MAX_ENERGY);
  const recharge = useRef(0);
  const score = useRef(0);
  const audioOn = useRef(false);
  const [volume, setVolume] = useState(0.8);
  const [, setFrame] = useState(0);

  // Unlock audio on first interaction (browser autoplay policy), fade music in
  useEffect(() => {
    const unlock = () => {
      if (audioOn.current) return;
      audioOn.current = true;
      Sound.getAudioContext().resume();
      sfx.bgm.fadeIn(2, 0.12);            // v2: fade the hum in over 2s
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      sfx.bgm.stop();
    };
  }, []);

  useEffect(() => {
    sfx.jump.volume = volume;
    sfx.coin.volume = volume;
    sfx.bgm.volume = Math.min(volume, 1) * 0.15;
  }, [volume]);

  useGameLoop((dt) => {
    const p = player.current;

    // Input: on-screen joystick + keyboard + controller, merged
    const stick = stickRef.current?.value ?? { x: 0, y: 0 };
    const ax = stick.x + Keyboard.getAxis('horizontal') + GamepadInput.getStick('left').x;
    p.vx = MOVE_SPEED * Math.max(-1, Math.min(1, ax));

    if (Keyboard.justPressed('space') || GamepadInput.justPressed('a')) {
      jumpQueued.current = true;
    }
    if (jumpQueued.current) {
      jumpQueued.current = false;
      if (p.grounded && energy.current >= 1) {
        p.vy = JUMP_POWER;
        energy.current -= 1;
        sfx.jump.playbackRate = 0.9 + Math.random() * 0.3;  // v2: pitch variation
        sfx.jump.playOneShot();                              // v2: overlapping SFX
      }
    }
    if (p.grounded && energy.current < MAX_ENERGY) {
      recharge.current += dt;
      if (recharge.current >= 0.8) { recharge.current = 0; energy.current += 1; }
    }

    // Physics: moving platform carries the player; one-way ledges
    stepBody(p, platforms.current, dt, { gravity: 1500, friction: 0.9, maxFallSpeed: 900 });
    const mover = platforms.current[3];
    if (mover.vx !== undefined) {
      if (mover.x < 10) mover.vx = Math.abs(mover.vx);
      if (mover.x + mover.w > W - 10) mover.vx = -Math.abs(mover.vx);
    }
    if (p.x < 0) { p.x = 0; p.vx = 0; }
    if (p.x + p.width > W) { p.x = W - p.width; p.vx = 0; }

    // Coins
    for (const c of coins.current) {
      if (c.taken) continue;
      const dx = p.x + 14 - c.x, dy = p.y + 14 - c.y;
      if (dx * dx + dy * dy < 900) {
        c.taken = true;
        score.current += 1;
        sfx.coin.playbackRate = 1 + score.current * 0.05;    // rises with combo
        sfx.coin.playOneShot();
        if (coins.current.every((cc) => cc.taken)) {
          coins.current.forEach((cc) => { cc.taken = false; });
        }
      }
    }

    setFrame((f) => f + 1);
  });

  const p = player.current;

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#101024' }}>
      <PivotCanvas width={W} height={H} background="#101024" autoClear>
        {platforms.current.map((pl, i) => (
          <PivotRectangle
            key={i}
            position={{ x: pl.x, y: pl.y }}
            width={pl.w}
            height={pl.h}
            fill={pl.oneWay ? '#a16207' : pl.vx !== undefined ? '#7c3aed' : '#334155'}
          />
        ))}
        {coins.current.map((c, i) =>
          c.taken ? null : (
            <PivotCircle key={`c${i}`} center={{ x: c.x, y: c.y }} radius={9} fill="#fbbf24" stroke="#92400e" lineWidth={2} />
          ),
        )}
        <PivotRectangle position={{ x: p.x, y: p.y }} width={28} height={28} fill="#38bdf8" />
        <PivotLabel
          text="arrows/WASD or joystick · space or JUMP (hear the pitch shift!) · purple platform carries you · ESC exits"
          position={{ x: W / 2, y: 24 }}
          font="12px Arial"
          fill="rgba(255,255,255,0.35)"
        />

        {/* v2 UI engine — widgets declared as JSX, drawn & hit-tested by pIvotX */}
        <PivotUI>
          <PivotButton
            x={W - 130} y={H - 140} width={104} height={76}
            text="JUMP" style={{ background: '#16a34a', pressedBackground: '#15803d' }}
            onClick={() => { jumpQueued.current = true; }}
          />
          <PivotProgressBar
            x={16} y={16} width={150} height={16}
            value={energy.current / MAX_ENERGY}
            fill={energy.current >= 1 ? '#22c55e' : '#dc2626'}
            label="ENERGY"
          />
          <PivotUIText
            x={16} y={44}
            text={`Coins: ${score.current}`}
            font="bold 16px Arial" color="#fbbf24"
          />
          <PivotUIText x={16} y={72} text="Volume" font="12px Arial" color="#94a3b8" />
          <PivotSlider
            x={16} y={84} width={130}
            value={volume}
            onChange={setVolume}
          />
          <PivotJoystick x={92} y={H - 100} radius={60} widgetRef={stickRef} />
        </PivotUI>
      </PivotCanvas>
    </div>
  );
}
