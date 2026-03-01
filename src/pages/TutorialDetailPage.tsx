import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GAME_TUTORIALS } from '../data/gameTutorials';

export default function TutorialDetailPage() {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const [activeCodeSection, setActiveCodeSection] = useState(0);

  const tutorial = GAME_TUTORIALS.find(g => g.id === gameId);

  if (!tutorial) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', padding: 60,
      }}>
        <h1>Tutorial Not Found</h1>
        <button
          onClick={() => navigate('/tutorials')}
          style={{
            padding: '10px 20px', background: '#00ccff', border: 'none',
            borderRadius: 8, color: '#000', cursor: 'pointer', marginTop: 16,
          }}
        >
          Back to Tutorials
        </button>
      </div>
    );
  }

  const diffColor = (d: string) => {
    switch (d) {
      case 'beginner': return '#44ff88';
      case 'intermediate': return '#ffaa44';
      case 'advanced': return '#ff4466';
      default: return '#888';
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '30px 20px 60px' }}>
      {/* Breadcrumb */}
        <div style={{ marginBottom: 20, fontSize: '0.85rem', color: '#666' }}>
          <span
            style={{ cursor: 'pointer', color: '#00ccff' }}
            onClick={() => navigate('/tutorials')}
          >
            Tutorials
          </span>
          <span style={{ margin: '0 8px' }}>/</span>
          <span>{tutorial.title}</span>
        </div>

        {/* Title Area */}
        <div style={{ marginBottom: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
            <h1 style={{ margin: 0, fontSize: '2.2rem' }}>{tutorial.title}</h1>
            <span style={{
              fontSize: '0.8rem', padding: '4px 12px', borderRadius: 20,
              background: `${diffColor(tutorial.difficulty)}22`,
              color: diffColor(tutorial.difficulty),
              border: `1px solid ${diffColor(tutorial.difficulty)}44`,
              textTransform: 'uppercase', fontWeight: 700,
            }}>
              {tutorial.difficulty}
            </span>
          </div>
          <p style={{ color: '#999', fontSize: '1.1rem', margin: 0 }}>{tutorial.description}</p>

          {/* Play Game Button */}
          <button
            onClick={() => navigate(tutorial.route)}
            style={{
              marginTop: 16, padding: '12px 28px',
              background: 'linear-gradient(135deg, #00ccff, #0088ff)',
              border: 'none', borderRadius: 8,
              color: '#fff', fontSize: '1rem', fontWeight: 700,
              cursor: 'pointer', transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            &#9654; Play This Game
          </button>
        </div>

        {/* Features & Concepts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }}>
          <div style={{
            background: '#12122a', border: '1px solid #2a2a4a',
            borderRadius: 12, padding: 20,
          }}>
            <h3 style={{ margin: '0 0 12px', color: '#00ccff', fontSize: '1rem' }}>
              Features
            </h3>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
              {tutorial.features.map((f, i) => (
                <li key={i} style={{ color: '#bbb', fontSize: '0.9rem' }}>{f}</li>
              ))}
            </ul>
          </div>
          <div style={{
            background: '#12122a', border: '1px solid #2a2a4a',
            borderRadius: 12, padding: 20,
          }}>
            <h3 style={{ margin: '0 0 12px', color: '#aa66ff', fontSize: '1rem' }}>
              Concepts Covered
            </h3>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
              {tutorial.conceptsCovered.map((c, i) => (
                <li key={i} style={{ color: '#bbb', fontSize: '0.9rem' }}>{c}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Code Breakdown */}
        <h2 style={{ borderBottom: '1px solid #2a2a4a', paddingBottom: 8, marginBottom: 24 }}>
          Code Breakdown
        </h2>

        {/* Code Section Navigation */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
          {tutorial.codeBreakdown.map((section, i) => (
            <button
              key={i}
              onClick={() => setActiveCodeSection(i)}
              style={{
                padding: '8px 16px', borderRadius: 6,
                background: activeCodeSection === i ? '#00ccff22' : '#1a1a2e',
                border: `1px solid ${activeCodeSection === i ? '#00ccff' : '#333'}`,
                color: activeCodeSection === i ? '#00ccff' : '#aaa',
                cursor: 'pointer', fontSize: '0.85rem',
                fontWeight: activeCodeSection === i ? 700 : 400,
                transition: 'all 0.15s',
              }}
            >
              {section.title}
            </button>
          ))}
        </div>

        {/* Active Code Section */}
        {tutorial.codeBreakdown.map((section, i) => (
          <div
            key={i}
            id={`code-section-${i}`}
            style={{
              marginBottom: 32,
              display: activeCodeSection === i ? 'block' : 'none',
            }}
          >
            <h3 style={{ color: '#fff', margin: '0 0 8px' }}>{section.title}</h3>
            <p style={{ color: '#999', lineHeight: 1.6, margin: '0 0 16px' }}>
              {section.description}
            </p>
            <pre style={{
              background: '#1a1a2e',
              border: '1px solid #333',
              borderRadius: 8,
              padding: 20,
              overflow: 'auto',
              fontSize: '0.85rem',
              lineHeight: 1.6,
              margin: 0,
            }}>
              <div style={{
                fontSize: '0.7rem', color: '#666', marginBottom: 10,
                textTransform: 'uppercase', letterSpacing: 1,
              }}>
                {section.language}
              </div>
              <code style={{ color: '#e0e0e0' }}>{section.code}</code>
            </pre>
          </div>
        ))}

        {/* All Sections (Sequential View) */}
        <details style={{
          background: '#12122a', border: '1px solid #2a2a4a',
          borderRadius: 12, padding: 20, marginTop: 20,
        }}>
          <summary style={{ cursor: 'pointer', color: '#00ccff', fontWeight: 600, fontSize: '1rem' }}>
            View All Code Sections Sequentially
          </summary>
          <div style={{ marginTop: 20 }}>
            {tutorial.codeBreakdown.map((section, i) => (
              <div key={i} style={{ marginBottom: 32 }}>
                <h3 style={{ color: '#fff', margin: '0 0 8px' }}>{section.title}</h3>
                <p style={{ color: '#999', lineHeight: 1.6, margin: '0 0 12px' }}>
                  {section.description}
                </p>
                <pre style={{
                  background: '#1a1a2e', border: '1px solid #333',
                  borderRadius: 8, padding: 16, overflow: 'auto',
                  fontSize: '0.82rem', lineHeight: 1.5,
                }}>
                  <code style={{ color: '#e0e0e0' }}>{section.code}</code>
                </pre>
              </div>
            ))}
          </div>
        </details>

        {/* Tags */}
        <div style={{ marginTop: 40, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: '#666', fontSize: '0.85rem' }}>Tags:</span>
          {tutorial.tags.map(tag => (
            <span key={tag} style={{
              fontSize: '0.8rem', padding: '4px 10px',
              background: '#1a1a3e', borderRadius: 6, color: '#aaa', border: '1px solid #333',
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
  );
}
