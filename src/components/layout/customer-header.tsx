"use client";
import Link from "next/link";
import { Search } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function CustomerHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-border bg-white/95 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-wine text-white text-xs font-bold">AT</div>
          <span className="font-display text-base font-bold text-brand-wine">{APP_CONFIG.name}</span>
        </Link>
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-brand-text-muted hover:bg-brand-cream tap-target" aria-label="Search">
          <Search size={20} />
        </button>
      </div>
    </header>
  );
}
