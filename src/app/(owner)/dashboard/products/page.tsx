"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Package, Edit2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils/format";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/sheets/mock-data";
import { STOCK_LOW_THRESHOLD } from "@/lib/constants";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [stockFilter, setStockFilter] = useState<"all"|"low"|"out">("all");

  let filtered = MOCK_PRODUCTS;
  if (search) { const q = search.toLowerCase(); filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.fabric.toLowerCase().includes(q) || p.colors.some((c) => c.toLowerCase().includes(q)) || p.rackLocation.toLowerCase().includes(q)); }
  if (catFilter) filtered = filtered.filter((p) => p.categoryId === catFilter);
  if (stockFilter === "low") filtered = filtered.filter((p) => p.stockAvailable > 0 && p.stockAvailable <= STOCK_LOW_THRESHOLD);
  if (stockFilter === "out") filtered = filtered.filter((p) => p.stockAvailable === 0);
  const getCatName = (id: string) => MOCK_CATEGORIES.find((c) => c.id === id)?.name ?? "—";
  const getEmoji = (catId: string) => catId === "cat_001" || catId === "cat_002" ? "🥻" : catId === "cat_003" ? "👗" : catId === "cat_004" ? "👚" : catId === "cat_006" ? "👶" : "👘";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold text-gray-900">Products</h1><p className="text-sm text-gray-500">{MOCK_PRODUCTS.length} total</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">📊 Import Excel</Button>
          <Button size="sm" className="gap-2"><Plus size={15} /> Add Product</Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><Input placeholder="Name, SKU, color, rack..." className="pl-9 h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700">
          <option value="">All Categories</option>{MOCK_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden">
          {(["all","low","out"] as const).map((f) => (<button key={f} onClick={() => setStockFilter(f)} className={`px-3 py-1.5 text-xs font-medium transition-colors ${stockFilter === f ? "bg-brand-wine text-white" : "text-gray-600 hover:bg-gray-50"}`}>{f === "all" ? "All" : f === "low" ? "⚠️ Low" : "🔴 Out"}</button>))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center"><Package size={40} className="mx-auto mb-3 text-gray-300" /><p className="text-sm text-gray-500">No products match</p></div>
      ) : (
        <div className="space-y-2">{filtered.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
            <Card className="hover:shadow-sm transition-shadow"><CardContent className="flex items-center gap-3 p-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-cream text-2xl border border-brand-border">{getEmoji(p.categoryId)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>{p.isFeatured && <Badge variant="secondary" className="text-[10px] shrink-0">Featured</Badge>}</div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-gray-400">
                  <span>SKU: {p.sku}</span><span>·</span><span>{getCatName(p.categoryId)}</span><span>·</span><span>{p.fabric}</span>
                  {p.rackLocation && <><span>·</span><span className="font-medium text-blue-600">📍 {p.rackLocation}</span></>}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display font-bold text-brand-wine">{formatPrice(p.finalPrice)}</p>
                {p.discountPct > 0 && <p className="text-xs text-gray-400 line-through">{formatPrice(p.sellingPrice)}</p>}
                <p className={`text-xs font-medium ${p.stockAvailable === 0 ? "text-red-600" : p.stockAvailable <= STOCK_LOW_THRESHOLD ? "text-amber-600" : "text-gray-500"}`}>
                  {p.stockAvailable === 0 ? "OUT" : `${p.stockAvailable} avail`}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"><Eye size={14} /></button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-brand-wine/10 hover:text-brand-wine transition-colors"><Edit2 size={14} /></button>
              </div>
            </CardContent></Card>
          </motion.div>
        ))}</div>
      )}
    </div>
  );
}
