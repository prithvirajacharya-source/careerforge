# United Kingdom ASHE collector evidence

- Official dataset: Office for National Statistics, Annual Survey of Hours and Earnings (ASHE), Table 14.
- Release: 2025 provisional, released 23 October 2025.
- Classification: Standard Occupational Classification 2020, four-digit unit groups.
- Workbook: Table 14.7a, `Annual pay - Gross`.
- Population: full-time employee jobs, all sexes, United Kingdom national geography. ASHE excludes self-employed workers. Full-time means more than 30 paid hours per week, or at least 25 hours for teaching professions.
- Metrics: 10th percentile (low), median (typical), and 90th percentile (high), retained as annual GBP. No period conversion is applied.
- Suppression: ONS `x`, `..`, `:`, and `-` markers remain unavailable (`null`) and never receive provenance.
- Cadence: annual, with a 365-day expected refresh interval.
- Reuse: ONS content is available under the Open Government Licence v3.0 unless otherwise stated; source attribution is retained in every metric.
- Release page: https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/datasets/occupation4digitsoc2010ashetable14

Enabled mappings:

| SEKUR career | SOC 2020 | Official unit group |
| --- | --- | --- |
| Mechanical Engineer | 2122 | Mechanical engineers |
| Registered Nurse | 2237 | Other registered nursing professionals |
| Software Engineer | 2134 | Programmers and software development professionals |
| Electrical Engineer | 2123 | Electrical engineers |
| Accountant | 2421 | Chartered and certified accountants |
| Cybersecurity Analyst | 2135 | Cyber security professionals |

Data Scientist remains disabled because the current four-digit classification does not provide an exact, defensible unit group for the SEKUR career. UK publishing remains disabled.

Scotland is not inferred from UK national evidence. ASHE Table 15 exposes regional four-digit occupation data, but its distinct workbook schema, sampling quality, and suppression coverage require separate validation before Scotland can be automated.

Netherlands remains in discovery. CBS StatLine 85517NED provides national median hourly wages for 114 BRC 2014 groups, of which only 74 are published, but does not provide a lower/upper distribution and is too broad for several SEKUR careers. UWV occupation data supports labour-demand analysis rather than a defensible salary distribution.
