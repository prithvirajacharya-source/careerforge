import { Suspense } from "react";
import Link from "next/link";
import CurrencySelector from "@/components/CurrencySelector";
import SekurMark from "@/components/brand/SekurMark";
import SiteNavigation from "@/components/SiteNavigation";
import UserAccountLink from "@/components/user/UserAccountLink";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="product-container site-header-inner">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <SekurMark className="site-logo-mark" />

          <div>
            <div className="text-xl font-black tracking-tight">
              SEKUR
            </div>

            <div className="site-brand-subtitle text-[9px] uppercase tracking-[0.28em] text-slate-200/80">
              Career Intelligence
            </div>
          </div>
        </Link>

        <Suspense fallback={<div className="site-primary-nav" aria-hidden="true" />}><SiteNavigation variant="desktop" /></Suspense>

        <div className="site-secondary-nav" aria-label="Account utilities">
          <CurrencySelector />

          <Link href="/saved">Saved</Link><Link href="/pro">Pro</Link><UserAccountLink />
        </div>
      </div>
      <Suspense fallback={<div className="mobile-nav" aria-hidden="true" />}><SiteNavigation variant="mobile" /></Suspense>
    </header>
  );
}
