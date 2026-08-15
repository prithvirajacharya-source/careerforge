"use client";

import { useCurrency } from "@/components/CurrencyProvider";

export default function CurrencySelector() {
  const { currency, setCurrency, currencies, loading } = useCurrency();

  return (
    <label className="relative flex min-w-0 items-center">
      <span className="sr-only">Display currency</span>
      <select
        value={currency}
        onChange={(event) => setCurrency(event.target.value)}
        disabled={loading && currencies.length <= 1}
        title="Display currency"
        className="h-9 w-20 min-w-0 rounded-lg border border-white/[0.07] bg-transparent px-2 pr-6 text-xs font-semibold text-slate-400 outline-none transition hover:border-white/15 hover:text-slate-200 focus:border-blue-400/30"
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
