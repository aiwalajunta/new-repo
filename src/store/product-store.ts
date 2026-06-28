"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MOCK_PRODUCTS } from "@/lib/sheets/mock-data";
import type { Product } from "@/lib/sheets/schemas";

const STORAGE_KEY = "aditya-textile-products";

// Sync products to server so the Telegram bot can read them
async function syncToCatalog(products: Product[]) {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-catalog-secret": "aditya-textile-nextauth-secret-2024-fallback" },
      body: JSON.stringify({ products }),
    });
  } catch { /* silent — sync is best-effort */ }
}

interface ProductStore {
  products: Product[];
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  addProduct: (p: Partial<Product>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  importProducts: (products: Partial<Product>[]) => void;
  resetToMock: () => void;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: [],
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),

      addProduct: (p) => {
        const np: Product = { ...p, id: p.id ?? `prod_${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Product;
        const next = [np, ...get().products];
        set({ products: next });
        syncToCatalog(next);
      },

      updateProduct: (id, updates) => {
        const next = get().products.map((p) => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p);
        set({ products: next });
        syncToCatalog(next);
      },

      deleteProduct: (id) => {
        const next = get().products.filter((p) => p.id !== id);
        set({ products: next });
        syncToCatalog(next);
      },

      importProducts: (imported) => {
        const np = imported.map((p) => ({ ...p, id: p.id ?? `imp_${Date.now()}_${Math.random().toString(36).slice(2)}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })) as Product[];
        const next = [...np, ...get().products];
        set({ products: next });
        syncToCatalog(next);
      },

      resetToMock: () => set({ products: MOCK_PRODUCTS }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (!state.products || state.products.length === 0) state.products = MOCK_PRODUCTS;
        state.hydrated = true;
      },
    }
  )
);
