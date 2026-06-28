import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import type { Product } from "@/lib/sheets/schemas";
import { MOCK_PRODUCTS } from "@/lib/sheets/mock-data";

const CATALOG_DIR = "/tmp/aditya-textile";
const CATALOG_FILE = path.join(CATALOG_DIR, "catalog.json");

async function ensureDir() {
  if (!existsSync(CATALOG_DIR)) {
    await mkdir(CATALOG_DIR, { recursive: true });
  }
}

export async function GET() {
  try {
    await ensureDir();
    if (existsSync(CATALOG_FILE)) {
      const raw = await readFile(CATALOG_FILE, "utf-8");
      const data = JSON.parse(raw) as { products: Product[]; updatedAt: string };
      return NextResponse.json({ success: true, ...data });
    }
    return NextResponse.json({ success: true, products: MOCK_PRODUCTS, updatedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ success: true, products: MOCK_PRODUCTS, updatedAt: new Date().toISOString() });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("x-catalog-secret");
    const secret = process.env.NEXTAUTH_SECRET ?? "aditya-textile-nextauth-secret-2024-fallback";
    if (auth !== secret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json() as { products: Product[] };
    if (!Array.isArray(body.products)) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

    await ensureDir();
    const data = { products: body.products, updatedAt: new Date().toISOString(), count: body.products.length };
    await writeFile(CATALOG_FILE, JSON.stringify(data));
    return NextResponse.json({ success: true, synced: body.products.length });
  } catch (err) {
    console.error("Catalog sync error:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
