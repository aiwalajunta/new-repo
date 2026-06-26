import { nanoid } from "nanoid";
import { AppointmentSchema, AppointmentItemSchema, type Appointment, type AppointmentItem, type CreateAppointment } from "./schemas";
import * as client from "./client";
import { SHEETS_AVAILABLE, MOCK_APPOINTMENTS, MOCK_APPOINTMENT_ITEMS } from "./mock-data";

const APT_SHEET = "Appointments" as const;
const ITEM_SHEET = "AppointmentItems" as const;

export async function getAllAppointments(bustCache = false): Promise<Appointment[]> {
  if (!SHEETS_AVAILABLE) return MOCK_APPOINTMENTS;
  return client.getAll(APT_SHEET, AppointmentSchema, { bustCache });
}

export async function getTodaysAppointments(): Promise<Appointment[]> {
  const today = new Date().toISOString().split("T")[0] ?? "";
  const all = await getAllAppointments();
  return all.filter((a) => a.date === today && a.status !== "cancelled").sort((a, b) => a.time.localeCompare(b.time));
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  if (!SHEETS_AVAILABLE) return MOCK_APPOINTMENTS.find((a) => a.id === id) ?? null;
  return client.getById(APT_SHEET, AppointmentSchema, id);
}

export async function getAppointmentsByCustomer(customerId: string): Promise<Appointment[]> {
  const all = await getAllAppointments();
  return all.filter((a) => a.customerId === customerId);
}

export async function createAppointment(data: CreateAppointment): Promise<Appointment> {
  const now = new Date().toISOString();
  return client.create(APT_SHEET, AppointmentSchema, { ...data, id: `apt_${nanoid(10)}`, status: "pending", totalItems: 0, createdAt: now, updatedAt: now });
}

export async function updateAppointmentStatus(id: string, status: Appointment["status"]): Promise<Appointment | null> {
  return client.update(APT_SHEET, AppointmentSchema, id, { status, updatedAt: new Date().toISOString() });
}

export async function getAppointmentItems(appointmentId: string): Promise<AppointmentItem[]> {
  if (!SHEETS_AVAILABLE) return MOCK_APPOINTMENT_ITEMS.filter((i) => i.appointmentId === appointmentId);
  const all = await client.getAll(ITEM_SHEET, AppointmentItemSchema);
  return all.filter((i) => i.appointmentId === appointmentId);
}

export async function addAppointmentItem(appointmentId: string, data: Omit<AppointmentItem, "id" | "appointmentId" | "isPrepared">): Promise<AppointmentItem> {
  return client.create(ITEM_SHEET, AppointmentItemSchema, { ...data, id: `item_${nanoid(10)}`, appointmentId, isPrepared: "false" });
}

export async function markItemPrepared(itemId: string, prepared: boolean): Promise<AppointmentItem | null> {
  return client.update(ITEM_SHEET, AppointmentItemSchema, itemId, { isPrepared: String(prepared) });
}
