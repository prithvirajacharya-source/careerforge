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
        <Link href="/" className="site-brand">
          <SekurMark className="site-logo-mark" />

          <div className="site-brand-copy">
            <div className="site-brand-wordmark">
              SEKUR
            </div>

            <div className="site-brand-subtitle">
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
