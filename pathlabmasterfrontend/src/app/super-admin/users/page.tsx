const userBuckets = [
  {
    title: "Administrators",
    detail: "Operational heads managing day-to-day lab workflow.",
  },
  {
    title: "Technicians",
    detail: "Processing staff responsible for samples and result entry.",
  },
  {
    title: "Reception",
    detail: "Front-desk users handling registration and billing.",
  },
];

export default function UsersPage() {
  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <header className="rounded-[28px] border border-white/10 bg-white/10 p-6 backdrop-blur sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-200">
          User Directory
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Manage Users
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
          This space will host the searchable user list, filters, status
          toggles, role updates, and lab assignment actions.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {userBuckets.map((bucket) => (
          <article
            key={bucket.title}
            className="rounded-[24px] border border-white/10 bg-white/8 p-5 backdrop-blur"
          >
            <p className="text-lg font-semibold text-white">{bucket.title}</p>
            <p className="mt-3 text-sm leading-6 text-slate-200">
              {bucket.detail}
            </p>
          </article>
        ))}
      </section>
    </section>
  );
}
