import { CategorySchema, type Category } from "./schemas";
import * as client from "./client";
import { SHEETS_AVAILABLE, MOCK_CATEGORIES } from "./mock-data";

const SHEET = "Categories" as const;

export async function getAllCategories(bustCache = false): Promise<Category[]> {
  if (!SHEETS_AVAILABLE) return MOCK_CATEGORIES.filter((c) => c.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
  const all = await client.getAll(SHEET, CategorySchema, { bustCache });
  return all.filter((c) => c.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getCategoryById(id: string): Promise<Category | null> {
  if (!SHEETS_AVAILABLE) return MOCK_CATEGORIES.find((c) => c.id === id) ?? null;
  return client.getById(SHEET, CategorySchema, id);
}
