import { NextResponse } from "next/server";
import { parseJobSearchParams, searchJobs } from "@/lib/jobs/searchJobs";

export async function GET(request: Request) {
  try { const input = parseJobSearchParams(new URL(request.url).searchParams); return NextResponse.json(await searchJobs(input), { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300" } }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid job search" }, { status: 400 }); }
}
