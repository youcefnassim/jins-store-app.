import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Currency = 'DZD' | 'EUR' | 'USD';

export interface CurrencyConfig {
  code: Currency;
  label: string;
  symbol: string;
  flag: string;
  decimals: number;
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  DZD: { code: 'DZD', label: 'Dinar Algérien', symbol: 'DA', flag: '🇩🇿', decimals: 0 },
  EUR: { code: 'EUR', label: 'Euro', symbol: '€', flag: '🇪🇺', decimals: 2 },
  USD: { code: 'USD', label: 'US Dollar', symbol: '$', flag: '🇺🇸', decimals: 2 },
};

interface CurrencyState {
  currentCurrency: Currency;
  rates: {
    DZD: number;
    EUR: number; // e.g. 1 EUR = 275 DZD
    USD: number; // e.g. 1 USD = 242 DZD
  };
  setCurrency: (currency: Currency) => void;
  setRate: (currency: 'EUR' | 'USD', rateInDzd: number) => void;
  convert: (amountInDzd: number, targetCurrency?: Currency) => number;
  formatPrice: (amountInDzd: number, targetCurrency?: Currency) => string;
  calculateMargin: (priceDzd: number, costUsd: number) => {
    costDzd: number;
    profitDzd: number;
    marginPercent: number;
  };
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currentCurrency: 'DZD',
      rates: {
        DZD: 1,
        EUR: 275, // 1 EUR = 275 DZD
        USD: 242, // 1 USD = 242 DZD
      },

      setCurrency: (currency: Currency) => {
        set({ currentCurrency: currency });
      },

      setRate: (currency: 'EUR' | 'USD', rateInDzd: number) => {
        set((state) => ({
          rates: {
            ...state.rates,
            [currency]: Math.max(1, rateInDzd),
          },
        }));
      },

      convert: (amountInDzd: number, targetCurrency?: Currency) => {
        const { currentCurrency, rates } = get();
        const target = targetCurrency || currentCurrency;
        if (target === 'DZD') return amountInDzd;

        const rate = rates[target] || 1;
        const converted = amountInDzd / rate;
        return Number(converted.toFixed(2));
      },

      formatPrice: (amountInDzd: number, targetCurrency?: Currency) => {
        const { currentCurrency, rates } = get();
        const target = targetCurrency || currentCurrency;
        const config = CURRENCIES[target] || CURRENCIES.DZD;

        if (target === 'DZD') {
          // Clean round format: 1 200 DA
          return `${Math.round(amountInDzd).toLocaleString('fr-DZ')} ${config.symbol}`;
        }

        const rate = rates[target] || 1;
        const converted = amountInDzd / rate;
        return `${converted.toFixed(config.decimals)} ${config.symbol}`;
      },

      calculateMargin: (priceDzd: number, costUsd: number) => {
        const { rates } = get();
        const usdRate = rates.USD || 242;
        const costDzd = Math.round(costUsd * usdRate);
        const profitDzd = priceDzd - costDzd;
        const marginPercent = priceDzd > 0 ? Math.round((profitDzd / priceDzd) * 100) : 0;

        return {
          costDzd,
          profitDzd,
          marginPercent,
        };
      },
    }),
    {
      name: 'jin_currency_storage',
    }
  )
);
