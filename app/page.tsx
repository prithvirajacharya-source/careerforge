import Link from "next/link";
import HomeCareerSearch from "@/components/HomeCareerSearch";
import SiteHeader from "@/components/SiteHeader";
import CareerPathArt from "@/components/brand/CareerPathArt";
import { getCareers } from "@/lib/careers";
import { getCountries } from "@/lib/countries";

export default async function Home() {
  const [careers, countries] = await Promise.all([getCareers(), getCountries()]);
  return <main className="product-shell">
    <div className="home-hero">
      <SiteHeader />
      <section className="product-container home-hero-grid">
        <div>
          <p className="text-sm font-semibold text-blue-700">Career intelligence for consequential decisions</p>
          <h1 className="home-title mt-6">Your Career.<br />Planned. Powered.<br /><span className="text-blue-400">Protected.</span></h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">Decide where to go, understand what you&apos;re worth, identify what you&apos;re missing, and take the next best action—with evidence behind every signal.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#find-opportunity" className="product-button product-button-primary">Find My Best Opportunity</a>
            <Link href="/careers" className="product-button product-button-secondary">Explore Careers</Link>
          </div>
        </div>
        <div className="max-w-lg lg:justify-self-end">
          <CareerPathArt variant="path" className="w-full" />
          <p className="mb-5 mt-6 text-xs font-bold uppercase tracking-[.18em] text-blue-700">Your career trajectory</p>
          <div className="trajectory">
            <div className="trajectory-step"><p className="text-xs font-semibold text-slate-600">UNDERSTAND</p><h2 className="mt-1 text-xl font-bold">Where you stand today</h2><p className="mt-1 text-sm text-slate-600">Profile, skills and current market position</p></div>
            <div className="trajectory-step"><p className="text-xs font-semibold text-slate-600">DISCOVER</p><h2 className="mt-1 text-xl font-bold">Your strongest opportunities</h2><p className="mt-1 text-sm text-slate-600">Roles and markets compared on real evidence</p></div>
            <div className="trajectory-step"><p className="text-xs font-semibold text-blue-700">ACT</p><h2 className="mt-1 text-xl font-bold">The next move that matters</h2><p className="mt-1 text-sm text-slate-600">Skills, jobs and actions tied to your goal</p></div>
          </div>
        </div>
      </section>
    </div>

    <section className="bg-white">
      <div className="product-container journey-row">
        <div className="journey-item"><span className="text-sm font-bold text-blue-600">01</span><h2 className="mt-3 text-lg font-bold">Know where you are</h2><p className="mt-2 text-sm leading-6 text-slate-600">Build your career profile and see which evidence is complete.</p></div>
        <div className="journey-item"><span className="text-sm font-bold text-blue-600">02</span><h2 className="mt-3 text-lg font-bold">Compare where to go</h2><p className="mt-2 text-sm leading-6 text-slate-600">Evaluate careers and countries across salary, demand, safety and relocation.</p></div>
        <div className="journey-item"><span className="text-sm font-bold text-blue-600">03</span><h2 className="mt-3 text-lg font-bold">Take the next action</h2><p className="mt-2 text-sm leading-6 text-slate-600">Connect your gaps to relevant jobs, learning and a practical plan.</p></div>
      </div>
    </section>

    <section id="find-opportunity" className="product-section">
      <div className="product-container grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
        <div><p className="product-eyebrow">Opportunity finder</p><h2 className="mt-4 text-4xl font-bold leading-tight">Where can your career perform best?</h2><p className="mt-5 max-w-xl leading-7 text-slate-600">Choose a career and country to open the full intelligence view. SEKUR brings salary, market demand, skills, jobs, language, relocation and safety into one decision.</p></div>
        <HomeCareerSearch careers={careers.map(c => ({slug:c.slug,name:c.title}))} countries={countries.map(c => ({slug:c.slug,name:c.name}))} />
      </div>
    </section>

    <section className="product-rule bg-white">
      <div className="product-container product-section grid gap-10 md:grid-cols-2">
        <div><p className="product-eyebrow">Evidence first</p><h2 className="mt-4 text-3xl font-bold">Understand why—not just the score.</h2><p className="mt-4 leading-7 text-slate-600">Coverage, confidence and source provenance stay connected to each intelligence result.</p></div>
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {[['Opportunity intelligence','12 dimensions combine your profile with market evidence.'],['Source-first jobs','Open roles link back to the original employer or trusted source.'],['Decision tools','Save, compare and monitor the opportunities that matter.']].map(([t,d])=><div className="py-5" key={t}><h3 className="font-bold">{t}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{d}</p></div>)}
        </div>
      </div>
    </section>
  </main>;
}
