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
    <section className="mx-auto max-w-7xl space-y-6">
      <header className="overflow-hidden rounded-[24px] border border-sky-300/20 bg-white/10 px-6 py-4 backdrop-blur sm:px-7 sm:py-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-200">
            Super Admin Dashboard
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Strategic control for {user.firstName} {user.lastName}
          </h2>
          <p className="max-w-3xl text-sm leading-5 text-slate-200 sm:text-base">
            Use this control center to manage platform-wide users, lab masters,
            test configuration, and overall operating health across every
            connected pathology center.
          </p>
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

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.95fr]">
        <article className="rounded-[24px] bg-white px-6 py-6 text-slate-900 shadow-[0_22px_60px_rgba(15,23,42,0.14)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
            Governance Focus
          </p>
          <h3 className="mt-3 text-2xl font-semibold">
            What belongs in this workspace
          </h3>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
            <li>Create and manage users across all labs and departments.</li>
            <li>Maintain lab, test, and package masters from one place.</li>
            <li>Review platform-level activity, issues, and approvals.</li>
            <li>Control global settings before operational modules expand.</li>
          </ul>
        </article>

        <article className="rounded-[24px] border border-sky-300/20 bg-sky-400/10 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-200">
            Signed-In Scope
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-white">
            {user.userTypeName}
          </h3>
          <p className="mt-4 text-sm leading-6 text-slate-100/90">
            Signed in as `{user.userName}` for `{user.labName}`. This workspace
            is dedicated to master creation and control-level operations for the
            platform.
          </p>
        </article>
      </section>
    </section>
  );
}
