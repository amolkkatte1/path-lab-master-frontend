const createUserSteps = [
  "Basic identity details and login credentials",
  "Lab assignment and user type mapping",
  "Operational permissions and dashboard access",
];

export default function CreateUserPage() {
  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <header className="rounded-[28px] border border-emerald-300/20 bg-white/10 p-6 backdrop-blur sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-200">
          User Management
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Create User
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
          This page will become the onboarding form for administrators,
          technicians, reception users, and other lab roles.
        </p>
      </header>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-[24px] bg-white p-6 text-slate-900 shadow-[0_22px_60px_rgba(15,23,42,0.14)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
            Planned Form Sections
          </p>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
            {createUserSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-[24px] border border-white/10 bg-white/8 p-6 backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-200">
            Coming Next
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-200">
            We can build this next as a real form that posts to your backend
            user-creation API and maps roles like `Administrator`,
            `SuperAdmin`, technician, and reception staff.
          </p>
        </article>
      </section>
    </section>
  );
}
