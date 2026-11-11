import { test } from '@playwright/test';

// Details in docs/findings.md
export const KNOWN_ISSUES = {
  'DGR-01': 'Search does not match across Cyrillic and Latin script',
  'DGR-02': 'Search ignores dataset tags',
  'DGR-03': 'API v1 and v2 return different search results',
  'DGR-04': 'Latin version declares the Slovenian language (lang="sl")',
  'DGR-05': 'Latin version has a Cyrillic site name in the page title',
  'DGR-06': 'Page title is not the <h1>, extra <h1> in the footer',
  'DGR-07': 'Validation errors contain internal Python error text',
  'DGR-08': 'Theme script replaces the native Element.classList',
} as const;

/**
 * Marks a test as covering a known issue. The test checks the correct behaviour and is
 * expected to fail. If the site gets fixed, the test passes and Playwright reports it.
 */
export function knownIssue(id: keyof typeof KNOWN_ISSUES) {
  test.info().annotations.push({ type: 'known issue', description: `${id}: ${KNOWN_ISSUES[id]}` });
  test.fail();
}
