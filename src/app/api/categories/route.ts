import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";
import type { Category } from "@/lib/sheets/schemas";
import { SHEETS_AVAILABLE, MOCK_CATEGORIES } from "@/lib/sheets/mock-data";

export async function GET() {
  try {
    if (!SHEETS_AVAILABLE) return NextResponse.json({ success: true, data: MOCK_CATEGORIES } satisfies ApiResponse<Category[]>);
    const { categoriesAdapter } = await import("@/lib/sheets");
    const categories = await categoriesAdapter.getAllCategories();
    return NextResponse.json({ success: true, data: categories } satisfies ApiResponse<Category[]>);
  } catch { return NextResponse.json({ success: false, error: "Failed to fetch categories" } satisfies ApiResponse<never>, { status: 500 }); }
}
