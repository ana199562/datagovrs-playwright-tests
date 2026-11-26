# data.gov.rs tests

[![Tests](https://github.com/ana199562/datagovrs-playwright-tests/actions/workflows/tests.yml/badge.svg)](https://github.com/ana199562/datagovrs-playwright-tests/actions/workflows/tests.yml)

Manual and automated tests for [data.gov.rs](https://data.gov.rs), the Serbian national open data
portal. Automated with Playwright and TypeScript.

- [Manual test cases](docs/test-cases.md): 40 cases, each covered by automated tests
- [Findings](docs/findings.md): 7 issues found on the site, with steps to reproduce
- [Latest test report](https://ana199562.github.io/datagovrs-playwright-tests/): updated weekly and on every change

The main finding: 98.6% of datasets have Cyrillic titles, and search doesn't match across scripts.
`буџет` finds 166 datasets. `budžet` and `budzet` find none.

## Overview

- 59 automated tests: 20 in the browser, 28 against the API, and 11 unit tests for a helper
- Page objects and fixtures for the website, and a small client for the REST API
- Tests check the website against the API, so they don't depend on numbers that change every day
- Known issues are marked as expected failures, so the run stays green until the site is fixed
- GitHub Actions runs type checks, lint and all tests on every push and once a week, and publishes the report

**Tools:** Playwright, TypeScript, Node.js, Biome, GitHub Actions, GitHub Pages

## What's tested

| Area | Test cases |
|---|---|
| Search | TC-S01 to TC-S12 |
| Dataset page | TC-D01 to TC-D04 |
| Cyrillic and Latin versions | TC-L01 to TC-L05 |
| Accessibility | TC-A01, TC-A02 |
| Phone screen | TC-M01 |
| API | TC-API01 to TC-API13 |
| Data quality | TC-Q01 to TC-Q03 |

Since this is a live government site, the tests only read data, run at most two at a time, and
check small samples.

## Running the tests

You need [Node.js](https://nodejs.org) (LTS version) and an internet connection.

```bash
git clone https://github.com/ana199562/datagovrs-playwright-tests.git
cd datagovrs-playwright-tests
npm install
npx playwright install chromium
npm test
```

The tests take about a minute. At the end you should see `59 passed`. To open the report:

```bash
npm run report
```

Click any test to see its steps, and for browser tests, screenshots.

### Other commands

| Command | What it does |
|---|---|
| `npm run test:headed` | Runs the browser tests in a visible browser window |
| `npm run test:api` | Runs only the API tests (a few seconds) |
| `npm run test:known-issues` | Runs only the tests for the 11 known issues |
| `npx playwright test -g "TC-S09"` | Runs one test case |
| `npm run typecheck` | Checks the TypeScript types |
| `npm run lint` | Checks the code with Biome |

## Reading the results

11 tests check behaviour the site should have but doesn't yet (marked `@known-issue`). They are
**expected to fail**, so a failure there counts as a pass and the run stays green. In the terminal
they show an `x` but are counted in "passed". In the report, each one shows what it actually found,
for example `буџет: 166, budžet: 0, budzet: 0`.

If the site fixes one of these issues, that test starts passing, and Playwright reports it as a
failure ("expected to fail, but passed"). That's the signal to check the fix and update the test.

## Project structure

```
docs/
  test-cases.md        manual test cases
  findings.md          issues found
src/
  api/                 API client
  pages/               page objects for the website
  utils/serbian.ts     Cyrillic to Latin conversion, used to build search terms
  known-issues.ts      list of known issues used by the tests
tests/
  api/  ui/  unit/
```

Each browser and API test name starts with its test case ID, e.g. `TC-S05 result count matches the API`.

## Notes

- The site has no test IDs in its HTML, so the tests find elements by role, label and visible text,
  the way a user would.
- Tests don't hardcode numbers from the live site. They compare the page with the API, or one
  spelling with another, so they keep working as the data changes.
