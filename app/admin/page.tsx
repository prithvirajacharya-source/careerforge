"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

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
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
  }

  async function saveCareer(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      setMessage("Please enter a career title.");
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
      career_score: Number(careerScore),
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
    setSaving(false);
  }

  return (
    <main className="min-h-screen bg-[#07101f] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <div className="text-xl font-bold">
              Career<span className="text-blue-400">Forge</span>
            </div>
            <div className="text-xs text-slate-500">Admin Dashboard</div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/careers"
              className="text-sm font-semibold text-slate-400 hover:text-white"
            >
              View Careers →
            </a>

            {isLoggedIn && (
              <button
                onClick={logout}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-16">
        {!isLoggedIn ? (
          <>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
              Admin Login
            </p>

            <h1 className="mt-4 text-5xl font-black">
              Sign in to CareerForge
            </h1>

            <p className="mt-4 text-slate-400">
              Only authorized administrators can manage career data.
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3 outline-none"
                />
              </div>

              {authMessage && (
                <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
                  {authMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-emerald-400 px-6 py-4 font-black text-slate-950"
              >
                Sign in
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
              Authenticated Admin
            </p>

            <h1 className="mt-4 text-5xl font-black">
              Add a new career
            </h1>

            <p className="mt-4 text-slate-400">
              Add career information directly to the CareerForge database.
            </p>

            <form
              onSubmit={saveCareer}
              className="mt-10 space-y-6 rounded-3xl border border-white/10 bg-white/[0.035] p-8"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Career title
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Example: Automation Engineer"
                  className="w-full rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3 outline-none"
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
                  className="w-full rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3 outline-none"
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
                    value={careerScore}
                    onChange={(e) => setCareerScore(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3 outline-none"
                  />
                </div>
              </div>

              {message && (
                <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-emerald-400 px-6 py-4 font-black text-slate-950 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Career"}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}