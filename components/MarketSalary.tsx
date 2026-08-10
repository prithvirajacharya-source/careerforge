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

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      {values.map((item) => (
        <div
          key={item.label}
          className={
            item.featured
              ? "rounded-2xl border border-blue-400/30 bg-blue-400/10 p-5"
              : "rounded-2xl border border-white/10 bg-black/15 p-5"
          }
        >
          <div className={item.featured ? "text-xs font-bold uppercase tracking-[0.16em] text-blue-300" : "text-xs font-bold uppercase tracking-[0.16em] text-slate-500"}>
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
    </div>
  );
}
