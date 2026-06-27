"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MOCK_PRODUCTS } from "@/lib/sheets/mock-data";
import type { Product } from "@/lib/sheets/schemas";

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
    (set) => ({
      products: MOCK_PRODUCTS,
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      addProduct: (p) => {
        const np: Product = { ...p, id: p.id ?? `prod_${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Product;
        set((s) => ({ products: [np, ...s.products] }));
      },
      updateProduct: (id, updates) => {
        set((s) => ({ products: s.products.map((p) => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p) }));
      },
      deleteProduct: (id) => {
        set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
      },
      importProducts: (imported) => {
        const np = imported.map((p) => ({ ...p, id: p.id ?? `imp_${Date.now()}_${Math.random().toString(36).slice(2)}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })) as Product[];
        set((s) => ({ products: [...np, ...s.products] }));
      },
      resetToMock: () => set({ products: MOCK_PRODUCTS }),
    }),
    {
      name: "aditya-textile-products",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => { if (state) state.setHydrated(true); },
    }
  )
);
