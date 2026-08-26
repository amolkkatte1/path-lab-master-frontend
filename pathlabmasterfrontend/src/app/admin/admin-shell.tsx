"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { FiMenu, FiX } from "react-icons/fi";

type AdminShellProps = {
  children: ReactNode;
  headerContent: ReactNode;
  sidebarContent: ReactNode;
};

export function AdminShell({ children, headerContent, sidebarContent }: Readonly<AdminShellProps>) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const closeSidebar = window.setTimeout(() => setSidebarOpen(false), 0);

    return () => window.clearTimeout(closeSidebar);
  }, [pathname]);

  return (
    <div className="workspace-shell h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#15304f_0%,_#07121f_42%,_#020617_100%)] text-white">
      <div className="flex h-screen">
        <div
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
          className={`fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm transition lg:hidden ${
            sidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
        />

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[280px] flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-r border-white/10 bg-slate-950/95 px-5 py-6 backdrop-blur transition-transform duration-300 lg:static lg:min-h-screen lg:w-[250px] lg:translate-x-0 lg:bg-slate-950/70 xl:w-[290px] ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-200">Navigation</p>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-100 transition hover:bg-white/10"
              aria-label="Close sidebar"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
          {sidebarContent}
        </aside>

        <div className="flex h-screen min-h-0 min-w-0 flex-1 flex-col">
          <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-slate-950/85 px-3 py-3 backdrop-blur sm:px-6 sm:py-4 lg:left-[250px] lg:px-8 lg:py-3 xl:left-[290px]">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-slate-100 transition hover:bg-white/12 lg:hidden"
                aria-label="Open sidebar"
              >
                <FiMenu className="h-5 w-5" />
              </button>
              <div className="min-w-0 flex-1">{headerContent}</div>
            </div>
          </header>
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 pb-6 pt-26 sm:px-6 lg:px-8 lg:pb-5 lg:pt-25">{children}</main>
        </div>
      </div>
    </div>
  );
}