"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductCard } from "@/components/product/product-card";
import { CategoryCard } from "@/components/product/category-card";
import { ProductGridSkeleton } from "@/components/common/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/app-store";
import { CATEGORIES } from "@/lib/constants";
import type { Product, Category } from "@/lib/sheets/schemas";
import { Package } from "lucide-react";

type SortOption = "newest" | "price_asc" | "price_desc" | "popular";

// Inner component uses useSearchParams — must be inside Suspense
function CategoriesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeCat = searchParams.get("cat");
  const activeFilter = searchParams.get("filter");
  const language = useAppStore((s) => s.language);
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products", activeCat],
    queryFn: async () => {
      const url = activeCat ? `/api/products?category=${activeCat}` : "/api/products";
      const res = await fetch(url);
      const data = (await res.json()) as { data: Product[] };
      return data.data;
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      const data = (await res.json()) as { data: Category[] };
      return data.data;
    },
  });

  let filtered = products ?? [];
  if (activeFilter === "new") filtered = filtered.filter((p) => p.isNewArrival);
  if (activeFilter === "trending") filtered = filtered.filter((p) => p.isTrending);

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "price_asc": return a.finalPrice - b.finalPrice;
      case "price_desc": return b.finalPrice - a.finalPrice;
      case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default: return 0;
    }
  });

  const displayCategories = categories ?? CATEGORIES.map((c, i) => ({
    id: `cat_${String(i + 1).padStart(3, "0")}`,
    name: c.name, slug: c.slug, parentId: "", displayOrder: i + 1, iconUrl: "", isActive: true,
  }));

  return (
    <div className="space-y-6 px-4 py-4">
      {/* Category chips */}
      <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4">
        <Badge
          variant={!activeCat ? "default" : "outline"}
          className="cursor-pointer whitespace-nowrap px-3 py-1.5"
          onClick={() => router.push("/categories")}
        >
          {language === "hi" ? "सभी" : "All"}
        </Badge>
        {displayCategories.map((cat) => (
          <Badge
            key={cat.id}
            variant={activeCat === cat.slug ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap px-3 py-1.5"
            onClick={() => router.push(`/categories?cat=${cat.slug}`)}
          >
            {cat.name}
          </Badge>
        ))}
      </div>

      {/* Sort bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-brand-text-muted">
          {sorted.length} {language === "hi" ? "उत्पाद" : "products"}
        </p>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="rounded-lg border border-brand-border bg-white px-3 py-1.5 text-sm text-brand-text"
        >
          <option value="newest">{language === "hi" ? "नवीनतम" : "Newest"}</option>
          <option value="price_asc">{language === "hi" ? "कम कीमत" : "Price: Low"}</option>
          <option value="price_desc">{language === "hi" ? "ज़्यादा कीमत" : "Price: High"}</option>
          <option value="popular">{language === "hi" ? "लोकप्रिय" : "Popular"}</option>
        </select>
      </div>

      {/* Products grid */}
      {isLoading ? (
        <ProductGridSkeleton count={6} />
      ) : sorted.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {sorted.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title={language === "hi" ? "कोई उत्पाद नहीं मिला" : "No products found"}
          description={language === "hi" ? "फ़िल्टर बदलकर देखें" : "Try adjusting your filters"}
          actionLabel={language === "hi" ? "सभी देखें" : "View All"}
          actionHref="/categories"
        />
      )}
    </div>
  );
}

// Outer page wraps inner component in Suspense (required for useSearchParams in Next.js 15)
export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="px-4 py-4"><ProductGridSkeleton count={6} /></div>}>
      <CategoriesContent />
    </Suspense>
  );
}
