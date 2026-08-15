"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { UserCareerProfile } from "@/lib/personalization/model";
import { normalizeStringList, validateUserCareerProfile } from "@/lib/personalization/validation";

const emptyProfile: UserCareerProfile = { currentCountry: null, targetCountries: [], currentCareer: null, yearsExperience: null, educationLevel: null, skills: [], desiredSalary: null, desiredSalaryCurrency: null, remotePreference: "neutral", relocationWillingness: "maybe", careerGoals: null };

export default function ProfileClient({ user, careers, countries }: { user: User; careers: Array<{ slug: string; title: string }>; countries: Array<{ slug: string; name: string; currency: string }> }) {
  const [profile, setProfile] = useState(emptyProfile);
  const [skillsText, setSkillsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.from("user_career_profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data, error }) => {
      if (error) setMessage(error.message);
      if (data) {
        const loaded: UserCareerProfile = { currentCountry: data.current_country, targetCountries: data.target_countries ?? [], currentCareer: data.current_career, yearsExperience: data.years_experience, educationLevel: data.education_level, skills: data.skills ?? [], desiredSalary: data.desired_salary, desiredSalaryCurrency: data.desired_salary_currency, remotePreference: data.remote_preference, relocationWillingness: data.relocation_willingness, careerGoals: data.career_goals };
        setProfile(loaded); setSkillsText(loaded.skills.join(", "));
      }
      setLoading(false);
    });
  }, [user.id]);

  async function save() {
    setSaving(true); setMessage("");
    try {
      const next = validateUserCareerProfile({ ...profile, skills: normalizeStringList(skillsText.split(","), 100) });
      const { error } = await supabase.from("user_career_profiles").upsert({ user_id: user.id, current_country: next.currentCountry, target_countries: next.targetCountries, current_career: next.currentCareer, years_experience: next.yearsExperience, education_level: next.educationLevel, skills: next.skills, desired_salary: next.desiredSalary, desired_salary_currency: next.desiredSalaryCurrency, remote_preference: next.remotePreference, relocation_willingness: next.relocationWillingness, career_goals: next.careerGoals, updated_at: new Date().toISOString() });
      if (error) throw error;
      setProfile(next); setMessage("Profile saved securely.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save profile."); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="glass-panel rounded-2xl border p-8 text-slate-300">Loading your profile...</div>;
  const field = "glass-control mt-2 w-full rounded-xl px-4 py-3 text-white";
  return <section className="glass-panel mx-auto max-w-4xl rounded-3xl border p-6 sm:p-8">
    <h1 className="text-3xl font-black">Tell SEKUR about yourself</h1>
    <p className="mt-3 max-w-2xl leading-7 text-slate-400">A little context helps SEKUR make career intelligence more relevant to you. Your details stay private.</p>
    <div className="mt-8 space-y-8">
      <fieldset><legend className="text-lg font-black">Current situation</legend><div className="mt-4 grid gap-5 sm:grid-cols-2"><label className="text-sm font-bold text-slate-300">Current country<select value={profile.currentCountry ?? ""} onChange={(e) => setProfile({ ...profile, currentCountry: e.target.value || null })} className={field}><option value="">Not selected</option>{countries.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label><label className="text-sm font-bold text-slate-300">Current career<select value={profile.currentCareer ?? ""} onChange={(e) => setProfile({ ...profile, currentCareer: e.target.value || null })} className={field}><option value="">Not selected</option>{careers.map(c => <option key={c.slug} value={c.slug}>{c.title}</option>)}</select></label></div></fieldset>
      <fieldset><legend className="text-lg font-black">Experience and skills</legend><div className="mt-4 grid gap-5 sm:grid-cols-2"><label className="text-sm font-bold text-slate-300">Years of experience<input type="number" min="0" max="80" value={profile.yearsExperience ?? ""} onChange={(e) => setProfile({ ...profile, yearsExperience: e.target.value ? Number(e.target.value) : null })} className={field} /></label><label className="text-sm font-bold text-slate-300">Education level<input value={profile.educationLevel ?? ""} onChange={(e) => setProfile({ ...profile, educationLevel: e.target.value || null })} placeholder="e.g. Bachelor's degree" className={field} /></label><label className="text-sm font-bold text-slate-300 sm:col-span-2">Skills<input value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="e.g. CAD, Python, project management" className={field} /></label></div></fieldset>
      <fieldset><legend className="text-lg font-black">Goals</legend><div className="mt-4 grid gap-5 sm:grid-cols-2"><fieldset className="sm:col-span-2"><legend className="text-sm font-bold text-slate-300">Countries you are considering</legend><div className="mt-3 grid gap-2 sm:grid-cols-3">{countries.map(country => <label key={country.slug} className="glass-subtle flex items-center gap-3 rounded-xl border p-3 text-sm"><input type="checkbox" checked={profile.targetCountries.includes(country.slug)} onChange={(e) => setProfile({ ...profile, targetCountries: e.target.checked ? [...profile.targetCountries, country.slug] : profile.targetCountries.filter(slug => slug !== country.slug) })} />{country.name}</label>)}</div></fieldset><label className="text-sm font-bold text-slate-300 sm:col-span-2">What are you working toward?<textarea rows={4} maxLength={2000} value={profile.careerGoals ?? ""} onChange={(e) => setProfile({ ...profile, careerGoals: e.target.value || null })} className={field} /></label></div></fieldset>
      <details className="rounded-2xl border border-white/10 p-5"><summary className="cursor-pointer font-bold">Optional preferences</summary><div className="mt-5 grid gap-5 sm:grid-cols-2"><label className="text-sm font-bold text-slate-300">Desired annual salary<input type="number" min="0" value={profile.desiredSalary ?? ""} onChange={(e) => setProfile({ ...profile, desiredSalary: e.target.value ? Number(e.target.value) : null })} className={field} /></label><label className="text-sm font-bold text-slate-300">Salary currency<select value={profile.desiredSalaryCurrency ?? ""} onChange={(e) => setProfile({ ...profile, desiredSalaryCurrency: e.target.value || null })} className={field}><option value="">Select currency</option>{[...new Set(countries.map(c => c.currency))].map(currency => <option key={currency}>{currency}</option>)}</select></label><label className="text-sm font-bold text-slate-300">Remote work<select value={profile.remotePreference} onChange={(e) => setProfile({ ...profile, remotePreference: e.target.value as UserCareerProfile["remotePreference"] })} className={field}><option value="required">Required</option><option value="preferred">Preferred</option><option value="neutral">No preference</option></select></label><label className="text-sm font-bold text-slate-300">Open to relocating?<select value={profile.relocationWillingness} onChange={(e) => setProfile({ ...profile, relocationWillingness: e.target.value as UserCareerProfile["relocationWillingness"] })} className={field}><option value="yes">Yes</option><option value="maybe">Maybe</option><option value="no">No</option></select></label></div></details>
    </div>
    {message && <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-slate-300">{message}</div>}
    <div className="mt-6 flex flex-wrap items-center gap-5"><button type="button" onClick={save} disabled={saving} className="rounded-xl bg-emerald-300 px-6 py-3 font-black text-slate-950 disabled:opacity-50">{saving ? "Saving..." : "Save my profile"}</button><button type="button" onClick={() => supabase.auth.signOut()} className="text-sm font-bold text-slate-400">Sign out</button></div>
  </section>;
}
