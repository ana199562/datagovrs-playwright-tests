import { test, expect } from '../../src/fixtures';

test.describe('Dataset page', () => {
  test('TC-D01 shows correct title, publisher and file count @smoke', async ({ api, datasetPage }) => {
    const { data } = await api.listDatasets({ q: 'буџет', pageSize: 1 });
    const dataset = await api.getDataset(data[0].slug);

    await datasetPage.goto(dataset.slug);

    await expect(datasetPage.title).toHaveText(dataset.title);
    await expect(datasetPage.organizationLink).toContainText(dataset.organization!.name);
    expect(await datasetPage.resourceCount()).toBe(dataset.resources.length);
  });

  test('TC-D02 publisher link opens the right organization', async ({ api, datasetPage, organizationPage, page }) => {
    const { data } = await api.listDatasets({ q: 'буџет', pageSize: 1 });
    const dataset = data[0];

    await datasetPage.goto(dataset.slug);
    await datasetPage.organizationLink.click();

    await expect(page).toHaveURL(/\/organizations\//);
    expect(organizationPage.slugFromUrl()).toBe(dataset.organization!.slug);
    await expect(organizationPage.name).toHaveText(dataset.organization!.name);
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
