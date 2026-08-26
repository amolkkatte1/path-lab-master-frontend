import Image from "next/image";

import { logout } from "@/app/actions";
import { requireUserType } from "@/lib/auth";

import { AdminShell } from "./admin-shell";
import { AdminSidebarNav } from "./sidebar-nav";
import { TopbarClock } from "../super-admin/topbar-clock";

export default async function AdminLayout(props: LayoutProps<"/admin">) {
  const user = await requireUserType("Administrator");

  return (
    <AdminShell
      sidebarContent={
        <>
          <Image src="/PM2.png" alt="Path Lab logo" width={130} height={30} priority className="h-auto" />
          <div className="mt-8"><AdminSidebarNav /></div>
          <form action={logout} className="mt-auto pt-6 lg:hidden">
            <button type="submit" className="w-full cursor-pointer rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-rose-400">Sign out</button>
          </form>
        </>
      }
      headerContent={
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">Administrator workspace</p><p className="mt-1 text-lg font-semibold text-white sm:text-xl">{user.labName}</p></div>
          <div className="flex flex-wrap items-center gap-3"><TopbarClock /><div className="rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-right"><p className="text-sm font-semibold text-white">{user.firstName} {user.lastName}</p><p className="text-xs text-slate-400">{user.userTypeName}</p></div><form action={logout} className="hidden lg:block"><button type="submit" className="cursor-pointer rounded-xl border border-white/15 bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-rose-300">Sign out</button></form></div>
        </div>
      }
    >
      {props.children}
    </AdminShell>
  );
}