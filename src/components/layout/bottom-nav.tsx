"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3x3, CalendarPlus, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { CUSTOMER_NAV } from "@/lib/constants";

const ICONS = { Home, Grid3x3, CalendarPlus, CalendarCheck } as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-border bg-white/95 backdrop-blur-lg"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1">
        {CUSTOMER_NAV.map((item) => {
          const Icon = ICONS[item.icon as keyof typeof ICONS];
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={cn("flex min-w-[60px] flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-[11px] font-medium transition-colors tap-target",
                isActive ? "text-brand-wine" : "text-brand-text-light hover:text-brand-text-muted"
              )}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
