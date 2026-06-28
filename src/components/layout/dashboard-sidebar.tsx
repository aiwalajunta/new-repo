"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, CalendarCheck, Users, BarChart3, LogOut, Menu, X, Search, Bot } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { APP_CONFIG, OWNER_NAV } from "@/lib/constants";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

const ICONS = { LayoutDashboard, Package, CalendarCheck, Users, BarChart3, Search, Bot } as const;

export function DashboardSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role ?? "";

  const navItems = role === "staff"
    ? OWNER_NAV.filter((item) => ["/dashboard/staff-lookup", "/dashboard/appointments"].includes(item.href))
    : OWNER_NAV;

  const nav = (
    <nav className="flex flex-col gap-0.5 p-3">
      {navItems.map((item) => {
        const Icon = ICONS[item.icon as keyof typeof ICONS];
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
            className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-brand-wine text-white shadow-sm" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900")}>
            <Icon size={18} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <button onClick={() => setOpen(!open)} className="fixed left-3 top-3 z-50 flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-md border border-gray-200 md:hidden" aria-label="Toggle menu">
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>
      {open && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}
      <aside className={cn("fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-gray-200 bg-white transition-transform duration-200 md:relative md:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-14 items-center gap-3 border-b border-gray-200 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-wine text-white text-xs font-bold">AT</div>
          <div><p className="text-sm font-bold text-brand-wine leading-tight">{APP_CONFIG.name}</p><p className="text-[10px] text-gray-400">{APP_CONFIG.tagline}</p></div>
        </div>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        <div className="border-t border-gray-200 p-3">
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
