"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Language } from "@/types";

interface SelectedItem { productId: string; productName: string; notes: string; }

interface AppState {
  language: Language; setLanguage: (lang: Language) => void;
  selectedItems: SelectedItem[];
  addToSelection: (item: SelectedItem) => void;
  removeFromSelection: (productId: string) => void;
  clearSelection: () => void;
  isOffline: boolean; setIsOffline: (v: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: "en", setLanguage: (lang) => set({ language: lang }),
      selectedItems: [],
      addToSelection: (item) => set((s) => { if (s.selectedItems.find((i) => i.productId === item.productId)) return s; return { selectedItems: [...s.selectedItems, item] }; }),
      removeFromSelection: (productId) => set((s) => ({ selectedItems: s.selectedItems.filter((i) => i.productId !== productId) })),
      clearSelection: () => set({ selectedItems: [] }),
      isOffline: false, setIsOffline: (v) => set({ isOffline: v }),
    }),
    { name: "aditya-textile", partialize: (s) => ({ language: s.language, selectedItems: s.selectedItems }) },
  ),
);
