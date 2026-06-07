import { useNavigate } from 'react-router-dom';
import { Lock, Zap } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';
import type { SubscriptionTier } from '../../types/database.types';

type Feature = keyof ReturnType<typeof useSubscription>['features'];

interface Props {
  feature: Feature;
  requiredTier?: Exclude<SubscriptionTier, 'starter' | 'free'>;
  children: React.ReactNode;
  /** If true, render a full-page overlay. If false, render inline. */
  overlay?: boolean;
}

const TIER_LABELS: Record<string, string> = {
  pro: 'Pro',
  business: 'Business',
};

const FEATURE_NAMES: Partial<Record<Feature, string>> = {
  reminders: 'Automatic Payment Reminders',
  recurringInvoices: 'Recurring Invoices',
  analytics: 'Analytics Dashboard',
  allTemplates: 'All Invoice Templates',
  multiUser: 'Multi-User Access',
  apiAccess: 'API Access',
  eInvoice: 'E-Invoice Compliance',
  customBranding: 'Custom Branding',
};

export function SubscriptionGuard({ feature, requiredTier = 'pro', children, overlay = false }: Props) {
  const navigate = useNavigate();
  const { features } = useSubscription();

  const allowed = features[feature];
  if (allowed) return <>{children}</>;

  const tierLabel = TIER_LABELS[requiredTier] ?? 'Pro';
  const featureName = FEATURE_NAMES[feature] ?? feature;

  if (overlay) {
    return (
      <div style={{ position: 'relative', minHeight: '240px' }}>
        <div style={{ filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.4 }}>
          {children}
        </div>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <div style={{ textAlign: 'center', padding: '32px', borderRadius: '20px', background: '#fff', boxShadow: '0 8px 40px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0', maxWidth: '340px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', margin: '0 auto 16px' }}>
              <Lock style={{ width: '24px', height: '24px', color: '#fff' }} />
            </div>
            <h3 style={{ fontWeight: 800, color: '#0f172a', fontSize: '17px', marginBottom: '6px' }}>
              {tierLabel} Feature
            </h3>
            <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.6, marginBottom: '20px' }}>
              <strong>{featureName}</strong> is available on the {tierLabel} plan and above. Upgrade to unlock it.
            </p>
            <button
              onClick={() => navigate('/profile?tab=subscription')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', border: 'none', cursor: 'pointer' }}
            >
              <Zap style={{ width: '14px', height: '14px' }} />
              Upgrade to {tierLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: '16px', padding: '28px', textAlign: 'center', background: 'linear-gradient(135deg,#eff6ff,#f0fdf4)', border: '2px dashed #bfdbfe' }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', margin: '0 auto 12px' }}>
        <Lock style={{ width: '20px', height: '20px', color: '#fff' }} />
      </div>
      <h3 style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '15px', marginBottom: '6px' }}>
        {tierLabel} Plan Required
      </h3>
      <p style={{ color: '#1d4ed8', fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>
        <strong>{featureName}</strong> is available on the {tierLabel} plan. Upgrade to access this feature.
      </p>
      <button
        onClick={() => navigate('/profile?tab=subscription')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', border: 'none', cursor: 'pointer' }}
      >
        <Zap style={{ width: '13px', height: '13px' }} />
        Upgrade to {tierLabel}
      </button>
    </div>
  );
}
