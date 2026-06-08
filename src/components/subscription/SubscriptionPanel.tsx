import { useState } from 'react';
import { CheckCircle, XCircle, Zap, Star, Building2, AlertTriangle, Clock, Mail, MessageCircle, Phone } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';
import { useProfile } from '../../hooks/useProfile';
import { format, formatDistanceToNow } from 'date-fns';

const CONTACT_EMAIL = 'nitishjha@pathwise.in';
const CONTACT_PHONE = '+918179679471';
const CONTACT_PHONE_DISPLAY = '+91 81796 79471';

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

function buildEmailLink(planName: string, planPrice: string, userEmail: string, companyName: string) {
  const subject = encodeURIComponent(`AvinyaInvoice ${planName} Plan Subscription Request`);
  const body = encodeURIComponent(
    `Hi,\n\nI would like to subscribe to the AvinyaInvoice ${planName} plan (${planPrice}/month).\n\nMy details:\n- Company: ${companyName}\n- Email: ${userEmail}\n\nPlease guide me through the payment process.\n\nThank you.`
  );
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

function buildWhatsAppLink(planName: string, planPrice: string, userEmail: string, companyName: string) {
  const text = encodeURIComponent(
    `Hi, I would like to subscribe to the AvinyaInvoice *${planName} plan* (${planPrice}/month).\n\nCompany: ${companyName}\nEmail: ${userEmail}\n\nPlease guide me through the payment process.`
  );
  return `https://wa.me/${CONTACT_PHONE.replace('+', '')}?text=${text}`;
}

interface ContactModalProps {
  plan: typeof PLANS[1] | typeof PLANS[2];
  onClose: () => void;
  userEmail: string;
  companyName: string;
}

function ContactModal({ plan, onClose, userEmail, companyName }: ContactModalProps) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '440px', borderRadius: '20px', background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{ padding: '24px 24px 0', background: plan.gradient }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <plan.icon style={{ width: '22px', height: '22px', color: '#fff' }} />
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Subscribe to</p>
              <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '20px' }}>{plan.name} Plan — {plan.price}/mo</h2>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          <div style={{ padding: '14px', borderRadius: '12px', background: '#fefce8', border: '1px solid #fde68a', marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', color: '#92400e', lineHeight: 1.6 }}>
              <strong>How it works:</strong> Contact us via email or WhatsApp to initiate your subscription. We will confirm payment details and manually activate your plan within 24 hours.
            </p>
          </div>

          <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px', fontWeight: 500 }}>Choose how you'd like to reach us:</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <a
              href={buildEmailLink(plan.name, plan.price, userEmail, companyName)}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', textDecoration: 'none', cursor: 'pointer' }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Mail style={{ width: '18px', height: '18px', color: '#fff' }} />
              </div>
              <div>
                <p style={{ fontWeight: 600, color: '#1e40af', fontSize: '14px' }}>Send an Email</p>
                <p style={{ color: '#3b82f6', fontSize: '12px' }}>{CONTACT_EMAIL}</p>
              </div>
            </a>

            <a
              href={buildWhatsAppLink(plan.name, plan.price, userEmail, companyName)}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', textDecoration: 'none', cursor: 'pointer' }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#15803d,#22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MessageCircle style={{ width: '18px', height: '18px', color: '#fff' }} />
              </div>
              <div>
                <p style={{ fontWeight: 600, color: '#166534', fontSize: '14px' }}>WhatsApp Us</p>
                <p style={{ color: '#16a34a', fontSize: '12px' }}>{CONTACT_PHONE_DISPLAY}</p>
              </div>
            </a>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Phone style={{ width: '18px', height: '18px', color: '#64748b' }} />
              </div>
              <div>
                <p style={{ fontWeight: 600, color: '#334155', fontSize: '14px' }}>Call Us</p>
                <p style={{ color: '#64748b', fontSize: '12px' }}>{CONTACT_PHONE_DISPLAY}</p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ marginTop: '20px', width: '100%', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#64748b', background: '#f1f5f9', border: 'none', cursor: 'pointer' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function SubscriptionPanel() {
  const { profile } = useProfile();
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

  const [contactPlan, setContactPlan] = useState<typeof PLANS[1] | typeof PLANS[2] | null>(null);

  const currentPlan = PLANS.find(p => p.id === effectiveTier) ?? PLANS[0];
  const userEmail = profile?.email ?? '';
  const companyName = profile?.company_name ?? '';

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
            <p style={{ color: '#475569', fontSize: '11px', marginTop: '6px' }}>Resets on the 1st of every month</p>
          </div>
        )}

        {expiryWarning && daysUntilExpiry !== null && (
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <AlertTriangle style={{ width: '16px', height: '16px', color: '#fbbf24', flexShrink: 0, marginTop: '1px' }} />
            <div>
              <p style={{ color: '#fcd34d', fontSize: '13px', fontWeight: 600 }}>
                Subscription expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
              </p>
              <p style={{ color: '#92400e', fontSize: '12px', marginTop: '2px' }}>
                Contact us to renew and keep your features uninterrupted.
              </p>
            </div>
          </div>
        )}

        {isExpired && tier !== 'free' && (
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <AlertTriangle style={{ width: '16px', height: '16px', color: '#f87171', flexShrink: 0, marginTop: '1px' }} />
            <div>
              <p style={{ color: '#fca5a5', fontSize: '13px', fontWeight: 600 }}>
                Your {tier.charAt(0).toUpperCase() + tier.slice(1)} plan expired
              </p>
              <p style={{ color: '#7f1d1d', fontSize: '12px', marginTop: '2px' }}>
                You have been moved to the Free plan. Contact us to reactivate.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* How subscription works */}
      <div style={{ padding: '16px 20px', borderRadius: '14px', background: '#fefce8', border: '1px solid #fde68a', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <MessageCircle style={{ width: '16px', height: '16px', color: '#fff' }} />
        </div>
        <div>
          <p style={{ fontWeight: 700, color: '#92400e', fontSize: '14px', marginBottom: '3px' }}>How to upgrade</p>
          <p style={{ color: '#a16207', fontSize: '13px', lineHeight: 1.6 }}>
            Choose a plan below and click <strong>"Contact to Subscribe"</strong>. We'll confirm your payment and activate your plan within 24 hours. Contact us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#1d4ed8', textDecoration: 'underline' }}>{CONTACT_EMAIL}</a>
            {' '}or WhatsApp{' '}
            <a href={`https://wa.me/${CONTACT_PHONE.replace('+', '')}`} target="_blank" rel="noreferrer" style={{ color: '#16a34a', textDecoration: 'underline' }}>{CONTACT_PHONE_DISPLAY}</a>.
          </p>
        </div>
      </div>

      {/* Plan cards */}
      <div>
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Plans & Pricing</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '16px' }}>
          {PLANS.map((plan) => {
            const isCurrent = effectiveTier === plan.id && !isExpired;

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
                    Valid for exactly <strong>30 days</strong> from activation date
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

                {isCurrent ? (
                  <div style={{ textAlign: 'center', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: `${plan.color}15`, color: plan.color }}>
                    Current Plan
                  </div>
                ) : plan.id === 'free' ? (
                  <div style={{ textAlign: 'center', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, color: '#94a3b8', border: '1px dashed #e2e8f0' }}>
                    Always available
                  </div>
                ) : (
                  <button
                    onClick={() => setContactPlan(plan as typeof PLANS[1])}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#fff',
                      background: plan.gradient, border: 'none', cursor: 'pointer',
                      boxShadow: `0 4px 12px ${plan.color}30`,
                    }}
                  >
                    <MessageCircle style={{ width: '14px', height: '14px' }} />
                    {isExpired && tier === plan.id ? `Renew ${plan.name}` : `Contact to Subscribe`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {contactPlan && (
        <ContactModal
          plan={contactPlan}
          onClose={() => setContactPlan(null)}
          userEmail={userEmail}
          companyName={companyName}
        />
      )}
    </div>
  );
}
