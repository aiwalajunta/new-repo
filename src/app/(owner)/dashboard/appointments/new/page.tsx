"use client";
import { useState } from "react";
import { ArrowLeft, Plus, X, Search, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TIME_SLOTS } from "@/lib/constants";
import { useProductStore } from "@/store/product-store";
import { useAppointmentStore } from "@/store/appointment-store";
import { toast } from "@/hooks/use-toast";
import type { Product } from "@/lib/sheets/schemas";

export default function NewAppointmentPage() {
  const router = useRouter();
  const { products } = useProductStore();
  const { addAppointment } = useAppointmentStore();
  const [form, setForm] = useState({ customerName: "", customerPhone: "", date: "", time: "", notes: "" });
  const [selectedProducts, setSelectedProducts] = useState<Array<{ product: Product; qty: number; notes: string }>>([]);
  const [productSearch, setProductSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const searchResults = productSearch.length > 1
    ? products.filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 5)
    : [];

  const addProduct = (product: Product) => {
    if (!selectedProducts.find((s) => s.product.id === product.id)) {
      setSelectedProducts((prev) => [...prev, { product, qty: 1, notes: "" }]);
    }
    setProductSearch(""); setShowSearch(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.customerPhone || !form.date || !form.time) {
      toast({ title: "Please fill in all required fields", variant: "error" }); return;
    }
    const apt = {
      id: `apt_${Date.now()}`,
      customerId: "",
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      date: form.date,
      time: form.time,
      status: "pending" as const,
      assignedStaffId: "",
      notes: form.notes,
      totalItems: selectedProducts.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addAppointment(apt);
    toast({ title: `Appointment saved for ${form.customerName} on ${form.date} at ${form.time} \u2713`, variant: "success" });
    router.push("/dashboard/appointments");
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/appointments"><button className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50"><ArrowLeft size={16} /></button></Link>
        <h1 className="font-display text-xl font-bold text-gray-900">New Appointment</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Customer Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-xs font-medium text-gray-600">Name *</label><Input placeholder="Rajeev Kumar" value={form.customerName} onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))} required /></div>
              <div className="space-y-1"><label className="text-xs font-medium text-gray-600">Phone *</label><Input placeholder="+91 98765 43210" type="tel" value={form.customerPhone} onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-xs font-medium text-gray-600">Date *</label><Input type="date" value={form.date} min={new Date().toISOString().split("T")[0]} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required /></div>
              <div className="space-y-1"><label className="text-xs font-medium text-gray-600">Time *</label>
                <select value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} required className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-wine">
                  <option value="">Select time</option>{TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1"><label className="text-xs font-medium text-gray-600">Notes</label><Input placeholder="e.g. Bridal shopping, budget \u20b925,000" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Products to Prepare ({selectedProducts.length})</CardTitle>
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setShowSearch(!showSearch)}><Plus size={14} /> Add Product</Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {showSearch && (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input placeholder="Search products by name or SKU..." className="pl-9" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} autoFocus />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                    {searchResults.map((p) => (
                      <button key={p.id} type="button" onClick={() => addProduct(p)} className="flex w-full items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-left">
                        <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{p.name}</p><p className="text-xs text-gray-400">{p.sku} \u00b7 Rack: {p.rackLocation||"\u2014"} \u00b7 {p.stockAvailable} avail</p></div>
                        <span className="text-xs font-bold text-brand-wine">\u20b9{p.finalPrice.toLocaleString("en-IN")}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {selectedProducts.length === 0
              ? <p className="py-4 text-center text-sm text-gray-400">No products added yet</p>
              : selectedProducts.map(({ product, qty, notes }, i) => (
                <div key={product.id} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.sku} \u00b7 \u20b9{product.finalPrice.toLocaleString("en-IN")}</p>
                    <Input placeholder="Notes (size, color...)" className="mt-2 h-8 text-xs" value={notes} onChange={(e) => setSelectedProducts((prev) => prev.map((s, si) => si === i ? { ...s, notes: e.target.value } : s))} />
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <button type="button" onClick={() => setSelectedProducts((prev) => prev.map((s, si) => si === i ? { ...s, qty: Math.max(1, s.qty - 1) } : s))} className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-gray-200 text-sm font-bold">\u2212</button>
                    <span className="w-6 text-center text-sm font-medium">{qty}</span>
                    <button type="button" onClick={() => setSelectedProducts((prev) => prev.map((s, si) => si === i ? { ...s, qty: s.qty + 1 } : s))} className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-gray-200 text-sm font-bold">+</button>
                  </div>
                  <button type="button" onClick={() => setSelectedProducts((prev) => prev.filter((_, si) => si !== i))} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 mt-1"><X size={14} /></button>
                </div>
              ))}
          </CardContent>
        </Card>
        <Button type="submit" className="w-full gap-2" size="lg"><CheckCircle size={18} /> Save Appointment</Button>
      </form>
    </div>
  );
}
