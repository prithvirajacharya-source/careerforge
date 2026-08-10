"use client";

import Money from "@/components/Money";
import { hasCompleteSalaryRange, SalaryResearch } from "@/lib/careerModel";

export default function SalaryRange({
  salary,
  compact = true,
  showTypical = true,
}: {
  salary: SalaryResearch | null;
  compact?: boolean;
  showTypical?: boolean;
}) {
  if (!hasCompleteSalaryRange(salary) || !salary?.sourceCurrency) {
    return <span>Research required</span>;
  }

  return (
    <span>
      <Money amount={salary.low as number} sourceCurrency={salary.sourceCurrency} compact={compact} />
      {" \u2013 "}
      <Money amount={salary.high as number} sourceCurrency={salary.sourceCurrency} compact={compact} />
      {showTypical && (
        <span className="block text-sm font-medium text-slate-400">
          Typical: {" "}
          <Money amount={salary.typical as number} sourceCurrency={salary.sourceCurrency} compact={compact} />
        </span>
      )}
    </span>
  );
}
