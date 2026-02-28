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

PivotX is a declarative 2D game engine for React. It provides a canvas-based rendering system with React components, making it easy to build games, animations, and interactive experiences.

### Installation

\`\`\`bash
npm install pivotx
\`\`\`

### Quick Start

Create your first PivotX scene in under a minute:

\`\`\`tsx
import { PivotCanvas, PivotCircle, PivotRectangle } from 'pivotx/react';

function MyFirstScene() {
  return (
    <PivotCanvas width={800} height={600} background="#1a1a2e">
      <PivotRectangle
        position={{ x: 100, y: 100 }}
        width={200}
        height={150}
        fill="#e94560"
      />
      <PivotCircle
        center={{ x: 400, y: 300 }}
        radius={50}
        fill="#0f3460"
        stroke="#ffffff"
        lineWidth={2}
      />
    </PivotCanvas>
  );
}
\`\`\`
        `,
        subsections: [
          {
            id: 'prerequisites',
            title: 'Prerequisites',
            content: `
### Prerequisites

- **Node.js** 16+ and npm/yarn
- **React** 18+ (PivotX uses React's rendering pipeline)
- **TypeScript** recommended but not required

### Project Setup

\`\`\`bash
npx create-react-app my-game --template typescript
cd my-game
npm install pivotx
\`\`\`

PivotX is linked as a local dependency in this demo:

\`\`\`json
"pivotx": "file:../pIvotX"
\`\`\`
            `,
          },
        ],
      },
      {
        id: 'core-concepts',
        title: 'Core Concepts',
        content: `
## Core Concepts

PivotX is built around a few key ideas:

### 1. Declarative Canvas Rendering

Instead of imperative \`ctx.fillRect()\` calls, you describe your scene with React components:

\`\`\`tsx
// Imperative (vanilla canvas)
ctx.fillStyle = '#ff0000';
ctx.fillRect(10, 20, 100, 50);

// Declarative (PivotX)
<PivotRectangle position={{ x: 10, y: 20 }} width={100} height={50} fill="#ff0000" />
\`\`\`

### 2. Game Loop Hook

The \`useGameLoop\` hook provides a frame-accurate delta-time game loop:

\`\`\`tsx
import { useGameLoop } from 'pivotx/react';

useGameLoop((dt: number) => {
  // dt = time since last frame in seconds
  player.x += player.speed * dt;
});
\`\`\`

### 3. State via Refs

For performance, game state is stored in \`useRef\` rather than \`useState\`:

\`\`\`tsx
const player = useRef({ x: 100, y: 100, speed: 200 });
const [, setTick] = useState(0);

useGameLoop((dt) => {
  player.current.x += player.current.speed * dt;
  setTick(t => t + 1); // Trigger re-render
});
\`\`\`
        `,
      },
      {
        id: 'components',
        title: 'Components API',
        content: `
## Components API

PivotX provides these core rendering components:

### PivotCanvas

The root container. All PivotX components must be children of a \`PivotCanvas\`.

\`\`\`tsx
<PivotCanvas width={800} height={600} background="#000000">
  {/* children */}
</PivotCanvas>
\`\`\`

| Prop | Type | Description |
|------|------|-------------|
| \`width\` | \`number\` | Canvas width in pixels |
| \`height\` | \`number\` | Canvas height in pixels |
| \`background\` | \`string\` | Background color |

### PivotRectangle

Renders a rectangle.

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

| Prop | Type | Description |
|------|------|-------------|
| \`position\` | \`{ x: number, y: number }\` | Top-left corner |
| \`width\` | \`number\` | Width |
| \`height\` | \`number\` | Height |
| \`fill\` | \`string\` | Fill color |
| \`stroke\` | \`string?\` | Stroke color |
| \`lineWidth\` | \`number?\` | Stroke width |

### PivotCircle

Renders a circle.

\`\`\`tsx
<PivotCircle
  center={{ x: 200, y: 150 }}
  radius={30}
  fill="#00ff00"
  stroke="#ffffff"
  lineWidth={1}
/>
\`\`\`

| Prop | Type | Description |
|------|------|-------------|
| \`center\` | \`{ x: number, y: number }\` | Center point |
| \`radius\` | \`number\` | Radius |
| \`fill\` | \`string\` | Fill color |
| \`stroke\` | \`string?\` | Stroke color |
| \`lineWidth\` | \`number?\` | Stroke width |

### PivotLabel

Renders text.

\`\`\`tsx
<PivotLabel
  text="Hello PivotX!"
  position={{ x: 400, y: 50 }}
  font="bold 24px Arial"
  fill="#ffffff"
  textAlign="center"
/>
\`\`\`

| Prop | Type | Description |
|------|------|-------------|
| \`text\` | \`string\` | Text content |
| \`position\` | \`{ x: number, y: number }\` | Position |
| \`font\` | \`string\` | CSS font string |
| \`fill\` | \`string\` | Text color |
| \`textAlign\` | \`string?\` | Alignment |

### PivotLine

Renders a line segment.

\`\`\`tsx
<PivotLine
  start={{ x: 0, y: 0 }}
  end={{ x: 100, y: 100 }}
  stroke="#ffffff"
  lineWidth={2}
/>
\`\`\`
        `,
      },
      {
        id: 'hooks',
        title: 'Hooks API',
        content: `
## Hooks API

### useGameLoop

The primary game loop hook. Calls your callback every animation frame with delta time.

\`\`\`tsx
import { useGameLoop } from 'pivotx/react';

useGameLoop((dt: number) => {
  // dt is in seconds (e.g., ~0.016 for 60fps)
  position.current.x += velocity * dt;
  setTick(t => t + 1); // Force re-render
});
\`\`\`

**Key points:**
- \`dt\` is capped to prevent large jumps when tab is inactive
- The loop automatically starts/stops with component lifecycle
- Use \`useRef\` for mutable game state to avoid stale closures

### Custom Hooks Pattern

PivotX games typically extract logic into a custom hook:

\`\`\`tsx
function useMyGame(onExit: () => void) {
  const player = useRef({ x: 0, y: 0 });
  const [, setTick] = useState(0);

  // Input handling
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onExit]);

  // Game loop
  useGameLoop((dt) => {
    // Update logic
    setTick(t => t + 1);
  });

  return { player: player.current };
}
\`\`\`
        `,
      },
      {
        id: 'patterns',
        title: 'Game Patterns',
        content: `
## Common Game Patterns

### Input Handling

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

### Mouse Tracking

\`\`\`tsx
const mouse = useRef({ x: 0, y: 0, down: false });

useEffect(() => {
  const move = (e: MouseEvent) => {
    mouse.current.x = e.clientX;
    mouse.current.y = e.clientY;
  };
  const down = () => { mouse.current.down = true; };
  const up = () => { mouse.current.down = false; };
  window.addEventListener('mousemove', move);
  window.addEventListener('mousedown', down);
  window.addEventListener('mouseup', up);
  return () => {
    window.removeEventListener('mousemove', move);
    window.removeEventListener('mousedown', down);
    window.removeEventListener('mouseup', up);
  };
}, []);
\`\`\`

### Collision Detection (AABB)

\`\`\`tsx
function collides(a: GameObject, b: GameObject): boolean {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}
\`\`\`

### Particle System

\`\`\`tsx
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  color: string; size: number;
}

function spawnParticles(x: number, y: number, color: string, count: number) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 50 + Math.random() * 100;
    particles.current.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.5 + Math.random() * 0.5,
      maxLife: 1,
      color,
      size: 2 + Math.random() * 3,
    });
  }
}
\`\`\`

### Screen Shake

\`\`\`tsx
const screenShake = useRef(0);

function addScreenShake(amount: number) {
  screenShake.current = Math.min(20, screenShake.current + amount);
}

// In game loop:
screenShake.current *= 0.9; // Decay

// In render:
const shakeX = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
const shakeY = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
\`\`\`

### Responsive Canvas

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

### Basic Usage

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

- \`useGameLoop\` has a slightly different API
- No built-in \`PivotLine\` component
- Limited TypeScript support
- No screen-shake utilities
        `,
      },
      {
        id: 'components',
        title: 'Components API',
        content: `
## Components API (v1.x)

### Available Components

- \`PivotCanvas\` — Root container
- \`PivotRectangle\` — Rectangle rendering
- \`PivotCircle\` — Circle rendering
- \`PivotLabel\` — Text rendering

> \`PivotLine\` is not available in v1.x. Use \`PivotRectangle\` with narrow dimensions as a workaround.

### PivotCanvas

\`\`\`tsx
<PivotCanvas width={640} height={480} background="#111">
  {/* children */}
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

> In v1.x, \`useGameLoop\` does not cap delta time. Handle tab-switching manually.
        `,
      },
    ],
  },
];
