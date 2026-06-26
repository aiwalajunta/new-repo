"use client";
import { use, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, Package, CheckCircle, Circle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MOCK_APPOINTMENTS, MOCK_APPOINTMENT_ITEMS, MOCK_PRODUCTS } from "@/lib/sheets/mock-data";
import { APPOINTMENT_STATUSES } from "@/lib/constants";
import type { Appointment } from "@/lib/sheets/schemas";
import { toast } from "@/hooks/use-toast";

function StatusBadge({ status }: { status: Appointment["status"] }) {
  const cfg = APPOINTMENT_STATUSES.find((s) => s.value === status);
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${cfg?.color ?? ""}`}><span className={`h-2 w-2 rounded-full ${cfg?.dot ?? ""}`} />{cfg?.label ?? status}</span>;
}

export default function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const apt = MOCK_APPOINTMENTS.find((a) => a.id === id);
  const items = MOCK_APPOINTMENT_ITEMS.filter((i) => i.appointmentId === id);
  const [status, setStatus] = useState<Appointment["status"]>(apt?.status ?? "pending");
  const [preparedItems, setPreparedItems] = useState<Record<string, boolean>>(Object.fromEntries(items.map((i) => [i.id, i.isPrepared])));

  if (!apt) return (<div className="flex flex-col items-center justify-center py-20"><p className="text-gray-500">Appointment not found</p><Link href="/dashboard/appointments"><Button variant="outline" className="mt-4">Back</Button></Link></div>);

  const preparedCount = Object.values(preparedItems).filter(Boolean).length;
  const allPrepared = items.length > 0 && preparedCount === items.length;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/appointments"><button className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50"><ArrowLeft size={16} /></button></Link>
        <div><h1 className="font-display text-xl font-bold text-gray-900">#{apt.id.slice(-6).toUpperCase()} — {apt.customerName}</h1><p className="text-sm text-gray-500">{apt.date} at {apt.time}</p></div>
      </div>
      <Card><CardContent className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-wine text-white font-bold text-lg">{apt.customerName.charAt(0)}</div>
            <div>
              <p className="font-semibold text-gray-900">{apt.customerName}</p>
              <a href={`tel:${apt.customerPhone}`} className="flex items-center gap-1.5 text-sm text-brand-wine mt-0.5"><Phone size={13} /> {apt.customerPhone}</a>
              {apt.notes && <p className="mt-1 text-xs text-gray-500 italic">"{apt.notes}"</p>}
            </div>
          </div>
          <StatusBadge status={status} />
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium text-gray-700 shrink-0">Update Status:</p>
          <Select value={status} onValueChange={(v) => { setStatus(v as Appointment["status"]); toast({ title: "Status updated", variant: "success" }); }}>
            <SelectTrigger className="h-9 text-sm flex-1"><SelectValue /></SelectTrigger>
            <SelectContent>{APPOINTMENT_STATUSES.map((s) => (<SelectItem key={s.value} value={s.value} className="text-sm"><span className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${s.dot}`} />{s.label}</span></SelectItem>))}</SelectContent>
          </Select>
        </div>
      </CardContent></Card>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><Package size={16} /> Products to Prepare</CardTitle>
            <span className={`text-sm font-medium ${allPrepared ? "text-green-600" : "text-amber-600"}`}>{preparedCount}/{items.length} ready</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-gray-100"><div className="h-full rounded-full bg-green-500 transition-all" style={{ width: items.length > 0 ? `${(preparedCount / items.length) * 100}%` : "0%" }} /></div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {items.map((item) => {
            const product = MOCK_PRODUCTS.find((p) => p.id === item.productId);
            const prepared = preparedItems[item.id] ?? false;
            return (
              <button key={item.id} onClick={() => setPreparedItems((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                className={`w-full flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${prepared ? "border-green-200 bg-green-50" : "border-gray-100 bg-gray-50 hover:border-gray-200"}`}>
                {prepared ? <CheckCircle size={20} className="shrink-0 text-green-500" /> : <Circle size={20} className="shrink-0 text-gray-300" />}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${prepared ? "text-green-800 line-through" : "text-gray-800"}`}>{item.productName}</p>
                  <div className="flex items-center gap-2 mt-0.5"><span className="text-xs text-gray-400">SKU: {item.productSku || "—"}</span>{product?.rackLocation && <span className="text-xs font-medium text-blue-600">📍 Rack {product.rackLocation}</span>}</div>
                  {item.notes && <p className="text-xs text-amber-600 mt-0.5 italic">📝 {item.notes}</p>}
                </div>
                {prepared && <span className="shrink-0 text-xs font-medium text-green-600">Done ✓</span>}
              </button>
            );
          })}
          {allPrepared && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl bg-green-50 border border-green-200 p-3 text-center">
              <p className="text-sm font-medium text-green-700">🎉 All items prepared! Ready for customer.</p>
              <Button className="mt-2 bg-green-600 hover:bg-green-700" size="sm" onClick={() => { setStatus("ready"); toast({ title: "Marked as Ready!", variant: "success" }); }}>Mark as Ready</Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
