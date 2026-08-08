export default function CountriesLoading() {
  return (
    <main className="min-h-screen bg-[#07101f] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="h-4 w-40 animate-pulse rounded bg-white/10" />

        <div className="mt-6 h-16 max-w-2xl animate-pulse rounded-2xl bg-white/10" />

        <div className="mt-5 h-6 max-w-xl animate-pulse rounded bg-white/5" />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="flex gap-4">
                <div className="h-10 w-14 animate-pulse rounded bg-white/10" />

                <div className="flex-1">
                  <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
                  <div className="mt-3 h-6 w-36 animate-pulse rounded bg-white/10" />
                </div>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3">
                <div className="h-16 animate-pulse rounded-xl bg-black/20" />
                <div className="h-16 animate-pulse rounded-xl bg-black/20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}