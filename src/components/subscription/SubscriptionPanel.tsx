import { useState } from 'react';
import { CheckCircle, XCircle, Zap, Star, Building2, AlertTriangle, RefreshCw, Clock } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';
import { useProfile } from '../../hooks/useProfile';
import { format, formatDistanceToNow } from 'date-fns';

const PLANS = [
  {
    id: 'free' as const,
    name: 'Free',
    price: '₹0',
    period: 'forever',
    icon: Zap,
    color: '#64748b',
    gradient: 'linear-gradient(135deg,#475569,#64748b)',
    features: [
      { text: '10 invoices per month', included: true },
      { text: 'Basic invoice templates', included: true },
      { text: 'WhatsApp & email sharing', included: true },
      { text: 'UPI payment links', included: true },
      { text: 'All invoice templates', included: false },
      { text: 'Automatic payment reminders', included: false },
      { text: 'Recurring invoices', included: false },
      { text: 'Analytics dashboard', included: false },
    ],
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: '₹999',
    period: '/month',
    icon: Star,
    color: '#2563eb',
    gradient: 'linear-gradient(135deg,#1d4ed8,#2563eb)',
    popular: true,
    features: [
      { text: 'Unlimited invoices', included: true },
      { text: 'All invoice templates', included: true },
      { text: 'WhatsApp & email sharing', included: true },
      { text: 'UPI payment links', included: true },
      { text: 'Automatic payment reminders', included: true },
      { text: 'Recurring invoices', included: true },
      { text: 'Analytics dashboard', included: true },
      { text: 'Priority support', included: true },
    ],
  },
  {
    id: 'business' as const,
    name: 'Business',
    price: '₹2,499',
    period: '/month',
    icon: Building2,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg,#b45309,#f59e0b)',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Multi-user access', included: true },
      { text: 'API access', included: true },
      { text: 'E-invoice compliance', included: true },
      { text: 'Custom branding', included: true },
      { text: 'Dedicated support', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Unlimited invoices', included: true },
    ],
  },
];

export function SubscriptionPanel() {
  const { profile, activateSubscription } = useProfile();
  const {
    effectiveTier,
    tier,
    status,
    isExpired,
    endDate,
    daysUntilExpiry,
    expiryWarning,
    monthlyCount,
    invoiceLimit,
  } = useSubscription();

  const [activating, setActivating] = useState<'pro' | 'business' | null>(null);

  const handleActivate = async (planId: 'pro' | 'business') => {
    setActivating(planId);
    await activateSubscription(planId);
    setActivating(null);
  };

  const currentPlan = PLANS.find(p => p.id === effectiveTier) ?? PLANS[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Current status card */}
      <div style={{ borderRadius: '20px', padding: '24px', background: 'linear-gradient(135deg,#0f172a,#1e293b)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ color: '#475569', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Plan</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${currentPlan.color}25`, border: `1px solid ${currentPlan.color}50` }}>
                <currentPlan.icon style={{ width: '22px', height: '22px', color: currentPlan.color }} />
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#fff' }}>{currentPlan.name}</h2>
              <span style={{
                fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px',
                background: isExpired ? 'rgba(239,68,68,0.2)' : status === 'active' ? 'rgba(16,185,129,0.2)' : 'rgba(100,116,139,0.2)',
                color: isExpired ? '#f87171' : status === 'active' ? '#34d399' : '#94a3b8',
              }}>
                {isExpired ? 'Expired' : status === 'active' ? 'Active' : status}
              </span>
            </div>
          </div>

          {/* Billing dates */}
          {profile?.subscription_start_date && profile?.subscription_end_date && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', marginBottom: '4px' }}>
                <Clock style={{ width: '13px', height: '13px', color: '#475569' }} />
                <p style={{ color: '#475569', fontSize: '11px' }}>Billing period</p>
              </div>
              <p style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 500 }}>
                {format(new Date(profile.subscription_start_date), 'd MMM yyyy')}
                {' — '}
                {format(new Date(profile.subscription_end_date), 'd MMM yyyy')}
              </p>
              {endDate && !isExpired && (
                <p style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
                  Expires {formatDistanceToNow(endDate, { addSuffix: true })}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Monthly invoice usage bar */}
        {invoiceLimit !== null && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Monthly invoices used</span>
              <span style={{ color: '#fff', fontWeight: 700 }}>
                {monthlyCount} / {invoiceLimit}
                {monthlyCount >= invoiceLimit && (
                  <span style={{ color: '#f87171', marginLeft: '6px', fontSize: '11px' }}>Limit reached</span>
                )}
              </span>
            </div>
            <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '4px', transition: 'width 0.5s',
                background: monthlyCount >= invoiceLimit ? '#ef4444' : 'linear-gradient(90deg,#3b82f6,#06b6d4)',
                width: `${Math.min(100, (monthlyCount / invoiceLimit) * 100)}%`,
              }} />
            </div>
            <p style={{ color: '#475569', fontSize: '11px', marginTop: '6px' }}>
              Resets on the 1st of every month
            </p>
          </div>
        )}

        {/* Expiry warning */}
        {expiryWarning && daysUntilExpiry !== null && (
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <AlertTriangle style={{ width: '16px', height: '16px', color: '#fbbf24', flexShrink: 0, marginTop: '1px' }} />
            <div>
              <p style={{ color: '#fcd34d', fontSize: '13px', fontWeight: 600 }}>
                Subscription expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
              </p>
              <p style={{ color: '#92400e', fontSize: '12px', marginTop: '2px' }}>
                Renew now to keep Pro features uninterrupted.
              </p>
            </div>
          </div>
        )}

        {/* Expired notice */}
        {isExpired && tier !== 'free' && (
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <AlertTriangle style={{ width: '16px', height: '16px', color: '#f87171', flexShrink: 0, marginTop: '1px' }} />
            <div>
              <p style={{ color: '#fca5a5', fontSize: '13px', fontWeight: 600 }}>
                Your {tier.charAt(0).toUpperCase() + tier.slice(1)} plan expired
              </p>
              <p style={{ color: '#7f1d1d', fontSize: '12px', marginTop: '2px' }}>
                You have been moved to the Free plan. Reactivate to restore Pro features.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Plan cards */}
      <div>
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Plans & Pricing</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '16px' }}>
          {PLANS.map((plan) => {
            const isCurrent = effectiveTier === plan.id;
            const isLoading = activating === plan.id;

            return (
              <div
                key={plan.id}
                style={{
                  position: 'relative', borderRadius: '20px', padding: '22px', display: 'flex', flexDirection: 'column',
                  border: isCurrent ? `2px solid ${plan.color}` : '2px solid #e2e8f0',
                  background: isCurrent ? `${plan.color}08` : '#fff',
                  boxShadow: isCurrent ? `0 4px 20px ${plan.color}20` : '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                {(plan as any).popular && (
                  <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px', color: '#fff', background: plan.gradient, whiteSpace: 'nowrap', boxShadow: `0 2px 8px ${plan.color}40` }}>
                    Most Popular
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: plan.gradient }}>
                    <plan.icon style={{ width: '20px', height: '20px', color: '#fff' }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '16px' }}>{plan.name}</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                      <span style={{ fontSize: '20px', fontWeight: 800, color: plan.color }}>{plan.price}</span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>{plan.period}</span>
                    </div>
                  </div>
                </div>

                {plan.id !== 'free' && (
                  <p style={{ color: '#64748b', fontSize: '11px', marginBottom: '14px', padding: '6px 10px', borderRadius: '8px', background: '#f8fafc' }}>
                    Valid for exactly <strong>30 days</strong> from activation
                  </p>
                )}

                <ul style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '18px' }}>
                  {plan.features.map(f => (
                    <li key={f.text} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      {f.included ? (
                        <CheckCircle style={{ width: '15px', height: '15px', color: plan.color, flexShrink: 0, marginTop: '1px' }} />
                      ) : (
                        <XCircle style={{ width: '15px', height: '15px', color: '#cbd5e1', flexShrink: 0, marginTop: '1px' }} />
                      )}
                      <span style={{ fontSize: '13px', color: f.included ? '#334155' : '#94a3b8', textDecoration: f.included ? 'none' : 'line-through' }}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {isCurrent && !isExpired ? (
                  <div style={{ textAlign: 'center', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: `${plan.color}15`, color: plan.color }}>
                    Current Plan
                  </div>
                ) : plan.id === 'free' ? (
                  <div style={{ textAlign: 'center', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, color: '#94a3b8', border: '1px dashed #e2e8f0' }}>
                    Always available
                  </div>
                ) : (
                  <button
                    onClick={() => handleActivate(plan.id as 'pro' | 'business')}
                    disabled={!!activating}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#fff',
                      background: activating && !isLoading ? '#94a3b8' : plan.gradient,
                      border: 'none', cursor: activating ? 'not-allowed' : 'pointer',
                      opacity: activating && !isLoading ? 0.6 : 1,
                      boxShadow: `0 4px 12px ${plan.color}30`,
                    }}
                  >
                    {isLoading && <RefreshCw style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />}
                    {isLoading
                      ? 'Activating…'
                      : isExpired && tier === plan.id
                      ? `Renew ${plan.name} — ${plan.price}/mo`
                      : isCurrent
                      ? `Renew ${plan.name}`
                      : `Upgrade to ${plan.name} — ${plan.price}/mo`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
