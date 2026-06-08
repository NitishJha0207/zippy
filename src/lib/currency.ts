export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  country: string;
  rateFromINR: number;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', country: 'India', rateFromINR: 1 },
  { code: 'USD', symbol: '$', name: 'US Dollar', country: 'United States', rateFromINR: 0.012 },
  { code: 'EUR', symbol: '€', name: 'Euro', country: 'Europe', rateFromINR: 0.011 },
  { code: 'GBP', symbol: '£', name: 'British Pound', country: 'United Kingdom', rateFromINR: 0.0094 },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', country: 'UAE', rateFromINR: 0.044 },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', country: 'Saudi Arabia', rateFromINR: 0.045 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', country: 'Canada', rateFromINR: 0.016 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', country: 'Australia', rateFromINR: 0.018 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', country: 'Singapore', rateFromINR: 0.016 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', country: 'Japan', rateFromINR: 1.78 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', country: 'China', rateFromINR: 0.087 },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', country: 'Malaysia', rateFromINR: 0.053 },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', country: 'Bangladesh', rateFromINR: 1.43 },
  { code: 'NPR', symbol: 'रू', name: 'Nepalese Rupee', country: 'Nepal', rateFromINR: 1.6 },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', country: 'Sri Lanka', rateFromINR: 3.6 },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', country: 'South Africa', rateFromINR: 0.22 },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', country: 'Nigeria', rateFromINR: 18.5 },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', country: 'Kenya', rateFromINR: 1.54 },
];

export function getCurrencyByCode(code: string): CurrencyInfo {
  return CURRENCIES.find(c => c.code === code) ?? CURRENCIES[0];
}

export function convertFromINR(amountINR: number, targetCurrency: string): number {
  const currency = getCurrencyByCode(targetCurrency);
  return amountINR * currency.rateFromINR;
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = getCurrencyByCode(currencyCode);
  const converted = amount * currency.rateFromINR;

  if (currency.code === 'JPY') {
    return `${currency.symbol}${Math.round(converted).toLocaleString()}`;
  }

  return `${currency.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatCurrencyRaw(amount: number, currencyCode: string): string {
  const currency = getCurrencyByCode(currencyCode);

  if (currency.code === 'JPY') {
    return `${currency.symbol}${Math.round(amount).toLocaleString()}`;
  }

  return `${currency.symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getSubscriptionPrice(tier: 'pro' | 'business', currencyCode: string): string {
  const pricesINR = { pro: 249, business: 679 };
  const amount = convertFromINR(pricesINR[tier], currencyCode);
  const currency = getCurrencyByCode(currencyCode);

  if (currency.code === 'INR') return `₹${pricesINR[tier]}`;
  if (currency.code === 'JPY') return `${currency.symbol}${Math.round(amount)}`;
  return `${currency.symbol}${amount.toFixed(2)}`;
}
