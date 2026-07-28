export default function DashboardLoading() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="h-8 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-8 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="h-7 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
            />
          ))}
        </div>
      </main>
    </div>
  );
}
