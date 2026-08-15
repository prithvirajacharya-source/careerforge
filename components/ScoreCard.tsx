import type { ReactNode } from "react";
import GlassSurface from "@/components/GlassSurface";

type ScoreItem = {
  label: string;
  value: ReactNode;
};

type ScoreCardProps = {
  title?: string;
  score: number;
  items?: ScoreItem[];
};

function getScoreLabel(score: number) {
  if (score >= 95) return "Excellent";
  if (score >= 85) return "Strong";
  if (score >= 70) return "Good";
  return "Needs attention";
}

export default function ScoreCard({
  title = "SEKUR Score",
  score,
  items = [],
}: ScoreCardProps) {
  const label = getScoreLabel(score);

  return (
    <GlassSurface tone="elevated" className="rounded-3xl p-7">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            {title}
          </div>

          <div className="mt-3 text-5xl font-black text-emerald-300">
            {score}
            <span className="ml-1 text-lg font-semibold text-slate-500">
              /100
            </span>
          </div>

          <div className="mt-2 text-sm font-semibold text-emerald-300">
            {label}
          </div>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-emerald-400/20 text-2xl">
          ★
        </div>
      </div>

      {items.length > 0 && (
        <div className="mt-7 space-y-4 border-t border-white/10 pt-6">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-4"
            >
              <span className="text-sm text-slate-500">
                {item.label}
              </span>

              <span className="text-sm font-bold text-slate-200">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </GlassSurface>
  );
}
