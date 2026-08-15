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
      <div className="max-w-4xl">
        <p className="text-xs font-black uppercase tracking-[.22em] text-emerald-300">Career decisions, backed by real data</p>
        <h1 className="mt-5 text-5xl font-black leading-[.98] sm:text-6xl lg:text-7xl">Make smarter<br /><span className="text-emerald-300">career moves.</span></h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Choose a career and a country. SEKUR brings the salary, job outlook, and opportunity signals together.</p>
        <HomeCareerSearch careers={careers.map((career) => ({ slug: career.slug, name: career.title }))} countries={countries.map((country) => ({ slug: country.slug, name: country.name }))} />
      </div>
      <div className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
        {[['Salary', 'Understand the local pay range.'], ['Job outlook', 'See where opportunity is growing.'], ['Career opportunity', 'Compare the signals that matter.']].map(([title, copy]) => <div key={title} className="glass-subtle rounded-2xl border p-5"><h2 className="font-black text-emerald-200">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p></div>)}
      </div>
      <Link href="/careers" className="mt-8 w-fit text-sm font-bold text-slate-300 hover:text-white">Or browse all careers</Link>
    </section>
  </main>;
}
