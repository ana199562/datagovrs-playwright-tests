import { test, expect } from '../../src/fixtures';

test.describe('Portal API', () => {
  test('TC-API11 site statistics match real totals', async ({ api }) => {
    const [site, datasets, organizations] = await Promise.all([
      api.getSite(),
      api.listDatasets({ pageSize: 0 }),
      api.listOrganizations(1),
    ]);

    expect(site.metrics.datasets).toBe(datasets.total);
    expect(site.metrics.organizations).toBe(organizations.total);
  });

  test('TC-API12 organization statistics match its datasets', async ({ api }) => {
    const { data } = await api.listDatasets({ pageSize: 1 });
    const organization = await api.getOrganization(data[0].organization!.slug);
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
