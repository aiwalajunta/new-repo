import { describe, it, expect } from "vitest";
import { UserSchema, CategorySchema, ProductSchema, ReservationSchema, WishlistSchema, LoyaltyLedgerSchema, SHEET_HEADERS } from "@/lib/sheets/schemas";

describe("UserSchema", () => {
  it("parses a valid owner user", () => {
    const raw = { id: "usr_001", role: "owner", email: "admin@adityatextile.com", phone: "+919876543210", passwordHash: "$2b$12$hash", name: "Aditya Owner", createdAt: "2024-01-01T00:00:00Z", lastLoginAt: "2024-06-01T10:00:00Z", isActive: "true" };
    const result = UserSchema.safeParse(raw);
    expect(result.success).toBe(true);
    if (result.success) { expect(result.data.role).toBe("owner"); expect(result.data.isActive).toBe(true); }
  });
  it("rejects invalid role", () => {
    const raw = { id: "usr_001", role: "admin", email: "x@x.com", phone: "123", passwordHash: "", name: "X", createdAt: "2024-01-01T00:00:00Z", lastLoginAt: "2024-01-01T00:00:00Z", isActive: "true" };
    expect(UserSchema.safeParse(raw).success).toBe(false);
  });
  it("coerces isActive string to boolean", () => {
    const raw = { id: "usr_002", role: "customer", email: "", phone: "+911234567890", passwordHash: "", name: "Test User", createdAt: "2024-01-01T00:00:00Z", lastLoginAt: "2024-01-01T00:00:00Z", isActive: "false" };
    const result = UserSchema.safeParse(raw);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.isActive).toBe(false);
  });
});

describe("ProductSchema", () => {
  const validProduct = { id: "prod_001", title: "Banarasi Silk Saree", slug: "banarasi-silk-saree", categoryId: "cat_001", description: "Handwoven Banarasi saree", fabric: "Silk", occasion: "Wedding,Festive", basePrice: "12999", discountPct: "10", finalPrice: "11699", tags: "silk,wedding", isNewArrival: "true", isTrending: "false", isActive: "true", createdAt: "2024-01-15T10:00:00Z", updatedAt: "2024-01-15T10:00:00Z" };
  it("parses CSV fields into arrays", () => {
    const result = ProductSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
    if (result.success) { expect(result.data.occasion).toEqual(["Wedding","Festive"]); expect(result.data.tags).toEqual(["silk","wedding"]); }
  });
  it("coerces price strings to numbers", () => {
    const result = ProductSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
    if (result.success) { expect(result.data.basePrice).toBe(12999); expect(result.data.finalPrice).toBe(11699); }
  });
  it("handles empty occasion field", () => {
    const result = ProductSchema.safeParse({ ...validProduct, occasion: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.occasion).toEqual([]);
  });
});

describe("ReservationSchema", () => {
  it("validates valid reservation", () => {
    const raw = { id: "res_001", customerId: "usr_001", productVariantId: "var_001", visitDate: "2024-06-15", visitTime: "14:00", status: "pending", notes: "", createdAt: "2024-06-10T10:00:00Z", expiresAt: "2024-06-12T10:00:00Z" };
    expect(ReservationSchema.safeParse(raw).success).toBe(true);
  });
  it("rejects invalid status", () => {
    const raw = { id: "res_001", customerId: "usr_001", productVariantId: "var_001", visitDate: "2024-06-15", visitTime: "14:00", status: "waiting", notes: "", createdAt: "2024-06-10T10:00:00Z", expiresAt: "2024-06-12T10:00:00Z" };
    expect(ReservationSchema.safeParse(raw).success).toBe(false);
  });
});

describe("SHEET_HEADERS", () => {
  it("has headers for all 13 sheets", () => {
    const expected = ["Users","Categories","Products","ProductImages","ProductVariants","Wishlists","Carts","Reservations","Reviews","Notifications","LoyaltyLedger","FamilySizes","AuditLog"];
    for (const name of expected) { expect(SHEET_HEADERS).toHaveProperty(name); expect(Array.isArray(SHEET_HEADERS[name as keyof typeof SHEET_HEADERS])).toBe(true); }
  });
  it("Products headers include all required columns", () => {
    expect(SHEET_HEADERS.Products).toContain("id");
    expect(SHEET_HEADERS.Products).toContain("slug");
    expect(SHEET_HEADERS.Products).toContain("finalPrice");
    expect(SHEET_HEADERS.Products).toContain("isActive");
  });
});
