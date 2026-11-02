// --- External imports ---
import { expect, test } from '@playwright/test';

// --- Tests ---
test('server renders all properties without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/properties');
  for (const name of [
    'Laureles Garden',
    'El Poblado View',
    'Sabaneta Terrace',
    'Envigado Family House',
    'Las Palmas Retreat',
    'Sabaneta Central',
  ]) {
    await expect(page.getByRole('link', { name })).toBeVisible();
  }
  await expect(page.locator('article')).toHaveCount(6);
  await context.close();
});

test('property links open full details', async ({ page }) => {
  await page.goto('/properties');
  await page.getByRole('link', { name: 'Laureles Garden' }).click();
  await expect(page).toHaveURL('/properties/1');
  await expect(page.getByRole('heading', { name: 'Laureles Garden' })).toBeVisible();
  await expect(page.getByText('Calle 39 # 74-20')).toBeVisible();
});

test('unknown and invalid property IDs return 404', async ({ page, request }) => {
  expect((await page.goto('/properties/999'))?.status()).toBe(404);
  expect((await request.get('/api/properties/invalid')).status()).toBe(404);
});
