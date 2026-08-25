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
      period={salary.period ?? "annual"}
    />
  );
}

export default function MarketSalary({ salary }: { salary: SalaryResearch }) {
  return <MarketSalaryValue amount={salary.typical} salary={salary} />;
}

export function SalaryComparison({
  salary,
  explainUnavailableHigh = false,
}: {
  salary: SalaryResearch;
  explainUnavailableHigh?: boolean;
}) {
  const typicalPosition = salary.low !== null && salary.typical !== null && salary.high !== null && salary.high > salary.low
    ? Math.max(0, Math.min(100, ((salary.typical - salary.low) / (salary.high - salary.low)) * 100))
    : null;

  return (
    <div className="mt-6">
      <div className="glass-subtle rounded-2xl p-5">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xl font-black sm:text-2xl">
          <span><MarketSalaryValue amount={salary.low} salary={salary} /></span>
          <span className="text-slate-500" aria-hidden="true">–</span>
          <span className="text-right"><MarketSalaryValue amount={salary.high} salary={salary} /></span>
        </div>
        {salary.high === null && explainUnavailableHigh && <p className="mt-3 text-xs leading-5 text-slate-500">The official source reports only an upper threshold, not an exact value.</p>}
      </div>
      {typicalPosition !== null && <div className="mt-4 px-2" aria-label={`Typical salary is ${Math.round(typicalPosition)} percent through the published range`}>
        <div className="relative h-1 rounded-full bg-white/15"><div className="absolute inset-y-0 left-0 rounded-full bg-emerald-300" style={{ width: `${typicalPosition}%` }} /><span className="absolute top-1/2 h-3 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" style={{ left: `${typicalPosition}%` }} /></div>
      </div>}
    </div>
  );
}
