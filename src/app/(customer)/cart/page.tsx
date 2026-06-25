"use client";
import { ShoppingBag, Minus, Plus, Trash2, CalendarCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils/format";
import { useAppStore } from "@/store/app-store";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, language } = useAppStore((s) => ({ cartItems: s.cartItems, removeFromCart: s.removeFromCart, updateQuantity: s.updateQuantity, cartTotal: s.cartTotal, language: s.language }));
  const total = cartTotal();
  return (
    <div className="space-y-4 px-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-brand-text">{language === "hi" ? "मेरा कार्ट" : "My Cart"}</h1>
        {cartItems.length > 0 && <span className="text-sm text-brand-text-muted">{cartItems.length} {language === "hi" ? "आइटम" : "items"}</span>}
      </div>
      {cartItems.length === 0 ? (
        <EmptyState icon={ShoppingBag} title={language === "hi" ? "कार्ट खाली है" : "Your cart is empty"} description={language === "hi" ? "उत्पाद जोड़ें और आरक्षण करें" : "Add items and reserve your visit to the store"} actionLabel={language === "hi" ? "उत्पाद देखें" : "Browse Products"} actionHref="/categories" />
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {cartItems.map((item) => (
              <motion.div key={item.productVariantId} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }} className="flex gap-3 rounded-2xl border border-brand-border bg-white p-4 shadow-sm">
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-brand-cream">
                  <Image src={item.imageUrl || `https://via.placeholder.com/200x267/F5EDE3/6B1D3A?text=${encodeURIComponent(item.title.slice(0, 8))}`} alt={item.title} fill className="object-cover" sizes="80px" />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div><p className="line-clamp-1 text-sm font-medium text-brand-text">{item.title}</p><p className="mt-0.5 text-xs text-brand-text-muted">{item.size} · {item.color}</p></div>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-base font-bold text-brand-wine">{formatPrice(item.price * item.quantity)}</span>
                    <div className="flex items-center gap-2 rounded-full border border-brand-border px-1">
                      <button onClick={() => updateQuantity(item.productVariantId, item.quantity - 1)} className="flex h-7 w-7 items-center justify-center rounded-full text-brand-text-muted transition-colors hover:bg-brand-cream tap-target" aria-label="Decrease quantity">{item.quantity === 1 ? <Trash2 size={14} className="text-red-500" /> : <Minus size={14} />}</button>
                      <span className="w-5 text-center text-sm font-semibold text-brand-text">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productVariantId, item.quantity + 1)} className="flex h-7 w-7 items-center justify-center rounded-full text-brand-text-muted transition-colors hover:bg-brand-cream tap-target" aria-label="Increase quantity"><Plus size={14} /></button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-sm">
            <h3 className="mb-3 font-display text-base font-semibold text-brand-text">{language === "hi" ? "ऑर्डर सारांश" : "Order Summary"}</h3>
            <div className="space-y-2 text-sm"><div className="flex justify-between text-brand-text-muted"><span>{language === "hi" ? "सब-टोटल" : "Subtotal"}</span><span>{formatPrice(total)}</span></div><div className="flex justify-between text-brand-text-muted"><span>{language === "hi" ? "दुकान विज़िट" : "Store Visit"}</span><span className="text-brand-emerald">{language === "hi" ? "मुफ़्त" : "Free"}</span></div></div>
            <Separator className="my-3" />
            <div className="flex justify-between font-display text-base font-bold text-brand-text"><span>{language === "hi" ? "कुल" : "Total"}</span><span className="text-brand-wine">{formatPrice(total)}</span></div>
          </div>
          <div className="rounded-2xl border border-brand-gold/40 bg-gradient-to-r from-brand-gold/5 to-brand-wine/5 p-4">
            <p className="mb-1 text-sm font-medium text-brand-text">{language === "hi" ? "💡 आरक्षण कैसे काम करता है?" : "💡 How does this work?"}</p>
            <p className="mb-3 text-xs text-brand-text-muted">{language === "hi" ? "आइटम आरक्षित करें, दुकान पर आएं, देखें और खरीदें।" : "Reserve items, visit our store, try them, and buy. No online payment required."}</p>
            <Button asChild className="w-full gap-2"><Link href="/reservations/new"><CalendarCheck size={18} />{language === "hi" ? "आरक्षित करें और आएं" : "Reserve & Visit Store"}</Link></Button>
          </div>
        </div>
      )}
    </div>
  );
}
