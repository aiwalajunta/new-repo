"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Plus, Clock, Phone, Package, ChevronRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppointmentStore } from "@/store/appointment-store";
import { APPOINTMENT_STATUSES } from "@/lib/constants";
import { toast } from "@/hooks/use-toast";
import type { Appointment } from "@/lib/sheets/schemas";

function StatusBadge({ status }: { status: Appointment["status"] }) {
  const cfg = APPOINTMENT_STATUSES.find((s) => s.value === status);
  return (<span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cfg?.color ?? ""}`}><span className={`h-1.5 w-1.5 rounded-full ${cfg?.dot ?? ""}`} />{cfg?.label ?? status}</span>);
}

export default function AppointmentsPage() {
  const { appointments, hydrated, updateAppointment, deleteAppointment } = useAppointmentStore();
  const [dateFilter, setDateFilter] = useState<"today" | "upcoming" | "all">("today");

  if (!hydrated) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center space-y-3">
        <div className="text-4xl">\ud83d\udcc5</div>
        <p className="text-sm text-gray-400">Loading appointments...</p>
      </div>
    </div>
  );

  const today = new Date().toISOString().split("T")[0] ?? "";
  const filtered = appointments.filter((a) => {
    if (dateFilter === "today") return a.date === today && a.status !== "cancelled";
    if (dateFilter === "upcoming") return a.date >= today && a.status !== "cancelled";
    return true;
  }).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  const handleStatusChange = (id: string, status: Appointment["status"]) => {
    updateAppointment(id, { status });
    toast({ title: `Status updated to ${status}`, variant: "success" });
  };

  const handleDelete = (id: string, name: string) => {
    deleteAppointment(id);
    toast({ title: `Appointment for ${name} deleted`, variant: "success" });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold text-gray-900">Appointments</h1><p className="text-sm text-gray-500">{filtered.length} {dateFilter === "today" ? "today" : dateFilter === "upcoming" ? "upcoming" : "total"}</p></div>
        <Link href="/dashboard/appointments/new"><Button size="sm" className="gap-2"><Plus size={15} /> New</Button></Link>
      </div>
      <div className="flex rounded-xl border border-gray-200 bg-white p-1">
        {([["today", "Today"], ["upcoming", "Upcoming"], ["all", "All"]] as const).map(([v, l]) => (<button key={v} onClick={() => setDateFilter(v)} className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${dateFilter === v ? "bg-brand-wine text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>{l}</button>))}
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
          <CalendarCheck size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500">No appointments {dateFilter === "today" ? "today" : dateFilter === "upcoming" ? "upcoming" : ""}</p>
          <Link href="/dashboard/appointments/new"><Button variant="outline" size="sm" className="mt-4 gap-2"><Plus size={14} /> Create Appointment</Button></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap"><p className="font-semibold text-gray-900">{a.customerName}</p><StatusBadge status={a.status} /></div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1"><Clock size={11}/> {a.date} at {a.time}</span>
                        <span className="flex items-center gap-1"><Phone size={11}/> {a.customerPhone}</span>
                        {a.totalItems > 0 && <span className="flex items-center gap-1"><Package size={11}/> {a.totalItems} items</span>}
                      </div>
                      {a.notes && <p className="text-xs text-gray-400 mt-1 truncate">{a.notes}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <select value={a.status} onChange={(e) => handleStatusChange(a.id, e.target.value as Appointment["status"])} className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-wine">
                        {APPOINTMENT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      <Link href={`/dashboard/appointments/${a.id}`}><button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"><ChevronRight size={16}/></button></Link>
                      <button onClick={() => handleDelete(a.id, a.customerName)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
