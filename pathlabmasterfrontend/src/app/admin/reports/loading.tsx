export default function ReportsLoading() {
  return (
    <div className="report-search-page min-h-screen w-full">
      <div className="report-search-header border-b px-4 py-3 text-sm font-semibold uppercase tracking-[0.22em]">
        LAB TEST SEARCH
      </div>
      <div className="w-full py-0">
        <div className="report-search-shell mx-auto w-full animate-pulse rounded-xl border p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-10 rounded-lg bg-slate-700/40" />
            <div className="h-10 rounded-lg bg-slate-700/40" />
            <div className="h-10 rounded-lg bg-slate-700/40" />
            <div className="h-10 rounded-lg bg-slate-700/40" />
          </div>
          <div className="mt-6 h-24 rounded-xl bg-slate-700/30" />
        </div>
      </div>
    </div>
  );
}
