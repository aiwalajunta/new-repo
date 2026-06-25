import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { productsAdapter } from "@/lib/sheets";
import { CreateProductSchema } from "@/lib/sheets/schemas";
import type { Product } from "@/lib/sheets/schemas";
import type { ApiResponse } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    let products: Product[];
    if (search) products = await productsAdapter.searchProducts(search);
    else if (category) products = await productsAdapter.getProductsByCategory(category);
    else products = await productsAdapter.getAllProducts();
    return NextResponse.json({ success: true, data: products } satisfies ApiResponse<Product[]>);
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch products" } satisfies ApiResponse<never>, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role: string }).role !== "owner") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const parsed = CreateProductSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: "Invalid data", details: parsed.error.issues }, { status: 400 });
    const product = await productsAdapter.createProduct(parsed.data);
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to create product" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role: string }).role !== "owner") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
    await productsAdapter.deleteProduct(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to delete" }, { status: 500 });
  }
}
