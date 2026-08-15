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

export function SalaryComparison({
  salary,
  explainUnavailableHigh = false,
}: {
  salary: SalaryResearch;
  explainUnavailableHigh?: boolean;
}) {
  const values = [
    { label: "Low", amount: salary.low },
    { label: "Typical", amount: salary.typical, featured: true },
    { label: "High", amount: salary.high },
  ];
  const typicalPosition = salary.low !== null && salary.typical !== null && salary.high !== null && salary.high > salary.low
    ? Math.max(0, Math.min(100, ((salary.typical - salary.low) / (salary.high - salary.low)) * 100))
    : null;

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      {values.map((item) => (
        <div
          key={item.label}
          className={
            item.featured
              ? "glass-elevated rounded-2xl border border-emerald-300/30 p-5"
              : "glass-subtle rounded-2xl p-5"
          }
        >
          <div className={item.featured ? "text-xs font-bold uppercase tracking-[0.16em] text-emerald-300" : "text-xs font-bold uppercase tracking-[0.16em] text-slate-500"}>
            {item.label}
          </div>
          <div className="mt-3 text-2xl font-black sm:text-xl lg:text-2xl">
            <MarketSalaryValue amount={item.amount} salary={salary} />
          </div>
          {item.label === "High" && item.amount === null && explainUnavailableHigh && (
            <p className="mt-3 text-xs leading-5 text-slate-500">
              The official source reports only an upper threshold, not an exact value.
            </p>
          )}
        </div>
      ))}
      {typicalPosition !== null && <div className="px-2 sm:col-span-3" aria-label={`Typical salary is ${Math.round(typicalPosition)} percent through the published range`}>
        <div className="relative h-1 rounded-full bg-white/15"><div className="absolute inset-y-0 left-0 rounded-full bg-emerald-300" style={{ width: `${typicalPosition}%` }} /><span className="absolute top-1/2 h-3 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" style={{ left: `${typicalPosition}%` }} /></div>
      </div>}
    </div>
  );
}
