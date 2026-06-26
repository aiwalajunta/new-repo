import { nanoid } from "nanoid";
import { CustomerSchema, type Customer } from "./schemas";
import * as client from "./client";
import { SHEETS_AVAILABLE, MOCK_CUSTOMERS } from "./mock-data";

const SHEET = "Customers" as const;

export async function getAllCustomers(): Promise<Customer[]> {
  if (!SHEETS_AVAILABLE) return MOCK_CUSTOMERS;
  return client.getAll(SHEET, CustomerSchema);
}

export async function getCustomerByPhone(phone: string): Promise<Customer | null> {
  if (!SHEETS_AVAILABLE) return MOCK_CUSTOMERS.find((c) => c.phone === phone) ?? null;
  const all = await client.getAll(SHEET, CustomerSchema);
  return all.find((c) => c.phone === phone && c.isActive) ?? null;
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  if (!SHEETS_AVAILABLE) return MOCK_CUSTOMERS.find((c) => c.id === id) ?? null;
  return client.getById(SHEET, CustomerSchema, id);
}

export async function createCustomer(data: Omit<Customer, "id" | "createdAt" | "loyaltyPoints" | "totalVisits">): Promise<Customer> {
  const now = new Date().toISOString();
  return client.create(SHEET, CustomerSchema, { ...data, id: `cust_${nanoid(10)}`, loyaltyPoints: 0, totalVisits: 0, isActive: String(data.isActive ?? true), createdAt: now });
}

export async function updateCustomer(id: string, data: Partial<Record<string, unknown>>): Promise<Customer | null> {
  return client.update(SHEET, CustomerSchema, id, data);
}
