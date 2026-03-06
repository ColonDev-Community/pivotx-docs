export interface GameTutorialData {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  features: string[];
  route: string;
  conceptsCovered: string[];
  codeBreakdown: CodeSection[];
}

export interface CodeSection {
  title: string;
  description: string;
  code: string;
  language: string;
}

export const GAME_TUTORIALS: GameTutorialData[] = [
  {
    id: 'bouncingball',
    title: 'Bouncing Ball',
    description: 'A simple physics animation demo — the perfect first PivotX project.',
    difficulty: 'beginner',
    tags: ['animation', 'physics', 'beginner'],
    features: [
      'PivotCanvas setup',
      'useGameLoop basics',
      'Simple physics (velocity & bounce)',
      'Responsive canvas sizing',
    ],
    route: '/game/bouncingball',
    conceptsCovered: [
      'Setting up PivotCanvas with width/height',
      'Using useGameLoop for animation',
      'useRef for mutable game state',
      'useState for triggering re-renders',
      'Basic ball physics with velocity reversal',
    ],
    codeBreakdown: [
      {
        title: '1. Imports & Setup',
        description: 'Import PivotX components and hooks. The game uses PivotCanvas as the root, PivotCircle for the ball, PivotRectangle for the background, and PivotLabel for text overlays.',
        code: `import { useRef, useState, useEffect } from 'react';
import {
  PivotCanvas,
  PivotCircle,
  PivotRectangle,
  PivotLabel,
  useGameLoop,
} from 'pivotx/react';
import { useExitToMenu } from '../../hooks/useExitToMenu';`,
        language: 'tsx',
      },
      {
        title: '2. State Management with useRef',
        description: 'Game state is stored in useRef to avoid re-render overhead. The ball has position (x, y), velocity (vx, vy), and radius (r). A separate useState counter triggers re-renders each frame.',
        code: `const ball = useRef({
  x: W / 2, y: H / 2,
  vx: 200, vy: 150,
  r: 20,
});
const [, setTick] = useState(0);`,
        language: 'tsx',
      },
      {
        title: '3. Game Loop — Physics Update',
        description: 'The useGameLoop hook runs every animation frame. Delta time (dt) ensures smooth movement regardless of frame rate. The ball moves by velocity × dt, then bounces off walls by reversing velocity.',
        code: `useGameLoop((dt) => {
  const b = ball.current;
  b.x += b.vx * dt;  // Move horizontally
  b.y += b.vy * dt;  // Move vertically

  // Bounce off walls
  if (b.x - b.r < 0 || b.x + b.r > W) b.vx *= -1;
  if (b.y - b.r < 0 || b.y + b.r > H) b.vy *= -1;

  setTick(t => t + 1); // Force re-render
});`,
        language: 'tsx',
      },
      {
        title: '4. Rendering',
        description: 'The JSX declares the visual scene. PivotCanvas wraps everything. PivotRectangle clears the background. PivotCircle draws the ball at its current position. PivotLabel shows debug info.',
        code: `return (
  <div style={{ width: '100vw', height: '100vh' }}>
    <PivotCanvas width={W} height={H} background="#1a1a2e">
      <PivotRectangle position={{ x: 0, y: 0 }}
        width={W} height={H} fill="#1a1a2e" />

      <PivotCircle
        center={{ x: ball.current.x, y: ball.current.y }}
        radius={ball.current.r}
        fill="#e94560"
        stroke="white"
        lineWidth={3}
      />

      <PivotLabel
        text={\`x: \${Math.round(ball.current.x)}  y: \${Math.round(ball.current.y)}\`}
        position={{ x: W / 2, y: 50 }}
        font="24px monospace"
        fill="rgba(255,255,255,0.8)"
        textAlign="center"
      />
    </PivotCanvas>
  </div>
);`,
        language: 'tsx',
      },
    ],
  },
  {
    id: 'playermovement',
    title: 'Player Movement',
    description: 'Keyboard-controlled character movement with WASD and arrow keys.',
    difficulty: 'beginner',
    tags: ['input', 'movement', 'keyboard', 'beginner'],
    features: [
      'Keyboard input handling',
      'WASD + Arrow key support',
      'Boundary clamping',
      'Score tracking',
    ],
    route: '/game/playermovement',
    conceptsCovered: [
      'Keyboard event listeners (keydown/keyup)',
      'Key state tracking with useRef',
      'Multi-directional movement',
      'Boundary detection and clamping',
      'ESC key to exit',
    ],
    codeBreakdown: [
      {
        title: '1. Key State Tracking',
        description: 'A ref stores which keys are currently pressed. This avoids event-driven movement (which stutters) and instead polls key state each frame for smooth movement.',
        code: `const keys = useRef<Record<string, boolean>>({});

useEffect(() => {
  const down = (e: KeyboardEvent) => {
    keys.current[e.key.toLowerCase()] = true;
    if (e.key === 'Escape') onExit();
  };
  const up = (e: KeyboardEvent) => {
    keys.current[e.key.toLowerCase()] = false;
  };
  window.addEventListener('keydown', down);
  window.addEventListener('keyup', up);
  return () => {
    window.removeEventListener('keydown', down);
    window.removeEventListener('keyup', up);
  };
}, [onExit]);`,
        language: 'tsx',
      },
      {
        title: '2. Movement in Game Loop',
        description: 'Each frame, check which keys are pressed and update position. Speed is relative to screen size for responsiveness. Boundary clamping prevents the player from leaving the canvas.',
        code: `useGameLoop((dt) => {
  const p = player.current;
  const speed = Math.min(W, H) * 0.5;

  if (keys.current['arrowleft'] || keys.current['a']) p.x -= speed * dt;
  if (keys.current['arrowright'] || keys.current['d']) p.x += speed * dt;
  if (keys.current['arrowup'] || keys.current['w']) p.y -= speed * dt;
  if (keys.current['arrowdown'] || keys.current['s']) p.y += speed * dt;

  // Clamp to screen bounds
  const half = p.size / 2;
  p.x = Math.max(half, Math.min(W - half, p.x));
  p.y = Math.max(half, Math.min(H - half, p.y));

  score.current += dt * 10;
  setTick(t => t + 1);
});`,
        language: 'tsx',
      },
    ],
  },
  {
    id: 'staticscene',
    title: 'Static Scene',
    description: 'A beautiful landscape rendered purely with PivotX components — no game loop needed.',
    difficulty: 'beginner',
    tags: ['rendering', 'scene', 'static', 'beginner'],
    features: [
      'Static rendering (no game loop)',
      'Responsive layout',
      'Layered scene composition',
      'Multiple shape types',
    ],
    route: '/game/staticscene',
    conceptsCovered: [
      'PivotCanvas without useGameLoop',
      'Responsive sizing with window dimensions',
      'Layering shapes (painter\'s algorithm)',
      'Using relative positions (percentage of screen)',
    ],
    codeBreakdown: [
      {
        title: '1. Responsive Setup (No Game Loop)',
        description: 'This demo shows PivotX can render static scenes. No useGameLoop is needed — just resize handling. All positions use percentages of W and H for responsiveness.',
        code: `const [screenSize, setScreenSize] = useState({
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

const { width: W, height: H } = screenSize;`,
        language: 'tsx',
      },
      {
        title: '2. Scene Composition',
        description: 'Shapes are layered back-to-front (painter\'s algorithm). Sky, then ground, then sun, then rocks, then trees. Each element uses relative positioning.',
        code: `<PivotCanvas width={W} height={H} background="#87CEEB">
  {/* Sky */}
  <PivotRectangle position={{ x: 0, y: 0 }}
    width={W} height={H} fill="#87CEEB" />

  {/* Ground */}
  <PivotRectangle position={{ x: 0, y: H * 0.7 }}
    width={W} height={H * 0.3} fill="#8B6914" />

  {/* Sun */}
  <PivotCircle center={{ x: W * 0.85, y: H * 0.15 }}
    radius={H * 0.08} fill="#FFD700"
    stroke="#FFA500" lineWidth={3} />

  {/* Trees — trunk + canopy */}
  <PivotRectangle position={{ x: W * 0.15, y: H * 0.55 }}
    width={W * 0.02} height={H * 0.15} fill="#6B3A2A" />
  <PivotCircle center={{ x: W * 0.16, y: H * 0.48 }}
    radius={H * 0.08} fill="#228B22" />
</PivotCanvas>`,
        language: 'tsx',
      },
    ],
  },
  {
    id: 'spaceshooter',
    title: 'Space Shooter',
    description: 'A complete top-down space shooter with enemies, waves, power-ups, and explosions.',
    difficulty: 'intermediate',
    tags: ['shooter', 'enemies', 'power-ups', 'waves', 'combat'],
    features: [
      'Player ship with WASD movement',
      'Auto-fire and space-bar shooting',
      'Wave-based enemy spawning',
      'Three power-up types (health, fireRate, damage)',
      'Explosion particle effects',
      'Score and wave tracking HUD',
      'Game over and restart flow',
    ],
    route: '/game/spaceshooter',
    conceptsCovered: [
      'Custom game hook pattern (useSpaceShooter)',
      'Entity management with useRef arrays',
      'Wave spawn logic with timers',
      'Bullet collision detection (AABB)',
      'Power-up collection system',
      'Explosion animations',
      'Game state machine (playing → gameOver → restart)',
    ],
    codeBreakdown: [
      {
        title: '1. Type Definitions',
        description: 'Define TypeScript interfaces for every game entity. This ensures type safety and serves as documentation for the game\'s data model.',
        code: `interface GameObject {
  x: number; y: number;
  width: number; height: number;
}

interface Player extends GameObject {
  health: number; maxHealth: number;
  speed: number; fireRate: number;
  lastShot: number; damage: number;
}

interface Enemy extends GameObject {
  health: number; speed: number;
  points: number; color: string;
}

interface Bullet extends GameObject {
  vy: number; damage: number;
}

interface PowerUp extends GameObject {
  type: 'health' | 'fireRate' | 'damage';
  vy: number; collected: boolean;
}

interface GameState {
  playing: boolean; gameOver: boolean;
  score: number; wave: number;
  timeToNextWave: number;
}`,
        language: 'tsx',
      },
      {
        title: '2. Custom Game Hook Pattern',
        description: 'All game logic lives in a custom hook. This separates logic from rendering. The hook returns all state needed for rendering.',
        code: `function useSpaceShooter(onExit: () => void) {
  const player = useRef<Player>({...});
  const bullets = useRef<Bullet[]>([]);
  const enemies = useRef<Enemy[]>([]);
  const powerUps = useRef<PowerUp[]>([]);
  const explosions = useRef<Explosion[]>([]);
  const gameState = useRef<GameState>({...});
  const [, setTick] = useState(0);

  // ... game loop logic ...

  return {
    screenSize, gameState: gameState.current,
    player: player.current, bullets: bullets.current,
    enemies: enemies.current, powerUps: powerUps.current,
    explosions: explosions.current, restartGame,
  };
}`,
        language: 'tsx',
      },
      {
        title: '3. Power-Up Spawning',
        description: 'Power-ups spawn randomly with different types. Each frame, they move downward. When collected, they modify player stats.',
        code: `const spawnPowerUp = useCallback(() => {
  const types: Array<'health' | 'fireRate' | 'damage'> =
    ['health', 'fireRate', 'damage'];
  const powerUp: PowerUp = {
    x: Math.random() * (screenSize.width - 20),
    y: -20,
    width: 20, height: 20,
    type: types[Math.floor(Math.random() * types.length)],
    vy: 80,
    collected: false,
  };
  powerUps.current.push(powerUp);
}, [screenSize.width]);`,
        language: 'tsx',
      },
      {
        title: '4. Explosion Rendering',
        description: 'Explosions are time-based animations. Each explosion tracks elapsed time and renders an expanding, fading circle.',
        code: `{explosions.map((explosion, i) => {
  const progress = explosion.time / explosion.duration;
  const radius = 15 * (1 - progress);
  const alpha = 1 - progress;
  return (
    <PivotCircle
      key={i}
      center={{ x: explosion.x, y: explosion.y }}
      radius={radius}
      fill={\`rgba(255, 100, 0, \${alpha})\`}
    />
  );
})}`,
        language: 'tsx',
      },
    ],
  },
  {
    id: 'dungeon',
    title: 'Dungeon of Shadows',
    description: 'A full roguelike dungeon crawler with procedural generation, bosses, and loot.',
    difficulty: 'advanced',
    tags: ['roguelike', 'dungeon', 'procedural', 'combat', 'boss', 'loot'],
    features: [
      'Procedurally generated dungeon rooms with corridors',
      'Multiple enemy types (Slime, Skeleton, Demon, Boss)',
      'Melee & ranged combat with combo system',
      'Loot drops (Health, Shield, Speed, Damage, Multi-shot, XP)',
      'Level progression with increasing difficulty',
      'Minimap with player/enemy/exit dots',
      'Camera system following player',
      'Dash mechanic with cooldown',
      'Screen shake & particle effects',
      'Boss fights every 5 levels',
    ],
    route: '/game/dungeon',
    conceptsCovered: [
      'Procedural dungeon generation (rooms + corridors)',
      'Tile-based collision detection',
      'Camera following with offset',
      'View frustum culling for performance',
      'Combo counter with decay timer',
      'Multi-shot projectile patterns',
      'Invincibility frames (i-frames)',
      'Dash mechanic with velocity override',
      'Minimap rendering at different scale',
      'Entity lifecycle management',
    ],
    codeBreakdown: [
      {
        title: '1. Dungeon Generation',
        description: 'Rooms are placed randomly, then corridors connect them. The result is converted to floor/wall tile arrays for collision detection.',
        code: `// Room placement
interface Room { x: number; y: number; w: number; h: number; }

function generateDungeon(width: number, height: number): Dungeon {
  const rooms: Room[] = [];
  // Try placing rooms randomly, reject overlaps
  for (let i = 0; i < 20; i++) {
    const room = {
      x: randomInt(1, width - 8),
      y: randomInt(1, height - 8),
      w: randomInt(4, 8),
      h: randomInt(4, 8),
    };
    if (!rooms.some(r => overlaps(r, room))) {
      rooms.push(room);
    }
  }
  // Connect rooms with L-shaped corridors
  // Convert to tile arrays for collision
}`,
        language: 'tsx',
      },
      {
        title: '2. Camera System',
        description: 'The camera follows the player. All world positions are offset by the camera position when rendering, enabling scrolling.',
        code: `// Camera follows player
const camera = useRef({ x: 0, y: 0 });

// In game loop:
camera.current.x = player.current.x - W / 2 + player.current.width / 2;
camera.current.y = player.current.y - H / 2 + player.current.height / 2;

// In render — offset everything by camera:
<PivotRectangle
  position={{ x: enemy.x - cx, y: enemy.y - cy }}
  width={enemy.width}
  height={enemy.height}
  fill={enemy.color}
/>`,
        language: 'tsx',
      },
      {
        title: '3. View Frustum Culling',
        description: 'Only render entities visible on screen. This dramatically improves performance in large dungeons.',
        code: `const cx = camera.x;
const cy = camera.y;

const visible = (x: number, y: number, w: number, h: number) =>
  x + w > cx && x < cx + W && y + h > cy && y < cy + H;

// Only render visible floor tiles:
{dungeon.floor.filter(f => visible(f.x, f.y, f.w, f.h)).map((f, i) => (
  <PivotRectangle key={\`f\${i}\`}
    position={{ x: f.x - cx, y: f.y - cy }}
    width={f.w} height={f.h}
    fill="#1a1a2e" />
))}`,
        language: 'tsx',
      },
      {
        title: '4. Dash Mechanic',
        description: 'Space key triggers a dash — a fast burst of movement with invincibility frames. Has a cooldown to prevent spam.',
        code: `// Dash activation
if (keys.current[' '] &&
    now - p.lastDash > p.dashCooldown &&
    (moveX !== 0 || moveY !== 0)) {
  p.isDashing = true;
  p.lastDash = now;
  const dashSpeed = p.speed * 4;
  p.dashVx = moveX * dashSpeed;
  p.dashVy = moveY * dashSpeed;
  p.invincibleUntil = now + p.dashDuration;
}`,
        language: 'tsx',
      },
      {
        title: '5. Loot System',
        description: 'Enemies drop loot on death. Each loot type modifies a different player stat. Loot has a lifetime and blinks before disappearing.',
        code: `if (rectCollides(p, loot)) {
  switch (l.type) {
    case 'health': p.health = Math.min(p.maxHealth, p.health + 25); break;
    case 'shield': p.shield = Math.min(p.maxShield, p.shield + 20); break;
    case 'speed': p.speed += 15; break;
    case 'damage': p.damage += 5; break;
    case 'multishot': p.multiShot = Math.min(5, p.multiShot + 1); break;
    case 'xp': p.xp += 30; break;
  }
  spawnParticles(l.x + 8, l.y + 8, lootColor(l.type), 8, 80);
}`,
        language: 'tsx',
      },
      {
        title: '6. Minimap',
        description: 'A scaled-down view of the dungeon in the corner. Shows rooms, player position (blue), enemies (red), and exit (green).',
        code: `const mmScale = 3;
const mmX = W - DUNGEON_W * mmScale - 15;
const mmY = 45;

{/* Rooms */}
{dungeon.rooms.map((room, i) => (
  <PivotRectangle key={\`mm\${i}\`}
    position={{ x: mmX + room.x * mmScale, y: mmY + room.y * mmScale }}
    width={room.w * mmScale} height={room.h * mmScale}
    fill="#1a1a2e" />
))}

{/* Player dot */}
<PivotCircle
  center={{ x: mmX + (player.x / TILE) * mmScale,
            y: mmY + (player.y / TILE) * mmScale }}
  radius={2} fill="#00ccff" />

{/* Enemy dots */}
{enemies.map((e, i) => (
  <PivotCircle key={\`mme\${i}\`}
    center={{ x: mmX + (e.x / TILE) * mmScale,
              y: mmY + (e.y / TILE) * mmScale }}
    radius={e.type === 'boss' ? 3 : 1.5} fill={e.color} />
))}`,
        language: 'tsx',
      },
    ],
  },
  {
    id: 'carrace',
    title: 'Nitro Highway',
    description: 'An endless police chase racing game with traffic, nitro boost, and wanted levels.',
    difficulty: 'advanced',
    tags: ['racing', 'endless', 'police', 'nitro', 'traffic'],
    features: [
      'Endless highway with increasing speed',
      'Police chase with AI cop cars',
      'Traffic vehicles to dodge',
      'Nitro boost with visual flames',
      'Coin & fuel collection',
      'Lane-based movement with smooth steering',
      'Car damage & repair pickups',
      'Score multiplier from near-misses',
      'Wanted level system',
      'Speedometer & HUD',
    ],
    route: '/game/carrace',
    conceptsCovered: [
      'Lane-based movement system',
      'Relative speed simulation (traffic moves at different speeds)',
      'Particle systems for sparks, smoke, flames',
      'Near-miss detection for score bonus',
      'Resource management (fuel, health, nitro)',
      'AI police car chasing behavior',
      'Pickup spawning and collection',
    ],
    codeBreakdown: [
      {
        title: '1. Lane System',
        description: 'Cars move between discrete lanes. The player\'s targetX smoothly interpolates to the selected lane position.',
        code: `const LANE_COUNT = 3;

function laneX(lane: number, roadLeft: number): number {
  const laneWidth = ROAD_WIDTH / LANE_COUNT;
  return roadLeft + lane * laneWidth + laneWidth / 2;
}

// Smooth steering toward target lane
player.current.targetX = laneX(selectedLane, roadLeft);
player.current.x += (player.current.targetX - player.current.x) * 8 * dt;`,
        language: 'tsx',
      },
      {
        title: '2. Resource Management',
        description: 'The player manages health, fuel, and nitro. Each depletes differently and can be replenished via pickups.',
        code: `player.current = {
  x: laneX(1, rl), y: screenSize.height - 150,
  width: 36, height: 70,
  speed: 300, maxSpeed: 800,
  targetX: laneX(1, rl),
  health: 100, maxHealth: 100,
  fuel: 100, maxFuel: 100,
  nitro: 50, maxNitro: 100,
  nitroActive: false,
  steering: 0, tilt: 0,
  invincibleUntil: 0,
};`,
        language: 'tsx',
      },
      {
        title: '3. Pickup System',
        description: 'Pickups spawn randomly in lanes. Each type has a different color and effect when collected.',
        code: `// Spawn pickups
if (Math.random() < dt * 0.5) {
  const lane = Math.floor(Math.random() * LANE_COUNT);
  const types = ['coin','coin','coin','fuel','fuel','nitro','repair','shield'];
  const type = types[Math.floor(Math.random() * types.length)];
  pickups.current.push({
    x: laneX(lane, rl) - 10, y: -30,
    width: 20, height: 20,
    type, bobPhase: Math.random() * Math.PI * 2,
  });
}

// Collect pickup
switch (pk.type) {
  case 'fuel':
    p.fuel = Math.min(p.maxFuel, p.fuel + 25);
    gs.message = '+FUEL'; break;
  case 'nitro':
    p.nitro = Math.min(p.maxNitro, p.nitro + 30);
    gs.message = '+NITRO'; break;
  case 'repair':
    p.health = Math.min(p.maxHealth, p.health + 30); break;
}`,
        language: 'tsx',
      },
      {
        title: '4. Nitro Flames Rendering',
        description: 'When nitro is active, animated flame particles render behind the car using randomized circles.',
        code: `{player.nitroActive && (
  <>
    <PivotCircle
      center={{
        x: player.x + 8 + sx,
        y: player.y + player.height + 8 + sy + Math.random() * 8
      }}
      radius={6 + Math.random() * 6}
      fill={\`rgba(255,\${Math.floor(100+Math.random()*100)},0,0.8)\`}
    />
    <PivotCircle
      center={{
        x: player.x + player.width - 8 + sx,
        y: player.y + player.height + 8 + sy + Math.random() * 8
      }}
      radius={6 + Math.random() * 6}
      fill={\`rgba(255,\${Math.floor(100+Math.random()*100)},0,0.8)\`}
    />
  </>
)}`,
        language: 'tsx',
      },
    ],
  },
  {
    id: 'nexus2500',
    title: 'NEXUS 2500: The Last Signal',
    description: 'A 5-chapter epic space shooter with story, bosses, and cinematic sequences. The most complex PivotX game in this collection.',
    difficulty: 'advanced',
    tags: ['epic', 'story', 'chapters', 'boss', 'cinematic', 'shooter'],
    features: [
      '5 story chapters with typewriter-effect narration',
      'Multiple enemy types per chapter (14 total variants)',
      'Unique boss fights with attack pattern phases',
      'Weapon upgrade system (4 levels)',
      'Shield and energy management',
      'Special attack system',
      'Combo counter with multiplier',
      'Chapter-specific backgrounds and star colors',
      'Boss intro cinematics',
      'Victory epilogue sequence',
      'Screen shake and particle explosions',
    ],
    route: '/game/nexus2500',
    conceptsCovered: [
      'Multi-phase game state machine (title → story → playing → boss_intro → boss_fight → chapter_complete → victory)',
      'Data-driven chapter system',
      'Enemy variant configuration with behavior patterns',
      'Boss AI with phase-based attack patterns',
      'Typewriter text animation',
      'Weapon level scaling',
      'Shield energy drain mechanic',
      'Combo system with timer decay',
    ],
    codeBreakdown: [
      {
        title: '1. Game Phase State Machine',
        description: 'The game uses a phase-based state machine. Each phase renders a completely different screen.',
        code: `type GamePhase = 'title' | 'story' | 'playing' | 'boss_intro'
  | 'boss_fight' | 'chapter_complete' | 'game_over' | 'victory';

// In render, each phase returns different JSX:
if (gs.phase === 'title') return <TitleScreen />;
if (gs.phase === 'story') return <StoryScreen />;
if (gs.phase === 'boss_intro') return <BossIntroScreen />;
if (gs.phase === 'chapter_complete') return <ChapterCompleteScreen />;
if (gs.phase === 'game_over') return <GameOverScreen />;
if (gs.phase === 'victory') return <VictoryScreen />;
// Default: gameplay render`,
        language: 'tsx',
      },
      {
        title: '2. Data-Driven Chapter System',
        description: 'Each chapter is defined as data, not code. This makes adding new chapters trivial.',
        code: `interface ChapterData {
  title: string; subtitle: string;
  story: string[];
  bgColor: string; starColor: string;
  waves: number;
  enemyTypes: EnemyVariant[];
  bossType: EnemyVariant;
  bossName: string;
  bossStory: string;
}

const CHAPTERS: ChapterData[] = [
  {
    title: 'CHAPTER I',
    subtitle: 'GHOST IN THE MACHINE',
    story: ['The year is 2487...', ...],
    bgColor: '#050510', starColor: '#aabbff',
    waves: 5,
    enemyTypes: ['drone', 'fighter'],
    bossType: 'boss_ai',
    bossName: 'PROMETHEUS CORE',
    bossStory: 'The rogue AI\\'s command vessel emerges...',
  },
  // ... 4 more chapters
];`,
        language: 'tsx',
      },
      {
        title: '3. Enemy Variant Configuration',
        description: '14 enemy types are defined as stat blocks. The game reads these configs to spawn enemies, keeping logic generic.',
        code: `type EnemyVariant = 'drone' | 'fighter' | 'bomber' | 'elite'
  | 'pirate' | 'bioship' | 'biobomber'
  | 'guardian' | 'sentinel'
  | 'boss_ai' | 'boss_pirate' | 'boss_bio' | 'boss_guardian' | 'boss_nexus';

const ENEMY_CONFIGS = {
  drone:    { width: 18, height: 18, health: 20, speed: 150,
              behavior: 'straight', color: '#4488ff', ... },
  fighter:  { width: 22, height: 24, health: 40, speed: 120,
              behavior: 'zigzag', color: '#ff8844', ... },
  pirate:   { width: 26, height: 24, health: 60, speed: 100,
              behavior: 'zigzag', color: '#ff4444', ... },
  elite:    { width: 28, height: 30, health: 120, speed: 110,
              behavior: 'chase', color: '#ffaa00', ... },
  // ...
};`,
        language: 'tsx',
      },
      {
        title: '4. Weapon Level System',
        description: 'The player\'s weapon fires more bullets in wider patterns as it levels up. Each level adds new bullet angles.',
        code: `const fireWeapon = useCallback(() => {
  const p = player.current;
  const cx = p.x + p.width / 2;
  const top = p.y;
  const lvl = p.weaponLevel;

  // Level 1: Single shot
  bullets.current.push({
    x: cx - 1.5, y: top, width: 3, height: 15,
    vx: 0, vy: -700, damage: 15 + lvl * 3,
    color: '#00ffff', isPlayer: true, piercing: false, lifetime: 3
  });

  // Level 2+: Angled side shots
  if (lvl >= 2) {
    bullets.current.push({
      x: cx + 10, y: top + 6, vx: 40, vy: -650,
      damage: 15 + lvl * 3, ...
    });
  }

  // Level 3+: Wide spread
  if (lvl >= 3) {
    bullets.current.push({
      x: cx - 20, y: top + 12, vx: -80, vy: -600,
      damage: 12 + lvl * 2, ...
    });
  }
}, []);`,
        language: 'tsx',
      },
      {
        title: '5. Boss Attack Patterns',
        description: 'Bosses cycle through attack phases. Each phase fires a different bullet pattern — aimed shots, spreads, and barrages.',
        code: `const enemyFire = useCallback((e: Enemy) => {
  const cx = e.x + e.width / 2;
  const by = e.y + e.height;
  const p = player.current;
  const dx = (p.x + p.width / 2) - cx;
  const dy = (p.y + p.height / 2) - by;
  const d = Math.sqrt(dx * dx + dy * dy) || 1;
  const speed = 280 + gameState.current.chapter * 20;

  if (e.behavior === 'boss') {
    const phase = e.phase % 3;
    if (phase === 0) {
      // Aimed triple shot
      for (let i = -1; i <= 1; i++) {
        const spread = i * 0.15;
        bullets.current.push({
          x: cx, y: by, width: 6, height: 6,
          vx: (dx / d) * speed + spread * speed,
          vy: (dy / d) * speed,
          damage: e.damage, color: e.glowColor,
          isPlayer: false, piercing: false, lifetime: 4,
        });
      }
    }
    // phase 1: circular spray, phase 2: heavy barrage...
  }
}, []);`,
        language: 'tsx',
      },
      {
        title: '6. Typewriter Story Effect',
        description: 'Story text reveals character by character using a timer-based approach.',
        code: `// Story screen rendering
const lines = ch.story;
const revealedChars = Math.floor(gs.storyTimer * 40); // 40 chars/sec
let charCount = 0;

{lines.map((line, i) => {
  const lineStart = charCount;
  charCount += line.length;
  const visibleLen = Math.max(0,
    Math.min(line.length, revealedChars - lineStart));
  const text = line.substring(0, visibleLen);
  if (visibleLen === 0 && lineStart > revealedChars) return null;

  return (
    <PivotLabel key={\`sl\${i}\`}
      text={text || ' '}
      position={{ x: W / 2, y: 190 + i * 30 }}
      font="18px 'Courier New', monospace"
      fill={hexAlpha('#ccccdd', visibleLen / Math.max(1, line.length))}
      textAlign="center" />
  );
})}`,
        language: 'tsx',
      },
    ],
  },
  {
    id: 'aetherdrift',
    title: 'Aetherdrift',
    description: 'A full-featured side-scrolling platformer with 3 realms, 5 enemy types, 3 boss fights, wall-jumping, dashing, and a 3-hit combo system. Inspired by Hollow Knight, Super Mario, and Sonic.',
    difficulty: 'advanced',
    tags: ['platformer', 'combat', 'boss fights', 'procedural generation', 'particles', 'camera', 'modular architecture'],
    features: [
      'Coyote time & jump buffering for responsive platforming',
      'Variable jump height, double jump, wall slide & wall jump',
      'Invincible dash with cooldown',
      '3-hit sword combo with directional knockback',
      '5 enemy types with unique AI behaviors (patrol, fly sine, fly chase, teleport)',
      '3 multi-phase boss fights (Stone Colossus, Infernal Drake, Aether Devourer)',
      'Procedurally generated levels per realm',
      'Moving & breakable platforms, spike hazards',
      'Collectible Chrono Shards & health pickups',
      'Particle effects: jump dust, dash trail, hit sparks, death burst',
      'Smooth camera follow with look-ahead & screen shake',
      'Parallax scrolling background layers',
      'Full HUD: health hearts, shard counter, score, dash cooldown',
      'Modular architecture: 14 files across 7 sub-folders',
    ],
    route: '/game/aetherdrift',
    conceptsCovered: [
      'Modular game architecture with sub-folders',
      'Custom physics: gravity, AABB collision, resolution',
      'Platformer movement: coyote time, jump buffering, variable height',
      'Entity-Component pattern (Player, Enemy, Boss entities)',
      'Factory functions for game objects',
      'Camera system with smooth follow and screen shake',
      'Particle system with multiple spawner types',
      'Combat system: hitbox-based attacks, knockback, combos',
      'Procedural level generation',
      'Boss fight state machines with phase transitions',
      'Game phase management (title, playing, boss, victory)',
      'Frustum culling for performance',
      'Parallax scrolling backgrounds',
    ],
    codeBreakdown: [
      {
        title: '1. Project Structure',
        description: 'Aetherdrift is split into 14 files across 7 sub-folders. Each system is isolated and testable. The main hook orchestrates all systems, and the index.tsx handles rendering.',
        code: `// src/games/Aetherdrift/
// ├── index.tsx              — Entry point & PivotX rendering
// ├── types/index.ts         — All TypeScript interfaces
// ├── constants/index.ts     — Physics, player stats, realm definitions
// ├── entities/
// │   ├── Player.ts          — Player factory, movement, attack logic
// │   └── enemies.ts         — Enemy factory, AI behaviors, boss logic
// ├── objects/
// │   ├── platforms.ts       — Platform creation & update (moving/breakable)
// │   └── collectibles.ts    — Chrono shards, health pickups
// ├── systems/
// │   ├── physics.ts         — AABB collision, resolution, math helpers
// │   ├── camera.ts          — Smooth follow, screen shake
// │   ├── particles.ts       — Particle spawners & update
// │   └── combat.ts          — Attack resolution, projectile system
// ├── levels/
// │   └── generator.ts       — Procedural level generation
// └── hooks/
//     └── useAetherdrift.ts   — Main game hook`,
        language: 'text',
      },
      {
        title: '2. Types & Constants',
        description: 'Every entity, system, and game object has a well-defined TypeScript interface. Constants define all tunable game parameters — physics, player stats, enemy templates, boss templates, and realm configurations.',
        code: `// types/index.ts — Core entity interfaces
interface PlayerState extends Entity {
  health: number; maxHealth: number;
  speed: number; jumpForce: number;
  isGrounded: boolean; isWallSliding: boolean;
  wallDir: number;
  canDoubleJump: boolean; hasDoubleJumped: boolean;
  coyoteTimer: number; jumpBufferTimer: number;
  isDashing: boolean; dashCooldown: number;
  isAttacking: boolean; attackCombo: number;
  invincibleTimer: number; knockbackTimer: number;
  chronoShards: number; totalKills: number;
}

// constants/index.ts — Realm definitions
const REALMS: Realm[] = [
  {
    id: 0, name: 'Sky Ruins',
    subtitle: 'The Crumbling Heights',
    bgGradient: ['#0b1628', '#152244', '#1e3a5f'],
    platformColor: '#4a6a8a',
    enemyTypes: ['sprite', 'crawler'],
    bossType: 'colossus',
    levelWidth: 4500, difficulty: 1,
  },
  // ... Ember Depths, Void Spire
];`,
        language: 'tsx',
      },
      {
        title: '3. Platformer Physics',
        description: 'The player movement system implements coyote time (jump grace period after leaving a ledge), jump buffering (queue a jump slightly before landing), variable jump height (release to cut jump short), and wall mechanics.',
        code: `// entities/Player.ts — Movement system

// Coyote time: allows jumping briefly after walking off a platform
if (wasGrounded && !p.isGrounded) {
  p.coyoteTimer = COYOTE_TIME; // 0.1 seconds
}

const canJump = p.isGrounded || p.coyoteTimer > 0;
const wantsJump = p.jumpBufferTimer > 0;

if (wantsJump && canJump) {
  p.vy = p.jumpForce;         // -560
  p.isGrounded = false;
  p.coyoteTimer = 0;
  p.jumpBufferTimer = 0;
} else if (wantsJump && p.isWallSliding) {
  // Wall jump — push away from wall
  p.vx = -p.wallDir * WALL_JUMP_FORCE_X; // 360
  p.vy = WALL_JUMP_FORCE_Y;              // -500
  p.facingRight = p.wallDir < 0;
} else if (jumpPressed && !p.isGrounded && !p.hasDoubleJumped) {
  // Double jump
  p.vy = p.jumpForce * 0.85;
  p.hasDoubleJumped = true;
}

// Variable jump height — cut velocity when button released
if (jumpReleased && p.vy < 0) {
  p.vy *= VARIABLE_JUMP_MULTIPLIER; // 0.45
}`,
        language: 'tsx',
      },
      {
        title: '4. Enemy AI Behaviors',
        description: 'Five enemy types with distinct AI: Sprites float in sine waves, Crawlers patrol and chase, Fire Wisps fly toward the player, Magma Slugs patrol and shoot, Void Shades teleport near the player.',
        code: `// entities/enemies.ts — AI switches

switch (e.behavior) {
  case 'patrol': {
    // Chase if player is near, otherwise walk back and forth
    if (dist < e.detectionRange) {
      e.vx = Math.sign(dx) * e.speed * 1.3;
    } else {
      e.vx = e.patrolDir * e.speed;
      if (Math.abs(e.x - e.spawnX) > e.patrolRange) {
        e.patrolDir *= -1;
      }
    }
    break;
  }
  case 'fly_chase': {
    // Fly directly toward player
    const angle = Math.atan2(playerCY - eCY, playerCX - eCX);
    e.vx = Math.cos(angle) * e.speed;
    e.vy = Math.sin(angle) * e.speed;
    break;
  }
  case 'teleport': {
    // Void shade: teleport near player periodically
    if (timeSinceLastAttack >= e.attackCooldown) {
      const side = Math.random() > 0.5 ? 1 : -1;
      e.x = player.x + side * 80;
      e.vx = -side * e.speed * 1.5;
    }
    break;
  }
}`,
        language: 'tsx',
      },
      {
        title: '5. Boss Fight State Machine',
        description: 'Each boss has multiple phases triggered by health thresholds. The Stone Colossus ground-slams and charges. The Infernal Drake sprays fire and dashes. The Aether Devourer teleports, fires void beams, and launches projectile rings.',
        code: `// entities/enemies.ts — Boss phase transitions

const healthPct = boss.health / boss.maxHealth;
if (healthPct <= 0.5 && boss.phase === 0) {
  boss.phase = 1;
  boss.invincibleTimer = 1.0; // brief invincibility on phase change
}
if (healthPct <= 0.2 && boss.phase === 1) {
  boss.phase = 2;
}

// Colossus attack patterns
if (boss.attackPattern === 0) {
  // Ground slam — shockwave
  boss.shockwaveTimer = 0.3;
  boss.vy = -200; // jump before slam
} else if (boss.attackPattern === 1) {
  // Charge at player
  boss.vx = Math.sign(dx) * 400;
  boss.isCharging = true;
} else if (boss.phase >= 1) {
  // Phase 2: falling rocks
  for (let i = 0; i < 3; i++) {
    projectiles.push(createProjectile(
      player.x + (i - 1) * 80, player.y - 400,
      0, 300, boss.damage, '#aaccee', false
    ));
  }
}`,
        language: 'tsx',
      },
      {
        title: '6. Level Generation',
        description: 'Each realm is procedurally generated with ground segments (with gaps), floating platforms, moving platforms, breakable platforms, spike hazards, enemies, collectibles, and a boss room at the end.',
        code: `// levels/generator.ts — Procedural generation

// Ground segments with gaps
while (gx < levelWidth - 400) {
  const segLen = 200 + Math.random() * 300;
  platforms.push(createGroundSegment(gx, groundY, segLen, ...));

  // Floating platform over gaps
  if (Math.random() < 0.7) {
    platforms.push(createPlatform(
      gx + gapLen / 2, groundY - 40 - Math.random() * 60,
      60 + Math.random() * 60, 16, 'solid', ...
    ));
  }
  gx += segLen + gap;
}

// Higher route platforms
for (let i = 0; i < floatCount; i++) {
  const isMoving = Math.random() < 0.2 + realm.difficulty * 0.05;
  const type = isMoving
    ? (Math.random() > 0.5 ? 'moving_h' : 'moving_v')
    : 'solid';
  // ...
}

// Enemies placed at strategic intervals
const spacing = (levelWidth - 800) / enemyCount;
for (let i = 0; i < enemyCount; i++) {
  enemies.push(createEnemy(randomType, 300 + i * spacing, ey));
}`,
        language: 'tsx',
      },
      {
        title: '7. Camera & Particles',
        description: 'The camera smoothly follows the player with look-ahead in the facing direction. Screen shake decays exponentially. Multiple particle spawner functions create distinct visual effects for every game event.',
        code: `// systems/camera.ts — Smooth follow with look-ahead
const lookAhead = player.facingRight ? 70 : -70;
cam.targetX = player.x - screenW / 2 + lookAhead;
const smoothFactor = 1 - Math.exp(-CAMERA_SMOOTH * dt);
cam.x = lerp(cam.x, cam.targetX, smoothFactor);

// Screen shake
cam.shakeAmount *= 0.9; // exponential decay

// systems/particles.ts — Spawner functions
spawnJumpDust(particles, x, y);      // on jump
spawnLandDust(particles, x, y);      // on landing
spawnDashTrail(particles, x, y, h);  // during dash
spawnHitSparks(particles, x, y);     // on enemy hit
spawnDeathBurst(particles, x, y);    // on enemy death
spawnCollectSparkle(particles, x, y); // on shard pickup
spawnAmbientParticle(particles, ...); // background ambiance
spawnShockwave(particles, x, y);     // boss ground slam`,
        language: 'tsx',
      },
      {
        title: '8. Rendering with PivotX',
        description: 'The index.tsx maps all game state to PivotX React components. Enemies are rendered with type-specific visual designs. The player has a multi-part sprite (body, head, hair, eye, cape, sword). Frustum culling skips off-screen objects.',
        code: `// index.tsx — Player rendering
{playerVisible && (
  <React.Fragment>
    {/* Cape trail */}
    <PivotRectangle
      position={{ x: facingRight ? sx - 8 : sx + width, y: sy + 4 }}
      width={10} height={height - 8}
      fill={PLAYER_CAPE_COLOR + '88'} />

    {/* Body */}
    <PivotRectangle
      position={{ x: sx, y: sy + 8 }}
      width={width} height={height - 8}
      fill={PLAYER_BODY_COLOR} />

    {/* Head */}
    <PivotCircle center={{ x: cx, y: sy + 6 }} radius={8}
      fill={PLAYER_BODY_COLOR} />

    {/* Hair */}
    <PivotCircle center={{ x: cx - dir * 2, y: sy + 2 }} radius={6}
      fill={PLAYER_HAIR_COLOR} />

    {/* Attack sword */}
    {p.isAttacking && (
      <PivotRectangle
        position={{ x: facingRight ? sx + width : sx - 26, y: sy + 6 }}
        width={26} height={4}
        fill={PLAYER_SWORD_COLOR} />
    )}
  </React.Fragment>
)}

// Frustum culling
if (sx + plat.width < -50 || sx > W + 50) return null;`,
        language: 'tsx',
      },
    ],
  },
  {
    id: 'crystalcaverns',
    title: 'Crystal Caverns',
    description: 'A tilemap-based platformer showcasing every new PivotX feature: tile collision, camera follow, parallax backgrounds, sprites, collectibles, and enemies.',
    difficulty: 'intermediate',
    tags: ['platformer', 'tilemap', 'camera', 'parallax', 'collision', 'sprites', 'collectibles'],
    features: [
      'Tilemap-based level with tile collision',
      'Camera following the player with smooth lerp',
      'Parallax scrolling backgrounds (3 layers)',
      'Procedurally placed crystals & enemies',
      'AABB collision with stomp-to-kill mechanics',
      'Screen shake on damage',
      'Particle effects (jump dust, land dust, crystal sparkle, damage)',
      'HUD with health hearts, crystal counter, score, timer',
      'Title screen, game over, and win screens',
    ],
    route: '/game/crystalcaverns',
    conceptsCovered: [
      'Tilemap collision using createTileCollider (point-based checks)',
      'Camera system with smooth follow, world clamping, and screen shake',
      'Parallax scrolling with depth-based offset',
      'Entity factory pattern: createPlayer(), createSlime(), createBat(), createSpike()',
      'Systems architecture: physics.ts, camera.ts, combat.ts, particles.ts, collectibles.ts',
      'Game state machine (title → playing → gameover/win)',
      'useRef for mutable game state, setTick for re-renders',
      'Responsive canvas sizing with resize listener',
      'useExitToMenu() hook for ESC → navigate home',
    ],
    codeBreakdown: [
      {
        title: '1. Types — Defining the Game World',
        description: 'All interfaces live in types/index.ts. PlayerState tracks position, velocity, animation, health, and collectibles. Enemy has patrol behaviour. LevelData holds the tilemap grid, crystals, enemies, and world dimensions.',
        code: `// types/index.ts (key types)

export interface PlayerState {
  x: number; y: number;
  vx: number; vy: number;
  width: number; height: number;
  speed: number; jumpForce: number;
  isGrounded: boolean; facingRight: boolean;
  animState: 'idle' | 'run' | 'jump' | 'fall';
  animFrame: number; animTimer: number;
  crystals: number;
  invincibleTimer: number;
  health: number; maxHealth: number;
}

export interface LevelData {
  platforms: PlatformData[];
  crystals: Crystal[];
  enemies: Enemy[];
  playerStart: Vec2;
  worldWidth: number; worldHeight: number;
  tileMap: number[][];   // row-major, -1 = empty
  tileSize: number;
}

export type GamePhase = 'title' | 'playing' | 'gameover' | 'win';`,
        language: 'typescript',
      },
      {
        title: '2. Constants — Tuning Values & Colors',
        description: 'All magic numbers live in constants/index.ts. Physics values, player stats, tile size, camera smoothing, animation FPS, and the full colour palette are defined here for easy tuning.',
        code: `// constants/index.ts (excerpts)

export const GRAVITY = 1200;
export const MAX_FALL_SPEED = 800;

export const PLAYER_SPEED = 220;
export const PLAYER_JUMP_FORCE = -480;
export const PLAYER_WIDTH = 20;
export const PLAYER_HEIGHT = 28;
export const PLAYER_MAX_HEALTH = 3;

export const TILE_SIZE = 32;
export const CAMERA_SMOOTH = 0.08;

export const CRYSTAL_COLORS = ['#e040fb', '#7c4dff', '#00e5ff', '#76ff03', '#ffd740'];
export const SLIME_COLOR = '#66bb6a';
export const BAT_COLOR = '#ab47bc';
export const SPIKE_COLOR = '#ef5350';`,
        language: 'typescript',
      },
      {
        title: '3. Level Generator — Building the Tilemap',
        description: 'levels/generator.ts builds a 50×18 tile grid. Ground tiles fill the bottom 2 rows, with gaps for pits. Floating platforms at 3 heights use addPlatformTiles(). Stone walls act as obstacles. Crystals and enemies are placed at specific tile coordinates.',
        code: `// levels/generator.ts (simplified)

export const SOLID_TILES = new Set([0, 1, 2, 3, 4, 5, 6, 7, 9]);

export function generateLevel(level: number): LevelData {
  const cols = 50, rows = 18;
  const tileMap: number[][] = [];
  for (let r = 0; r < rows; r++) tileMap.push(new Array(cols).fill(-1));

  // Ground floor
  for (let c = 0; c < cols; c++) {
    tileMap[rows - 2][c] = 1; // ground top
    tileMap[rows - 1][c] = 4; // ground fill
  }

  // Floating platforms
  addPlatformTiles(tileMap, 5, 12, 5);
  addPlatformTiles(tileMap, 14, 12, 4);

  // Gaps in ground
  for (let c = 11; c <= 13; c++) {
    tileMap[rows - 2][c] = -1;
    tileMap[rows - 1][c] = -1;
  }

  // Place crystals, enemies...
  const crystals = [ /* ... */ ];
  const enemies = [
    createSlime(6 * TILE_SIZE, (rows - 3) * TILE_SIZE, 80),
    createBat(12 * TILE_SIZE, 7 * TILE_SIZE, 100),
    createSpike(11 * TILE_SIZE, (rows - 2) * TILE_SIZE - 12),
  ];

  return { tileMap, tileSize: TILE_SIZE, crystals, enemies,
    playerStart: { x: 2 * TILE_SIZE, y: (rows - 3) * TILE_SIZE },
    worldWidth: cols * TILE_SIZE, worldHeight: rows * TILE_SIZE,
    platforms: [],
  };
}`,
        language: 'typescript',
      },
      {
        title: '4. Physics — Tilemap Collision Resolver',
        description: 'systems/physics.ts creates a closure-based tile collider. Given the tilemap grid and solid tile set, it checks player feet, head, left, and right edges against tiles and returns adjusted coordinates plus collision flags.',
        code: `// systems/physics.ts

export function createTileCollider(
  tileMap: number[][], solidTiles: Set<number>, tileSize: number,
) {
  const rows = tileMap.length;
  const cols = tileMap[0]?.length || 0;

  function isSolid(worldX: number, worldY: number): boolean {
    const col = Math.floor(worldX / tileSize);
    const row = Math.floor(worldY / tileSize);
    if (row < 0 || row >= rows || col < 0 || col >= cols) return false;
    return tileMap[row][col] >= 0 && solidTiles.has(tileMap[row][col]);
  }

  return function resolve(px: number, py: number, pw: number, ph: number) {
    let landed = false, hitHead = false, hitWall = false;

    // Check bottom (feet)
    if (isSolid(px + 2, py + ph) || isSolid(px + pw - 2, py + ph)) {
      py = Math.floor((py + ph) / tileSize) * tileSize - ph;
      landed = true;
    }
    // Check top, left, right...
    return { x: px, y: py, landed, hitHead, hitWall };
  };
}`,
        language: 'typescript',
      },
      {
        title: '5. Camera System — Smooth Follow & Shake',
        description: 'systems/camera.ts provides a smooth-follow camera with screen shake. updateCamera() lerps toward the player position and clamps to world bounds. addScreenShake() adds intensity that decays each frame.',
        code: `// systems/camera.ts

export function updateCamera(
  cam: CameraState, targetX: number, targetY: number,
  viewW: number, viewH: number, worldW: number, worldH: number,
): void {
  cam.targetX = targetX - viewW / 2;
  cam.targetY = targetY - viewH / 2;

  cam.x += (cam.targetX - cam.x) * CAMERA_SMOOTH;
  cam.y += (cam.targetY - cam.y) * CAMERA_SMOOTH;

  cam.x = Math.max(0, Math.min(cam.x, worldW - viewW));
  cam.y = Math.max(0, Math.min(cam.y, worldH - viewH));

  if (cam.shakeAmount > 0.1) {
    cam.shakeX = (Math.random() - 0.5) * cam.shakeAmount;
    cam.shakeY = (Math.random() - 0.5) * cam.shakeAmount;
    cam.shakeAmount *= CAMERA_SHAKE_DECAY;
  } else {
    cam.shakeX = cam.shakeY = cam.shakeAmount = 0;
  }
}

export function worldToScreen(wx: number, wy: number, cam: CameraState) {
  return { x: wx - cam.x + cam.shakeX, y: wy - cam.y + cam.shakeY };
}`,
        language: 'typescript',
      },
      {
        title: '6. Player Entity — Factory & Update',
        description: 'entities/Player.ts has createPlayer() (factory) and updatePlayer() (per-frame logic). Movement reads input, applies gravity, moves, then resolves tile collision. Animation state transitions between idle/run/jump/fall.',
        code: `// entities/Player.ts

export function createPlayer(x: number, y: number): PlayerState {
  return {
    x, y, vx: 0, vy: 0,
    width: PLAYER_WIDTH, height: PLAYER_HEIGHT,
    speed: PLAYER_SPEED, jumpForce: PLAYER_JUMP_FORCE,
    isGrounded: false, facingRight: true,
    animState: 'idle', animFrame: 0, animTimer: 0,
    crystals: 0, invincibleTimer: 0,
    health: PLAYER_MAX_HEALTH, maxHealth: PLAYER_MAX_HEALTH,
  };
}

export function updatePlayer(
  p: PlayerState, input: PlayerInput,
  platforms: PlatformData[], tileCollider: Function, dt: number,
): void {
  p.vx = 0;
  if (input.left) { p.vx = -p.speed; p.facingRight = false; }
  if (input.right) { p.vx = p.speed; p.facingRight = true; }
  if (input.jump && p.isGrounded) { p.vy = p.jumpForce; p.isGrounded = false; }

  p.vy += GRAVITY * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;

  // Tile collision
  const result = tileCollider(p.x, p.y, p.width, p.height);
  p.x = result.x; p.y = result.y;
  if (result.landed) { p.vy = 0; p.isGrounded = true; }
}`,
        language: 'typescript',
      },
      {
        title: '7. Combat — Stomp vs Damage',
        description: 'systems/combat.ts checks player-enemy overlap. If the player is falling and hitting the enemy\'s top 40%, it\'s a stomp (enemy dies, player bounces). Otherwise the player takes damage with knockback.',
        code: `// systems/combat.ts

export function checkEnemyDamage(
  player: PlayerState, enemies: Enemy[], particles: Particle[],
): boolean {
  if (player.invincibleTimer > 0) return false;

  for (const e of enemies) {
    if (!e.active || !boxOverlap(player, e)) continue;

    const isStomping = player.vy > 0 &&
      (player.y + player.height) - e.y < e.height * 0.4;

    if (isStomping && e.type !== 'spike') {
      e.active = false;
      player.vy = -250; // bounce up
      spawnDamageParticles(particles, e.x + e.width / 2, e.y);
      return false;
    } else {
      damagePlayer(player, e.damage);
      player.vx = player.x < e.x ? -150 : 150; // knockback
      return true;
    }
  }
  return false;
}`,
        language: 'typescript',
      },
      {
        title: '8. Main Hook — Orchestrating Everything',
        description: 'hooks/useCrystalCaverns.ts wires all systems together. It manages refs for player, camera, enemies, crystals, particles, and the level. The game loop caps dt, processes input, updates player, enemies, combat, crystals, camera, and particles each frame.',
        code: `// hooks/useCrystalCaverns.ts (game loop excerpt)

useGameLoop((dt) => {
  dt = Math.min(dt, 0.05); // cap delta time
  if (gs.phase !== 'playing') { setTick(t => t + 1); return; }
  gs.playTime += dt;

  const input: PlayerInput = {
    left:  keys.current['a'] || keys.current['arrowleft'],
    right: keys.current['d'] || keys.current['arrowright'],
    jump:  keys.current['w'] || keys.current['arrowup'] || keys.current[' '],
  };

  updatePlayer(p, input, [], tileCollider.current, dt);
  updateEnemies(enemies.current, dt);

  const tookDamage = checkEnemyDamage(p, enemies.current, particles.current);
  if (tookDamage) addScreenShake(cam, 8);

  const collected = updateCrystals(crystals.current, p, particles.current, dt);
  if (collected > 0) gs.score += collected * 100;

  if (crystals.current.every(c => c.collected)) gs.phase = 'win';
  if (p.health <= 0) gs.phase = 'gameover';

  updateCamera(cam, p.x + p.width/2, p.y + p.height/2, W, H, worldW, worldH);
  updateParticles(particles.current, dt);
  setTick(t => t + 1);
});`,
        language: 'typescript',
      },
      {
        title: '9. Rendering — Tilemap, Entities, Parallax, HUD',
        description: 'index.tsx reads all state from the hook and renders it. Background uses parallax layers (circles at different scroll depths). Tiles are rendered via a renderTile() switch. Enemies have type-specific renderers. The HUD draws health hearts, crystal count, score, and timer in screen space.',
        code: `// index.tsx (rendering excerpt)

const parallax = (depth: number) => -(cam.x * depth) % W;

// Parallax mountains (far)
{[0, 1, 2].map(i => {
  const px = parallax(0.1) + i * 400 - 200;
  return <PivotCircle center={{ x: px + 200, y: H * 0.65 }}
    radius={160 + i * 30} fill="#1a2a3a" />;
})}

// Tilemap rendering (with viewport culling)
{levelData.tileMap.map((row, rowIdx) =>
  row.map((tile, colIdx) => {
    if (tile < 0) return null;
    const pos = worldToScreen(colIdx * TILE_SIZE, rowIdx * TILE_SIZE);
    if (pos.x < -TILE_SIZE || pos.x > W + TILE_SIZE) return null;
    return renderTile(tile, pos.x, pos.y, TILE_SIZE, rowIdx, colIdx);
  })
)}

// HUD (screen space)
<PivotRectangle position={{ x: 0, y: 0 }} width={W} height={44}
  fill={HUD_BG_COLOR} />
{Array.from({ length: p.maxHealth }).map((_, i) => (
  <PivotCircle center={{ x: 24 + i * 28, y: 22 }} radius={10}
    fill={i < p.health ? HEALTH_FULL_COLOR : HEALTH_EMPTY_COLOR} />
))}
<PivotLabel text={\`💎 \${p.crystals} / \${gs.totalCrystals}\`}
  position={{ x: 140, y: 22 }} fill="#e040fb" />`,
        language: 'tsx',
      },
    ],
  },
];
