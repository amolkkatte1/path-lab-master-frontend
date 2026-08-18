import { logout } from "@/app/actions";
import { requireUserType } from "@/lib/auth";

const adminHighlights = [
  {
    label: "Pending Approvals",
    value: "12",
    detail: "Reports waiting for review today",
  },
  {
    label: "Samples Processed",
    value: "184",
    detail: "Completed by the admin team this week",
  },
  {
    label: "Open Alerts",
    value: "03",
    detail: "Operational issues needing follow-up",
  },
];

export default async function AdminDashboard() {
  const user = await requireUserType("Administrator");

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-8 lg:px-12">
      <section className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-[28px] border border-white/10 bg-white/8 p-6 backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">
                Admin Dashboard
              </p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Welcome back, {user.firstName} {user.lastName}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                You are signed in with the admin role. This dashboard is scoped
                to laboratory operations, approvals, and daily monitoring.
              </p>
            </div>

            <form action={logout}>
              <button
                type="submit"
                className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {adminHighlights.map((item) => (
            <article
              key={item.label}
              className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.24)]"
            >
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="mt-3 text-4xl font-semibold text-white">
                {item.value}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {item.detail}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
          <article className="rounded-[24px] bg-white p-6 text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
              Operations Queue
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              Today&apos;s admin focus
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
              <li>Approve incoming user access requests from lab staff.</li>
              <li>Review pending pathology sample escalations.</li>
              <li>Monitor turnaround times for high-priority reports.</li>
            </ul>
          </article>

          <article className="rounded-[24px] border border-emerald-400/20 bg-emerald-500/10 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">
              Access Scope
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Role: {user.userTypeName}
            </h2>
            <p className="mt-4 text-sm leading-6 text-emerald-50/90">
              Signed in as `{user.userName}` for `{user.labName}`. This route is
              restricted to the `Administrator` role, so other roles are sent
              back to login.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}
