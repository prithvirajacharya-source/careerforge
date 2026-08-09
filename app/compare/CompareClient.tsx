"use client";

import CountryFlag from "@/components/CountryFlag";
import ComparisonMetric from "@/components/ComparisonMetric";
import {
  countryIntelligenceProfiles,
  getAvailableCountryProfiles,
} from "@/lib/intelligence/countries";
import { useRouter } from "next/navigation";

type CompareClientProps = {
  initialLeft: string;
  initialRight: string;
};

function getFactor(
  slug: string,
  key: string
) {
  const profile =
    countryIntelligenceProfiles[slug];

  if (!profile) {
    return undefined;
  }

  return profile.intelligence.factors.find(
    (factor) => factor.key === key
  );
}

function factorDescription(
  score: number
) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 60) return "Moderate";

  return "Weak";
}

export default function CompareClient({
  initialLeft,
  initialRight,
}: CompareClientProps) {
  const router = useRouter();

  const availableCountries =
    getAvailableCountryProfiles();

  const leftSlug =
    countryIntelligenceProfiles[initialLeft]
      ? initialLeft
      : "sweden";

  const rightSlug =
    countryIntelligenceProfiles[initialRight]
      ? initialRight
      : "germany";

  const left =
    countryIntelligenceProfiles[leftSlug];

  const right =
    countryIntelligenceProfiles[rightSlug];

  function changeComparison(
    newLeft: string,
    newRight: string
  ) {
    router.push(
      `/compare?left=${newLeft}&right=${newRight}`
    );
  }

  const metrics = [
    {
      key: "salary",
      label: "Salary",
    },
    {
      key: "hiring",
      label: "Hiring",
    },
    {
      key: "safety",
      label: "Safety",
    },
    {
      key: "healthcare",
      label: "Healthcare",
    },
    {
      key: "visa",
      label: "Visa & Residency",
    },
    {
      key: "work_life",
      label: "Work-Life Balance",
    },
    {
      key: "cost_of_living",
      label: "Cost of Living",
    },
  ];

  const leftScore =
    left.intelligence.score;

  const rightScore =
    right.intelligence.score;

  const winner =
    leftScore === rightScore
      ? null
      : leftScore > rightScore
      ? left
      : right;

  const scoreDifference =
    Math.abs(leftScore - rightScore);

  const leftAdvantages: string[] = [];
  const rightAdvantages: string[] = [];

  for (const metric of metrics) {
    const leftFactor = getFactor(
      leftSlug,
      metric.key
    );

    const rightFactor = getFactor(
      rightSlug,
      metric.key
    );

    if (!leftFactor || !rightFactor) {
      continue;
    }

    const difference =
      leftFactor.score -
      rightFactor.score;

    if (difference >= 3) {
      leftAdvantages.push(metric.label);
    }

    if (difference <= -3) {
      rightAdvantages.push(metric.label);
    }
  }

  return (
    <>
      {/* COUNTRY SELECTORS */}
      <section className="mt-12 rounded-3xl border border-white/10 bg-white/[0.025] p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
              Country A
            </label>

            <select
              value={leftSlug}
              onChange={(event) =>
                changeComparison(
                  event.target.value,
                  rightSlug
                )
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1527] px-4 py-4 font-bold text-white outline-none"
            >
              {availableCountries.map(
                (country) => (
                  <option
                    key={country.slug}
                    value={country.slug}
                  >
                    {country.name}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="hidden pb-4 text-xl font-black text-slate-600 md:block">
            VS
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
              Country B
            </label>

            <select
              value={rightSlug}
              onChange={(event) =>
                changeComparison(
                  leftSlug,
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1527] px-4 py-4 font-bold text-white outline-none"
            >
              {availableCountries.map(
                (country) => (
                  <option
                    key={country.slug}
                    value={country.slug}
                  >
                    {country.name}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </section>

      {/* COUNTRY HERO CARDS */}
      <section className="relative mt-6 grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-500/10 to-transparent p-7">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <CountryFlag
                code={left.code}
                name={left.name}
                size="xl"
              />

              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
                  Country A
                </div>

                <h2 className="mt-2 text-3xl font-black">
                  {left.name}
                </h2>
              </div>
            </div>

            <div className="text-right">
              <div className="text-5xl font-black">
                {leftScore}
              </div>

              <div className="mt-1 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                Score
              </div>

              <div className="mt-2 text-sm font-semibold text-emerald-300">
                {left.intelligence.label}
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#07101f] text-sm font-black text-white shadow-xl md:flex">
          VS
        </div>

        <div className="rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/10 to-transparent p-7">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <CountryFlag
                code={right.code}
                name={right.name}
                size="xl"
              />

              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                  Country B
                </div>

                <h2 className="mt-2 text-3xl font-black">
                  {right.name}
                </h2>
              </div>
            </div>

            <div className="text-right">
              <div className="text-5xl font-black">
                {rightScore}
              </div>

              <div className="mt-1 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                Score
              </div>

              <div className="mt-2 text-sm font-semibold text-emerald-300">
                {right.intelligence.label}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section className="mt-8 space-y-4">
        {metrics.map((metric) => {
          const leftFactor = getFactor(
            leftSlug,
            metric.key
          );

          const rightFactor = getFactor(
            rightSlug,
            metric.key
          );

          if (!leftFactor || !rightFactor) {
            return null;
          }

          return (
            <ComparisonMetric
              key={metric.key}
              label={metric.label}
              leftValue={`${factorDescription(
                leftFactor.score
              )} · ${leftFactor.score}`}
              rightValue={`${factorDescription(
                rightFactor.score
              )} · ${rightFactor.score}`}
              leftScore={leftFactor.score}
              rightScore={
                rightFactor.score
              }
            />
          );
        })}
      </section>

      {/* VERDICT */}
      <section className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
        <div className="border-b border-white/10 p-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
            SEKUR Verdict
          </p>

          <h2 className="mt-3 text-4xl font-black">
            {winner
              ? `${winner.name} leads this comparison.`
              : "This comparison is tied."}
          </h2>

          <p className="mt-4 max-w-3xl leading-7 text-slate-400">
            {winner
              ? `${winner.name} currently leads by ${scoreDifference} SEKUR Score points. The final choice still depends on what matters most to you.`
              : "Both countries currently receive the same overall SEKUR Score."}
          </p>
        </div>

        <div className="grid md:grid-cols-2">
          <div className="border-b border-white/10 p-7 md:border-b-0 md:border-r">
            <div className="flex items-center gap-3">
              <CountryFlag
                code={left.code}
                name={left.name}
                size="md"
              />

              <h3 className="text-xl font-black">
                {left.name} advantages
              </h3>
            </div>

            <div className="mt-5 space-y-3 text-slate-300">
              {leftAdvantages.length > 0 ? (
                leftAdvantages.map(
                  (advantage) => (
                    <div key={advantage}>
                      <span className="mr-2 text-emerald-300">
                        ✓
                      </span>

                      {advantage}
                    </div>
                  )
                )
              ) : (
                <div className="text-slate-500">
                  No significant advantage
                  detected yet.
                </div>
              )}
            </div>
          </div>

          <div className="p-7">
            <div className="flex items-center gap-3">
              <CountryFlag
                code={right.code}
                name={right.name}
                size="md"
              />

              <h3 className="text-xl font-black">
                {right.name} advantages
              </h3>
            </div>

            <div className="mt-5 space-y-3 text-slate-300">
              {rightAdvantages.length > 0 ? (
                rightAdvantages.map(
                  (advantage) => (
                    <div key={advantage}>
                      <span className="mr-2 text-emerald-300">
                        ✓
                      </span>

                      {advantage}
                    </div>
                  )
                )
              ) : (
                <div className="text-slate-500">
                  No significant advantage
                  detected yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 bg-blue-400/[0.03] p-8">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
            The real question
          </div>

          <h3 className="mt-3 text-2xl font-black">
            Which country is better for you?
          </h3>

          <p className="mt-3 max-w-2xl leading-7 text-slate-400">
            Overall scores cannot know whether you
            prioritize salary, family, permanent
            residency, climate, safety or work-life
            balance. Personalized SEKUR scoring will
            answer that next.
          </p>

          <button className="mt-6 rounded-xl bg-white px-6 py-3 font-bold text-slate-950">
            Personal assessment coming soon
          </button>
        </div>
      </section>

      <div className="mt-6 text-center text-xs text-slate-600">
        Prototype intelligence data · Verified
        source integration in progress
      </div>
    </>
  );
}