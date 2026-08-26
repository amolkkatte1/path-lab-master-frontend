import Image from "next/image";

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
              className="h-auto"
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
          <div className="min-w-0 flex items-center gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">
                Super Admin Workspace
              </p>
              <h1 className="text-lg font-semibold text-white sm:text-xl xl:whitespace-nowrap">
                Path Lab master administration
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-start gap-3 xl:justify-end">
            <TopbarClock />

            <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
              <p className="text-sm font-semibold text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-slate-300">
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
