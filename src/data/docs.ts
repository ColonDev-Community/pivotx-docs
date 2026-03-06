import { DocVersion } from '../types';

export const DOC_VERSIONS: DocVersion[] = [
  {
    version: '1.2.x',
    label: 'v1.2.x (Latest)',
    sections: [
      {
        id: 'getting-started',
        title: 'Getting Started',
        content: `
## Getting Started with PivotX

PivotX is a lightweight 2D game development library. One package, three ways to use it:

| Target | Import style | Build required? |
|---|---|---|
| \`Vanilla JS\` | \`<script src="cdn">\` then \`window.PivotX\` | No |
| \`TypeScript\` | \`import { Canvas } from 'pivotx'\` | Yes (your project) |
| \`React\` | \`import { PivotCanvas } from 'pivotx/react'\` | Yes (your project) |

### Installation

\`\`\`bash
npm i @colon-dev/pivotx
# or
yarn add @colon-dev/pivotx
\`\`\`

Or via CDN (no npm, no build step):

\`\`\`html
<!-- Minified — for production -->
<script src="https://cdn.jsdelivr.net/npm/pivotx/dist/pivotx.umd.min.js"></script>

<!-- Unminified — for development -->
<script src="https://cdn.jsdelivr.net/npm/pivotx/dist/pivotx.umd.js"></script>
\`\`\`
        `,
        subsections: [
          {
            id: 'prerequisites',
            title: 'Prerequisites',
            content: `
### Prerequisites

**For Vanilla JS (CDN):**
- A modern browser — that's it! No Node, no build tools.

**For TypeScript / React:**
- **Node.js** 16+ and npm/yarn
- **TypeScript** 4.5+ (recommended)
- **React** 18+ (only for the React layer)

### Build Outputs

After \`npm run build\`, the \`dist/\` folder contains:

| File | Format | Use case |
|---|---|---|
| \`pivotx.umd.js\` | UMD | \`<script>\` tag, dev (unminified + source maps) |
| \`pivotx.umd.min.js\` | UMD | \`<script>\` tag, production / CDN |
| \`pivotx.esm.js\` | ESM | \`import\` in bundlers / TypeScript |
| \`pivotx.cjs.js\` | CJS | \`require()\` in Node / older toolchains |
| \`react.esm.js\` | ESM | React components + hooks |
| \`react.cjs.js\` | CJS | React (CommonJS) |
| \`index.d.ts\` | types | TypeScript types for core |
| \`react.d.ts\` | types | TypeScript types for React layer |
            `,
          },
        ],
      },
      {
        id: 'vanilla-js',
        title: 'Vanilla JS Guide',
        content: `
## Vanilla JS — No Build Step Required

Drop one \`<script>\` tag in your HTML and everything is on \`window.PivotX\`. No npm, no webpack, no React.

### Complete Example

\`\`\`html
<!DOCTYPE html>
<html>
<head><title>My PivotX Game</title></head>
<body>
  <canvas id="game" width="600" height="400"></canvas>
  <script src="https://cdn.jsdelivr.net/npm/pivotx/dist/pivotx.umd.min.js"></script>
  <script>
    var { Canvas, Circle, Rectangle, Line, Label, Point } = PivotX;

    var canvas = new Canvas("game");
    var W = canvas.getWidth();
    var H = canvas.getHeight();

    var ball = { x: W/2, y: H/2, r: 24, vx: 200, vy: 150 };

    canvas.startLoop(function(dt) {
      canvas.clear();

      // Background
      var bg = new Rectangle(Point(0, 0), W, H);
      bg.fillColor = "#1a1a2e";
      canvas.add(bg);

      // Update ball position
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      if (ball.x < ball.r || ball.x > W - ball.r) ball.vx *= -1;
      if (ball.y < ball.r || ball.y > H - ball.r) ball.vy *= -1;

      // Draw ball
      var circle = new Circle(Point(ball.x, ball.y), ball.r);
      circle.fillColor   = "#e94560";
      circle.strokeColor = "white";
      circle.lineWidth   = 2;
      canvas.add(circle);

      // Draw label
      var label = new Label("Bouncing Ball", Point(W/2, 30), "bold 20px Arial");
      label.fillColor = "white";
      label.textAlign = "center";
      canvas.add(label);
    });
  </script>
</body>
</html>
\`\`\`

### Step-by-Step Breakdown

**1. Add the \`<canvas>\` element:**

\`\`\`html
<canvas id="game" width="600" height="400"></canvas>
\`\`\`

**2. Include the PivotX script:**

\`\`\`html
<script src="https://cdn.jsdelivr.net/npm/pivotx/dist/pivotx.umd.min.js"></script>
\`\`\`

**3. Destructure from \`window.PivotX\`:**

\`\`\`js
var { Canvas, Circle, Rectangle, Line, Label, Point } = PivotX;
\`\`\`

**4. Create a Canvas and start the loop:**

\`\`\`js
var canvas = new Canvas("game");  // pass the canvas element's id
canvas.startLoop(function(dt) {
  canvas.clear();         // clear the screen each frame
  // ... create shapes, update positions, add to canvas
});
\`\`\`

### Drawing WITHOUT a Game Loop

If you just want to draw a static scene (no animation), skip \`startLoop\` and call \`canvas.add()\` directly:

\`\`\`js
var { Canvas, Circle, Rectangle, Label, Point } = PivotX;
var canvas = new Canvas("game");

// Draw background
var bg = new Rectangle(Point(0, 0), 600, 400);
bg.fillColor = "#1a1a2e";
canvas.add(bg);

// Draw shapes
var sun = new Circle(Point(500, 60), 40);
sun.fillColor = "#FFD700";
canvas.add(sun);

var ground = new Rectangle(Point(0, 300), 600, 100);
ground.fillColor = "#228B22";
canvas.add(ground);

var title = new Label("My Scene", Point(300, 30), "bold 24px Arial");
title.fillColor = "white";
title.textAlign = "center";
canvas.add(title);
\`\`\`

### Keyboard Input (Vanilla JS)

\`\`\`js
var keys = {};
document.addEventListener("keydown", function(e) { keys[e.key] = true; });
document.addEventListener("keyup",   function(e) { keys[e.key] = false; });

canvas.startLoop(function(dt) {
  canvas.clear();
  if (keys["ArrowLeft"])  player.x -= 200 * dt;
  if (keys["ArrowRight"]) player.x += 200 * dt;
  if (keys["ArrowUp"])    player.y -= 200 * dt;
  if (keys["ArrowDown"])  player.y += 200 * dt;
  // ... draw player
});
\`\`\`

### Mouse Input (Vanilla JS)

\`\`\`js
var mouse = { x: 0, y: 0, down: false };
var canvasEl = document.getElementById("game");

canvasEl.addEventListener("mousemove", function(e) {
  var rect = canvasEl.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});
canvasEl.addEventListener("mousedown", function() { mouse.down = true;  });
canvasEl.addEventListener("mouseup",   function() { mouse.down = false; });

canvas.startLoop(function(dt) {
  canvas.clear();
  // Draw a circle at mouse position
  var cursor = new Circle(Point(mouse.x, mouse.y), 10);
  cursor.fillColor = mouse.down ? "red" : "white";
  canvas.add(cursor);
});
\`\`\`
        `,
      },
      {
        id: 'typescript',
        title: 'TypeScript Guide',
        content: `
## TypeScript — Typed Game Development

Import PivotX classes directly with full type safety. No React required.

### Installation

\`\`\`bash
npm i @colon-dev/pivotx
# or
yarn add @colon-dev/pivotx
\`\`\`

### Complete Example

\`\`\`ts
import { Canvas, Circle, Rectangle, Line, Label, Point } from 'pivotx';
import type { IPoint } from 'pivotx';

const canvas = new Canvas('game');
const W      = canvas.getWidth();
const H      = canvas.getHeight();

interface Ball {
  pos: IPoint;
  vel: IPoint;
  radius: number;
}

const ball: Ball = {
  pos:    Point(W / 2, H / 2),
  vel:    Point(220, 160),
  radius: 24,
};

canvas.startLoop((dt: number) => {
  canvas.clear();

  // Background
  const bg       = new Rectangle(Point(0, 0), W, H);
  bg.fillColor   = '#1a1a2e';
  canvas.add(bg);

  // Physics
  ball.pos.x += ball.vel.x * dt;
  ball.pos.y += ball.vel.y * dt;
  if (ball.pos.x < ball.radius || ball.pos.x > W - ball.radius) ball.vel.x *= -1;
  if (ball.pos.y < ball.radius || ball.pos.y > H - ball.radius) ball.vel.y *= -1;

  // Render
  const shape       = new Circle(ball.pos, ball.radius);
  shape.fillColor   = '#e94560';
  shape.strokeColor = 'white';
  shape.lineWidth   = 2;
  canvas.add(shape);
});
\`\`\`

### Type Safety

TypeScript will catch wrong types at compile time:

\`\`\`ts
circle.radius = "big";        // Error: Type 'string' is not assignable to type 'number'
new Canvas(42);               // Error: Argument of type 'number' is not assignable to 'string'
new Circle("center", 10);    // Error: expected IPoint, got string
\`\`\`

### Available Types

\`\`\`ts
import type { IPoint, IDrawable, IShape, CSSColor, LoopCallback } from 'pivotx';
\`\`\`

| Type | Description |
|------|-------------|
| \`IPoint\` | \`{ x: number, y: number }\` — coordinate object |
| \`IDrawable\` | Interface with \`tag\` and \`draw(ctx)\` — anything the canvas can render |
| \`IShape\` | Extends \`IDrawable\` — adds \`fillColor\`, \`strokeColor\`, \`lineWidth\` |
| \`CSSColor\` | \`string\` alias — any valid CSS color value |
| \`LoopCallback\` | \`(dt: number) => void\` — game loop callback type |

### Custom Shapes (TypeScript)

Implement \`IDrawable\` to create your own shapes:

\`\`\`ts
import { Canvas, Point } from 'pivotx';
import type { IDrawable } from 'pivotx';

class Star implements IDrawable {
  readonly tag = 'star';

  constructor(
    public cx: number, public cy: number,
    public points: number,
    public outer: number, public inner: number,
    public color = 'gold'
  ) {}

  draw(ctx: CanvasRenderingContext2D): void {
    const step = Math.PI / this.points;
    ctx.beginPath();
    for (let i = 0; i < 2 * this.points; i++) {
      const r   = i % 2 === 0 ? this.outer : this.inner;
      const ang = i * step - Math.PI / 2;
      i === 0
        ? ctx.moveTo(this.cx + Math.cos(ang) * r, this.cy + Math.sin(ang) * r)
        : ctx.lineTo(this.cx + Math.cos(ang) * r, this.cy + Math.sin(ang) * r);
    }
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

const canvas = new Canvas('game');
canvas.add(new Star(300, 200, 5, 60, 25, '#FFD700'));
\`\`\`

### Stopping the Loop

\`\`\`ts
canvas.startLoop((dt) => {
  // game logic...
  if (gameOver) {
    canvas.stopLoop();  // stops the rAF loop
  }
});
\`\`\`

### Accessing the Raw Context

For advanced rendering beyond built-in shapes:

\`\`\`ts
const ctx = canvas.ctx;  // CanvasRenderingContext2D

// Use raw canvas API alongside PivotX shapes
canvas.startLoop((dt) => {
  canvas.clear();
  canvas.add(myShape);

  // Custom gradient
  const grad = ctx.createLinearGradient(0, 0, 600, 0);
  grad.addColorStop(0, 'red');
  grad.addColorStop(1, 'blue');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 380, 600, 20);
});
\`\`\`
        `,
      },
      {
        id: 'core-api',
        title: 'Core API Reference',
        content: `
## Core API Reference

These classes and functions are available in all modes (Vanilla JS, TypeScript, React).

### Point(x, y)

Creates a plain \`{ x, y }\` coordinate object. Used everywhere positions are needed.

\`\`\`js
var p = Point(100, 200);
// p.x === 100, p.y === 200
\`\`\`

### Canvas

Wraps a \`<canvas>\` DOM element.

\`\`\`js
var canvas = new Canvas("myCanvasId");
\`\`\`

| Method | Returns | Description |
|---|---|---|
| \`getWidth()\` | \`number\` | Canvas width in pixels |
| \`getHeight()\` | \`number\` | Canvas height in pixels |
| \`getCenter()\` | \`IPoint\` | Centre point of the canvas |
| \`clear()\` | \`void\` | Erase everything — call at start of each frame |
| \`add(shape)\` | \`void\` | Draw any \`IDrawable\` immediately |
| \`startLoop(fn)\` | \`void\` | Start rAF loop, \`fn(dt)\` called each frame |
| \`stopLoop()\` | \`void\` | Stop the running loop |
| \`ctx\` | \`CanvasRenderingContext2D\` | Raw 2D context for advanced use |

### Circle

\`\`\`js
var c = new Circle(Point(x, y), radius);
c.fillColor   = "#e94560";
c.strokeColor = "white";
c.lineWidth   = 2;
canvas.add(c);
\`\`\`

| Property | Type | Description |
|---|---|---|
| \`centerPoint\` | \`IPoint\` | Centre position |
| \`radius\` | \`number\` | Radius in pixels |
| \`fillColor\` | \`string / null\` | CSS fill colour |
| \`strokeColor\` | \`string / null\` | CSS outline colour |
| \`lineWidth\` | \`number\` | Outline thickness |

### Rectangle

\`\`\`js
var r = new Rectangle(Point(x, y), width, height);
r.fillColor = "#0f3460";
canvas.add(r);
\`\`\`

\`Point(x, y)\` is the **top-left corner**.

| Property | Type | Description |
|---|---|---|
| \`position\` | \`IPoint\` | Top-left corner |
| \`width\` | \`number\` | Width in pixels |
| \`height\` | \`number\` | Height in pixels |
| \`fillColor\` | \`string / null\` | CSS fill colour |
| \`strokeColor\` | \`string / null\` | CSS outline colour |
| \`lineWidth\` | \`number\` | Outline thickness |

### Line

\`\`\`js
var l = new Line(Point(x1, y1), Point(x2, y2));
l.strokeColor = "#ffffff";
l.lineWidth   = 2;
canvas.add(l);
\`\`\`

| Property | Type | Description |
|---|---|---|
| \`startPoint\` | \`IPoint\` | Start coordinate |
| \`endPoint\` | \`IPoint\` | End coordinate |
| \`strokeColor\` | \`string\` | Line colour |
| \`lineWidth\` | \`number\` | Line thickness |

### Label

\`\`\`js
var l = new Label("text", Point(x, y), "20px Arial");
l.fillColor = "white";
l.textAlign = "center";
canvas.add(l);
\`\`\`

\`font\` is optional, defaults to \`"16px Arial"\`.

| Property | Type | Default | Description |
|---|---|---|---|
| \`text\` | \`string\` | — | Text to display |
| \`position\` | \`IPoint\` | — | Anchor point |
| \`font\` | \`string\` | \`"16px Arial"\` | CSS font string |
| \`fillColor\` | \`string\` | \`"#000"\` | Text colour |
| \`textAlign\` | \`"left" / "center" / "right"\` | \`"center"\` | Horizontal anchor |
| \`textBaseline\` | \`"top" / "middle" / "bottom"\` | \`"middle"\` | Vertical anchor |
        `,
      },
      {
        id: 'react-components',
        title: 'React Components',
        content: `
## React Components

Import from \`pivotx/react\`. These are declarative wrappers around the core classes.

### PivotCanvas

The root component. All shape components must be inside it.

\`\`\`tsx
<PivotCanvas width={800} height={600} background="#1a1a2e">
  {/* children */}
</PivotCanvas>
\`\`\`

| Prop | Type | Default | Description |
|---|---|---|---|
| \`width\` | \`number\` | \`600\` | Width in pixels |
| \`height\` | \`number\` | \`400\` | Height in pixels |
| \`background\` | \`string\` | transparent | CSS background |
| \`ref\` | \`PivotCanvasHandle\` | — | Access \`.ctx\`, \`.element\`, \`.clear()\` |

### PivotCircle

\`\`\`tsx
<PivotCircle
  center={{ x: 200, y: 150 }}
  radius={30}
  fill="#00ff00"
  stroke="#ffffff"
  lineWidth={1}
/>
\`\`\`

### PivotRectangle

\`\`\`tsx
<PivotRectangle
  position={{ x: 10, y: 20 }}
  width={100}
  height={50}
  fill="#ff0000"
  stroke="#ffffff"
  lineWidth={2}
/>
\`\`\`

### PivotLine

\`\`\`tsx
<PivotLine
  start={{ x: 0, y: 0 }}
  end={{ x: 100, y: 100 }}
  stroke="#ffffff"
  lineWidth={2}
/>
\`\`\`

### PivotLabel

\`\`\`tsx
<PivotLabel
  text="Hello PivotX!"
  position={{ x: 400, y: 50 }}
  font="bold 24px Arial"
  fill="#ffffff"
  textAlign="center"
/>
\`\`\`

### Prop Mapping

React components use simplified prop names that map to class properties:

| React Prop | Class Property | Used On |
|---|---|---|
| \`fill\` | \`fillColor\` | Circle, Rectangle, Label |
| \`stroke\` | \`strokeColor\` | Circle, Rectangle, Line |
| \`center\` | \`centerPoint\` | Circle |
| \`start\` | \`startPoint\` | Line |
| \`end\` | \`endPoint\` | Line |
| \`position\` | \`position\` | Rectangle, Label |
        `,
      },
      {
        id: 'react-hooks',
        title: 'React Hooks',
        content: `
## React Hooks

### useGameLoop

Starts an rAF loop for the lifetime of the component. Stops automatically on unmount.

\`\`\`tsx
import { useGameLoop } from 'pivotx/react';

useGameLoop((dt: number) => {
  // dt = seconds since last frame (~0.016 at 60fps)
  position.current.x += velocity * dt;
  setTick(t => t + 1); // Force re-render
});
\`\`\`

**Key points:**
- \`dt\` is capped to prevent large jumps when tab is inactive
- The loop automatically starts/stops with component lifecycle
- Use \`useRef\` for mutable game state to avoid stale closures

### Custom Hooks Pattern

PivotX games typically extract all logic into a custom hook:

\`\`\`tsx
function useMyGame(onExit: () => void) {
  const player = useRef({ x: 0, y: 0 });
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onExit]);

  useGameLoop((dt) => {
    // Update logic here
    setTick(t => t + 1);
  });

  return { player: player.current };
}
\`\`\`

### React vs Vanilla — Which to Choose?

| Feature | Vanilla JS / TypeScript | React |
|---|---|---|
| Setup | \`<script>\` tag or \`npm install\` | \`npm install\` + React project |
| Rendering | Imperative: \`canvas.add(shape)\` | Declarative: \`<PivotCircle />\` |
| Game Loop | \`canvas.startLoop(fn)\` | \`useGameLoop(fn)\` |
| State | Plain variables / objects | \`useRef\` + \`useState\` |
| Best for | Quick prototypes, non-React projects | React apps, complex UIs |
        `,
      },
      {
        id: 'patterns',
        title: 'Game Patterns',
        content: `
## Common Game Patterns

### Input Handling (React)

\`\`\`tsx
const keys = useRef<Record<string, boolean>>({});

useEffect(() => {
  const down = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true; };
  const up = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
  window.addEventListener('keydown', down);
  window.addEventListener('keyup', up);
  return () => {
    window.removeEventListener('keydown', down);
    window.removeEventListener('keyup', up);
  };
}, []);
\`\`\`

### Input Handling (Vanilla JS)

\`\`\`js
var keys = {};
document.addEventListener("keydown", function(e) { keys[e.key] = true;  });
document.addEventListener("keyup",   function(e) { keys[e.key] = false; });

canvas.startLoop(function(dt) {
  canvas.clear();
  if (keys["ArrowLeft"])  player.x -= speed * dt;
  if (keys["ArrowRight"]) player.x += speed * dt;
  // ...
});
\`\`\`

### Collision Detection (AABB)

Works the same in all modes:

\`\`\`js
function collides(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}
\`\`\`

### Particle System (Vanilla JS)

\`\`\`js
var particles = [];

function spawnParticles(x, y, color, count) {
  for (var i = 0; i < count; i++) {
    var angle = Math.random() * Math.PI * 2;
    var speed = 50 + Math.random() * 100;
    particles.push({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      color: color,
      size: 2 + Math.random() * 3,
    });
  }
}

canvas.startLoop(function(dt) {
  canvas.clear();
  // Update and draw particles
  for (var i = particles.length - 1; i >= 0; i--) {
    var p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) { particles.splice(i, 1); continue; }

    var c = new Circle(Point(p.x, p.y), p.size * p.life);
    c.fillColor = p.color;
    canvas.add(c);
  }
});
\`\`\`

### Particle System (React)

\`\`\`tsx
const particles = useRef<Particle[]>([]);

function spawnParticles(x: number, y: number, color: string, count: number) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 50 + Math.random() * 100;
    particles.current.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0, color,
      size: 2 + Math.random() * 3,
    });
  }
}
\`\`\`

### Responsive Canvas (Vanilla JS)

\`\`\`js
var canvasEl = document.getElementById("game");

function resize() {
  canvasEl.width  = window.innerWidth;
  canvasEl.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();
\`\`\`

### Responsive Canvas (React)

\`\`\`tsx
const [screenSize, setScreenSize] = useState({
  width: window.innerWidth,
  height: window.innerHeight,
});

useEffect(() => {
  const handleResize = () => {
    setScreenSize({ width: window.innerWidth, height: window.innerHeight });
  };
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
\`\`\`

### Screen Shake

\`\`\`js
// Works in both Vanilla JS and React
var screenShake = 0;

function addShake(amount) {
  screenShake = Math.min(20, screenShake + amount);
}

// In game loop:
screenShake *= 0.9; // Decay
var shakeX = screenShake > 0.1 ? (Math.random() - 0.5) * screenShake : 0;
var shakeY = screenShake > 0.1 ? (Math.random() - 0.5) * screenShake : 0;

// Offset all drawing by (shakeX, shakeY)
\`\`\`
        `,
      },
      {
        id: 'asset-loader',
        title: 'Loading Images (AssetLoader)',
        content: `
## Loading Images with AssetLoader

Before using images, sprites, or tile sheets you need to preload them. \`AssetLoader\` provides two static methods.

### Loading a single image

\`\`\`ts
import { AssetLoader } from '@colon-dev/pivotx';

const heroImg = await AssetLoader.loadImage('/sprites/hero.png');
// heroImg is a fully loaded HTMLImageElement
\`\`\`

### Batch-loading multiple images

For games with many assets, use \`loadAssets()\` to load everything in parallel:

\`\`\`ts
const assets = await AssetLoader.loadAssets({
  hero:       '/sprites/hero.png',
  enemy:      '/sprites/enemy.png',
  tileset:    '/tiles/ground.png',
  background: '/bg/sky.png',
});

// Access by name — all are HTMLImageElement
console.log(assets.hero.naturalWidth);
\`\`\`

### Error handling

\`\`\`ts
try {
  const img = await AssetLoader.loadImage('/missing.png');
} catch (err) {
  console.error(err.message);
  // "pIvotX: Failed to load image \\"/missing.png\\""
}
\`\`\`

### Typical setup pattern

\`\`\`ts
async function main() {
  // 1. Preload all assets
  const assets = await AssetLoader.loadAssets({
    hero:    '/sprites/hero.png',
    tileset: '/tiles/ground.png',
    sky:     '/bg/sky.png',
  });

  // 2. Create canvas
  const canvas = new Canvas('game');

  // 3. Build sprites, tilemaps, backgrounds from loaded assets
  const heroSheet = Sprite.createSheet(assets.hero, 32, 32);
  const heroSprite = new Sprite(Point(100, 200), heroSheet);

  // 4. Start game loop
  canvas.startLoop((dt) => {
    canvas.clear();
    canvas.add(heroSprite);
  });
}

main();
\`\`\`

### React Pattern

In React, load assets inside a \`useEffect\` or use a loading state:

\`\`\`tsx
import { AssetLoader } from 'pivotx/react';

const [assets, setAssets] = useState<Record<string, HTMLImageElement> | null>(null);

useEffect(() => {
  AssetLoader.loadAssets({
    hero:    '/sprites/hero.png',
    tileset: '/tiles/ground.png',
  }).then(setAssets);
}, []);

if (!assets) return <div>Loading...</div>;
// Now use assets.hero, assets.tileset in your PivotCanvas
\`\`\`
        `,
      },
      {
        id: 'game-image',
        title: 'Drawing Images (GameImage)',
        content: `
## Drawing Images with GameImage

\`GameImage\` draws a static image onto the canvas. Accepts a pre-loaded \`HTMLImageElement\` or a URL string.

### Vanilla JS — pre-loaded image (recommended)

\`\`\`ts
import { GameImage, AssetLoader, Point } from '@colon-dev/pivotx';

const img  = await AssetLoader.loadImage('/background.png');
const bg   = new GameImage(Point(0, 0), img);
bg.width   = 600;
bg.height  = 400;
canvas.add(bg);
\`\`\`

### Auto-loading from a URL

\`\`\`ts
const bg = new GameImage(Point(0, 0), '/background.png');
// draw() silently skips until the image is loaded
canvas.startLoop((dt) => {
  canvas.clear();
  canvas.add(bg);
});
\`\`\`

### Image properties

\`\`\`ts
const hero = new GameImage(Point(100, 50), heroImg);
hero.width       = 64;            // display width (null = natural)
hero.height      = 64;            // display height (null = natural)
hero.opacity     = 0.8;           // semi-transparent
hero.rotation    = Math.PI / 4;   // rotate 45°
hero.pixelPerfect = true;          // crisp pixel art when scaled
\`\`\`

### React — PivotImage component

\`\`\`tsx
import { PivotImage } from 'pivotx/react';

<PivotImage
  src={assets.hero}           // HTMLImageElement or URL string
  position={{ x: 100, y: 50 }}
  width={64}
  height={64}
  opacity={0.8}
  rotation={0}
  pixelPerfect
/>
\`\`\`

### Checking load state / swapping images

\`\`\`ts
if (hero.loaded) {
  console.log('Image is ready!');
}
hero.setSrc('/sprites/hero-powered-up.png');
// hero.loaded becomes false until new image finishes loading
\`\`\`
        `,
      },
      {
        id: 'sprites',
        title: 'Sprites & SpriteSheets',
        content: `
## Sprites & SpriteSheets

A **spritesheet** is a single image containing multiple frames arranged in a grid. \`Sprite\` draws one frame at a time.

### SpriteSheet layout

\`\`\`
┌───┬───┬───┬───┐
│ 0 │ 1 │ 2 │ 3 │   row 0
├───┼───┼───┼───┤
│ 4 │ 5 │ 6 │ 7 │   row 1
└───┴───┴───┴───┘
Frames numbered left-to-right, top-to-bottom.
\`\`\`

### Creating a SpriteSheet

\`\`\`ts
import { Sprite, AssetLoader, Point } from '@colon-dev/pivotx';

const img   = await AssetLoader.loadImage('/hero-sheet.png');
const sheet = Sprite.createSheet(img, 32, 32);

console.log(sheet.columns);     // auto-calculated
console.log(sheet.totalFrames); // auto-calculated
\`\`\`

If your sheet has unused cells at the end:

\`\`\`ts
const sheet = Sprite.createSheet(img, 64, 64, 12); // only first 12 frames
\`\`\`

### Drawing a sprite (Vanilla JS)

\`\`\`ts
const hero   = new Sprite(Point(100, 200), sheet);
hero.frame   = 0;     // first frame
hero.scale   = 2;     // draw at 2× size
canvas.add(hero);
\`\`\`

### Flipping and properties

\`\`\`ts
hero.flipX   = true;    // face left
hero.flipY   = true;    // upside down
hero.opacity = 0.5;     // ghost effect
hero.pixelPerfect = true;  // crisp pixel art (default: true)

// Computed dimensions
console.log(hero.drawWidth);   // frameWidth × scale
console.log(hero.drawHeight);  // frameHeight × scale
\`\`\`

### React — PivotSprite component

\`\`\`tsx
import { PivotSprite } from 'pivotx/react';

<PivotSprite
  position={{ x: 100, y: 200 }}
  sheet={heroSheet}
  frame={currentFrame}
  scale={2}
  flipX={facingLeft}
  pixelPerfect
/>
\`\`\`

### Manual frame cycling

\`\`\`ts
let timer = 0;
canvas.startLoop((dt) => {
  canvas.clear();
  timer += dt;
  if (timer > 0.15) {
    timer = 0;
    coin.frame = (coin.frame + 1) % sheet.totalFrames;
  }
  canvas.add(coin);
});
\`\`\`
        `,
      },
      {
        id: 'sprite-animator',
        title: 'Sprite Animation',
        content: `
## Sprite Animation with SpriteAnimator

\`SpriteAnimator\` manages named animation clips. Register clips, call \`play()\` to switch, and \`update(dt)\` every frame.

### Basic setup

\`\`\`ts
import { Sprite, SpriteAnimator, AssetLoader, Point } from '@colon-dev/pivotx';

const img    = await AssetLoader.loadImage('/hero-sheet.png');
const sheet  = Sprite.createSheet(img, 32, 32);
const hero   = new Sprite(Point(100, 200), sheet);
hero.scale   = 2;

const animator = new SpriteAnimator(hero);
animator
  .addClip('idle', { frames: [0, 1, 2, 3],    fps: 6,  loop: true  })
  .addClip('run',  { frames: [4, 5, 6, 7, 8], fps: 10, loop: true  })
  .addClip('jump', { frames: [9, 10],          fps: 4,  loop: false });

animator.play('idle');
\`\`\`

### Game loop integration

\`\`\`ts
canvas.startLoop((dt) => {
  canvas.clear();
  animator.update(dt);
  canvas.add(hero);
});
\`\`\`

### Switching animations based on input

\`\`\`ts
if (keys['ArrowRight']) {
  hero.flipX = false;
  animator.play('run');   // only resets if clip changed
} else if (keys['ArrowLeft']) {
  hero.flipX = true;
  animator.play('run');
} else {
  animator.play('idle');
}
\`\`\`

### Non-looping animations

\`\`\`ts
animator.addClip('attack', { frames: [11, 12, 13, 14], fps: 12, loop: false });

animator.play('attack');

// Check when finished:
if (animator.isFinished) {
  animator.play('idle');
}
\`\`\`

### State getters

\`\`\`ts
animator.currentClip;   // "idle", "run", etc.
animator.isPlaying;     // true if actively playing
animator.isFinished;    // true if non-looping clip ended
animator.currentIndex;  // index within the clip's frames array
\`\`\`

### React pattern

In React, you typically manage the animator in a \`useRef\` and update in \`useGameLoop\`:

\`\`\`tsx
const animatorRef = useRef<SpriteAnimator | null>(null);

// Initialize (once, after assets load)
const sheet = Sprite.createSheet(heroImg, 32, 32);
animatorRef.current = new SpriteAnimator(new Sprite({ x: 0, y: 0 }, sheet));
animatorRef.current
  .addClip('idle', { frames: [0, 1, 2, 3], fps: 6, loop: true })
  .addClip('run',  { frames: [4, 5, 6, 7], fps: 10, loop: true });
animatorRef.current.play('idle');

// In game loop
useGameLoop((dt) => {
  animatorRef.current?.update(dt);
  setTick(t => t + 1);
});

// In JSX — read the current frame
<PivotSprite
  position={playerPos}
  sheet={sheet}
  frame={animatorRef.current?.currentIndex ?? 0}
  scale={2}
/>
\`\`\`
        `,
      },
      {
        id: 'parallax',
        title: 'Parallax Backgrounds',
        content: `
## Parallax Scrolling Backgrounds

\`TiledBackground\` draws a repeating image that tiles seamlessly and supports parallax scrolling. Stack multiple layers for depth.

### Single scrolling background (Vanilla JS)

\`\`\`ts
import { TiledBackground, AssetLoader } from '@colon-dev/pivotx';

const skyImg = await AssetLoader.loadImage('/bg/sky.png');
const sky    = new TiledBackground(skyImg, 600, 400);

canvas.startLoop((dt) => {
  canvas.clear();
  sky.scroll(50 * dt);   // 50 pixels/sec
  canvas.add(sky);
});
\`\`\`

### Multi-layer parallax

Lower \`parallaxFactor\` = slower scroll = further away:

\`\`\`ts
const assets = await AssetLoader.loadAssets({
  sky:   '/bg/sky.png',
  hills: '/bg/hills.png',
  trees: '/bg/trees.png',
});

const sky   = new TiledBackground(assets.sky,   600, 400);
sky.parallaxFactor = 0.2;   // distant

const hills = new TiledBackground(assets.hills, 600, 400);
hills.parallaxFactor = 0.5; // mid-ground

const trees = new TiledBackground(assets.trees, 600, 400);
trees.parallaxFactor = 1.0; // foreground

canvas.startLoop((dt) => {
  canvas.clear();
  const scrollSpeed = 80 * dt;
  sky.scroll(scrollSpeed);
  hills.scroll(scrollSpeed);
  trees.scroll(scrollSpeed);

  // Draw back-to-front
  canvas.add(sky);
  canvas.add(hills);
  canvas.add(trees);
  canvas.add(playerSprite);
});
\`\`\`

### Properties

\`\`\`ts
bg.scrollX;          // current horizontal offset
bg.scrollY;          // current vertical offset
bg.opacity = 0.8;    // semi-transparent
bg.parallaxFactor;   // speed multiplier (0.2 → 1.0)

bg.scroll(dx, dy);   // advance offset (parallaxFactor applied automatically)
bg.setViewport(w, h); // update on resize
\`\`\`

### Vertical scrolling

\`\`\`ts
sky.scroll(0, 30 * dt);
\`\`\`
        `,
      },
      {
        id: 'camera',
        title: 'Camera',
        content: `
## Camera — Following the Player

The \`Camera\` class transforms the canvas context so the world scrolls while the player stays centred. Anything drawn between \`begin()\` and \`end()\` moves with the camera; anything after \`end()\` stays fixed (HUD).

### Basic follow (Vanilla JS)

\`\`\`ts
import { Camera } from '@colon-dev/pivotx';

const camera = new Camera(600, 400); // viewport size

canvas.startLoop((dt) => {
  canvas.clear();

  camera.follow(player.position, 0.08); // smooth follow
  camera.begin(canvas.ctx);

  // ── World space ── (scrolls with camera)
  canvas.add(tilemap);
  canvas.add(playerSprite);

  camera.end(canvas.ctx);

  // ── Screen space ── (fixed on screen)
  canvas.add(scoreLabel);
});
\`\`\`

### Clamping to world boundaries

\`\`\`ts
camera.follow(player.position, 0.08);
camera.clamp(worldWidth, worldHeight); // call AFTER follow
camera.begin(canvas.ctx);
\`\`\`

### Zoom

\`\`\`ts
camera.zoom = 2;    // 2× zoom in
camera.zoom = 0.5;  // zoom out
\`\`\`

### Coordinate conversion

\`\`\`ts
// Mouse click → world position
const worldPos = camera.screenToWorld({ x: mouseX, y: mouseY });

// World position → screen position (for UI indicators)
const screenPos = camera.worldToScreen(enemy.position);
\`\`\`

### React note

In React the imperative Camera class works best via \`useRef\`:

\`\`\`tsx
const cameraRef = useRef(new Camera(W, H));

useGameLoop((dt) => {
  cameraRef.current.follow(playerPos, 0.08);
  // Camera transforms are applied in useRef-based draw logic
});
\`\`\`

> **Note:** The React \`<PivotCanvas>\` re-draws children each render. For camera-based games, you may combine imperative core classes in your game hook, or use the world-to-screen offset pattern seen in the Aetherdrift game.
        `,
      },
      {
        id: 'platforms-collision',
        title: 'Platforms & AABB Collision',
        content: `
## Platforms & AABB Collision

\`Platform\` is a rectangle with a built-in AABB \`bounds\` getter. Use the collision functions for physics.

### Creating platforms

\`\`\`ts
import { Platform, Point, aabbOverlap, aabbOverlapDepth, createAABB }
  from '@colon-dev/pivotx';

// Solid ground
const ground = new Platform(Point(0, 350), 600, 50);
ground.fillColor = '#4a7c59';

// Jump-through ledge
const ledge = new Platform(Point(200, 250), 120, 16);
ledge.oneWay    = true;
ledge.fillColor = '#8b5e3c';
\`\`\`

### Creating an AABB from player state

\`\`\`ts
const playerBox = createAABB(player.x, player.y, player.width, player.height);
\`\`\`

### Simple overlap check

\`\`\`ts
if (aabbOverlap(playerBox, ground.bounds)) {
  // collision!
}
\`\`\`

### Collision resolution with overlap depth

\`\`\`ts
for (const plat of platforms) {
  const depth = aabbOverlapDepth(playerBox, plat.bounds);
  if (!depth) continue;

  if (depth.y < depth.x) {
    // Vertical collision
    if (player.vy > 0) {
      player.y -= depth.y;   // push up (landing)
      player.vy = 0;
      player.grounded = true;
    } else if (!plat.oneWay) {
      player.y += depth.y;   // push down (head bump)
      player.vy = 0;
    }
  } else if (!plat.oneWay) {
    // Horizontal collision (wall)
    if (player.vx > 0) player.x -= depth.x;
    else                player.x += depth.x;
    player.vx = 0;
  }
}
\`\`\`

### One-way platforms

When \`oneWay\` is true, skip collision unless the player is falling:

\`\`\`ts
if (plat.oneWay && player.vy <= 0) continue;
\`\`\`

### React — PivotPlatform component

\`\`\`tsx
import { PivotPlatform } from 'pivotx/react';

<PivotPlatform
  position={{ x: 0, y: 350 }}
  width={600}
  height={50}
  fill="#4a7c59"
  oneWay={false}
/>
\`\`\`
        `,
      },
      {
        id: 'tilemaps',
        title: 'Tilemaps',
        content: `
## Tilemaps — Grid-Based Levels

\`Tilemap\` renders a 2D grid of tiles from a \`SpriteSheet\` and provides collision queries.

### Building a tilemap

\`\`\`ts
import { Tilemap, Sprite, AssetLoader } from '@colon-dev/pivotx';

const tileImg = await AssetLoader.loadImage('/tiles/ground.png');
const sheet   = Sprite.createSheet(tileImg, 16, 16);

const mapData = [
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [-1, -1, -1,  0,  1,  1,  2, -1, -1, -1],
  [ 0,  1,  1,  1,  1,  1,  1,  1,  1,  2],
  [ 3,  4,  4,  4,  4,  4,  4,  4,  4,  5],
];

const tilemap = new Tilemap(sheet, mapData, 32);
\`\`\`

### Defining solid tiles

\`\`\`ts
tilemap.solidTiles = new Set([0, 1, 2, 3, 4, 5]);
\`\`\`

### Point-based collision check

\`\`\`ts
if (tilemap.isSolidAt(player.x + 16, player.y + 32)) {
  player.grounded = true;
}
\`\`\`

### Region-based collision (recommended)

\`\`\`ts
const playerAABB = createAABB(player.x, player.y, 32, 32);
const nearbyTiles = tilemap.getSolidTilesInRegion(playerAABB);

for (const tileBox of nearbyTiles) {
  const depth = aabbOverlapDepth(playerAABB, tileBox);
  if (depth) {
    if (depth.y < depth.x) {
      if (player.vy > 0) {
        player.y -= depth.y;
        player.vy = 0;
      } else {
        player.y += depth.y;
        player.vy = 0;
      }
    } else {
      if (player.vx > 0) player.x -= depth.x;
      else                player.x += depth.x;
      player.vx = 0;
    }
  }
}
\`\`\`

### Modifying tiles at runtime

\`\`\`ts
tilemap.setTile(col, row, -1);  // clear (breakable block)
tilemap.setTile(col, row, 6);   // replace with frame 6
\`\`\`

### Tilemap dimensions

\`\`\`ts
tilemap.rows;            // number of rows
tilemap.cols;            // number of columns
tilemap.tileSize;        // rendered tile size
tilemap.widthInPixels;   // cols × tileSize
tilemap.heightInPixels;  // rows × tileSize
\`\`\`

### Using with Camera

\`\`\`ts
camera.follow(player.position, 0.08);
camera.clamp(tilemap.widthInPixels, tilemap.heightInPixels);
camera.begin(canvas.ctx);

canvas.add(tilemap);
canvas.add(playerSprite);

camera.end(canvas.ctx);
canvas.add(hudLabel);
\`\`\`

### React — PivotTilemap component

\`\`\`tsx
import { PivotTilemap } from 'pivotx/react';

<PivotTilemap
  sheet={tileSheet}
  mapData={levelData}
  tileSize={32}
  solidTiles={solidTileSet}
  pixelPerfect
/>
\`\`\`
        `,
      },
      {
        id: 'platformer-example',
        title: 'Full Platformer Example',
        content: `
## Example — Putting It All Together (Platformer)

This example combines all the new features: asset loading, sprites, animation, tilemap collision, camera, and parallax backgrounds.

### Vanilla JS / TypeScript

\`\`\`ts
import {
  Canvas, Point, Label,
  AssetLoader, Sprite, SpriteAnimator,
  TiledBackground, Tilemap, Camera,
  createAABB, aabbOverlapDepth,
} from '@colon-dev/pivotx';

async function main() {
  const assets = await AssetLoader.loadAssets({
    hero:    '/sprites/hero-32x32.png',
    tileset: '/tiles/tileset-16x16.png',
    sky:     '/bg/sky.png',
    hills:   '/bg/hills.png',
  });

  const canvas = new Canvas('game');
  const W = canvas.getWidth();
  const H = canvas.getHeight();
  const camera = new Camera(W, H);

  // Parallax layers
  const sky  = new TiledBackground(assets.sky, W, H);
  sky.parallaxFactor = 0.2;
  const hills = new TiledBackground(assets.hills, W, H);
  hills.parallaxFactor = 0.5;

  // Tilemap
  const tileSheet = Sprite.createSheet(assets.tileset, 16, 16);
  const mapData = [
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1, 0, 1, 2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1, 0, 1, 2,-1,-1,-1,-1,-1, 0, 1, 1, 2,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [ 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    [ 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5],
  ];
  const tilemap = new Tilemap(tileSheet, mapData, 32);
  tilemap.solidTiles = new Set([0, 1, 2, 3, 4, 5]);

  // Player
  const heroSheet  = Sprite.createSheet(assets.hero, 32, 32);
  const heroSprite = new Sprite(Point(64, 200), heroSheet);
  heroSprite.scale = 2;

  const animator = new SpriteAnimator(heroSprite);
  animator
    .addClip('idle', { frames: [0, 1, 2, 3],    fps: 6,  loop: true })
    .addClip('run',  { frames: [4, 5, 6, 7, 8], fps: 10, loop: true })
    .addClip('jump', { frames: [9, 10],          fps: 4,  loop: false });
  animator.play('idle');

  const player = {
    x: 64, y: 200, vx: 0, vy: 0,
    width: 28, height: 56, speed: 200,
    jumpForce: -450, grounded: false,
  };
  const GRAVITY = 800;

  const keys: Record<string, boolean> = {};
  document.addEventListener('keydown', (e) => { keys[e.key] = true; });
  document.addEventListener('keyup',   (e) => { keys[e.key] = false; });

  canvas.startLoop((dt) => {
    canvas.clear();

    player.vx = 0;
    if (keys['ArrowRight'] || keys['d']) {
      player.vx = player.speed;
      heroSprite.flipX = false;
    }
    if (keys['ArrowLeft'] || keys['a']) {
      player.vx = -player.speed;
      heroSprite.flipX = true;
    }
    if ((keys[' '] || keys['ArrowUp']) && player.grounded) {
      player.vy = player.jumpForce;
      player.grounded = false;
    }

    player.vy += GRAVITY * dt;
    player.x += player.vx * dt;
    player.y += player.vy * dt;

    // Tilemap collision
    player.grounded = false;
    const nearby = tilemap.getSolidTilesInRegion(
      createAABB(player.x, player.y, player.width, player.height)
    );
    for (const tileBox of nearby) {
      const depth = aabbOverlapDepth(
        createAABB(player.x, player.y, player.width, player.height),
        tileBox,
      );
      if (!depth) continue;
      if (depth.y < depth.x) {
        if (player.vy > 0) {
          player.y -= depth.y; player.vy = 0;
          player.grounded = true;
        } else {
          player.y += depth.y; player.vy = 0;
        }
      } else {
        if (player.vx > 0) player.x -= depth.x;
        else player.x += depth.x;
        player.vx = 0;
      }
    }

    // Animation
    if (!player.grounded) animator.play('jump');
    else if (player.vx !== 0) animator.play('run');
    else animator.play('idle');
    animator.update(dt);
    heroSprite.position = Point(player.x - 2, player.y - 4);

    // Parallax
    sky.scroll(player.vx * dt);
    hills.scroll(player.vx * dt);

    // Draw
    camera.follow({ x: player.x, y: player.y }, 0.08);
    camera.clamp(tilemap.widthInPixels, tilemap.heightInPixels);

    canvas.add(sky);
    canvas.add(hills);
    camera.begin(canvas.ctx);
    canvas.add(tilemap);
    canvas.add(heroSprite);
    camera.end(canvas.ctx);
  });
}

main();
\`\`\`

### React version

See the **Crystal Caverns** playable game tutorial for a full React implementation using all these features with \`PivotCanvas\`, \`PivotSprite\`, \`PivotPlatform\`, \`PivotTilemap\`, and \`useGameLoop\`.
        `,
      },
    ],
  },
  {
    version: '1.0.x',
    label: 'v1.0.x',
    sections: [
      {
        id: 'overview',
        title: 'v1.0.x Overview',
        content: `
## PivotX v1.0.x

v1.0.x is the initial stable release of PivotX. It includes:

- **Canvas** — create and manage an HTML5 canvas
- **Shapes** — Circle, Rectangle, Line, Label
- **Game loop** — \`canvas.startLoop((dt) => { ... })\`
- **React layer** — \`PivotCanvas\`, \`PivotCircle\`, \`PivotRectangle\`, \`PivotLine\`, \`PivotLabel\`, \`useGameLoop\`

### Installation

\`\`\`bash
npm i @colon-dev/pivotx@1.0
\`\`\`

### Vanilla JS

\`\`\`html
<script src="https://cdn.jsdelivr.net/npm/pivotx@1.0/dist/pivotx.umd.min.js"></script>
<script>
  var { Canvas, Circle, Rectangle, Line, Label, Point } = PivotX;
  var canvas = new Canvas("game");
  canvas.startLoop(function(dt) {
    canvas.clear();
    // draw shapes here
  });
</script>
\`\`\`

### React

\`\`\`tsx
import { PivotCanvas, PivotCircle, PivotRectangle, PivotLabel, useGameLoop } from 'pivotx/react';

function Game() {
  useGameLoop((dt) => { /* update state */ });
  return (
    <PivotCanvas width={600} height={400} background="#1a1a2e">
      <PivotCircle center={{ x: 300, y: 200 }} radius={40} fill="tomato" />
    </PivotCanvas>
  );
}
\`\`\`

### Upgrade to v1.2.x

v1.2.x adds images, sprites, sprite animation, tilemaps, camera, parallax backgrounds, platforms, and AABB collision. See the **v1.2.x** docs for the full API.

\`\`\`bash
npm i @colon-dev/pivotx@latest
\`\`\`
        `,
      },
      {
        id: 'core-api',
        title: 'Core API Reference',
        content: `
## Core API (v1.0.x)

### Canvas

\`\`\`ts
const canvas = new Canvas('game');           // attach to <canvas id="game">
canvas.getWidth();                           // canvas width
canvas.getHeight();                          // canvas height
canvas.clear();                              // clear the canvas
canvas.startLoop((dt) => { ... });           // start game loop (dt in seconds)
\`\`\`

### Shapes

\`\`\`ts
// Circle
const c = new Circle(Point(100, 100), 40);
c.fillColor = 'tomato';
c.strokeColor = '#333';
c.lineWidth = 2;
canvas.add(c);

// Rectangle
const r = new Rectangle(Point(50, 50), 120, 80);
r.fillColor = 'skyblue';
canvas.add(r);

// Line
const l = new Line(Point(0, 0), Point(200, 150));
l.strokeColor = 'crimson';
l.lineWidth = 3;
canvas.add(l);

// Label
const label = new Label('Score: 0', Point(300, 20), 'bold 20px Arial');
label.fillColor = 'white';
canvas.add(label);
\`\`\`

### React Components

| Component | Key Props |
|---|---|
| \`PivotCanvas\` | \`width\`, \`height\`, \`background\` |
| \`PivotCircle\` | \`center\`, \`radius\`, \`fill\`, \`stroke\`, \`lineWidth\` |
| \`PivotRectangle\` | \`position\`, \`width\`, \`height\`, \`fill\`, \`stroke\` |
| \`PivotLine\` | \`start\`, \`end\`, \`stroke\`, \`lineWidth\` |
| \`PivotLabel\` | \`text\`, \`position\`, \`font\`, \`fill\`, \`textAlign\` |

### useGameLoop

\`\`\`tsx
useGameLoop((dt) => {
  // dt = seconds since last frame
  // Update game state here, then trigger re-render
  setTick(t => t + 1);
});
\`\`\`
        `,
      },
    ],
  },
  {
    version: '0.x',
    label: 'v0.x (Legacy)',
    sections: [
      {
        id: 'getting-started',
        title: 'Getting Started',
        content: `
## Getting Started with PivotX v0.x

> **Note:** v0.x is a legacy version. Consider upgrading to v1.x for the latest features.

### Installation

\`\`\`bash
npm i @colon-dev/pivotx@0
# or
yarn add @colon-dev/pivotx@0
\`\`\`

### Basic Usage (Vanilla JS)

\`\`\`html
<canvas id="game" width="640" height="480"></canvas>
<script src="https://cdn.jsdelivr.net/npm/pivotx@1/dist/pivotx.umd.js"></script>
<script>
  var { Canvas, Circle, Rectangle, Point } = PivotX;
  var canvas = new Canvas("game");

  var bg = new Rectangle(Point(0, 0), 640, 480);
  bg.fillColor = "#000";
  canvas.add(bg);

  var c = new Circle(Point(320, 240), 50);
  c.fillColor = "#ff0000";
  canvas.add(c);
</script>
\`\`\`

### Basic Usage (React)

\`\`\`tsx
import { PivotCanvas, PivotRectangle } from 'pivotx/react';

function App() {
  return (
    <PivotCanvas width={640} height={480} background="#000">
      <PivotRectangle
        position={{ x: 50, y: 50 }}
        width={100}
        height={100}
        fill="#ff0000"
      />
    </PivotCanvas>
  );
}
\`\`\`

### Differences from v1.x

- \`useGameLoop\` does not cap delta time — handle tab-switching manually
- No built-in \`PivotLine\` / \`Line\` component
- Limited TypeScript type definitions
- No \`IDrawable\` interface for custom shapes
- No screen-shake utilities
        `,
      },
      {
        id: 'components',
        title: 'API Reference',
        content: `
## API Reference (v0.x)

### Core Classes

- \`Canvas\` — Wraps a \`<canvas>\` element (\`getWidth\`, \`getHeight\`, \`clear\`, \`add\`, \`startLoop\`, \`stopLoop\`)
- \`Rectangle\` — Rectangle shape
- \`Circle\` — Circle shape
- \`Label\` — Text rendering
- \`Point(x, y)\` — Coordinate factory

> \`Line\` is not available in v0.x. Use a thin \`Rectangle\` as a workaround.

### React Components

- \`PivotCanvas\` — Root container
- \`PivotRectangle\` — Rectangle rendering
- \`PivotCircle\` — Circle rendering
- \`PivotLabel\` — Text rendering

> \`PivotLine\` is not available in v0.x.

### Examples

\`\`\`js
// Vanilla JS (v0.x)
var canvas = new Canvas("game");
var rect = new Rectangle(Point(10, 20), 100, 50);
rect.fillColor = "#ff0000";
canvas.add(rect);
\`\`\`

\`\`\`tsx
// React (v0.x)
<PivotCanvas width={640} height={480} background="#111">
  <PivotRectangle position={{ x: 10, y: 20 }} width={100} height={50} fill="#ff0000" />
  <PivotCircle center={{ x: 200, y: 150 }} radius={30} fill="#00ff00" />
</PivotCanvas>
\`\`\`
        `,
      },
      {
        id: 'hooks',
        title: 'Hooks API',
        content: `
## Hooks API (v0.x)

### useGameLoop

\`\`\`tsx
import { useGameLoop } from 'pivotx/react';

useGameLoop((deltaTime) => {
  // deltaTime in seconds
  updateGame(deltaTime);
});
\`\`\`

> In v0.x, \`useGameLoop\` does not cap delta time. When the browser tab is inactive and then refocused, \`dt\` can be very large, causing objects to teleport. Add your own cap:

\`\`\`tsx
useGameLoop((dt) => {
  dt = Math.min(dt, 0.1); // Cap at 100ms
  updateGame(dt);
});
\`\`\`
        `,
      },
    ],
  },
];
