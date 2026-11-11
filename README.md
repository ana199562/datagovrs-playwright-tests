# data.gov.rs tests

Manual and automated tests for [data.gov.rs](https://data.gov.rs), the Serbian national open data
portal. Automated with Playwright and TypeScript.

- [Manual test cases](docs/test-cases.md): 39 cases, each covered by automated tests
- [Findings](docs/findings.md): 9 issues found on the site, with steps to reproduce

The main finding: 98.6% of datasets have Cyrillic titles, and search doesn't match across scripts.
`буџет` finds 166 datasets. `budžet` and `budzet` find none.

## What's tested

| Area | Test cases |
|---|---|
| Search | TC-S01 to TC-S10 |
| Dataset page | TC-D01 to TC-D04 |
| Cyrillic and Latin versions | TC-L01 to TC-L05 |
| Accessibility (WCAG 2.1 AA) | TC-A01 to TC-A04 |
| API | TC-API01 to TC-API13 |
| Data quality | TC-Q01 to TC-Q03 |

60 automated tests: 21 in the browser, 28 against the API, and 11 unit tests for a helper.

Since this is a live government site, the tests only read data, run at most two at a time, and
check small samples.

## Running the tests

You need a computer with Windows, macOS or Linux and an internet connection. It takes about
10 minutes the first time.

**1. Install Node.js**

Download the LTS version from https://nodejs.org and install it with the default options.

**2. Get the project**

On this project's GitHub page, click **Code**, then **Download ZIP**, and unzip it.
(If you use Git: `git clone` the repository instead.)

**3. Open a terminal in the project folder**

- Windows: open the unzipped folder, right-click inside it and choose **Open in Terminal**.
- macOS: right-click the folder in Finder, then **Services** > **New Terminal at Folder**.

**4. Install the project** (once)

```bash
npm install
```
```bash
npx playwright install chromium
```

The second command downloads the browser the tests use.

**5. Run the tests**

```bash
npm test
```

This takes about a minute. At the end you should see `60 passed`.

**6. Open the report**

```bash
npm run report
```

The report opens in your browser. Click any test to see its steps, and for browser tests, screenshots.

### Other commands

| Command | What it does |
|---|---|
| `npm run test:headed` | Runs the browser tests in a visible browser window |
| `npm run test:api` | Runs only the API tests (a few seconds) |
| `npm run test:known-issues` | Runs only the tests for the 12 known issues |
| `npx playwright test -g "TC-S09"` | Runs one test case |

## Reading the results

12 tests check behaviour the site should have but doesn't yet (marked `@known-issue`). They are
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

- The site's theme script breaks axe-core, the usual accessibility testing tool
  ([DGR-08](docs/findings.md#dgr-08)). `src/utils/accessibility.ts` works around it in the test
  browser only.
- The site has no test IDs in its HTML, so the tests find elements by role, label and visible text,
  the way a user would.
- Tests don't hardcode numbers from the live site. They compare the page with the API, or one
  spelling with another, so they keep working as the data changes.
- GitHub Actions runs the tests on every push and once a week.
