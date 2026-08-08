const careers = [
  {
    title: "Software Engineer",
    category: "Technology",
    salary: "$70k – $180k+",
    trend: "Strong hiring",
    score: 92,
  },
  {
    title: "Mechanical Engineer",
    category: "Engineering",
    salary: "$55k – $130k+",
    trend: "Stable",
    score: 82,
  },
  {
    title: "Cybersecurity Analyst",
    category: "Technology",
    salary: "$70k – $160k+",
    trend: "Very strong",
    score: 94,
  },
  {
    title: "Registered Nurse",
    category: "Healthcare",
    salary: "$55k – $130k+",
    trend: "Very strong",
    score: 91,
  },
];

const countries = [
  { flag: "🇸🇪", name: "Sweden", note: "Work-life balance" },
  { flag: "🇩🇪", name: "Germany", note: "Engineering hub" },
  { flag: "🇨🇦", name: "Canada", note: "Immigration friendly" },
  { flag: "🇨🇭", name: "Switzerland", note: "High salaries" },
  { flag: "🇦🇺", name: "Australia", note: "Skilled migration" },
  { flag: "🇸🇬", name: "Singapore", note: "Asia tech hub" },
];

const tools = [
  {
    icon: "💰",
    title: "Salary Explorer",
    description:
      "Compare earning potential across countries, careers and experience levels.",
  },
  {
    icon: "📈",
    title: "Hiring Trends",
    description:
      "See whether hiring demand is rising, stable or weakening.",
  },
  {
    icon: "📉",
    title: "Layoff Intelligence",
    description:
      "Track industries and professions experiencing workforce reductions.",
  },
  {
    icon: "🌍",
    title: "Country Compare",
    description:
      "Compare salary, taxes, cost of living, visas and career opportunities.",
  },
  {
    icon: "🤖",
    title: "AI Career Coach",
    description:
      "Get a personalized career and relocation roadmap based on your goals.",
  },
  {
    icon: "🎓",
    title: "CareerForge Academy",
    description:
      "Discover courses, certifications, books and learning paths for your career.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#07101f] text-white">
      <header className="border-b border-white/10 bg-[#07101f]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-emerald-400 font-black text-slate-950">
              CF
            </div>

            <div>
              <div className="text-xl font-bold tracking-tight">
                Career<span className="text-blue-400">Forge</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                Global Career Intelligence
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#careers" className="transition hover:text-white">
              Careers
            </a>
            <a href="#countries" className="transition hover:text-white">
              Countries
            </a>
            <a href="#tools" className="transition hover:text-white">
              Tools
            </a>
            <a href="#academy" className="transition hover:text-white">
              Academy
            </a>
          </nav>

          <button className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/10">
            Sign in
          </button>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-[-180px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[130px]" />
        <div className="absolute right-0 top-[200px] h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-28 pt-24 text-center">
          <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/5 px-4 py-2 text-sm text-blue-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Career intelligence for a global workforce
          </div>

          <h1 className="mx-auto max-w-5xl text-5xl font-black leading-[0.98] tracking-[-0.05em] md:text-7xl lg:text-8xl">
            Build a career without
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              borders.
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-slate-400 md:text-xl">
            Compare careers, salaries, hiring trends, layoffs, AI exposure,
            cost of living, visas and learning paths across the world.
          </p>

          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] p-2 shadow-2xl shadow-blue-950/40">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                placeholder="Search a career — e.g. Mechanical Engineer"
                className="flex-1 rounded-xl bg-transparent px-5 py-4 text-base text-white outline-none placeholder:text-slate-600"
              />

              <button className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-400 px-8 py-4 font-bold text-slate-950 transition hover:scale-[1.01]">
                Explore careers
              </button>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-x-7 gap-y-3 text-sm text-slate-500">
            <span>✓ Global salary data</span>
            <span>✓ Hiring & layoff intelligence</span>
            <span>✓ Visa pathways</span>
            <span>✓ Learning roadmaps</span>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-6 py-10 md:grid-cols-4">
          {[
            ["40+", "Countries planned"],
            ["100+", "Career paths"],
            ["5", "Global markets at launch"],
            ["1", "Career decision platform"],
          ].map(([number, label]) => (
            <div key={label} className="px-6 py-4 text-center">
              <div className="text-3xl font-black">{number}</div>
              <div className="mt-1 text-sm text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="careers" className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
              Career intelligence
            </p>
            <h2 className="text-4xl font-black tracking-tight md:text-5xl">
              Explore high-potential careers
            </h2>
            <p className="mt-4 max-w-2xl text-slate-400">
              Compare opportunity, earning potential and market momentum before
              committing years to a career.
            </p>
          </div>

          <button className="self-start rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5">
            View all careers →
          </button>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {careers.map((career) => (
            <article
              key={career.title}
              className="group rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition hover:-translate-y-1 hover:border-blue-400/30 hover:bg-white/[0.055]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    {career.category}
                  </div>
                  <h3 className="mt-2 text-xl font-bold">{career.title}</h3>
                </div>

                <div className="rounded-xl bg-blue-400/10 px-3 py-2 text-sm font-black text-blue-300">
                  {career.score}
                </div>
              </div>

              <div className="mt-7 space-y-4">
                <div>
                  <div className="text-xs text-slate-500">Salary potential</div>
                  <div className="mt-1 font-semibold">{career.salary}</div>
                </div>

                <div>
                  <div className="text-xs text-slate-500">Market outlook</div>
                  <div className="mt-1 flex items-center gap-2 font-semibold text-emerald-300">
                    <span>↗</span>
                    {career.trend}
                  </div>
                </div>
              </div>

              <button className="mt-7 text-sm font-semibold text-blue-300 group-hover:text-blue-200">
                Explore career →
              </button>
            </article>
          ))}
        </div>
      </section>

      <section id="countries" className="bg-white/[0.025]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
            Global opportunities
          </p>

          <h2 className="text-4xl font-black tracking-tight md:text-5xl">
            Where should your career take you?
          </h2>

          <p className="mt-4 max-w-2xl text-slate-400">
            Compare opportunities across countries before deciding where to
            work, study or relocate.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {countries.map((country) => (
              <button
                key={country.name}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b1527] p-6 text-left transition hover:border-emerald-400/30"
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{country.flag}</div>
                  <div>
                    <div className="font-bold">{country.name}</div>
                    <div className="mt-1 text-sm text-slate-500">
                      {country.note}
                    </div>
                  </div>
                </div>

                <span className="text-slate-600">→</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="tools" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
            Decision tools
          </p>

          <h2 className="text-4xl font-black tracking-tight md:text-5xl">
            More than a salary website.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            CareerForge combines the information you normally have to search
            across dozens of different websites.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <div
              key={tool.title}
              className="rounded-2xl border border-white/10 bg-white/[0.035] p-7"
            >
              <div className="text-3xl">{tool.icon}</div>
              <h3 className="mt-5 text-xl font-bold">{tool.title}</h3>
              <p className="mt-3 leading-7 text-slate-400">
                {tool.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="academy" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="overflow-hidden rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-500/10 to-emerald-400/5 p-10 md:p-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">
                CareerForge Academy
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                Don&apos;t just choose the career.
                <span className="block text-slate-400">Learn how to get it.</span>
              </h2>

              <p className="mt-6 max-w-xl leading-8 text-slate-400">
                Discover curated courses, certifications, books, learning
                materials and step-by-step roadmaps for your chosen profession.
              </p>

              <button className="mt-8 rounded-xl bg-white px-6 py-3 font-bold text-slate-950">
                Explore Academy
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#07101f]/70 p-6">
              {[
                "Cybersecurity Career Roadmap",
                "Mechanical Engineering Interview Pack",
                "Project Management Certification Path",
                "Software Engineering Learning Plan",
              ].map((course, index) => (
                <div
                  key={course}
                  className="flex items-center gap-4 border-b border-white/10 py-4 last:border-0"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 font-bold text-blue-300">
                    {index + 1}
                  </div>

                  <div>
                    <div className="font-semibold">{course}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      Courses • Materials • Certification guidance
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center">
          <h2 className="text-4xl font-black tracking-tight md:text-6xl">
            Your next career move should
            <span className="block text-blue-400">not be a guess.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-400">
            Use CareerForge to compare your options before you spend years
            building the wrong career.
          </p>

          <button className="mt-9 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-400 px-8 py-4 font-black text-slate-950">
            Start exploring
          </button>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-6 py-10 text-sm text-slate-500 md:flex-row">
          <div>
            <span className="font-bold text-white">CareerForge</span> — Your
            Global Career Compass.
          </div>

          <div className="flex flex-wrap gap-6">
            <span>Careers</span>
            <span>Countries</span>
            <span>Academy</span>
            <span>Pricing</span>
            <span>Privacy</span>
          </div>
        </div>
      </footer>
    </main>
  );
}