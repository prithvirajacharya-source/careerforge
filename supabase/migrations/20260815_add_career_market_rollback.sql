grant select on table public.career_market_profile_versions to authenticated;

create or replace function public.rollback_career_market_profile(p_version_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_actor uuid := auth.uid();
  v_target public.career_market_profile_versions%rowtype;
  v_live public.career_market_profiles%rowtype;
  v_profile jsonb;
  v_salary jsonb;
  v_before jsonb;
  v_version_id bigint;
  v_now timestamptz := now();
begin
  if v_actor is null then
    raise exception 'Authenticated admin session required';
  end if;
  if coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' then
    raise exception 'SEKUR admin access required';
  end if;

  select * into v_target
  from public.career_market_profile_versions
  where id = p_version_id;
  if not found then raise exception 'Publication version was not found'; end if;

  select * into v_live
  from public.career_market_profiles
  where career_slug = v_target.career_slug
    and country_slug = v_target.country_slug
  for update;
  if not found then raise exception 'Live career market profile was not found'; end if;

  v_profile := v_target.after_profile;
  v_salary := v_profile -> 'salary';
  if v_profile ->> 'careerSlug' <> v_target.career_slug
    or v_profile ->> 'countrySlug' <> v_target.country_slug
    or v_salary is null then
    raise exception 'Publication version target or schema is invalid';
  end if;
  if coalesce(v_salary ->> 'sourceCurrency', '') = ''
    or coalesce(v_salary ->> 'geography', '') = ''
    or coalesce(v_salary ->> 'sourceName', '') = ''
    or coalesce(v_salary ->> 'sourceUrl', '') = ''
    or coalesce(v_salary ->> 'observationDate', '') = ''
    or v_salary -> 'methodology' is null then
    raise exception 'Publication version lacks required salary provenance';
  end if;
  if v_live.native_currency <> v_salary ->> 'sourceCurrency' then
    raise exception 'Rollback cannot change the native market currency';
  end if;
  if v_live.published_from_run_id = v_target.source_run_id
    and v_live.salary_low is not distinct from nullif(v_salary ->> 'low', '')::numeric
    and v_live.salary_typical is not distinct from nullif(v_salary ->> 'typical', '')::numeric
    and v_live.salary_high is not distinct from nullif(v_salary ->> 'high', '')::numeric then
    raise exception 'Selected version is already live';
  end if;

  v_before := to_jsonb(v_live);

  insert into public.career_market_profile_versions (
    career_slug, country_slug, event_type, before_profile, after_profile,
    source_run_id, published_by, published_at
  ) values (
    v_target.career_slug, v_target.country_slug, 'rollback', v_before, v_profile,
    v_target.source_run_id, v_actor, v_now
  ) returning id into v_version_id;

  update public.career_market_profiles set
    native_currency = v_salary ->> 'sourceCurrency',
    salary_low = nullif(v_salary ->> 'low', '')::numeric,
    salary_typical = nullif(v_salary ->> 'typical', '')::numeric,
    salary_high = nullif(v_salary ->> 'high', '')::numeric,
    salary_methodology = v_salary -> 'methodology',
    salary_geography = v_salary ->> 'geography',
    observation_period = v_salary ->> 'observationDate',
    source_name = v_salary ->> 'sourceName',
    source_url = v_salary ->> 'sourceUrl',
    verification_status = v_salary ->> 'verificationStatus',
    researched_at = coalesce((v_profile ->> 'researchedAt')::timestamptz, researched_at),
    hiring_outlook = coalesce(v_profile -> 'hiringOutlook', '{"value":null,"provenance":null}'::jsonb),
    demand = coalesce(v_profile -> 'demand', '{"value":null,"provenance":null}'::jsonb),
    employment_risk = coalesce(v_profile -> 'employmentRisk', '{"value":null,"provenance":null}'::jsonb),
    education = v_profile -> 'education',
    metric_provenance = jsonb_build_object(
      'low', jsonb_build_object('value', v_salary -> 'low', 'sourceName', v_salary ->> 'sourceName', 'sourceUrl', v_salary ->> 'sourceUrl'),
      'typical', jsonb_build_object('value', v_salary -> 'typical', 'sourceName', v_salary ->> 'sourceName', 'sourceUrl', v_salary ->> 'sourceUrl'),
      'high', jsonb_build_object('value', v_salary -> 'high', 'sourceName', v_salary ->> 'sourceName', 'sourceUrl', v_salary ->> 'sourceUrl')
    ),
    notes = coalesce(v_profile -> 'notes', '[]'::jsonb),
    published_from_run_id = v_target.source_run_id,
    published_by = v_actor,
    published_at = v_now,
    updated_at = v_now
  where id = v_live.id;

  return jsonb_build_object(
    'versionId', v_version_id,
    'rolledBackToVersionId', v_target.id,
    'careerSlug', v_target.career_slug,
    'countrySlug', v_target.country_slug,
    'rolledBackAt', v_now,
    'rolledBackBy', v_actor
  );
end;
$$;

revoke all on function public.rollback_career_market_profile(bigint) from public, anon;
grant execute on function public.rollback_career_market_profile(bigint) to authenticated;
