"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3x3, Heart, CalendarCheck, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { NAV_ITEMS } from "@/lib/constants";
import { useAppStore } from "@/store/app-store";

const ICONS = { Home, Grid3x3, Heart, CalendarCheck, User } as const;

export function BottomNav() {
  const pathname = usePathname();
  const language = useAppStore((s) => s.language);
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/login") || pathname.startsWith("/signup")) return null;
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-border bg-white/95 backdrop-blur-lg" style={{ paddingBottom: "env(safe-area-inset-bottom)" }} role="navigation" aria-label="Main navigation">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon as keyof typeof ICONS];
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={cn("flex min-w-[64px] flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-[11px] font-medium transition-colors tap-target", isActive ? "text-brand-wine" : "text-brand-text-light hover:text-brand-text-muted")} aria-current={isActive ? "page" : undefined}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} className={cn(isActive && "fill-brand-wine/10")} />
              <span>{language === "hi" ? item.labelHi : item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
