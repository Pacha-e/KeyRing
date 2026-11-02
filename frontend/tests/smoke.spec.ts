// --- External imports ---
import { expect, test } from '@playwright/test';

// --- Tests ---
test('home page renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main')).toBeVisible();
  await expect(page).toHaveURL('/');
});

test('login page renders', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
});
