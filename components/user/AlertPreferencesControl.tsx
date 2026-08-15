"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ALERT_TYPES, type AlertType, validateAlertPreferences } from "@/lib/personalization/alerts";
import { resolveEntitlements } from "@/lib/personalization/entitlements";
import { trackMonetizationEvent } from "@/lib/personalization/analytics";

const labels: Record<AlertType, string> = { salary_updated: "Salary updates", new_verified_data: "New verified evidence", hiring_outlook_updated: "Hiring/outlook updates", source_freshness_changed: "Source freshness changes", career_score_changed: "Career score changes" };

export default function AlertPreferencesControl({ careerSlug, countrySlug }: { careerSlug: string; countrySlug: string }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [allowed, setAllowed] = useState(false);
  const [active, setActive] = useState(false);
  const [types, setTypes] = useState<AlertType[]>(["salary_updated", "new_verified_data"]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => { supabase.auth.getUser().then(async ({ data }) => {
    if (!data.user) return;
    setUserId(data.user.id);
    const [subscription, entitlement] = await Promise.all([
      supabase.from("career_alert_subscriptions").select("active,alert_types").eq("user_id", data.user.id).eq("career_slug", careerSlug).eq("country_slug", countrySlug).maybeSingle(),
      supabase.from("user_entitlements").select("plan_key,feature_overrides,valid_until").eq("user_id", data.user.id).maybeSingle(),
    ]);
    if (subscription.data) { setActive(subscription.data.active); setTypes(subscription.data.alert_types as AlertType[]); }
    const plan = entitlement.data?.valid_until && new Date(entitlement.data.valid_until) < new Date() ? "free" : entitlement.data?.plan_key;
    setAllowed(resolveEntitlements(plan, entitlement.data?.feature_overrides ?? {}).alerts);
  }); }, [careerSlug, countrySlug]);
  if (!userId) return <Link href="/profile" className="rounded-lg border border-white/15 px-3 py-2 text-xs font-bold">Sign in for alerts</Link>;
  if (!allowed) return <Link href="/pro" onClick={() => trackMonetizationEvent("pro_feature_viewed", { feature: "alerts", route: "career-market" })} className="rounded-lg border border-amber-300/20 px-3 py-2 text-xs font-bold text-amber-100">Alerts · Requires Pro</Link>;
  async function save(nextActive = active) {
    try {
      const validated = validateAlertPreferences(types);
      const { error } = await supabase.from("career_alert_subscriptions").upsert({ user_id: userId, career_slug: careerSlug, country_slug: countrySlug, alert_types: validated, active: nextActive }, { onConflict: "user_id,career_slug,country_slug" });
      if (error) throw error;
      setActive(nextActive); setMessage(nextActive ? "Alert preferences saved. No notifications are sent yet." : "Alerts are off.");
      if (nextActive) trackMonetizationEvent("alert_enabled", { careerSlug, countrySlug });
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save alerts."); }
  }
  return <div className="relative"><button type="button" onClick={() => setOpen(!open)} className={`rounded-lg border px-3 py-2 text-xs font-bold ${active ? "border-emerald-300/30 text-emerald-200" : "border-white/15"}`}>{active ? "Alerts on" : "Configure alerts"}</button>{open && <div className="glass-panel absolute left-0 z-20 mt-2 w-72 rounded-2xl border p-4 shadow-xl"><div className="font-black">Alert preferences</div><p className="mt-1 text-xs text-slate-400">Stored for future delivery. No email, SMS or push is sent.</p><div className="mt-3 space-y-2">{ALERT_TYPES.map(type => <label key={type} className="flex gap-2 text-xs"><input type="checkbox" checked={types.includes(type)} onChange={event => setTypes(event.target.checked ? [...types, type] : types.filter(item => item !== type))} />{labels[type]}</label>)}</div><div className="mt-4 flex gap-2"><button type="button" onClick={() => save(true)} className="rounded-lg bg-emerald-300 px-3 py-2 text-xs font-black text-slate-950">Enable</button><button type="button" onClick={() => save(false)} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-bold">Turn off</button></div>{message && <p className="mt-3 text-xs text-slate-400">{message}</p>}</div>}</div>;
}
