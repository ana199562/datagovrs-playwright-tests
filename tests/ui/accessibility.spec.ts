import { test, expect } from '../../src/fixtures';
import { knownIssue } from '../../src/known-issues';

test.describe('Accessibility', () => {
  test('TC-A01 dataset page has one <h1> @known-issue', async ({ datasetPage, page }) => {
    knownIssue('DGR-06');

    await datasetPage.goto('budzet-grada-pirota-za-2026-godinu');

    const h1s = (await page.locator('h1').allInnerTexts()).map((t) => t.trim());
    test.info().annotations.push({ type: 'observed', description: h1s.join(' | ') });
    expect(h1s).toEqual([(await datasetPage.title.innerText()).trim()]);
  });

  test('TC-A02 search page title is the <h1> @known-issue', async ({ searchPage, page }) => {
    knownIssue('DGR-06');

    await searchPage.goto('буџет');

    const h1s = (await page.locator('h1').allInnerTexts()).map((t) => t.trim());
    test.info().annotations.push({ type: 'observed', description: h1s.join(' | ') });
    expect(h1s).toEqual(['Скупови података']);
  });
});
