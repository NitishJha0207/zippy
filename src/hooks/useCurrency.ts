import { useProfile } from './useProfile';
import { getCurrencyByCode, formatCurrency, formatCurrencyRaw, convertFromINR, getSubscriptionPrice, CURRENCIES } from '../lib/currency';
import type { CurrencyInfo } from '../lib/currency';

export function useCurrency() {
  const { profile, updateProfile } = useProfile();
  const currencyCode = profile?.currency ?? 'INR';
  const currency = getCurrencyByCode(currencyCode);

  const setCurrency = async (code: string) => {
    await updateProfile({ currency: code } as any);
  };

  const format = (amountINR: number): string => {
    return formatCurrency(amountINR, currencyCode);
  };

  const formatRaw = (amount: number): string => {
    return formatCurrencyRaw(amount, currencyCode);
  };

  const convert = (amountINR: number): number => {
    return convertFromINR(amountINR, currencyCode);
  };

  const subscriptionPrice = (tier: 'pro' | 'business'): string => {
    return getSubscriptionPrice(tier, currencyCode);
  };

  return {
    currencyCode,
    currency,
    currencies: CURRENCIES,
    setCurrency,
    format,
    formatRaw,
    convert,
    subscriptionPrice,
  };
}
