import { getPendingPatientsByLabId, parseApiResponse } from "@/lib/api";
import { requireUserType } from "@/lib/auth";
import {
  PendingPatientQueue,
  type PendingPatient,
} from "./pending-patient-queue";
import Link from "next/link";
import {
  FiActivity,
  FiAlertCircle,
  FiArrowUpRight,
  FiClipboard,
  FiClock,
  FiFileText,
  FiPlus,
  FiUserPlus,
} from "react-icons/fi";
import { TbCurrencyRupee } from "react-icons/tb";

type PendingPatientsResponse = {
  data?: PendingPatient[];
};

async function getPendingPatients(labId: number) {
  try {
    const response = await fetch(getPendingPatientsByLabId(labId), {
      cache: "no-store",
    });
    if (!response.ok)
      return {
        patients: [],
        error: `The pending queue returned ${response.status}.`,
      };
    const payload = await parseApiResponse<PendingPatientsResponse>(response);
    return { patients: payload.data ?? [], error: null };
  } catch {
    return {
      patients: [],
      error: "Unable to load today&apos;s pending patient queue.",
    };
  }
}

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

export default async function AdminDashboard() {
  const user = await requireUserType("Administrator");
  const { patients, error: queueError } = await getPendingPatients(user.labId);

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

      <article className="dashboard-queue-shell min-w-0 overflow-hidden rounded-2xl border bg-slate-950/45">
        {/* <div className="flex flex-col gap-3 border-b border-white/10 sm:flex-row sm:items-center sm:justify-between"></div> */}
        <PendingPatientQueue patients={patients} error={queueError} />
        {/* <div className="border-t border-white/10 p-4 text-right">
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-300 hover:text-emerald-200"
              >
              View all patients <FiArrowUpRight />
              </button>
          </div> */}
      </article>
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.75fr)]">
        {/* <aside className="space-x-5"> */}
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
        {/* </aside> */}
      </section>
    </section>
  );
}
