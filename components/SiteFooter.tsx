import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 py-6 text-xs text-slate-500">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5">
        <p>SEKUR career intelligence is informational and is not legal, immigration, tax, or financial advice.</p>
        <nav aria-label="Legal" className="flex gap-5">
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <Link href="/terms" className="hover:text-white">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
