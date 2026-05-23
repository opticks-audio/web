"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Download,
  Package,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const ITEMS: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/subscribers", label: "Subscribers", icon: Users },
  { href: "/admin/downloads", label: "Downloads", icon: Download },
  { href: "/admin/releases", label: "Releases", icon: Package },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
              active
                ? "bg-[var(--background-elevated)] text-[var(--foreground)]"
                : "text-[var(--foreground-muted)] hover:bg-[var(--background-elevated)]/60 hover:text-[var(--foreground)]",
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0 transition",
                active
                  ? "text-[var(--foreground)]"
                  : "text-[var(--foreground-subtle)] group-hover:text-[var(--foreground)]",
              )}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
