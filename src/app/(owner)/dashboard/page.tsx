"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { CalendarCheck, Package, Users, AlertTriangle, ArrowRight, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_APPOINTMENTS, MOCK_PRODUCTS, MOCK_CUSTOMERS } from "@/lib/sheets/mock-data";
import { APPOINTMENT_STATUSES } from "@/lib/constants";
import { formatPrice } from "@/lib/utils/format";
import type { Appointment } from "@/lib/sheets/schemas";

function StatusBadge({ status }: { status: Appointment["status"] }) {
  const cfg = APPOINTMENT_STATUSES.find((s) => s.value === status);
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg?.color ?? ""}`}><span className={`h-1.5 w-1.5 rounded-full ${cfg?.dot ?? ""}`} />{cfg?.label ?? status}</span>;
}

export default function DashboardPage() {
  const today = new Date().toISOString().split("T")[0] ?? "";
  const todayApts = MOCK_APPOINTMENTS.filter((a) => a.date === today && a.status !== "cancelled");
  const pendingCount = MOCK_APPOINTMENTS.filter((a) => a.status === "pending").length;
  const lowStock = MOCK_PRODUCTS.filter((p) => p.stockAvailable <= 5 && p.stockAvailable > 0);
  const outOfStock = MOCK_PRODUCTS.filter((p) => p.stockAvailable === 0);
  const inventoryValue = MOCK_PRODUCTS.reduce((sum, p) => sum + p.sellingPrice * p.stockTotal, 0);

  const metrics = [
    { label: "Today's Appointments", value: todayApts.length, sub: `${pendingCount} pending`, icon: CalendarCheck, color: "bg-brand-wine", href: "/dashboard/appointments" },
    { label: "Total Products", value: MOCK_PRODUCTS.length, sub: `${lowStock.length} low stock`, icon: Package, color: "bg-brand-gold", href: "/dashboard/products" },
    { label: "Customers", value: MOCK_CUSTOMERS.length, sub: "registered", icon: Users, color: "bg-blue-500", href: "/dashboard/customers" },
    { label: "Inventory Value", value: formatPrice(inventoryValue), sub: `${outOfStock.length} out of stock`, icon: IndianRupee, color: "bg-emerald-600", href: "/dashboard/inventory" },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl font-bold text-gray-900">Dashboard</h1><p className="text-sm text-gray-500">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p></div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link href={m.href}><Card className="hover:shadow-md transition-shadow cursor-pointer"><CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{m.label}</p><p className="mt-1 font-display text-2xl font-bold text-gray-900">{m.value}</p><p className="text-xs text-gray-400">{m.sub}</p></div>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${m.color}`}><m.icon size={20} className="text-white" /></div>
              </div>
            </CardContent></Card></Link>
          </motion.div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Today&apos;s Appointments</CardTitle>
            <Link href="/dashboard/appointments" className="flex items-center gap-1 text-xs text-brand-wine hover:underline">View all <ArrowRight size={12} /></Link>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {todayApts.length === 0 ? (<p className="py-6 text-center text-sm text-gray-400">No appointments today</p>) : todayApts.map((apt) => (
              <Link key={apt.id} href={`/dashboard/appointments/${apt.id}`} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 hover:bg-gray-100 transition-colors">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-wine/10"><span className="text-sm font-bold text-brand-wine">{apt.time}</span></div>
                <div className="flex-1 min-w-0"><p className="font-medium text-sm text-gray-900 truncate">{apt.customerName}</p><p className="text-xs text-gray-500">{apt.totalItems} items · {apt.notes || "No notes"}</p></div>
                <StatusBadge status={apt.status} />
              </Link>
            ))}
            <Link href="/dashboard/appointments/new"><Button variant="outline" className="mt-2 w-full gap-2" size="sm"><CalendarCheck size={15} /> New Appointment</Button></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2"><AlertTriangle size={16} className="text-amber-500" /> Stock Alerts</CardTitle>
            <Link href="/dashboard/inventory" className="flex items-center gap-1 text-xs text-brand-wine hover:underline">View all <ArrowRight size={12} /></Link>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {outOfStock.length === 0 && lowStock.length === 0 ? (<p className="py-6 text-center text-sm text-gray-400">All stock levels healthy</p>) : [
              ...outOfStock, ...lowStock].slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100"><Package size={15} className="text-amber-600" /></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{p.name}</p><p className="text-xs text-gray-500">SKU: {p.sku} · Rack: {p.rackLocation || "—"}</p></div>
                <span className={`text-xs font-bold ${p.stockAvailable === 0 ? "text-red-600" : "text-amber-600"}`}>{p.stockAvailable === 0 ? "OUT" : `${p.stockAvailable} left`}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
