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
  ],
};
