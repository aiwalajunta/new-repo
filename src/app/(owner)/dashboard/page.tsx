"use client";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Package, CalendarCheck, Users, TrendingUp, ArrowRight, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/common/skeleton";
import type { Reservation, Product } from "@/lib/sheets/schemas";

function MetricCard({ icon: Icon, label, value, sub, color, delay }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string | number; sub?: string; color: string; delay: number }) {
  return (<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}><Card><CardContent className="flex items-center gap-4 p-4"><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${color}`}><Icon size={22} className="text-white" /></div><div><p className="text-xs font-medium uppercase tracking-wide text-brand-text-muted">{label}</p><p className="font-display text-2xl font-bold text-brand-text">{value}</p>{sub && <p className="text-xs text-brand-text-light">{sub}</p>}</div></CardContent></Card></motion.div>);
}

export default function OwnerDashboard() {
  const { data: reservations = [], isLoading: resLoading } = useQuery<Reservation[]>({ queryKey: ["reservations", "owner"], queryFn: async () => { const res = await fetch("/api/reservations"); const data = (await res.json()) as { data: Reservation[] }; return data.data ?? []; } });
  const { data: products = [] } = useQuery<Product[]>({ queryKey: ["products"], queryFn: async () => { const res = await fetch("/api/products"); const data = (await res.json()) as { data: Product[] }; return data.data ?? []; } });

  const todaysReservations = reservations.filter((r) => r.status !== "cancelled" && r.status !== "expired");
  const pendingCount = reservations.filter((r) => r.status === "pending").length;
  const readyCount = reservations.filter((r) => r.status === "ready").length;
  const STATUS_ICON: Record<Reservation["status"], React.ReactNode> = {
    pending: <Clock size={14} className="text-amber-500" />, confirmed: <CheckCircle size={14} className="text-brand-gold" />, ready: <CheckCircle size={14} className="text-brand-emerald" />, completed: <CheckCircle size={14} className="text-brand-text-light" />, cancelled: <AlertTriangle size={14} className="text-red-400" />, expired: <AlertTriangle size={14} className="text-red-400" />,
  };

  return (
    <div className="space-y-6 px-4 py-4 pb-24">
      <div><h1 className="font-display text-2xl font-bold text-brand-text">Dashboard</h1><p className="text-sm text-brand-text-muted">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p></div>
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={CalendarCheck} label="Today's Reservations" value={todaysReservations.length} sub={`${pendingCount} pending`} color="bg-brand-wine" delay={0} />
        <MetricCard icon={Package} label="Products" value={products.length} sub="active listings" color="bg-brand-gold" delay={0.05} />
        <MetricCard icon={AlertTriangle} label="Needs Attention" value={pendingCount} sub="awaiting confirmation" color="bg-amber-500" delay={0.1} />
        <MetricCard icon={TrendingUp} label="Ready" value={readyCount} sub="items ready for pickup" color="bg-brand-emerald" delay={0.15} />
      </div>
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-text-muted">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {[{ label: "Add Product", icon: Package, href: "/dashboard/products/new", color: "bg-brand-wine/10 text-brand-wine" },{ label: "View Reservations", icon: CalendarCheck, href: "/dashboard/reservations", color: "bg-brand-gold/10 text-brand-gold-muted" },{ label: "Customers", icon: Users, href: "/dashboard/customers", color: "bg-brand-emerald/10 text-brand-emerald" },{ label: "Analytics", icon: TrendingUp, href: "/dashboard/analytics", color: "bg-purple-100 text-purple-600" }].map(({ label, icon: Icon, href, color }) => (<Link key={href} href={href} className="flex items-center gap-3 rounded-2xl border border-brand-border bg-white p-4 shadow-sm transition-all hover:border-brand-wine hover:shadow-md"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon size={20} /></div><span className="text-sm font-medium text-brand-text">{label}</span></Link>))}
        </div>
      </section>
      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold uppercase tracking-wide text-brand-text-muted">Today's Schedule</h2><Link href="/dashboard/reservations" className="flex items-center gap-1 text-xs font-medium text-brand-wine hover:underline">View all <ArrowRight size={12} /></Link></div>
        {resLoading ? (<div className="space-y-2">{[1,2,3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>) : todaysReservations.length === 0 ? (<div className="rounded-2xl border border-dashed border-brand-border bg-white/50 py-8 text-center"><p className="text-sm text-brand-text-muted">No reservations scheduled for today</p></div>) : (
          <div className="space-y-2">{todaysReservations.slice(0, 5).map((r) => (<motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 rounded-xl border border-brand-border bg-white p-3 shadow-sm"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-cream text-lg">📅</div><div className="flex-1 min-w-0"><p className="truncate text-sm font-medium text-brand-text">#{r.id.slice(-6).toUpperCase()}</p><p className="text-xs text-brand-text-muted">{r.visitTime}</p></div><div className="flex items-center gap-1.5">{STATUS_ICON[r.status]}<span className="text-xs capitalize text-brand-text-muted">{r.status}</span></div></motion.div>))}</div>
        )}
      </section>
    </div>
  );
}
