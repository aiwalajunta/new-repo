"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Image from "next/image";
import { Heart, Share2, CalendarCheck, ShoppingBag, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StockBadge } from "@/components/common/stock-badge";
import { Skeleton } from "@/components/common/skeleton";
import { formatPrice, calcDiscount } from "@/lib/utils/format";
import { useAppStore } from "@/store/app-store";
import type { Product } from "@/lib/sheets/schemas";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const language = useAppStore((s) => s.language);
  const { data: product, isLoading } = useQuery<Product | null>({ queryKey: ["product", slug], queryFn: async () => { const res = await fetch(`/api/products?search=${slug}`); const data = (await res.json()) as { data: Product[] }; return data.data.find((p) => p.slug === slug) ?? null; } });

  if (isLoading) return (<div className="space-y-4 px-4 py-4"><Skeleton className="aspect-square w-full rounded-2xl" /><Skeleton className="h-8 w-3/4" /><Skeleton className="h-6 w-1/3" /><Skeleton className="h-20 w-full" /></div>);
  if (!product) return (<div className="flex flex-col items-center justify-center px-6 py-20 text-center"><h2 className="font-display text-xl font-semibold text-brand-text">Product not found</h2><p className="mt-2 text-sm text-brand-text-muted">This product may no longer be available.</p><Button asChild className="mt-4"><Link href="/categories">Browse Products</Link></Button></div>);

  const discount = calcDiscount(product.basePrice, product.finalPrice);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
      <div className="sticky top-14 z-20 flex items-center gap-2 bg-brand-ivory/95 px-4 py-2 backdrop-blur-sm">
        <Link href="/categories" className="flex items-center gap-1 text-sm text-brand-text-muted hover:text-brand-text"><ChevronLeft size={18} />{language === "hi" ? "वापस" : "Back"}</Link>
      </div>
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-brand-cream">
        <Image src={`https://via.placeholder.com/800x1000/F5EDE3/6B1D3A?text=${encodeURIComponent(product.title.slice(0, 20))}`} alt={product.title} fill className="object-cover" priority />
        {discount > 0 && <Badge className="absolute left-4 top-4 bg-brand-wine text-white">{discount}% OFF</Badge>}
        <div className="absolute right-4 top-4 flex flex-col gap-2">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm tap-target"><Heart size={20} className="text-brand-text-muted" /></button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm tap-target"><Share2 size={20} className="text-brand-text-muted" /></button>
        </div>
      </div>
      <div className="space-y-5 px-4 pt-5">
        <div><h1 className="font-display text-2xl font-bold text-brand-text">{product.title}</h1><p className="mt-1 text-sm text-brand-text-muted">{product.fabric}</p></div>
        <div className="flex items-baseline gap-3">
          <span className="font-display text-2xl font-bold text-brand-wine">{formatPrice(product.finalPrice)}</span>
          {discount > 0 && (<><span className="text-base text-brand-text-light line-through">{formatPrice(product.basePrice)}</span><Badge variant="success">{discount}% {language === "hi" ? "छूट" : "OFF"}</Badge></>)}
        </div>
        <StockBadge stock={10} />
        <div><h3 className="mb-2 text-sm font-semibold text-brand-text">{language === "hi" ? "विवरण" : "Description"}</h3><p className="text-sm leading-relaxed text-brand-text-muted">{product.description}</p></div>
        {product.occasion.length > 0 && (<div><h3 className="mb-2 text-sm font-semibold text-brand-text">{language === "hi" ? "अवसर" : "Occasion"}</h3><div className="flex flex-wrap gap-2">{product.occasion.map((occ) => (<Badge key={occ} variant="outline">{occ}</Badge>))}</div></div>)}
      </div>
      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-brand-border bg-white/95 px-4 py-3 backdrop-blur-lg" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <Button variant="outline" className="flex-1 gap-2"><ShoppingBag size={18} />{language === "hi" ? "कार्ट में जोड़ें" : "Add to Cart"}</Button>
          <Button className="flex-1 gap-2"><CalendarCheck size={18} />{language === "hi" ? "आरक्षित करें" : "Reserve & Visit"}</Button>
        </div>
      </div>
    </motion.div>
  );
}
