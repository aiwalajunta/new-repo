"use client";
import { Heart, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { EmptyState } from "@/components/common/empty-state";
import { formatPrice, calcDiscount } from "@/lib/utils/format";
import { useWishlist } from "@/hooks/use-wishlist";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/store/app-store";
import type { Product } from "@/lib/sheets/schemas";

export default function WishlistPage() {
  const language = useAppStore((s) => s.language);
  const { wishlist, toggle } = useWishlist();
  const { data: products = [] } = useQuery<Product[]>({ queryKey: ["products"], queryFn: async () => { const res = await fetch("/api/products"); const data = (await res.json()) as { data: Product[] }; return data.data; } });
  const wishlisted = wishlist.map((w) => { const product = products.find((p) => p.id === w.productId); return product ? { wishlistId: w.id, product } : null; }).filter(Boolean) as { wishlistId: string; product: Product }[];
  return (
    <div className="space-y-4 px-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-brand-text">{language === "hi" ? "मेरी पसंद" : "My Wishlist"}</h1>
        {wishlisted.length > 0 && <span className="text-sm text-brand-text-muted">{wishlisted.length} {language === "hi" ? "आइटम" : "items"}</span>}
      </div>
      {wishlisted.length === 0 ? (
        <EmptyState icon={Heart} title={language === "hi" ? "पसंद सूची खाली है" : "Your wishlist is empty"} description={language === "hi" ? "पसंदीदा आइटम सहेजें" : "Save items you love to find them easily later"} actionLabel={language === "hi" ? "उत्पाद देखें" : "Browse Products"} actionHref="/categories" />
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {wishlisted.map(({ wishlistId, product }) => {
              const discount = calcDiscount(product.basePrice, product.finalPrice);
              return (
                <motion.div key={wishlistId} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }} className="group overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm">
                  <Link href={`/product/${product.slug}`} className="block">
                    <div className="relative aspect-[3/4] overflow-hidden bg-brand-cream">
                      <Image src={`https://via.placeholder.com/400x533/F5EDE3/6B1D3A?text=${encodeURIComponent(product.title.slice(0, 12))}`} alt={product.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 50vw, 33vw" />
                      {discount > 0 && <span className="absolute left-2 top-2 rounded-full bg-brand-wine px-2 py-0.5 text-[10px] font-bold text-white">{discount}% OFF</span>}
                    </div>
                  </Link>
                  <div className="space-y-1.5 p-3">
                    <p className="line-clamp-1 text-xs font-medium text-brand-text">{product.title}</p>
                    <div className="flex items-center gap-1.5"><span className="text-sm font-bold text-brand-wine">{formatPrice(product.finalPrice)}</span>{discount > 0 && <span className="text-[10px] text-brand-text-light line-through">{formatPrice(product.basePrice)}</span>}</div>
                    <button onClick={() => toggle(product.id)} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 tap-target"><Trash2 size={12} />{language === "hi" ? "हटाएं" : "Remove"}</button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
