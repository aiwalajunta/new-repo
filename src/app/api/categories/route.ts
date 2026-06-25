import { NextResponse } from "next/server";
import { categoriesAdapter } from "@/lib/sheets";
import type { ApiResponse } from "@/types";
import type { Category } from "@/lib/sheets/schemas";

export async function GET() {
  try {
    const categories = await categoriesAdapter.getAllCategories();
    return NextResponse.json({ success: true, data: categories } satisfies ApiResponse<Category[]>);
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch categories" } satisfies ApiResponse<never>, { status: 500 });
  }
}
