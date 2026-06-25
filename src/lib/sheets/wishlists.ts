import { nanoid } from "nanoid";
import { WishlistSchema, type Wishlist } from "./schemas";
import * as client from "./client";

const SHEET = "Wishlists" as const;

export async function getWishlistByCustomer(customerId: string): Promise<Wishlist[]> {
  return (await client.getAll(SHEET, WishlistSchema)).filter((w) => w.customerId === customerId);
}
export async function addToWishlist(customerId: string, productId: string): Promise<Wishlist> {
  return client.create(SHEET, WishlistSchema, { id: `wl_${nanoid(10)}`, customerId, productId, addedAt: new Date().toISOString() });
}
export async function removeFromWishlist(id: string): Promise<boolean> {
  return client.softDelete(SHEET, id);
}
