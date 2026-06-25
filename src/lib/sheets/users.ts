import { nanoid } from "nanoid";
import { UserSchema, type User, type CreateUser } from "./schemas";
import * as client from "./client";

const SHEET = "Users" as const;

export async function getUserByEmail(email: string): Promise<User | null> {
  return (await client.getAll(SHEET, UserSchema)).find((u) => u.email === email && u.isActive) ?? null;
}
export async function getUserByPhone(phone: string): Promise<User | null> {
  return (await client.getAll(SHEET, UserSchema)).find((u) => u.phone === phone && u.isActive) ?? null;
}
export async function getUserById(id: string): Promise<User | null> {
  return client.getById(SHEET, UserSchema, id);
}
export async function createUser(data: CreateUser): Promise<User> {
  const now = new Date().toISOString();
  return client.create(SHEET, UserSchema, { ...data, id: `usr_${nanoid(10)}`, createdAt: now, lastLoginAt: now, isActive: String(data.isActive), passwordHash: data.passwordHash ?? "" });
}
export async function updateLastLogin(id: string): Promise<User | null> {
  return client.update(SHEET, UserSchema, id, { lastLoginAt: new Date().toISOString() });
}
