import { expect, Locator, Page } from '@playwright/test';
import { PATH_PREFIX, Script, UI_TEXT } from './Lang';

export class DatasetSearchPage {
  readonly heading: Locator;
  readonly searchBox: Locator;
  readonly totalCount: Locator;
  readonly results: Locator;
  readonly resultLinks: Locator;
  readonly organizationFilter: Locator;
  readonly formatFilter: Locator;

  constructor(private readonly page: Page) {
    // The page title is an <h3>, not an <h1> (DGR-06)
    this.heading = page.getByRole('main').getByRole('heading').first();
    this.searchBox = page.getByRole('main').getByRole('textbox', { name: /Претрага података|Pretraga podataka/ });
    this.totalCount = page.getByRole('main').getByText(UI_TEXT.totalCount).first();
    this.results = page.locator('article.dataset-search-result');
    this.resultLinks = page.locator('a:has(> article.dataset-search-result)');
    this.organizationFilter = page.getByRole('main').getByRole('textbox', { name: /Претрага организација|Pretraga organizacija/ });
    this.formatFilter = page.getByRole('main').getByRole('textbox', { name: /Претрага формата|Pretraga formata/ });
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

  // Filters are dropdowns with a search box: type, then pick the option from the list.
  // The publisher list loads in the background and clears the box when it arrives,
  // so wait for it before typing.
  async chooseFilter(filter: Locator, option: string) {
    const urlBefore = this.page.url();
    const options = filter.locator('..').locator('.multiselect-option');
    await expect(options).not.toHaveCount(0);
    await filter.click();
    await filter.fill(option);
    await options.getByText(option, { exact: true }).click();
    await expect(this.page).not.toHaveURL(urlBefore);
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
