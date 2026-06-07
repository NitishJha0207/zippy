import { useProfile } from './useProfile';
import type { SubscriptionTier } from '../types/database.types';

/**
 * Feature matrix — what each tier is allowed to do.
 * Free: 10 invoices/month, basic templates, WhatsApp/email sharing, UPI links.
 * Pro:  everything in Free + unlimited invoices, all templates, reminders,
 *       recurring invoices, analytics.
 * Business: everything in Pro + multi-user, API, e-invoice, custom branding.
 */
const FEATURES = {
  free: {
    maxMonthlyInvoices: 10,
    allTemplates: false,
    reminders: false,
    recurringInvoices: false,
    analytics: false,
    multiUser: false,
    apiAccess: false,
    eInvoice: false,
    customBranding: false,
  },
  pro: {
    maxMonthlyInvoices: Infinity,
    allTemplates: true,
    reminders: true,
    recurringInvoices: true,
    analytics: true,
    multiUser: false,
    apiAccess: false,
    eInvoice: false,
    customBranding: false,
  },
  business: {
    maxMonthlyInvoices: Infinity,
    allTemplates: true,
    reminders: true,
    recurringInvoices: true,
    analytics: true,
    multiUser: true,
    apiAccess: true,
    eInvoice: true,
    customBranding: true,
  },
} as const satisfies Record<Exclude<SubscriptionTier, 'starter'>, object>;

export function useSubscription() {
  const { profile } = useProfile();

  // Normalise legacy 'starter' to 'free'
  const rawTier = (profile?.subscription_tier ?? 'free') as SubscriptionTier;
  const tier: Exclude<SubscriptionTier, 'starter'> =
    rawTier === 'starter' ? 'free' : rawTier as Exclude<SubscriptionTier, 'starter'>;

  const status = profile?.subscription_status ?? 'active';
  const endDate = profile?.subscription_end_date
    ? new Date(profile.subscription_end_date)
    : null;

  // A paid subscription is expired when its end_date is in the past or status is 'expired'
  const isExpired =
    status === 'expired' ||
    (endDate !== null && endDate < new Date() && tier !== 'free');

  // Effective tier: downgrade to free if subscription is expired
  const effectiveTier: Exclude<SubscriptionTier, 'starter'> =
    isExpired && tier !== 'free' ? 'free' : tier;

  const features = FEATURES[effectiveTier];

  const monthlyCount = profile?.monthly_invoice_count ?? 0;
  const invoiceLimit =
    features.maxMonthlyInvoices === Infinity ? null : features.maxMonthlyInvoices;
  const canCreateInvoice =
    invoiceLimit === null || monthlyCount < invoiceLimit;
  const invoicesRemaining =
    invoiceLimit !== null ? Math.max(0, invoiceLimit - monthlyCount) : null;

  // Days until expiry (only meaningful for paid tiers)
  const daysUntilExpiry =
    endDate !== null && !isExpired
      ? Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

  // Show warning when <= 7 days remain
  const expiryWarning =
    daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0;

  return {
    tier,
    effectiveTier,
    status,
    isExpired,
    endDate,
    daysUntilExpiry,
    expiryWarning,
    features,
    // invoice quota
    canCreateInvoice,
    monthlyCount,
    invoiceLimit,
    invoicesRemaining,
  };
}
