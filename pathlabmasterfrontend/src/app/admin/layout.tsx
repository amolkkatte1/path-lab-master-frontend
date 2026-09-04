import Image from "next/image";
import Link from "next/link";

import { logout } from "@/app/actions";
import { requireUserType } from "@/lib/auth";

import { AdminShell } from "./admin-shell";
import { AdminSidebarNav } from "./sidebar-nav";
import { TopbarClock } from "../super-admin/topbar-clock";
import { FiFileText, FiUserPlus } from "react-icons/fi";
import { TbCurrencyRupee } from "react-icons/tb";

export default async function AdminLayout(props: LayoutProps<"/admin">) {
  const user = await requireUserType("Administrator");

  return (
    <AdminShell
      sidebarContent={
        <>
          <Image
            src="/PM2.png"
            alt="Path Lab logo"
            width={130}
            height={30}
            priority
            className="w-[130px] object-contain"
          />
          <div className="mt-8">
            <AdminSidebarNav />
          </div>
          <form action={logout} className="mt-auto pt-6 lg:hidden">
            <button
              type="submit"
              className="w-full cursor-pointer rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-rose-400"
            >
              Sign out
            </button>
          </form>
        </>
      }
      headerContent={
        <div className="flex min-w-0 flex-row items-center justify-between gap-2 lg:gap-3">
          <Link
            href="/admin"
            className="group min-w-0 shrink"
            aria-label="Go to Admin workspace dashboard"
          >
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-300 transition group-hover:text-emerald-200">
              Admin workspace
            </p>
            <div className="row flex min-w-0 items-center gap-1">
              <p className="truncate text-base font-semibold text-white transition group-hover:text-emerald-100 sm:text-lg">
                {user.labName}
              </p>
              {/* <p className="truncate text-base text-white transition group-hover:text-emerald-100 sm:text-sm">
                / id: {user.labId}
              </p> */}
            </div>
          </Link>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Link
              href="/admin/patients/create"
              aria-label="Add patient"
              title="Add patient"
              className="inline-flex min-w-11 flex-col items-center gap-0.5 rounded-lg border border-white/15 px-2 py-1.5 text-slate-100 transition hover:border-emerald-300/50 hover:bg-emerald-400/15"
            >
              <FiUserPlus className="h-5 w-5" />
              <span className="text-[11px] font-medium leading-none">
                Add Patient
              </span>
            </Link>
            <button
              type="button"
              aria-label="Billing"
              title="Billing"
              className="inline-flex min-w-11 flex-col items-center gap-0.5 rounded-lg border border-white/15 px-2 py-1.5 text-slate-100 transition hover:border-emerald-300/50 hover:bg-emerald-400/15"
            >
              <TbCurrencyRupee className="h-5 w-5" />
              <span className="text-[11px] font-medium leading-none">
                Billing
              </span>
            </button>
            <button
              type="button"
              aria-label="Review reports"
              title="Review reports"
              className="inline-flex min-w-11 flex-col items-center gap-0.5 rounded-lg border border-white/15 px-2 py-1.5 text-slate-100 transition hover:border-emerald-300/50 hover:bg-emerald-400/15"
            >
              <FiFileText className="h-5 w-5" />
              <span className="text-[11px] font-medium leading-none">
                Reports
              </span>
            </button>
            <div className="hidden lg:block">
              <TopbarClock />
            </div>
            <div className="hidden rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-right lg:block">
              <p className="text-xs font-semibold text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[10px] text-slate-400">{user.userTypeName}</p>
            </div>
            <form action={logout} className="hidden lg:block">
              <button
                type="submit"
                className="cursor-pointer rounded-xl border border-white/15 bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-rose-300"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      }
    >
      {props.children}
    </AdminShell>
  );
}
