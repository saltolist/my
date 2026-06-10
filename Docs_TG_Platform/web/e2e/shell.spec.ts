import { expect, test } from "@playwright/test";

const LOAD_TIMEOUT = 30_000;

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Чем помочь сегодня?")).toBeVisible({ timeout: LOAD_TIMEOUT });
});

test("home composer sends message to new gchat", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Чем помочь сегодня?")).toBeVisible({ timeout: LOAD_TIMEOUT });
  const editor = page.getByRole("textbox", { name: /Сообщение|Чем помочь|контент/i });
  await editor.click();
  await editor.fill("контент-план на неделю");
  await page.locator(".send-btn").click();
  await expect(page).toHaveURL(/\/gchat\/\?id=gc\d+/, { timeout: LOAD_TIMEOUT });
  await expect(page.getByText("контент-план на неделю").first()).toBeVisible({ timeout: LOAD_TIMEOUT });
});

test("navigate feed from sidebar", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Чем помочь сегодня?")).toBeVisible({ timeout: LOAD_TIMEOUT });
  await page.locator("#nav-feed").click();
  await expect(page.getByRole("heading", { name: "Лента" })).toBeVisible({ timeout: LOAD_TIMEOUT });
  await expect(page.getByText("Опубликованные")).toBeVisible({ timeout: LOAD_TIMEOUT });
  await expect(page.getByText("Черновики")).toBeVisible();
});

test("navigate chats and back to home", async ({ page }) => {
  await page.goto("/chats/");
  await expect(page.getByRole("heading", { name: "Чаты" })).toBeVisible({ timeout: LOAD_TIMEOUT });
  await expect(page.getByRole("button", { name: "Новый чат" })).toBeVisible();
  await page.getByRole("button", { name: "Назад" }).click();
  await expect(page.getByText("Чем помочь сегодня?")).toBeVisible({ timeout: LOAD_TIMEOUT });
});

test("navigate notes from sidebar", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Чем помочь сегодня?")).toBeVisible({ timeout: LOAD_TIMEOUT });
  await page.locator("#nav-notes .nav-item-chats-main").click();
  await expect(page.getByRole("heading", { name: "Заметки" })).toBeVisible({ timeout: LOAD_TIMEOUT });
  await expect(page.locator(".notes-filter-row").getByRole("button", { name: "Все" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Новая заметка" })).toBeVisible();
});

test("gchat back navigates to chats", async ({ page }) => {
  await page.goto("/gchat/?id=gc1");
  await expect(page.getByRole("heading", { name: "Анализ недели" })).toBeVisible({
    timeout: LOAD_TIMEOUT,
  });
  await page.getByRole("button", { name: "Назад" }).click();
  await expect(page.getByRole("heading", { name: "Чаты" })).toBeVisible();
});

test("legacy gchat path redirects to query form", async ({ page }) => {
  await page.goto("/gchat/gc1/");
  await expect(page).toHaveURL(/\/gchat\/\?id=gc1/, { timeout: LOAD_TIMEOUT });
  await expect(page.getByRole("heading", { name: "Анализ недели" })).toBeVisible({
    timeout: LOAD_TIMEOUT,
  });
});

test("analytics page loads with period tabs", async ({ page }) => {
  await page.goto("/analytics/");
  await expect(page.getByRole("heading", { name: "Аналитика канала" })).toBeVisible({
    timeout: LOAD_TIMEOUT,
  });
  await expect(
    page.getByRole("tablist", { name: "Период аналитики" }).getByRole("tab", { name: "24 ч." }),
  ).toBeVisible();
});

test("post page loads", async ({ page }) => {
  await page.goto("/post/1/");
  await expect(page.getByRole("heading", { name: /Два года я не мог нажать кнопку/ })).toBeVisible({
    timeout: LOAD_TIMEOUT,
  });
});

test("legacy post notes path redirects to canonical post url", async ({ page }) => {
  await page.goto("/post/5/notes/");
  await expect(page).toHaveURL(/\/post\/5\/$/, { timeout: LOAD_TIMEOUT });
});

test("global note page loads after cache sync", async ({ page }) => {
  await page.goto("/note/global/gn1/");
  await expect(
    page.getByRole("heading", { name: "Структура серии про барьеры инвестора" }),
  ).toBeVisible({ timeout: LOAD_TIMEOUT });
});

test("chats scope select can be changed", async ({ page }) => {
  await page.goto("/chats/");
  await expect(page.getByRole("heading", { name: "Чаты" })).toBeVisible({ timeout: LOAD_TIMEOUT });
  await page.getByRole("button", { name: "Область чатов" }).click();
  await page.locator(".ctx-item", { hasText: "Глобальные" }).click();
  await expect(page.getByRole("button", { name: "Область чатов" })).toContainText("Глобальные");
});
