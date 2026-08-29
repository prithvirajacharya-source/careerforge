import Link from "next/link";
import CurrencySelector from "@/components/CurrencySelector";
import UserAccountLink from "@/components/user/UserAccountLink";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="product-container site-header-inner">
        <Link href="/" className="flex items-center gap-3">
          <div className="site-logo-mark">
            S
          </div>

          <div>
            <div className="text-xl font-black tracking-tight">
              SEKUR
            </div>

            <div className="site-brand-subtitle text-[9px] uppercase tracking-[0.28em] text-slate-200/80">
              Career Intelligence
            </div>
          </div>
        </Link>

        <nav className="site-primary-nav" aria-label="Primary navigation">
          <Link href="/profile">Overview</Link><Link href="/profile">My Career</Link><Link href="/opportunity-report">Opportunities</Link><Link href="/jobs">Jobs</Link><Link href="/careers">Explore</Link><Link href="/compare">Compare</Link>
        </nav>

        <div className="site-secondary-nav">
          <CurrencySelector />

          <Link href="/saved">Saved</Link><Link href="/pro">Pro</Link><UserAccountLink />
        </div>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        <Link href="/profile">Overview</Link><Link href="/opportunity-report">Opportunities</Link><Link href="/jobs">Jobs</Link><Link href="/careers">Explore</Link><Link href="/compare">Compare</Link>
      </nav>
    </header>
  );
}
