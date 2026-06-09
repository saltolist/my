import { expect, test } from "@playwright/test";

const LOAD_TIMEOUT = 30_000;

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Чем помочь сегодня?" })).toBeVisible({
    timeout: LOAD_TIMEOUT,
  });
});

test("feed page loads with seed data", async ({ page }) => {
  await page.goto("/feed/");
  await expect(page.getByRole("heading", { name: "Лента" })).toBeVisible({ timeout: LOAD_TIMEOUT });
  await expect(page.getByText(/постов: \d+ из seed\/MSW/)).toBeVisible();
});

test("all main routes open without 404", async ({ page }) => {
  const routes = [
    { path: "/chats/", heading: "Чаты" },
    { path: "/notes/", heading: "Заметки" },
    { path: "/analytics/", heading: "Аналитика" },
    { path: "/profile/", heading: "Профиль" },
    { path: "/post/1/", heading: "Пост #1" },
    { path: "/gchat/?id=gc1", heading: "Анализ недели" },
    { path: "/note/global/gn1/", heading: "Структура серии про барьеры инвестора" },
  ];

  for (const { path, heading } of routes) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible({
      timeout: LOAD_TIMEOUT,
    });
  }
});
