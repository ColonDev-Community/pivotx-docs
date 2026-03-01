import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DocsPage from './pages/DocsPage';
import TutorialsPage from './pages/TutorialsPage';
import TutorialDetailPage from './pages/TutorialDetailPage';
import SpaceShooterGame from './games/SpaceShooter';
import BouncingBallGame from './games/BouncingBall';
import PlayerMovementGame from './games/PlayerMovement';
import StaticSceneGame from './games/StaticScene';
import DungeonGame from './games/Dungeon';
import CarGame from './games/CarRace';
import Nexus2500Game from './games/Nexus2500';
import AetherdriftGame from './games/Aetherdrift';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/docs" element={<DocsPage />} />
      <Route path="/docs/:version" element={<DocsPage />} />
      <Route path="/docs/:version/:sectionId" element={<DocsPage />} />
      <Route path="/tutorials" element={<TutorialsPage />} />
      <Route path="/tutorial/:gameId" element={<TutorialDetailPage />} />
      <Route path="/game/aetherdrift" element={<AetherdriftGame />} />
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

