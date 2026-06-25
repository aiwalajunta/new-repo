import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test("shows role selection by default", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("text=Customer Login").or(page.locator("text=\u0917\u094d\u0930\u093e\u0939\u0915 \u0932\u0949\u0917\u093f\u0928"))).toBeVisible();
    await expect(page.locator("text=Owner Login").or(page.locator("text=\u092e\u093e\u0932\u093f\u0915 \u0932\u0949\u0917\u093f\u0928"))).toBeVisible();
  });
  test("customer login flow shows phone input", async ({ page }) => {
    await page.goto("/login");
    await page.getByText(/Customer Login|\u0917\u094d\u0930\u093e\u0939\u0915 \u0932\u0949\u0917\u093f\u0928/).click();
    await expect(page.getByPlaceholder(/\+91/)).toBeVisible();
  });
  test("owner login flow shows email+password", async ({ page }) => {
    await page.goto("/login");
    await page.getByText(/Owner Login|\u092e\u093e\u0932\u093f\u0915 \u0932\u0949\u0917\u093f\u0928/).click();
    await expect(page.getByPlaceholder(/admin@/)).toBeVisible();
  });
  test("back button returns to role selection", async ({ page }) => {
    await page.goto("/login");
    await page.getByText(/Customer Login|\u0917\u094d\u0930\u093e\u0939\u0915 \u0932\u0949\u0917\u093f\u0928/).click();
    await page.getByText(/Back|\u0935\u093e\u092a\u0938/).click();
    await expect(page.locator("text=Customer Login").or(page.locator("text=\u0917\u094d\u0930\u093e\u0939\u0915 \u0932\u0949\u0917\u093f\u0928"))).toBeVisible();
  });
});
