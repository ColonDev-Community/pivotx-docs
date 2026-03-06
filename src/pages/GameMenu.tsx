import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PivotCanvas,
  PivotRectangle,
  PivotLabel,
} from 'pivotx/react';

const games = [
  { id: 'nexus2500', title: 'NEXUS 2500: The Last Signal', description: '25th century epic — 5 chapters, bosses, full storyline. Humanity\'s last hope!' },
  { id: 'crystalcaverns', title: 'Crystal Caverns', description: 'Platformer — tilemap levels, camera follow, parallax, sprites & collectibles!' },
  { id: 'carrace', title: 'Nitro Highway', description: 'Endless police chase racing - dodge traffic, nitro boost, wanted levels!' },
  { id: 'dungeon', title: 'Dungeon of Shadows', description: 'Roguelike dungeon crawler - procedural dungeons, bosses & loot!' },
  { id: 'spaceshooter', title: 'Space Shooter', description: 'Full combat game with enemies and power-ups' },
  { id: 'bouncingball', title: 'Bouncing Ball', description: 'Physics animation demo' },
  { id: 'playermovement', title: 'Player Movement', description: 'Keyboard controlled character' },
  { id: 'staticscene', title: 'Static Scene', description: 'Beautiful landscape render' }
];

export default function GameMenu() {
  const navigate = useNavigate();

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
        navigate(`/game/${games[selectedIndex].id}`);
        e.preventDefault();
      } else if (e.key >= '1' && e.key <= '7') {
        const gameIndex = parseInt(e.key) - 1;
        if (gameIndex < games.length) {
          setSelectedIndex(gameIndex);
          navigate(`/game/${games[gameIndex].id}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex]);

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
        {/* Background */}
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
          const y = 180 + index * 100;
          const buttonWidth = 500;
          const buttonHeight = 75;
          const x = (screenSize.width - buttonWidth) / 2;
          const isSelected = index === selectedIndex;

          return (
            <React.Fragment key={game.id}>
              <PivotRectangle
                position={{ x, y }}
                width={buttonWidth}
                height={buttonHeight}
                fill={isSelected ? "#444" : "#333"}
                stroke={isSelected ? "#00aaff" : "#555"}
                lineWidth={isSelected ? 3 : 2}
              />
              
              {isSelected && (
                <PivotRectangle
                  position={{ x: x - 10, y: y + 35 }}
                  width={8}
                  height={10}
                  fill="#00aaff"
                />
              )}
              
              <PivotLabel
                text={game.title}
                position={{ x: screenSize.width / 2, y: y + 25 }}
                font="bold 24px Arial"
                fill={isSelected ? "#ffffff" : "#00aaff"}
                textAlign="center"
              />
              
              <PivotLabel
                text={game.description}
                position={{ x: screenSize.width / 2, y: y + 50 }}
                font="16px Arial"
                fill={isSelected ? "#fff" : "#ccc"}
                textAlign="center"
              />
              
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
          text="↑↓ Arrow Keys: Navigate | Enter: Select | 1-7: Quick Select | ESC: Return to Menu"
          position={{ x: screenSize.width / 2, y: screenSize.height - 50 }}
          font="18px Arial"
          fill="#888"
          textAlign="center"
        />
      </PivotCanvas>
    </div>
  );
}
