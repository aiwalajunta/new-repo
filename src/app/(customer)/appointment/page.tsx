"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarCheck, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { TIME_SLOTS } from "@/lib/constants";
import { MOCK_PRODUCTS } from "@/lib/sheets/mock-data";
import { toast } from "@/hooks/use-toast";

function AppointmentContent() {
  const searchParams = useSearchParams();
  const productIds = (searchParams.get("products") ?? "").split(",").filter(Boolean);
  const preselected = MOCK_PRODUCTS.filter((p) => productIds.includes(p.id));
  const [form, setForm] = useState({ name: "", phone: "", date: "", time: "", notes: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date || !form.time) {
      toast({ title: "Please fill in all required fields", variant: "error" }); return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center space-y-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100"><CalendarCheck size={40} className="text-green-600" /></div>
        <h2 className="font-display text-2xl font-bold text-brand-text">Appointment Requested!</h2>
        <p className="text-brand-text-muted max-w-xs">We received your request for <strong>{form.date}</strong> at <strong>{form.time}</strong>. We will call <strong>{form.phone}</strong> to confirm.</p>
        <div className="rounded-xl bg-brand-cream border border-brand-border p-4 w-full max-w-xs text-left space-y-2">
          <p className="text-xs font-semibold text-brand-text-muted uppercase tracking-wide">What happens next</p>
          <p className="text-sm text-brand-text">📞 We will call to confirm</p>
          <p className="text-sm text-brand-text">🧵 Staff will prepare your items</p>
          <p className="text-sm text-brand-text">🏪 Visit us at the scheduled time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-4 py-4 max-w-lg mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-text">Book Showroom Visit</h1>
        <p className="text-sm text-brand-text-muted">Select a date and time. We will prepare your selected items.</p>
      </div>
      {preselected.length > 0 && (
        <Card><CardContent className="p-4">
          <p className="text-sm font-semibold text-brand-text mb-2">Selected Items ({preselected.length})</p>
          <div className="space-y-1.5">{preselected.map((p) => (
            <div key={p.id} className="flex items-center gap-2 text-sm">
              <span>{p.categoryId === "cat_003" ? "👗" : p.categoryId === "cat_004" ? "👚" : "🥻"}</span>
              <span className="text-brand-text font-medium truncate">{p.name}</span>
            </div>
          ))}</div>
        </CardContent></Card>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card><CardContent className="p-4 space-y-3">
          <div className="space-y-1"><label className="text-xs font-medium text-gray-600">Your Name *</label><Input placeholder="Rajeev Kumar" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required /></div>
          <div className="space-y-1"><label className="text-xs font-medium text-gray-600">Phone Number *</label><div className="relative"><Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><Input placeholder="+91 98765 43210" type="tel" className="pl-9" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required /></div></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className="text-xs font-medium text-gray-600">Date *</label><Input type="date" value={form.date} min={new Date().toISOString().split("T")[0]} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required /></div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Time *</label>
              <select value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} required className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-wine">
                <option value="">Select time</option>{TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1"><label className="text-xs font-medium text-gray-600">Special Requests</label><Input placeholder="e.g. Bridal lehenga, budget \u20b930,000" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
        </CardContent></Card>
        <div className="rounded-xl bg-brand-cream border border-brand-border p-4 space-y-1 text-sm">
          <p className="font-semibold text-brand-text flex items-center gap-1.5"><MapPin size={14} /> Aditya Textile</p>
          <p className="text-brand-text-muted">Manpur Patwatoli, PO Buniadganj</p>
          <p className="text-brand-text-muted">Gaya - 823003, Bihar</p>
          <p className="text-brand-text-muted flex items-center gap-1.5 mt-1"><Clock size={12} /> Mon–Sat, 10am–8pm</p>
        </div>
        <Button type="submit" className="w-full gap-2" size="lg"><CalendarCheck size={18} /> Request Appointment</Button>
      </form>
    </div>
  );
}

export default function AppointmentPage() {
  return (
    <Suspense fallback={<div className="px-4 py-8 text-center text-gray-400">Loading...</div>}>
      <AppointmentContent />
    </Suspense>
  );
}
