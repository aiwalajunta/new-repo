"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "./use-toast";

async function fetchWishlist(): Promise<{ productId: string; id: string }[]> {
  const res = await fetch("/api/wishlist");
  if (!res.ok) return [];
  const data = (await res.json()) as { data: { productId: string; id: string }[] };
  return data.data ?? [];
}

export function useWishlist() {
  const qc = useQueryClient();
  const { data: wishlist = [] } = useQuery({ queryKey: ["wishlist"], queryFn: fetchWishlist });
  const wishlisted = new Set(wishlist.map((w) => w.productId));
  const addMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await fetch("/api/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId }) });
      if (!res.ok) throw new Error("Failed to add");
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["wishlist"] }); toast({ title: "Added to wishlist", variant: "success" }); },
    onError: () => toast({ title: "Please login to save items", variant: "error" }),
  });
  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      const item = wishlist.find((w) => w.productId === productId);
      if (!item) return;
      await fetch(`/api/wishlist?id=${item.id}`, { method: "DELETE" });
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["wishlist"] }); toast({ title: "Removed from wishlist" }); },
  });
  const toggle = (productId: string) => { if (wishlisted.has(productId)) removeMutation.mutate(productId); else addMutation.mutate(productId); };
  return { wishlist, wishlisted, toggle };
}
