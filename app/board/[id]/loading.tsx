export default function BoardLoading() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-full items-center justify-between px-6 py-4">
          <div className="h-7 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-8 w-8 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
      <main className="flex items-start gap-4 bg-slate-50 p-6 dark:bg-slate-900">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="w-72 shrink-0 rounded-xl bg-slate-100 p-3 dark:bg-slate-800"
          >
            <div className="mb-3 h-5 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div
                  key={j}
                  className="h-12 animate-pulse rounded-lg bg-white dark:bg-slate-700"
                />
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
