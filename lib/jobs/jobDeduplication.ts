import type { JobPosting } from "./types.ts";

const normalize = (value: string | null) => (value ?? "").toLowerCase().replace(/[^a-z0-9åäö]+/gi, " ").trim();
const richness = (job: JobPosting) => [job.description, job.company, job.locationText, job.publishedAt, job.employmentType, ...job.skills].filter(Boolean).length;

export function deduplicateJobs(jobs: JobPosting[]) {
  const byKey = new Map<string, JobPosting>();
  for (const job of jobs) {
    const urlKey = normalize(job.originalUrl).replace(/^https? /, "");
    const key = urlKey || [normalize(job.title), normalize(job.company), normalize(job.locationText)].join("|");
    const existing = byKey.get(key);
    if (!existing || richness(job) > richness(existing)) byKey.set(key, job);
  }
  return [...byKey.values()];
}
