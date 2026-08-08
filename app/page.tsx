import Link from "next/link";

const careers = [
  {
    title: "Software Engineer",
    slug: "software-engineer",
    category: "Technology",
    salary: "$70k – $180k+",
    trend: "Strong hiring",
    score: 92,
  },
  {
    title: "Mechanical Engineer",
    slug: "mechanical-engineer",
    category: "Engineering",
    salary: "$55k – $130k+",
    trend: "Stable",
    score: 82,
  },
  {
    title: "Cybersecurity Analyst",
    slug: "cybersecurity-analyst",
    category: "Technology",
    salary: "$70k – $160k+",
    trend: "Very strong",
    score: 94,
  },
  {
    title: "Registered Nurse",
    slug: "registered-nurse",
    category: "Healthcare",
    salary: "$55k – $130k+",
    trend: "Very strong",
    score: 91,
  },
];

const countries = [
  {
    flag: "🇸🇪",
    name: "Sweden",
    slug: "sweden",
    note: "Work-life balance",
  },
  {
    flag: "🇩🇪",
    name: "Germany",
    slug: "germany",
    note: "Engineering hub",
  },
  {
    flag: "🇨🇦",
    name: "Canada",
    slug: "canada",
    note: "Immigration friendly",
  },
  {
    flag: "🇨🇭",
    name: "Switzerland",
    slug: "switzerland",
    note: "High salaries",
  },
  {
    flag: "🇦🇺",
    name: "Australia",
    slug: "australia",
    note: "Skilled migration",
  },
  {
    flag: "🇸🇬",
    name: "Singapore",
    slug: "singapore",
    note: "Asia tech hub",
  },
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
    title: "SEKUR Learning",
    description:
      "Discover courses, certifications, books and learning paths for your career.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#07101f] text-white">
      {/* HEADER */}
      <header className="border-b border-white/10 bg-[#07101f]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 font-black text-slate-950">
              S
            </div>

            <div>
              <div className="text-xl font-black tracking-tight">
                SEK<span className="text-blue-400">UR</span>
              </div>

              <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                Global Career Intelligence
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <Link
              href="/careers"
              className="transition hover:text-white"
            >
              Careers
            </Link>

            <Link
              href="/countries"
              className="transition hover:text-white"
            >
              Countries
            </Link>

            <a
              href="#tools"
              className="transition hover:text-white"
            >
              Tools
            </a>

            <a
              href="#learning"
              className="transition hover:text-white"
            >
              Learning
            </a>
          </nav>

          <Link
            href="/admin"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/10"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-[-180px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[130px]" />

        <div className="absolute right-0 top-[200px] h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-28 pt-24 text-center">
          <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/5 px-4 py-2 text-sm text-blue-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            AI-powered Global Career Intelligence
          </div>

          <h1 className="mx-auto max-w-5xl text-5xl font-black leading-[0.98] tracking-[-0.05em] md:text-7xl lg:text-8xl">
            Build a career without

            <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              borders.
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-slate-400 md:text-xl">
            Discover the best career and country for your future using salary,
            AI risk, hiring trends, taxes, visas and global market intelligence.
          </p>

          {/* SEARCH */}
          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] p-2 shadow-2xl shadow-blue-950/40">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                placeholder="Search any career, country or skill..."
                className="flex-1 rounded-xl bg-transparent px-5 py-4 text-base text-white outline-none placeholder:text-slate-600"
              />

              <Link
                href="/careers"
                className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-400 px-8 py-4 font-bold text-slate-950 transition hover:scale-[1.01]"
              >
                Explore
              </Link>
            </div>
          </div>

          {/* MAIN ACTIONS */}
          <div className="mx-auto mt-5 flex max-w-3xl flex-wrap justify-center gap-3">
            <Link
              href="/careers"
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-blue-400/30 hover:bg-blue-400/10 hover:text-white"
            >
              Explore Careers
            </Link>

            <Link
              href="/countries"
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-white"
            >
              Explore Countries
            </Link>

            <span className="cursor-not-allowed rounded-xl border border-white/5 bg-white/[0.02] px-5 py-3 text-sm font-semibold text-slate-600">
              Compare Countries · Coming Soon
            </span>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-x-7 gap-y-3 text-sm text-slate-500">
            <span>✓ Global salary intelligence</span>
            <span>✓ Hiring & layoff trends</span>
            <span>✓ Visa pathways</span>
            <span>✓ Learning roadmaps</span>
          </div>
        </div>
      </section>

      {/* PLATFORM STATS */}
      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-6 py-10 md:grid-cols-4">
          {[
            ["10", "Launch countries"],
            ["100+", "Career paths planned"],
            ["25+", "Decision tools planned"],
            ["1", "Career intelligence platform"],
          ].map(([number, label]) => (
            <div
              key={label}
              className="px-6 py-4 text-center"
            >
              <div className="text-3xl font-black">
                {number}
              </div>

              <div className="mt-1 text-sm text-slate-500">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CAREERS */}
      <section
        id="careers"
        className="mx-auto max-w-7xl px-6 py-24"
      >
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
              Career Intelligence
            </p>

            <h2 className="text-4xl font-black tracking-tight md:text-5xl">
              Explore high-potential careers
            </h2>

            <p className="mt-4 max-w-2xl text-slate-400">
              Compare opportunity, earning potential and market momentum before
              committing years to a career.
            </p>
          </div>

          <Link
            href="/careers"
            className="self-start rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
          >
            View all careers →
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {careers.map((career) => (
            <Link
              key={career.title}
              href={`/careers/${career.slug}`}
              className="group rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:bg-white/[0.055]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    {career.category}
                  </div>

                  <h3 className="mt-2 text-xl font-bold">
                    {career.title}
                  </h3>
                </div>

                <div className="rounded-xl bg-blue-400/10 px-3 py-2 text-sm font-black text-blue-300">
                  {career.score}
                </div>
              </div>

              <div className="mt-7 space-y-4">
                <div>
                  <div className="text-xs text-slate-500">
                    Salary potential
                  </div>

                  <div className="mt-1 font-semibold">
                    {career.salary}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500">
                    Market outlook
                  </div>

                  <div className="mt-1 flex items-center gap-2 font-semibold text-emerald-300">
                    <span>↗</span>
                    {career.trend}
                  </div>
                </div>
              </div>

              <div className="mt-7 text-sm font-semibold text-blue-300 transition group-hover:text-blue-200">
                Explore career →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* COUNTRIES */}
      <section
        id="countries"
        className="bg-white/[0.025]"
      >
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
                Global Opportunities
              </p>

              <h2 className="text-4xl font-black tracking-tight md:text-5xl">
                Where should your career take you?
              </h2>

              <p className="mt-4 max-w-2xl text-slate-400">
                Compare opportunities across countries before deciding where to
                work, study or relocate.
              </p>
            </div>

            <Link
              href="/countries"
              className="self-start rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
            >
              View all countries →
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {countries.map((country) => (
              <Link
                key={country.name}
                href={`/countries/${country.slug}`}
                className="group flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b1527] p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">
                    {country.flag}
                  </div>

                  <div>
                    <div className="font-bold">
                      {country.name}
                    </div>

                    <div className="mt-1 text-sm text-slate-500">
                      {country.note}
                    </div>
                  </div>
                </div>

                <span className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-emerald-300">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TOOLS */}
      <section
        id="tools"
        className="mx-auto max-w-7xl px-6 py-24"
      >
        <div className="text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
            Decision Tools
          </p>

          <h2 className="text-4xl font-black tracking-tight md:text-5xl">
            More than a salary website.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            SEKUR brings together the career intelligence you normally have to
            search for across dozens of different websites.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <div
              key={tool.title}
              className="group rounded-2xl border border-white/10 bg-white/[0.035] p-7 transition duration-300 hover:-translate-y-1 hover:border-blue-400/20 hover:bg-white/[0.05]"
            >
              <div className="text-3xl">
                {tool.icon}
              </div>

              <h3 className="mt-5 text-xl font-bold">
                {tool.title}
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                {tool.description}
              </p>

              <div className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">
                Coming soon
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LEARNING */}
      <section
        id="learning"
        className="mx-auto max-w-7xl px-6 pb-24"
      >
        <div className="overflow-hidden rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-500/10 to-emerald-400/5 p-10 md:p-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">
                SEKUR Learning
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                Don&apos;t just choose the career.

                <span className="block text-slate-400">
                  Learn how to get there.
                </span>
              </h2>

              <p className="mt-6 max-w-xl leading-8 text-slate-400">
                Discover curated courses, certifications, books, learning
                materials and step-by-step roadmaps for your chosen profession.
              </p>

              <button className="mt-8 rounded-xl bg-white px-6 py-3 font-bold text-slate-950 transition hover:scale-[1.02]">
                Explore Learning
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
                    <div className="font-semibold">
                      {course}
                    </div>

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

      {/* CTA */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
            Make your next move with better information
          </p>

          <h2 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            Your next career move should

            <span className="block text-blue-400">
              not be a guess.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-400">
            Use SEKUR to compare your options before you spend years building
            the wrong career in the wrong market.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/careers"
              className="rounded-xl bg-gradient-to-r from-blue-500 to-emerald-400 px-8 py-4 font-black text-slate-950 transition hover:scale-[1.02]"
            >
              Explore Careers
            </Link>

            <Link
              href="/countries"
              className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 font-bold text-white transition hover:bg-white/10"
            >
              Explore Countries
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-6 py-10 text-sm text-slate-500 md:flex-row">
          <div>
            <span className="font-bold text-white">
              SEKUR
            </span>{" "}
            — Global Career Intelligence.
          </div>

          <div className="flex flex-wrap gap-6">
            <Link
              href="/careers"
              className="transition hover:text-white"
            >
              Careers
            </Link>

            <Link
              href="/countries"
              className="transition hover:text-white"
            >
              Countries
            </Link>

            <span>
              Learning
            </span>

            <span>
              Pricing
            </span>

            <span>
              Privacy
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}