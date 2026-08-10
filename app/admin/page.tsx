
"use client";
import BulkSafetyResearch from "@/components/admin/BulkSafetyResearch";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type AdminModule = {
  icon: string;
  title: string;
  description: string;
  href: string;
  status: "LIVE" | "BUILDING" | "NEXT" | "PLANNED";
};

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  const [careerCount, setCareerCount] = useState<number | null>(null);
  const [countryCount, setCountryCount] = useState<number | null>(null);
  const [intelligenceFactorCount, setIntelligenceFactorCount] =
    useState<number | null>(null);
  const [verifiedSourceCount, setVerifiedSourceCount] =
    useState<number | null>(null);
  const [pendingSuggestionCount, setPendingSuggestionCount] =
    useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Technology");
  const [description, setDescription] = useState("");
  const [education, setEducation] = useState("Degree Optional");
  const [aiRisk, setAiRisk] = useState("Low");
  const [remoteWork, setRemoteWork] = useState("Medium");
  const [careerScore, setCareerScore] = useState("80");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setIsLoggedIn(Boolean(session));

      if (session) {
        await loadDashboardStats();
      }
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoggedIn(Boolean(session));

      if (session) {
        await loadDashboardStats();
      } else {
        clearStats();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  function clearStats() {
    setCareerCount(null);
    setCountryCount(null);
    setIntelligenceFactorCount(null);
    setVerifiedSourceCount(null);
    setPendingSuggestionCount(null);
  }

  async function loadDashboardStats() {
    const [
      careersResult,
      countriesResult,
      factorsResult,
      verifiedResult,
      pendingResult,
    ] = await Promise.all([
      supabase.from("careers").select("id"),
      supabase.from("countries").select("id"),
      supabase.from("country_intelligence_factors").select("id"),
      supabase
        .from("country_intelligence_factors")
        .select("id")
        .neq("source_type", "estimated")
        .not("source_name", "is", null),
      supabase
        .from("intelligence_suggestions")
        .select("id")
        .eq("status", "pending"),
    ]);

    setCareerCount(
      careersResult.error ? null : careersResult.data?.length ?? 0
    );

    setCountryCount(
      countriesResult.error ? null : countriesResult.data?.length ?? 0
    );

    setIntelligenceFactorCount(
      factorsResult.error ? null : factorsResult.data?.length ?? 0
    );

    setVerifiedSourceCount(
      verifiedResult.error ? null : verifiedResult.data?.length ?? 0
    );

    setPendingSuggestionCount(
      pendingResult.error ? null : pendingResult.data?.length ?? 0
    );
  }

  function makeSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setAuthMessage("Signing in...");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthMessage(`Login failed: ${error.message}`);
      return;
    }

    setAuthMessage("");
    setPassword("");
  }

  async function logout() {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    clearStats();
  }

  async function saveCareer(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      setMessage("Please enter a career title.");
      return;
    }

    const score = Number(careerScore);

    if (Number.isNaN(score) || score < 0 || score > 100) {
      setMessage("Career score must be between 0 and 100.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("careers").insert({
      slug: makeSlug(title),
      title: title.trim(),
      category,
      description: description.trim(),
      education,
      ai_risk: aiRisk,
      remote_work: remoteWork,
      career_score: score,
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
      setSaving(false);
      return;
    }

    setMessage("Career added successfully.");
    setTitle("");
    setDescription("");
    setCareerScore("80");

    await loadDashboardStats();
    setSaving(false);
  }

  const researchCoverage =
    intelligenceFactorCount &&
    intelligenceFactorCount > 0 &&
    verifiedSourceCount !== null
      ? Math.round(
          (verifiedSourceCount / intelligenceFactorCount) * 100
        )
      : 0;

  const modules: AdminModule[] = [
    {
      icon: "🌍",
      title: "Country Intelligence",
      description: "Research, verify and publish country intelligence.",
      href: "/admin/intelligence",
      status: "LIVE",
    },
    {
      icon: "🧠",
      title: "Research Suggestions",
      description:
        "Review proposed score and evidence changes before publication.",
      href: "/admin/suggestions",
      status: "LIVE",
    },
    {
      icon: "💼",
      title: "Career Intelligence",
      description: "Run and review Career × Country evidence collection.",
      href: "/admin/career-research",
      status: "LIVE",
    },
    {
      icon: "📊",
      title: "Research Coverage",
      description:
        "Track how much SEKUR intelligence is backed by verified sources.",
      href: "/admin/intelligence",
      status: "LIVE",
    },
    {
      icon: "📚",
      title: "Source Verification",
      description: "Review research sources, explanations and evidence.",
      href: "/admin/suggestions",
      status: "NEXT",
    },
    {
      icon: "🤖",
      title: "AI Research",
      description:
        "Automated research proposals will feed the review queue.",
      href: "/admin/suggestions",
      status: "BUILDING",
    },
  ];

  function statusClass(status: AdminModule["status"]) {
    if (status === "LIVE") {
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
    }

    if (status === "BUILDING") {
      return "border-blue-400/20 bg-blue-400/10 text-blue-300";
    }

    if (status === "NEXT") {
      return "border-amber-400/20 bg-amber-400/10 text-amber-300";
    }

    return "border-white/10 bg-white/5 text-slate-500";
  }

  return (
    <main className="min-h-screen bg-[#07101f] text-white">
      <header className="border-b border-white/10 bg-[#07101f]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-emerald-400 font-black text-slate-950">
              S
            </div>

            <div>
              <div className="text-xl font-black tracking-tight">SEKUR</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-blue-300/70">
                Research Console
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="hidden text-sm font-semibold text-slate-400 transition hover:text-white sm:block"
            >
              View SEKUR →
            </Link>

            {isLoggedIn && (
              <button
                type="button"
                onClick={logout}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>

      {!isLoggedIn ? (
        <section className="mx-auto max-w-xl px-6 py-20">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
            SEKUR Administrator Access
          </p>

          <h1 className="mt-4 text-5xl font-black tracking-tight">
            Sign in
          </h1>

          <p className="mt-4 leading-7 text-slate-400">
            Authorized administrators can research, verify and publish
            SEKUR intelligence.
          </p>

          <form
            onSubmit={login}
            className="mt-10 space-y-5 rounded-3xl border border-white/10 bg-white/[0.035] p-8"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin email"
                className="w-full rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3 outline-none transition focus:border-blue-400/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3 outline-none transition focus:border-blue-400/50"
              />
            </div>

            {authMessage && (
              <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
                {authMessage}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-emerald-400 px-6 py-4 font-black text-slate-950 transition hover:scale-[1.01]"
            >
              Sign in
            </button>
          </form>
        </section>
      ) : (
        <section className="mx-auto max-w-7xl px-6 py-14">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-400">
                SEKUR Research Console
              </p>

              <h1 className="mt-3 text-5xl font-black tracking-tight md:text-6xl">
                Intelligence
                <span className="block bg-gradient-to-r from-blue-400 to-emerald-300 bg-clip-text text-transparent">
                  operations.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">
                Research, verify and publish global career intelligence
                from one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="/admin/suggestions"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 font-black text-white transition hover:border-emerald-400/30"
              >
                Review Suggestions
                {pendingSuggestionCount !== null &&
                  pendingSuggestionCount > 0 && (
                    <span className="ml-2 rounded-full bg-amber-400 px-2 py-0.5 text-xs text-slate-950">
                      {pendingSuggestionCount}
                    </span>
                  )}
              </a>

              <Link
                href="/admin/intelligence"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 font-black text-slate-950 transition hover:scale-[1.02]"
              >
                Open Intelligence CMS →
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Career Profiles" value={careerCount} detail="Live database" />
            <StatCard label="Countries" value={countryCount} detail="Global markets" />
            <StatCard
              label="Research Coverage"
              value={`${researchCoverage}%`}
              detail="Verified intelligence"
              accent="blue"
            />
            <StatCard
              label="Verified Sources"
              value={verifiedSourceCount}
              detail={`${intelligenceFactorCount ?? "—"} intelligence factors`}
              accent="green"
            />
            <StatCard
              label="Pending Research"
              value={pendingSuggestionCount}
              detail="Awaiting review"
              accent="amber"
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.035] px-6 py-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                  Database
                </div>
                <div className="mt-1 font-bold">Supabase</div>
              </div>

              <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                Connected
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-blue-400/10 bg-blue-400/[0.035] px-6 py-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                  SEKUR Platform
                </div>
                <div className="mt-1 font-bold">Development</div>
              </div>

              <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                Online
              </div>
            </div>
          </div>

          <div className="mt-14">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
              Operations
            </p>
            <h2 className="mt-2 text-3xl font-black">Research Console</h2>
            <p className="mt-3 text-slate-500">
              Manage the intelligence that powers SEKUR.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {modules.map((module) => (
                <a
                  key={module.title}
                  href={module.href}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b1527] p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:bg-white/[0.045]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-3xl">{module.icon}</div>
                    <div
                      className={`rounded-full border px-3 py-1 text-[10px] font-black tracking-[0.12em] ${statusClass(
                        module.status
                      )}`}
                    >
                      {module.status}
                    </div>
                  </div>

                  <h3 className="mt-5 text-xl font-black">
                    {module.title}
                  </h3>

                  <p className="mt-2 min-h-[40px] text-sm leading-6 text-slate-500">
                    {module.description}
                  </p>

                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-sm font-semibold text-blue-300">
                      Open
                    </span>
                    <span className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-emerald-300">
                      →
                    </span>
                  </div>
                </a>
              ))}
                        </div>
          </div>

          <BulkSafetyResearch />

          <div
            id="career-management"
            className="mt-16 border-t border-white/10 pt-14"
          >
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
              Career Management
            </p>

            <h2 className="mt-3 text-4xl font-black">
              Add a new career
            </h2>

            <p className="mt-4 text-slate-400">
              Publish a new career directly to the SEKUR platform.
            </p>

            <form
              onSubmit={saveCareer}
              className="mt-8 space-y-6 rounded-3xl border border-white/10 bg-white/[0.035] p-8"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Career title
                </label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Example: Robotics Engineer"
                  className="w-full rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3 outline-none transition focus:border-blue-400/50"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3"
                  >
                    <option>Technology</option>
                    <option>Engineering</option>
                    <option>Healthcare</option>
                    <option>Skilled Trades</option>
                    <option>Aviation</option>
                    <option>Sales</option>
                    <option>Construction</option>
                    <option>Finance</option>
                    <option>Operations</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Education
                  </label>
                  <select
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3"
                  >
                    <option>No Degree</option>
                    <option>Degree Optional</option>
                    <option>Bachelor Degree</option>
                    <option>Master Degree</option>
                    <option>Professional License</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe the career..."
                  className="w-full rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3 outline-none transition focus:border-blue-400/50"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    AI risk
                  </label>
                  <select
                    value={aiRisk}
                    onChange={(e) => setAiRisk(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3"
                  >
                    <option>Very Low</option>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Remote work
                  </label>
                  <select
                    value={remoteWork}
                    onChange={(e) => setRemoteWork(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Career score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={careerScore}
                    onChange={(e) => setCareerScore(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3 outline-none"
                  />
                </div>
              </div>

              {message && (
                <div
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    message.startsWith("Error")
                      ? "border-red-400/20 bg-red-400/10 text-red-300"
                      : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                  }`}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-emerald-400 px-6 py-4 font-black text-slate-950 transition hover:scale-[1.005] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Career"}
              </button>
            </form>
          </div>
        </section>
      )}
    </main>
  );
}

function StatCard({
  label,
  value,
  detail,
  accent,
}: {
  label: string;
  value: number | string | null;
  detail: string;
  accent?: "blue" | "green" | "amber";
}) {
  const valueClass =
    accent === "blue"
      ? "text-blue-300"
      : accent === "green"
      ? "text-emerald-300"
      : accent === "amber"
      ? "text-amber-300"
      : "text-white";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`mt-3 text-4xl font-black ${valueClass}`}>
        {value ?? "—"}
      </div>
      <div className="mt-2 text-xs text-slate-600">{detail}</div>
    </div>
  );
}
