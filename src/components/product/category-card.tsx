"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Category } from "@/lib/sheets/schemas";
import { useAppStore } from "@/store/app-store";
import { CATEGORIES } from "@/lib/constants";

export function CategoryCard({ category, index }: { category: Category; index: number }) {
  const language = useAppStore((s) => s.language);
  const catConfig = CATEGORIES.find((c) => c.slug === category.slug);
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
      <Link href={`/categories?cat=${category.slug}`} className="flex flex-col items-center gap-2 rounded-2xl border border-brand-border bg-white p-4 shadow-sm transition-all hover:border-brand-gold hover:shadow-md">
        <span className="text-3xl" role="img" aria-label={category.name}>{catConfig?.icon ?? "👗"}</span>
        <span className="text-center text-xs font-medium text-brand-text">{language === "hi" ? (catConfig?.nameHi ?? category.name) : category.name}</span>
      </Link>
    </motion.div>
  );
}
