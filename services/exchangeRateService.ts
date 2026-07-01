const CACHE_KEY = 'aura_exchange_rates';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  lastUpdated: string;
  source: string;
}

const FALLBACK_RATES: Record<string, number> = {
  NGN: 1,
  USD: 1550,
  EUR: 1680,
  GBP: 1960,
  GHS: 120,
  KES: 12,
  ZAR: 85,
  CAD: 1130,
  AUD: 1010,
};

export async function fetchExchangeRates(base: string = 'NGN'): Promise<ExchangeRates> {
  // Check cache
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const data: ExchangeRates = JSON.parse(cached);
    if (Date.now() - new Date(data.lastUpdated).getTime() < CACHE_DURATION) {
      return data;
    }
  }

  try {
    const response = await fetch(
      `https://open.er-api.com/v6/latest/${base}`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) throw new Error('Rate API failed');

    const data = await response.json();
    const rates: ExchangeRates = {
      base,
      rates: data.rates || FALLBACK_RATES,
      lastUpdated: new Date().toISOString(),
      source: 'open.er-api.com',
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(rates));
    return rates;
  } catch (error) {
    console.warn('Exchange rate fetch failed, using fallback:', error);
    return {
      base,
      rates: FALLBACK_RATES,
      lastUpdated: new Date().toISOString(),
      source: 'fallback',
    };
  }
}

export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>
): number {
  if (from === to) return amount;
  const fromRate = rates[from] || 1;
  const toRate = rates[to] || 1;
  return Math.round((amount / fromRate) * toRate * 100) / 100;
}

export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    NGN: '₦', USD: '$', EUR: '€', GBP: '£', GHS: 'GH₵', KES: 'KSh', ZAR: 'R',
  };
  const symbol = symbols[currency] || currency + ' ';
  return `${symbol}${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const SUPPORTED_CURRENCIES = [
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
];
