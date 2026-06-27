"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { CalendarCheck, Package, Users, AlertTriangle, IndianRupee, ArrowRight, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_CUSTOMERS } from "@/lib/sheets/mock-data";
import { APPOINTMENT_STATUSES } from "@/lib/constants";
import { formatPrice } from "@/lib/utils/format";
import { useProductStore } from "@/store/product-store";
import { useAppointmentStore } from "@/store/appointment-store";
import type { Appointment } from "@/lib/sheets/schemas";

function StatusBadge({ status }: { status: Appointment["status"] }) {
  const cfg = APPOINTMENT_STATUSES.find((s) => s.value === status);
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg?.color ?? ""}`}><span className={`h-1.5 w-1.5 rounded-full ${cfg?.dot ?? ""}`} />{cfg?.label ?? status}</span>;
}

export default function DashboardPage() {
  const { products } = useProductStore();
  const { appointments } = useAppointmentStore();

  const today = new Date().toISOString().split("T")[0] ?? "";
  const todayApts = appointments.filter((a) => a.date === today && a.status !== "cancelled");
  const pendingCount = appointments.filter((a) => a.status === "pending").length;
  const lowStock = products.filter((p) => p.stockAvailable <= 5 && p.stockAvailable > 0);
  const outOfStock = products.filter((p) => p.stockAvailable === 0);
  const inventoryValue = products.reduce((sum, p) => sum + (p.sellingPrice || 0) * (p.stockTotal || 0), 0);

  const metrics = [
    { label: "Today's Appointments", value: todayApts.length, sub: `${pendingCount} pending`, icon: CalendarCheck, color: "bg-brand-wine", href: "/dashboard/appointments" },
    { label: "Total Products", value: products.length, sub: `${lowStock.length} low stock`, icon: Package, color: "bg-brand-gold", href: "/dashboard/products" },
    { label: "Customers", value: MOCK_CUSTOMERS.length, sub: "registered", icon: Users, color: "bg-blue-500", href: "/dashboard/customers" },
    { label: "Inventory Value", value: formatPrice(inventoryValue), sub: `${outOfStock.length} out of stock`, icon: IndianRupee, color: "bg-emerald-600", href: "/dashboard/inventory" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link href={m.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{m.label}</p>
                      <p className="mt-1 font-display text-2xl font-bold text-gray-900">{m.value}</p>
                      <p className="text-xs text-gray-400">{m.sub}</p>
                    </div>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${m.color}`}>
                      <m.icon size={20} className="text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2 text-amber-800"><AlertTriangle size={16}/> Stock Alerts</CardTitle></CardHeader>
          <CardContent className="space-y-1.5 pt-0">
            {outOfStock.map((p) => (<div key={p.id} className="flex items-center justify-between text-sm"><span className="text-red-700 font-medium">{p.name}</span><Badge variant="danger" className="text-[10px]">OUT OF STOCK</Badge></div>))}
            {lowStock.map((p) => (<div key={p.id} className="flex items-center justify-between text-sm"><span className="text-amber-800">{p.name}</span><span className="text-xs font-semibold text-amber-700">{p.stockAvailable} left</span></div>))}
            <Link href="/dashboard/products"><Button variant="outline" size="sm" className="mt-2 w-full text-amber-700 border-amber-300">Manage Stock</Button></Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Today&apos;s Appointments</CardTitle>
            <Link href="/dashboard/appointments" className="flex items-center gap-1 text-xs text-brand-wine hover:underline">View all <ArrowRight size={12} /></Link>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {todayApts.length === 0
              ? <p className="py-6 text-center text-sm text-gray-400">No appointments today</p>
              : todayApts.map((apt) => (
                <Link key={apt.id} href={`/dashboard/appointments/${apt.id}`} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 hover:bg-gray-100 transition-colors">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-wine/10"><span className="text-sm font-bold text-brand-wine">{apt.time}</span></div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{apt.customerName}</p><p className="text-xs text-gray-400">{apt.customerPhone}</p></div>
                  <StatusBadge status={apt.status} />
                </Link>
              ))}
            <Link href="/dashboard/appointments/new"><Button variant="outline" size="sm" className="w-full mt-1 gap-2"><Plus size={13}/> New Appointment</Button></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 pt-0">
            {[
              { label: "Add Product", href: "/dashboard/products", icon: "\ud83d\udce6" },
              { label: "New Appointment", href: "/dashboard/appointments/new", icon: "\ud83d\udcc5" },
              { label: "Price Lookup", href: "/dashboard/staff-lookup", icon: "\ud83d\udd0d" },
              { label: "View Inventory", href: "/dashboard/inventory", icon: "\ud83d\udcca" },
            ].map((a) => (
              <Link key={a.label} href={a.href}>
                <button className="w-full flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-3 text-sm font-medium text-gray-700 hover:bg-brand-wine/5 hover:border-brand-wine/30 transition-colors">
                  <span className="text-lg">{a.icon}</span> {a.label}
                </button>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
