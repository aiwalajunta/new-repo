"use client";
import Link from "next/link";
import { Search, ShoppingBag } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { APP_CONFIG } from "@/lib/constants";

export function Header() {
  const { cartItems, setSearchOpen, language } = useAppStore();
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  return (
    <header className="sticky top-0 z-40 border-b border-brand-border bg-white/95 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-lg font-bold text-brand-wine">{language === "hi" ? "आदित्य" : "Aditya"}</span>
          <span className="hidden text-xs text-brand-text-muted sm:block">{language === "hi" ? "एथनिक की कला" : APP_CONFIG.tagline}</span>
        </Link>
        <div className="flex items-center gap-1">
          <button onClick={() => setSearchOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-full text-brand-text-muted transition-colors hover:bg-brand-cream hover:text-brand-text tap-target" aria-label="Search products"><Search size={20} /></button>
          <Link href="/cart" className="relative flex h-10 w-10 items-center justify-center rounded-full text-brand-text-muted transition-colors hover:bg-brand-cream hover:text-brand-text tap-target" aria-label={`Cart with ${cartCount} items`}>
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-wine text-[10px] font-bold text-white">{cartCount > 99 ? "99+" : cartCount}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
