import { expect, Locator, Page } from '@playwright/test';
import { PATH_PREFIX, Script, UI_TEXT } from './Lang';

export class DatasetSearchPage {
  readonly heading: Locator;
  readonly searchBox: Locator;
  readonly totalCount: Locator;
  readonly results: Locator;
  readonly resultLinks: Locator;

  constructor(private readonly page: Page) {
    // The page title is an <h3>, not an <h1> (DGR-06)
    this.heading = page.getByRole('main').getByRole('heading').first();
    this.searchBox = page.getByRole('main').getByRole('textbox', { name: /Претрага података|Pretraga podataka/ });
    this.totalCount = page.getByRole('main').getByText(UI_TEXT.totalCount).first();
    this.results = page.locator('article.dataset-search-result');
    this.resultLinks = page.locator('a:has(> article.dataset-search-result)');
  }

  async goto(query: string, script: Script = 'cyrillic') {
    await this.page.goto(`${PATH_PREFIX[script]}/datasets/?q=${encodeURIComponent(query)}`);
    await expect(this.totalCount).toBeVisible();
  }

  async search(query: string) {
    await this.searchBox.fill(query);
    await this.searchBox.press('Enter');
    await expect.poll(() => new URL(this.page.url()).searchParams.get('q')).toBe(query);
    await expect(this.totalCount).toBeVisible();
  }

  async total(): Promise<number> {
    const text = await this.totalCount.innerText();
    const match = text.match(UI_TEXT.totalCount);
    if (!match) throw new Error(`Cannot read the result count from "${text}"`);
    return Number(match[1].replace(/\D/g, ''));
  }

  // Result cards appear a moment after the count.
  async waitForResults() {
    await expect(this.results.first()).toBeVisible();
  }

  async resultSlugs(): Promise<string[]> {
    await this.waitForResults();
    return this.results.evaluateAll((cards) => cards.map((c) => c.getAttribute('slug') ?? ''));
  }

  async openResult(index = 0) {
    await this.waitForResults();
    await this.resultLinks.nth(index).click();
  }
}
