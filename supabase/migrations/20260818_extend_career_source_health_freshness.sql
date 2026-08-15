alter table public.career_research_source_health
  add column expected_refresh_days integer check (expected_refresh_days is null or expected_refresh_days > 0),
  add column next_expected_refresh timestamptz,
  add column stale boolean not null default false;
