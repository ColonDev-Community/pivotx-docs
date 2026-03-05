import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GAME_TUTORIALS } from '../data/gameTutorials';

type QuickStartTab = 'vanilla' | 'typescript' | 'react';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [quickStartTab, setQuickStartTab] = useState<QuickStartTab>('vanilla');

  const filteredGames = GAME_TUTORIALS.filter(game =>
    game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const difficultyColor = (d: string) => {
    switch (d) {
      case 'beginner': return '#44ff88';
      case 'intermediate': return '#ffaa44';
      case 'advanced': return '#ff4466';
      default: return '#888';
    }
  };

  return (
    <>
      {/* Hero */}
      <section style={{
        padding: '50px 20px 30px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 800,
          background: 'linear-gradient(90deg, #00ccff, #aa66ff, #ff6699)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0,
        }}>
          pIvotX
        </h1>
        <p style={{ color: '#888', fontSize: '1.2rem', marginTop: 8 }}>
          Lightweight 2D Game Library — Vanilla JS · TypeScript · React
        </p>
      </section>

      {/* Search */}
      <div style={{ maxWidth: 700, margin: '0 auto 30px', padding: '0 20px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search games, features, concepts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 20px',
              fontSize: '1rem',
              background: '#1a1a2e',
              border: '2px solid #333',
              borderRadius: 12,
              color: '#fff',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
              display: 'none',
            }}
            onFocus={e => e.target.style.borderColor = '#00ccff'}
            onBlur={e => e.target.style.borderColor = '#333'}
          />
        </div>
      </div>

      {/* Features */}
      <section style={{ maxWidth: 1000, margin: '0 auto 40px', padding: '0 20px' }}>
        <h2 style={{ fontSize: '1.8rem', textAlign: 'center', color: '#ddd' }}>
          Why PivotX?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginTop: 20 }}>
          {[
            { icon: '\uD83C\uDF10', title: 'Use Anywhere', desc: 'Vanilla JS via CDN, TypeScript ESM, or React components \u2014 one library, three ways.' },
            { icon: '\uD83D\uDD04', title: 'Game Loop Built-In', desc: 'canvas.startLoop(fn) or useGameLoop(fn) \u2014 delta-time loop with one call.' },
            { icon: '\uD83D\uDCD0', title: 'Simple Shape API', desc: 'Circle, Rectangle, Line, Label \u2014 create shapes and add() to canvas.' },
            { icon: '\uD83C\uDFA8', title: 'Zero Config', desc: 'Drop a <script> tag for Vanilla JS, or npm install for TypeScript/React.' },
            { icon: '\u269B\uFE0F', title: 'React Layer', desc: 'Declarative PivotCanvas, PivotCircle, PivotLabel components + useGameLoop hook.' },
            { icon: '\uD83E\uDDE9', title: 'TypeScript First', desc: 'Full type definitions: IPoint, IDrawable, IShape, LoopCallback & more.' },
          ].map((f, i) => (
            <div key={i} style={{
              background: '#1a1a2e',
              border: '1px solid #333',
              borderRadius: 12,
              padding: 24,
              transition: 'border-color 0.2s, transform 0.2s',
              cursor: 'default',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#00ccff'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 10 }}>{f.icon}</div>
              <h3 style={{ margin: '0 0 8px', color: '#fff' }}>{f.title}</h3>
              <p style={{ margin: 0, color: '#999', fontSize: '0.9rem', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Game Tutorials Grid */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 60px' }}>
        <h2 style={{ fontSize: '1.8rem', textAlign: 'center', color: '#ddd', marginBottom: 10 }}>
          Learn by Building
        </h2>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: 30 }}>
          {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''} — from simple animations to full RPGs
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {filteredGames.map(game => (
            <div
              key={game.id}
              onClick={() => navigate(`/tutorial/${game.id}`)}
              style={{
                background: '#12122a',
                border: '1px solid #2a2a4a',
                borderRadius: 12,
                padding: 24,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#00ccff';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,204,255,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#2a2a4a';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>{game.title}</h3>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '3px 10px',
                  borderRadius: 20,
                  background: `${difficultyColor(game.difficulty)}22`,
                  color: difficultyColor(game.difficulty),
                  border: `1px solid ${difficultyColor(game.difficulty)}44`,
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}>
                  {game.difficulty}
                </span>
              </div>
              <p style={{ margin: '0 0 12px', color: '#999', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {game.description}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {game.tags.slice(0, 5).map(tag => (
                  <span key={tag} style={{
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    background: '#1a1a3e',
                    borderRadius: 6,
                    color: '#aaa',
                    border: '1px solid #333',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
              <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>
                  {game.codeBreakdown.length} code sections
                </span>
                <span style={{ fontSize: '0.85rem', color: '#00ccff' }}>
                  View Tutorial →
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredGames.length === 0 && (
          <p style={{ textAlign: 'center', color: '#666', padding: 40 }}>
            No games match "{searchQuery}". Try different keywords.
          </p>
        )}
      </section>

      {/* Quick Start */}
      <section style={{
        background: '#0d0d20',
        borderTop: '1px solid #222',
        padding: '40px 20px',
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', color: '#ddd' }}>Quick Start</h2>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
            {(['vanilla', 'typescript', 'react'] as QuickStartTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setQuickStartTab(tab)}
                style={{
                  padding: '8px 18px',
                  fontSize: '0.85rem',
                  background: quickStartTab === tab ? '#00ccff22' : 'transparent',
                  border: `1px solid ${quickStartTab === tab ? '#00ccff' : '#444'}`,
                  borderRadius: 6,
                  color: quickStartTab === tab ? '#00ccff' : '#aaa',
                  cursor: 'pointer',
                  fontWeight: quickStartTab === tab ? 700 : 400,
                  textTransform: 'capitalize',
                }}
              >
                {tab === 'vanilla' ? 'Vanilla JS' : tab === 'typescript' ? 'TypeScript' : 'React'}
              </button>
            ))}
          </div>
          <pre style={{
            background: '#1a1a2e',
            border: '1px solid #333',
            borderRadius: 8,
            padding: 20,
            overflow: 'auto',
            fontSize: '0.9rem',
            lineHeight: 1.6,
          }}>
            <code style={{ color: '#ddd' }}>
{quickStartTab === 'vanilla' ? `<!-- No npm required — just a <script> tag -->
<canvas id="game" width="600" height="400"></canvas>
<script src="https://cdn.jsdelivr.net/npm/pivotx/dist/pivotx.umd.min.js"></script>
<script>
  var { Canvas, Circle, Point } = PivotX;
  var canvas = new Canvas("game");

  var ball = { x: 300, y: 200, vx: 200, vy: 150, r: 20 };

  canvas.startLoop(function(dt) {
    canvas.clear();
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    if (ball.x < ball.r || ball.x > 600 - ball.r) ball.vx *= -1;
    if (ball.y < ball.r || ball.y > 400 - ball.r) ball.vy *= -1;

    var c = new Circle(Point(ball.x, ball.y), ball.r);
    c.fillColor = "#e94560";
    canvas.add(c);
  });
</script>` : quickStartTab === 'typescript' ? `import { Canvas, Circle, Point } from 'pivotx';

const canvas = new Canvas('game');

interface Ball {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
}

const ball: Ball = { x: 300, y: 200, vx: 200, vy: 150, r: 20 };

canvas.startLoop((dt: number) => {
  canvas.clear();
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  if (ball.x < ball.r || ball.x > 600 - ball.r) ball.vx *= -1;
  if (ball.y < ball.r || ball.y > 400 - ball.r) ball.vy *= -1;

  const c = new Circle(Point(ball.x, ball.y), ball.r);
  c.fillColor = '#e94560';
  canvas.add(c);
});` : `import { PivotCanvas, PivotCircle, useGameLoop } from 'pivotx/react';
import { useRef, useState } from 'react';

function MyGame() {
  const ball = useRef({ x: 300, y: 200, vx: 200, vy: 150 });
  const [, setTick] = useState(0);

  useGameLoop((dt) => {
    const b = ball.current;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.x < 20 || b.x > 580) b.vx *= -1;
    if (b.y < 20 || b.y > 380) b.vy *= -1;
    setTick(t => t + 1);
  });

  return (
    <PivotCanvas width={600} height={400} background="#111">
      <PivotCircle
        center={{ x: ball.current.x, y: ball.current.y }}
        radius={20} fill="#e94560" />
    </PivotCanvas>
  );
}`}
            </code>
          </pre>
        </div>
      </section>
    </>
  );
}
