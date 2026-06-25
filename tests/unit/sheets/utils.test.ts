import { describe, it, expect, vi } from "vitest";
import { formatPrice, getStockStatus, calcDiscount, formatRelativeDate } from "@/lib/utils/format";
import { getCurrentFestival } from "@/lib/utils/festival";

describe("formatPrice", () => {
  it("formats rupees with Indian locale", () => { expect(formatPrice(12999)).toContain("12,999"); expect(formatPrice(12999)).toContain("₹"); });
  it("handles zero", () => { expect(formatPrice(0)).toContain("0"); });
  it("formats large amounts", () => { expect(formatPrice(100000)).toContain("1,00,000"); });
});

describe("getStockStatus", () => {
  it("returns danger for out of stock", () => { expect(getStockStatus(0).variant).toBe("danger"); });
  it("returns warning for low stock (\u22643)", () => { expect(getStockStatus(2).variant).toBe("warning"); expect(getStockStatus(3).variant).toBe("warning"); });
  it("returns success for in stock", () => { expect(getStockStatus(10).variant).toBe("success"); });
  it("includes count in low stock label", () => { expect(getStockStatus(2).label).toContain("2"); });
});

describe("calcDiscount", () => {
  it("calculates correct percentage", () => { expect(calcDiscount(10000, 9000)).toBe(10); expect(calcDiscount(12999, 11699)).toBe(10); });
  it("returns 0 when no discount", () => { expect(calcDiscount(5000, 5000)).toBe(0); });
  it("handles zero base price safely", () => { expect(calcDiscount(0, 0)).toBe(0); });
});

describe("getCurrentFestival", () => {
  it("returns null or a valid festival object", () => {
    const result = getCurrentFestival();
    if (result !== null) { expect(result).toHaveProperty("key"); expect(result).toHaveProperty("name"); expect(result).toHaveProperty("color"); }
  });
});

describe("formatRelativeDate", () => {
  it("returns 'Today' for same day", () => { expect(formatRelativeDate(new Date().toISOString())).toBe("Today"); });
  it("returns 'Yesterday' for 1 day ago", () => { expect(formatRelativeDate(new Date(Date.now() - 86400000 * 1.5).toISOString())).toBe("Yesterday"); });
  it("returns days ago for < 7 days", () => { expect(formatRelativeDate(new Date(Date.now() - 86400000 * 3.5).toISOString())).toContain("days ago"); });
});
