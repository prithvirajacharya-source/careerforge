alter table public.career_research_runs
  drop constraint if exists career_research_runs_status_check;

alter table public.career_research_runs
  add constraint career_research_runs_status_check
  check (status in ('pending_review', 'approved', 'rejected', 'failed'));

drop policy if exists "Admins can review career research runs"
  on public.career_research_runs;

create policy "Admins can review pending career research runs"
  on public.career_research_runs for update to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    and status = 'pending_review'
  )
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    and status in ('approved', 'rejected')
    and reviewed_by = auth.uid()
    and reviewed_at is not null
  );

create or replace function public.protect_career_research_run_review()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if old.status <> 'pending_review' then
    raise exception 'Career research run has already been reviewed';
  end if;

  if new.status not in ('approved', 'rejected') then
    raise exception 'Career research review must approve or reject the run';
  end if;

  if new.reviewed_by is null or new.reviewed_at is null then
    raise exception 'Career research review audit metadata is required';
  end if;

  if new.id is distinct from old.id
    or new.career_slug is distinct from old.career_slug
    or new.country_slug is distinct from old.country_slug
    or new.schema_version is distinct from old.schema_version
    or new.candidate_profile is distinct from old.candidate_profile
    or new.live_profile_snapshot is distinct from old.live_profile_snapshot
    or new.source_name is distinct from old.source_name
    or new.source_url is distinct from old.source_url
    or new.researched_at is distinct from old.researched_at
    or new.created_by is distinct from old.created_by
    or new.created_at is distinct from old.created_at then
    raise exception 'Career research evidence and history are immutable';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_career_research_run_review
  on public.career_research_runs;

create trigger protect_career_research_run_review
before update on public.career_research_runs
for each row execute function public.protect_career_research_run_review();

comment on function public.protect_career_research_run_review() is
  'Allows exactly one pending-to-approved/rejected review transition while keeping research evidence immutable.';
