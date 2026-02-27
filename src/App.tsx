import { Routes, Route } from 'react-router-dom';
import GameMenu from './pages/GameMenu';
import SpaceShooterGame from './games/SpaceShooter';
import BouncingBallGame from './games/BouncingBall';
import PlayerMovementGame from './games/PlayerMovement';
import StaticSceneGame from './games/StaticScene';
import DungeonGame from './games/Dungeon';
import CarGame from './games/CarRace';
import Nexus2500Game from './games/Nexus2500';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<GameMenu />} />
      <Route path="/game/nexus2500" element={<Nexus2500Game />} />
      <Route path="/game/carrace" element={<CarGame />} />
      <Route path="/game/dungeon" element={<DungeonGame />} />
      <Route path="/game/spaceshooter" element={<SpaceShooterGame />} />
      <Route path="/game/bouncingball" element={<BouncingBallGame />} />
      <Route path="/game/playermovement" element={<PlayerMovementGame />} />
      <Route path="/game/staticscene" element={<StaticSceneGame />} />
    </Routes>
  );
}

