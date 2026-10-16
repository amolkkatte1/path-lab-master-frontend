"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiChevronDown, FiClipboard, FiFileText, FiHome, FiPackage, FiSettings, FiUserCheck, FiUsers } from "react-icons/fi";
import { TbCurrencyRupee } from "react-icons/tb";

const items = [
  { href: "/admin", label: "Dashboard", icon: FiHome },
  { href: "/admin/patients", label: "Patients", icon: FiUsers },
  { href: "/admin/doctors", label: "Doctors", icon: FiUserCheck },
  // { href: "/admin/tests", label: "Test Requests", icon: FiClipboard },
  { href: "/admin/reports", label: "Reports", icon: FiFileText },
  { href: "/admin/billing", label: "Billing", icon: TbCurrencyRupee },
  { href: "/admin/subscription", label: "Subscriptions", icon: FiPackage },
];

export function AdminSidebarNav() {
  const pathname = usePathname();
  const settingsActive = pathname.startsWith("/admin/settings");
  const [settingsExpanded, setSettingsExpanded] = useState(settingsActive);

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
                onClick={() => setSettingsExpanded(false)}
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
          <div>
            <button
              type="button"
              aria-expanded={settingsExpanded}
              aria-controls="admin-settings-submenu"
              onClick={() => setSettingsExpanded((expanded) => !expanded)}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium transition ${
                settingsActive
                  ? "bg-emerald-500 text-white shadow-[0_10px_30px_rgba(16,185,129,0.28)]"
                  : "text-slate-300 hover:bg-white/8 hover:text-white"
              }`}
            >
              <FiSettings className="h-4 w-4 shrink-0" />
              <span className="flex-1">Settings</span>
              <FiChevronDown
                aria-hidden="true"
                className={`h-4 w-4 transition-transform ${
                  settingsExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
            {settingsExpanded && (
              <div id="admin-settings-submenu" className="mt-1.5 space-y-1 pl-10">
                <Link
                  href="/admin/settings/test-charges"
                  aria-current={pathname === "/admin/settings/test-charges" ? "page" : undefined}
                  className={`block rounded-xl px-3 py-2.5 text-sm transition ${
                    pathname === "/admin/settings/test-charges"
                      ? "bg-emerald-500/20 text-emerald-100"
                      : "text-slate-300 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  Test Charges
                </Link>
                <Link
                  href="/admin/settings/configuration"
                  aria-current={pathname === "/admin/settings/configuration" ? "page" : undefined}
                  className={`block rounded-xl px-3 py-2.5 text-sm transition ${
                    pathname === "/admin/settings/configuration"
                      ? "bg-emerald-500/20 text-emerald-100"
                      : "text-slate-300 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  Configuration
                </Link>
                <Link
                  href="/admin/settings/doctor-sign"
                  aria-current={pathname.startsWith("/admin/settings/doctor-sign") ? "page" : undefined}
                  className={`block rounded-xl px-3 py-2.5 text-sm transition ${
                    pathname.startsWith("/admin/settings/doctor-sign")
                      ? "bg-emerald-500/20 text-emerald-100"
                      : "text-slate-300 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  Doctor Sign
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
