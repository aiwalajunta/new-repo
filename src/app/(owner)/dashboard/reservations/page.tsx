"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/common/skeleton";
import { toast } from "@/hooks/use-toast";
import type { Reservation } from "@/lib/sheets/schemas";

type FilterStatus = "all" | Reservation["status"];
const STATUS_ORDER: Reservation["status"][] = ["pending","confirmed","ready","completed","cancelled","expired"];
const STATUS_LABELS: Record<Reservation["status"], string> = { pending: "Pending", confirmed: "Confirmed", ready: "Ready", completed: "Completed", cancelled: "Cancelled", expired: "Expired" };
const STATUS_COLORS: Record<Reservation["status"], string> = { pending: "warning", confirmed: "secondary", ready: "success", completed: "outline", cancelled: "danger", expired: "danger" } as const;

function ReservationRow({ reservation }: { reservation: Reservation }) {
  const qc = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: async (newStatus: Reservation["status"]) => {
      const res = await fetch(`/api/reservations?id=${reservation.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
      if (!res.ok) throw new Error("Failed to update");
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["reservations", "owner"] }); toast({ title: "Reservation updated", variant: "success" }); },
    onError: () => toast({ title: "Update failed", variant: "error" }),
  });
  return (
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm">
      <div className={`h-1 ${reservation.status === "pending" ? "bg-amber-400" : reservation.status === "confirmed" ? "bg-brand-gold" : reservation.status === "ready" ? "bg-brand-emerald" : "bg-brand-border"}`} />
      <div className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2"><span className="font-mono text-sm font-bold text-brand-text">#{reservation.id.slice(-6).toUpperCase()}</span><Badge variant={STATUS_COLORS[reservation.status] as "warning"|"secondary"|"success"|"outline"|"danger"}>{STATUS_LABELS[reservation.status]}</Badge></div>
            <p className="mt-1 text-sm text-brand-text">📅 {reservation.visitDate} · ⏰ {reservation.visitTime}</p>
            <p className="text-xs text-brand-text-muted">Customer: {reservation.customerId.slice(-8)}</p>
            {reservation.notes && <p className="mt-1 text-xs italic text-brand-text-muted">"{reservation.notes}"</p>}
          </div>
          <Select value={reservation.status} onValueChange={(v) => updateMutation.mutate(v as Reservation["status"])} disabled={updateMutation.isPending}>
            <SelectTrigger className="w-36 h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{STATUS_ORDER.map((s) => (<SelectItem key={s} value={s} className="text-xs">{STATUS_LABELS[s]}</SelectItem>))}</SelectContent>
          </Select>
        </div>
      </div>
    </motion.div>
  );
}

export default function OwnerReservationsPage() {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const { data: reservations = [], isLoading } = useQuery<Reservation[]>({ queryKey: ["reservations", "owner"], queryFn: async () => { const res = await fetch("/api/reservations"); const data = (await res.json()) as { data: Reservation[] }; return data.data ?? []; }, refetchInterval: 30_000 });
  const filtered = filter === "all" ? reservations : reservations.filter((r) => r.status === filter);
  const counts = STATUS_ORDER.reduce((acc, s) => ({ ...acc, [s]: reservations.filter((r) => r.status === s).length }), {} as Record<Reservation["status"], number>);
  return (
    <div className="space-y-5 px-4 py-4 pb-24">
      <div className="flex items-center justify-between"><div><h1 className="font-display text-2xl font-bold text-brand-text">Reservations</h1><p className="text-sm text-brand-text-muted">{reservations.length} total</p></div><span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">{counts.pending ?? 0} pending</span></div>
      <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4">{(["all", ...STATUS_ORDER] as const).map((s) => (<button key={s} onClick={() => setFilter(s)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${filter === s ? "bg-brand-wine text-white" : "border border-brand-border bg-white text-brand-text-muted hover:bg-brand-cream"}`}>{s === "all" ? "All" : STATUS_LABELS[s]}{s !== "all" && counts[s] > 0 && <span className="ml-1 opacity-70">({counts[s]})</span>}</button>))}</div>
      {isLoading ? (<div className="space-y-3">{[1,2,3,4].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>) : filtered.length === 0 ? (<div className="rounded-2xl border border-dashed border-brand-border bg-white/50 py-12 text-center"><p className="text-sm text-brand-text-muted">No {filter === "all" ? "" : filter} reservations</p></div>) : (<div className="space-y-3">{filtered.map((r) => <ReservationRow key={r.id} reservation={r} />)}</div>)}
    </div>
  );
}
