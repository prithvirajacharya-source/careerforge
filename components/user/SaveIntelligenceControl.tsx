"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { trackMonetizationEvent } from "@/lib/personalization/analytics";

type SaveTarget = { itemType: "career" | "country" | "career_market"; careerSlug?: string; countrySlug?: string; label?: string };

export default function SaveIntelligenceControl({ itemType, careerSlug, countrySlug, label = "Save" }: SaveTarget) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      let query = supabase.from("saved_career_markets").select("id").eq("user_id", data.user.id).eq("item_type", itemType);
      query = careerSlug ? query.eq("career_slug", careerSlug) : query.is("career_slug", null);
      query = countrySlug ? query.eq("country_slug", countrySlug) : query.is("country_slug", null);
      const { data: row, error } = await query.maybeSingle();
      if (error) {
        setMessage("Saved status is temporarily unavailable.");
        return;
      }
      setSavedId(row?.id ?? null);
      if (new URLSearchParams(window.location.search).get("save") === "ready") {
        setMessage(row ? "Already saved." : `Signed in. Select ${label} to finish.`);
      }
    });
  }, [careerSlug, countrySlug, itemType, label]);

  if (!userId) return <button type="button" onClick={() => { const returnUrl = new URL(window.location.href); returnUrl.searchParams.set("save", "ready"); router.push(`/profile?returnTo=${encodeURIComponent(`${returnUrl.pathname}${returnUrl.search}`)}`); }} className="product-button product-button-secondary text-xs">Sign in to save</button>;
  async function toggle() {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      if (savedId) {
        const { error } = await supabase.from("saved_career_markets").delete().eq("id", savedId).eq("user_id", userId);
        if (error) throw error;
        setSavedId(null);
      } else {
        const { data, error } = await supabase.from("saved_career_markets").insert({ user_id: userId, item_type: itemType, career_slug: careerSlug ?? null, country_slug: countrySlug ?? null }).select("id").single();
        if (error) throw error;
        setSavedId(data.id);
        trackMonetizationEvent("save_created", { itemType, careerSlug: careerSlug ?? "", countrySlug: countrySlug ?? "" });
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update saved intelligence.");
    } finally {
      setBusy(false);
    }
  }
  return <div><button type="button" onClick={toggle} disabled={busy} aria-pressed={Boolean(savedId)} className={`product-button text-xs ${savedId ? "border border-green-200 bg-green-50 text-green-800" : "product-button-secondary"}`}>{savedId ? "Saved" : label}</button>{message && <p role="status" className="mt-2 max-w-72 text-xs text-slate-600">{message}</p>}</div>;
}
