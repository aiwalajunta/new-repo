import { CategorySchema, type Category } from "./schemas";
import * as client from "./client";

const SHEET = "Categories" as const;

export async function getAllCategories(bustCache = false): Promise<Category[]> {
  const all = await client.getAll(SHEET, CategorySchema, { bustCache });
  return all.filter((c) => c.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
}
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return (await getAllCategories()).find((c) => c.slug === slug) ?? null;
}
export async function getCategoryById(id: string): Promise<Category | null> {
  return client.getById(SHEET, CategorySchema, id);
}
