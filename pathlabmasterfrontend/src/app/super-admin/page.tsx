import { logout } from "@/app/actions";
import { requireUserType } from "@/lib/auth";

const superAdminMetrics = [
  {
    label: "Active Labs",
    value: "27",
    detail: "Facilities currently onboarded to the platform",
  },
  {
    label: "Platform Users",
    value: "1,284",
    detail: "Accounts under super admin oversight",
  },
  {
    label: "Critical Flags",
    value: "02",
    detail: "System-level issues requiring escalation",
  },
];

export default async function SuperAdminDashboard() {
  const user = await requireUserType("SuperAdmin");

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#15304f_0%,_#07121f_48%,_#020617_100%)] px-4 py-8 text-white sm:px-8 lg:px-12">
      <section className="mx-auto max-w-6xl space-y-8">
        <header className="overflow-hidden rounded-[32px] border border-sky-300/20 bg-white/10 p-6 backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-200">
                Super Admin Dashboard
              </p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Strategic control for {user.firstName} {user.lastName}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
                You are signed in with the super admin role. This area is for
                cross-lab visibility, governance, and platform-wide controls.
              </p>
            </div>

            <form action={logout}>
              <button
                type="submit"
                className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {superAdminMetrics.map((item) => (
            <article
              key={item.label}
              className="rounded-[24px] border border-white/10 bg-white/8 p-5 shadow-[0_18px_50px_rgba(2,6,23,0.28)] backdrop-blur"
            >
              <p className="text-sm text-slate-300">{item.label}</p>
              <p className="mt-3 text-4xl font-semibold text-white">
                {item.value}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                {item.detail}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
          <article className="rounded-[24px] bg-white px-6 py-6 text-slate-900 shadow-[0_22px_60px_rgba(15,23,42,0.14)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
              Governance
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              Platform-wide responsibilities
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
              <li>Manage organization-level configuration and access policy.</li>
              <li>Audit user roles, data visibility, and escalated exceptions.</li>
              <li>Monitor overall health across every connected laboratory.</li>
            </ul>
          </article>

          <article className="rounded-[24px] border border-sky-300/20 bg-sky-400/10 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-200">
              Access Scope
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Role: {user.userTypeName}
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-100/90">
              Signed in as `{user.userName}` for `{user.labName}`. This route is
              only available to the `SuperAdmin` role, and other users are
              redirected back to login.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}
