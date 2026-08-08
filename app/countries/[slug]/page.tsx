import CountryFlag from "@/components/CountryFlag";
import Link from "next/link";
import ScoreCard from "@/components/ScoreCard";
import SiteHeader from "@/components/SiteHeader";
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

function getCountryScore(slug: string) {
  const scores: Record<string, number> = {
    sweden: 91,
    germany: 89,
    canada: 88,
    "united-states": 86,
    australia: 88,
    switzerland: 94,
    norway: 92,
    netherlands: 90,
    singapore: 89,
    india: 78,
  };

  return scores[slug] ?? 80;
}

function getCountryIntelligence(slug: string) {
  const data: Record<
    string,
    {
      salary: string;
      hiring: string;
      safety: string;
      healthcare: string;
      visa: string;
      costOfLiving: string;
    }
  > = {
    sweden: {
      salary: "High",
      hiring: "Strong",
      safety: "Very High",
      healthcare: "Excellent",
      visa: "Good",
      costOfLiving: "High",
    },

    germany: {
      salary: "High",
      hiring: "Strong",
      safety: "High",
      healthcare: "Excellent",
      visa: "Good",
      costOfLiving: "Medium-High",
    },

    canada: {
      salary: "High",
      hiring: "Strong",
      safety: "High",
      healthcare: "Very Good",
      visa: "Very Good",
      costOfLiving: "High",
    },

    "united-states": {
      salary: "Very High",
      hiring: "Strong",
      safety: "Medium",
      healthcare: "Private",
      visa: "Difficult",
      costOfLiving: "Varies",
    },

    australia: {
      salary: "High",
      hiring: "Strong",
      safety: "Very High",
      healthcare: "Excellent",
      visa: "Very Good",
      costOfLiving: "High",
    },

    switzerland: {
      salary: "Very High",
      hiring: "Strong",
      safety: "Very High",
      healthcare: "Excellent",
      visa: "Medium",
      costOfLiving: "Very High",
    },

    norway: {
      salary: "Very High",
      hiring: "Strong",
      safety: "Very High",
      healthcare: "Excellent",
      visa: "Good",
      costOfLiving: "Very High",
    },

    netherlands: {
      salary: "High",
      hiring: "Strong",
      safety: "Very High",
      healthcare: "Excellent",
      visa: "Good",
      costOfLiving: "High",
    },

    singapore: {
      salary: "High",
      hiring: "Strong",
      safety: "Very High",
      healthcare: "Excellent",
      visa: "Medium",
      costOfLiving: "High",
    },

    india: {
      salary: "Growing",
      hiring: "Very Strong",
      safety: "Varies",
      healthcare: "Varies",
      visa: "Easy",
      costOfLiving: "Low",
    },
  };

  return (
    data[slug] ?? {
      salary: "Researching",
      hiring: "Researching",
      safety: "Researching",
      healthcare: "Researching",
      visa: "Researching",
      costOfLiving: "Researching",
    }
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

  const typedCountry = country as Country;
  const score = getCountryScore(typedCountry.slug);
  const intelligence = getCountryIntelligence(typedCountry.slug);

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
      {typedCountry.region ?? "Global"}
    </p>

    <h1 className="mt-4 text-6xl font-black tracking-tight md:text-7xl">
      {typedCountry.name}
    </h1>
  </div>
</div>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              Career, salary, market and relocation intelligence for{" "}
              {typedCountry.name}.
            </p>
          </div>

          <ScoreCard
            title="SEKUR Country Score"
            score={score}
            items={[
              {
                label: "Salary",
                value: intelligence.salary,
              },
              {
                label: "Hiring",
                value: intelligence.hiring,
              },
              {
                label: "Safety",
                value: intelligence.safety,
              },
              {
                label: "Visa",
                value: intelligence.visa,
              },
            ]}
          />
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
          value={typedCountry.currency ?? "—"}
        />

        <Metric
          label="Language"
          value={typedCountry.language ?? "—"}
        />

        <Metric
          label="Region"
          value={typedCountry.region ?? "—"}
        />
      </section>

      {/* INTELLIGENCE OVERVIEW */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
            Country Intelligence
          </p>

          <h2 className="mt-3 text-4xl font-black">
            Understand the market before you move
          </h2>

          <p className="mt-4 max-w-2xl text-slate-400">
            SEKUR brings together career opportunity, salary, relocation and
            quality-of-life information in one place.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <InfoCard
            title="💰 Salary Intelligence"
            text={`Salary outlook in ${typedCountry.name}: ${intelligence.salary}. Compare career-specific earning potential across experience levels.`}
          />

          <InfoCard
            title="📈 Hiring Trends"
            text={`Current hiring outlook: ${intelligence.hiring}. SEKUR will track job-market momentum across industries and professions.`}
          />

          <InfoCard
            title="📉 Layoff Trends"
            text="Understand workforce reductions, industry risk and changing employer demand."
          />

          <InfoCard
            title="🏠 Cost of Living"
            text={`Current broad cost-of-living level: ${intelligence.costOfLiving}. Future versions will compare housing, food, transport and savings potential.`}
          />

          <InfoCard
            title="💸 Taxes"
            text="Compare income taxes and estimated take-home pay for different salary levels."
          />

          <InfoCard
            title="🛂 Visa & Residency"
            text={`Current broad visa assessment: ${intelligence.visa}. Future data will include work permits, skilled migration and permanent residency pathways.`}
          />

          <InfoCard
            title="🏥 Healthcare"
            text={`Healthcare overview: ${intelligence.healthcare}. Detailed country-specific system information will be added from verified sources.`}
          />

          <InfoCard
            title="🛡 Safety"
            text={`Safety overview: ${intelligence.safety}. SEKUR will later include verified quality-of-life and safety indicators.`}
          />

          <InfoCard
            title="🏢 Top Employers"
            text={`Discover major companies and industries hiring professionals in ${typedCountry.name}.`}
          />
        </div>
      </section>

      {/* FUTURE COUNTRY DECISION ENGINE */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-500/10 to-emerald-400/5 p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">
            SEKUR Intelligence
          </p>

          <h2 className="mt-4 text-4xl font-black">
            Is {typedCountry.name} right for your career?
          </h2>

          <p className="mt-5 max-w-2xl leading-7 text-slate-400">
            SEKUR will combine salary, taxes, cost of living, hiring demand,
            safety and visa accessibility to calculate a personalized country
            score based on your career and goals.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs text-slate-500">
                Country Score
              </div>

              <div className="mt-1 text-2xl font-black">
                {score}
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

          <button className="mt-7 rounded-xl bg-white px-6 py-3 font-bold text-slate-950 transition hover:scale-[1.02]">
            Compare this country
          </button>
        </div>
      </section>
    </main>
  );
}