// --- External imports ---
import { expect, test } from '@playwright/test';

// --- Tests ---
test('lists articles and opens a complete article', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.getByRole('heading', { level: 2 })).toHaveCount(3);
  await expect(
    page.getByRole('link', { name: 'Fixed Costs Every Landlord Should Track' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Short-Term vs Long-Term Rentals' })).toBeVisible();
  await page.getByRole('link', { name: 'How to Calculate Rental Yield' }).click();
  await expect(page).toHaveURL(/\/blog\/how-to-calculate-rental-yield$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'How to Calculate Rental Yield' }),
  ).toBeVisible();
  await expect(
    page.getByText('Rental yield measures annual rent against a property value.', { exact: false }),
  ).toBeVisible();
});

test('returns 404 for an unknown article', async ({ page }) => {
  const response = await page.goto('/blog/unknown-article');
  expect(response?.status()).toBe(404);
});
