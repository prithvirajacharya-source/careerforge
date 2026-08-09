import CompareClient from "./CompareClient";
import SiteHeader from "@/components/SiteHeader";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{
    left?: string;
    right?: string;
  }>;
}) {
  const params = await searchParams;

  const left =
    params.left ?? "sweden";

  const right =
    params.right ?? "germany";

  return (
    <main className="min-h-screen bg-[#07101f] text-white">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
          SEKUR Compare
        </p>

        <h1 className="mt-4 text-5xl font-black tracking-tight md:text-6xl">
          Compare countries
          <span className="block bg-gradient-to-r from-blue-400 to-emerald-300 bg-clip-text text-transparent">
            before you move.
          </span>
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
          Compare countries using the same
          SEKUR Intelligence Engine that powers
          their individual profiles.
        </p>

        <CompareClient
          key={`${left}-${right}`}
          initialLeft={left}
          initialRight={right}
        />
      </section>
    </main>
  );
}