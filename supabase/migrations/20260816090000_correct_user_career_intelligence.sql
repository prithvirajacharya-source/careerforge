alter table public.saved_career_markets
  add column item_type text not null default 'career_market'
  check (item_type in ('career', 'country', 'career_market'));

alter table public.saved_career_markets
  alter column career_slug drop not null,
  alter column country_slug drop not null;

alter table public.saved_career_markets
  add constraint saved_career_markets_shape_check check (
    (item_type = 'career' and career_slug is not null and country_slug is null)
    or (item_type = 'country' and career_slug is null and country_slug is not null)
    or (item_type = 'career_market' and career_slug is not null and country_slug is not null)
  );

alter table public.saved_career_markets
  drop constraint saved_career_markets_user_id_career_slug_country_slug_key;

create unique index saved_career_markets_user_target_uidx
  on public.saved_career_markets (
    user_id,
    item_type,
    coalesce(career_slug, ''),
    coalesce(country_slug, '')
  );

alter table public.user_career_profiles
  add constraint user_career_profiles_salary_currency_check check (
    desired_salary is null
    or (desired_salary_currency is not null and desired_salary_currency ~ '^[A-Z]{3}$')
  ),
  add constraint user_career_profiles_target_country_count_check
    check (cardinality(target_countries) <= 25),
  add constraint user_career_profiles_skills_count_check
    check (cardinality(skills) <= 100);

alter table public.saved_career_comparisons
  add column comparison_key text;

update public.saved_career_comparisons
  set comparison_key = 'legacy:' || id::text
  where comparison_key is null;

alter table public.saved_career_comparisons
  alter column comparison_key set not null,
  add constraint saved_career_comparisons_targets_count_check check (
    jsonb_array_length(targets) between 2 and 10
  );

create unique index saved_career_comparisons_user_key_uidx
  on public.saved_career_comparisons (user_id, comparison_key);

alter table public.career_opportunity_reports
  add constraint career_opportunity_reports_input_object_check
    check (jsonb_typeof(input_snapshot) = 'object'),
  add constraint career_opportunity_reports_output_object_check
    check (output_snapshot is null or jsonb_typeof(output_snapshot) = 'object');
