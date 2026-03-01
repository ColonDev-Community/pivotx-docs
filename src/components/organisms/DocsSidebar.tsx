import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { DOC_VERSIONS } from '../../data/docs';

export default function DocsSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { version: urlVersion, sectionId } = useParams<{ version?: string; sectionId?: string }>();

  const selectedVersion = urlVersion || DOC_VERSIONS[0].version;
  const currentDocs = DOC_VERSIONS.find(v => v.version === selectedVersion) || DOC_VERSIONS[0];

  // Determine active section from URL or default to first
  const activeId = sectionId || currentDocs.sections[0]?.id;

  const handleSectionClick = (id: string) => {
    navigate(`/docs/${selectedVersion}/${id}`);
  };

  // Only render on docs routes
  if (!location.pathname.startsWith('/docs')) return null;

  return (
    <aside style={{
      width: 260,
      minWidth: 260,
      borderRight: '1px solid #222',
      background: '#0d0d1a',
      padding: '20px 0',
      overflowY: 'auto',
    }}>
      <div style={{ padding: '0 16px 16px', borderBottom: '1px solid #1a1a2e', marginBottom: 8 }}>
        <span style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
          Documentation
        </span>
      </div>
      {currentDocs.sections.map(section => (
        <div key={section.id}>
          <button
            onClick={() => handleSectionClick(section.id)}
            style={{
              display: 'block',
              width: '100%',
              padding: '10px 20px',
              background: activeId === section.id ? '#00ccff11' : 'transparent',
              border: 'none',
              borderLeft: activeId === section.id ? '3px solid #00ccff' : '3px solid transparent',
              color: activeId === section.id ? '#00ccff' : '#aaa',
              fontSize: '0.95rem',
              textAlign: 'left' as const,
              cursor: 'pointer',
              fontWeight: activeId === section.id ? 600 : 400,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              if (activeId !== section.id) e.currentTarget.style.color = '#ddd';
            }}
            onMouseLeave={e => {
              if (activeId !== section.id) e.currentTarget.style.color = '#aaa';
            }}
          >
            {section.title}
          </button>
          {activeId === section.id && section.subsections?.map(sub => (
            <button
              key={sub.id}
              style={{
                display: 'block',
                width: '100%',
                padding: '6px 20px 6px 36px',
                background: 'transparent',
                border: 'none',
                color: '#777',
                fontSize: '0.85rem',
                textAlign: 'left' as const,
                cursor: 'pointer',
              }}
            >
              {sub.title}
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}
