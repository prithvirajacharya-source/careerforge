import IntelligenceEditor from "@/components/admin/IntelligenceEditor";
import CountryFlag from "@/components/CountryFlag";
import SiteHeader from "@/components/SiteHeader";
import { getCountryIntelligence } from "@/lib/intelligence/service";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Country = {
  slug: string;
  name: string;
  code: string;
};

export default async function IntelligenceCountryAdminPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  const { data: country } =
    await supabase
      .from("countries")
      .select(
        "slug, name, code"
      )
      .eq("slug", slug)
      .single();

  if (!country) {
    return (
      <main className="min-h-screen bg-[#07101f] text-white">
        <SiteHeader />

        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h1 className="text-4xl font-black">
            Country not found
          </h1>

          <Link
            href="/admin/intelligence"
            className="mt-8 inline-block rounded-xl bg-white px-6 py-3 font-bold text-slate-950"
          >
            Back to Intelligence CMS
          </Link>
        </section>
      </main>
    );
  }

  const typedCountry =
    country as Country;

  const intelligence =
    await getCountryIntelligence(
      slug
    );

  if (!intelligence) {
    return (
      <main className="min-h-screen bg-[#07101f] text-white">
        <SiteHeader />

        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h1 className="text-4xl font-black">
            No intelligence data
          </h1>

          <p className="mt-4 text-slate-400">
            This country does not have
            intelligence factors yet.
          </p>

          <Link
            href="/admin/intelligence"
            className="mt-8 inline-block rounded-xl bg-white px-6 py-3 font-bold text-slate-950"
          >
            Back to Intelligence CMS
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07101f] text-white">
      <SiteHeader />

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
              SEKUR Intelligence Console
            </p>

            <div className="mt-4 flex items-center gap-4">
              <CountryFlag
                code={
                  typedCountry.code
                }
                name={
                  typedCountry.name
                }
                size="lg"
              />

              <h1 className="text-4xl font-black md:text-5xl">
                Edit{" "}
                {typedCountry.name}
              </h1>
            </div>

            <p className="mt-4 max-w-2xl leading-7 text-slate-400">
              Update intelligence
              factors, source
              information and research
              explanations.
            </p>
          </div>

          <Link
            href="/admin/intelligence"
            className="inline-flex rounded-xl border border-white/10 bg-white/[0.035] px-5 py-3 text-sm font-bold text-slate-300 transition hover:text-white"
          >
            ← All Countries
          </Link>
        </div>

        <div className="mt-10">
          <IntelligenceEditor
            countryName={
              typedCountry.name
            }
            countryCode={
              typedCountry.code
            }
            rows={
              intelligence.rows
            }
          />
        </div>
      </section>
    </main>
  );
}