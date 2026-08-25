revoke all privileges on table public.career_market_profiles from anon, authenticated;

grant select (
  career_slug,
  country_slug,
  native_currency,
  salary_low,
  salary_typical,
  salary_high,
  salary_methodology,
  salary_geography,
  observation_period,
  source_name,
  source_url,
  verification_status,
  hiring_outlook,
  demand,
  employment_risk,
  education,
  notes
) on table public.career_market_profiles to anon, authenticated;

alter policy "Published career market profiles are publicly readable"
  on public.career_market_profiles
  using (
    published_at is not null
    and published_from_run_id is not null
  );

revoke all privileges on table public.career_market_profile_versions from anon;
