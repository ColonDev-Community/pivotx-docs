import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GAME_TUTORIALS } from '../data/gameTutorials';

export default function TutorialsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  const filtered = GAME_TUTORIALS.filter(g => {
    const matchSearch = search === '' ||
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase()) ||
      g.tags.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
      g.features.some(f => f.toLowerCase().includes(search.toLowerCase()));
    const matchDifficulty = filterDifficulty === 'all' || g.difficulty === filterDifficulty;
    return matchSearch && matchDifficulty;
  });

  const diffColor = (d: string) => {
    switch (d) {
      case 'beginner': return '#44ff88';
      case 'intermediate': return '#ffaa44';
      case 'advanced': return '#ff4466';
      default: return '#888';
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '30px auto', padding: '0 20px' }}>
      <h2 style={{ textAlign: 'center', fontSize: '2rem' }}>Game Tutorials</h2>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: 24 }}>
          Step-by-step code breakdowns of every game built with PivotX
        </p>

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 30 }}>
          <input
            type="text"
            placeholder="Search tutorials..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, minWidth: 200, padding: '10px 16px', background: '#1a1a2e',
              border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: '0.95rem',
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'beginner', 'intermediate', 'advanced'].map(d => (
              <button
                key={d}
                onClick={() => setFilterDifficulty(d)}
                style={{
                  padding: '8px 14px', borderRadius: 6, fontSize: '0.85rem',
                  cursor: 'pointer', fontWeight: filterDifficulty === d ? 700 : 400,
                  background: filterDifficulty === d ? (d === 'all' ? '#00ccff22' : `${diffColor(d)}22`) : 'transparent',
                  border: `1px solid ${filterDifficulty === d ? (d === 'all' ? '#00ccff' : diffColor(d)) : '#444'}`,
                  color: filterDifficulty === d ? (d === 'all' ? '#00ccff' : diffColor(d)) : '#888',
                  textTransform: 'capitalize',
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Tutorial Cards */}
        {filtered.map(game => (
          <div
            key={game.id}
            style={{
              background: '#12122a', border: '1px solid #2a2a4a',
              borderRadius: 12, padding: 24, marginBottom: 16,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onClick={() => navigate(`/tutorial/${game.id}`)}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#00ccff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a4a'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem' }}>{game.title}</h3>
                <p style={{ margin: '4px 0 0', color: '#888', fontSize: '0.9rem' }}>{game.description}</p>
              </div>
              <span style={{
                fontSize: '0.75rem', padding: '3px 10px', borderRadius: 20,
                background: `${diffColor(game.difficulty)}22`,
                color: diffColor(game.difficulty),
                border: `1px solid ${diffColor(game.difficulty)}44`,
                textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap',
              }}>
                {game.difficulty}
              </span>
            </div>

            <div style={{ marginBottom: 12 }}>
              <span style={{ color: '#888', fontSize: '0.8rem' }}>Features: </span>
              {game.features.slice(0, 4).map((f, i) => (
                <span key={i} style={{
                  fontSize: '0.8rem', color: '#aaa',
                  padding: '2px 8px', background: '#1a1a3e',
                  borderRadius: 4, marginRight: 6, display: 'inline-block', marginBottom: 4,
                }}>
                  {f}
                </span>
              ))}
              {game.features.length > 4 && (
                <span style={{ fontSize: '0.8rem', color: '#666' }}>
                  +{game.features.length - 4} more
                </span>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#666', fontSize: '0.8rem' }}>
                {game.codeBreakdown.length} code sections &middot; {game.conceptsCovered.length} concepts
              </span>
              <span style={{ color: '#00ccff', fontSize: '0.9rem' }}>View Tutorial &rarr;</span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: '#555', padding: 40 }}>
            No tutorials match your search.
          </p>
        )}
      </div>
  );
}
