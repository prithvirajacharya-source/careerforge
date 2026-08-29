type ComparisonMetricProps = { label: string; leftValue: string | number; rightValue: string | number; leftScore?: number; rightScore?: number; leftLabel?: string; rightLabel?: string };

export default function ComparisonMetric({ label, leftValue, rightValue, leftScore, rightScore, leftLabel="Left", rightLabel="Right" }: ComparisonMetricProps) {
  const winner = typeof leftScore === "number" && typeof rightScore === "number" ? leftScore === rightScore ? "Tie" : leftScore > rightScore ? leftLabel : rightLabel : "—";
  return <div className="comparison-row grid grid-cols-[minmax(100px,1fr)_minmax(90px,1fr)_minmax(90px,1fr)_56px] items-center gap-3 border-b border-slate-200 py-4 text-sm">
    <div className="font-semibold text-slate-600">{label}</div><div className="font-bold text-slate-950">{leftValue}</div><div className="font-bold text-slate-950">{rightValue}</div><div className="text-right text-xs font-semibold text-blue-700">{winner}</div>
  </div>;
}
