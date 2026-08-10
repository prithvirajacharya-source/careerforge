import type { ReactNode } from "react";
import Link from "next/link";
import ScoreCard from "@/components/ScoreCard";
import Money from "@/components/Money";
import SalaryRange from "@/components/SalaryRange";
import SiteHeader from "@/components/SiteHeader";
import { educationSummary } from "@/lib/careerModel";
import { getCareerProfile } from "@/lib/careerProfiles";

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <div className="text-xs uppercase tracking-[0.15em] text-slate-500">{label}</div>
      <div className="mt-2 text-xl font-bold">{value}</div>
    </div>
  );
}

function ResearchBadge({ status }: { status: "verified" | "estimated" | "needs-research" }) {
  const label = status === "needs-research" ? "Needs verified research" : status;
  return (
    <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-300">
      {label}
    </span>
  );
}

export default async function CareerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const career = getCareerProfile(slug);

  if (!career) {
    return (
      <main className="min-h-screen bg-[#07101f] text-white">
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

  const education = educationSummary(career.education, career.legacyEducationLabel);
  const salaryValue = career.salary ? (
    <SalaryRange salary={career.salary} />
  ) : (
    career.legacySalaryLabel ?? "Research required"
  );

  return (
    <main className="min-h-screen bg-[#07101f] text-white">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-6 pb-14 pt-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
          <div className="max-w-4xl">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">{career.category}</div>
            <h1 className="mt-4 text-5xl font-black tracking-tight md:text-7xl">{career.title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">{career.description}</p>
          </div>
          <ScoreCard title="SEKUR Career Score" score={career.score} items={[
            { label: "Salary", value: salaryValue },
            { label: "Hiring", value: career.hiring },
            { label: "AI Risk", value: career.aiRisk },
            { label: "Remote Work", value: career.remote },
          ]} />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-6 md:grid-cols-4">
        <Metric label="Salary" value={salaryValue} />
        <Metric label="Hiring" value={career.hiring} />
        <Metric label="Layoff risk" value={career.layoffs} />
        <Metric label="AI risk" value={career.aiRisk} />
        <Metric label="Remote" value={career.remote} />
        <Metric label="Demand" value={career.demand} />
        <Metric label="Work-life" value={career.workLife} />
        <Metric label="Education" value={education} />
      </section>

      {career.salary && (
        <section className="mx-auto max-w-7xl px-6 pt-12">
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">Salary evidence</p>
                <h2 className="mt-2 text-2xl font-black">Low, typical and high annual pay</h2>
              </div>
              <ResearchBadge status={career.salary.verificationStatus} />
            </div>
            {career.salary.verificationStatus === "needs-research" ? (
              <p className="mt-5 text-slate-400">
                No validated salary range is stored yet. SEKUR will publish values only after geography, source, observation date and methodology are verified.
              </p>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <Metric label="Low" value={<Money amount={career.salary.low as number} sourceCurrency={career.salary.sourceCurrency as string} compact />} />
                <Metric label="Typical" value={<Money amount={career.salary.typical as number} sourceCurrency={career.salary.sourceCurrency as string} compact />} />
                <Metric label="High" value={<Money amount={career.salary.high as number} sourceCurrency={career.salary.sourceCurrency as string} compact />} />
              </div>
            )}
            <dl className="mt-6 grid gap-4 text-sm md:grid-cols-2 lg:grid-cols-4">
              <div><dt className="text-slate-500">Geography</dt><dd className="mt-1 font-semibold">{career.salary.geography ?? "Needs research"}</dd></div>
              <div><dt className="text-slate-500">Source</dt><dd className="mt-1 font-semibold">{career.salary.sourceUrl && career.salary.sourceName ? <a href={career.salary.sourceUrl} target="_blank" rel="noreferrer" className="text-blue-300 hover:text-blue-200">{career.salary.sourceName}</a> : "Needs research"}</dd></div>
              <div><dt className="text-slate-500">Observed</dt><dd className="mt-1 font-semibold">{career.salary.observationDate ?? "Needs research"}</dd></div>
              <div><dt className="text-slate-500">Methodology</dt><dd className="mt-1 font-semibold">{career.salary.methodology ?? "Needs research"}</dd></div>
            </dl>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-3xl font-black">Education and pathways</h2>
              {career.education && <ResearchBadge status={career.education.verificationStatus} />}
            </div>
            {career.education ? (
              <dl className="mt-7 space-y-6">
                <div><dt className="text-sm text-slate-500">Typical education</dt><dd className="mt-1 font-semibold">{career.education.typicalEducation ?? "Needs verified research"}</dd></div>
                <div><dt className="text-sm text-slate-500">Degree requirement</dt><dd className="mt-1 font-semibold">{career.education.degreeRequirement ?? "Needs verified research"}</dd></div>
                <div><dt className="text-sm text-slate-500">Common fields</dt><dd className="mt-2 text-slate-300">{career.education.commonFields.join(", ") || "Needs verified research"}</dd></div>
                <div><dt className="text-sm text-slate-500">Alternative pathways</dt><dd className="mt-2 text-slate-300">{career.education.alternativePathways.join(", ") || "Needs verified research"}</dd></div>
                <div><dt className="text-sm text-slate-500">Relevant certifications</dt><dd className="mt-2 text-slate-300">{career.education.certifications.join(", ") || "Needs verified research"}</dd></div>
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
    </main>
  );
}
