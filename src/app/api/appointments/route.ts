import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";
import type { Appointment } from "@/lib/sheets/schemas";
import { SHEETS_AVAILABLE, MOCK_APPOINTMENTS } from "@/lib/sheets/mock-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter");
    const today = new Date().toISOString().split("T")[0] ?? "";
    if (!SHEETS_AVAILABLE) {
      let data = MOCK_APPOINTMENTS;
      if (filter === "today") data = data.filter((a) => a.date === today && a.status !== "cancelled");
      return NextResponse.json({ success: true, data } satisfies ApiResponse<Appointment[]>);
    }
    const { appointmentsAdapter } = await import("@/lib/sheets");
    const apts = filter === "today" ? await appointmentsAdapter.getTodaysAppointments() : await appointmentsAdapter.getAllAppointments();
    return NextResponse.json({ success: true, data: apts });
  } catch { return NextResponse.json({ success: false, error: "Failed" }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!SHEETS_AVAILABLE) return NextResponse.json({ success: true, data: { ...body, id: `apt_demo_${Date.now()}`, status: "pending" }, message: "Demo mode" }, { status: 201 });
    const { appointmentsAdapter } = await import("@/lib/sheets");
    const apt = await appointmentsAdapter.createAppointment(body);
    return NextResponse.json({ success: true, data: apt }, { status: 201 });
  } catch { return NextResponse.json({ success: false, error: "Failed" }, { status: 500 }); }
}
