import GlassSurface from "@/components/GlassSurface";

type ComparisonMetricProps = {
  label: string;
  leftValue: string | number;
  rightValue: string | number;
  leftScore?: number;
  rightScore?: number;
};

export default function ComparisonMetric({
  label,
  leftValue,
  rightValue,
  leftScore,
  rightScore,
}: ComparisonMetricProps) {
  return (
    <GlassSurface className="rounded-2xl p-6">
      <div className="mb-5 text-center text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="text-lg font-black text-white">
            {leftValue}
          </div>

          {typeof leftScore === "number" && (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
                style={{ width: `${leftScore}%` }}
              />
            </div>
          )}
        </div>

        <div className="text-right">
          <div className="text-lg font-black text-white">
            {rightValue}
          </div>

          {typeof rightScore === "number" && (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="ml-auto h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
                style={{ width: `${rightScore}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </GlassSurface>
  );
}
