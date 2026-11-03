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

test('shared shell uses contrasting focus indicators on light and dark surfaces', async ({
  page,
}) => {
  await page.goto('/blog');
  const articleLink = page.locator('.card h2 a').first();
  await articleLink.focus();
  await expect(articleLink).toHaveCSS('outline-color', 'rgb(151, 63, 40)');
  const brandLink = page.locator('.site-brand');
  await brandLink.focus();
  await expect(brandLink).toHaveCSS('outline-color', 'rgb(255, 215, 204)');
});

test('mobile shell does not force vertical overflow on short pages', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const dimensions = await page.evaluate(() => ({
    content: document.documentElement.scrollHeight,
    viewport: window.innerHeight,
  }));
  expect(dimensions.content).toBe(dimensions.viewport);
});
