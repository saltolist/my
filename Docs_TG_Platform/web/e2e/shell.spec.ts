import { expect, test } from "@playwright/test";

const LOAD_TIMEOUT = 30_000;

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "TG Platform" })).toBeVisible({
    timeout: LOAD_TIMEOUT,
  });
});
