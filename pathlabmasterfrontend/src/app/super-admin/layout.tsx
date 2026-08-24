import Image from "next/image";

import { logout } from "@/app/actions";
import { requireUserType } from "@/lib/auth";

import { SuperAdminSidebarNav } from "./sidebar-nav";
import { TopbarClock } from "./topbar-clock";

export default async function SuperAdminLayout(
  props: LayoutProps<"/super-admin">,
) {
  const user = await requireUserType("SuperAdmin");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#15304f_0%,_#07121f_42%,_#020617_100%)] text-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-white/10 bg-slate-950/70 px-5 py-6 backdrop-blur lg:min-h-screen lg:w-[290px] lg:border-b-0 lg:border-r">
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
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="border-b border-white/10 bg-slate-950/35 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                {/* <div className="rounded-2xl bg-white/10 px-3 py-2">
                  <Image
                    src="/PM2.png"
                    alt="Path Lab"
                    width={120}
                    height={28}
                    className="h-auto"
                  />
                </div> */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">
                    Super Admin Workspace
                  </p>
                  <h1 className="text-lg font-semibold text-white sm:text-xl">
                    Path Lab master administration
                  </h1>
                </div>
              </div>

              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <TopbarClock/>

                <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                  <p className="text-sm font-semibold text-white">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-slate-300">
                    {user.labName} • {user.userTypeName}
                  </p>
                </div>

                <form action={logout}>
                  <button
                    type="submit"
                    className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-red-400 cursor-pointer"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-4 lg:py-4">
            {props.children}
          </main>
        </div>
      </div>
    </div>
  );
}
