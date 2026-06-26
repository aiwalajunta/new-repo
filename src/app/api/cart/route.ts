import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { SHEETS_AVAILABLE } from "@/lib/sheets/mock-data";
import { nanoid } from "nanoid";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!SHEETS_AVAILABLE) return NextResponse.json({ success: true, data: [] });
  try {
    const { getAll } = await import("@/lib/sheets/client");
    const { CartSchema } = await import("@/lib/sheets/schemas");
    const all = await getAll("Carts", CartSchema);
    return NextResponse.json({ success: true, data: all.filter((c) => c.customerId === session.user.id) });
  } catch { return NextResponse.json({ success: false, error: "Failed to fetch cart" }, { status: 500 }); }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!SHEETS_AVAILABLE) return NextResponse.json({ success: false, error: "Google Sheets not configured yet" }, { status: 503 });
  try {
    const body = (await request.json()) as { productVariantId: string; quantity: number };
    const { create } = await import("@/lib/sheets/client");
    const { CartSchema } = await import("@/lib/sheets/schemas");
    const item = await create("Carts", CartSchema, { id: `cart_${nanoid(10)}`, customerId: session.user.id, productVariantId: body.productVariantId, quantity: String(body.quantity), addedAt: new Date().toISOString() });
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch { return NextResponse.json({ success: false, error: "Failed to add to cart" }, { status: 500 }); }
}
