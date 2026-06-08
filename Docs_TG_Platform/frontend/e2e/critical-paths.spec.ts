import { expect, test } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Чем помочь сегодня?")).toBeVisible();
});

test("navigate feed and open post", async ({ page }) => {
  await page.goto("/feed/");
  await expect(page.getByText("Лента")).toBeVisible();
  await page.getByText("Опубликованные").waitFor();
  await page.locator("[data-post-card]").first().click();
  await expect(page).toHaveURL(/\/post\/\d+\//);
});

test("home to global chat flow", async ({ page }) => {
  await page.goto("/");
  const textarea = page.getByPlaceholder(/Сообщение/);
  await textarea.fill("контент-план на неделю");
  await page.getByRole("button", { name: "Отправить" }).click();
  await expect(page).toHaveURL(/\/gchat\/\?id=/);
});
