import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { wishlistsAdapter } from "@/lib/sheets";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const items = await wishlistsAdapter.getWishlistByCustomer(session.user.id);
    return NextResponse.json({ success: true, data: items });
  } catch { return NextResponse.json({ success: false, error: "Failed to fetch wishlist" }, { status: 500 }); }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const body = (await request.json()) as { productId: string };
    const item = await wishlistsAdapter.addToWishlist(session.user.id, body.productId);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch { return NextResponse.json({ success: false, error: "Failed to add to wishlist" }, { status: 500 }); }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
    await wishlistsAdapter.removeFromWishlist(id);
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ success: false, error: "Failed to remove" }, { status: 500 }); }
}
