// --- External imports ---
import { expect, test } from '@playwright/test';

// --- Tests ---
test('calculator displays annual rental yield and validates input', async ({ page }) => {
  await page.goto('/tools/rent-calculator');
  await page.getByLabel('Property price (COP)').fill('200000000');
  await page.getByLabel('Monthly rent (COP)').fill('2000000');
  await page.getByLabel('Monthly administration fee (COP)').fill('200000');
  await page.getByLabel('Other monthly fixed costs (COP)').fill('100000');
  await page.getByLabel('Vacancy months per year').fill('1');
  await page.getByRole('button', { name: 'Calculate yield' }).click();
  await expect(page.getByText('Gross yield:')).toContainText('12.00%');
  await expect(page.getByText('Net yield:')).toContainText('9.20%');
  await expect(page.getByText('Annual net income:')).toContainText('18.400.000');
  await page.getByLabel('Property price (COP)').fill('0');
  await page.getByRole('button', { name: 'Calculate yield' }).click();
  await expect(page.getByRole('alert')).toHaveText('Property price must be greater than zero.');
});

test('FAQ content renders in the browser instead of server HTML', async ({ page, request }) => {
  const response = await request.get('/tools/faq');
  expect(response.ok()).toBeTruthy();
  expect(await response.text()).not.toContain('What is KeyRing?');
  await page.goto('/tools/faq');
  await expect(page.getByText('What is KeyRing?', { exact: true })).toBeVisible();
  await expect(page.locator('details')).toHaveCount(6);
});
