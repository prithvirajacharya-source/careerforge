import CountryFlag from "@/components/CountryFlag";
import SiteHeader from "@/components/SiteHeader";
import Link from "next/link";
import { getCountries } from "@/lib/countries";

export default async function CountriesPage() {
  const countries = await getCountries();
  const regions = ["Europe", "Americas", "Asia-Pacific"] as const;

  return (
    <main className="sekur-discovery min-h-screen bg-[#07101f] text-white">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-6 py-16">
        <p className="product-eyebrow">Career markets</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-tight md:text-6xl">Where can your career perform best?</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
          Compare markets through the factors that shape a career: opportunity, salary, demand, cost, language, relocation and safety.
        </p>

        {regions.map((region) => {
          const regionCountries = countries.filter((country) => country.region === region);
          return (
            <section key={region} className="mt-12">
              <h2 className="text-2xl font-black">{region}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {regionCountries.map((country) => (
                  <Link key={country.slug} href={`/countries/${country.slug}`} className="glass-hover group rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:-translate-y-1 hover:border-emerald-300/30">
                    <div className="flex items-center gap-4">
                      <CountryFlag code={country.code} name={country.name} size="lg" />
                      <div><h3 className="text-lg font-black">{country.name}</h3><p className="mt-1 text-sm text-slate-500">{country.currency} · {country.language}</p></div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </section>
    </main>
  );
}
