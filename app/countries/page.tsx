import CountryFlag from "@/components/CountryFlag";
import SiteHeader from "@/components/SiteHeader";
import Link from "next/link";
import { getCountries } from "@/lib/countries";

type Country = {
  id: number;
  slug: string;
  name: string;
  code: string;
  currency: string | null;
  language: string | null;
  region: string | null;
};

export default async function CountriesPage() {
  const countries: Country[] = await getCountries();

  return (
    <main className="sekur-discovery min-h-screen bg-[#07101f] text-white">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
          Country Explorer
        </p>

        <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-tight md:text-6xl">
          Find the best country for
          <span className="block bg-gradient-to-r from-blue-400 to-emerald-300 bg-clip-text text-transparent">
            your career.
          </span>
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
          Explore global job markets, currencies, languages and regional
          opportunities.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map((country) => (
            <Link
              key={country.id}
              href={`/countries/${country.slug}`}
              className="glass-hover group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/[0.05] hover:shadow-2xl hover:shadow-emerald-950/20"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-400/[0.04] via-transparent to-blue-400/[0.03] opacity-0 transition duration-300 group-hover:opacity-100" />

              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <CountryFlag
                      code={country.code}
                      name={country.name}
                      size="lg"
                    />

                    <div>
                      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                        {country.region ?? "Global"}
                      </div>

                      <h2 className="mt-1 text-2xl font-black">
                        {country.name}
                      </h2>
                    </div>
                  </div>

                  <div className="rounded-xl bg-emerald-400/10 px-3 py-2 text-sm font-bold text-emerald-300">
                    {country.code}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-black/20 p-4">
                    <div className="text-xs text-slate-500">
                      Currency
                    </div>

                    <div className="mt-1 font-bold">
                      {country.currency ?? "—"}
                    </div>
                  </div>

                  <div className="rounded-xl bg-black/20 p-4">
                    <div className="text-xs text-slate-500">
                      Language
                    </div>

                    <div className="mt-1 font-bold">
                      {country.language ?? "—"}
                    </div>
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>

        {countries.length === 0 && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.025] px-6 py-16 text-center">
            <div className="text-3xl">
              🌍
            </div>

            <h2 className="mt-4 text-xl font-bold">
              No countries found
            </h2>

            <p className="mt-2 text-slate-500">
              Check the Supabase connection or country data.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
