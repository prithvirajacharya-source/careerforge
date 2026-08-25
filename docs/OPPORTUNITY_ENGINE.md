# SEKUR Personal Opportunity Engine

The engine ranks bounded country-and-career combinations using only available SEKUR evidence. It is deterministic and does not predict employment or immigration outcomes.

## Unified score version 1.1

`lib/scoring` is the reusable scoring kernel for reports, comparisons and future recomputation. Every component carries evidence text and optional provenance independently from its normalized value. Results include `scoreVersion: "1.1"`, weighted evidence coverage and confidence so stored private report snapshots can be reproduced or intentionally recomputed after a methodology change without a schema migration.

Version 1.1 preserves the v1.0 weights and missing-evidence rules. It adds published, provenance-bearing language and work-authorization evidence to their existing dimensions when available. Without that evidence, those components remain unavailable and v1.0 behavior is preserved.

## Candidate generation

The pool starts with the selected/current career and up to five adjacent careers derived from shared skills, career category and SEKUR related-career metadata. It intersects these with requested countries and existing career-country profiles, caps the internal pool at 40 and returns at most 10 recommendations.

## Factors and base weights

Career fit 16%, country fit 8%, job-market demand 12%, salary potential 10%, cost-of-living efficiency 8%, visa/relocation feasibility 8%, Safety 8%, skills match 12%, experience match 6%, education match 6%, language fit 3%, long-term growth 3%.

Unavailable evidence remains `null`. Unsupported live-job coverage is not treated as zero. Salary potential is calculated only for a verified annual salary and a same-currency user goal. Country factors come only from current published intelligence rows. Experience, education and language scores remain unavailable until comparable requirements exist; the engine never infers them from a title. Job-level requirements may be extracted only from an actual posting description.

## Missing data, coverage and confidence

Coverage is the sum of base weights backed by evidence. Available weights are normalized for calculation, but the result receives a coverage penalty (`0.75 + 0.25 × coverage`) so sparse favorable evidence cannot silently dominate complete candidates. Below 40% coverage no numeric score is returned.

Confidence: 75–100 high, 50–74 medium, 40–49 low, below 40 insufficient.

## Personalization

Profile career, explicitly supplied skills, country preferences, same-currency salary goal and remote preference may be used. Sensitive attributes are neither accepted nor scored. Without meaningful profile evidence, output is labeled a general market recommendation.

## Job evidence

Only trusted configured providers participate. Sweden uses cached JobTech searches. At most four career searches are issued per recommendation request, each sampling eight jobs. Aggregate match is the median of defensible deterministic job matches. Provider failure makes job evidence unavailable.

## Limitations and future work

Live coverage currently favors Sweden, but missing coverage never becomes a zero score. Only careers with verified country-market profiles can rank. Future work may add trusted providers, official residency evidence, alerts, score histories and advanced comparisons without changing the core evidence contract.
