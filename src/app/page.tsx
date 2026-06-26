"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarPlus, Search, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/lib/constants";
import { MOCK_CATEGORIES } from "@/lib/sheets/mock-data";
import { BottomNav } from "@/components/layout/bottom-nav";
import { CustomerHeader } from "@/components/layout/customer-header";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <CustomerHeader />
      <main className="flex-1 pb-20">
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-wine to-brand-wine-dark px-6 py-14 text-center text-white">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-gold/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative">
            <p className="text-xs font-medium uppercase tracking-widest text-brand-gold/80 mb-2">Welcome to</p>
            <h1 className="font-display text-3xl font-bold">{APP_CONFIG.name}</h1>
            <p className="mt-1 text-brand-gold/90 font-medium">{APP_CONFIG.tagline}</p>
            <p className="mt-3 text-sm text-white/70 max-w-xs mx-auto">India&apos;s finest ethnic textile collection. Browse and book your showroom visit.</p>
            <div className="mt-6 flex gap-3 justify-center flex-wrap">
              <Link href="/browse"><Button className="bg-brand-gold text-brand-wine font-bold hover:bg-brand-gold-light gap-2"><Search size={16} /> Browse Products</Button></Link>
              <Link href="/appointment"><Button variant="outline" className="border-white/40 text-white hover:bg-white/10 gap-2"><CalendarPlus size={16} /> Book Visit</Button></Link>
            </div>
          </motion.div>
        </section>
        <section className="bg-brand-cream px-6 py-3 border-b border-brand-border">
          <div className="flex items-center justify-around gap-4 text-xs text-brand-text-muted flex-wrap">
            <div className="flex items-center gap-1"><Clock size={12} /> Mon–Sat 10am–8pm</div>
            <div className="flex items-center gap-1"><Phone size={12} /> +91 97xxx xxxxx</div>
            <div className="flex items-center gap-1"><MapPin size={12} /> Manpur Patwatoli, Gaya</div>
          </div>
        </section>
        <section className="px-4 py-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-brand-text">Shop by Category</h2>
            <Link href="/browse" className="text-sm text-brand-wine hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {MOCK_CATEGORIES.slice(0, 8).map((cat, i) => (
              <motion.div key={cat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link href={`/browse?cat=${cat.slug}`} className="flex flex-col items-center gap-1.5 rounded-2xl border border-brand-border bg-white p-3 shadow-sm hover:border-brand-gold hover:shadow-md transition-all">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-center text-[10px] font-medium text-brand-text leading-tight">{cat.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
        <section className="mx-4 mb-6 rounded-2xl bg-gradient-to-br from-brand-wine/5 to-brand-gold/5 border border-brand-border p-5">
          <h2 className="font-display text-base font-bold text-brand-text mb-4">How to Shop With Us</h2>
          <div className="space-y-3">
            {[
              { step: "1", title: "Browse Our Collection", desc: "Explore sarees, lehengas, kurtis and more" },
              { step: "2", title: "Select Products", desc: "Mark items you want to see in our showroom" },
              { step: "3", title: "Book Your Visit", desc: "Choose a convenient date and time" },
              { step: "4", title: "We Prepare Everything", desc: "All items will be ready when you arrive" },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-wine text-white text-xs font-bold">{s.step}</div>
                <div><p className="text-sm font-semibold text-brand-text">{s.title}</p><p className="text-xs text-brand-text-muted">{s.desc}</p></div>
              </div>
            ))}
          </div>
          <Link href="/appointment" className="mt-4 block">
            <Button className="w-full gap-2"><CalendarPlus size={16} /> Book Your Visit Now</Button>
          </Link>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
