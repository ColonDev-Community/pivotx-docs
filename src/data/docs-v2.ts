import { DocVersion } from '../types';

/**
 * Documentation for pIvotX v2.0.0 — the release that turns pIvotX from a
 * drawing library into a full 2D game engine.
 */
export const DOCS_V2: DocVersion = {
  version: '2.0.0',
  label: 'v2.0.0 (Latest)',
  sections: [
    {
      id: 'getting-started',
      title: 'Getting Started',
      content: `
## Getting Started with PivotX 2.0

PivotX is a lightweight 2D game engine (~52 KB minified, zero dependencies). One package, four ways to use it:

| Target | Import style | Build required? |
|---|---|---|
| \`Vanilla JS\` | \`<script src="cdn">\` then \`window.PivotX\` | No |
| \`TypeScript\` | \`import { Canvas } from '@colon-dev/pivotx'\` | Yes (your project) |
| \`React\` | \`import { PivotCanvas } from '@colon-dev/pivotx/react'\` | Yes (your project) |
| \`React Native / Expo\` | \`import { PivotNativeCanvas } from '@colon-dev/pivotx/react-native'\` | Yes — iOS, Android & Web |

### Installation

\`\`\`bash
npm i @colon-dev/pivotx
# or
yarn add @colon-dev/pivotx
\`\`\`

Or via CDN (no npm, no build step):

\`\`\`html
<!-- Minified — for production -->
<script src="https://cdn.jsdelivr.net/npm/@colon-dev/pivotx@2/dist/pivotx.umd.min.js"></script>

<!-- Unminified — for development -->
<script src="https://cdn.jsdelivr.net/npm/@colon-dev/pivotx@2/dist/pivotx.umd.js"></script>
\`\`\`

### Your first game — 60 seconds

\`\`\`html
<canvas id="game" width="600" height="400"></canvas>
<script src="https://cdn.jsdelivr.net/npm/@colon-dev/pivotx@2/dist/pivotx.umd.min.js"></script>
<script>
  const { Canvas, Circle, Point, Keyboard } = PivotX;

  const canvas = new Canvas('game');
  const player = { x: 300, y: 200 };

  canvas.startLoop((dt) => {
    canvas.clear();
    // v2: built-in keyboard — no event listeners to write
    player.x += 240 * Keyboard.getAxis('horizontal') * dt;
    player.y += 240 * Keyboard.getAxis('vertical') * dt;

    const c = new Circle(Point(player.x, player.y), 20);
    c.fillColor = 'tomato';
    canvas.add(c);
  });
</script>
\`\`\`

Arrow keys / WASD move the circle. That's a complete game loop with input.
      `,
      subsections: [
        {
          id: 'prerequisites',
          title: 'Prerequisites & Build Outputs',
          content: `
### Prerequisites

**For Vanilla JS (CDN):** a modern browser — that's it.

**For TypeScript / React:** Node.js 16+, TypeScript 4.5+ (recommended), React 17+ for the React layer.

**For React Native / Expo:** Expo SDK 50+ or RN 0.70+, plus \`react-native-webview\` (native only — not needed on Expo Web).

### Build Outputs

The published \`dist/\` contains 11 bundles:

| File | Format | Use case |
|---|---|---|
| \`pivotx.umd(.min).js\` | UMD | \`<script>\` tag / CDN — \`window.PivotX\` |
| \`pivotx.esm.js\` / \`pivotx.cjs.js\` | ESM / CJS | bundlers & Node |
| \`react.esm.js\` / \`react.cjs.js\` | ESM / CJS | React components + hooks |
| \`react-native.esm.js\` / \`react-native.cjs.js\` | ESM / CJS | RN / Expo bindings |
| \`index.d.ts\`, \`react.d.ts\`, \`react-native.d.ts\` | types | Full TypeScript coverage |
          `,
        },
      ],
    },
    {
      id: 'vanilla-js',
      title: 'Vanilla JS Guide',
      content: `
## Vanilla JS — a complete mini-platformer

Everything below runs from one \`<script>\` tag. It uses the v2 engines:
physics (\`stepBody\`), input (\`Keyboard\`), UI (\`UIManager\`), and particles.

\`\`\`html
<canvas id="game" width="600" height="400"></canvas>
<script src="https://cdn.jsdelivr.net/npm/@colon-dev/pivotx@2/dist/pivotx.umd.min.js"></script>
<script>
  const {
    Canvas, Point, Rectangle,
    Keyboard, stepBody,
    UIManager, UIProgressBar, UIText,
    ParticleEmitter,
  } = PivotX;

  const canvas = new Canvas('game');
  const W = canvas.getWidth(), H = canvas.getHeight();

  // ── World ──────────────────────────────────────────────
  const player = { x: 60, y: 100, vx: 0, vy: 0, width: 28, height: 28, grounded: false };
  const platforms = [
    { x: 0,   y: H - 40, w: W,   h: 40 },               // ground
    { x: 180, y: 260,    w: 140, h: 14, oneWay: true }, // jump-through
    { x: 380, y: 190,    w: 120, h: 16, vx: 70 },       // moving — carries you!
  ];

  // ── UI (drawn & hit-tested by the engine) ──────────────
  const ui = new UIManager(document.getElementById('game'));
  const hp = new UIProgressBar(Point(16, 14), 160, 16, { fill: '#22c55e', label: 'HP' });
  const score = new UIText('Jumps: 0', Point(16, 40), { font: 'bold 15px Arial' });
  ui.add(hp).add(score);

  // ── Particles ──────────────────────────────────────────
  const dust = new ParticleEmitter({ colors: ['#cbd5e1'], speed: [40, 120], life: [0.2, 0.5], gravity: 300 });

  let jumps = 0;

  canvas.startLoop((dt) => {
    // Input
    player.vx = 240 * Keyboard.getAxis('horizontal');
    if (Keyboard.justPressed('space') && player.grounded) {
      player.vy = -560;
      jumps++;
      dust.burst(player.x + 14, player.y + 28, 12);
    }

    // Physics: gravity, moving/one-way platforms, terminal velocity
    stepBody(player, platforms, dt, { gravity: 1400, maxFallSpeed: 900 });

    // Keep the moving platform on screen
    const mover = platforms[2];
    if (mover.x < 10 || mover.x + mover.w > W - 10) mover.vx *= -1;

    // Draw
    canvas.clear();
    for (const pl of platforms) {
      const r = new Rectangle(Point(pl.x, pl.y), pl.w, pl.h);
      r.fillColor = pl.oneWay ? '#a16207' : pl.vx ? '#7c3aed' : '#334155';
      canvas.add(r);
    }
    const p = new Rectangle(Point(player.x, player.y), 28, 28);
    p.fillColor = '#38bdf8';
    canvas.add(p);

    dust.update(dt);
    canvas.add(dust);

    score.text = 'Jumps: ' + jumps;
    ui.draw(canvas.ctx);          // UI always on top
  });
</script>
\`\`\`

### What each piece does

- **\`stepBody\`** — sub-stepped integrator: no tunneling, one-way platforms only collide when landing from above, moving platforms carry the player automatically.
- **\`Keyboard\`** — \`getAxis\` merges arrows + WASD; \`justPressed\` is true for exactly one frame; edge states roll automatically inside \`startLoop\`.
- **\`UIManager\`** — owns widgets, routes mouse/touch to them, draws everything with one call.
- **\`ParticleEmitter\`** — pooled; \`burst()\` for one-offs, or set \`.rate\` for continuous emission. It's an \`IDrawable\`, so \`canvas.add(dust)\` just works.
      `,
    },
    {
      id: 'typescript',
      title: 'TypeScript Guide',
      content: `
## TypeScript — fully typed engine

Every API ships types. Interfaces you'll use most:

\`\`\`ts
import {
  Canvas, Point, Circle, Rectangle, Label,
  Keyboard, GamepadInput, InputMap,
  stepBody, type PhysicsBody, type StaticRect, type StepOptions,
  UIManager, UIButton, UIJoystick,
  Vec2, Timers, TweenManager, SceneManager, Scene,
  type IPoint, type IDrawable, type AABB,
} from '@colon-dev/pivotx';
\`\`\`

### A typed entity pattern

\`\`\`ts
interface Enemy extends PhysicsBody {
  hp: number;
  facing: 1 | -1;
}

const enemies: Enemy[] = [
  { x: 300, y: 100, vx: 0, vy: 0, width: 24, height: 24, grounded: false, hp: 3, facing: 1 },
];

const platforms: StaticRect[] = [
  { x: 0, y: 360, w: 600, h: 40 },
  { x: 200, y: 280, w: 120, h: 14, oneWay: true },
];

canvas.startLoop((dt: number) => {
  for (const e of enemies) {
    e.vx = 60 * e.facing;
    const hits = stepBody(e, platforms, dt, { gravity: 1200 });
    if (hits.some((h) => h.side === 'left' || h.side === 'right')) {
      e.facing *= -1;   // turn around at walls
    }
  }
});
\`\`\`

### Custom drawables

Anything with \`tag\` and \`draw(ctx)\` is an \`IDrawable\` — \`canvas.add()\` accepts it:

\`\`\`ts
class HealthRing implements IDrawable {
  readonly tag = 'health-ring';
  constructor(public target: IPoint, public ratio: number) {}
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(this.target.x, this.target.y, 22, -Math.PI / 2, -Math.PI / 2 + this.ratio * Math.PI * 2);
    ctx.strokeStyle = this.ratio > 0.3 ? '#22c55e' : '#dc2626';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}
\`\`\`

The same pattern extends the UI engine: subclass \`UIElement\`, implement \`draw\`, and \`UIManager\` handles hit-testing/hover/press for you.
      `,
    },
    {
      id: 'core-api',
      title: 'Core API Reference',
      content: `
## Core API

### Canvas

\`\`\`ts
const canvas = new Canvas('canvasId');
const crisp  = new Canvas('canvasId', { hiDPI: true });   // Retina-sharp
\`\`\`

| Member | Description |
|---|---|
| \`startLoop(fn)\` / \`stopLoop()\` | rAF loop; \`fn(dt)\` gets seconds since last frame (clamped to 0.1s) |
| \`clear()\` / \`add(drawable)\` | erase / draw any IDrawable |
| \`getWidth()\` / \`getHeight()\` / \`getCenter()\` | logical dimensions |
| \`enableAutoResize()\` | CSS-scale to fill the parent, aspect preserved (ResizeObserver) |
| \`pixelRatio\` | device-pixel ratio in use (1 unless hiDPI) |
| \`ctx\` | raw CanvasRenderingContext2D |

### Shapes

\`\`\`ts
const ball = new Circle(Point(100, 100), 25);
ball.fillColor = 'tomato'; ball.strokeColor = '#333'; ball.lineWidth = 2;

const box = new Rectangle(Point(50, 50), 120, 80);
const line = new Line(Point(0, 0), Point(200, 150));
const ground = new Platform(Point(0, 350), 600, 50);   // has .bounds + .oneWay

const label = new Label('Score: 0', Point(300, 20), 'bold 20px Arial');
label.maxWidth = 280;          // v2: word-wrap
label.strokeColor = '#000';    // v2: outline text
label.text = 'Line one\\nLine two';   // v2: multi-line
\`\`\`

### Images, Sprites & Animation

\`\`\`ts
const assets = await AssetLoader.loadAssets({ hero: '/hero-sheet.png', bg: '/sky.png' });

const sheet = Sprite.createSheet(assets.hero, 32, 32);
const hero = new Sprite(Point(100, 200), sheet);
hero.scale = 2; hero.flipX = true;

const anim = new SpriteAnimator(hero)
  .addClip('idle', { frames: [0, 1, 2, 3], fps: 6, loop: true })
  .addClip('run',  { frames: [4, 5, 6, 7], fps: 10, loop: true });
anim.play('run');
// in the loop: anim.update(dt); canvas.add(hero);
\`\`\`

### Tilemaps

\`\`\`ts
const tiles = Sprite.createSheet(assets.tileset, 16, 16);
const map = new Tilemap(tiles, mapData, 32);       // 2D array, -1 = empty
map.solidTiles = new Set([0, 1, 2]);
map.isSolidAt(x, y);                               // point query
map.getSolidTilesInRegion(aabb);                   // broad-phase
stepBodyOnTilemap(player, map, dt, { gravity: 1400 });   // v2: full physics
\`\`\`

The **Input**, **UI**, **Sound**, **Physics**, and **Game Utilities** engines each have their own section in this sidebar with complete examples.
      `,
    },
    {
      id: 'whats-new',
      title: "What's New in 2.0",
      content: `
## pIvotX 2.0.0 — a complete 2D game engine

v2.0.0 adds every engine a small game needs, while staying lightweight (~52 KB minified core, zero dependencies):

| Engine | What you get |
|---|---|
| **Input** | \`Keyboard\`, \`GamepadInput\` (controllers + rumble), \`Pointer\`, \`InputMap\` action binding |
| **UI** | \`UIManager\` + buttons, panels, sliders, checkboxes, progress bars, virtual joystick, nine-slice skins |
| **Sound** | one-shots, audio sprites, fades, pitch, stereo pan, sound groups (sfx/music buses) |
| **Physics** | one-way & moving platforms, bounce, tilemap collision, raycasts, swept circle casts, SpatialHash |
| **Utilities** | \`Vec2\` math, \`Timers\`, tween engine with easings, particles, scene manager |
| **Camera** | screen shake, animated zoom, dead-zone follow, frame-rate-independent smoothing |
| **React Native** | audio bridge with 16 commands, platform-agnostic hooks |

There is also a fourth platform target now: **React Native / Expo** via \`@colon-dev/pivotx/react-native\` (WebView renderer on iOS/Android, direct canvas on Expo Web).

### Install / upgrade

\`\`\`bash
npm i @colon-dev/pivotx@2
\`\`\`

v2.0.0 is fully backwards-compatible with v1 code — every addition is additive, and several long-standing bugs were fixed (looped-sound pause/resume, background-tab dt spikes, frame-rate-dependent friction).
      `,
    },
    {
      id: 'input-engine',
      title: 'Input Engine',
      content: `
## Input — Keyboard, Gamepad, Pointer, Actions

No event listeners to wire up — query input state directly inside your game loop. "Just pressed / just released" edge states update automatically in \`canvas.startLoop\` and \`useGameLoop\` (call \`updateInputs()\` at the end of a custom rAF loop).

### Keyboard

\`\`\`js
const { Keyboard } = PivotX;

canvas.startLoop((dt) => {
  player.vx = 240 * Keyboard.getAxis('horizontal');   // arrows + WASD → -1..1
  if (Keyboard.justPressed('space') && player.grounded) player.vy = -520;
  if (Keyboard.isDown('shift')) player.vx *= 1.8;     // sprint
});
\`\`\`

Keys accept friendly names (\`'a'\`, \`'left'\`, \`'space'\`, \`'enter'\`, \`'shift'\`) or raw \`KeyboardEvent.code\` values (\`'KeyW'\`, \`'F1'\`). Keys stuck by a window-focus change release automatically.

### Gamepad (controllers)

\`\`\`js
const { GamepadInput } = PivotX;

const stick = GamepadInput.getStick('left');          // { x: -1..1, y: -1..1 }, dead-zoned
if (GamepadInput.justPressed('a')) player.jump();
if (GamepadInput.isDown('rt')) shoot(GamepadInput.getTrigger('rt'));
GamepadInput.vibrate(200, 0.8);                       // rumble 200ms at 80%
\`\`\`

Buttons use standard-mapping names: \`a b x y lb rb lt rt back start ls rs up down left right home\`.

### Pointer (mouse + touch)

\`\`\`js
const { Pointer } = PivotX;
Pointer.attach(document.getElementById('game'));

if (Pointer.justPressed) shootAt(Pointer.x, Pointer.y);   // canvas coordinates
\`\`\`

### InputMap — rebindable actions

\`\`\`js
const { InputMap } = PivotX;

InputMap.bind('jump',  ['space', 'w', 'gamepad:a']);
InputMap.bind('shoot', ['f', 'gamepad:rt']);

if (InputMap.justPressed('jump')) player.jump();      // device-agnostic game code
\`\`\`
      `,
    },
    {
      id: 'ui-engine',
      title: 'UI Engine',
      content: `
## UI — build game interfaces fast

Canvas-rendered widgets managed by \`UIManager\`: it attaches pointer events (mouse + multi-touch), hit-tests topmost-first, and draws everything with one call.

\`\`\`js
const { UIManager, UIButton, UIProgressBar, UIJoystick, UISlider, UICheckbox, Point } = PivotX;

const ui = new UIManager(document.getElementById('game'));

const play = new UIButton('Play', Point(230, 170));
play.onClick = () => startGame();

const hp     = new UIProgressBar(Point(16, 16), 200, 20, { fill: '#22c55e', label: 'HP' });
const stick  = new UIJoystick(Point(80, 330), 55);     // mobile thumbstick
const volume = new UISlider(Point(16, 50), 180, { value: 0.8 });
volume.onChange = (v) => { PivotX.SoundManager.masterVolume = v; };

ui.add(play).add(hp).add(stick).add(volume);
ui.enableKeyboardNav();          // Tab/arrows move focus, Enter activates

canvas.startLoop((dt) => {
  player.x += 220 * stick.value.x * dt;    // read the joystick like a gamepad
  canvas.clear();
  // ...draw the game world...
  ui.draw(canvas.ctx);           // UI always on top
});
\`\`\`

**Widgets:** \`UIButton\`, \`UIText\`, \`UIPanel\` (column/row auto-layout), \`UIProgressBar\`, \`UIJoystick\`, \`UICheckbox\`, \`UISlider\`, \`UIImageButton\`, \`UINineSlice\` (9-slice skinning). Extend \`UIElement\` for custom widgets.

**Anchoring** pins elements to canvas edges so resizes just work:

\`\`\`js
pauseBtn.anchor = { h: 'right', v: 'top' };
pauseBtn.anchorOffset = { x: 16, y: 16 };
\`\`\`

### React: declare UI in JSX

\`\`\`tsx
import { PivotCanvas, PivotUI, PivotButton, PivotProgressBar, PivotJoystick } from '@colon-dev/pivotx/react';

<PivotCanvas width={600} height={400} autoClear>
  <PivotUI>
    <PivotButton x={230} y={170} text="Play" onClick={start} />
    <PivotProgressBar x={16} y={16} value={hp} fill="#22c55e" label="HP" />
    <PivotJoystick x={80} y={330} radius={55} widgetRef={stickRef} />
  </PivotUI>
</PivotCanvas>
\`\`\`
      `,
    },
    {
      id: 'sound-engine',
      title: 'Sound Engine',
      content: `
## Sound — Web Audio without the boilerplate

\`\`\`js
const { Sound, SoundManager } = PivotX;

// Named sounds with groups (buses)
await SoundManager.loadSound('coin',  '/sfx/coin.mp3',  { group: 'sfx' });
await SoundManager.loadSound('theme', '/music/theme.mp3', { group: 'music' });
SoundManager.setGroupVolume('music', 0.4);       // music quieter than sfx
SoundManager.play('theme', { loop: true });

// Overlapping SFX — rapid coins don't cut each other off
SoundManager.getSound('coin').playOneShot();

// Audio sprites — many SFX in one file
const sfx = await Sound.load('/sfx/all.mp3');
sfx.defineSprites({ jump: [0, 0.4], coin: [0.4, 0.5], hit: [0.9, 0.6] });
sfx.playSprite('coin');

// Fades, pitch, stereo pan
sfx.fadeIn(2);                 // fade in over 2s
sfx.playbackRate = 1.2;        // faster & higher-pitched
sfx.pan = -0.5;                // left of centre (cheap positional audio)
\`\`\`

Also: \`pauseAll()\` / \`resumeAll()\` for pause menus, \`mute()\` / \`unmute()\`, \`unload()\` for memory, \`currentTime\`, and \`dispose()\`.

On React Native, the same features flow through the audio bridge — \`useNativeSound()\` exposes \`playOneShot\`, \`fadeTo\`, \`fadeOut\`, \`setPlaybackRate\`, \`pauseAll\`, and \`resumeAll\` on all platforms.
      `,
    },
    {
      id: 'physics-engine',
      title: 'Physics Engine',
      content: `
## Physics — platformer-ready collision

\`stepBody\` is a sub-stepped integrator: gravity, friction, terminal velocity, restitution, and no tunneling through thin platforms.

\`\`\`js
const { stepBody, stepBodyOnTilemap } = PivotX;

const player = { x: 50, y: 100, vx: 0, vy: 0, width: 32, height: 32, grounded: false };
const platforms = [
  { x: 0,   y: 400, w: 800, h: 40 },                 // solid ground
  { x: 200, y: 300, w: 120, h: 16, oneWay: true },   // jump-through ledge
  { x: 400, y: 250, w: 100, h: 16, vx: 60 },         // moving platform — carries you
];

canvas.startLoop((dt) => {
  const hits = stepBody(player, platforms, dt, {
    gravity: 1400,
    friction: 0.85,        // frame-rate independent
    maxFallSpeed: 900,     // terminal velocity
    bounce: 0,             // restitution 0–1
  });

  // Or collide straight against a Tilemap (broad-phase culled):
  // stepBodyOnTilemap(player, tilemap, dt, { gravity: 1400 });
});
\`\`\`

### Raycasts & swept casts

\`\`\`js
const { raycastAABB, raycastCircle, sweepCircleAABB, SpatialHash, createAABB } = PivotX;

// Line of sight
const hit = raycastAABB(eye, dir, wall.bounds, 300);   // { t, point, normal } | null

// A fast-moving ball can't tunnel through walls
const sweep = sweepCircleAABB(ball, { x: vx * dt, y: vy * dt }, wall.bounds);
if (sweep) { /* move to sweep.t, reflect off sweep.normal */ }

// Broad-phase for hordes: O(n) instead of O(n²)
const hash = new SpatialHash(64);
hash.clear();
enemies.forEach((e) => hash.insert(e, createAABB(e.x, e.y, e.w, e.h)));
const nearby = hash.query(playerBounds);
\`\`\`

Circle helpers: \`circlesOverlap\`, \`circleAABBOverlap\`, \`circleAABBResolve\` (push-out for sliding along walls).
      `,
    },
    {
      id: 'game-utilities',
      title: 'Game Utilities',
      content: `
## Utilities — the glue every game needs

### Tweens

\`\`\`js
const tweens = new PivotX.TweenManager();
tweens.to(player.position, { x: 400, y: 100 }, 0.6, 'easeOutQuad')
      .then(() => console.log('arrived'));

canvas.startLoop((dt) => { tweens.update(dt); /* ... */ });
\`\`\`

10 built-in easings (\`linear\`, quad/cubic in/out/inOut, \`easeOutBack\`, \`easeOutElastic\`, \`easeOutBounce\`) or any custom \`(t) => t\` function.

### Timers (game-time — they pause with your game)

\`\`\`js
const timers = new PivotX.Timers();
timers.after(2, () => spawnBoss());
const h = timers.every(0.5, () => spawnEnemy());   // h.cancel() to stop
canvas.startLoop((dt) => { timers.update(dt); });
\`\`\`

### Particles

\`\`\`js
const sparks = new PivotX.ParticleEmitter({
  colors: ['#fbbf24', '#f97316'], speed: [80, 260],
  life: [0.3, 0.8], size: [2, 5], gravity: 400,
});
sparks.burst(x, y, 24);          // explosion
canvas.startLoop((dt) => {
  sparks.update(dt);
  canvas.add(sparks);            // it's an IDrawable
});
\`\`\`

### Scenes (menu → game → pause)

\`\`\`js
class MenuScene extends PivotX.Scene {
  update(dt) { if (PivotX.Keyboard.justPressed('enter')) this.manager.switch(new GameScene()); }
  draw(ctx)  { /* title screen */ }
}

const scenes = new PivotX.SceneManager(new MenuScene());
canvas.startLoop((dt) => {
  canvas.clear();
  scenes.update(dt);
  scenes.draw(canvas.ctx);
});
\`\`\`

\`push()\` / \`pop()\` create overlays — a pause menu draws over the frozen game (only the top scene updates; the whole stack draws).

### Vec2

\`\`\`js
const dir = PivotX.Vec2.normalize(PivotX.Vec2.sub(target, enemy.position));
enemy.vx = dir.x * speed;
\`\`\`

Pure, non-mutating: \`add sub scale dot length normalize distance lerp rotate clampLength angle fromAngle\`.
      `,
    },
    {
      id: 'camera-canvas',
      title: 'Camera & Canvas',
      content: `
## Camera & Canvas upgrades

### Camera

\`\`\`js
camera.follow(player.position, 0.1, dt);              // frame-rate-independent smoothing
camera.followWithDeadZone(player.position, 120, 80);  // platformer dead-zone camera
camera.shake(8, 0.3);                                 // screen shake — eases out
camera.setZoom(2, 0.5);                               // animated zoom over 0.5s
camera.update(dt);                                    // drives shake/zoom — call before begin()
\`\`\`

### Crisp high-DPI rendering

\`\`\`js
const canvas = new PivotX.Canvas('game', { hiDPI: true });   // Retina-sharp
ui.pixelRatio = canvas.pixelRatio;          // keep UI input aligned
PivotX.Pointer.pixelRatio = canvas.pixelRatio;
\`\`\`

All your coordinates stay logical — only the backing store scales.

### Fill the page

\`\`\`js
canvas.enableAutoResize();    // CSS-scales to fill the parent, aspect preserved
\`\`\`

Internal resolution and coordinates never change, and pointer input is compensated automatically.

### Multi-line & outlined text

\`\`\`js
const label = new PivotX.Label('Line one\\nLine two', Point(300, 40), 'bold 20px Arial');
label.maxWidth = 280;          // word-wrap
label.strokeColor = '#000';    // outline (great over busy backgrounds)
\`\`\`
      `,
    },
    {
      id: 'responsive-levels',
      title: 'Levels That Fit Every Screen',
      content: `
## Designing levels that play identically on every screen

A platformer that works on your desktop can be **physically impossible** on a
tablet or feel broken on a phone. This bit our own demo games twice — here is
the exact failure and the exact fix.

### The two mistakes

**1. Positioning platforms as screen percentages.**

\`\`\`js
// ⚠️ looks harmless, breaks on wide screens
const platforms = [
  { x: W * 0.08, y: H - 170, w: 120, h: 14, oneWay: true },
  { x: W * 0.62, y: H - 250, w: 120, h: 14, oneWay: true },
];
\`\`\`

The *gap* between those ledges scales with the device. Measured on real
device sizes with a jump of power 640 / gravity 1500 and run speed 260:

| Screen width | Ledge gap | Max jump carry | Result |
|---|---|---|---|
| 360dp phone | 74dp | ~182dp | fine |
| 412dp phone | 102dp | ~182dp | fine |
| 800dp tablet | **312dp** | ~182dp | **unreachable** |

**2. Sizing rises without checking the jump math.** The same level had its
first ledge 122dp above the ground with a jump apex of 137dp — a 15dp margin.
Players experience that as "the jump doesn't work", on *every* device.

### The physics you need

Two closed-form numbers tell you everything:

\`\`\`js
// Highest point of a jump (in px/dp):
const apex = (JUMP_POWER * JUMP_POWER) / (2 * GRAVITY);   // 680²/3000 ≈ 154

// Horizontal distance covered while landing \`rise\` higher:
// air time t solves  J·t − (g/2)·t² = rise  (take the larger root)
const t = (J + Math.sqrt(J * J - 2 * GRAVITY * rise)) / GRAVITY;
const carry = RUN_SPEED * t;                              // ≈182dp for rise=80
\`\`\`

**Rules of thumb:** keep rises ≤ ⅔ of the apex, and horizontal edge gaps
≤ ½ of the carry. That leaves margin for imperfect timing.

### The fix: a clamped layout band

Don't scale positions with the screen — centre a **fixed-size band** and lay
the level out inside it. Wider screens get margin, not longer jumps:

\`\`\`js
const B = Math.min(W - 40, 560);   // band width: capped, never grows past 560
const L = W / 2 - B / 2;           // band left edge (centres it)

const platforms = [
  { x: 0, y: H - 48, w: W, h: 48 },                            // ground spans the screen
  { x: L,            y: H - 148, w: 150, h: 14, oneWay: true }, // ~100dp rises
  { x: L + B * 0.34, y: H - 248, w: 150, h: 14, oneWay: true }, // ~60dp edge gaps
  { x: L + B * 0.62, y: H - 348, w: 110, h: 16, vx: 70, oneWay: true },
];
// Moving platforms patrol within the band, not the screen:
if (mover.x < L + B * 0.44) mover.vx = Math.abs(mover.vx);
if (mover.x + mover.w > L + B) mover.vx = -Math.abs(mover.vx);
\`\`\`

Vertical offsets from the bottom (\`H - 148\`) are fine as-is: they're
constant distances, so the physics is identical on tall and short screens —
extra height just becomes sky.

### Prove it with a simulation

Because \`stepBody\` is pure and deterministic, you can drive it headlessly
and verify reachability before any human playtests:

\`\`\`js
// Bang-bang controller: run at the target, jump when in range.
// Run it at several screen sizes — if it can't finish, players can't either.
for (const [W, H] of [[360, 740], [412, 915], [800, 1280], [915, 412]]) {
  const done = simulateRoute(W, H);   // build level, loop stepBody @60fps
  console.log(W + 'x' + H, done ? 'reachable ✓' : 'IMPOSSIBLE ✗');
}
\`\`\`

This caught both of our bugs: the tablet-width gap failure and a solid moving
platform that blocked jumps from below (fixed by making it \`oneWay\` — a
jump-through elevator). The live **V2 Playground** on this site uses exactly
this layout and passes the simulation on all four device profiles in under 3s.
      `,
    },
    {
      id: 'react-guide',
      title: 'React Guide',
      content: `
## React — components, hooks & JSX UI

\`\`\`tsx
import {
  PivotCanvas, PivotCircle, PivotRectangle, PivotLabel,
  PivotUI, PivotButton, PivotProgressBar, PivotJoystick,
  useGameLoop, Keyboard, stepBody,
} from '@colon-dev/pivotx/react';
\`\`\`

### The render pattern

Game state lives in \`useRef\` (no re-render cost); a \`useState\` counter
triggers one re-render per frame; shape components redraw from the refs.

\`\`\`tsx
function Game() {
  const player = useRef({ x: 60, y: 100, vx: 0, vy: 0, width: 28, height: 28, grounded: false });
  const platforms = useRef([{ x: 0, y: 360, w: 600, h: 40 }]);
  const [, setFrame] = useState(0);

  useGameLoop((dt) => {
    const p = player.current;
    p.vx = 240 * Keyboard.getAxis('horizontal');            // v2 input engine
    if (Keyboard.justPressed('space') && p.grounded) p.vy = -560;
    stepBody(p, platforms.current, dt, { gravity: 1400 });  // v2 physics
    setFrame((f) => f + 1);
  });

  const p = player.current;
  return (
    <PivotCanvas width={600} height={400} background="#101024" autoClear>
      {platforms.current.map((pl, i) => (
        <PivotRectangle key={i} position={{ x: pl.x, y: pl.y }} width={pl.w} height={pl.h} fill="#334155" />
      ))}
      <PivotRectangle position={{ x: p.x, y: p.y }} width={28} height={28} fill="#38bdf8" />
    </PivotCanvas>
  );
}
\`\`\`

\`autoClear\` (v2) clears before child shapes draw each render — no smearing,
no manual \`ref.clear()\`.

### JSX UI widgets (v2)

\`<PivotUI>\` hosts a UIManager inside the canvas and draws it every frame:

\`\`\`tsx
const stickRef = useRef(null);

<PivotCanvas width={600} height={400} autoClear>
  {/* ...game shapes... */}
  <PivotUI>
    <PivotButton x={230} y={170} text="Play" onClick={start} />
    <PivotProgressBar x={16} y={16} value={hp} fill="#22c55e" label="HP" />
    <PivotSlider x={16} y={48} value={volume} onChange={setVolume} />
    <PivotJoystick x={80} y={330} radius={55} widgetRef={stickRef} />
  </PivotUI>
</PivotCanvas>

// read the stick in your loop: stickRef.current?.value.x
\`\`\`

### Hooks

| Hook | Purpose |
|---|---|
| \`useGameLoop(fn)\` | rAF loop; dt clamped; input edges auto-updated |
| \`useSound()\` | SoundManager controls (play/stop/fade/mute…) |
| \`useKeyPressed(key)\` | reactive key state for menus/HUDs |
| \`useGamepadConnected()\` | reactive controller connect/disconnect |
| \`useUIManager(canvasRef, setup)\` | imperative UIManager bound to the canvas ref |
      `,
    },
    {
      id: 'react-native-guide',
      title: 'React Native / Expo Guide',
      content: `
## React Native / Expo — one codebase, three platforms

\`<PivotNativeCanvas>\` renders via WebView on iOS/Android and a direct
\`<canvas>\` on Expo Web. The same JSX works everywhere.

\`\`\`tsx
import {
  PivotNativeCanvas, PivotCircle, PivotRectangle, PivotLabel,
  PivotJoystick, PivotButton, PivotProgressBar, PivotUIText,
  useNativeGameLoop, useNativeSound, NativeInput, stepBody,
} from '@colon-dev/pivotx/react-native';

function Game() {
  const player = useRef({ x: 60, y: 100, vx: 0, vy: 0, width: 28, height: 28, grounded: false });
  const stick = useRef({ x: 0, y: 0 });
  const sound = useNativeSound();
  const [, setFrame] = useState(0);

  useEffect(() => { sound.loadSound('jump', jumpUri); }, [sound]);

  useNativeGameLoop((dt) => {
    const p = player.current;
    // Merge on-screen joystick + hardware keyboard + controller (v2)
    const ax = stick.current.x + NativeInput.keyAxis('horizontal') + NativeInput.getStick('left').x;
    p.vx = 240 * Math.max(-1, Math.min(1, ax));
    stepBody(p, platforms, dt, { gravity: 1400 });
    setFrame((f) => f + 1);
  });

  return (
    <PivotNativeCanvas width={W} height={H} background="#101024">
      <PivotRectangle position={player.current} width={28} height={28} fill="#38bdf8" />

      {/* v2 UI bridge — real engine widgets, declared as JSX */}
      <PivotUIText x={16} y={14} text="Coins: 3" color="#fbbf24" />
      <PivotProgressBar x={16} y={40} value={0.8} fill="#22c55e" label="HP" />
      <PivotJoystick x={86} y={H - 96} radius={58} onMove={(v) => (stick.current = v)} />
      <PivotButton x={W - 120} y={H - 130} text="JUMP" onClick={() => {
        if (player.current.grounded) {
          player.current.vy = -560;
          sound.setPlaybackRate('jump', 0.9 + Math.random() * 0.25);
          sound.playOneShot('jump');        // v2 audio bridge
        }
      }} />
    </PivotNativeCanvas>
  );
}
\`\`\`

### What's platform-aware for you

- **UI bridge** — widgets reconcile into a real UIManager: directly on Expo
  Web, inside the WebView on native. Touches route to the UI first;
  unconsumed ones still reach your \`onTouch\`.
- **NativeInput** — Bluetooth/USB keyboards and controllers deliver events
  to the WebView's DOM, forwarded over the bridge: \`isKeyDown\`, \`keyAxis\`,
  \`isButtonDown\`, \`getStick\` — no native module.
- **Audio bridge** — 16 commands including \`playOneShot\`, \`fadeTo/Out\`,
  \`setPlaybackRate\`, \`pauseAll/resumeAll\`.
- **Script mode** — pass a \`script\` string prop to run an imperative game
  inside the WebView with the full engine (\`window.PivotX\`).

> On physical devices the WebView loads the UMD from jsDelivr, so the
> UI/input/audio bridges need the published \`@colon-dev/pivotx\` ≥ 2.0.0.
      `,
    },
    {
      id: 'patterns',
      title: 'Game Patterns (2.0)',
      content: `
## Game patterns, the 2.0 way

Patterns that needed hand-rolled code in 1.x are now one-liners.

### Scenes: menu → game → pause

\`\`\`js
class MenuScene extends Scene {
  update(dt) { if (Keyboard.justPressed('enter')) this.manager.switch(new GameScene()); }
  draw(ctx)  { /* title art */ }
}
class PauseScene extends Scene {
  update(dt) { if (Keyboard.justPressed('escape')) this.manager.pop(); }
  draw(ctx)  { /* dim overlay + menu; the frozen game still draws below */ }
}

const scenes = new SceneManager(new MenuScene());
canvas.startLoop((dt) => {
  canvas.clear();
  scenes.update(dt);         // only the top scene updates
  scenes.draw(canvas.ctx);   // the whole stack draws (pause overlays game)
});
\`\`\`

### Rebindable controls

\`\`\`js
InputMap.bind('jump',  ['space', 'w', 'gamepad:a']);
InputMap.bind('shoot', ['f', 'gamepad:rt']);
// Settings-screen rebinding = InputMap.bind again. Game code never changes:
if (InputMap.justPressed('jump')) player.jump();
\`\`\`

### Spawning waves without setTimeout

\`\`\`js
const timers = new Timers();
timers.every(2, () => spawnEnemy());
timers.after(30, () => { boss.active = true; camera.shake(10, 0.5); });
// timers.update(dt) in the loop — pauses when your game pauses
\`\`\`

### Juice: tweens + particles + camera shake

\`\`\`js
function onEnemyKilled(e) {
  sparks.burst(e.x, e.y, 24);
  camera.shake(6, 0.25);
  tweens.to(scoreLabel.position, { y: 12 }, 0.15, 'easeOutQuad')
        .then(() => tweens.to(scoreLabel.position, { y: 20 }, 0.2, 'easeOutBounce'));
}
\`\`\`

### Hundreds of entities: SpatialHash

\`\`\`js
const hash = new SpatialHash(64);
canvas.startLoop((dt) => {
  hash.clear();
  for (const e of enemies) hash.insert(e, createAABB(e.x, e.y, e.w, e.h));
  // Only test bullets against nearby enemies — O(n), not O(n²)
  for (const b of bullets) {
    for (const e of hash.query(createAABB(b.x - 4, b.y - 4, 8, 8))) {
      if (circleAABBOverlap({ x: b.x, y: b.y, radius: 4 }, createAABB(e.x, e.y, e.w, e.h))) hit(e, b);
    }
  }
});
\`\`\`

### Bullets that never tunnel

\`\`\`js
const hit = sweepCircleAABB(bullet, { x: bullet.vx * dt, y: bullet.vy * dt }, wall.bounds);
if (hit) {
  bullet.x += bullet.vx * dt * hit.t;   // stop at the contact point
  // reflect off hit.normal for a ricochet
}
\`\`\`
      `,
    },
    {
      id: 'platformer-example',
      title: 'Full Platformer Example',
      content: `
## A complete platformer with the 2.0 engine

Everything in one file: physics, input, camera, UI, and particles — about
90 lines of game logic. (The 1.x version hand-rolled input, collision, and
HUD drawing.)

\`\`\`html
<canvas id="game" width="600" height="400"></canvas>
<script src="https://cdn.jsdelivr.net/npm/@colon-dev/pivotx@2/dist/pivotx.umd.min.js"></script>
<script>
const {
  Canvas, Point, Rectangle, Camera,
  Keyboard, GamepadInput, stepBody,
  UIManager, UIProgressBar, UIText, ParticleEmitter,
} = PivotX;

const canvas = new Canvas('game');
const W = canvas.getWidth(), H = canvas.getHeight();
const WORLD_W = 2000;

// ── World ────────────────────────────────────────────────────────────
const player = { x: 60, y: 200, vx: 0, vy: 0, width: 28, height: 28, grounded: false };
const platforms = [
  { x: 0, y: 360, w: WORLD_W, h: 40 },
  { x: 260, y: 280, w: 130, h: 14, oneWay: true },
  { x: 470, y: 210, w: 130, h: 14, oneWay: true },
  { x: 700, y: 260, w: 110, h: 16, vx: 80 },          // moving platform
  { x: 950, y: 300, w: 200, h: 100 },                 // block
];
const coins = [];
for (let i = 0; i < 12; i++) coins.push({ x: 250 + i * 140, y: 180, taken: false });

// ── Camera / UI / FX ─────────────────────────────────────────────────
const camera = new Camera(W, H);
const ui = new UIManager(document.getElementById('game'));
const hp = new UIProgressBar(Point(16, 14), 160, 16, { fill: '#22c55e', label: 'HP' });
const scoreText = new UIText('Coins: 0', Point(16, 40), { font: 'bold 15px Arial' });
ui.add(hp).add(scoreText);
const sparkle = new ParticleEmitter({ colors: ['#fbbf24', '#fde68a'], speed: [60, 180], life: [0.3, 0.6] });

let score = 0;

canvas.startLoop((dt) => {
  // Input: keyboard + gamepad merged
  const ax = Keyboard.getAxis('horizontal') + GamepadInput.getStick('left').x;
  player.vx = 260 * Math.max(-1, Math.min(1, ax));
  const jump = Keyboard.justPressed('space') || GamepadInput.justPressed('a');
  if (jump && player.grounded) player.vy = -600;

  // Physics
  stepBody(player, platforms, dt, { gravity: 1500, maxFallSpeed: 900 });
  const mover = platforms[3];
  if (mover.x < 650 || mover.x + mover.w > 900) mover.vx *= -1;

  // Coins
  for (const c of coins) {
    if (!c.taken && Math.abs(player.x - c.x) < 24 && Math.abs(player.y - c.y) < 28) {
      c.taken = true; score++;
      sparkle.burst(c.x, c.y, 16);
      camera.shake(3, 0.15);
    }
  }

  // Camera: dead-zone follow, clamped to the world; update() drives shake
  camera.followWithDeadZone({ x: player.x, y: player.y }, 140, 100, 0.15, dt);
  camera.clamp(WORLD_W, H);
  camera.update(dt);

  // ── Draw ───────────────────────────────────────────────────────────
  canvas.clear();
  camera.begin(canvas.ctx);   // world space
  for (const pl of platforms) {
    const r = new Rectangle(Point(pl.x, pl.y), pl.w, pl.h);
    r.fillColor = pl.oneWay ? '#a16207' : pl.vx ? '#7c3aed' : '#334155';
    canvas.add(r);
  }
  for (const c of coins) {
    if (c.taken) continue;
    const r = new Rectangle(Point(c.x - 7, c.y - 7), 14, 14);
    r.fillColor = '#fbbf24';
    canvas.add(r);
  }
  const pr = new Rectangle(Point(player.x, player.y), 28, 28);
  pr.fillColor = '#38bdf8';
  canvas.add(pr);
  sparkle.update(dt);
  canvas.add(sparkle);
  camera.end(canvas.ctx);     // back to screen space

  scoreText.text = 'Coins: ' + score;
  ui.draw(canvas.ctx);        // HUD fixed on screen
});
</script>
\`\`\`

### Where to go next

- **Input Engine** — add InputMap for rebindable controls.
- **Sound Engine** — audio sprites and music fades.
- **Game Utilities** — scenes for a menu/pause flow, tweens for pickup juice.
- **Tutorials** — every live game on this site has a full code walkthrough.
      `,
    },
  ],
};
