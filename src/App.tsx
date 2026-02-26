import { useState } from 'react';
import GameMenu from './components/GameMenu';
import SpaceShooterGame from './components/SpaceShooterGame';
import BouncingBallGame from './components/BouncingBallGame';
import PlayerMovementGame from './components/PlayerMovementGame';
import StaticSceneGame from './components/StaticSceneGame';
import DungeonGame from './components/DungeonGame';
import CarGame from './components/CarGame';

export default function App() {
  const [currentGame, setCurrentGame] = useState<string>('menu');

  const handleGameSelect = (game: string) => setCurrentGame(game);
  const handleExit = () => setCurrentGame('menu');

  switch (currentGame) {
    case 'carrace':
      return <CarGame onExit={handleExit} />;
    case 'dungeon':
      return <DungeonGame onExit={handleExit} />;
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

