import CountryFlag from "@/components/CountryFlag";
import Link from "next/link";
import ScoreCard from "@/components/ScoreCard";
import SiteHeader from "@/components/SiteHeader";
import { getCountryIntelligence } from "@/lib/intelligence/service";
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition hover:-translate-y-1 hover:border-blue-400/20">
      <h2 className="text-xl font-bold">
        {title}
      </h2>

      <p className="mt-3 leading-7 text-slate-400">
        {text}
      </p>
    </div>
  );
}

function getFactorLabel(score?: number) {
  if (typeof score !== "number") {
    return "Researching";
  }

  if (score >= 90) return "Excellent";
  if (score >= 80) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 60) return "Moderate";

  return "Needs improvement";
}

function getFactorScore(
  factors: {
    key: string;
    score: number;
  }[],
  key: string
) {
  return factors.find(
    (factor) => factor.key === key
  )?.score;
}

function getFactorValue(
  factors: {
    key: string;
    score: number;
  }[],
  key: string
) {
  return getFactorLabel(
    getFactorScore(factors, key)
  );
}

function getSourceBadge(
  sourceType: string
) {
  switch (sourceType) {
    case "official":
      return "Official";

    case "market":
      return "Market";

    case "community":
      return "Community";

    case "research":
      return "Research";

    default:
      return "Estimated";
  }
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  /*
    1. Load basic country information.
  */
  const { data: country, error } =
    await supabase
      .from("countries")
      .select("*")
      .eq("slug", slug)
      .single();

  if (error || !country) {
    return (
      <main className="min-h-screen bg-[#07101f] text-white">
        <SiteHeader />

        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-400/10 text-3xl">
            🌍
          </div>

          <h1 className="mt-6 text-4xl font-black">
            Country not found
          </h1>

          <p className="mt-4 text-slate-400">
            This country profile is not available yet.
          </p>

          <Link
            href="/countries"
            className="mt-8 inline-block rounded-xl bg-blue-500 px-6 py-3 font-bold text-slate-950"
          >
            Back to Country Explorer
          </Link>
        </section>
      </main>
    );
  }

  const typedCountry =
    country as Country;

  /*
    2. Load intelligence directly from Supabase.

    No Sweden.ts.
    No Germany.ts.
    No country-specific logic.
  */
  const intelligenceData =
    await getCountryIntelligence(
      typedCountry.slug
    );

  const intelligence =
    intelligenceData?.result ?? null;

  const rows =
    intelligenceData?.rows ?? [];

  const factors =
    intelligence?.factors ?? [];

  /*
    Research progress is calculated from
    non-estimated source rows.

    Right now our prototype rows are estimated,
    so this will correctly begin near 0%.
  */
  const verifiedRows =
    rows.filter(
      (row) =>
        row.source_type !== "estimated" &&
        Boolean(row.source_name)
    );

  const researchProgress =
    rows.length > 0
      ? Math.round(
          (verifiedRows.length /
            rows.length) *
            100
        )
      : 0;

  const salary =
    getFactorValue(
      factors,
      "salary"
    );

  const hiring =
    getFactorValue(
      factors,
      "hiring"
    );

  const safety =
    getFactorValue(
      factors,
      "safety"
    );

  const healthcare =
    getFactorValue(
      factors,
      "healthcare"
    );

  const visa =
    getFactorValue(
      factors,
      "visa"
    );

  const workLife =
    getFactorValue(
      factors,
      "work_life"
    );

  const costOfLiving =
    getFactorValue(
      factors,
      "cost_of_living"
    );

  return (
    <main className="min-h-screen bg-[#07101f] text-white">
      <SiteHeader />

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 pb-14 pt-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
          <div className="max-w-4xl">
            <div className="flex items-center gap-6">
              <CountryFlag
                code={typedCountry.code}
                name={typedCountry.name}
                size="xl"
              />

              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
                  {typedCountry.region ??
                    "Global"}
                </p>

                <h1 className="mt-3 text-6xl font-black tracking-tight md:text-7xl">
                  {typedCountry.name}
                </h1>
              </div>
            </div>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              Career, salary, market and
              decision intelligence for{" "}
              {typedCountry.name}.
            </p>

            {intelligence && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/5 px-4 py-2 text-xs font-semibold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                Powered by SEKUR Intelligence
              </div>
            )}
          </div>

          {intelligence ? (
            <ScoreCard
              title="SEKUR Intelligence Score"
              score={
                intelligence.score
              }
              confidence={
                intelligence.confidence
              }
              items={[
                {
                  label: "Salary",
                  value: salary,
                },
                {
                  label: "Hiring",
                  value: hiring,
                },
                {
                  label: "Safety",
                  value: safety,
                },
                {
                  label: "Visa",
                  value: visa,
                },
              ]}
            />
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                SEKUR Intelligence
              </div>

              <h2 className="mt-4 text-2xl font-black">
                Research in progress
              </h2>

              <p className="mt-3 leading-7 text-slate-400">
                Intelligence factors for{" "}
                {typedCountry.name} have
                not been published yet.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* QUICK FACTS */}
      <section className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-6 md:grid-cols-4">
        <Metric
          label="Country code"
          value={typedCountry.code}
        />

        <Metric
          label="Currency"
          value={
            typedCountry.currency ??
            "—"
          }
        />

        <Metric
          label="Language"
          value={
            typedCountry.language ??
            "—"
          }
        />

        <Metric
          label="Region"
          value={
            typedCountry.region ??
            "—"
          }
        />
      </section>

      {/* EXPLAINABLE INTELLIGENCE */}
      {intelligence && (
        <section className="mx-auto max-w-7xl px-6 pt-20">
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
                  SEKUR Recommendation
                </p>

                <h2 className="mt-3 text-3xl font-black">
                  Why SEKUR Recommends{" "}
                  {typedCountry.name}
                </h2>

                <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                  SEKUR combines weighted
                  intelligence factors to
                  explain the strengths and
                  trade-offs behind this
                  country&apos;s score.
                </p>
              </div>

              {/* RESEARCH PROGRESS */}
              <div className="min-w-[240px] rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
                <div className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-300">
                  Research Progress
                </div>

                <div className="mt-3 text-3xl font-black">
                  {researchProgress}%
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
                    style={{
                      width: `${researchProgress}%`,
                    }}
                  />
                </div>

                <div className="mt-4 text-sm text-slate-400">
                  Verified sources
                </div>

                <div className="font-bold">
                  {verifiedRows.length} /{" "}
                  {rows.length}
                </div>
              </div>
            </div>

            {/* FACTOR CARDS */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {factors.map(
                (factor) => {
                  const row =
                    rows.find(
                      (item) =>
                        item.factor_key ===
                        factor.key
                    );

                  return (
                    <div
                      key={factor.key}
                      className="rounded-2xl border border-white/10 bg-[#0b1527] p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-bold">
                            {factor.label}
                          </div>

                          <div className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
                            {getSourceBadge(
                              factor.sourceType
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-black text-blue-300">
                            {factor.score}
                          </div>

                          <div className="mt-1 text-xs font-semibold text-slate-500">
                            {getFactorLabel(
                              factor.score
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
                            style={{
                              width: `${factor.score}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span>
                          Weight
                        </span>

                        <span className="font-semibold text-slate-300">
                          {factor.weight}
                        </span>
                      </div>

                      {row?.source_name && (
                        <div className="mt-4 rounded-xl border border-emerald-400/10 bg-emerald-400/5 p-3">
                          <div className="text-xs text-slate-500">
                            Source
                          </div>

                          <div className="mt-1 text-sm font-semibold text-emerald-300">
                            {row.source_name}
                          </div>
                        </div>
                      )}

                      {factor.explanation && (
                        <p className="mt-4 text-sm leading-6 text-slate-500">
                          {
                            factor.explanation
                          }
                        </p>
                      )}
                    </div>
                  );
                }
              )}
            </div>

            {researchProgress < 100 && (
              <div className="mt-6 rounded-xl border border-amber-400/10 bg-amber-400/5 px-4 py-3 text-sm text-amber-200/70">
                SEKUR is still replacing
                prototype estimates with
                verified sources.
              </div>
            )}
          </div>
        </section>
      )}

      {/* INTELLIGENCE OVERVIEW */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
            Country Intelligence
          </p>

          <h2 className="mt-3 text-4xl font-black">
            Understand the market
            before you decide
          </h2>

          <p className="mt-4 max-w-2xl text-slate-400">
            SEKUR brings together
            career opportunity,
            affordability, lifestyle and
            market intelligence in one
            place.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <InfoCard
            title="💰 Salary Intelligence"
            text={`Current intelligence rating: ${salary}.`}
          />

          <InfoCard
            title="📈 Hiring Trends"
            text={`Current intelligence rating: ${hiring}.`}
          />

          <InfoCard
            title="📉 Layoff Trends"
            text="Workforce risk and employer-demand intelligence will be added as verified market data becomes available."
          />

          <InfoCard
            title="🏠 Cost of Living"
            text={`Current affordability rating: ${costOfLiving}.`}
          />

          <InfoCard
            title="⚖ Work-Life Balance"
            text={`Current intelligence rating: ${workLife}.`}
          />

          <InfoCard
            title="🛂 Visa & Residency"
            text={`Current intelligence rating: ${visa}.`}
          />

          <InfoCard
            title="🏥 Healthcare"
            text={`Current intelligence rating: ${healthcare}.`}
          />

          <InfoCard
            title="🛡 Safety"
            text={`Current intelligence rating: ${safety}.`}
          />

          <InfoCard
            title="🏢 Top Employers"
            text={`Discover companies and industries relevant to professionals in ${typedCountry.name}.`}
          />
        </div>
      </section>

      {/* PERSONAL INTELLIGENCE */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-500/10 to-emerald-400/5 p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">
            Personal Intelligence
          </p>

          <h2 className="mt-4 text-4xl font-black">
            Is {typedCountry.name}{" "}
            right for you?
          </h2>

          <p className="mt-5 max-w-2xl leading-7 text-slate-400">
            The global SEKUR Score is
            only the beginning. Personal
            scoring will adjust the
            recommendation using your
            profession, priorities,
            family situation and goals.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs text-slate-500">
                Intelligence Score
              </div>

              <div className="mt-1 text-2xl font-black">
                {intelligence
                  ? intelligence.score
                  : "—"}
              </div>

              <div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Score
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs text-slate-500">
                Your Score
              </div>

              <div className="mt-1 text-lg font-black text-blue-300">
                Coming soon
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs text-slate-500">
                Career Match
              </div>

              <div className="mt-1 text-lg font-black text-emerald-300">
                Coming soon
              </div>
            </div>
          </div>

          <Link
            href={`/compare?left=${typedCountry.slug}&right=sweden`}
            className="mt-7 inline-block rounded-xl bg-white px-6 py-3 font-bold text-slate-950 transition hover:scale-[1.02]"
          >
            Compare this country
          </Link>
        </div>
      </section>
    </main>
  );
}