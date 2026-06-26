import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { CreateReservationSchema } from "@/lib/sheets/schemas";
import type { Reservation } from "@/lib/sheets/schemas";
import { SHEETS_AVAILABLE } from "@/lib/sheets/mock-data";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!SHEETS_AVAILABLE) return NextResponse.json({ success: true, data: [] });
  try {
    const { reservationsAdapter } = await import("@/lib/sheets");
    const reservations = (session.user as { role: string }).role === "owner"
      ? await reservationsAdapter.getTodaysReservations()
      : await reservationsAdapter.getReservationsByCustomer(session.user.id);
    return NextResponse.json({ success: true, data: reservations });
  } catch { return NextResponse.json({ success: false, error: "Failed to fetch" }, { status: 500 }); }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!SHEETS_AVAILABLE) return NextResponse.json({ success: false, error: "Google Sheets not configured yet" }, { status: 503 });
  try {
    const body = await request.json();
    const parsed = CreateReservationSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: "Invalid data" }, { status: 400 });
    const { reservationsAdapter } = await import("@/lib/sheets");
    const reservation = await reservationsAdapter.createReservation(parsed.data);
    return NextResponse.json({ success: true, data: reservation }, { status: 201 });
  } catch { return NextResponse.json({ success: false, error: "Failed to create" }, { status: 500 }); }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role: string }).role !== "owner") return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!SHEETS_AVAILABLE) return NextResponse.json({ success: false, error: "Google Sheets not configured yet" }, { status: 503 });
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
    const { status } = (await request.json()) as { status: Reservation["status"] };
    const { reservationsAdapter } = await import("@/lib/sheets");
    const updated = await reservationsAdapter.updateReservationStatus(id, status);
    return NextResponse.json({ success: true, data: updated });
  } catch { return NextResponse.json({ success: false, error: "Failed to update" }, { status: 500 }); }
}
