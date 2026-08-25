import type { JobPosting } from "@/lib/jobs/types";
import { calculateJobMatch, type JobMatchProfile } from "@/lib/jobs/jobMatching";
import { recommendForMissingSkills } from "@/lib/learning/recommendStudyResources";

const date = (value: string | null) => value ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value)) : null;
export default function JobCard({ job, profile }: { job: JobPosting; profile?: JobMatchProfile | null }) {
  const match = profile ? calculateJobMatch(job, profile) : null;
  const learning = match ? recommendForMissingSkills(match.missingSkills, 2) : [];
  return <article className="rounded-3xl bg-white/[0.035] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-xl font-black text-white">{job.title}</h3><p className="mt-1 font-semibold text-emerald-300">{job.company ?? "Employer not supplied"}</p></div>{job.workplaceType && <span className="rounded-full border border-blue-300/20 bg-blue-300/10 px-3 py-1 text-xs font-bold capitalize text-blue-200">{job.workplaceType}</span>}</div>
    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-400"><span>{job.locationText ?? job.countryName ?? "Location not supplied"}</span>{job.employmentType && <span>{job.employmentType}</span>}{date(job.publishedAt) && <span>Posted {date(job.publishedAt)}</span>}</div>
    {job.description && <p className="mt-4 line-clamp-3 leading-6 text-slate-400">{job.description}</p>}
    {job.skills.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{job.skills.slice(0, 6).map((skill) => <span key={skill} className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">{skill}</span>)}</div>}
    {match?.score !== null && match && <div className="mt-5 rounded-2xl bg-blue-300/[0.055] p-4"><div className="font-bold text-blue-200">{match.score}% profile match</div><div className="mt-2 text-sm text-slate-400">{match.matchedSkills.slice(0, 3).map((skill) => `${skill} ✓`).join(" · ") || "Based on your career and preferences"}</div>{match.missingSkills.length > 0 && <p className="mt-2 text-sm text-slate-300">Add or build experience in {match.missingSkills.slice(0, 4).join(", ")} to strengthen this match.</p>}{learning.length > 0 && <details className="mt-3"><summary className="cursor-pointer text-sm font-semibold text-blue-300">Learning suggestions</summary>{learning.map(({ resource, matchedSkills }) => <a key={resource.id} href={resource.url} target="_blank" rel="noopener noreferrer" className="mt-2 block text-sm text-slate-300 hover:text-emerald-200">Learn {matchedSkills.join(", ")} with {resource.provider} →</a>)}</details>}</div>}
    {!profile && <p className="mt-5 text-sm text-slate-500">Complete your profile to unlock personalized job matching.</p>}
    <div className="mt-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"><span className="text-sm text-slate-500">Source: {job.sourceName}</span><a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="w-full rounded-xl bg-emerald-300 px-5 py-3 text-center font-black text-slate-950 transition hover:bg-emerald-200 sm:w-auto">{job.providerMetadata.directApplication ? "Apply on source →" : "View job on source →"}</a></div>
  </article>;
}
