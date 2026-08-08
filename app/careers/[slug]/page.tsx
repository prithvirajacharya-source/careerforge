const careerData: Record<string, any> = {
  "mechanical-engineer": {
    title: "Mechanical Engineer",
    category: "Engineering",
    score: 84,
    description:
      "Design, develop, test and improve mechanical products, machines and systems across industries including automotive, energy, aerospace and manufacturing.",
    salary: "$102k",
    hiring: "Stable",
    layoffRisk: "Low",
    aiRisk: "Low",
    remote: "Medium",
    education: "Bachelor's degree typically required",
    countries: [
      ["🇺🇸", "United States", "$102k+", "Strong"],
      ["🇨🇭", "Switzerland", "High", "Strong"],
      ["🇩🇪", "Germany", "High", "Strong"],
      ["🇸🇪", "Sweden", "Competitive", "Stable"],
      ["🇨🇦", "Canada", "Competitive", "Strong"],
      ["🇦🇺", "Australia", "Competitive", "Strong"],
    ],
    skills: [
      "CAD",
      "Product Development",
      "FEA",
      "Manufacturing",
      "Testing",
      "Materials",
      "Thermodynamics",
      "Problem Solving",
    ],
    roadmap: [
      "Build strong engineering fundamentals",
      "Learn CAD and engineering analysis tools",
      "Build practical projects and a portfolio",
      "Enter a graduate or junior engineering role",
      "Develop a technical specialization",
      "Progress to senior engineer / technical lead",
      "Move into management, consulting or entrepreneurship",
    ],
    courses: [
      {
        title: "CAD & Product Design",
        provider: "Course marketplace",
        type: "Course",
      },
      {
        title: "Finite Element Analysis",
        provider: "Engineering learning platform",
        type: "Course",
      },
      {
        title: "Python for Engineers",
        provider: "Online learning",
        type: "Course",
      },
    ],
  },

  "software-engineer": {
    title: "Software Engineer",
    category: "Technology",
    score: 92,
    description:
      "Design and build software applications, platforms and digital systems used by businesses and consumers.",
    salary: "$133k",
    hiring: "Strong",
    layoffRisk: "Medium",
    aiRisk: "Medium",
    remote: "High",
    education: "Degree optional",
    countries: [
      ["🇺🇸", "United States", "$133k+", "Strong"],
      ["🇨🇭", "Switzerland", "Very high", "Strong"],
      ["🇸🇬", "Singapore", "High", "Strong"],
      ["🇩🇪", "Germany", "High", "Strong"],
      ["🇨🇦", "Canada", "High", "Strong"],
      ["🇦🇺", "Australia", "High", "Strong"],
    ],
    skills: [
      "Programming",
      "Algorithms",
      "Git",
      "Databases",
      "APIs",
      "Cloud",
      "Testing",
      "System Design",
    ],
    roadmap: [
      "Choose a programming language",
      "Learn programming fundamentals",
      "Build real projects",
      "Learn Git and databases",
      "Create a portfolio",
      "Apply for junior roles",
      "Progress into specialization or technical leadership",
    ],
    courses: [
      {
        title: "Programming Fundamentals",
        provider: "Online learning",
        type: "Course",
      },
      {
        title: "Full Stack Development",
        provider: "Course marketplace",
        type: "Course",
      },
      {
        title: "Cloud Fundamentals",
        provider: "Certification provider",
        type: "Certification",
      },
    ],
  },

  "cybersecurity-analyst": {
    title: "Cybersecurity Analyst",
    category: "Technology",
    score: 94,
    description:
      "Protect organizations, infrastructure and digital information from cyber threats and security incidents.",
    salary: "$125k",
    hiring: "Very strong",
    layoffRisk: "Low",
    aiRisk: "Low",
    remote: "High",
    education: "Degree optional",
    countries: [
      ["🇺🇸", "United States", "$125k+", "Very strong"],
      ["🇸🇬", "Singapore", "High", "Very strong"],
      ["🇨🇭", "Switzerland", "High", "Strong"],
      ["🇩🇪", "Germany", "High", "Strong"],
      ["🇬🇧", "United Kingdom", "High", "Strong"],
      ["🇦🇺", "Australia", "High", "Strong"],
    ],
    skills: [
      "Networking",
      "Linux",
      "Security Operations",
      "Cloud Security",
      "Incident Response",
      "Threat Analysis",
      "Python",
      "Risk Management",
    ],
    roadmap: [
      "Learn IT and networking fundamentals",
      "Learn Linux and security basics",
      "Build a home lab",
      "Complete practical security projects",
      "Consider an entry certification",
      "Enter an analyst / SOC role",
      "Specialize in security engineering or architecture",
    ],
    courses: [
      {
        title: "Cybersecurity Fundamentals",
        provider: "Online learning",
        type: "Course",
      },
      {
        title: "Security Certification Preparation",
        provider: "Certification provider",
        type: "Certification",
      },
      {
        title: "Practical Security Labs",
        provider: "Cybersecurity lab platform",
        type: "Labs",
      },
    ],
  },
};

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
        {label}
      </div>

      <div className="mt-2 text-xl font-bold">{value}</div>
    </div>
  );
}

export default async function CareerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const career = careerData[slug];

  if (!career) {
    return (
      <main className="min-h-screen bg-[#07101f] px-6 py-24 text-center text-white">
        <h1 className="text-4xl font-black">Career not found</h1>

        <a
          href="/careers"
          className="mt-8 inline-block rounded-xl bg-blue-500 px-6 py-3 font-bold text-slate-950"
        >
          Back to careers
        </a>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07101f] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-emerald-400 font-black text-slate-950">
              CF
            </div>

            <div className="font-bold">
              Career<span className="text-blue-400">Forge</span>
            </div>
          </a>

          <a href="/careers" className="text-sm text-slate-400">
            ← Career Explorer
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-14 pt-16">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-4xl">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
              {career.category}
            </div>

            <h1 className="mt-4 text-5xl font-black tracking-tight md:text-7xl">
              {career.title}
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              {career.description}
            </p>
          </div>

          <div className="rounded-3xl border border-blue-400/20 bg-blue-400/10 px-8 py-6 text-center">
            <div className="text-sm text-blue-300">CareerForge Score</div>

            <div className="mt-1 text-5xl font-black">{career.score}</div>

            <div className="text-xs text-slate-500">out of 100</div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-6 md:grid-cols-3 lg:grid-cols-6">
        <Metric label="Salary" value={career.salary} />
        <Metric label="Hiring" value={career.hiring} />
        <Metric label="Layoff risk" value={career.layoffRisk} />
        <Metric label="AI risk" value={career.aiRisk} />
        <Metric label="Remote" value={career.remote} />
        <Metric label="Education" value={career.education} />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_0.6fr]">
          <div>
            <h2 className="text-3xl font-black">
              Global opportunity
            </h2>

            <p className="mt-3 text-slate-400">
              Compare this career across major job markets.
            </p>

            <div className="mt-7 overflow-hidden rounded-2xl border border-white/10">
              {career.countries.map(
                (
                  country: string[],
                  index: number
                ) => (
                  <div
                    key={country[1]}
                    className={`grid grid-cols-[auto_1fr_1fr_1fr] items-center gap-5 px-5 py-4 ${
                      index !== career.countries.length - 1
                        ? "border-b border-white/10"
                        : ""
                    }`}
                  >
                    <span className="text-2xl">{country[0]}</span>

                    <span className="font-semibold">{country[1]}</span>

                    <span className="text-slate-400">{country[2]}</span>

                    <span className="font-semibold text-emerald-300">
                      {country[3]}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-black">
              Core skills
            </h2>

            <div className="mt-7 flex flex-wrap gap-3">
              {career.skills.map((skill: string) => (
                <div
                  key={skill}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white/[0.025]">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-14 lg:grid-cols-2">
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
                Career roadmap
              </div>

              <h2 className="mt-4 text-4xl font-black">
                How to get there
              </h2>

              <div className="mt-8 space-y-4">
                {career.roadmap.map(
                  (step: string, index: number) => (
                    <div
                      key={step}
                      className="flex gap-5 rounded-2xl border border-white/10 bg-[#0b1527] p-5"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-400/10 font-black text-blue-300">
                        {index + 1}
                      </div>

                      <div className="pt-2 font-semibold">{step}</div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div>
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
                Learning
              </div>

              <h2 className="mt-4 text-4xl font-black">
                Courses & materials
              </h2>

              <p className="mt-4 leading-7 text-slate-400">
                Later, these recommendations can contain approved affiliate
                links so CareerForge earns revenue when users purchase
                relevant learning products.
              </p>

              <div className="mt-8 space-y-4">
                {career.courses.map((course: any) => (
                  <div
                    key={course.title}
                    className="rounded-2xl border border-white/10 bg-[#0b1527] p-5"
                  >
                    <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
                      {course.type}
                    </div>

                    <div className="mt-2 text-lg font-bold">
                      {course.title}
                    </div>

                    <div className="mt-1 text-sm text-slate-400">
                      {course.provider}
                    </div>

                    <button className="mt-5 text-sm font-bold text-blue-300">
                      View learning option →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-500/10 to-emerald-400/5 p-10 text-center">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-blue-300">
            Coming soon
          </div>

          <h2 className="mt-4 text-4xl font-black">
            Ask the CareerForge AI Coach
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Get a personalized plan for entering this career based on your
            education, experience, country and income goals.
          </p>

          <button className="mt-7 rounded-xl bg-white px-7 py-3 font-bold text-slate-950">
            Build my career plan
          </button>
        </div>
      </section>
    </main>
  );
}