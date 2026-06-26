"use client";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, CalendarPlus, Check } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductGridSkeleton } from "@/components/common/skeleton";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/sheets/mock-data";
import { formatPrice } from "@/lib/utils/format";
import { STOCK_LOW_THRESHOLD } from "@/lib/constants";

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const catFilter = searchParams.get("cat") ?? "";
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  let products = MOCK_PRODUCTS;
  if (catFilter) {
    const cat = MOCK_CATEGORIES.find((c) => c.slug === catFilter);
    if (cat) products = products.filter((p) => p.categoryId === cat.id);
  }
  if (search) {
    const q = search.toLowerCase();
    products = products.filter((p) =>
      p.name.toLowerCase().includes(q) || p.fabric.toLowerCase().includes(q) ||
      p.colors.some((c) => c.toLowerCase().includes(q))
    );
  }

  const toggle = (id: string) => setSelected((prev) =>
    prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
  );

  const getEmoji = (catId: string) =>
    catId === "cat_001" || catId === "cat_002" ? "🥻" :
    catId === "cat_003" ? "👗" : catId === "cat_004" ? "👚" :
    catId === "cat_006" ? "👶" : catId === "cat_007" ? "👔" : "👘";

  return (
    <div className="space-y-4 px-4 py-4">
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input placeholder="Search sarees, lehengas, fabric, color..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <button onClick={() => router.push("/browse")} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${!catFilter ? "bg-brand-wine text-white border-brand-wine" : "border-brand-border bg-white text-brand-text-muted"}`}>All</button>
        {MOCK_CATEGORIES.map((cat) => (
          <button key={cat.id} onClick={() => router.push(`/browse?cat=${cat.slug}`)}
            className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${catFilter === cat.slug ? "bg-brand-wine text-white border-brand-wine" : "border-brand-border bg-white text-brand-text-muted"}`}>
            <span>{cat.icon}</span>{cat.name}
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-500">{products.length} products</p>
      <div className="grid grid-cols-2 gap-3">
        {products.map((product, i) => {
          const isSelected = selected.includes(product.id);
          const isOut = product.stockAvailable === 0;
          const isLow = product.stockAvailable > 0 && product.stockAvailable <= STOCK_LOW_THRESHOLD;
          return (
            <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <div className={`rounded-2xl border-2 bg-white overflow-hidden transition-all ${isSelected ? "border-brand-wine shadow-lg" : "border-brand-border shadow-sm"}`}>
                <div className="relative aspect-[3/4] bg-gradient-to-br from-brand-cream to-brand-rose flex items-center justify-center">
                  <span className="text-4xl">{getEmoji(product.categoryId)}</span>
                  {isOut && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><span className="text-xs font-bold text-red-500 bg-white px-2 py-1 rounded-full">Out of Stock</span></div>}
                  {isLow && !isOut && <Badge className="absolute top-2 left-2 bg-amber-500 text-white text-[10px]">Only {product.stockAvailable} left</Badge>}
                  {product.discountPct > 0 && <Badge className="absolute top-2 right-2 bg-brand-wine text-white text-[10px]">{product.discountPct}% OFF</Badge>}
                  {isSelected && <div className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-wine text-white"><Check size={14} /></div>}
                </div>
                <div className="p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-brand-text leading-tight line-clamp-2">{product.name}</p>
                  <p className="text-[10px] text-brand-text-muted">{product.fabric} · {product.colors.slice(0, 2).join(", ")}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-brand-wine">{formatPrice(product.finalPrice)}</span>
                    {product.discountPct > 0 && <span className="text-[10px] text-gray-400 line-through">{formatPrice(product.sellingPrice)}</span>}
                  </div>
                  {!isOut && (
                    <button onClick={() => toggle(product.id)} className={`w-full rounded-lg py-1.5 text-xs font-medium transition-colors tap-target ${isSelected ? "bg-brand-wine text-white" : "bg-brand-cream text-brand-wine border border-brand-wine/30 hover:bg-brand-wine/10"}`}>
                      {isSelected ? "✓ Selected for Visit" : "+ Add to Visit"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      {selected.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 z-30">
          <Link href={`/appointment?products=${selected.join(",")}`}>
            <Button className="w-full gap-2 shadow-xl" size="lg">
              <CalendarPlus size={18} /> Book Visit with {selected.length} item{selected.length !== 1 ? "s" : ""}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="px-4 py-4"><ProductGridSkeleton count={6} /></div>}>
      <BrowseContent />
    </Suspense>
  );
}
