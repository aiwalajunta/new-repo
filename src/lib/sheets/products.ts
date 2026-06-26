import { nanoid } from "nanoid";
import { ProductSchema, type Product, type CreateProduct } from "./schemas";
import * as client from "./client";
import { SHEETS_AVAILABLE, MOCK_PRODUCTS } from "./mock-data";

const SHEET = "Products" as const;

export async function getAllProducts(bustCache = false): Promise<Product[]> {
  if (!SHEETS_AVAILABLE) return MOCK_PRODUCTS;
  const all = await client.getAll(SHEET, ProductSchema, { bustCache });
  return all.filter((p) => p.isActive);
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!SHEETS_AVAILABLE) return MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
  return client.getById(SHEET, ProductSchema, id);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const all = await getAllProducts();
  const lower = query.toLowerCase();
  return all.filter((p) =>
    p.name.toLowerCase().includes(lower) || p.sku.toLowerCase().includes(lower) ||
    p.fabric.toLowerCase().includes(lower) || p.colors.some((c) => c.toLowerCase().includes(lower)) ||
    p.tags.some((t) => t.toLowerCase().includes(lower)) || p.rackLocation.toLowerCase().includes(lower)
  );
}

export async function getLowStockProducts(threshold = 5): Promise<Product[]> {
  return (await getAllProducts()).filter((p) => p.stockAvailable <= threshold && p.stockAvailable > 0);
}

export async function createProduct(data: CreateProduct): Promise<Product> {
  const now = new Date().toISOString();
  const finalPrice = Math.round(data.sellingPrice * (1 - data.discountPct / 100));
  return client.create(SHEET, ProductSchema, {
    ...data, id: `prod_${nanoid(10)}`, finalPrice, stockReserved: 0, stockAvailable: data.stockTotal,
    colors: Array.isArray(data.colors) ? data.colors.join(",") : data.colors,
    occasions: Array.isArray(data.occasions) ? data.occasions.join(",") : data.occasions,
    sizes: Array.isArray(data.sizes) ? data.sizes.join(",") : data.sizes,
    tags: Array.isArray(data.tags) ? data.tags.join(",") : data.tags,
    imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls.join(",") : data.imageUrls,
    isActive: String(data.isActive ?? true), isFeatured: String(data.isFeatured ?? false),
    createdAt: now, updatedAt: now,
  });
}

export async function updateProduct(id: string, data: Partial<Record<string, unknown>>): Promise<Product | null> {
  return client.update(SHEET, ProductSchema, id, { ...data, updatedAt: new Date().toISOString() });
}

export async function updateStock(id: string, stockAvailable: number, stockReserved: number): Promise<Product | null> {
  return client.update(SHEET, ProductSchema, id, { stockAvailable: String(stockAvailable), stockReserved: String(stockReserved), updatedAt: new Date().toISOString() });
}

export async function deleteProduct(id: string): Promise<boolean> {
  return client.softDelete(SHEET, id);
}
