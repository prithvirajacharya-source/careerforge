alter table public.career_alert_subscriptions
  alter column active set default false,
  add constraint career_alert_subscriptions_types_check check (
    cardinality(alert_types) between 1 and 5
    and alert_types <@ array[
      'salary_updated',
      'new_verified_data',
      'hiring_outlook_updated',
      'source_freshness_changed',
      'career_score_changed'
    ]::text[]
  );
