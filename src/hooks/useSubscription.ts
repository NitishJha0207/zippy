import { useProfile } from './useProfile';

export function useSubscription() {
  const { profile } = useProfile();

  const tier: string = (profile as any)?.subscription_tier ?? 'free';
  const status: string = (profile as any)?.subscription_status ?? 'active';

  const isExpired =
    status === 'expired' ||
    (!!(profile as any)?.subscription_end_date &&
      new Date((profile as any).subscription_end_date) < new Date());

  const effectiveTier = isExpired && tier !== 'free' && tier !== 'starter' ? 'free' : tier;
  const isActive = !isExpired && status === 'active';

  const monthlyCount: number = (profile as any)?.monthly_invoice_count ?? 0;
  const invoiceLimit: number | null = effectiveTier === 'free' || effectiveTier === 'starter' ? 10 : null;
  const canCreateInvoice = invoiceLimit === null || monthlyCount < invoiceLimit;
  const invoicesRemaining = invoiceLimit !== null ? Math.max(0, invoiceLimit - monthlyCount) : null;

  const daysUntilExpiry = (profile as any)?.subscription_end_date
    ? Math.ceil((new Date((profile as any).subscription_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return { tier, effectiveTier, isActive, isExpired, canCreateInvoice, monthlyCount, invoiceLimit, invoicesRemaining, daysUntilExpiry };
}
