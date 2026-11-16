import { test, expect, type Page, type Route } from '@playwright/test';

const ENDPOINT = 'https://api.web3forms.com/submit';

async function fillValid(page: Page) {
  await page.locator('#name').fill('Test Visitor');
  await page.locator('#email').fill('visitor@example.com');
  await page.locator('#event_type').selectOption('Private parties');
  await page.locator('#message').fill('Playwright test inquiry.');
}

const submit = (page: Page) => page.locator('#inquiry-form').getByRole('button', { name: 'Send Inquiry' }).click();

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#contact');
});

test('required fields show accessible errors and nothing is sent', async ({ page }) => {
  let requests = 0;
  await page.route(ENDPOINT, (route) => {
    requests += 1;
    return route.abort();
  });

  await submit(page);

  for (const id of ['name', 'email', 'event_type']) {
    await expect(page.locator(`#${id}`)).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator(`#${id}-error`)).toBeVisible();
  }
  await expect(page.locator('#name-error')).toHaveText('Please enter your name.');
  await expect(page.locator('#event_type-error')).toHaveText('Please choose an event type.');
  await expect(page.locator('#name')).toBeFocused();
  await expect(page.locator('[data-form-status]')).toContainText('3 highlighted fields');
  expect(requests).toBe(0);
});

test('invalid email and phone are rejected', async ({ page }) => {
  await fillValid(page);
  await page.locator('#email').fill('not-an-email');
  await page.locator('#phone').fill('12');
  await submit(page);
  await expect(page.locator('#email-error')).toHaveText(/valid email address/);
  await expect(page.locator('#phone-error')).toHaveText(/valid phone number/);

  // Errors clear live as the visitor fixes them.
  await page.locator('#email').fill('visitor@example.com');
  await expect(page.locator('#email-error')).toBeHidden();
});

test('successful submission shows confirmation and sends the right payload', async ({ page }) => {
  let body = '';
  await page.route(ENDPOINT, async (route) => {
    body = route.request().postData() ?? '';
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });

  await page.getByRole('link', { name: 'Inquire About This Package: Signature Wedding Reception' }).click();
  await fillValid(page);
  await submit(page);

  await expect(page.locator('[data-form-success]')).toBeVisible();
  await expect(page.locator('[data-form-success]')).toBeFocused();
  await expect(page.locator('#inquiry-form')).toBeHidden();
  for (const field of ['access_key', 'name', 'email', 'event_type', 'package', 'subject']) {
    expect(body).toContain(`name="${field}"`);
  }
  expect(body).not.toContain('name="botcheck"'); // honeypot untouched by humans
  expect(body).toContain('Signature Wedding Reception');

  // Visitor can send another.
  await page.getByRole('button', { name: 'Send another inquiry' }).click();
  await expect(page.locator('#inquiry-form')).toBeVisible();
});

const failures: Array<[string, (route: Route) => Promise<void>]> = [
  ['HTTP 500', (route) => route.fulfill({ status: 500, body: 'Server error' })],
  ['API success:false', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":false,"message":"Invalid key"}' })],
  ['non-JSON 200', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<html></html>' })],
  ['network failure', (route) => route.abort('failed')],
];

for (const [name, handler] of failures) {
  test(`never reports success on ${name}`, async ({ page }) => {
    await page.route(ENDPOINT, handler);
    await fillValid(page);
    await submit(page);

    await expect(page.locator('[data-form-status]')).toContainText('could not be sent');
    await expect(page.locator('[data-form-success]')).toBeHidden();
    await expect(page.locator('#name')).toHaveValue('Test Visitor'); // input preserved
    await expect(page.locator('#inquiry-form [data-submit]')).toBeEnabled();
  });
}

test('double-clicking submit sends only one request', async ({ page }) => {
  let requests = 0;
  await page.route(ENDPOINT, async (route) => {
    requests += 1;
    await new Promise((resolve) => setTimeout(resolve, 600));
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
  });
  await fillValid(page);
  const button = page.locator('#inquiry-form [data-submit]');
  await button.click();
  await expect(button).toBeDisabled();
  await expect(button).toContainText('Sending');
  await button.click({ force: true }).catch(() => {});
  await page.locator('#inquiry-form').evaluate((form: HTMLFormElement) => form.requestSubmit());
  await expect(page.locator('[data-form-success]')).toBeVisible();
  expect(requests).toBe(1);
});

test('date picker does not allow past dates', async ({ page }) => {
  const min = await page.locator('#event_date').getAttribute('min');
  expect(min).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});
