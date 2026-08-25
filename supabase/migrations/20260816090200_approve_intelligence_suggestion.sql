create or replace function public.approve_intelligence_suggestion(
  p_suggestion_id bigint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_suggestion public.intelligence_suggestions%rowtype;
  v_updated_count integer;
  v_user_id uuid;
  v_role text;
  v_reviewed_at timestamptz := now();
begin
  v_user_id := auth.uid();
  v_role := auth.jwt() -> 'app_metadata' ->> 'role';

  if v_user_id is null then
    raise exception using
      errcode = '42501',
      message = 'Authentication required.';
  end if;

  if v_role is distinct from 'admin' then
    raise exception using
      errcode = '42501',
      message = 'SEKUR admin access required.';
  end if;

  select *
  into v_suggestion
  from public.intelligence_suggestions
  where id = p_suggestion_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'Intelligence suggestion not found.';
  end if;

  if v_suggestion.status is distinct from 'pending' then
    raise exception 'Intelligence suggestion is not pending.';
  end if;

  if v_suggestion.publishable is distinct from true then
    raise exception 'Intelligence suggestion is not publishable.';
  end if;

  if v_suggestion.coverage_percent is null
    or v_suggestion.coverage_percent < 70 then
    raise exception 'Intelligence suggestion evidence coverage is below 70%%.';
  end if;

  if v_suggestion.confidence is null
    or v_suggestion.confidence not in ('high', 'very-high') then
    raise exception 'Intelligence suggestion confidence is not high enough.';
  end if;

  if v_suggestion.suggested_score is null
    or v_suggestion.suggested_score < 0
    or v_suggestion.suggested_score > 100 then
    raise exception 'Intelligence suggestion score must be between 0 and 100.';
  end if;

  if nullif(btrim(v_suggestion.country_slug::text), '') is null
    or nullif(btrim(v_suggestion.factor_key::text), '') is null
    or nullif(btrim(v_suggestion.source_type::text), '') is null
    or nullif(btrim(v_suggestion.source_name::text), '') is null
    or nullif(btrim(v_suggestion.source_url::text), '') is null then
    raise exception 'Intelligence suggestion is missing required publication information.';
  end if;

  update public.country_intelligence_factors
  set
    score = v_suggestion.suggested_score,
    source_type = v_suggestion.source_type,
    source_name = v_suggestion.source_name,
    source_url = v_suggestion.source_url,
    explanation = coalesce(
      nullif(btrim(v_suggestion.reasoning), ''),
      v_suggestion.evidence
    ),
    verified_at = v_reviewed_at,
    updated_at = v_reviewed_at
  where country_slug = v_suggestion.country_slug
    and factor_key = v_suggestion.factor_key;

  get diagnostics v_updated_count = row_count;

  if v_updated_count <> 1 then
    raise exception 'Expected exactly one matching live intelligence factor, updated %.',
      v_updated_count;
  end if;

  update public.intelligence_suggestions
  set
    status = 'approved',
    reviewed_by = v_user_id,
    reviewed_at = v_reviewed_at
  where id = v_suggestion.id;

  return jsonb_build_object(
    'success', true,
    'suggestion_id', v_suggestion.id,
    'country_slug', v_suggestion.country_slug,
    'factor_key', v_suggestion.factor_key,
    'published_score', v_suggestion.suggested_score
  );
end;
$$;

revoke all on function public.approve_intelligence_suggestion(bigint) from public;
revoke all on function public.approve_intelligence_suggestion(bigint) from anon;
grant execute on function public.approve_intelligence_suggestion(bigint) to authenticated;
