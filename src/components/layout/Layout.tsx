import { useNavigate } from 'react-router-dom';
import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { useSubscription } from '../../hooks/useSubscription';

function ExpiryBanner() {
  const navigate = useNavigate();
  const { expiryWarning, isExpired, daysUntilExpiry, tier } = useSubscription();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;
  if (tier === 'free') return null;
  if (!expiryWarning && !isExpired) return null;

  const expired = isExpired;
  const bg = expired ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)';
  const border = expired ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(245,158,11,0.3)';
  const iconColor = expired ? '#f87171' : '#fbbf24';
  const textColor = expired ? '#fca5a5' : '#fcd34d';
  const subColor = expired ? '#7f1d1d' : '#92400e';
  const btnBg = expired ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)';
  const btnColor = expired ? '#fca5a5' : '#fcd34d';

  return (
    <div style={{ padding: '10px 16px', background: bg, borderBottom: border, display: 'flex', alignItems: 'center', gap: '10px' }}>
      <AlertTriangle style={{ width: '15px', height: '15px', color: iconColor, flexShrink: 0 }} />
      <p style={{ flex: 1, fontSize: '13px', color: textColor, fontWeight: 500 }}>
        {expired
          ? `Your ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan has expired. You have been moved to the Free plan.`
          : `Your ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}. Renew to avoid interruption.`}
        {' '}
        <span style={{ color: subColor, fontSize: '12px' }}>
          {expired ? 'Reactivate to restore your features.' : ''}
        </span>
      </p>
      <button
        onClick={() => navigate('/profile?tab=subscription')}
        style={{ fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '8px', background: btnBg, color: btnColor, border: 'none', cursor: 'pointer', flexShrink: 0 }}
      >
        {expired ? 'Reactivate' : 'Renew Now'}
      </button>
      <button
        onClick={() => setDismissed(true)}
        style={{ color: iconColor, background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0, display: 'flex', alignItems: 'center' }}
        title="Dismiss"
      >
        <X style={{ width: '14px', height: '14px' }} />
      </button>
    </div>
  );
}

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f8fafc' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <ExpiryBanner />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
