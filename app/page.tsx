import Link from "next/link";
import CountryFlag from "@/components/CountryFlag";
import HomeCareerSearch from "@/components/HomeCareerSearch";
import SalaryRange from "@/components/SalaryRange";
import SiteHeader from "@/components/SiteHeader";
import { getCareers } from "@/lib/careers";
import { getCountries } from "@/lib/countries";

const featuredSlugs = ["mechanical-engineer", "cybersecurity-analyst", "software-engineer", "registered-nurse"];

export default async function Home() {
  const [careers, countries] = await Promise.all([getCareers(), getCountries()]);
  const featured = featuredSlugs.map((slug) => careers.find((career) => career.slug === slug)).filter((career) => career !== undefined);
  const categories = [...new Set(careers.map((career) => career.category).filter((category): category is string => Boolean(category)))];
  const popularCountries = countries.slice(0, 6);

  return <main className="sekur-home min-h-screen text-white">
    <SiteHeader />
    <section className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-10 px-5 py-14 sm:px-6 lg:grid-cols-[1.08fr_.92fr]">
      <div>
        <p className="text-xs font-black uppercase tracking-[.22em] text-emerald-300">Verified global career intelligence</p>
        <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[.98] sm:text-6xl lg:text-7xl">Career intelligence<br /><span className="text-emerald-300">for a borderless world.</span></h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Verified salary, hiring, skills and AI-risk intelligence for better career decisions across global labour markets.</p>
        <HomeCareerSearch categories={categories} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-metric rounded-2xl border p-5"><div className="text-3xl font-black text-emerald-300">{careers.length}</div><div className="mt-2 text-sm font-bold">Careers available</div></div>
        <div className="glass-metric rounded-2xl border p-5"><div className="text-3xl font-black text-emerald-300">{countries.length}</div><div className="mt-2 text-sm font-bold">Countries supported</div></div>
        <div className="glass-metric rounded-2xl border p-5"><div className="text-sm font-black uppercase tracking-wider text-emerald-300">Verified</div><div className="mt-4 text-lg font-black">Traceable sources</div></div>
        <div className="glass-metric rounded-2xl border p-5"><div className="text-sm font-black uppercase tracking-wider text-cyan-200">Live</div><div className="mt-4 text-lg font-black">Reviewed updates</div></div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
      <div className="flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-300">Market paths</p><h2 className="mt-2 text-3xl font-black">Popular career paths</h2></div><Link href="/careers" className="text-sm font-bold text-emerald-300">All careers</Link></div>
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{featured.map((career) => <Link href={`/careers/${career.slug}`} key={career.id} className="glass-card glass-hover min-h-56 rounded-2xl border p-5"><div className="flex items-start justify-between gap-3"><p className="text-xs font-black uppercase tracking-wider text-cyan-200">{career.category ?? "Career"}</p><span className="text-xl font-black text-emerald-300">{career.career_score ?? "—"}</span></div><h3 className="mt-5 text-xl font-black">{career.title}</h3><div className="mt-5 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full w-2/3 rounded-full bg-emerald-300" /></div>{career.profile?.salary && <div className="mt-5 text-sm"><span className="text-slate-400">U.S. benchmark</span><div className="mt-1 font-bold"><SalaryRange salary={career.profile.salary} showTypical={false} /></div></div>}</Link>)}</div>
    </section>

    <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[.75fr_1.25fr]">
      <div><p className="text-xs font-black uppercase tracking-[.2em] text-cyan-200">Browse by category</p><div className="mt-5 grid grid-cols-2 gap-3">{categories.slice(0,6).map((category) => <Link key={category} href={`/careers?category=${encodeURIComponent(category)}`} className="glass-subtle rounded-xl border p-4 font-bold">{category}</Link>)}</div></div>
      <div><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-300">Popular countries</p><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{popularCountries.map((country) => <Link key={country.id} href={`/countries/${country.slug}`} className="glass-card glass-hover rounded-2xl border p-4"><div className="flex items-center gap-3"><CountryFlag code={country.code} name={country.name} size="md" /><div><h3 className="font-black">{country.name}</h3><p className="mt-1 text-xs text-slate-400">{country.currency ?? "Currency unavailable"}</p></div></div></Link>)}</div></div>
    </section>
  </main>;
}
