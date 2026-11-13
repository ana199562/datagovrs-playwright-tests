import { test, expect } from '../../src/fixtures';
import { knownIssue } from '../../src/known-issues';
import { NO_MATCH_TERM, SAMPLE_ORGANIZATION } from '../../src/data/search-terms';

test.describe('Search page', () => {
  test('TC-S04 search with no matches shows zero results', async ({ searchPage }) => {
    await searchPage.goto(NO_MATCH_TERM);

    expect(await searchPage.total()).toBe(0);
    await expect(searchPage.results).toHaveCount(0);
  });

  test('TC-S05 result count matches the API @smoke', async ({ searchPage, api }) => {
    const fromApi = await api.searchDatasetsV2({ q: 'буџет', pageSize: 1 });

    await searchPage.goto('буџет');

    expect(await searchPage.total()).toBe(fromApi.total);
  });

  test('TC-S06 result order matches the API', async ({ searchPage, api }) => {
    // The site sorts by last update by default.
    const fromApi = await api.searchDatasetsV2({ q: 'Пирот', sort: '-last_update', pageSize: 5 });

    await searchPage.goto('Пирот');

    const slugs = await searchPage.resultSlugs();
    expect(slugs.slice(0, fromApi.data.length)).toEqual(fromApi.data.map((d) => d.slug));
  });

  test('TC-S07 new search from the search box', async ({ searchPage }) => {
    await searchPage.goto('буџет');
    const before = await searchPage.total();

    await searchPage.search('Шабац');

    await expect(searchPage.searchBox).toHaveValue('Шабац');
    await expect.poll(() => searchPage.total()).not.toBe(before);
  });

  test('TC-S08 opening a search result', async ({ searchPage, datasetPage, page }) => {
    await searchPage.goto('буџет');
    const [firstSlug] = await searchPage.resultSlugs();

    await searchPage.openResult(0);

    await expect(page).toHaveURL(new RegExp(`/datasets/${firstSlug}/?$`));
    await expect(datasetPage.title).not.toBeEmpty();
  });

  test('TC-S09 Latin search on the Latin site finds the same datasets @known-issue', async ({ searchPage }) => {
    knownIssue('DGR-01');

    await searchPage.goto('буџет', 'cyrillic');
    const cyrillicTotal = await searchPage.total();
    await searchPage.goto('budžet', 'latin');
    const latinTotal = await searchPage.total();

    test.info().annotations.push({ type: 'observed', description: `буџет: ${cyrillicTotal}, budžet: ${latinTotal}` });
    expect(cyrillicTotal).toBeGreaterThan(0);
    expect(latinTotal).toBe(cyrillicTotal);
  });

  test('TC-S11 filtering by file format', async ({ searchPage, api, page }) => {
    await searchPage.goto('буџет');

    await searchPage.chooseFilter(searchPage.formatFilter, 'csv');

    await expect(page).toHaveURL(/[?&]format=csv/);
    const fromApi = await api.searchDatasetsV2({ q: 'буџет', format: 'csv', sort: '-last_update', pageSize: 3 });
    expect(fromApi.total).toBeGreaterThan(0);
    await expect.poll(() => searchPage.total()).toBe(fromApi.total);
    // The result cards update a moment after the count
    const slugs = fromApi.data.map((d) => d.slug);
    await expect.poll(async () => (await searchPage.resultSlugs()).slice(0, 3)).toEqual(slugs);

    // Check these results really have a CSV file
    for (const slug of slugs) {
      const dataset = await api.getDataset(slug);
      expect(dataset.resources.map((r) => r.format.toLowerCase()), slug).toContain('csv');
    }
  });

  test('TC-S12 filtering by publisher', async ({ searchPage, api, page }) => {
    const publisher = await api.getOrganization(SAMPLE_ORGANIZATION);

    await searchPage.goto('буџет');
    await searchPage.chooseFilter(searchPage.organizationFilter, publisher.name);

    expect(new URL(page.url()).searchParams.get('organization')).toBe(publisher.id);
    const fromApi = await api.searchDatasetsV2({ q: 'буџет', organization: publisher.id, sort: '-last_update', pageSize: 3 });
    await expect.poll(() => searchPage.total()).toBe(fromApi.total);
    // The result cards update a moment after the count
    const slugs = fromApi.data.map((d) => d.slug);
    await expect.poll(async () => (await searchPage.resultSlugs()).slice(0, 3)).toEqual(slugs);

    for (const slug of slugs) {
      const dataset = await api.getDataset(slug);
      expect(dataset.organization?.id, slug).toBe(publisher.id);
    }
  });
});
