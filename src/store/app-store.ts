import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Language } from "@/types";

interface CartItem {
  productVariantId: string; productId: string; title: string;
  size: string; color: string; price: number; quantity: number; imageUrl: string;
}

interface AppState {
  language: Language; setLanguage: (lang: Language) => void;
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  showInstallPrompt: boolean; setShowInstallPrompt: (v: boolean) => void;
  isOffline: boolean; setIsOffline: (v: boolean) => void;
  searchOpen: boolean; setSearchOpen: (v: boolean) => void;
  mobileMenuOpen: boolean; setMobileMenuOpen: (v: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: "en", setLanguage: (lang) => set({ language: lang }),
      cartItems: [],
      addToCart: (item) => set((s) => {
        const existing = s.cartItems.find((i) => i.productVariantId === item.productVariantId);
        if (existing) return { cartItems: s.cartItems.map((i) => i.productVariantId === item.productVariantId ? { ...i, quantity: i.quantity + item.quantity } : i) };
        return { cartItems: [...s.cartItems, item] };
      }),
      removeFromCart: (id) => set((s) => ({ cartItems: s.cartItems.filter((i) => i.productVariantId !== id) })),
      updateQuantity: (id, qty) => set((s) => ({ cartItems: qty <= 0 ? s.cartItems.filter((i) => i.productVariantId !== id) : s.cartItems.map((i) => i.productVariantId === id ? { ...i, quantity: qty } : i) })),
      clearCart: () => set({ cartItems: [] }),
      cartTotal: () => get().cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
      showInstallPrompt: false, setShowInstallPrompt: (v) => set({ showInstallPrompt: v }),
      isOffline: false, setIsOffline: (v) => set({ isOffline: v }),
      searchOpen: false, setSearchOpen: (v) => set({ searchOpen: v }),
      mobileMenuOpen: false, setMobileMenuOpen: (v) => set({ mobileMenuOpen: v }),
    }),
    { name: "aditya-textile-store", partialize: (s) => ({ language: s.language, cartItems: s.cartItems }) },
  ),
);
