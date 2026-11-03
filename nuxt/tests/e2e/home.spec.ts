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

test('shared shell applies global typography and navigation styling', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.locator('body')).toHaveCSS('margin', '0px');
  await expect(page.locator('body')).toHaveCSS('font-family', /Inter/);
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toHaveCSS(
    'display',
    'flex',
  );
  await expect(page.locator('header')).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});
