import { useNavigate } from 'react-router-dom';
import { CheckCircle, Zap, Star, Building2, AlertTriangle } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';
import { useProfile } from '../../hooks/useProfile';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    period: 'forever',
    icon: Zap,
    color: '#64748b',
    gradient: 'linear-gradient(135deg,#334155,#475569)',
    features: ['10 invoices/month', 'Basic invoice templates', 'WhatsApp & email sharing', 'UPI payment links'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹999',
    period: '/month',
    icon: Star,
    color: '#2563eb',
    gradient: 'linear-gradient(135deg,#1d4ed8,#2563eb)',
    popular: true,
    features: ['Unlimited invoices', 'All invoice templates', 'Automatic payment reminders', 'Recurring invoices', 'Analytics dashboard', 'Priority support'],
  },
  {
    id: 'business',
    name: 'Business',
    price: '₹2,499',
    period: '/month',
    icon: Building2,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg,#b45309,#f59e0b)',
    features: ['Everything in Pro', 'Multi-user access', 'API access', 'E-invoice compliance', 'Custom branding', 'Dedicated support'],
  },
];

export function SubscriptionPanel() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { tier, isExpired, daysUntilExpiry, monthlyCount, invoiceLimit } = useSubscription();

  const currentPlan = PLANS.find(p => p.id === tier) ?? PLANS[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ borderRadius: '20px', padding: '24px', background: 'linear-gradient(135deg,#0f172a,#1e293b)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ color: '#475569', fontSize: '12px', marginBottom: '6px' }}>Current Plan</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${currentPlan.color}25`, border: `1px solid ${currentPlan.color}50` }}>
                <currentPlan.icon style={{ width: '20px', height: '20px', color: currentPlan.color }} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>{currentPlan.name}</h2>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: isExpired ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)', color: isExpired ? '#f87171' : '#34d399' }}>
                {isExpired ? 'Expired' : 'Active'}
              </span>
            </div>
          </div>
          {(profile as any)?.subscription_start_date && (
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#475569', fontSize: '11px', marginBottom: '4px' }}>Billing Period</p>
              <p style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 500 }}>
                {new Date((profile as any).subscription_start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                {(profile as any)?.subscription_end_date && <> — {new Date((profile as any).subscription_end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</>}
              </p>
            </div>
          )}
        </div>

        {invoiceLimit && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
              <span style={{ color: '#475569' }}>Monthly Invoices</span>
              <span style={{ color: '#fff', fontWeight: 700 }}>{monthlyCount} / {invoiceLimit}</span>
            </div>
            <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '4px', background: monthlyCount >= invoiceLimit ? '#ef4444' : 'linear-gradient(90deg,#3b82f6,#06b6d4)', width: `${Math.min(100, (monthlyCount / invoiceLimit) * 100)}%`, transition: 'width 0.5s' }} />
            </div>
          </div>
        )}

        {daysUntilExpiry !== null && daysUntilExpiry <= 7 && !isExpired && (
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <AlertTriangle style={{ width: '16px', height: '16px', color: '#fbbf24', flexShrink: 0 }} />
            <p style={{ color: '#fcd34d', fontSize: '13px' }}>Your plan expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}. Renew to avoid interruption.</p>
          </div>
        )}
        {isExpired && (
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <AlertTriangle style={{ width: '16px', height: '16px', color: '#f87171', flexShrink: 0 }} />
            <p style={{ color: '#fca5a5', fontSize: '13px' }}>Your subscription has expired. Upgrade to restore Pro features.</p>
          </div>
        )}
      </div>

      <div>
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Choose Your Plan</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '16px' }}>
          {PLANS.map((plan) => {
            const isCurrent = tier === plan.id;
            return (
              <div key={plan.id} style={{ position: 'relative', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', border: isCurrent ? `2px solid ${plan.color}` : '2px solid #e2e8f0', background: isCurrent ? `${plan.color}08` : '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                {(plan as any).popular && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px', color: '#fff', background: plan.gradient, whiteSpace: 'nowrap' }}>Most Popular</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: plan.gradient }}>
                    <plan.icon style={{ width: '20px', height: '20px', color: '#fff' }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>{plan.name}</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: plan.color }}>{plan.price}</span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>{plan.period}</span>
                    </div>
                  </div>
                </div>
                <ul style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <CheckCircle style={{ width: '15px', height: '15px', color: plan.color, flexShrink: 0, marginTop: '1px' }} />
                      <span style={{ fontSize: '13px', color: '#475569' }}>{f}</span>
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div style={{ textAlign: 'center', padding: '9px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: `${plan.color}15`, color: plan.color }}>Current Plan</div>
                ) : (
                  <button onClick={() => navigate('/profile?tab=subscription')} style={{ padding: '9px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#fff', background: plan.gradient, border: 'none', cursor: 'pointer' }}>
                    {tier === 'free' || tier === 'starter' ? `Upgrade to ${plan.name}` : `Switch to ${plan.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
