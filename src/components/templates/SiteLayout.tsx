import React from 'react';
import SiteHeader from '../organisms/SiteHeader';
import DocsSidebar from '../organisms/DocsSidebar';

interface SiteLayoutProps {
  children: React.ReactNode;
}

export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div style={{
      height: '100vh',
      background: '#0a0a1a',
      color: '#ddd',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <SiteHeader />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <DocsSidebar />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
