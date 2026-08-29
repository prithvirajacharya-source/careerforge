"use client";

import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserSessionGate({ children, returnTo }: { children: (user: User) => ReactNode; returnTo?: string }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setChecking(false); }).catch(() => { setUser(null); setChecking(false); setMessage("Authentication is temporarily unavailable. Please try again."); });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")) router.replace(returnTo);
  }, [returnTo, router, user]);

  async function authenticate() {
    if (!email.trim() || password.length < 8) {
      setMessage("Enter a valid email and a password of at least 8 characters.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const result = mode === "sign-in"
        ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
        : await supabase.auth.signUp({ email: email.trim(), password });
      if (result.error) setMessage(result.error.message);
      else if (mode === "sign-up" && !result.data.session) setMessage("Check your email to confirm your SEKUR account.");
    } catch {
      setMessage("Authentication is temporarily unavailable. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (checking) return <div className="glass-panel rounded-2xl border p-8 text-center text-slate-700">Checking your SEKUR session...</div>;
  if (!user) return <section className="glass-panel mx-auto max-w-xl rounded-3xl border p-6 sm:p-8"><p className="product-eyebrow">Your private SEKUR account</p><h1 className="mt-3 text-3xl font-black">{mode === "sign-in" ? "Sign in to continue" : "Create your account"}</h1><p className="mt-3 leading-7 text-slate-600">Your profile, saved intelligence and reports are private and protected by row-level security.</p><div className="mt-6 space-y-4"><label className="block text-sm font-bold text-slate-700">Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" className="glass-control mt-2 w-full rounded-xl px-4 py-3 text-slate-900" /></label><label className="block text-sm font-bold text-slate-700">Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} className="glass-control mt-2 w-full rounded-xl px-4 py-3 text-slate-900" /></label></div>{message && <div role="status" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{message}</div>}<button type="button" disabled={busy} onClick={authenticate} className="product-button product-button-primary mt-6 w-full">{busy ? "Please wait..." : mode === "sign-in" ? "Sign in" : "Create account"}</button>{mode === "sign-up" && <p className="mt-3 text-xs leading-5 text-slate-600">By creating an account, you acknowledge the private-beta <Link href="/terms" className="font-semibold text-blue-800">Terms</Link> and <Link href="/privacy" className="font-semibold text-blue-800">Privacy Notice</Link>.</p>}<button type="button" onClick={() => { setMode(mode === "sign-in" ? "sign-up" : "sign-in"); setMessage(""); }} className="mt-4 w-full text-sm font-bold text-blue-800">{mode === "sign-in" ? "New to SEKUR? Create an account" : "Already registered? Sign in"}</button></section>;
  if (returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")) return <div className="glass-panel rounded-2xl border p-8 text-center text-slate-700">Returning to your opportunity...</div>;
  return <>{children(user)}</>;
}
