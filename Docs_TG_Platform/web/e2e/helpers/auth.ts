import { expect, type Page } from "@playwright/test";

const LOAD_TIMEOUT = 30_000;

export async function loginAsDemo(page: Page): Promise<void> {
  await page.goto("/login/");
  await expect(page.getByRole("heading", { name: "Вход" })).toBeVisible({ timeout: LOAD_TIMEOUT });
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page).toHaveURL(/\/feed\//, { timeout: LOAD_TIMEOUT });
  await expect(page.getByRole("heading", { name: "Лента" })).toBeVisible({ timeout: LOAD_TIMEOUT });
  await expect(page.locator(".post-card").first()).toBeVisible({ timeout: LOAD_TIMEOUT });
}
