import { test, expect } from '../../src/fixtures';
import { knownIssue } from '../../src/known-issues';
import { CYRILLIC } from '../../src/utils/serbian';
import { UI_TEXT } from '../../src/pages/Lang';

test.describe('Cyrillic and Latin versions', () => {
  test('TC-L01 switching to Latin keeps the page and search @smoke', async ({ searchPage, languageSwitcher, page }) => {
    await searchPage.goto('буџет', 'cyrillic');

    await languageSwitcher.switchTo('latin');

    const url = new URL(page.url());
    expect(url.pathname).toBe('/sl/datasets/');
    expect(url.searchParams.get('q')).toBe('буџет');
    await expect(searchPage.heading).toHaveText(UI_TEXT.datasetsHeading.latin);
  });

  test('TC-L02 switching back to Cyrillic', async ({ searchPage, languageSwitcher }) => {
    await searchPage.goto('буџет', 'latin');

    await languageSwitcher.switchTo('cyrillic');

    await expect(searchPage.heading).toHaveText(UI_TEXT.datasetsHeading.cyrillic);
  });

  test('TC-L03 Cyrillic pages declare Serbian', async ({ page }) => {
    await page.goto('/sr/datasets/');
    await expect(page.locator('html')).toHaveAttribute('lang', /^sr(-Cyrl)?(-RS)?$/);
  });

  test('TC-L04 Latin pages declare Serbian in Latin script @known-issue', async ({ page }) => {
    knownIssue('DGR-04');

    await page.goto('/sl/datasets/');
    await expect(page.locator('html')).toHaveAttribute('lang', /^sr-Latn(-RS)?$/, { timeout: 5_000 });
  });

  test('TC-L05 Latin page title is fully in Latin @known-issue', async ({ page }) => {
    knownIssue('DGR-05');

    await page.goto('/sl/datasets/');
    const title = await page.title();
    test.info().annotations.push({ type: 'observed', description: title });
    expect(title).not.toMatch(CYRILLIC);
  });
});
