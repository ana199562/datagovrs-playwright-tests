import { test, expect } from '../../src/fixtures';
import { SAMPLE_ORGANIZATION } from '../../src/data/search-terms';

// The site statistics are recalculated from time to time, not on every change,
// so they can be a few datasets behind right after new ones are published.
const ALLOWED_LAG = 0.01;

test.describe('Portal API', () => {
  test('TC-API11 site statistics match real totals', async ({ api }) => {
    const [site, datasets, organizations] = await Promise.all([
      api.getSite(),
      api.listDatasets({ pageSize: 0 }),
      api.listOrganizations(1),
    ]);

    test.info().annotations.push({
      type: 'observed',
      description: `datasets: ${site.metrics.datasets} vs ${datasets.total}, organizations: ${site.metrics.organizations} vs ${organizations.total}`,
    });
    expect(Math.abs(site.metrics.datasets - datasets.total)).toBeLessThanOrEqual(datasets.total * ALLOWED_LAG);
    expect(Math.abs(site.metrics.organizations - organizations.total)).toBeLessThanOrEqual(organizations.total * ALLOWED_LAG);
  });

  test('TC-API12 organization statistics match its datasets', async ({ api }) => {
    const organization = await api.getOrganization(SAMPLE_ORGANIZATION);
    const itsDatasets = await api.listDatasets({ organization: organization.id, pageSize: 0 });

    expect(organization.metrics.datasets).toBe(itsDatasets.total);
  });

  test('TC-API05 unknown organization returns 404', async ({ api }) => {
    const response = await api.getOrganizationRaw('ova-organizacija-ne-postoji');
    expect(response.status()).toBe(404);
  });

  test('TC-API13 API documentation is published @smoke', async ({ api }) => {
    const response = await api.swaggerRaw();

    expect(response.status()).toBe(200);
    const spec = await response.json();
    expect(spec.swagger).toBe('2.0');
    expect(Object.keys(spec.paths)).toEqual(
      expect.arrayContaining(['/datasets/', '/datasets/{dataset}/', '/organizations/', '/site/']),
    );
  });
});
