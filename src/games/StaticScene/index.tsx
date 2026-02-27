import { useState, useEffect } from 'react';
import {
  PivotCanvas,
  PivotCircle,
  PivotRectangle,
  PivotLabel,
} from 'pivotx/react';
import { useExitToMenu } from '../../hooks/useExitToMenu';

export default function StaticSceneGame() {
  const onExit = useExitToMenu();
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
        <PivotRectangle position={{ x: 0, y: 0 }} width={W} height={H} fill="#87CEEB" />

        <PivotRectangle 
          position={{ x: 0, y: H * 0.7 }} 
          width={W} 
          height={H * 0.3} 
          fill="#8B6914" 
        />

        <PivotCircle 
          center={{ x: W * 0.85, y: H * 0.15 }} 
          radius={H * 0.08} 
          fill="#FFD700" 
          stroke="#FFA500" 
          lineWidth={3} 
        />

        <PivotCircle center={{ x: W * 0.2, y: H * 0.8 }} radius={H * 0.2} fill="#666" />
        <PivotCircle center={{ x: W * 0.4, y: H * 0.75 }} radius={H * 0.15} fill="#777" />
        <PivotCircle center={{ x: W * 0.7, y: H * 0.82 }} radius={H * 0.18} fill="#555" />

        <PivotRectangle 
          position={{ x: W * 0.15, y: H * 0.55 }} 
          width={W * 0.02} height={H * 0.15} fill="#6B3A2A" 
        />
        <PivotCircle center={{ x: W * 0.16, y: H * 0.48 }} radius={H * 0.08} fill="#228B22" />

        <PivotRectangle 
          position={{ x: W * 0.6, y: H * 0.5 }} 
          width={W * 0.025} height={H * 0.2} fill="#6B3A2A" 
        />
        <PivotCircle center={{ x: W * 0.6125, y: H * 0.4 }} radius={H * 0.1} fill="#228B22" />

        <PivotLabel 
          text="Static Landscape Scene" 
          position={{ x: W / 2, y: H * 0.1 }}
          font={`bold ${Math.max(24, W * 0.03)}px Arial`} 
          fill="#333" 
          textAlign="center"
        />

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
