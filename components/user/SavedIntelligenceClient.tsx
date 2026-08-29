"use client";

import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AlertPreferencesControl from "./AlertPreferencesControl";
import CareerPathArt from "@/components/brand/CareerPathArt";

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

  if (loading) return <div className="border-y border-slate-200 py-8 text-slate-600">Loading your saved items…</div>;
  const href = (item: SavedItem) => item.item_type === "career" ? `/careers/${item.career_slug}` : item.item_type === "country" ? `/countries/${item.country_slug}` : `/careers/${item.career_slug}?country=${item.country_slug}`;
  const title = (item: SavedItem) => item.item_type === "career" ? names[item.career_slug ?? ""] : item.item_type === "country" ? names[item.country_slug ?? ""] : `${names[item.career_slug ?? ""]} · ${names[item.country_slug ?? ""]}`;
  const kind = (item: SavedItem) => item.item_type === "career_market" ? "Career in a country" : item.item_type === "career" ? "Career" : "Country";

  return <div className="mx-auto max-w-5xl">
    <div><p className="product-eyebrow">Your library</p><h1 className="mt-2 text-4xl font-bold">Saved</h1><p className="mt-2 text-slate-600">Career decisions and comparisons you want to revisit.</p></div>
    {message && <div className="status-error mt-5 rounded-lg p-4 text-sm">{message}</div>}
    {items.length || comparisons.length ? <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
      {items.map((item) => <article key={`item-${item.id}`} className="grid gap-3 py-5 sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="text-xs font-bold uppercase tracking-wide text-blue-700">{kind(item)}</div><Link href={href(item)} className="mt-1 block text-lg font-bold hover:text-blue-700">{title(item) || "Saved item"}</Link></div><div className="flex flex-wrap items-center gap-4"><button onClick={() => favorite(item)} aria-pressed={item.favorite} aria-label={item.favorite ? "Remove from favorites" : "Add to favorites"} className="text-xl text-blue-700">{item.favorite ? "★" : "☆"}</button><button onClick={() => removeItem(item.id)} className="text-sm font-semibold text-slate-600 hover:text-red-700">Remove</button>{item.item_type === "career_market" && item.career_slug && item.country_slug && <details><summary className="cursor-pointer text-sm font-semibold text-blue-700">Alerts</summary><div className="mt-3"><AlertPreferencesControl careerSlug={item.career_slug} countrySlug={item.country_slug} /></div></details>}</div></article>)}
      {comparisons.map((comparison) => <article key={`comparison-${comparison.id}`} className="grid gap-3 py-5 sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="text-xs font-bold uppercase tracking-wide text-blue-700">Comparison</div><h2 className="mt-1 text-lg font-bold">{comparison.name}</h2></div><div className="flex gap-4"><Link href={`/compare?left=${comparison.targets[0]?.countrySlug}&right=${comparison.targets[1]?.countrySlug}`} className="font-bold text-blue-700">Open</Link><button onClick={() => removeComparison(comparison.id)} className="text-sm font-semibold text-slate-600 hover:text-red-700">Remove</button></div></article>)}
    </div> : <div className="mt-8 grid gap-8 border-y border-slate-200 py-8 sm:grid-cols-[220px_1fr] sm:items-center"><CareerPathArt variant="compass" className="w-full" /><div><h2 className="text-xl font-bold">Nothing saved yet</h2><p className="mt-2 text-slate-600">Save a career or country you want to revisit.</p><Link href="/careers" className="product-button product-button-primary mt-5">Explore careers</Link></div></div>}
  </div>;
}
