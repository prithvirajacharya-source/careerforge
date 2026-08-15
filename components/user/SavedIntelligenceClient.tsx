"use client";

import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AlertPreferencesControl from "./AlertPreferencesControl";

type SavedItem = { id: number; item_type: "career" | "country" | "career_market"; career_slug: string | null; country_slug: string | null; favorite: boolean };
type SavedComparison = { id: number; name: string; targets: Array<{ countrySlug?: string; careerSlug?: string }> };

export default function SavedIntelligenceClient({ user, names }: { user: User; names: Record<string, string> }) {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [comparisons, setComparisons] = useState<SavedComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      supabase.from("saved_career_markets").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
      supabase.from("saved_career_comparisons").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
    ]).then(([saved, rows]) => {
      if (!active) return;
      if (saved.error || rows.error) setMessage(saved.error?.message ?? rows.error?.message ?? "Could not load your saved items.");
      setItems((saved.data ?? []) as SavedItem[]);
      setComparisons((rows.data ?? []) as SavedComparison[]);
      setLoading(false);
    });
    return () => { active = false; };
  }, [user.id]);

  async function removeItem(id: number) { await supabase.from("saved_career_markets").delete().eq("id", id).eq("user_id", user.id); setItems(items.filter((item) => item.id !== id)); }
  async function removeComparison(id: number) { await supabase.from("saved_career_comparisons").delete().eq("id", id).eq("user_id", user.id); setComparisons(comparisons.filter((item) => item.id !== id)); }
  async function favorite(item: SavedItem) { const next = !item.favorite; const { error } = await supabase.from("saved_career_markets").update({ favorite: next, updated_at: new Date().toISOString() }).eq("id", item.id).eq("user_id", user.id); if (!error) setItems(items.map((row) => row.id === item.id ? { ...row, favorite: next } : row)); }

  if (loading) return <div className="glass-panel rounded-2xl border p-8">Loading your saved items...</div>;
  const href = (item: SavedItem) => item.item_type === "career" ? `/careers/${item.career_slug}` : item.item_type === "country" ? `/countries/${item.country_slug}` : `/careers/${item.career_slug}?country=${item.country_slug}`;
  const title = (item: SavedItem) => item.item_type === "career" ? names[item.career_slug ?? ""] : item.item_type === "country" ? names[item.country_slug ?? ""] : `${names[item.career_slug ?? ""]} · ${names[item.country_slug ?? ""]}`;
  const kind = (item: SavedItem) => item.item_type === "career_market" ? "Career in a country" : item.item_type === "career" ? "Career" : "Country";

  return <div className="mx-auto max-w-5xl">
    <div><h1 className="text-4xl font-black">Saved</h1><p className="mt-3 text-slate-400">Everything you want to revisit, in one private library.</p></div>
    {message && <div className="mt-5 rounded-xl border border-red-300/20 p-4 text-sm">{message}</div>}
    {items.length || comparisons.length ? <div className="mt-8 grid gap-4 md:grid-cols-2">
      {items.map((item) => <article key={`item-${item.id}`} className="glass-card rounded-2xl border p-5"><div className="flex items-start justify-between gap-3"><div><div className="text-xs font-bold uppercase tracking-wide text-emerald-300">{kind(item)}</div><Link href={href(item)} className="mt-2 block text-lg font-black hover:text-emerald-200">{title(item) || "Saved item"}</Link></div><button onClick={() => favorite(item)} aria-pressed={item.favorite} aria-label={item.favorite ? "Remove from favorites" : "Add to favorites"} className="text-xl text-emerald-200">{item.favorite ? "★" : "☆"}</button></div><div className="mt-5 flex flex-wrap items-center gap-4"><button onClick={() => removeItem(item.id)} className="text-sm font-bold text-slate-400 hover:text-white">Remove</button>{item.item_type === "career_market" && item.career_slug && item.country_slug && <details><summary className="cursor-pointer text-sm font-bold text-slate-400">Alerts</summary><div className="mt-3"><AlertPreferencesControl careerSlug={item.career_slug} countrySlug={item.country_slug} /></div></details>}</div></article>)}
      {comparisons.map((comparison) => <article key={`comparison-${comparison.id}`} className="glass-card rounded-2xl border p-5"><div className="text-xs font-bold uppercase tracking-wide text-emerald-300">Comparison</div><h2 className="mt-2 text-lg font-black">{comparison.name}</h2><div className="mt-5 flex gap-4"><Link href={`/compare?left=${comparison.targets[0]?.countrySlug}&right=${comparison.targets[1]?.countrySlug}`} className="font-bold text-emerald-200">Open</Link><button onClick={() => removeComparison(comparison.id)} className="text-sm font-bold text-slate-400">Remove</button></div></article>)}
    </div> : <div className="glass-subtle mt-8 rounded-2xl border p-10 text-center"><h2 className="text-xl font-black">Nothing saved yet</h2><p className="mt-2 text-slate-400">Save a career or country you want to revisit.</p><Link href="/careers" className="mt-5 inline-block rounded-xl bg-emerald-300 px-5 py-3 font-black text-slate-950">Explore careers</Link></div>}
  </div>;
}
