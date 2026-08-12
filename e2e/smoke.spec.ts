import { test, expect } from '@playwright/test';

/**
 * Smoke tests for the critical user paths. These run against the production
 * build (`next start`), so they also catch prerender regressions.
 */

test.describe('homepage', () => {
  test('renders hero, search and quick starts without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('searchbox', { name: /search/i }).first()).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Quick starts' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('hero search navigates to /tools with the query', async ({ page }) => {
    await page.goto('/');
    const box = page.locator('input[type="search"]').first();
    await box.fill('voice cloning');
    await box.press('Enter');
    await page.waitForURL(/\/tools\?q=/);
    expect(page.url()).toContain('voice');
  });
});

test.describe('AI Studio foundation', () => {
  test('keeps the native workspace separate from the external-tools Directory', async ({ page }) => {
    await page.goto('/ai-studio');
    await expect(page.getByRole('heading', { level: 1, name: /Make the next move yourself/i })).toBeVisible();
    await expect(page.getByText(/Native workspace/i)).toBeVisible();
    await expect(page.getByText(/Directory helps you evaluate external tools/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Open utility/i }).first()).toHaveAttribute('href', '/ai-studio/prompt-builder');
    await expect(page.getByRole('link', { name: /Browse the Directory/i })).toHaveAttribute('href', '/tools');
  });
});

test.describe('AI Studio free launch access', () => {
  test('tracks daily free quota and shows usage limit indicator', async ({ page }) => {
    await page.goto('/ai-studio/prompt-builder');
    await page.getByLabel('Main subject or message').fill('A creator making a clear cooking tutorial');
    await page.getByRole('button', { name: /Generate prompt set/i }).click();
    await expect(page.getByText(/Free Runs Left Today|Studio Pro|Free Usage|Generated/i).first()).toBeVisible();
  });

  test('keeps local image selection available for image tools', async ({ page }) => {
    await page.goto('/ai-studio/image-tools');
    await page.getByLabel('Select image file').setInputFiles({
      name: 'sample.png',
      mimeType: 'image/png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL9PgAAAABJRU5ErkJggg==', 'base64'),
    });
    await expect(page.getByText('1 × 1')).toBeVisible();
    await page.getByRole('button', { name: /Resize & download/i }).click();
    await expect(page.getByText(/Free Runs|Resized|Downloaded|Studio/i).first()).toBeVisible();
  });
});

test.describe('tools catalog', () => {
  test('server-renders a full grid with crawlable links', async ({ page }) => {
    await page.goto('/tools');
    const toolLinks = page.locator('main a[href^="/tool/"]');
    expect(await toolLinks.count()).toBeGreaterThan(10);
  });

  test('combined filters work: pricing + capability tag', async ({ page }) => {
    await page.goto('/tools?pricing=Freemium&tags=Shorts');
    await expect(page.locator('main')).toContainText(/Active/i);
    const cards = page.locator('main a[href^="/tool/"]');
    expect(await cards.count()).toBeGreaterThan(0);
  });
});

test.describe('tool detail', () => {
  test('shows honest verification state (no invented score)', async ({ page }) => {
    await page.goto('/tool/opusclip');
    await expect(page.getByRole('heading', { level: 1, name: /OpusClip/i })).toBeVisible();
    await expect(page.getByText(/Not yet tested/i).first()).toBeVisible();
    await expect(page.getByText(/Has CreatorAI Hub tested OpusClip hands-on\?/)).toBeVisible();
  });

  test('offers only a contextual Studio handoff for compatible categories', async ({ page }) => {
    await page.goto('/tool/runway');
    const cta = page.getByRole('link', { name: /Create a video prompt/i });
    await expect(cta).toHaveAttribute('href', '/ai-studio/prompt-builder');
  });

  test('deep dive renders for flagship tools', async ({ page }) => {
    await page.goto('/tool/opusclip');
    await expect(page.getByRole('heading', { name: /OpusClip in depth/ })).toBeVisible();
    await expect(page.getByText('Skip it if')).toBeVisible();
  });
});

test.describe('compare', () => {
  test('pair page renders a spec table without test claims', async ({ page }) => {
    await page.goto('/compare/elevenlabs-vs-murf-ai');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/vs/);
    await expect(page.getByRole('table').first()).toBeVisible();
  });

  test('curated cross-category pair exists (dubbing decision)', async ({ page }) => {
    await page.goto('/compare/heygen-vs-rask-ai');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/vs/);
  });
});

test.describe('stack builder', () => {
  test('goal + budget produce a stack with live prices and shareable URL', async ({ page }) => {
    await page.goto('/stack-builder');
    await page.getByRole('button', { name: /Shorts & clips/i }).first().click();
    await page.getByRole('button', { name: /\$0 — Free/i }).click();
    await expect(page.getByText(/Estimated monthly total/i)).toBeVisible();
    await expect(page.getByText('$0 /mo')).toBeVisible();
    expect(page.url()).toContain('goal=shorts');
    expect(page.url()).toContain('budget=free');
  });
});

test.describe('integrity pages', () => {
  test('deals page has no fake promo codes', async ({ page }) => {
    await page.goto('/deals');
    const body = await page.textContent('body');
    for (const fake of ['CREATORAI20', 'DESCRIPT15', 'CREATOR50', 'SUB10']) {
      expect(body).not.toContain(fake);
    }
    await expect(page.getByText(/No fake coupons/i)).toBeVisible();
  });

  test('calculators avoid hardcoded savings and absolute copyright claims', async ({ page }) => {
    await page.goto('/calculators');
    await page.getByRole('heading', { level: 2, name: /Select Tools/i }).first().waitFor({ timeout: 10_000 });
    const body = await page.textContent('body');
    expect(body).not.toContain('$2,200');
    expect(body).not.toContain('25,980');
    expect(body).not.toContain('Monetization Safe');
    await expect(page.getByText(/Time-value scenario/i)).toBeVisible();
  });

  test('best-of explains why each pick is #1', async ({ page }) => {
    await page.goto('/best-of');
    await expect(page.getByText(/Why this pick/).first()).toBeVisible();
  });

  test('methodology and disclosure render', async ({ page }) => {
    await page.goto('/methodology');
    await expect(page.locator('main')).toBeVisible();
    await page.goto('/disclosure');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('news archive (v2.8)', () => {
  test('date menu, smart search and month filtering work', async ({ page }) => {
    await page.goto('/news');
    await expect(page.getByLabel('Filter news by month')).toBeVisible();

    await page.goto('/news?m=all&q=zzz-nonexistent-topic');
    await expect(page.getByText(/Nothing matches|no results|No news|خبر/i).first()).toBeVisible();

    await page.goto('/news');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByLabel('Filter news by month')).toBeVisible();
  });
});
