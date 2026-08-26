"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiBarChart2, FiClipboard, FiFileText, FiHome, FiSettings, FiUsers } from "react-icons/fi";

const items = [
  { href: "/admin", label: "Dashboard", icon: FiHome },
  { href: "/admin/patients", label: "Patients", icon: FiUsers },
  { href: "/admin/tests", label: "Test Requests", icon: FiClipboard },
  { href: "/admin/reports", label: "Reports", icon: FiFileText },
  { href: "/admin/analytics", label: "Analytics", icon: FiBarChart2 },
  { href: "/admin/settings", label: "Settings", icon: FiSettings },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <div className="space-y-8">
      <div className="rounded-[24px] border border-emerald-400/20 bg-emerald-400/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-200">
            <FiClipboard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Administrator</p>
            <p className="text-xs text-slate-300">Laboratory operations</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="px-3 text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">Workspace</p>
        <nav className="space-y-1.5">
          {items.map((item) => {
            const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-emerald-500 text-white shadow-[0_10px_30px_rgba(16,185,129,0.28)]"
                    : "text-slate-300 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}