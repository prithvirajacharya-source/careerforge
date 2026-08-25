create or replace function public.publish_career_market_research(
  p_run_id bigint,
  p_fallback_live_profile jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_actor uuid := auth.uid();
  v_run public.career_research_runs%rowtype;
  v_live public.career_market_profiles%rowtype;
  v_candidate jsonb;
  v_salary jsonb;
  v_low numeric;
  v_typical numeric;
  v_high numeric;
  v_before jsonb;
  v_after jsonb;
  v_version_id bigint;
  v_now timestamptz := now();
begin
  if v_actor is null then
    raise exception 'Authenticated admin session required';
  end if;

  if coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' then
    raise exception 'SEKUR admin access required';
  end if;

  select * into v_run
  from public.career_research_runs
  where id = p_run_id
  for update;

  if not found then raise exception 'Career research run was not found'; end if;
  if v_run.status <> 'approved' then
    raise exception 'Only approved career research runs may be published';
  end if;
  if v_run.published_at is not null or v_run.publication_version_id is not null then
    raise exception 'Career research run has already been published';
  end if;
  if v_run.country_slug <> 'sweden'
    or v_run.career_slug not in (
      'mechanical-engineer',
      'cybersecurity-analyst',
      'software-engineer',
      'electrical-engineer',
      'data-scientist',
      'registered-nurse',
      'accountant'
    ) then
    raise exception 'Publishing v1.1 supports only enabled Swedish career research targets';
  end if;

  v_candidate := v_run.candidate_profile;
  v_salary := v_candidate -> 'salary';

  if v_candidate ->> 'schemaVersion' <> 'career-research-v1'
    or v_candidate ->> 'careerSlug' <> v_run.career_slug
    or v_candidate ->> 'countrySlug' <> v_run.country_slug then
    raise exception 'Candidate schema or target does not match the approved run';
  end if;
  if v_salary ->> 'sourceCurrency' <> 'SEK' then
    raise exception 'Candidate native currency must be SEK for Sweden';
  end if;

  if jsonb_typeof(v_salary #> '{low,value}') not in ('number', 'null')
    or jsonb_typeof(v_salary #> '{typical,value}') not in ('number', 'null')
    or jsonb_typeof(v_salary #> '{high,value}') not in ('number', 'null') then
    raise exception 'Salary values must be numeric or null';
  end if;

  v_low := nullif(v_salary #>> '{low,value}', '')::numeric;
  v_typical := nullif(v_salary #>> '{typical,value}', '')::numeric;
  v_high := nullif(v_salary #>> '{high,value}', '')::numeric;

  if coalesce(v_low, 0) < 0 or coalesce(v_typical, 0) < 0 or coalesce(v_high, 0) < 0
    or (v_low is not null and v_typical is not null and v_low > v_typical)
    or (v_typical is not null and v_high is not null and v_typical > v_high) then
    raise exception 'Candidate salary values are invalid or incorrectly ordered';
  end if;

  if (v_low is not null and coalesce(v_salary #>> '{low,provenance,sourceName}', '') = '')
    or (v_low is not null and coalesce(v_salary #>> '{low,provenance,sourceUrl}', '') = '')
    or (v_typical is not null and coalesce(v_salary #>> '{typical,provenance,sourceName}', '') = '')
    or (v_typical is not null and coalesce(v_salary #>> '{typical,provenance,sourceUrl}', '') = '')
    or (v_high is not null and coalesce(v_salary #>> '{high,provenance,sourceName}', '') = '')
    or (v_high is not null and coalesce(v_salary #>> '{high,provenance,sourceUrl}', '') = '') then
    raise exception 'Every populated salary metric requires provenance';
  end if;

  if coalesce(v_salary #>> '{typical,provenance,sourceName}', '') = ''
    or coalesce(v_salary #>> '{typical,provenance,sourceUrl}', '') = ''
    or coalesce(v_salary #>> '{typical,provenance,geography}', '') = ''
    or coalesce(v_salary #>> '{typical,provenance,observationPeriod}', '') = ''
    or v_salary -> 'methodology' is null
    or coalesce(v_salary ->> 'verificationStatus', '') = '' then
    raise exception 'Candidate salary source, geography, period, methodology and verification are required';
  end if;

  select * into v_live
  from public.career_market_profiles
  where career_slug = v_run.career_slug and country_slug = v_run.country_slug
  for update;

  v_before := case when found then to_jsonb(v_live) else p_fallback_live_profile end;
  if v_before is null then raise exception 'Current live profile snapshot is required'; end if;

  v_after := jsonb_build_object(
    'careerSlug', v_run.career_slug,
    'countrySlug', v_run.country_slug,
    'salary', jsonb_build_object(
      'low', v_low, 'typical', v_typical, 'high', v_high,
      'sourceCurrency', v_salary ->> 'sourceCurrency',
      'geography', v_salary #>> '{typical,provenance,geography}',
      'sourceName', v_salary #>> '{typical,provenance,sourceName}',
      'sourceUrl', v_salary #>> '{typical,provenance,sourceUrl}',
      'observationDate', v_salary #>> '{typical,provenance,observationPeriod}',
      'methodology', v_salary -> 'methodology',
      'verificationStatus', v_salary ->> 'verificationStatus'
    ),
    'hiringOutlook', v_candidate -> 'hiringOutlook',
    'demand', v_candidate -> 'demand',
    'employmentRisk', v_candidate -> 'employmentRisk',
    'education', v_candidate -> 'education',
    'notes', v_candidate -> 'notes',
    'researchedAt', v_candidate ->> 'researchedAt'
  );

  insert into public.career_market_profile_versions (
    career_slug, country_slug, event_type, before_profile, after_profile,
    source_run_id, published_by, published_at
  ) values (
    v_run.career_slug, v_run.country_slug, 'publish', v_before, v_after,
    v_run.id, v_actor, v_now
  ) returning id into v_version_id;

  insert into public.career_market_profiles (
    career_slug, country_slug, native_currency,
    salary_low, salary_typical, salary_high, salary_methodology,
    salary_geography, observation_period, source_name, source_url,
    verification_status, researched_at, hiring_outlook, demand,
    employment_risk, education, metric_provenance, notes,
    published_from_run_id, published_by, published_at, updated_at
  ) values (
    v_run.career_slug, v_run.country_slug, v_salary ->> 'sourceCurrency',
    v_low, v_typical, v_high, v_salary -> 'methodology',
    v_salary #>> '{typical,provenance,geography}',
    v_salary #>> '{typical,provenance,observationPeriod}',
    v_salary #>> '{typical,provenance,sourceName}',
    v_salary #>> '{typical,provenance,sourceUrl}',
    v_salary ->> 'verificationStatus',
    (v_candidate ->> 'researchedAt')::timestamptz,
    v_candidate -> 'hiringOutlook', v_candidate -> 'demand',
    v_candidate -> 'employmentRisk', v_candidate -> 'education',
    jsonb_build_object('low', v_salary -> 'low', 'typical', v_salary -> 'typical', 'high', v_salary -> 'high'),
    coalesce(v_candidate -> 'notes', '[]'::jsonb),
    v_run.id, v_actor, v_now, v_now
  )
  on conflict (career_slug, country_slug) do update set
    native_currency = excluded.native_currency,
    salary_low = excluded.salary_low,
    salary_typical = excluded.salary_typical,
    salary_high = excluded.salary_high,
    salary_methodology = excluded.salary_methodology,
    salary_geography = excluded.salary_geography,
    observation_period = excluded.observation_period,
    source_name = excluded.source_name,
    source_url = excluded.source_url,
    verification_status = excluded.verification_status,
    researched_at = excluded.researched_at,
    hiring_outlook = excluded.hiring_outlook,
    demand = excluded.demand,
    employment_risk = excluded.employment_risk,
    education = excluded.education,
    metric_provenance = excluded.metric_provenance,
    notes = excluded.notes,
    published_from_run_id = excluded.published_from_run_id,
    published_by = excluded.published_by,
    published_at = excluded.published_at,
    updated_at = excluded.updated_at;

  update public.career_research_runs set
    published_at = v_now,
    published_by = v_actor,
    publication_version_id = v_version_id,
    updated_at = v_now
  where id = v_run.id;

  return jsonb_build_object(
    'versionId', v_version_id,
    'publishedAt', v_now,
    'publishedBy', v_actor,
    'before', v_before,
    'after', v_after
  );
end;
$$;

revoke all on function public.publish_career_market_research(bigint, jsonb) from public;
grant execute on function public.publish_career_market_research(bigint, jsonb) to authenticated;

comment on function public.publish_career_market_research(bigint, jsonb) is
  'Atomically validates and publishes an approved supported Sweden career research run with append-only version history.';
