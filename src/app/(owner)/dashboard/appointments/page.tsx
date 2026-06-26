"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Plus, Phone, Package, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_APPOINTMENTS } from "@/lib/sheets/mock-data";
import { APPOINTMENT_STATUSES } from "@/lib/constants";
import type { Appointment } from "@/lib/sheets/schemas";

function StatusBadge({ status }: { status: Appointment["status"] }) {
  const cfg = APPOINTMENT_STATUSES.find((s) => s.value === status);
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cfg?.color ?? ""}`}><span className={`h-1.5 w-1.5 rounded-full ${cfg?.dot ?? ""}`} />{cfg?.label ?? status}</span>;
}

export default function AppointmentsPage() {
  const [dateFilter, setDateFilter] = useState<"today"|"upcoming"|"all">("today");
  const today = new Date().toISOString().split("T")[0] ?? "";
  const filtered = MOCK_APPOINTMENTS.filter((a) => {
    if (dateFilter === "today") return a.date === today && a.status !== "cancelled";
    if (dateFilter === "upcoming") return a.date > today && a.status !== "cancelled";
    return true;
  }).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold text-gray-900">Appointments</h1><p className="text-sm text-gray-500">{filtered.length} {dateFilter}</p></div>
        <Link href="/dashboard/appointments/new"><Button size="sm" className="gap-2"><Plus size={15} /> New</Button></Link>
      </div>
      <div className="flex rounded-xl border border-gray-200 bg-white p-1 w-fit gap-1">
        {(["today","upcoming","all"] as const).map((f) => (<button key={f} onClick={() => setDateFilter(f)} className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors ${dateFilter === f ? "bg-brand-wine text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}>{f}</button>))}
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {APPOINTMENT_STATUSES.slice(0, 7).map((s) => { const count = MOCK_APPOINTMENTS.filter((a) => a.status === s.value).length; return (
          <div key={s.value} className={`shrink-0 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${s.color}`}><span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />{s.label}: {count}</div>
        ); })}
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center"><CalendarCheck size={40} className="mx-auto mb-3 text-gray-300" /><p className="text-sm text-gray-500">No appointments</p><Link href="/dashboard/appointments/new"><Button variant="outline" className="mt-4" size="sm">Create First</Button></Link></div>
      ) : (
        <div className="space-y-3">{filtered.map((apt, i) => (
          <motion.div key={apt.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Link href={`/dashboard/appointments/${apt.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer"><CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-wine/10 text-brand-wine">
                    <span className="text-[10px] font-medium">{apt.date === today ? "TODAY" : new Date(apt.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    <span className="text-base font-bold leading-tight">{apt.time}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">{apt.customerName}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-gray-500"><Phone size={11} /> {apt.customerPhone}</span>
                          <span className="flex items-center gap-1 text-xs text-gray-500"><Package size={11} /> {apt.totalItems} items</span>
                        </div>
                        {apt.notes && <p className="mt-1 text-xs text-gray-400 italic">"{apt.notes}"</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0"><StatusBadge status={apt.status} /><ChevronRight size={16} className="text-gray-300" /></div>
                    </div>
                    {["preparing","ready","arrived","trial"].includes(apt.status) && (
                      <div className="mt-3 h-1.5 rounded-full bg-gray-100">
                        <div className={`h-full rounded-full transition-all ${apt.status === "preparing" ? "w-1/3 bg-amber-400" : apt.status === "ready" ? "w-1/2 bg-green-400" : apt.status === "arrived" ? "w-2/3 bg-purple-400" : "w-5/6 bg-pink-400"}`} />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent></Card>
            </Link>
          </motion.div>
        ))}</div>
      )}
    </div>
  );
}
