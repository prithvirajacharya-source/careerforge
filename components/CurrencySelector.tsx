"use client";

import { useCurrency } from "@/components/CurrencyProvider";

export default function CurrencySelector() {
  const { currency, setCurrency, currencies, loading } = useCurrency();

  return (
    <label className="relative flex items-center">
      <span className="sr-only">Display currency</span>
      <select
        value={currency}
        onChange={(event) => setCurrency(event.target.value)}
        disabled={loading && currencies.length <= 1}
        title="Display currency"
        className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 pr-8 text-sm font-bold text-slate-200 outline-none transition hover:bg-white/10 focus:border-blue-400/40"
      >
        {currencies.map((item) => (
          <option key={item.code} value={item.code} className="bg-[#0b1527] text-white">
            {item.code} {"\u2014"} {item.name}
          </option>
        ))}
      </select>
    </label>
  );
}
