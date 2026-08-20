export default function GlobalSettingsPage() {
  return (
    <section className="mx-auto max-w-7xl rounded-[28px] border border-white/10 bg-white/10 p-6 backdrop-blur sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-200">
        Master Setup
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Global Settings
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
        This area can host platform defaults such as report numbering, billing
        settings, approval policies, and system-wide operational rules.
      </p>
    </section>
  );
}
