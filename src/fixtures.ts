import { test as base, request } from '@playwright/test';
import { env } from './env';
import { PortalApi } from './api/PortalApi';
import { DatasetPage } from './pages/DatasetPage';
import { DatasetSearchPage } from './pages/DatasetSearchPage';
import { OrganizationPage } from './pages/OrganizationPage';
import { LanguageSwitcher } from './pages/LanguageSwitcher';

type Fixtures = {
  api: PortalApi;
  searchPage: DatasetSearchPage;
  datasetPage: DatasetPage;
  organizationPage: OrganizationPage;
  languageSwitcher: LanguageSwitcher;
};

export const test = base.extend<Fixtures>({
  api: async ({}, use) => {
    const context = await request.newContext({ baseURL: env.baseUrl });
    await use(new PortalApi(context));
    await context.dispose();
  },
  searchPage: async ({ page }, use) => use(new DatasetSearchPage(page)),
  datasetPage: async ({ page }, use) => use(new DatasetPage(page)),
  organizationPage: async ({ page }, use) => use(new OrganizationPage(page)),
  languageSwitcher: async ({ page }, use) => use(new LanguageSwitcher(page)),
});

export { expect } from '@playwright/test';
