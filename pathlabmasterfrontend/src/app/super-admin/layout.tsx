import Image from "next/image";
import Link from "next/link";

import { logout } from "@/app/actions";
import { requireUserType } from "@/lib/auth";

import { SuperAdminShell } from "./super-admin-shell";
import { SuperAdminSidebarNav } from "./sidebar-nav";
import { TopbarClock } from "./topbar-clock";

export default async function SuperAdminLayout(
  props: LayoutProps<"/super-admin">,
) {
  const user = await requireUserType("SuperAdmin");

  return (
    <SuperAdminShell
      sidebarContent={
        <>
          <div className="flex items-center gap-3">
            <Image
              src="/PM2.png"
              alt="Path Lab logo"
              width={130}
              height={30}
              priority
              className="w-[130px] object-contain"
            />
          </div>

          <div className="mt-8">
            <SuperAdminSidebarNav />
          </div>

          <form action={logout} className="mt-auto pt-6 lg:hidden">
            <button
              type="submit"
              className="w-full cursor-pointer rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-red-400"
            >
              Sign out
            </button>
          </form>
        </>
      }
      headerContent={
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <Link href="/super-admin" className="group min-w-0 flex items-center gap-4" aria-label="Go to Super Admin workspace dashboard">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-200">
                Super Admin Workspace
              </p>
              <h1 className="text-base font-semibold text-white sm:text-lg xl:whitespace-nowrap">
                Path Lab master administration
              </h1>
            </div>
          </Link>

          <div className="flex flex-wrap items-start gap-2 xl:justify-end">
            <TopbarClock/>

            <div className="rounded-xl border border-white/10 bg-white/8 px-3 py-2">
              <p className="text-xs font-semibold text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[10px] text-slate-300">
                {user.labName} | {user.userTypeName}
              </p>
            </div>

            <form action={logout} className="hidden lg:block">
              <button
                type="submit"
                className="cursor-pointer rounded-xl border border-white/15 bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-red-400"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      }
    >
      {props.children}
    </SuperAdminShell>
  );
}
