"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  convertCurrency,
  CURRENCY_STORAGE_KEY,
  CurrencyDefinition,
  DEFAULT_CURRENCY,
  FxRates,
} from "@/lib/currency";

type CurrencyContextValue = {
  currency: string;
  setCurrency: (currency: string) => void;
  currencies: CurrencyDefinition[];
  rates: FxRates;
  rateDate: string | null;
  loading: boolean;
  convert: (amount: number, sourceCurrency?: string) => number;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const FALLBACK_CURRENCIES: CurrencyDefinition[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "INR", name: "Indian Rupee", symbol: "\u20B9" },
  { code: "EUR", name: "Euro", symbol: "\u20AC" },
];

export default function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState(DEFAULT_CURRENCY);
  const [currencies, setCurrencies] = useState<CurrencyDefinition[]>(FALLBACK_CURRENCIES);
  const [rates, setRates] = useState<FxRates>({ USD: 1 });
  const [rateDate, setRateDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedCurrency = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
    // Restore the user's external browser preference after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (storedCurrency) setCurrencyState(storedCurrency.toUpperCase());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadRates() {
      try {
        const response = await fetch("/api/fx", { cache: "no-store" });
        const data = await response.json();
        if (cancelled) return;
        if (data.rates && typeof data.rates === "object") setRates(data.rates);
        if (Array.isArray(data.currencies) && data.currencies.length > 0) setCurrencies(data.currencies);
        if (typeof data.date === "string") setRateDate(data.date);
      } catch (error) {
        console.error("SEKUR could not load FX rates:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRates();
    return () => { cancelled = true; };
  }, []);

  const setCurrency = useCallback((nextCurrency: string) => {
    const normalized = nextCurrency.toUpperCase();
    setCurrencyState(normalized);
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, normalized);
  }, []);

  const convert = useCallback(
    (amount: number, sourceCurrency = DEFAULT_CURRENCY) => convertCurrency(amount, sourceCurrency, currency, rates),
    [currency, rates]
  );

  const value = useMemo<CurrencyContextValue>(() => ({
    currency, setCurrency, currencies, rates, rateDate, loading, convert,
  }), [currency, setCurrency, currencies, rates, rateDate, loading, convert]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used inside CurrencyProvider.");
  return context;
}
