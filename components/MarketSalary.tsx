"use client";

import Money from "@/components/Money";
import type { SalaryResearch } from "@/lib/careerModel";

export function MarketSalaryValue({
  amount,
  salary,
  compact = true,
}: {
  amount: number | null;
  salary: SalaryResearch;
  compact?: boolean;
}) {
  if (amount === null || !salary.sourceCurrency) {
    return <span className="text-slate-400">Unavailable</span>;
  }

  return (
    <Money
      amount={amount}
      sourceCurrency={salary.sourceCurrency}
      compact={compact}
    />
  );
}

export default function MarketSalary({ salary }: { salary: SalaryResearch }) {
  const hasLowAndHigh = salary.low !== null && salary.high !== null;

  return (
    <span>
      {hasLowAndHigh ? (
        <>
          <MarketSalaryValue amount={salary.low} salary={salary} />
          {" \u2013 "}
          <MarketSalaryValue amount={salary.high} salary={salary} />
        </>
      ) : (
        <>
          Typical: {" "}
          <MarketSalaryValue amount={salary.typical} salary={salary} />
        </>
      )}
      {hasLowAndHigh && salary.typical !== null && (
        <span className="block text-sm font-medium text-slate-400">
          Typical: {" "}
          <MarketSalaryValue amount={salary.typical} salary={salary} />
        </span>
      )}
    </span>
  );
}
