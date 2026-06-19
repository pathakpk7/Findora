import { test, expect, Route } from '@playwright/test';

test('register and login flow (mocked API)', async ({ page }) => {
  const fakeEmail = `e2e+${Date.now()}@example.com`;
  const fakeUsername = `e2euser${Date.now()}`;
  const fakeUser = {
    id: 'user-1',
    email: fakeEmail,
    username: fakeUsername,
    firstName: 'E2E',
    lastName: 'User',
    avatar: null,
    rollNo: 'E2E123',
    department: 'Computer Science',
    year: 3,
    section: 'A',
    trustScore: 0,
    role: 'USER',
    isVerified: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Intercept register API
  await page.route('**/api/auth/register', async (route: Route) => {
    const request = route.request();
    const post = await request.postDataJSON().catch(() => ({}));
    // respond with created user (select fields)
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ user: { ...fakeUser } }),
    });
  });

  // Intercept login API
  await page.route('**/api/auth/login', async (route: Route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ token: 'mock-token', expiresIn: 604800 }),
    });
  });

  // Intercept users/me API
  await page.route('**/api/users/me', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(fakeUser),
    });
  });

  // Now navigate through the UI
  await page.goto('/register');
  await page.fill('input[name="email"]', fakeEmail);
  await page.fill('input[name="username"]', fakeUsername);
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("Create account")');

  // After register we expect to be redirected to login
  await page.waitForURL('/login', { timeout: 5000 });

  // Fill login form; the login POST will be mocked
  await page.fill('input[name="email"]', fakeEmail);
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("Sign in")');

  // Profile fetch (/api/users/me) is mocked to return fakeUser; app should redirect to /profile
  await page.waitForURL('/profile', { timeout: 5000 });
  await expect(page.locator('h1')).toHaveText('Profile');
  await expect(page.locator('p', { hasText: fakeEmail })).toBeVisible();
});

