import SiteHeader from "@/components/SiteHeader";
import { getAllCountryIntelligence } from "@/lib/intelligence/service";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

type CountryRow = {
  slug: string;
  name: string;
  code: string;
};

export default async function IntelligenceAdminPage() {
  const intelligence = await getAllCountryIntelligence();

  const { data: countryRows } = await supabase
    .from("countries")
    .select("slug, name, code")
    .order("name", { ascending: true });

  const countries = ((countryRows ?? []) as CountryRow[]).filter(
    (country) => intelligence[country.slug]
  );

  return (
    <main className="min-h-screen bg-[#07101f] text-white">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
              SEKUR Admin
            </p>

            <h1 className="mt-4 text-5xl font-black tracking-tight">
              Intelligence CMS
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-slate-400">
              Manage country intelligence factors without editing code.
              Changes here will eventually update country pages, comparisons
              and personalized recommendations.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex rounded-xl border border-white/10 bg-white/[0.035] px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            ← Back to Admin
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map((country) => {
            const profile = intelligence[country.slug];

            return (
              <Link
                key={country.slug}
                href={`/admin/intelligence/${country.slug}`}
                className="group rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/[0.05]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      {country.code}
                    </div>

                    <h2 className="mt-2 text-2xl font-black">
                      {country.name}
                    </h2>
                  </div>

                  <div className="text-right">
                    <div className="text-4xl font-black text-blue-300">
                      {profile.result.score}
                    </div>

                    <div className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      Score
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                  <div className="text-sm text-slate-500">
                    {profile.rows.length} factors
                  </div>

                  <div className="text-sm font-semibold text-emerald-300 transition group-hover:translate-x-1">
                    Manage →
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {countries.length === 0 && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.025] px-6 py-16 text-center">
            <h2 className="text-xl font-bold">
              No intelligence profiles found
            </h2>

            <p className="mt-2 text-slate-500">
              Add country intelligence rows in Supabase first.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}