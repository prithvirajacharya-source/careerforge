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
    <div className="mt-7 flex flex-col gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-blue-800">
          Labour market
        </div>
        <div className="mt-2 text-base font-bold text-slate-900">
          Compare {careerTitle} across countries
        </div>
        <div className="mt-1 text-sm text-slate-600">
          Native market currency: {selectedMarket?.currency ?? "Unavailable"}
        </div>
      </div>
      <label className="w-full sm:w-auto">
        <span className="sr-only">Select labour market</span>
        <select
          value={selectedCountrySlug}
          onChange={(event) => selectCountry(event.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-900 outline-none focus:border-blue-600 sm:min-w-56"
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
