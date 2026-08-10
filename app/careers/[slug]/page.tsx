import type { ReactNode } from "react";
import ScoreCard from "@/components/ScoreCard";
import CurrencyText from "@/components/CurrencyText";
import SiteHeader from "@/components/SiteHeader";

const careerData: Record<string, any> = {
  "mechanical-engineer": {
    title: "Mechanical Engineer",
    category: "Engineering",
    score: 84,
    description:
      "Design, develop, test and improve mechanical products, machines and systems across industries including automotive, energy, aerospace and manufacturing.",
    salary: "$102k",
    hiring: "Stable",
    layoffs: "Low",
    aiRisk: "Low",
    remote: "Medium",
    education: "Bachelor Degree",
    workLife: "Good",
    demand: "Strong",

    countries: [
      ["🇨🇭", "Switzerland", "Very High", "Strong"],
      ["🇺🇸", "United States", "$102k+", "Strong"],
      ["🇩🇪", "Germany", "High", "Strong"],
      ["🇸🇪", "Sweden", "Competitive", "Stable"],
      ["🇨🇦", "Canada", "Competitive", "Strong"],
      ["🇦🇺", "Australia", "Competitive", "Strong"],
    ],

    skills: [
      "CAD",
      "FEA",
      "Product Development",
      "Manufacturing",
      "Testing",
      "Materials",
      "Thermodynamics",
      "Problem Solving",
    ],

    roadmap: [
      "Build strong mathematics and engineering fundamentals",
      "Learn CAD and engineering analysis tools",
      "Build practical projects and a technical portfolio",
      "Enter a graduate or junior engineering role",
      "Develop a technical specialization",
      "Progress to senior engineer or technical lead",
      "Move into management, consulting or entrepreneurship",
    ],

    courses: [
      ["CAD & Product Design", "Course"],
      ["Finite Element Analysis", "Course"],
      ["Python for Engineers", "Course"],
      ["Design for Manufacturing", "Course"],
    ],

    certifications: [
      "CAD certification",
      "Project management",
      "Quality systems",
      "Industry-specific technical certifications",
    ],

    related: [
      "Automation Engineer",
      "Controls Engineer",
      "Manufacturing Engineer",
      "Product Development Engineer",
    ],
  },

  "software-engineer": {
    title: "Software Engineer",
    category: "Technology",
    score: 92,
    description:
      "Design and build software products, applications and digital systems used by businesses and consumers around the world.",
    salary: "$133k",
    hiring: "Strong",
    layoffs: "Medium",
    aiRisk: "Medium",
    remote: "High",
    education: "Degree Optional",
    workLife: "Good",
    demand: "Strong",

    countries: [
      ["🇺🇸", "United States", "$133k+", "Strong"],
      ["🇨🇭", "Switzerland", "Very High", "Strong"],
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
      "Learn Git, databases and APIs",
      "Create a strong portfolio",
      "Apply for junior engineering roles",
      "Progress into specialization or technical leadership",
    ],

    courses: [
      ["Programming Fundamentals", "Course"],
      ["Full Stack Development", "Course"],
      ["Cloud Fundamentals", "Certification"],
      ["System Design", "Course"],
    ],

    certifications: [
      "Cloud certification",
      "Security fundamentals",
      "Database certification",
      "Platform-specific credentials",
    ],

    related: [
      "DevOps Engineer",
      "Cloud Engineer",
      "Data Engineer",
      "Cybersecurity Analyst",
    ],
  },

  "cybersecurity-analyst": {
    title: "Cybersecurity Analyst",
    category: "Technology",
    score: 94,
    description:
      "Protect organizations, infrastructure and digital information from cyber threats, vulnerabilities and security incidents.",
    salary: "$125k",
    hiring: "Very Strong",
    layoffs: "Low",
    aiRisk: "Low",
    remote: "High",
    education: "Degree Optional",
    workLife: "Good",
    demand: "Very Strong",

    countries: [
      ["🇺🇸", "United States", "$125k+", "Very Strong"],
      ["🇸🇬", "Singapore", "High", "Very Strong"],
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
      "Build a practical home lab",
      "Complete security projects",
      "Earn an entry-level certification",
      "Enter a SOC or analyst role",
      "Specialize in security engineering or architecture",
    ],

    courses: [
      ["Cybersecurity Fundamentals", "Course"],
      ["Security Certification Preparation", "Certification"],
      ["Practical Security Labs", "Labs"],
      ["Cloud Security Fundamentals", "Course"],
    ],

    certifications: [
      "CompTIA Security+",
      "Network+",
      "Cloud security certification",
      "Advanced security certifications",
    ],

    related: [
      "Cloud Security Engineer",
      "Security Engineer",
      "DevOps Engineer",
      "Network Engineer",
    ],
  },

  "automation-engineer": {
    title: "Automation Engineer",
    category: "Engineering",
    score: 90,
    description:
      "Design and improve automated machines, industrial systems, production lines and control solutions.",
    salary: "Researching",
    hiring: "Strong",
    layoffs: "Low",
    aiRisk: "Low",
    remote: "Medium",
    education: "Bachelor Degree",
    workLife: "Good",
    demand: "Strong",

    countries: [
      ["🇩🇪", "Germany", "High", "Very Strong"],
      ["🇸🇪", "Sweden", "Competitive", "Strong"],
      ["🇨🇭", "Switzerland", "Very High", "Strong"],
      ["🇺🇸", "United States", "High", "Strong"],
      ["🇳🇱", "Netherlands", "High", "Strong"],
      ["🇨🇦", "Canada", "Competitive", "Strong"],
    ],

    skills: [
      "PLC",
      "Control Systems",
      "Industrial Automation",
      "Robotics",
      "Sensors",
      "Electrical Systems",
      "Python",
      "Troubleshooting",
    ],

    roadmap: [
      "Build electrical and control-system fundamentals",
      "Learn PLC programming",
      "Understand sensors, actuators and industrial communication",
      "Build automation projects",
      "Enter an automation or controls engineering role",
      "Specialize in robotics, manufacturing or process automation",
      "Progress to technical lead, consultant or integrator",
    ],

    courses: [
      ["PLC Programming", "Course"],
      ["Industrial Automation", "Course"],
      ["Robotics Fundamentals", "Course"],
      ["Control Systems", "Course"],
    ],

    certifications: [
      "PLC vendor certification",
      "Industrial automation certification",
      "Robotics platform certification",
      "Functional safety training",
    ],

    related: [
      "Controls Engineer",
      "Robotics Engineer",
      "Electrical Engineer",
      "Manufacturing Engineer",
    ],
  },
};

function Metric({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
        {label}
      </div>

      <div className="mt-2 text-xl font-bold">
        {value}
      </div>
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
      <main className="min-h-screen bg-[#07101f] text-white">
        <SiteHeader />

        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-400/10 text-3xl">
            🔎
          </div>

          <h1 className="mt-6 text-4xl font-black">
            Career intelligence is being prepared
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            This career exists in SEKUR, but its full intelligence profile has
            not been published yet.
          </p>

          <a
            href="/careers"
            className="mt-8 inline-block rounded-xl bg-blue-500 px-6 py-3 font-bold text-slate-950"
          >
            Back to Career Explorer
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07101f] text-white">
      <SiteHeader />

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 pb-14 pt-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
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

          {/* NEW REUSABLE SCORE CARD */}
          <ScoreCard
            title="SEKUR Career Score"
            score={career.score}
            items={[
              {
                label: "Salary",
                value: <CurrencyText text={career.salary} />,
              },
              {
                label: "Hiring",
                value: career.hiring,
              },
              {
                label: "AI Risk",
                value: career.aiRisk,
              },
              {
                label: "Remote Work",
                value: career.remote,
              },
            ]}
          />
        </div>
      </section>

      {/* METRICS */}
      <section className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-6 md:grid-cols-4">
        <Metric
          label="Salary"
          value={<CurrencyText text={career.salary} />}
        />

        <Metric
          label="Hiring"
          value={career.hiring}
        />

        <Metric
          label="Layoff risk"
          value={career.layoffs}
        />

        <Metric
          label="AI risk"
          value={career.aiRisk}
        />

        <Metric
          label="Remote"
          value={career.remote}
        />

        <Metric
          label="Demand"
          value={career.demand}
        />

        <Metric
          label="Work-life"
          value={career.workLife}
        />

        <Metric
          label="Education"
          value={career.education}
        />
      </section>

      {/* GLOBAL OPPORTUNITY */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_0.65fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
              Global Opportunity
            </p>

            <h2 className="mt-3 text-4xl font-black">
              Where this career performs best
            </h2>

            <p className="mt-4 max-w-2xl text-slate-400">
              Compare international earning potential and job-market
              opportunity for this career.
            </p>

            <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
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
                    <span className="text-2xl">
                      {country[0]}
                    </span>

                    <span className="font-semibold">
                      {country[1]}
                    </span>

                    <span className="text-slate-400">
                      <CurrencyText text={country[2]} />
                    </span>

                    <span className="font-semibold text-emerald-300">
                      {country[3]}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* SKILLS */}
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
              Skills
            </p>

            <h2 className="mt-3 text-4xl font-black">
              What you need
            </h2>

            <p className="mt-4 text-slate-400">
              Core capabilities commonly associated with this career.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {career.skills.map((skill: string) => (
                <div
                  key={skill}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-blue-400/30 hover:text-white"
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ROADMAP + LEARNING */}
      <section className="bg-white/[0.025]">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-14 lg:grid-cols-2">
            {/* ROADMAP */}
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
                Career Roadmap
              </p>

              <h2 className="mt-3 text-4xl font-black">
                How to get there
              </h2>

              <p className="mt-4 text-slate-400">
                A practical progression from fundamentals to senior-level
                career opportunities.
              </p>

              <div className="mt-8 space-y-4">
                {career.roadmap.map(
                  (
                    step: string,
                    index: number
                  ) => (
                    <div
                      key={step}
                      className="flex gap-5 rounded-2xl border border-white/10 bg-[#0b1527] p-5 transition hover:border-emerald-400/20"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-400/10 font-black text-blue-300">
                        {index + 1}
                      </div>

                      <div className="pt-2 font-semibold">
                        {step}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* LEARNING */}
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
                Learning
              </p>

              <h2 className="mt-3 text-4xl font-black">
                Courses & materials
              </h2>

              <p className="mt-4 leading-7 text-slate-400">
                SEKUR will recommend useful courses, certifications and
                learning materials for each career.
              </p>

              <div className="mt-8 space-y-4">
                {career.courses.map(
                  (course: string[]) => (
                    <div
                      key={course[0]}
                      className="group flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b1527] p-5 transition hover:border-blue-400/30"
                    >
                      <div>
                        <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
                          {course[1]}
                        </div>

                        <div className="mt-2 text-lg font-bold">
                          {course[0]}
                        </div>
                      </div>

                      <span className="text-blue-300 transition group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  )
                )}
              </div>

              {/* CERTIFICATIONS */}
              <h3 className="mt-10 text-xl font-black">
                Useful certifications
              </h3>

              <div className="mt-4 space-y-3">
                {career.certifications.map(
                  (cert: string) => (
                    <div
                      key={cert}
                      className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-slate-300"
                    >
                      <span className="mr-2 text-emerald-300">
                        ✓
                      </span>

                      {cert}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SIMILAR CAREERS + PERSONAL SCORE */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* RELATED */}
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
              Similar Careers
            </p>

            <h2 className="mt-3 text-3xl font-black">
              You may also consider
            </h2>

            <div className="mt-6 grid gap-3">
              {career.related.map(
                (item: string) => (
                  <div
                    key={item}
                    className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4 font-semibold transition hover:border-blue-400/30 hover:bg-white/[0.05]"
                  >
                    <span>
                      {item}
                    </span>

                    <span className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-blue-300">
                      →
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* PERSONALIZED INTELLIGENCE */}
          <div className="rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-500/10 to-emerald-400/5 p-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">
              SEKUR Intelligence
            </p>

            <h2 className="mt-4 text-4xl font-black">
              Is this career right for you?
            </h2>

            <p className="mt-5 leading-7 text-slate-400">
              Soon, SEKUR will score this career specifically for you using
              your experience, salary target, location preferences, willingness
              to relocate and long-term career goals.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs text-slate-500">
                  Global Score
                </div>

                <div className="mt-1 text-2xl font-black">
                  {career.score}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs text-slate-500">
                  Your Score
                </div>

                <div className="mt-1 text-2xl font-black text-blue-300">
                  Coming soon
                </div>
              </div>
            </div>

            <button className="mt-7 rounded-xl bg-white px-6 py-3 font-bold text-slate-950 transition hover:scale-[1.02]">
              Build my personal score
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}