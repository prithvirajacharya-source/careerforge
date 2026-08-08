"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  // Authentication
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  // Dashboard statistics
  const [careerCount, setCareerCount] = useState<number | null>(null);
  const [countryCount, setCountryCount] = useState<number | null>(null);

  // Career form
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

      setIsLoggedIn(!!session);

      if (session) {
        await loadDashboardStats();
      }
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoggedIn(!!session);

      if (session) {
        await loadDashboardStats();
      } else {
        setCareerCount(null);
        setCountryCount(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadDashboardStats() {
    const [careersResult, countriesResult] = await Promise.all([
      supabase
        .from("careers")
        .select("*", { count: "exact", head: true }),

      supabase
        .from("countries")
        .select("*", { count: "exact", head: true }),
    ]);

    if (!careersResult.error) {
      setCareerCount(careersResult.count ?? 0);
    }

    if (!countriesResult.error) {
      setCountryCount(countriesResult.count ?? 0);
    }
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
    setCareerCount(null);
    setCountryCount(null);
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

  return (
    <main className="min-h-screen bg-[#07101f] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#07101f]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-emerald-400 font-black text-slate-950">
              CF
            </div>

            <div>
              <div className="text-xl font-bold">
                Career<span className="text-blue-400">Forge</span>
              </div>

              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Admin
              </div>
            </div>
          </a>

          <div className="flex items-center gap-4">
            <a
              href="/careers"
              className="text-sm font-semibold text-slate-400 transition hover:text-white"
            >
              View Careers →
            </a>

            {isLoggedIn && (
              <button
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
        /* LOGIN */
        <section className="mx-auto max-w-xl px-6 py-20">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
            Administrator Access
          </p>

          <h1 className="mt-4 text-5xl font-black tracking-tight">
            Sign in
          </h1>

          <p className="mt-4 leading-7 text-slate-400">
            Only authorized administrators can manage CareerForge data.
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
        /* ADMIN DASHBOARD */
        <section className="mx-auto max-w-7xl px-6 py-14">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-400">
              Admin Dashboard
            </p>

            <h1 className="mt-3 text-5xl font-black tracking-tight">
              CareerForge Control Center
            </h1>

            <p className="mt-4 max-w-2xl text-slate-400">
              Manage careers, countries, salaries, hiring intelligence,
              courses and platform data from one place.
            </p>
          </div>

          {/* Statistics */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
              <div className="text-sm text-slate-500">
                Careers
              </div>

              <div className="mt-3 text-4xl font-black">
                {careerCount ?? "—"}
              </div>

              <div className="mt-2 text-xs text-slate-600">
                Live database
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
              <div className="text-sm text-slate-500">
                Countries
              </div>

              <div className="mt-3 text-4xl font-black">
                {countryCount ?? "—"}
              </div>

              <div className="mt-2 text-xs text-slate-600">
                Global markets
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
              <div className="text-sm text-slate-500">
                Database
              </div>

              <div className="mt-3 text-xl font-black text-emerald-300">
                Connected
              </div>

              <div className="mt-2 text-xs text-slate-600">
                Supabase
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
              <div className="text-sm text-slate-500">
                Platform
              </div>

              <div className="mt-3 flex items-center gap-2 text-xl font-black text-emerald-300">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                Online
              </div>

              <div className="mt-2 text-xs text-slate-600">
                Development
              </div>
            </div>
          </div>

          {/* Admin modules */}
          <div className="mt-12">
            <h2 className="text-2xl font-black">
              Intelligence modules
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                ["💼", "Careers", "Manage career profiles"],
                ["🌍", "Countries", "Manage global markets"],
                ["💰", "Salaries", "Salary intelligence"],
                ["📈", "Hiring Trends", "Employment demand data"],
                ["📉", "Layoff Trends", "Workforce reduction intelligence"],
                ["🎓", "Courses", "Learning products and resources"],
              ].map(([icon, name, description]) => (
                <div
                  key={name}
                  className="rounded-2xl border border-white/10 bg-[#0b1527] p-6 transition hover:-translate-y-1 hover:border-blue-400/30"
                >
                  <div className="text-3xl">
                    {icon}
                  </div>

                  <h3 className="mt-4 text-lg font-bold">
                    {name}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    {description}
                  </p>

                  <div className="mt-5 text-sm font-semibold text-blue-300">
                    Coming next →
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Career */}
          <div className="mt-16 border-t border-white/10 pt-14">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
              Career Management
            </p>

            <h2 className="mt-3 text-4xl font-black">
              Add a new career
            </h2>

            <p className="mt-4 text-slate-400">
              Publish a new career directly to the CareerForge database.
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