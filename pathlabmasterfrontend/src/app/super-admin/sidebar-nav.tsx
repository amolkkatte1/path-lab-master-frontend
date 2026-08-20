"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiBox,
  FiClipboard,
  FiGrid,
  FiHome,
  FiSettings,
  FiShield,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  match?: "exact" | "prefix";
};

const primaryItems: NavItem[] = [
  {
    href: "/super-admin",
    label: "Overview",
    icon: FiHome,
    match: "exact",
  },
  {
    href: "/super-admin/users/create",
    label: "Create User",
    icon: FiUserPlus,
    match: "prefix",
  },
  {
    href: "/super-admin/users",
    label: "Users",
    icon: FiUsers,
    match: "prefix",
  },
];

const masterItems: NavItem[] = [
  {
    href: "/super-admin/masters/labs",
    label: "Lab Master",
    icon: FiClipboard,
    match: "prefix",
  },
  {
    href: "/super-admin/masters/tests",
    label: "Test Master",
    icon: FiBox,
    match: "prefix",
  },
  {
    href: "/super-admin/masters/packages",
    label: "Package Master",
    icon: FiGrid,
    match: "prefix",
  },
  {
    href: "/super-admin/masters/settings",
    label: "Global Settings",
    icon: FiSettings,
    match: "prefix",
  },
];

function isItemActive(pathname: string, item: NavItem) {
  if (item.match === "exact") {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function SidebarSection({
  title,
  items,
}: {
  title: string;
  items: NavItem[];
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-3">
      <p className="px-3 text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
        {title}
      </p>
      <nav className="space-y-1.5">
        {items.map((item) => {
          const active = isItemActive(pathname, item);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
                active
                  ? "bg-sky-500 text-white shadow-[0_10px_30px_rgba(14,165,233,0.28)]"
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
  );
}

export function SuperAdminSidebarNav() {
  return (
    <div className="space-y-8">
      <div className="rounded-[24px] border border-sky-400/20 bg-sky-400/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-200">
            <FiShield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Super Admin</p>
            <p className="text-xs text-slate-300">
              Control center for platform masters
            </p>
          </div>
        </div>
      </div>

      <SidebarSection title="Navigation" items={primaryItems} />
      <SidebarSection title="Masters" items={masterItems} />
    </div>
  );
}
