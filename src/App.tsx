import { Routes, Route } from 'react-router-dom';
import SiteLayout from './components/templates/SiteLayout';
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
import CrystalCavernsGame from './games/CrystalCaverns';

export default function App() {
  return (
    <Routes>
      {/* Pages with shared static header */}
      <Route path="/" element={<SiteLayout><HomePage /></SiteLayout>} />
      <Route path="/docs" element={<SiteLayout><DocsPage /></SiteLayout>} />
      <Route path="/docs/:version" element={<SiteLayout><DocsPage /></SiteLayout>} />
      <Route path="/docs/:version/:sectionId" element={<SiteLayout><DocsPage /></SiteLayout>} />
      <Route path="/tutorials" element={<SiteLayout><TutorialsPage /></SiteLayout>} />
      <Route path="/tutorial/:gameId" element={<SiteLayout><TutorialDetailPage /></SiteLayout>} />

      {/* Game routes — full screen, no header */}
      <Route path="/game/aetherdrift" element={<AetherdriftGame />} />
      <Route path="/game/crystalcaverns" element={<CrystalCavernsGame />} />
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

