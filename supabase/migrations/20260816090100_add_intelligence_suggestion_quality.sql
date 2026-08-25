alter table public.intelligence_suggestions
  add column if not exists coverage_percent integer,
  add column if not exists confidence text,
  add column if not exists methodology_version text,
  add column if not exists benchmark_version text,
  add column if not exists publishable boolean not null default false;

alter table public.intelligence_suggestions
  drop constraint if exists intelligence_suggestions_coverage_percent_check;

alter table public.intelligence_suggestions
  add constraint intelligence_suggestions_coverage_percent_check
  check (
    coverage_percent is null
    or coverage_percent between 0 and 100
  );

alter table public.intelligence_suggestions
  drop constraint if exists intelligence_suggestions_confidence_check;

alter table public.intelligence_suggestions
  add constraint intelligence_suggestions_confidence_check
  check (
    confidence is null
    or confidence in (
      'very-high',
      'high',
      'medium',
      'low',
      'insufficient'
    )
  );
