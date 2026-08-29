export default function CountryLoading() {
  return (
    <main className="sekur-intelligence min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
            <div className="mt-5 h-16 max-w-xl animate-pulse rounded-2xl bg-white/10" />
            <div className="mt-6 h-6 max-w-2xl animate-pulse rounded bg-white/5" />
          </div>

          <div className="h-72 animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]" />
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
