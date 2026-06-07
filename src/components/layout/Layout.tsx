import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f8fafc' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
