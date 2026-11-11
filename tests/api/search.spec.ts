import { test, expect } from '../../src/fixtures';
import { knownIssue } from '../../src/known-issues';
import { CROSS_SCRIPT_TERMS, NO_MATCH_TERM, TAGGED_TERM } from '../../src/data/search-terms';
import { spellingVariants } from '../../src/utils/serbian';

test.describe('Search API', () => {
  test('TC-S01 Cyrillic search returns relevant datasets @smoke', async ({ api }) => {
    const result = await api.searchDatasetsV2({ q: 'буџет', pageSize: 10 });

    expect(result.total).toBeGreaterThan(0);
    const relevant = result.data.filter((d) => `${d.title} ${d.description}`.toLowerCase().includes('буџет'));
    expect(relevant.length).toBeGreaterThanOrEqual(Math.ceil(result.data.length / 2));
  });

  test('TC-S02 search is not case-sensitive', async ({ api }) => {
    const lower = await api.searchDatasetsV2({ q: 'буџет', pageSize: 1 });
    const upper = await api.searchDatasetsV2({ q: 'БУЏЕТ', pageSize: 1 });

    expect(upper.total).toBe(lower.total);
  });

  test('TC-S03 search ignores diacritics', async ({ api }) => {
    const withDiacritics = await api.searchDatasetsV2({ q: 'Šabac', pageSize: 1 });
    const without = await api.searchDatasetsV2({ q: 'Sabac', pageSize: 1 });

    expect(without.total).toBe(withDiacritics.total);
  });

  test('TC-S04 search with no matches returns an empty list', async ({ api }) => {
    const result = await api.searchDatasetsV2({ q: NO_MATCH_TERM });

    expect(result.total).toBe(0);
    expect(result.data).toEqual([]);
  });

  for (const word of CROSS_SCRIPT_TERMS) {
    const { cyrillic, latin, ascii } = spellingVariants(word);
    const spellings = [...new Set([cyrillic, latin, ascii])].join(' / ');

    test(`TC-S09 same results for ${spellings} @known-issue`, async ({ api }) => {
      knownIssue('DGR-01');

      const [c, l, a] = await Promise.all(
        [cyrillic, latin, ascii].map((q) => api.searchDatasetsV2({ q, pageSize: 1 })),
      );
      test.info().annotations.push({
        type: 'observed',
        description: `${cyrillic}: ${c.total}, ${latin}: ${l.total}, ${ascii}: ${a.total}`,
      });

      expect(c.total).toBeGreaterThan(0);
      expect(l.total, latin).toBe(c.total);
      expect(a.total, ascii).toBe(c.total);
    });
  }

  test('TC-S10 searching for a tag finds tagged datasets @known-issue', async ({ api }) => {
    knownIssue('DGR-02');

    const tagged = await api.searchDatasetsV2({ tag: TAGGED_TERM, pageSize: 1 });
    expect(tagged.total).toBeGreaterThan(0);

    const searched = await api.searchDatasetsV2({ q: TAGGED_TERM, pageSize: 1 });
    expect(searched.total).toBeGreaterThanOrEqual(tagged.total);
  });

  test('TC-API09 v1 and v2 agree on tag filter', async ({ api }) => {
    const [v1, v2] = await Promise.all([
      api.listDatasets({ tag: TAGGED_TERM, pageSize: 1 }),
      api.searchDatasetsV2({ tag: TAGGED_TERM, pageSize: 1 }),
    ]);
    expect(v1.total).toBe(v2.total);
  });

  test('TC-API09 v1 and v2 agree on organization filter', async ({ api }) => {
    const { data } = await api.listDatasets({ pageSize: 1 });
    const organization = data[0].organization!.id;

    const [v1, v2] = await Promise.all([
      api.listDatasets({ organization, pageSize: 1 }),
      api.searchDatasetsV2({ organization, pageSize: 1 }),
    ]);
    expect(v1.total).toBe(v2.total);
  });

  test('TC-API10 v1 and v2 agree on text search @known-issue', async ({ api }) => {
    knownIssue('DGR-03');

    const [v1, v2] = await Promise.all([
      api.listDatasets({ q: 'ваздух', pageSize: 1 }),
      api.searchDatasetsV2({ q: 'ваздух', pageSize: 1 }),
    ]);
    test.info().annotations.push({ type: 'observed', description: `v1: ${v1.total}, v2: ${v2.total}` });
    expect(v1.total).toBe(v2.total);
  });
});
