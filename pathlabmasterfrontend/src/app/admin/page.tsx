import { requireUserType } from "@/lib/auth";
import Link from "next/link";
import {
  FiActivity,
  FiAlertCircle,
  FiArrowUpRight,
  FiClipboard,
  FiChevronRight,
  FiClock,
  FiFileText,
  FiPlus,
  FiSearch,
  FiUserPlus,
} from "react-icons/fi";
import { TbCurrencyRupee } from "react-icons/tb";

const patients = [
  {
    name: "Aarav Mehta",
    id: "PL-20481",
    test: "CBC + Lipid Profile",
    time: "09:42 AM",
    status: "Ready",
  },
  {
    name: "Nisha Kulkarni",
    id: "PL-20479",
    test: "Thyroid Panel",
    time: "09:28 AM",
    status: "Processing",
  },
  {
    name: "Rohan Shah",
    id: "PL-20476",
    test: "Liver Function Test",
    time: "09:11 AM",
    status: "Awaiting sample",
  },
  {
    name: "Meera Iyer",
    id: "PL-20472",
    test: "HbA1c",
    time: "08:54 AM",
    status: "Ready",
  },
];

const adminHighlights: Array<{
  label: string;
  value: string;
  detail: string;
  icon: typeof FiActivity;
  color: string;
}> = [
  {
    label: "Today's samples",
    value: "184",
    detail: "+12.5%",
    icon: FiActivity,
    color: "text-emerald-300",
  },
  {
    label: "Pending reports",
    value: "27",
    detail: "8 need review",
    icon: FiClock,
    color: "text-amber-300",
  },
  {
    label: "Total patients",
    value: "1,248",
    detail: "+4.8% this month",
    icon: FiUserPlus,
    color: "text-sky-300",
  },
  {
    label: "Critical alerts",
    value: "03",
    detail: "Requires attention",
    icon: FiAlertCircle,
    color: "text-rose-300",
  },
];

const quickActions: Array<{ icon: typeof FiActivity; label: string }> = [
  { icon: FiUserPlus, label: "Add Patient" },
  { icon: TbCurrencyRupee, label: "Billing" },
  { icon: FiClipboard, label: "Create Test Request" },
  { icon: FiFileText, label: "Review Reports" },
];

function statusClasses(status: string) {
  if (status === "Ready") return "bg-emerald-400/15 text-emerald-300";
  if (status === "Processing") return "bg-sky-400/15 text-sky-300";
  return "bg-amber-400/15 text-amber-300";
}

export default async function AdminDashboard() {
  const user = await requireUserType("Administrator");

  return (
    <section className="mx-auto max-w-[1500px] space-y-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Lab operations
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Good morning, {user.firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Here&apos;s what is happening at {user.labName} today.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(16,185,129,0.24)] transition hover:bg-emerald-400"
          >
            <FiPlus /> New test request
          </button>
        </div>
      </div>

      <section className="mx-1 rounded-2xl flex snap-x snap-mandatory gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-4 bg-none">
        {adminHighlights.map(({ label, value, detail, icon: Icon, color }) => (
          <article
            key={label}
            className="min-w-[calc(50vw-3rem)] snap-start rounded-2xl border border-white/10 bg-white/8 p-4 shadow-[0_16px_40px_rgba(2,6,23,0.15)] sm:min-w-0"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm text-slate-400">{label}</p>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
            <p className={`mt-2 text-xs ${color}`}>{detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.75fr)]">
        <article className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/45">
          <div className="flex flex-col gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Today&apos;s patient queue
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Samples received at the collection desk
              </p>
            </div>
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-400">
              <FiSearch />
              <input
                className="w-full bg-transparent outline-none placeholder:text-slate-500 sm:w-44"
                placeholder="Search patients"
                aria-label="Search patients"
              />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Patient</th>
                  <th className="px-5 py-3 font-medium">Requested tests</th>
                  <th className="px-5 py-3 font-medium">Received</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {patients.map((patient) => (
                  <tr key={patient.id} className="transition hover:bg-white/5">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{patient.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {patient.id}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-300">{patient.test}</td>
                    <td className="px-5 py-4 text-slate-400">{patient.time}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(patient.status)}`}
                      >
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        aria-label={`Open ${patient.name}`}
                        className="text-slate-400 transition hover:text-white"
                      >
                        <FiChevronRight />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-white/10 p-4 text-right">
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-300 hover:text-emerald-200"
            >
              View all patients <FiArrowUpRight />
            </button>
          </div>
        </article>

        <aside className="space-y-5">
          <article className="rounded-2xl border border-white/10 bg-white/8 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">
                Quick actions
              </h2>
              <FiArrowUpRight className="text-slate-500" />
            </div>
            <div className="mt-3 grid gap-1.5">
              {quickActions.map(({ icon: Icon, label }) => (
                <Link
                  href="/admin/patients/create"
                  key={label}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left text-sm font-medium text-slate-200 transition hover:border-emerald-400/30 hover:bg-emerald-400/10"
                >
                  <Icon className="text-emerald-300" />
                  {label}
                </Link>
              ))}
            </div>
          </article>
          <article className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-5">
            <div className="flex items-center gap-2 text-amber-200">
              <FiAlertCircle />
              <h2 className="font-semibold">Attention needed</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-amber-50/80">
              3 critical reports are waiting for validation before they can be
              released.
            </p>
            <button
              type="button"
              className="mt-4 text-sm font-semibold text-amber-200 hover:text-white"
            >
              Review alerts <FiArrowUpRight className="ml-1 inline" />
            </button>
          </article>
        </aside>
      </section>
    </section>
  );
}
