/**
 * pIvotX Game Collection - Multiple games in one app
 * 
 * Features:
 * - Menu system to choose between games
 * - All games run in full screen
 * - Space Shooter, Bouncing Ball, Player Movement, and Static Scene
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  PivotCanvas,
  PivotCircle,
  PivotRectangle,
  PivotLabel,
  PivotLine,
  useGameLoop,
} from 'pivotx/react';
import { Point } from 'pivotx';

// ─────────────────────────────────────────────────────────────────────────────
// Game Selection Menu
// ─────────────────────────────────────────────────────────────────────────────

interface MenuProps {
  onGameSelect: (game: string) => void;
}

function GameMenu({ onGameSelect }: MenuProps) {
  const [screenSize, setScreenSize] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        setSelectedIndex(prev => prev > 0 ? prev - 1 : games.length - 1);
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        setSelectedIndex(prev => prev < games.length - 1 ? prev + 1 : 0);
        e.preventDefault();
      } else if (e.key === 'Enter') {
        onGameSelect(games[selectedIndex].id);
        e.preventDefault();
      } else if (e.key >= '1' && e.key <= '4') {
        const gameIndex = parseInt(e.key) - 1;
        if (gameIndex < games.length) {
          setSelectedIndex(gameIndex);
          onGameSelect(games[gameIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onGameSelect, selectedIndex]);

  const games = [
    { id: 'spaceshooter', title: 'Space Shooter', description: 'Full combat game with enemies and power-ups' },
    { id: 'bouncingball', title: 'Bouncing Ball', description: 'Physics animation demo' },
    { id: 'playermovement', title: 'Player Movement', description: 'Keyboard controlled character' },
    { id: 'staticscene', title: 'Static Scene', description: 'Beautiful landscape render' }
  ];

  return (
    <div style={{ 
      margin: 0, 
      padding: 0, 
      overflow: 'hidden',
      background: '#111',
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <PivotCanvas width={screenSize.width} height={screenSize.height} background="#111">
        {/* Background effect */}
        <PivotRectangle
          position={{ x: 0, y: 0 }}
          width={screenSize.width}
          height={screenSize.height}
          fill="#111"
        />

        {/* Title */}
        <PivotLabel
          text="pIvotX Game Collection"
          position={{ x: screenSize.width / 2, y: 100 }}
          font="bold 48px Arial"
          fill="#ffffff"
          textAlign="center"
        />

        {/* Menu Items */}
        {games.map((game, index) => {
          const y = 200 + index * 120;
          const buttonWidth = 400;
          const buttonHeight = 80;
          const x = (screenSize.width - buttonWidth) / 2;
          const isSelected = index === selectedIndex;

          return (
            <React.Fragment key={game.id}>
              {/* Button Background */}
              <PivotRectangle
                position={{ x, y }}
                width={buttonWidth}
                height={buttonHeight}
                fill={isSelected ? "#444" : "#333"}
                stroke={isSelected ? "#00aaff" : "#555"}
                lineWidth={isSelected ? 3 : 2}
              />
              
              {/* Selection indicator */}
              {isSelected && (
                <PivotRectangle
                  position={{ x: x - 10, y: y + 35 }}
                  width={8}
                  height={10}
                  fill="#00aaff"
                />
              )}
              
              {/* Game Title */}
              <PivotLabel
                text={game.title}
                position={{ x: screenSize.width / 2, y: y + 25 }}
                font="bold 24px Arial"
                fill={isSelected ? "#ffffff" : "#00aaff"}
                textAlign="center"
              />
              
              {/* Game Description */}
              <PivotLabel
                text={game.description}
                position={{ x: screenSize.width / 2, y: y + 50 }}
                font="16px Arial"
                fill={isSelected ? "#fff" : "#ccc"}
                textAlign="center"
              />
              
              {/* Number indicator */}
              <PivotLabel
                text={`${index + 1}`}
                position={{ x: x + 30, y: y + 40 }}
                font="bold 18px Arial"
                fill="#ffff00"
                textAlign="center"
              />
            </React.Fragment>
          );
        })}

        {/* Instructions */}
        <PivotLabel
          text="↑↓ Arrow Keys: Navigate | Enter: Select | 1-4: Quick Select | ESC: Return to Menu"
          position={{ x: screenSize.width / 2, y: screenSize.height - 50 }}
          font="18px Arial"
          fill="#888"
          textAlign="center"
        />
      </PivotCanvas>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Static Scene Game (Full Screen)
// ─────────────────────────────────────────────────────────────────────────────

interface StaticSceneProps {
  onExit: () => void;
}

function StaticSceneGame({ onExit }: StaticSceneProps) {
  const [screenSize, setScreenSize] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  const { width: W, height: H } = screenSize;
  
  return (
    <div style={{ 
      margin: 0, padding: 0, overflow: 'hidden', background: '#87CEEB',
      width: '100vw', height: '100vh'
    }}>
      <PivotCanvas width={W} height={H} background="#87CEEB">
        {/* Sky */}
        <PivotRectangle position={{ x: 0, y: 0 }} width={W} height={H} fill="#87CEEB" />

        {/* Ground - scale to screen width */}
        <PivotRectangle 
          position={{ x: 0, y: H * 0.7 }} 
          width={W} 
          height={H * 0.3} 
          fill="#8B6914" 
        />

        {/* Sun - positioned relative to screen */}
        <PivotCircle 
          center={{ x: W * 0.85, y: H * 0.15 }} 
          radius={H * 0.08} 
          fill="#FFD700" 
          stroke="#FFA500" 
          lineWidth={3} 
        />

        {/* Mountain range */}
        <PivotCircle 
          center={{ x: W * 0.2, y: H * 0.8 }} 
          radius={H * 0.2} 
          fill="#666"
        />
        <PivotCircle 
          center={{ x: W * 0.4, y: H * 0.75 }} 
          radius={H * 0.15} 
          fill="#777"
        />
        <PivotCircle 
          center={{ x: W * 0.7, y: H * 0.82 }} 
          radius={H * 0.18} 
          fill="#555"
        />

        {/* Trees */}
        <PivotRectangle 
          position={{ x: W * 0.15, y: H * 0.55 }} 
          width={W * 0.02} 
          height={H * 0.15} 
          fill="#6B3A2A" 
        />
        <PivotCircle 
          center={{ x: W * 0.16, y: H * 0.48 }} 
          radius={H * 0.08} 
          fill="#228B22" 
        />

        <PivotRectangle 
          position={{ x: W * 0.6, y: H * 0.5 }} 
          width={W * 0.025} 
          height={H * 0.2} 
          fill="#6B3A2A" 
        />
        <PivotCircle 
          center={{ x: W * 0.6125, y: H * 0.4 }} 
          radius={H * 0.1} 
          fill="#228B22" 
        />

        {/* Title */}
        <PivotLabel 
          text="Static Landscape Scene" 
          position={{ x: W / 2, y: H * 0.1 }}
          font={`bold ${Math.max(24, W * 0.03)}px Arial`} 
          fill="#333" 
          textAlign="center"
        />

        {/* Instructions */}
        <PivotLabel
          text="Press ESC to return to menu"
          position={{ x: W / 2, y: H - 30 }}
          font="18px Arial"
          fill="rgba(0,0,0,0.7)"
          textAlign="center"
        />
      </PivotCanvas>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bouncing Ball Game (Full Screen)
// ─────────────────────────────────────────────────────────────────────────────

interface BouncingBallProps {
  onExit: () => void;
}

function BouncingBallGame({ onExit }: BouncingBallProps) {
  const [screenSize, setScreenSize] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  const { width: W, height: H } = screenSize;
  const ball = useRef({ x: W / 2, y: H / 2, vx: 300, vy: 200, r: Math.min(W, H) * 0.03 });
  const [, setTick] = useState(0);

  useGameLoop((dt) => {
    const b = ball.current;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.x - b.r < 0 || b.x + b.r > W) b.vx *= -1;
    if (b.y - b.r < 0 || b.y + b.r > H) b.vy *= -1;
    setTick(t => t + 1);
  });

  return (
    <div style={{ 
      margin: 0, padding: 0, overflow: 'hidden', background: '#1a1a2e',
      width: '100vw', height: '100vh'
    }}>
      <PivotCanvas width={W} height={H} background="#1a1a2e">
        <PivotRectangle position={{ x: 0, y: 0 }} width={W} height={H} fill="#1a1a2e" />

        <PivotCircle
          center={{ x: ball.current.x, y: ball.current.y }}
          radius={ball.current.r}
          fill="#e94560"
          stroke="white"
          lineWidth={3}
        />

        <PivotLabel
          text={`x: ${Math.round(ball.current.x)}  y: ${Math.round(ball.current.y)}`}
          position={{ x: W / 2, y: 50 }}
          font="24px monospace"
          fill="rgba(255,255,255,0.8)"
          textAlign="center"
        />

        <PivotLabel
          text="Bouncing Ball Physics Demo"
          position={{ x: W / 2, y: 100 }}
          font="bold 32px Arial"
          fill="white"
          textAlign="center"
        />

        <PivotLabel
          text="Press ESC to return to menu"
          position={{ x: W / 2, y: H - 30 }}
          font="18px Arial"
          fill="rgba(255,255,255,0.7)"
          textAlign="center"
        />
      </PivotCanvas>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Player Movement Game (Full Screen)
// ─────────────────────────────────────────────────────────────────────────────

interface PlayerMovementProps {
  onExit: () => void;
}

function PlayerMovementGame({ onExit }: PlayerMovementProps) {
  const [screenSize, setScreenSize] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { width: W, height: H } = screenSize;
  const player = useRef({ x: W / 2, y: H / 2, size: Math.min(W, H) * 0.05 });
  const score = useRef(0);
  const keys = useRef<Record<string, boolean>>({});
  const [, setTick] = useState(0);

  useEffect(() => {
    const down = (e: KeyboardEvent) => { 
      keys.current[e.key.toLowerCase()] = true;
      if (e.key === 'Escape') onExit();
    };
    const up = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [onExit]);

  useGameLoop((dt) => {
    const p = player.current;
    const speed = Math.min(W, H) * 0.5;
    if (keys.current['arrowleft'] || keys.current['a']) p.x -= speed * dt;
    if (keys.current['arrowright'] || keys.current['d']) p.x += speed * dt;
    if (keys.current['arrowup'] || keys.current['w']) p.y -= speed * dt;
    if (keys.current['arrowdown'] || keys.current['s']) p.y += speed * dt;

    const half = p.size / 2;
    p.x = Math.max(half, Math.min(W - half, p.x));
    p.y = Math.max(half, Math.min(H - half, p.y));

    score.current += dt * 10;
    setTick(t => t + 1);
  });

  const p = player.current;

  return (
    <div style={{ 
      margin: 0, padding: 0, overflow: 'hidden', background: '#0f3460',
      width: '100vw', height: '100vh'
    }}>
      <PivotCanvas width={W} height={H} background="#0f3460">
        <PivotRectangle position={{ x: 0, y: 0 }} width={W} height={H} fill="#0f3460" />

        {/* Player */}
        <PivotRectangle
          position={{ x: p.x - p.size / 2, y: p.y - p.size / 2 }}
          width={p.size}
          height={p.size}
          fill="#e94560"
          stroke="white"
          lineWidth={3}
        />

        {/* Score */}
        <PivotLabel
          text={`Score: ${Math.floor(score.current)}`}
          position={{ x: 30, y: 40 }}
          font="bold 28px Arial"
          fill="white"
          textAlign="left"
        />

        {/* Title */}
        <PivotLabel
          text="Player Movement Demo"
          position={{ x: W / 2, y: 40 }}
          font="bold 32px Arial"
          fill="white"
          textAlign="center"
        />

        {/* Controls */}
        <PivotLabel
          text="WASD or Arrow Keys to move"
          position={{ x: W / 2, y: H - 60 }}
          font="20px Arial"
          fill="rgba(255,255,255,0.8)"
          textAlign="center"
        />

        <PivotLabel
          text="Press ESC to return to menu"
          position={{ x: W / 2, y: H - 30 }}
          font="18px Arial"
          fill="rgba(255,255,255,0.7)"
          textAlign="center"
        />
      </PivotCanvas>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Game Objects & Types
// ─────────────────────────────────────────────────────────────────────────────

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Player extends GameObject {
  health: number;
  maxHealth: number;
  fireRate: number;
  lastShot: number;
}

interface Bullet extends GameObject {
  vx: number;
  vy: number;
  damage: number;
  color: string;
}

interface Enemy extends GameObject {
  vx: number;
  vy: number;
  health: number;
  maxHealth: number;
  lastShot: number;
  fireRate: number;
  points: number;
}

interface PowerUp extends GameObject {
  type: 'health' | 'fireRate' | 'damage';
  vy: number;
  collected: boolean;
}

interface GameState {
  playing: boolean;
  gameOver: boolean;
  score: number;
  wave: number;
  timeToNextWave: number;
}

interface Explosion {
  x: number;
  y: number;
  time: number;
  duration: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Game Hook
// ─────────────────────────────────────────────────────────────────────────────

function useSpaceShooter(onExit: () => void) {
  const [screenSize, setScreenSize] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });

  // Game state
  const gameState = useRef<GameState>({
    playing: true,
    gameOver: false,
    score: 0,
    wave: 1,
    timeToNextWave: 3
  });

  // Player
  const player = useRef<Player>({
    x: screenSize.width / 2,
    y: screenSize.height - 80,
    width: 24,
    height: 32,
    health: 100,
    maxHealth: 100,
    fireRate: 0.15, // seconds between shots
    lastShot: 0
  });

  // Game objects
  const bullets = useRef<Bullet[]>([]);
  const enemyBullets = useRef<Bullet[]>([]);
  const enemies = useRef<Enemy[]>([]);
  const powerUps = useRef<PowerUp[]>([]);
  const explosions = useRef<Explosion[]>([]);
  const stars = useRef<Array<{x: number, y: number, speed: number, brightness: number}>>([]);

  // Input
  const keys = useRef<Record<string, boolean>>({});
  const [, setTick] = useState(0);

  // Initialize stars for background
  useEffect(() => {
    stars.current = Array.from({ length: 150 }, () => ({
      x: Math.random() * screenSize.width,
      y: Math.random() * screenSize.height,
      speed: 20 + Math.random() * 80,
      brightness: 0.2 + Math.random() * 0.8
    }));
  }, [screenSize]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
      player.current.x = Math.min(player.current.x, window.innerWidth - player.current.width);
      player.current.y = Math.min(player.current.y, window.innerHeight - player.current.height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { 
      keys.current[e.key.toLowerCase()] = true;
      if (e.key === ' ') e.preventDefault();
      if (e.key === 'Escape') onExit();
    };
    const handleKeyUp = (e: KeyboardEvent) => { 
      keys.current[e.key.toLowerCase()] = false; 
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onExit]);

  // Collision detection
  const checkCollision = useCallback((a: GameObject, b: GameObject): boolean => {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }, []);

  // Spawn enemy
  const spawnEnemy = useCallback(() => {
    const enemy: Enemy = {
      x: Math.random() * (screenSize.width - 30),
      y: -30,
      width: 30,
      height: 30,
      vx: (Math.random() - 0.5) * 100,
      vy: 50 + Math.random() * 100,
      health: 20 + gameState.current.wave * 10,
      maxHealth: 20 + gameState.current.wave * 10,
      lastShot: 0,
      fireRate: 1.5 + Math.random() * 2,
      points: 10 * gameState.current.wave
    };
    enemies.current.push(enemy);
  }, [screenSize.width]);

  // Spawn power-up
  const spawnPowerUp = useCallback(() => {
    if (Math.random() < 0.3) {
      const types: Array<'health' | 'fireRate' | 'damage'> = ['health', 'fireRate', 'damage'];
      const powerUp: PowerUp = {
        x: Math.random() * (screenSize.width - 20),
        y: -20,
        width: 20,
        height: 20,
        type: types[Math.floor(Math.random() * types.length)],
        vy: 80,
        collected: false
      };
      powerUps.current.push(powerUp);
    }
  }, [screenSize.width]);

  // Add explosion
  const addExplosion = useCallback((x: number, y: number) => {
    explosions.current.push({
      x, y,
      time: 0,
      duration: 0.8
    });
  }, []);

  // Restart game
  const restartGame = useCallback(() => {
    gameState.current = {
      playing: true,
      gameOver: false,
      score: 0,
      wave: 1,
      timeToNextWave: 3
    };
    
    player.current = {
      x: screenSize.width / 2,
      y: screenSize.height - 80,
      width: 24,
      height: 32,
      health: 100,
      maxHealth: 100,
      fireRate: 0.15,
      lastShot: 0
    };

    bullets.current = [];
    enemyBullets.current = [];
    enemies.current = [];
    powerUps.current = [];
    explosions.current = [];
  }, [screenSize]);

  // Main game loop
  useGameLoop((dt: number) => {
    if (!gameState.current.playing) return;

    const { width: W, height: H } = screenSize;
    const p = player.current;
    const state = gameState.current;

    // Update stars
    stars.current.forEach(star => {
      star.y += star.speed * dt;
      if (star.y > H) {
        star.y = -5;
        star.x = Math.random() * W;
      }
    });

    // Player movement
    const speed = 400;
    if (keys.current['a'] || keys.current['arrowleft']) {
      p.x = Math.max(0, p.x - speed * dt);
    }
    if (keys.current['d'] || keys.current['arrowright']) {
      p.x = Math.min(W - p.width, p.x + speed * dt);
    }
    if (keys.current['w'] || keys.current['arrowup']) {
      p.y = Math.max(0, p.y - speed * dt);
    }
    if (keys.current['s'] || keys.current['arrowdown']) {
      p.y = Math.min(H - p.height, p.y + speed * dt);
    }

    // Player shooting
    if (keys.current[' '] && Date.now() - p.lastShot > p.fireRate * 1000) {
      bullets.current.push({
        x: p.x + p.width / 2 - 2,
        y: p.y,
        width: 4,
        height: 12,
        vx: 0,
        vy: -600,
        damage: 25,
        color: '#00ff00'
      });
      p.lastShot = Date.now();
    }

    // Update bullets
    bullets.current = bullets.current.filter(bullet => {
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;
      return bullet.y > -bullet.height && bullet.y < H + bullet.height && 
             bullet.x > -bullet.width && bullet.x < W + bullet.width;
    });

    // Update enemy bullets
    enemyBullets.current = enemyBullets.current.filter(bullet => {
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;
      return bullet.y > -bullet.height && bullet.y < H + bullet.height;
    });

    // Wave management
    if (enemies.current.length === 0) {
      state.timeToNextWave -= dt;
      if (state.timeToNextWave <= 0) {
        state.wave++;
        state.timeToNextWave = 3;
        
        // Spawn enemies for new wave
        const numEnemies = 3 + state.wave;
        for (let i = 0; i < numEnemies; i++) {
          setTimeout(() => spawnEnemy(), i * 500);
        }
      }
    }

    // Update enemies
    enemies.current = enemies.current.filter(enemy => {
      enemy.x += enemy.vx * dt;
      enemy.y += enemy.vy * dt;

      // Bounce off walls
      if (enemy.x <= 0 || enemy.x >= W - enemy.width) enemy.vx *= -1;

      // Enemy shooting
      if (Date.now() - enemy.lastShot > enemy.fireRate * 1000 && Math.random() < 0.3 * dt) {
        enemyBullets.current.push({
          x: enemy.x + enemy.width / 2 - 1.5,
          y: enemy.y + enemy.height,
          width: 3,
          height: 8,
          vx: 0,
          vy: 300,
          damage: 15,
          color: '#ff4444'
        });
        enemy.lastShot = Date.now();
      }

      return enemy.y < H + 50;
    });

    // Update power-ups
    powerUps.current = powerUps.current.filter(powerUp => {
      powerUp.y += powerUp.vy * dt;
      return powerUp.y < H + powerUp.height && !powerUp.collected;
    });

    // Update explosions
    explosions.current = explosions.current.filter(explosion => {
      explosion.time += dt;
      return explosion.time < explosion.duration;
    });

    // Collision: Player bullets vs Enemies
    bullets.current.forEach((bullet, bulletIndex) => {
      enemies.current.forEach((enemy, enemyIndex) => {
        if (checkCollision(bullet, enemy)) {
          enemy.health -= bullet.damage;
          bullets.current.splice(bulletIndex, 1);
          
          if (enemy.health <= 0) {
            state.score += enemy.points;
            addExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
            enemies.current.splice(enemyIndex, 1);
            
            // Chance to spawn power-up
            if (Math.random() < 0.15) spawnPowerUp();
          }
        }
      });
    });

    // Collision: Enemy bullets vs Player
    enemyBullets.current.forEach((bullet, bulletIndex) => {
      if (checkCollision(bullet, p)) {
        p.health -= bullet.damage;
        enemyBullets.current.splice(bulletIndex, 1);
        addExplosion(p.x + p.width/2, p.y + p.height/2);
      }
    });

    // Collision: Enemies vs Player
    enemies.current.forEach((enemy, enemyIndex) => {
      if (checkCollision(enemy, p)) {
        p.health -= 30;
        addExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
        enemies.current.splice(enemyIndex, 1);
      }
    });

    // Collision: Power-ups vs Player
    powerUps.current.forEach((powerUp, powerUpIndex) => {
      if (checkCollision(powerUp, p)) {
        powerUp.collected = true;
        
        switch (powerUp.type) {
          case 'health':
            p.health = Math.min(p.maxHealth, p.health + 30);
            break;
          case 'fireRate':
            p.fireRate = Math.max(0.08, p.fireRate - 0.02);
            break;
          case 'damage':
            // Effect applied in bullet creation
            break;
        }
        
        powerUps.current.splice(powerUpIndex, 1);
      }
    });

    // Check game over
    if (p.health <= 0) {
      state.playing = false;
      state.gameOver = true;
    }

    setTick(t => t + 1);
  });

  return {
    screenSize,
    gameState: gameState.current,
    player: player.current,
    bullets: bullets.current,
    enemyBullets: enemyBullets.current,
    enemies: enemies.current,
    powerUps: powerUps.current,
    explosions: explosions.current,
    stars: stars.current,
    restartGame
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Space Shooter Game Component
// ─────────────────────────────────────────────────────────────────────────────

interface SpaceShooterProps {
  onExit: () => void;
}

function SpaceShooterGame({ onExit }: SpaceShooterProps) {
  const {
    screenSize,
    gameState,
    player,
    bullets,
    enemyBullets,
    enemies,
    powerUps,
    explosions,
    stars,
    restartGame
  } = useSpaceShooter(onExit);

  const { width: W, height: H } = screenSize;

  return (
    <div style={{ 
      margin: 0, 
      padding: 0, 
      overflow: 'hidden',
      background: '#000',
      width: '100vw',
      height: '100vh'
    }}>
      <PivotCanvas width={W} height={H} background="#0a0a0a">
        {/* Clear screen every frame */}
        <PivotRectangle
          position={{ x: 0, y: 0 }}
          width={W}
          height={H}
          fill="#0a0a0a"
        />

        {/* Stars Background */}
        {stars.map((star, i) => (
          <PivotCircle
            key={i}
            center={{ x: star.x, y: star.y }}
            radius={0.5 + star.brightness}
            fill={`rgba(255,255,255,${star.brightness})`}
          />
        ))}

        {gameState.playing && (
          <>
            {/* Player */}
            <PivotRectangle
              position={{ x: player.x, y: player.y }}
              width={player.width}
              height={player.height}
              fill="#00aaff"
              stroke="#ffffff"
              lineWidth={2}
            />

            {/* Player Bullets */}
            {bullets.map((bullet, i) => (
              <PivotRectangle
                key={i}
                position={{ x: bullet.x, y: bullet.y }}
                width={bullet.width}
                height={bullet.height}
                fill={bullet.color}
              />
            ))}

            {/* Enemy Bullets */}
            {enemyBullets.map((bullet, i) => (
              <PivotRectangle
                key={i}
                position={{ x: bullet.x, y: bullet.y }}
                width={bullet.width}
                height={bullet.height}
                fill={bullet.color}
              />
            ))}

            {/* Enemies */}
            {enemies.map((enemy, i) => (
              <React.Fragment key={i}>
                <PivotRectangle
                  position={{ x: enemy.x, y: enemy.y }}
                  width={enemy.width}
                  height={enemy.height}
                  fill="#ff4444"
                  stroke="#ffffff"
                  lineWidth={1}
                />
                {/* Enemy health bar */}
                <PivotRectangle
                  position={{ x: enemy.x, y: enemy.y - 8 }}
                  width={enemy.width}
                  height={4}
                  fill="#333333"
                />
                <PivotRectangle
                  position={{ x: enemy.x, y: enemy.y - 8 }}
                  width={(enemy.health / enemy.maxHealth) * enemy.width}
                  height={4}
                  fill="#ff0000"
                />
              </React.Fragment>
            ))}

            {/* Power-ups */}
            {powerUps.map((powerUp, i) => (
              <PivotCircle
                key={i}
                center={{ x: powerUp.x + powerUp.width/2, y: powerUp.y + powerUp.height/2 }}
                radius={powerUp.width/2}
                fill={powerUp.type === 'health' ? '#00ff00' : 
                      powerUp.type === 'fireRate' ? '#ffff00' : '#ff00ff'}
                stroke="#ffffff"
                lineWidth={2}
              />
            ))}

            {/* Explosions */}
            {explosions.map((explosion, i) => {
              const progress = explosion.time / explosion.duration;
              const radius = 15 * (1 - progress);
              const alpha = 1 - progress;
              return (
                <PivotCircle
                  key={i}
                  center={{ x: explosion.x, y: explosion.y }}
                  radius={radius}
                  fill={`rgba(255, 100, 0, ${alpha})`}
                />
              );
            })}

            {/* HUD */}
            {/* Health Bar */}
            <PivotRectangle
              position={{ x: 20, y: 20 }}
              width={200}
              height={20}
              fill="#333333"
              stroke="#ffffff"
              lineWidth={2}
            />
            <PivotRectangle
              position={{ x: 22, y: 22 }}
              width={(player.health / player.maxHealth) * 196}
              height={16}
              fill={player.health > 50 ? '#00ff00' : player.health > 25 ? '#ffff00' : '#ff0000'}
            />

            {/* Score and Wave */}
            <PivotLabel
              text={`Score: ${gameState.score}`}
              position={{ x: 20, y: 60 }}
              font="bold 18px Arial"
              fill="#ffffff"
              textAlign="left"
            />
            <PivotLabel
              text={`Wave: ${gameState.wave}`}
              position={{ x: 20, y: 85 }}
              font="bold 16px Arial"
              fill="#ffffff"
              textAlign="left"
            />

            {/* Controls */}
            <PivotLabel
              text="WASD/Arrow Keys: Move | Space: Shoot"
              position={{ x: W / 2, y: H - 20 }}
              font="14px Arial"
              fill="rgba(255,255,255,0.7)"
              textAlign="center"
            />

            {enemies.length === 0 && (
              <PivotLabel
                text={`Wave ${gameState.wave + 1} incoming in ${Math.ceil(gameState.timeToNextWave)}...`}
                position={{ x: W / 2, y: H / 2 }}
                font="bold 24px Arial"
                fill="#ffff00"
                textAlign="center"
              />
            )}
          </>
        )}

        {/* Game Over Screen */}
        {gameState.gameOver && (
          <>
            <PivotRectangle
              position={{ x: 0, y: 0 }}
              width={W}
              height={H}
              fill="rgba(0,0,0,0.7)"
            />
            
            <PivotLabel
              text="GAME OVER"
              position={{ x: W / 2, y: H / 2 - 60 }}
              font="bold 48px Arial"
              fill="#ff4444"
              textAlign="center"
            />
            
            <PivotLabel
              text={`Final Score: ${gameState.score}`}
              position={{ x: W / 2, y: H / 2 - 10 }}
              font="bold 24px Arial"
              fill="#ffffff"
              textAlign="center"
            />
            
            <PivotLabel
              text={`Waves Completed: ${gameState.wave - 1}`}
              position={{ x: W / 2, y: H / 2 + 20 }}
              font="bold 18px Arial"
              fill="#ffffff"
              textAlign="center"
            />
            
            <PivotLabel
              text="Press R to Restart"
              position={{ x: W / 2, y: H / 2 + 60 }}
              font="bold 20px Arial"
              fill="#00ff00"
              textAlign="center"
            />
          </>
        )}
      </PivotCanvas>

      {/* Restart functionality */}
      {gameState.gameOver && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none'
          }}
          onKeyDown={(e) => {
            if (e.key.toLowerCase() === 'r') {
              restartGame();
            }
          }}
          tabIndex={0}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main App Component
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [currentGame, setCurrentGame] = useState<string>('menu');

  const handleGameSelect = (game: string) => {
    setCurrentGame(game);
  };

  const handleExit = () => {
    setCurrentGame('menu');
  };

  switch (currentGame) {
    case 'spaceshooter':
      return <SpaceShooterGame onExit={handleExit} />;
    case 'bouncingball':
      return <BouncingBallGame onExit={handleExit} />;
    case 'playermovement':
      return <PlayerMovementGame onExit={handleExit} />;
    case 'staticscene':
      return <StaticSceneGame onExit={handleExit} />;
    default:
      return <GameMenu onGameSelect={handleGameSelect} />;
  }
}
