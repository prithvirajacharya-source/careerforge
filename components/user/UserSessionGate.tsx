"use client";

import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function UserSessionGate({ children }: { children: (user: User) => ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setChecking(false); });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  async function authenticate() {
    if (!email.trim() || password.length < 8) {
      setMessage("Enter a valid email and a password of at least 8 characters.");
      return;
    }
    setBusy(true);
    setMessage("");
    const result = mode === "sign-in"
      ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
      : await supabase.auth.signUp({ email: email.trim(), password });
    setBusy(false);
    if (result.error) setMessage(result.error.message);
    else if (mode === "sign-up" && !result.data.session) setMessage("Check your email to confirm your SEKUR account.");
  }

  if (checking) return <div className="glass-panel rounded-2xl border p-8 text-center text-slate-300">Checking your SEKUR session...</div>;
  if (!user) return <section className="glass-panel mx-auto max-w-xl rounded-3xl border p-6 sm:p-8"><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-300">Your private SEKUR account</p><h1 className="mt-3 text-3xl font-black">{mode === "sign-in" ? "Sign in to continue" : "Create your account"}</h1><p className="mt-3 leading-7 text-slate-400">Your profile, saved intelligence and reports are private and protected by row-level security.</p><div className="mt-6 space-y-4"><label className="block text-sm font-bold text-slate-300">Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" className="glass-control mt-2 w-full rounded-xl px-4 py-3 text-white" /></label><label className="block text-sm font-bold text-slate-300">Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} className="glass-control mt-2 w-full rounded-xl px-4 py-3 text-white" /></label></div>{message && <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-slate-300">{message}</div>}<button type="button" disabled={busy} onClick={authenticate} className="mt-6 w-full rounded-xl bg-emerald-300 px-5 py-3 font-black text-slate-950 disabled:opacity-50">{busy ? "Please wait..." : mode === "sign-in" ? "Sign in" : "Create account"}</button><button type="button" onClick={() => { setMode(mode === "sign-in" ? "sign-up" : "sign-in"); setMessage(""); }} className="mt-4 w-full text-sm font-bold text-cyan-200">{mode === "sign-in" ? "New to SEKUR? Create an account" : "Already registered? Sign in"}</button></section>;
  return <>{children(user)}</>;
}
