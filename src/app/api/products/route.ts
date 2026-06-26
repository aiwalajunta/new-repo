import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";
import type { Product } from "@/lib/sheets/schemas";
import { SHEETS_AVAILABLE, MOCK_PRODUCTS } from "@/lib/sheets/mock-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const categoryId = searchParams.get("categoryId");
    if (!SHEETS_AVAILABLE) {
      let data = MOCK_PRODUCTS;
      if (search) { const q = search.toLowerCase(); data = data.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.fabric.toLowerCase().includes(q)); }
      if (categoryId) data = data.filter((p) => p.categoryId === categoryId);
      return NextResponse.json({ success: true, data } satisfies ApiResponse<Product[]>);
    }
    const { productsAdapter } = await import("@/lib/sheets");
    let products = search ? await productsAdapter.searchProducts(search) : await productsAdapter.getAllProducts();
    if (categoryId) products = products.filter((p) => p.categoryId === categoryId);
    return NextResponse.json({ success: true, data: products } satisfies ApiResponse<Product[]>);
  } catch { return NextResponse.json({ success: false, error: "Failed" }, { status: 500 }); }
}
