import SiteHeader from "@/components/SiteHeader";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Country = {
  id: number;
  slug: string;
  name: string;
  code: string;
  currency: string | null;
  language: string | null;
  region: string | null;
};

export default async function CountryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: country, error } = await supabase
    .from("countries")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !country) {
    return (
      <main className="min-h-screen bg-[#07101f] px-6 py-24 text-center text-white">
        <h1 className="text-4xl font-black">Country not found</h1>

        <p className="mt-4 text-slate-400">
          This country profile is not available yet.
        </p>

        <Link
          href="/countries"
          className="mt-8 inline-block rounded-xl bg-blue-500 px-6 py-3 font-bold text-slate-950"
        >
          Back to countries
        </Link>
      </main>
    );
  }

  const typedCountry = country as Country;

  return (
    <main className="min-h-screen bg-[#07101f] text-white">
     <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 pb-14 pt-16">
        <div className="max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
            {typedCountry.region ?? "Global"}
          </p>

          <h1 className="mt-4 text-6xl font-black tracking-tight md:text-7xl">
            {typedCountry.name}
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
            Career, salary, market and relocation intelligence for{" "}
            {typedCountry.name}.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-6 md:grid-cols-4">
        <Metric label="Country code" value={typedCountry.code} />
        <Metric label="Currency" value={typedCountry.currency ?? "—"} />
        <Metric label="Language" value={typedCountry.language ?? "—"} />
        <Metric label="Region" value={typedCountry.region ?? "—"} />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <InfoCard
            title="💰 Salary Intelligence"
            text="Compare salaries by career and experience level."
          />

          <InfoCard
            title="📈 Hiring Trends"
            text="Track job-market momentum and hiring demand."
          />

          <InfoCard
            title="📉 Layoff Trends"
            text="Understand workforce reductions and market risk."
          />

          <InfoCard
            title="🏠 Cost of Living"
            text="Compare housing, transport, food and daily expenses."
          />

          <InfoCard
            title="💸 Taxes"
            text="Understand approximate income-tax impact and take-home pay."
          />

          <InfoCard
            title="🛂 Visa & Residency"
            text="Explore work permits, skilled migration and residency pathways."
          />

          <InfoCard
            title="🏥 Healthcare"
            text="Understand healthcare access and system overview."
          />

          <InfoCard
            title="🛡 Safety"
            text="Review safety and quality-of-life indicators."
          />

          <InfoCard
            title="🏢 Top Employers"
            text="See companies and industries hiring in this market."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-500/10 to-emerald-400/5 p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-300">
            SEKUR Intelligence
          </p>

          <h2 className="mt-4 text-4xl font-black">
            Is {typedCountry.name} right for your career?
          </h2>

          <p className="mt-5 max-w-2xl leading-7 text-slate-400">
            Soon, SEKUR will combine salary, taxes, living costs, hiring demand
            and visa accessibility to calculate a personalized country score.
          </p>

          <button className="mt-7 rounded-xl bg-white px-6 py-3 font-bold text-slate-950">
            Compare this country
          </button>
        </div>
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
        {label}
      </div>

      <div className="mt-2 text-xl font-bold">
        {value}
      </div>
    </div>
  );
}

function InfoCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
      <h2 className="text-xl font-bold">
        {title}
      </h2>

      <p className="mt-3 leading-7 text-slate-400">
        {text}
      </p>
    </div>
  );
}