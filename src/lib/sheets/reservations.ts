import { nanoid } from "nanoid";
import { addDays } from "date-fns";
import { ReservationSchema, type Reservation, type CreateReservation } from "./schemas";
import * as client from "./client";

const SHEET = "Reservations" as const;

export async function getReservationsByCustomer(customerId: string): Promise<Reservation[]> {
  return (await client.getAll(SHEET, ReservationSchema)).filter((r) => r.customerId === customerId);
}
export async function getReservationsByStatus(status: Reservation["status"]): Promise<Reservation[]> {
  return (await client.getAll(SHEET, ReservationSchema)).filter((r) => r.status === status);
}
export async function getTodaysReservations(): Promise<Reservation[]> {
  const today = new Date().toISOString().split("T")[0] ?? "";
  return (await client.getAll(SHEET, ReservationSchema)).filter((r) => r.visitDate === today && r.status !== "cancelled" && r.status !== "expired");
}
export async function createReservation(data: CreateReservation): Promise<Reservation> {
  const now = new Date();
  return client.create(SHEET, ReservationSchema, { ...data, id: `res_${nanoid(10)}`, status: "pending", createdAt: now.toISOString(), expiresAt: addDays(now, 2).toISOString() });
}
export async function updateReservationStatus(id: string, status: Reservation["status"]): Promise<Reservation | null> {
  return client.update(SHEET, ReservationSchema, id, { status });
}
