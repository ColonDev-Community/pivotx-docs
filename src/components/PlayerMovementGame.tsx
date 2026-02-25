import { useRef, useState, useEffect } from 'react';
import {
  PivotCanvas,
  PivotRectangle,
  PivotLabel,
  useGameLoop,
} from 'pivotx/react';

interface PlayerMovementProps {
  onExit: () => void;
}

export default function PlayerMovementGame({ onExit }: PlayerMovementProps) {
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

        <PivotRectangle
          position={{ x: p.x - p.size / 2, y: p.y - p.size / 2 }}
          width={p.size}
          height={p.size}
          fill="#e94560"
          stroke="white"
          lineWidth={3}
        />

        <PivotLabel
          text={`Score: ${Math.floor(score.current)}`}
          position={{ x: 30, y: 40 }}
          font="bold 28px Arial"
          fill="white"
          textAlign="left"
        />

        <PivotLabel
          text="Player Movement Demo"
          position={{ x: W / 2, y: 40 }}
          font="bold 32px Arial"
          fill="white"
          textAlign="center"
        />

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
