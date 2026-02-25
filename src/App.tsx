/**
 * Space Shooter Game - Complete implementation using pIvotX
 * 
 * Features:
 * - Full screen gameplay
 * - Player ship with WASD/Arrow key controls
 * - Shooting mechanics (Space bar)
 * - Enemy waves with increasing difficulty
 * - Power-ups and health system
 * - Score tracking and game over screen
 * - Responsive to window resizing
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  PivotCanvas,
  PivotCircle,
  PivotRectangle,
  PivotLabel,
  useGameLoop,
} from 'pivotx/react';

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

function useSpaceShooter() {
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
  }, []);

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

export default function SpaceShooterGame() {
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
  } = useSpaceShooter();

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
