import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getAll, create } from "@/lib/sheets/client";
import { CartSchema } from "@/lib/sheets/schemas";
import { nanoid } from "nanoid";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const all = await getAll("Carts", CartSchema);
    return NextResponse.json({ success: true, data: all.filter((c) => c.customerId === session.user.id) });
  } catch { return NextResponse.json({ success: false, error: "Failed to fetch cart" }, { status: 500 }); }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const body = (await request.json()) as { productVariantId: string; quantity: number };
    const item = await create("Carts", CartSchema, { id: `cart_${nanoid(10)}`, customerId: session.user.id, productVariantId: body.productVariantId, quantity: String(body.quantity), addedAt: new Date().toISOString() });
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch { return NextResponse.json({ success: false, error: "Failed to add to cart" }, { status: 500 }); }
}
