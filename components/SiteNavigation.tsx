"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Overview", href: "/overview", matches: (path: string) => path === "/" || path === "/overview" },
  { label: "My Career", href: "/profile", matches: (path: string) => path === "/profile" || path === "/my-career" },
  { label: "Opportunities", href: "/opportunity-report", matches: (path: string) => path === "/opportunity-report" || path.startsWith("/opportunities") },
  { label: "Jobs", href: "/jobs", matches: (path: string) => path === "/jobs" },
  { label: "Explore", href: "/careers", matches: (path: string) => path.startsWith("/careers") || path.startsWith("/countries") || path === "/explore" },
  { label: "Compare", href: "/compare", matches: (path: string) => path === "/compare" },
];

export default function SiteNavigation({ variant }: { variant: "desktop" | "mobile" }) {
  const pathname = usePathname();
  return <nav className={variant === "desktop" ? "site-primary-nav" : "mobile-nav"} aria-label={variant === "desktop" ? "Primary navigation" : "Mobile navigation"}>
    {items.map((item) => { const active = item.matches(pathname); return <Link key={item.label} href={item.href} aria-current={active ? "page" : undefined} className={active ? "site-nav-active" : undefined}>{item.label}</Link>; })}
  </nav>;
}
