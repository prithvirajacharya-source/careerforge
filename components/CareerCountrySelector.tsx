"use client";

import { usePathname, useRouter } from "next/navigation";
import type { CareerCountryMarket } from "@/lib/careerCountryModel";

export default function CareerCountrySelector({
  careerTitle,
  markets,
  selectedCountrySlug,
}: {
  careerTitle: string;
  markets: CareerCountryMarket[];
  selectedCountrySlug: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const selectedMarket =
    markets.find((market) => market.slug === selectedCountrySlug) ?? markets[0];

  function selectCountry(countrySlug: string) {
    const params = new URLSearchParams(window.location.search);
    params.set("country", countrySlug);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-blue-400/20 bg-blue-400/[0.055] p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
          Selected labour market
        </div>
        <div className="mt-2 text-xl font-black">
          {careerTitle} {"\u00B7"} {selectedMarket?.name ?? "Unavailable"}
        </div>
        <div className="mt-1 text-sm text-slate-400">
          Native market currency: {selectedMarket?.currency ?? "Unavailable"}
        </div>
      </div>
      <label>
        <span className="sr-only">Select labour market</span>
        <select
          value={selectedCountrySlug}
          onChange={(event) => selectCountry(event.target.value)}
          className="min-w-56 rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3 font-semibold text-white outline-none focus:border-blue-400/50"
        >
          {markets.map((market) => (
            <option key={market.slug} value={market.slug}>
              {market.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
