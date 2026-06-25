"use client";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { formatPrice, calcDiscount } from "@/lib/utils/format";
import type { Product } from "@/lib/sheets/schemas";

interface ProductCardProps { product: Product; isWishlisted?: boolean; onToggleWishlist?: (id: string) => void; priority?: boolean; }

export function ProductCard({ product, isWishlisted = false, onToggleWishlist, priority = false }: ProductCardProps) {
  const discount = calcDiscount(product.basePrice, product.finalPrice);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="group overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm transition-all hover:shadow-lg">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-brand-cream">
          <Image src={`https://via.placeholder.com/400x533/F5EDE3/6B1D3A?text=${encodeURIComponent(product.title.slice(0, 15))}`} alt={product.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" priority={priority} />
          {discount > 0 && <Badge className="absolute left-2 top-2 bg-brand-wine text-white">{discount}% OFF</Badge>}
          {product.isNewArrival && <Badge className="absolute right-2 top-2 bg-brand-gold text-white">NEW</Badge>}
          {onToggleWishlist && (
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(product.id); }} className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-white tap-target" aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}>
              <Heart size={18} className={cn("transition-colors", isWishlisted ? "fill-brand-wine text-brand-wine" : "text-brand-text-muted")} />
            </button>
          )}
        </div>
        <div className="space-y-1.5 p-3">
          <h3 className="line-clamp-1 text-sm font-medium text-brand-text">{product.title}</h3>
          <p className="line-clamp-1 text-xs text-brand-text-muted">{product.fabric}</p>
          <div className="flex items-center gap-2">
            <span className="font-display text-base font-bold text-brand-wine">{formatPrice(product.finalPrice)}</span>
            {discount > 0 && <span className="text-xs text-brand-text-light line-through">{formatPrice(product.basePrice)}</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
