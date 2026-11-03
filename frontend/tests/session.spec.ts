// --- External imports ---
import { expect, test } from '@playwright/test';

// --- Constants ---
const user = {
  id: 'user-1',
  fullName: 'Example Owner',
  email: 'owner@example.test',
  phone: '',
  city: '',
  memberSince: '2026-01-01',
  role: 'user',
};
const property = {
  id: 'property-1',
  name: 'Example property',
  address: 'Address',
  city: 'Bogota',
  type: 'Apartment',
  rentalMode: 'Airbnb',
  status: 'Vacant',
  estimatedMonthlyRent: 0,
  adminFee: 0,
  otherFixedCosts: 0,
  userId: 'user-1',
};

// --- Tests ---
test('session is restored, requests use Bearer, and 401 clears it', async ({ page }) => {
  let bearer = '';
  await page.route('**/api/**', async (route) => {
    bearer = route.request().headers().authorization ?? '';
    await route.fulfill({ json: [] });
  });
  await page.route('**/api/users/login', async (route) => {
    await route.fulfill({ json: { user, token: 'test-session' } });
  });
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(user.email);
  await page.locator('input[type="password"]').fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/dashboard/);
  await expect.poll(() => bearer).toBe('Bearer test-session');
  await page.reload();
  await expect(page).toHaveURL(/dashboard/);
  await page.unroute('**/api/**');
  await page.route('**/api/**', (route) =>
    route.fulfill({ status: 401, json: { message: 'Expired' } }),
  );
  await page.reload();
  await expect(page).toHaveURL(/login/);
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/login/);
});

test('contract property is selected after loading and select labels are unique', async ({
  page,
}) => {
  await page.addInitScript(
    ({ user }) => {
      localStorage.setItem('piniaState', JSON.stringify({ auth: { user, token: 'test-session' } }));
    },
    { user },
  );
  await page.route('**/api/properties**', async (route) => {
    await route.fulfill({ json: [property] });
  });
  await page.goto('/contracts/new');
  await expect(page.getByRole('combobox', { name: 'Property' })).toContainText('Example property');
  const ids = await page
    .locator('[id^="select-label-"]')
    .evaluateAll((elements) => elements.map((el) => el.id));
  expect(ids.length).toBeGreaterThan(1);
  expect(new Set(ids).size).toBe(ids.length);
});

test('old user-only cache cannot access a protected route', async ({ page }) => {
  await page.addInitScript(
    ({ user }) => {
      localStorage.setItem('piniaState', JSON.stringify({ auth: { user } }));
    },
    { user },
  );
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/login/);
});

test('new transaction defaults to the Bogota date at a UTC month boundary', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-01T03:00:00Z') });
  await page.addInitScript(
    ({ user }) => {
      localStorage.setItem('piniaState', JSON.stringify({ auth: { user, token: 'test-session' } }));
    },
    { user },
  );
  await page.route('**/api/**', (route) =>
    route.fulfill({ json: route.request().url().includes('/properties') ? [property] : [] }),
  );
  await page.goto('/transactions');
  await page.getByRole('button', { name: 'New transaction' }).click();
  await expect(page.locator('input[type="date"]')).toHaveValue('2026-10-31');
});
