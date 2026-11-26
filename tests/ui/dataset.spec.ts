import { test, expect } from '../../src/fixtures';
import { SAMPLE_ORGANIZATION } from '../../src/data/search-terms';

test.describe('Dataset page', () => {
  test('TC-D01 shows correct title, publisher and file count @smoke', async ({ api, datasetPage }) => {
    const publisher = await api.getOrganization(SAMPLE_ORGANIZATION);
    const dataset = await api.firstDatasetOf(publisher.id);

    await datasetPage.goto(dataset.slug);

    await expect(datasetPage.title).toHaveText(dataset.title);
    await expect(datasetPage.organizationLink).toContainText(publisher.name);
    expect(await datasetPage.resourceCount()).toBe(dataset.resources.length);
  });

  test('TC-D02 publisher link opens the right organization', async ({ api, datasetPage, organizationPage, page }) => {
    const publisher = await api.getOrganization(SAMPLE_ORGANIZATION);
    const dataset = await api.firstDatasetOf(publisher.id);

    await datasetPage.goto(dataset.slug);
    await datasetPage.organizationLink.click();

    await expect(page).toHaveURL(/\/organizations\//);
    expect(organizationPage.slugFromUrl()).toBe(publisher.slug);
    await expect(organizationPage.name).toHaveText(publisher.name);
  });

  test('TC-D03 search, open dataset, open publisher', async ({ searchPage, datasetPage, organizationPage, page }) => {
    await searchPage.goto('Шабац');
    await searchPage.openResult(0);
    await expect(datasetPage.title).not.toBeEmpty();
    const publisher = (await datasetPage.organizationLink.innerText()).trim();

    await datasetPage.organizationLink.click();

    await expect(page).toHaveURL(/\/organizations\//);
    await expect(organizationPage.name).toHaveText(publisher);
  });

  test('TC-D04 unknown dataset returns 404', async ({ page }) => {
    const response = await page.goto('/sr/datasets/ovaj-skup-podataka-ne-postoji/');
    expect(response?.status()).toBe(404);
  });
});
