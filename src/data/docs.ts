import { DocVersion } from '../types';

export const DOC_VERSIONS: DocVersion[] = [
  {
    version: '2.x',
    label: 'v2.x (Latest)',
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
npm install pivotx
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
npm install pivotx
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
    ],
  },
  {
    version: '1.x',
    label: 'v1.x (Legacy)',
    sections: [
      {
        id: 'getting-started',
        title: 'Getting Started',
        content: `
## Getting Started with PivotX v1.x

> **Note:** v1.x is a legacy version. Consider upgrading to v2.x for the latest features.

### Installation

\`\`\`bash
npm install pivotx@1
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

### Differences from v2.x

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
## API Reference (v1.x)

### Core Classes

- \`Canvas\` — Wraps a \`<canvas>\` element (\`getWidth\`, \`getHeight\`, \`clear\`, \`add\`, \`startLoop\`, \`stopLoop\`)
- \`Rectangle\` — Rectangle shape
- \`Circle\` — Circle shape
- \`Label\` — Text rendering
- \`Point(x, y)\` — Coordinate factory

> \`Line\` is not available in v1.x. Use a thin \`Rectangle\` as a workaround.

### React Components

- \`PivotCanvas\` — Root container
- \`PivotRectangle\` — Rectangle rendering
- \`PivotCircle\` — Circle rendering
- \`PivotLabel\` — Text rendering

> \`PivotLine\` is not available in v1.x.

### Examples

\`\`\`js
// Vanilla JS (v1.x)
var canvas = new Canvas("game");
var rect = new Rectangle(Point(10, 20), 100, 50);
rect.fillColor = "#ff0000";
canvas.add(rect);
\`\`\`

\`\`\`tsx
// React (v1.x)
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
## Hooks API (v1.x)

### useGameLoop

\`\`\`tsx
import { useGameLoop } from 'pivotx/react';

useGameLoop((deltaTime) => {
  // deltaTime in seconds
  updateGame(deltaTime);
});
\`\`\`

> In v1.x, \`useGameLoop\` does not cap delta time. When the browser tab is inactive and then refocused, \`dt\` can be very large, causing objects to teleport. Add your own cap:

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
