import { expect, test } from "@playwright/test";

const LOAD_TIMEOUT = 30_000;

test("unauthenticated shell redirects to login", async ({ page }) => {
  await page.goto("/feed/");
  await expect(page).toHaveURL(/\/login\//, { timeout: LOAD_TIMEOUT });
  await expect(page.getByRole("heading", { name: "Вход" })).toBeVisible();
});

test("demo login opens feed", async ({ page }) => {
  await page.goto("/login/");
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page).toHaveURL(/\/feed\//, { timeout: LOAD_TIMEOUT });
  await expect(page.getByRole("heading", { name: "Лента" })).toBeVisible();
});
