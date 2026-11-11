import { test, expect } from '../../src/fixtures';
import { knownIssue } from '../../src/known-issues';
import { useNativeClassList, scanAccessibility } from '../../src/utils/accessibility';

// `ready` is an element that shows the page has finished rendering.
const PAGES = [
  { name: 'home page', path: '/sr/', ready: 'main h1' },
  { name: 'dataset search', path: '/sr/datasets/?q=%D0%B1%D1%83%D1%9F%D0%B5%D1%82', ready: 'article.dataset-search-result' },
  { name: 'dataset page', path: '/sr/datasets/budzet-grada-pirota-za-2026-godinu/', ready: 'h2#resources' },
];

test.describe('Accessibility', () => {
  for (const { name, path, ready } of PAGES) {
    // Fails only on critical violations. Everything axe finds is attached to the HTML report.
    test(`TC-A01 ${name} has no critical WCAG 2.1 AA violations`, async ({ page }, testInfo) => {
      await useNativeClassList(page);
      await page.goto(path);
      await page.locator(ready).first().waitFor();

      const results = await scanAccessibility(page);

      await testInfo.attach('axe-violations.json', {
        body: JSON.stringify(results.violations, null, 2),
        contentType: 'application/json',
      });
      const summary = results.violations.map((v) => `${v.impact}: ${v.id} (${v.nodes.length})`);
      testInfo.annotations.push({ type: 'axe', description: summary.join(', ') || 'no violations' });

      const critical = results.violations.filter((v) => v.impact === 'critical');
      expect(critical.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
    });
  }

  test('TC-A02 dataset page has one <h1> @known-issue', async ({ datasetPage, page }) => {
    knownIssue('DGR-06');

    await datasetPage.goto('budzet-grada-pirota-za-2026-godinu');

    const h1s = (await page.locator('h1').allInnerTexts()).map((t) => t.trim());
    test.info().annotations.push({ type: 'observed', description: h1s.join(' | ') });
    expect(h1s).toEqual([(await datasetPage.title.innerText()).trim()]);
  });

  test('TC-A03 search page title is the <h1> @known-issue', async ({ searchPage, page }) => {
    knownIssue('DGR-06');

    await searchPage.goto('буџет');

    const h1s = (await page.locator('h1').allInnerTexts()).map((t) => t.trim());
    test.info().annotations.push({ type: 'observed', description: h1s.join(' | ') });
    expect(h1s).toEqual(['Скупови података']);
  });

  test('TC-A04 site does not replace native browser features @known-issue', async ({ page }) => {
    knownIssue('DGR-08');

    await page.goto('/sr/');

    const nativeClassList = await page.evaluate(
      () => typeof (document.body.classList as unknown as Iterable<string>)[Symbol.iterator] === 'function',
    );
    expect(nativeClassList).toBe(true);
  });
});
