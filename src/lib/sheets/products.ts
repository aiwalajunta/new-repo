import { nanoid } from "nanoid";
import { ProductSchema, type Product, type CreateProduct } from "./schemas";
import * as client from "./client";

const SHEET = "Products" as const;

export async function getAllProducts(bustCache = false): Promise<Product[]> {
  const all = await client.getAll(SHEET, ProductSchema, { bustCache });
  return all.filter((p) => p.isActive);
}
export async function getProductBySlug(slug: string): Promise<Product | null> {
  return (await getAllProducts()).find((p) => p.slug === slug) ?? null;
}
export async function getProductById(id: string): Promise<Product | null> {
  return client.getById(SHEET, ProductSchema, id);
}
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  return (await getAllProducts()).filter((p) => p.categoryId === categoryId);
}
export async function searchProducts(query: string): Promise<Product[]> {
  const lower = query.toLowerCase();
  return (await getAllProducts()).filter((p) => p.title.toLowerCase().includes(lower) || p.description.toLowerCase().includes(lower) || p.tags.some((t) => t.toLowerCase().includes(lower)) || p.fabric.toLowerCase().includes(lower));
}
export async function createProduct(data: CreateProduct): Promise<Product> {
  const now = new Date().toISOString();
  const basePrice = typeof data.basePrice === "string" ? Number(data.basePrice) : data.basePrice;
  const discountPct = typeof data.discountPct === "string" ? Number(data.discountPct) : data.discountPct;
  return client.create(SHEET, ProductSchema, { ...data, id: `prod_${nanoid(10)}`, finalPrice: Math.round(basePrice * (1 - discountPct / 100)), occasion: Array.isArray(data.occasion) ? data.occasion.join(",") : String(data.occasion), tags: Array.isArray(data.tags) ? data.tags.join(",") : String(data.tags), isNewArrival: String(data.isNewArrival), isTrending: String(data.isTrending), isActive: String(data.isActive), createdAt: now, updatedAt: now });
}
export async function updateProduct(id: string, data: Partial<Record<string, unknown>>): Promise<Product | null> {
  return client.update(SHEET, ProductSchema, id, { ...data, updatedAt: new Date().toISOString() });
}
export async function deleteProduct(id: string): Promise<boolean> {
  return client.softDelete(SHEET, id);
}
