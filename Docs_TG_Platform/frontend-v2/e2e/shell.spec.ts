import { expect, test } from "@playwright/test";

const LOAD_TIMEOUT = 30_000;

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Чем помочь сегодня?")).toBeVisible({ timeout: LOAD_TIMEOUT });
});

test("navigate feed from sidebar", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Чем помочь сегодня?")).toBeVisible({ timeout: LOAD_TIMEOUT });
  await page.getByRole("navigation", { name: "Основная навигация" }).getByRole("button", { name: "Лента" }).click();
  await expect(page.getByRole("heading", { name: "Лента" })).toBeVisible();
});

test("navigate chats and back to home", async ({ page }) => {
  await page.goto("/chats/");
  await expect(page.getByRole("heading", { name: "Чаты" })).toBeVisible({ timeout: LOAD_TIMEOUT });
  await page.getByRole("button", { name: "Назад" }).click();
  await expect(page.getByText("Чем помочь сегодня?")).toBeVisible({ timeout: LOAD_TIMEOUT });
});

test("navigate notes from sidebar", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Чем помочь сегодня?")).toBeVisible({ timeout: LOAD_TIMEOUT });
  await page
    .getByRole("navigation", { name: "Основная навигация" })
    .getByRole("button", { name: "Заметки", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: "Заметки" })).toBeVisible();
});
