import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { DOC_VERSIONS } from '../../data/docs';

const navBtnStyle = (active: boolean): React.CSSProperties => ({
  padding: '8px 18px',
  fontSize: '0.9rem',
  background: active ? '#00ccff22' : 'transparent',
  border: `1px solid ${active ? '#00ccff44' : 'transparent'}`,
  borderRadius: 8,
  color: active ? '#00ccff' : '#aaa',
  cursor: 'pointer',
  fontWeight: active ? 700 : 400,
  transition: 'all 0.2s',
});

export default function SiteHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ version?: string }>();

  const isDocsPage = location.pathname.startsWith('/docs');
  const currentVersion = params.version || DOC_VERSIONS[0].version;

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleVersionChange = (version: string) => {
    navigate(`/docs/${version}`);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      padding: '10px 24px',
      borderBottom: '1px solid #222',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      flexWrap: 'wrap',
      background: '#0d0d1aee',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      <h1
        onClick={() => navigate('/')}
        style={{
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: 800,
          background: 'linear-gradient(90deg, #00ccff, #aa66ff, #ff6699)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        pIvotX
      </h1>

      <nav style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => navigate('/')} style={navBtnStyle(isActive('/'))}>
          Home
        </button>
        <button onClick={() => navigate('/docs')} style={navBtnStyle(isActive('/docs'))}>
          Documentation
        </button>
        <button onClick={() => navigate('/tutorials')} style={navBtnStyle(isActive('/tutorials') || isActive('/tutorial'))}>
          Tutorials
        </button>
      </nav>

      {/* Version selector — visible on docs pages */}
      {isDocsPage && (
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#888', fontSize: '0.85rem' }}>Version:</span>
          <select
            value={currentVersion}
            onChange={e => handleVersionChange(e.target.value)}
            style={{
              padding: '6px 12px',
              background: '#1a1a2e',
              border: '1px solid #444',
              borderRadius: 6,
              color: '#fff',
              fontSize: '0.9rem',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {DOC_VERSIONS.map(v => (
              <option key={v.version} value={v.version}>{v.label}</option>
            ))}
          </select>
        </div>
      )}
    </header>
  );
}
