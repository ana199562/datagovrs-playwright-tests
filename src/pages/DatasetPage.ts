import { Locator, Page } from '@playwright/test';
import { PATH_PREFIX, Script } from './Lang';

export class DatasetPage {
  readonly title: Locator;
  readonly organizationLink: Locator;
  readonly resourcesHeading: Locator;

  constructor(private readonly page: Page) {
    // Inside <main>, because the footer has another <h1> (DGR-06)
    this.title = page.getByRole('main').getByRole('heading', { level: 1 });
    this.organizationLink = page.getByRole('main').locator('a[href*="/organizations/"]').first();
    this.resourcesHeading = page.locator('h2#resources');
  }

  async goto(slug: string, script: Script = 'cyrillic') {
    await this.page.goto(`${PATH_PREFIX[script]}/datasets/${slug}/`);
    await this.title.waitFor();
  }

  // "Ресурси 2" -> 2
  async resourceCount(): Promise<number> {
    const text = await this.resourcesHeading.innerText();
    return Number(text.replace(/\D/g, ''));
  }
}
