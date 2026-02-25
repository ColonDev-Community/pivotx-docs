import { useRef, useState, useEffect } from 'react';
import {
  PivotCanvas,
  PivotCircle,
  PivotRectangle,
  PivotLabel,
  useGameLoop,
} from 'pivotx/react';

interface BouncingBallProps {
  onExit: () => void;
}

export default function BouncingBallGame({ onExit }: BouncingBallProps) {
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
