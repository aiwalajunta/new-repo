"use client";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { CategoryCard } from "@/components/product/category-card";
import { ProductGridSkeleton } from "@/components/common/skeleton";
import { useAppStore } from "@/store/app-store";
import { getCurrentFestival, getFestiveGreeting } from "@/lib/utils/festival";
import { CATEGORIES } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import type { Product, Category } from "@/lib/sheets/schemas";

async function fetchProducts(): Promise<Product[]> { const res = await fetch("/api/products"); if (!res.ok) throw new Error("Failed"); return ((await res.json()) as { data: Product[] }).data; }
async function fetchCategories(): Promise<Category[]> { const res = await fetch("/api/categories"); if (!res.ok) throw new Error("Failed"); return ((await res.json()) as { data: Category[] }).data; }

export default function HomePage() {
  const language = useAppStore((s) => s.language);
  const festival = getCurrentFestival();
  const greeting = getFestiveGreeting(language);
  const { data: products, isLoading: productsLoading } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const newArrivals = products?.filter((p) => p.isNewArrival).slice(0, 6) ?? [];
  const trending = products?.filter((p) => p.isTrending).slice(0, 6) ?? [];
  const displayCategories = categories ?? CATEGORIES.map((c, i) => ({ id: `cat_${String(i + 1).padStart(3, "0")}`, name: c.name, slug: c.slug, parentId: "", displayOrder: i + 1, iconUrl: "", isActive: true }));

  return (
    <div className="space-y-8 px-4 py-4">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative overflow-hidden rounded-2xl px-6 py-10 text-center" style={{ background: festival ? `linear-gradient(135deg, ${festival.color}22, #6B1D3A15, ${festival.color}11)` : "linear-gradient(135deg, #C8963B15, #6B1D3A10, #C8963B08)" }}>
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-gold/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-brand-wine/10 blur-xl" />
        {festival && (<motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-brand-wine backdrop-blur-sm"><Sparkles size={14} /><span>{festival.name} {language === "hi" ? "संग्रह" : "Collection"}</span></motion.div>)}
        <h1 className="mb-2 font-display text-2xl font-bold text-brand-text sm:text-3xl">{greeting}</h1>
        <p className="mb-5 text-sm text-brand-text-muted sm:text-base">{language === "hi" ? "हर अवसर के लिए हस्तनिर्मित एथनिक शान" : "Handcrafted ethnic elegance for every occasion"}</p>
        <Button asChild><Link href="/categories">{language === "hi" ? "संग्रह देखें" : "Explore Collection"}<ArrowRight size={16} className="ml-1.5" /></Link></Button>
      </motion.section>

      <section>
        <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-lg font-semibold text-brand-text">{language === "hi" ? "श्रेणी से खरीदें" : "Shop by Category"}</h2><Link href="/categories" className="text-sm font-medium text-brand-wine hover:underline">{language === "hi" ? "सभी देखें" : "View All"}</Link></div>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">{displayCategories.map((cat, i) => (<CategoryCard key={cat.id} category={cat} index={i} />))}</div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-lg font-semibold text-brand-text">{language === "hi" ? "नई आवक" : "New Arrivals"}</h2><Link href="/categories?filter=new" className="text-sm font-medium text-brand-wine hover:underline">{language === "hi" ? "सभी देखें" : "View All"}</Link></div>
        {productsLoading ? (<ProductGridSkeleton count={4} />) : newArrivals.length > 0 ? (<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{newArrivals.map((product, i) => (<ProductCard key={product.id} product={product} priority={i < 2} />))}</div>) : (<div className="rounded-2xl border border-dashed border-brand-border bg-white/50 px-6 py-12 text-center"><p className="text-sm text-brand-text-muted">{language === "hi" ? "जल्द नए उत्पाद आ रहे हैं!" : "New products coming soon!"}</p></div>)}
      </section>

      {trending.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-lg font-semibold text-brand-text">{language === "hi" ? "ट्रेंडिंग" : "Trending Now"} 🔥</h2><Link href="/categories?filter=trending" className="text-sm font-medium text-brand-wine hover:underline">{language === "hi" ? "सभी देखें" : "View All"}</Link></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{trending.map((product) => (<ProductCard key={product.id} product={product} />))}</div>
        </section>
      )}

      <section className="rounded-2xl border border-brand-gold/30 bg-gradient-to-r from-brand-gold/5 to-brand-wine/5 p-5 text-center">
        <h3 className="mb-1 font-display text-base font-semibold text-brand-text">{language === "hi" ? "ऐप इंस्टॉल करें" : "Install Our App"}</h3>
        <p className="mb-3 text-xs text-brand-text-muted">{language === "hi" ? "बेहतर अनुभव के लिए होम स्क्रीन पर जोड़ें" : "Add to home screen for the best experience"}</p>
        <Button variant="secondary" size="sm">{language === "hi" ? "इंस्टॉल करें" : "Install App"}</Button>
      </section>
    </div>
  );
}
