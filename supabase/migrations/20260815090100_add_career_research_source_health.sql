create table public.career_research_source_health (
  source_key text primary key,
  source_system text not null,
  source_url text not null,
  status text not null check (status in ('healthy', 'degraded', 'failing', 'unknown')),
  last_successful_fetch timestamptz,
  last_failure timestamptz,
  last_failure_reason text,
  consecutive_failures integer not null default 0 check (consecutive_failures >= 0),
  format_drift_detected boolean not null default false,
  checked_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.career_research_source_health enable row level security;

create policy "Admins can read career research source health"
  on public.career_research_source_health for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can insert career research source health"
  on public.career_research_source_health for insert
  to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update career research source health"
  on public.career_research_source_health for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

revoke all privileges on table public.career_research_source_health from public, anon;
grant select, insert, update on table public.career_research_source_health to authenticated;

create index career_research_source_health_status_idx
  on public.career_research_source_health (status, checked_at desc);
