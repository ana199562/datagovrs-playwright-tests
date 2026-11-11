import { Locator, Page } from '@playwright/test';

export class OrganizationPage {
  readonly name: Locator;

  constructor(private readonly page: Page) {
    this.name = page.getByRole('main').getByRole('heading', { level: 1 });
  }

  slugFromUrl(): string {
    const match = new URL(this.page.url()).pathname.match(/\/organizations\/([^/]+)/);
    if (!match) throw new Error(`Not an organization page: ${this.page.url()}`);
    return match[1];
  }
}
