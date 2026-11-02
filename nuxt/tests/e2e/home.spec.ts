// --- External imports ---
import { expect, test } from '@playwright/test';

// --- Tests ---
test('home renders navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'KeyRing' })).toBeVisible();
  const navigation = page.getByRole('navigation', { name: 'Main navigation' });
  for (const [name, href] of [
    ['Home', '/'],
    ['Blog', '/blog'],
    ['Properties', '/properties'],
    ['Tools', '/tools'],
  ]) {
    await expect(navigation.getByRole('link', { name, exact: true })).toHaveAttribute('href', href);
  }
});
