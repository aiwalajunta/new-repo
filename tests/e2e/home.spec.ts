import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("loads and shows hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Aditya Textile/);
    await expect(page.locator("h1").first()).toBeVisible();
  });
  test("shows bottom navigation on mobile", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await expect(nav).toBeVisible();
  });
  test("category grid renders", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Shop by Category").or(page.locator("text=\u0936\u094d\u0930\u0947\u0923\u0940 \u0938\u0947 \u0916\u0930\u0940\u0926\u0947\u0902"))).toBeVisible({ timeout: 10000 });
  });
  test("navigates to categories on nav click", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Categories|\u0936\u094d\u0930\u0947\u0923\u093f\u092f\u093e\u0901/ }).first().click();
    await expect(page).toHaveURL(/\/categories/);
  });
});
