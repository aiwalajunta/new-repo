"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Search, Package } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/common/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { formatPrice } from "@/lib/utils/format";
import { toast } from "@/hooks/use-toast";
import type { Product } from "@/lib/sheets/schemas";
import { CATEGORIES } from "@/lib/constants";

function ProductForm({ initial, onSubmit, isPending }: { initial?: Partial<Product>; onSubmit: (data: Partial<Record<string, unknown>>) => void; isPending: boolean }) {
  const [form, setForm] = useState({
    title: initial?.title ?? "", categoryId: initial?.categoryId ?? "", description: initial?.description ?? "",
    fabric: initial?.fabric ?? "", basePrice: String(initial?.basePrice ?? ""), discountPct: String(initial?.discountPct ?? "0"),
    occasion: Array.isArray(initial?.occasion) ? initial.occasion.join(", ") : "",
    tags: Array.isArray(initial?.tags) ? initial.tags.join(", ") : "",
    isNewArrival: initial?.isNewArrival ?? false, isTrending: initial?.isTrending ?? false, isActive: initial?.isActive ?? true,
  });
  const field = (key: keyof typeof form) => ({ value: form[key] as string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [key]: e.target.value })) });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    onSubmit({ ...form, slug: initial?.slug ?? slug, basePrice: Number(form.basePrice), discountPct: Number(form.discountPct), occasion: form.occasion.split(",").map((s) => s.trim()).filter(Boolean), tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean) });
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2"><label className="text-xs font-medium text-brand-text-muted">Product Title *</label><Input {...field("title")} placeholder="Banarasi Silk Saree" required /></div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-brand-text-muted">Category *</label>
          <select {...field("categoryId")} required className="flex h-11 w-full rounded-lg border border-brand-border bg-white px-4 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-wine"><option value="">Select category</option>{CATEGORIES.map((c) => (<option key={c.slug} value={`cat_${c.slug}`}>{c.name}</option>))}</select>
        </div>
        <div className="space-y-1"><label className="text-xs font-medium text-brand-text-muted">Fabric *</label><Input {...field("fabric")} placeholder="Silk, Cotton, Georgette..." required /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-brand-text-muted">Base Price (₹) *</label><Input {...field("basePrice")} type="number" min="0" placeholder="12999" required /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-brand-text-muted">Discount %</label><Input {...field("discountPct")} type="number" min="0" max="90" placeholder="0" /></div>
        <div className="space-y-1 sm:col-span-2"><label className="text-xs font-medium text-brand-text-muted">Description</label><textarea {...field("description")} rows={3} placeholder="Elegant handwoven saree..." className="flex w-full resize-none rounded-lg border border-brand-border bg-white px-4 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-wine" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-brand-text-muted">Occasions (comma-separated)</label><Input {...field("occasion")} placeholder="Wedding, Festive, Party" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-brand-text-muted">Tags (comma-separated)</label><Input {...field("tags")} placeholder="silk, banarasi, gold" /></div>
        <div className="flex items-center gap-4 sm:col-span-2">{([{ key: "isNewArrival" as const, label: "New Arrival" },{ key: "isTrending" as const, label: "Trending" },{ key: "isActive" as const, label: "Active" }]).map(({ key, label }) => (<label key={key} className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={form[key] as boolean} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))} className="h-4 w-4 rounded border-brand-border text-brand-wine focus:ring-brand-wine" /><span className="text-sm text-brand-text">{label}</span></label>))}</div>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>{isPending ? "Saving..." : initial?.id ? "Update Product" : "Add Product"}</Button>
    </form>
  );
}

export default function OwnerProductsPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const qc = useQueryClient();

  const { data: products = [], isLoading } = useQuery<Product[]>({ queryKey: ["products"], queryFn: async () => { const res = await fetch("/api/products"); const data = (await res.json()) as { data: Product[] }; return data.data; } });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Record<string, unknown>>) => { const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); if (!res.ok) throw new Error("Failed to create"); },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["products"] }); setDialogOpen(false); toast({ title: "Product added!", variant: "success" }); },
    onError: () => toast({ title: "Failed to add product", variant: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await fetch(`/api/products?id=${id}`, { method: "DELETE" }); },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["products"] }); toast({ title: "Product removed" }); },
  });

  const filtered = products.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()) || p.fabric.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5 px-4 py-4 pb-24">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold text-brand-text">Products</h1><p className="text-sm text-brand-text-muted">{products.length} listings</p></div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gap-2" size="sm"><Plus size={16} /> Add</Button>
      </div>
      <div className="relative"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-text-light" /><Input placeholder="Search products..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Package} title="No products" description="Add your first product to get started" />
      ) : (
        <div className="space-y-2">
          {filtered.map((product) => (
            <motion.div key={product.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 rounded-xl border border-brand-border bg-white p-3 shadow-sm">
              <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-brand-cream"><Image src={`https://via.placeholder.com/120x160/F5EDE3/6B1D3A?text=${encodeURIComponent(product.title.slice(0, 4))}`} alt={product.title} fill className="object-cover" sizes="48px" /></div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-brand-text">{product.title}</p>
                <div className="mt-0.5 flex items-center gap-2"><span className="text-xs font-bold text-brand-wine">{formatPrice(product.finalPrice)}</span>{product.isNewArrival && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">NEW</Badge>}{!product.isActive && <Badge variant="danger" className="text-[10px] px-1.5 py-0">Inactive</Badge>}</div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => { setEditing(product); setDialogOpen(true); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-text-muted hover:bg-brand-cream hover:text-brand-text tap-target"><Edit2 size={15} /></button>
                <button onClick={() => deleteMutation.mutate(product.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-text-muted hover:bg-red-50 hover:text-red-500 tap-target"><Trash2 size={15} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Product" : "Add New Product"}</DialogTitle><DialogDescription>{editing ? "Update the product details below." : "Fill in the details to add a new product."}</DialogDescription></DialogHeader>
          <ProductForm initial={editing ?? undefined} onSubmit={(data) => createMutation.mutate(data)} isPending={createMutation.isPending} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
