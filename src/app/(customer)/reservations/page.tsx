"use client";
import { CalendarCheck, Clock, CheckCircle, Package, XCircle, Plus } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/empty-state";
import { Skeleton } from "@/components/common/skeleton";
import { useReservations } from "@/hooks/use-reservations";
import { useAppStore } from "@/store/app-store";
import type { Reservation } from "@/lib/sheets/schemas";

const STATUS_CONFIG: Record<Reservation["status"], { label: string; labelHi: string; icon: React.ComponentType<{ size?: number; className?: string }>; variant: "default"|"secondary"|"success"|"warning"|"danger"|"outline" }> = {
  pending: { label: "Pending", labelHi: "लंबित", icon: Clock, variant: "warning" },
  confirmed: { label: "Confirmed", labelHi: "पुष्टि की गई", icon: CheckCircle, variant: "secondary" },
  ready: { label: "Ready to Visit", labelHi: "विज़िट के लिए तैयार", icon: Package, variant: "success" },
  completed: { label: "Completed", labelHi: "पूर्ण", icon: CheckCircle, variant: "outline" },
  cancelled: { label: "Cancelled", labelHi: "रद्द", icon: XCircle, variant: "danger" },
  expired: { label: "Expired", labelHi: "समाप्त", icon: XCircle, variant: "danger" },
};

function ReservationCard({ reservation }: { reservation: Reservation }) {
  const language = useAppStore((s) => s.language);
  const cfg = STATUS_CONFIG[reservation.status];
  const Icon = cfg.icon;
  const visitDate = new Date(reservation.visitDate).toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", { weekday: "short", day: "numeric", month: "short" });
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm">
      <div className={`h-1 w-full ${reservation.status === "ready" ? "bg-brand-emerald" : reservation.status === "confirmed" ? "bg-brand-gold" : reservation.status === "pending" ? "bg-amber-400" : "bg-brand-border"}`} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-xs text-brand-text-muted">{language === "hi" ? "आरक्षण #" : "Reservation #"}{reservation.id.slice(-6).toUpperCase()}</p>
            <p className="mt-1 font-medium text-brand-text">📅 {visitDate} · ⏰ {reservation.visitTime}</p>
            {reservation.notes && <p className="mt-1 text-xs text-brand-text-muted">{reservation.notes}</p>}
          </div>
          <Badge variant={cfg.variant} className="shrink-0 gap-1"><Icon size={12} />{language === "hi" ? cfg.labelHi : cfg.label}</Badge>
        </div>
        {reservation.status === "ready" && <div className="mt-3 rounded-xl bg-brand-emerald-light px-3 py-2 text-sm text-brand-emerald">🎉 {language === "hi" ? "आपकी आइटम तैयार है! आज दुकान पर आएं।" : "Your item is ready! Please visit the store today."}</div>}
        {reservation.status === "pending" && <p className="mt-2 text-xs text-brand-text-muted">{language === "hi" ? "हम जल्द पुष्टि करेंगे।" : "We'll confirm shortly."}</p>}
      </div>
    </motion.div>
  );
}

export default function ReservationsPage() {
  const language = useAppStore((s) => s.language);
  const { reservations, isLoading } = useReservations();
  const active = reservations.filter((r) => !["completed","cancelled","expired"].includes(r.status));
  const past = reservations.filter((r) => ["completed","cancelled","expired"].includes(r.status));
  return (
    <div className="space-y-5 px-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-brand-text">{language === "hi" ? "मेरे आरक्षण" : "My Reservations"}</h1>
        <Button asChild size="sm" variant="outline" className="gap-1.5"><Link href="/categories"><Plus size={16} />{language === "hi" ? "नया" : "New"}</Link></Button>
      </div>
      {isLoading ? (<div className="space-y-3">{[1,2].map((i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}</div>) : reservations.length === 0 ? (
        <EmptyState icon={CalendarCheck} title={language === "hi" ? "कोई आरक्षण नहीं" : "No reservations yet"} description={language === "hi" ? "उत्पाद देखें और दुकान पर विज़िट आरक्षित करें" : "Browse products and reserve a visit to our store"} actionLabel={language === "hi" ? "उत्पाद देखें" : "Browse Products"} actionHref="/categories" />
      ) : (
        <div className="space-y-6">
          {active.length > 0 && <section className="space-y-3"><h2 className="text-sm font-semibold uppercase tracking-wide text-brand-text-muted">{language === "hi" ? "सक्रिय" : "Active"}</h2>{active.map((r) => <ReservationCard key={r.id} reservation={r} />)}</section>}
          {past.length > 0 && <section className="space-y-3"><h2 className="text-sm font-semibold uppercase tracking-wide text-brand-text-muted">{language === "hi" ? "पिछले" : "Past"}</h2>{past.map((r) => <ReservationCard key={r.id} reservation={r} />)}</section>}
        </div>
      )}
    </div>
  );
}
