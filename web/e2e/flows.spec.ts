import { test, expect } from "@playwright/test";

test("landing renders hero copy", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Pay when the post is live/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Create a deal/i }).first()).toBeVisible();
});

test("deals dashboard shows mock deals", async ({ page }) => {
  await page.goto("/deals");
  await expect(page.getByRole("heading", { name: /Deals/i })).toBeVisible();
  await expect(page.getByText(/VOUCH-1042/)).toBeVisible();
});

test("create-deal form has review step", async ({ page }) => {
  await page.goto("/deals/new");
  await expect(page.getByRole("heading", { name: /Create a deal/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Review/i })).toBeVisible();
});
