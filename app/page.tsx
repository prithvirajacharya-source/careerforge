import Link from "next/link";
import HomeCareerSearch from "@/components/HomeCareerSearch";
import SiteHeader from "@/components/SiteHeader";
import { getCareers } from "@/lib/careers";
import { getCountries } from "@/lib/countries";

export default async function Home() {
  const [careers, countries] = await Promise.all([getCareers(), getCountries()]);

  return <main className="sekur-home min-h-screen text-white">
    <SiteHeader />
    <section className="mx-auto flex min-h-[680px] max-w-7xl flex-col justify-center px-5 py-16 sm:px-6">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(380px,520px)] lg:gap-16 xl:gap-24">
        <div className="max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[.22em] text-emerald-300">Career decisions, backed by real data</p>
        <h1 className="mt-5 text-5xl font-black leading-[.98] sm:text-6xl lg:text-7xl">Make smarter<br /><span className="text-emerald-300">career moves.</span></h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Choose a career and a country. SEKUR brings the salary, job outlook, and opportunity signals together.</p>
        <div className="mt-9 grid max-w-2xl gap-5 border-t border-white/10 pt-6 sm:grid-cols-3">
          {[['Salary', 'Local pay ranges'], ['Job outlook', 'Hiring direction'], ['Career opportunity', 'Signals that matter']].map(([title, copy]) => <div key={title}><h2 className="text-sm font-black text-emerald-200">{title}</h2><p className="mt-1 text-sm text-slate-500">{copy}</p></div>)}
        </div>
        <Link href="/careers" className="mt-7 inline-flex items-center text-sm font-bold text-slate-300 underline decoration-white/20 underline-offset-4 transition hover:text-white hover:decoration-white/60">Browse all careers →</Link>
        </div>
        <div className="lg:justify-self-end">
          <HomeCareerSearch careers={careers.map((career) => ({ slug: career.slug, name: career.title }))} countries={countries.map((country) => ({ slug: country.slug, name: country.name }))} />
        </div>
      </div>
    </section>
  </main>;
}
