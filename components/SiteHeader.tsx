import Link from "next/link";
import CurrencySelector from "@/components/CurrencySelector";

export default function SiteHeader() {
  return (
    <header className="border-b border-white/10 bg-[#07101f]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 font-black text-slate-950">
            S
          </div>

          <div>
            <div className="text-xl font-black tracking-tight">
              SEK<span className="text-blue-400">UR</span>
            </div>

            <div className="text-[9px] uppercase tracking-[0.28em] text-slate-500">
              Global Career Intelligence
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm md:flex">
          <Link
            href="/careers"
            className="text-slate-400 transition hover:text-white"
          >
            Careers
          </Link>

          <Link
            href="/countries"
            className="text-slate-400 transition hover:text-white"
          >
            Countries
          </Link>

          <span className="cursor-not-allowed text-slate-600">
            Compare
          </span>

          <span className="cursor-not-allowed text-slate-600">
            Intelligence
          </span>
        </nav>

        <div className="flex items-center gap-3">
          <CurrencySelector />

          <Link
            href="/admin"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}