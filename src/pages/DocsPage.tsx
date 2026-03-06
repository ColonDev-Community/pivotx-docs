import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DOC_VERSIONS } from '../data/docs';

function renderInlineCode(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} style={{
          background: '#2a2a4a',
          padding: '2px 6px',
          borderRadius: 4,
          fontSize: '0.85em',
          color: '#ff8844',
          fontFamily: "'Courier New', monospace",
        }}>
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.trim().split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  let codeBlock = '';
  let inCodeBlock = false;
  let codeLanguage = '';

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} style={{
            background: '#1a1a2e',
            border: '1px solid #333',
            borderRadius: 8,
            padding: 16,
            overflow: 'auto',
            fontSize: '0.85rem',
            lineHeight: 1.6,
            margin: '12px 0',
          }}>
            <div style={{
              fontSize: '0.7rem',
              color: '#666',
              marginBottom: 8,
              textTransform: 'uppercase',
            }}>{codeLanguage}</div>
            <code style={{ color: '#e0e0e0' }}>{codeBlock}</code>
          </pre>
        );
        codeBlock = '';
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLanguage = line.trim().replace('```', '');
      }
      i++;
      continue;
    }

    if (inCodeBlock) {
      codeBlock += (codeBlock ? '\n' : '') + line;
      i++;
      continue;
    }

    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} style={{ color: '#ddd', marginTop: 28, fontSize: '1.2rem' }}>{line.slice(4)}</h3>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} style={{ color: '#fff', marginTop: 32, fontSize: '1.6rem', borderBottom: '1px solid #2a2a4a', paddingBottom: 8 }}>{line.slice(3)}</h2>);
    } else if (line.startsWith('# ')) {
      elements.push(<h1 key={i} style={{ color: '#fff', fontSize: '2rem' }}>{line.slice(2)}</h1>);
    } else if (line.includes('|') && line.trim().startsWith('|')) {
      const rows: string[][] = [];
      let j = i;
      while (j < lines.length && lines[j].includes('|') && lines[j].trim().startsWith('|')) {
        const cells = lines[j].split('|').filter(c => c.trim()).map(c => c.trim());
        if (!lines[j].includes('---')) {
          rows.push(cells);
        }
        j++;
      }
      elements.push(
        <table key={i} style={{
          width: '100%', borderCollapse: 'collapse', margin: '12px 0',
          fontSize: '0.9rem',
        }}>
          <thead>
            <tr>
              {rows[0]?.map((cell, ci) => (
                <th key={ci} style={{
                  padding: '8px 12px', textAlign: 'left',
                  borderBottom: '2px solid #333', color: '#aaa',
                }}>
                  {renderInlineCode(cell)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(1).map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{
                    padding: '8px 12px', borderBottom: '1px solid #222', color: '#ccc',
                  }}>
                    {renderInlineCode(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
      i = j;
      continue;
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} style={{
          borderLeft: '3px solid #ffaa44',
          padding: '8px 16px',
          margin: '12px 0',
          color: '#bba',
          background: '#1a1a1a',
          borderRadius: '0 8px 8px 0',
        }}>
          {renderInlineCode(line.slice(2))}
        </blockquote>
      );
    } else if (line.trim().startsWith('- ')) {
      const items: string[] = [];
      let j = i;
      while (j < lines.length && lines[j].trim().startsWith('- ')) {
        items.push(lines[j].trim().slice(2));
        j++;
      }
      elements.push(
        <ul key={i} style={{ margin: '8px 0', paddingLeft: 24 }}>
          {items.map((item, ii) => (
            <li key={ii} style={{ color: '#ccc', marginBottom: 4, lineHeight: 1.6 }}>
              {renderInlineCode(item)}
            </li>
          ))}
        </ul>
      );
      i = j;
      continue;
    } else if (line.trim() === '') {
      elements.push(<div key={i} style={{ height: 8 }} />);
    } else if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
      elements.push(
        <p key={i} style={{ color: '#fff', fontWeight: 700, margin: '16px 0 4px' }}>
          {line.trim().replace(/\*\*/g, '')}
        </p>
      );
    } else {
      elements.push(
        <p key={i} style={{ color: '#ccc', lineHeight: 1.7, margin: '6px 0' }}>
          {renderInlineCode(line)}
        </p>
      );
    }

    i++;
  }

  return <>{elements}</>;
}

export default function DocsPage() {
  const navigate = useNavigate();
  const { version: urlVersion, sectionId } = useParams();

  const selectedVersion = urlVersion || DOC_VERSIONS[0].version;

  const currentDocs = DOC_VERSIONS.find(v => v.version === selectedVersion) || DOC_VERSIONS[0];
  const activeSection = sectionId
    ? currentDocs.sections.find(s => s.id === sectionId)
    : currentDocs.sections[0];

  const handleVersionChange = (version: string) => {
    navigate(`/docs/${version}`);
  };

  return (
    <>
      {/* Content Area */}
      <main style={{
        flex: 1,
        padding: '30px 48px',
        overflowY: 'auto',
        maxWidth: 900,
      }}>
          {activeSection ? (
            <div>
              <MarkdownContent content={activeSection.content} />
              {activeSection.subsections?.map(sub => (
                <div key={sub.id} id={sub.id} style={{ marginTop: 40 }}>
                  <MarkdownContent content={sub.content} />
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666' }}>Select a section from the sidebar.</p>
          )}

          {/* Version Badge */}
          <div style={{
            marginTop: 60,
            padding: '16px 20px',
            background: '#12122a',
            borderRadius: 8,
            border: '1px solid #2a2a4a',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <span style={{
              padding: '4px 12px',
              background: '#00ccff22',
              border: '1px solid #00ccff44',
              borderRadius: 6,
              color: '#00ccff',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}>
              {currentDocs.label}
            </span>
            <span style={{ color: '#888', fontSize: '0.85rem' }}>
              You are viewing documentation for PivotX {currentDocs.label}.
              {selectedVersion !== DOC_VERSIONS[0].version && (
                <button
                  onClick={() => handleVersionChange(DOC_VERSIONS[0].version)}
                  style={{
                    background: 'none', border: 'none', color: '#00ccff',
                    cursor: 'pointer', textDecoration: 'underline', marginLeft: 8,
                  }}
                >
                  Switch to latest
                </button>
              )}
            </span>
          </div>
        </main>
    </>
  );
}
