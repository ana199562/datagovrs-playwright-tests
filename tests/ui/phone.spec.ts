import { test, expect } from '../../src/fixtures';

// Same size as a Pixel 7
test.use({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });

test.describe('Phone screen', () => {
  test('TC-M01 filters open from the filter icon', async ({ searchPage, api }) => {
    await searchPage.goto('буџет');
    await expect(searchPage.formatFilter).not.toBeInViewport();

    await searchPage.filterIcon.click();

    await expect(searchPage.formatFilter).toBeInViewport();
    await searchPage.chooseFilter(searchPage.formatFilter, 'csv');
    const fromApi = await api.searchDatasetsV2({ q: 'буџет', format: 'csv', pageSize: 1 });
    await expect.poll(() => searchPage.total()).toBe(fromApi.total);
  });
});
