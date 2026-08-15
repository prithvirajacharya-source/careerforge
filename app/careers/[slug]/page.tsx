import type { ReactNode } from "react";
import Link from "next/link";
import CareerCountrySelector from "@/components/CareerCountrySelector";
import MarketSalary, { SalaryComparison } from "@/components/MarketSalary";
import SalaryRange from "@/components/SalaryRange";
import SiteHeader from "@/components/SiteHeader";
import SaveIntelligenceControl from "@/components/user/SaveIntelligenceControl";
import AlertPreferencesControl from "@/components/user/AlertPreferencesControl";
import { educationSummary } from "@/lib/careerModel";
import type { CareerCountryMarket } from "@/lib/careerCountryModel";
import { getCareerCountryProfiles } from "@/lib/careerCountryProfiles";
import { resolveCareerCountryProfile } from "@/lib/careerMarketProfiles";
import { getCareerProfile } from "@/lib/careerProfiles";
import { getCountries } from "@/lib/countries";

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <div className="text-xs uppercase tracking-[0.15em] text-slate-500">{label}</div>
      <div className="mt-2 text-xl font-bold">{value}</div>
    </div>
  );
}

function ResearchBadge({ status }: { status: "verified" | "estimated" | "needs-research" }) {
  const label = status === "verified" ? "Verified source" : status === "estimated" ? "Estimated" : "Coming soon";
  const className = status === "verified"
    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
    : "border-white/10 bg-white/5 text-slate-400";
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${className}`}>
      {label}
    </span>
  );
}

export default async function CareerPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ country?: string }>;
}) {
  const { slug } = await params;
  const { country: requestedCountry } = await searchParams;
  const career = getCareerProfile(slug);

  if (!career) {
    return (
      <main className="sekur-intelligence min-h-screen bg-[#07101f] text-white">
        <SiteHeader />
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <div className="text-4xl" aria-hidden="true">&#128269;</div>
          <h1 className="mt-6 text-4xl font-black">Career intelligence is being prepared</h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            This career exists in SEKUR, but its full intelligence profile has not been published yet.
          </p>
          <Link href="/careers" className="mt-8 inline-block rounded-xl bg-blue-500 px-6 py-3 font-bold text-slate-950">
            Back to Career Explorer
          </Link>
        </section>
      </main>
    );
  }

  const marketProfiles = getCareerCountryProfiles(slug);
  const countryRows = marketProfiles.length > 0 ? await getCountries() : [];
  const marketFallbacks: Record<string, CareerCountryMarket> = {
    "united-states": { slug: "united-states", name: "United States", code: "US", currency: "USD" },
    sweden: { slug: "sweden", name: "Sweden", code: "SE", currency: "SEK" },
    germany: { slug: "germany", name: "Germany", code: "DE", currency: "EUR" },
  };
  const markets = marketProfiles.map((profile) => {
    const country = countryRows.find((row) => row.slug === profile.countrySlug);
    return country
      ? {
          slug: country.slug as string,
          name: country.name as string,
          code: country.code as string,
          currency: (country.currency as string | null) ?? null,
        }
      : marketFallbacks[profile.countrySlug];
  }).filter(Boolean) as CareerCountryMarket[];
  const defaultCountrySlug = marketProfiles.some((profile) => profile.countrySlug === "united-states")
    ? "united-states"
    : marketProfiles[0]?.countrySlug;
  const selectedCountrySlug = marketProfiles.some((profile) => profile.countrySlug === requestedCountry)
    ? requestedCountry as string
    : defaultCountrySlug;
  const selectedMarketProfile = selectedCountrySlug
    ? await resolveCareerCountryProfile(slug, selectedCountrySlug)
    : null;
  const selectedMarket = markets.find((market) => market.slug === selectedCountrySlug);
  const salary = selectedMarketProfile?.salary ?? career.salary;
  const educationProfile = selectedMarketProfile
    ? selectedMarketProfile.education
    : career.education;
  const education = selectedMarketProfile && !educationProfile
    ? "Country-specific guidance coming soon"
    : educationSummary(educationProfile, career.legacyEducationLabel);
  const salaryValue = selectedMarketProfile ? (
    <MarketSalary salary={selectedMarketProfile.salary} />
  ) : career.salary ? (
    <SalaryRange salary={career.salary} />
  ) : (
    career.legacySalaryLabel ?? "Research required"
  );
  const hiring = selectedMarketProfile
    ? selectedMarketProfile.hiringOutlook.value ?? "Not published"
    : career.hiring;
  return (
    <main className="sekur-intelligence min-h-screen bg-[#07101f] text-white">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 pb-12 pt-12 sm:px-6 sm:pb-14 sm:pt-16">
        <div className="max-w-4xl">
          <div className="max-w-4xl">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">{career.category}</div>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl md:text-7xl">
              {career.title}
              {selectedMarket && (
                <span className="mt-2 block text-emerald-300 md:text-[0.72em]">
                  {"\u00B7"} {selectedMarket.name}
                </span>
              )}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">{career.description}</p>
            <div className="mt-5"><SaveIntelligenceControl itemType={selectedCountrySlug ? "career_market" : "career"} careerSlug={career.slug} countrySlug={selectedCountrySlug} label="Save this opportunity" /></div>
            {selectedMarketProfile && selectedMarket && (
              <CareerCountrySelector
                careerTitle={career.title}
                markets={markets}
                selectedCountrySlug={selectedCountrySlug}
              />
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <Metric label="Typical salary" value={salaryValue} />
        <Metric label="Job outlook" value={hiring} />
        <Metric label="AI risk" value={career.aiRisk} />
        <Metric label="Remote flexibility" value={career.remote} />
      </section>

      {salary && (
        <section className="mx-auto max-w-7xl px-6 pt-12">
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-7">
            <div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">{(salary.period ?? "annual") === "annual" ? "Annual salary" : `${salary.period} wage`}</p>
                <h2 className="mt-2 text-2xl font-black">Compare the market range</h2>
              </div>
            </div>
            {salary.verificationStatus === "needs-research" ? (
              <p className="mt-5 text-slate-400">
                No validated salary range is stored yet. SEKUR will publish values only after geography, source, observation date and methodology are verified.
              </p>
            ) : (
              <SalaryComparison
                salary={salary}
                explainUnavailableHigh={selectedCountrySlug === "germany" && salary.high === null}
              />
            )}
            {selectedMarketProfile && (
              <p className="mt-5 rounded-xl border border-blue-400/10 bg-blue-400/5 px-4 py-3 text-sm leading-6 text-slate-400">
                Changing the global currency changes only how these amounts are displayed. The underlying salary data remains from the {selectedMarket?.name} labour market in {salary.sourceCurrency}.
              </p>
            )}
            <details className="mt-6 border-t border-white/10 pt-5 text-sm"><summary className="cursor-pointer font-bold text-slate-300">Sources &amp; methodology</summary><dl className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4"><div><dt className="text-slate-500">Location covered</dt><dd className="mt-1 font-semibold leading-6">{salary.geography ?? "Unavailable"}</dd></div><div><dt className="text-slate-500">Source</dt><dd className="mt-1 font-semibold leading-6">{salary.sourceUrl && salary.sourceName ? <a href={salary.sourceUrl} target="_blank" rel="noreferrer" className="text-blue-300 hover:text-blue-200">{salary.sourceName}</a> : "Unavailable"}</dd></div><div><dt className="text-slate-500">Data period</dt><dd className="mt-1 font-semibold leading-6">{salary.observationDate ?? "Unavailable"}</dd></div><div><dt className="text-slate-500">Data quality</dt><dd className="mt-2"><ResearchBadge status={salary.verificationStatus} /></dd></div></dl>{salary.methodology && <p className="mt-5 max-w-4xl leading-6 text-slate-500">{salary.methodology}</p>}</details>
          </div>
        </section>
      )}

      {selectedMarketProfile && (
        <section className="mx-auto max-w-7xl px-6 pt-12">
          <details className="rounded-3xl border border-white/10 bg-white/[0.025] p-6"><summary className="cursor-pointer text-xl font-black">More labour-market detail</summary><div className="mt-6 grid gap-4 lg:grid-cols-3">
            {[
              ["Hiring outlook", selectedMarketProfile.hiringOutlook],
              ["Demand", selectedMarketProfile.demand],
              ["Employment risk", selectedMarketProfile.employmentRisk],
            ].map(([label, field]) => {
              const marketField = field as typeof selectedMarketProfile.hiringOutlook;
              return (
                <div key={label as string} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
                  <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">{label as string}</div>
                  <div className={`mt-3 text-lg font-bold ${marketField.value ? "text-white" : "text-slate-300"}`}>
                    {marketField.value ?? "Not published for this market"}
                  </div>
                  {!marketField.value && (
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      SEKUR will show this when credible country-specific evidence is available.
                    </p>
                  )}
                  {marketField.sourceUrl && marketField.sourceName && (
                    <a href={marketField.sourceUrl} target="_blank" rel="noreferrer" className="mt-4 block text-sm font-semibold text-blue-300 hover:text-blue-200">
                      {marketField.sourceName}
                    </a>
                  )}
                  {marketField.observationPeriod && <div className="mt-2 text-xs text-slate-500">{marketField.observationPeriod}</div>}
                </div>
              );
            })}
          </div>
          {selectedMarketProfile.notes.length > 0 && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Important market notes</div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
                {selectedMarketProfile.notes.map((note) => <li key={note}>{note}</li>)}
              </ul>
            </div>
          )}</details>
        </section>
      )}

      {selectedCountrySlug && <section className="mx-auto max-w-7xl px-6 pt-12"><div className="glass-panel rounded-3xl border p-6 sm:flex sm:items-center sm:justify-between sm:gap-8"><div><h2 className="text-2xl font-black">Want a recommendation for your situation?</h2><p className="mt-2 text-slate-400">Use your goals and preferences to compare this opportunity with other markets.</p></div><Link href="/opportunity-report" className="mt-5 inline-block rounded-xl bg-emerald-300 px-5 py-3 font-black text-slate-950 sm:mt-0">Build my Opportunity Report</Link></div><details className="mt-4 rounded-2xl border border-white/10 p-5"><summary className="cursor-pointer font-bold text-slate-300">Get updates when this changes</summary><div className="mt-4"><AlertPreferencesControl careerSlug={career.slug} countrySlug={selectedCountrySlug} /></div></details></section>}

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-3xl font-black">Education and pathways</h2>
              {educationProfile && <ResearchBadge status={educationProfile.verificationStatus} />}
            </div>
            {educationProfile ? (
              <dl className="mt-7 space-y-6">
                <div><dt className="text-sm text-slate-500">Typical education</dt><dd className="mt-1 font-semibold">{educationProfile.typicalEducation ?? "Not currently available"}</dd></div>
                <div><dt className="text-sm text-slate-500">Degree requirement</dt><dd className="mt-1 font-semibold">{educationProfile.degreeRequirement ?? "Not currently available"}</dd></div>
                <div><dt className="text-sm text-slate-500">Common fields</dt><dd className="mt-2 text-slate-300">{educationProfile.commonFields.join(", ") || "Not currently available"}</dd></div>
                <div><dt className="text-sm text-slate-500">Alternative pathways</dt><dd className="mt-2 text-slate-300">{educationProfile.alternativePathways.join(", ") || "Not currently available"}</dd></div>
                <div><dt className="text-sm text-slate-500">Relevant certifications</dt><dd className="mt-2 text-slate-300">{educationProfile.certifications.join(", ") || "Not currently available"}</dd></div>
              </dl>
            ) : <p className="mt-5 text-slate-400">Legacy profile: {education}</p>}
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7">
            <h2 className="text-3xl font-black">Core skills</h2>
            <div className="mt-7 flex flex-wrap gap-3">
              {career.skills.map((skill) => <span key={skill} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">{skill}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-black">Career roadmap</h2>
            <div className="mt-6 space-y-3">{career.roadmap.map((step, index) => (
              <div key={step} className="flex gap-4 rounded-2xl border border-white/10 bg-[#0b1527] p-5"><span className="font-black text-blue-300">{index + 1}</span><span>{step}</span></div>
            ))}</div>
          </div>
          <div>
            <h2 className="text-3xl font-black">Courses and materials</h2>
            <div className="mt-6 space-y-3">{career.courses.map((course) => (
              <div key={course.title} className="rounded-2xl border border-white/10 bg-[#0b1527] p-5"><div className="text-xs uppercase tracking-wide text-slate-500">{course.type}</div><div className="mt-2 font-bold">{course.title}</div></div>
            ))}</div>
          </div>
        </div>
      </section>

      {marketProfiles.length === 0 && (
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-black">Where this career performs best</h2>
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          {career.countries.map((country) => (
            <div key={country.country} className="grid grid-cols-[60px_1fr_1fr_1fr] gap-4 border-b border-white/10 px-5 py-4 last:border-b-0">
              <span className="font-bold text-slate-500">{country.flag}</span><span className="font-semibold">{country.country}</span><span className="text-slate-400">{country.earningPotential}</span><span className="text-emerald-300">{country.demand}</span>
            </div>
          ))}
        </div>
      </section>
      )}
    </main>
  );
}
