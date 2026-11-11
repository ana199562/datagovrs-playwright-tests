import { test, expect } from '../../src/fixtures';
import { knownIssue } from '../../src/known-issues';
import type { Dataset } from '../../src/api/types';

test.describe('Datasets API', () => {
  test('TC-API01 dataset list returns paging information @smoke', async ({ api }) => {
    const response = await api.listDatasetsRaw({ pageSize: 5 });

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = await response.json();
    expect(body).toMatchObject({ page: 1, page_size: 5, total: expect.any(Number), previous_page: null });
    expect(body.data).toHaveLength(5);
    expect(body.next_page).toContain('page=2');
  });

  test('TC-API02 next page link works without duplicates', async ({ api }) => {
    const first = await api.listDatasets({ pageSize: 10 });
    const second = await api.getPage<Dataset>(first.next_page!);

    expect(second.page).toBe(2);
    expect(second.total).toBe(first.total);
    const firstIds = new Set(first.data.map((d) => d.id));
    expect(second.data.filter((d) => firstIds.has(d.id))).toEqual([]);
  });

  test('TC-API03 page_size=0 returns only the total', async ({ api }) => {
    const result = await api.listDatasets({ pageSize: 0 });

    expect(result.data).toEqual([]);
    expect(result.total).toBeGreaterThan(0);
  });

  test('TC-API04 dataset by slug equals dataset by ID', async ({ api }) => {
    const { data } = await api.listDatasets({ pageSize: 1 });
    const [bySlug, byId] = await Promise.all([api.getDataset(data[0].slug), api.getDataset(data[0].id)]);

    expect(byId).toEqual(bySlug);
  });

  test('TC-API05 unknown dataset returns 404', async ({ api }) => {
    const response = await api.getDatasetRaw('ovaj-skup-podataka-ne-postoji');

    expect(response.status()).toBe(404);
    expect(await response.json()).toHaveProperty('message');
  });

  test('TC-API06 page past the last one returns 404', async ({ api }) => {
    const { total } = await api.listDatasets({ pageSize: 0 });
    const response = await api.listDatasetsRaw({ pageSize: 100, page: Math.ceil(total / 100) + 10 });

    expect(response.status()).toBe(404);
  });

  test('TC-API07 invalid page_size returns 400', async ({ request }) => {
    const response = await request.get('/api/1/datasets/', { params: { page_size: 'abc' } });

    expect(response.status()).toBe(400);
    expect((await response.json()).errors).toHaveProperty('page_size');
  });

  test('TC-API08 error messages do not show internal details @known-issue', async ({ request }) => {
    knownIssue('DGR-07');

    const response = await request.get('/api/1/datasets/', { params: { page_size: 'abc' } });
    const body = JSON.stringify(await response.json());

    test.info().annotations.push({ type: 'observed', description: body.slice(0, 200) });
    expect(body).not.toMatch(/int\(\)|base 10|Traceback/);
  });
});
