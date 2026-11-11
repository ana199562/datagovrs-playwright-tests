import { test, expect } from '../../src/fixtures';
import type { Dataset } from '../../src/api/types';

// Sample of the 20 newest datasets. expect.soft lists every problem instead of stopping at the first.
test.describe('Data quality', () => {
  let sample: Dataset[];

  test.beforeAll(async ({ request }) => {
    const response = await request.get('/api/1/datasets/', { params: { page_size: 20, sort: '-created' } });
    expect(response.ok()).toBe(true);
    sample = (await response.json()).data;
  });

  test('TC-Q01 datasets have a publisher', () => {
    for (const d of sample) {
      expect.soft(d.organization ?? d.owner, `${d.slug}: publisher`).toBeTruthy();
    }
  });

  test('TC-Q01 datasets have a license', () => {
    for (const d of sample) {
      expect.soft(d.license, `${d.slug}: license`).toBeTruthy();
    }
  });

  test('TC-Q02 datasets have at least one file', () => {
    for (const d of sample) {
      expect.soft(d.resources.length, `${d.slug}: files`).toBeGreaterThan(0);
    }
  });

  test('TC-Q02 files have a format and a valid link', () => {
    for (const d of sample) {
      for (const r of d.resources) {
        expect.soft(r.format, `${d.slug} / ${r.title}: format`).toBeTruthy();
        expect.soft(r.url, `${d.slug} / ${r.title}: url`).toMatch(/^https?:\/\//);
      }
    }
  });

  test('TC-Q03 dataset files can be downloaded', async ({ request }) => {
    // One dataset, headers only (HEAD), so no files are actually downloaded.
    const dataset = sample.find((d) => d.resources.length > 0)!;
    for (const file of dataset.resources.slice(0, 3)) {
      const response = await request.head(file.url, { maxRedirects: 5, failOnStatusCode: false });
      expect.soft(response.status(), file.url).toBeLessThan(400);
    }
  });
});
