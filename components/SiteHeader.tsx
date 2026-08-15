import Link from "next/link";
import CurrencySelector from "@/components/CurrencySelector";
import UserAccountLink from "@/components/user/UserAccountLink";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07101f]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 font-black text-slate-950">
            S
          </div>

          <div>
            <div className="text-xl font-black tracking-tight">
              SEK<span className="text-blue-400">UR</span>
            </div>

            <div className="site-brand-subtitle text-[9px] uppercase tracking-[0.28em] text-slate-200/80">
              Global Career Intelligence
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm md:flex">
          <Link href="/careers" className="text-slate-200 transition hover:text-white">Explore</Link>
          <Link href="/compare" className="text-slate-200 transition hover:text-white">Compare</Link>
          <Link href="/saved" className="text-slate-200 transition hover:text-white">Saved</Link>
        </nav>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <CurrencySelector />

          <UserAccountLink />
        </div>
      </div>
      <nav className="mx-auto flex max-w-7xl justify-around border-t border-white/10 px-3 py-2 text-xs font-bold text-slate-300 md:hidden">
        <Link href="/careers">Explore</Link><Link href="/compare">Compare</Link><Link href="/saved">Saved</Link><Link href="/profile">Account</Link>
      </nav>
    </header>
  );
}
