# Manual test cases

Every automated test in this project comes from one of the test cases below. The test case ID is
part of the automated test name, so you can run a single case with:

```bash
npx playwright test -g "TC-S05"
```

All cases can be run by hand with just a web browser. For API cases, open the URL in Firefox
(it formats JSON nicely) or Chrome. No account is needed.

**Result** is from the automated run on 11 Nov 2026. "Fails (DGR-xx)" means the case finds a
known issue, described in [findings.md](findings.md).

## Summary

| ID | Title | Priority | Result |
|---|---|---|---|
| [TC-S01](#tc-s01) | Cyrillic search returns relevant datasets | High | Pass |
| [TC-S02](#tc-s02) | Search is not case-sensitive | Medium | Pass |
| [TC-S03](#tc-s03) | Search ignores diacritics | Medium | Pass |
| [TC-S04](#tc-s04) | Search with no matches | Medium | Pass |
| [TC-S05](#tc-s05) | Result count on the page matches the API | High | Pass |
| [TC-S06](#tc-s06) | Result order on the page matches the API | Medium | Pass |
| [TC-S07](#tc-s07) | New search from the search box | High | Pass |
| [TC-S08](#tc-s08) | Opening a search result | High | Pass |
| [TC-S09](#tc-s09) | Same word in Cyrillic and Latin finds the same datasets | High | Fails (DGR-01) |
| [TC-S10](#tc-s10) | Searching for a tag finds tagged datasets | Medium | Fails (DGR-02) |
| [TC-S11](#tc-s11) | Filtering by file format | Medium | Pass |
| [TC-S12](#tc-s12) | Filtering by publisher | Medium | Pass |
| [TC-D01](#tc-d01) | Dataset page shows correct title, publisher and file count | High | Pass |
| [TC-D02](#tc-d02) | Publisher link opens the right organization | Medium | Pass |
| [TC-D03](#tc-d03) | Search, open dataset, open publisher | High | Pass |
| [TC-D04](#tc-d04) | Unknown dataset returns 404 | Low | Pass |
| [TC-L01](#tc-l01) | Switching to Latin keeps the page and search | High | Pass |
| [TC-L02](#tc-l02) | Switching back to Cyrillic | Medium | Pass |
| [TC-L03](#tc-l03) | Cyrillic pages declare Serbian | Medium | Pass |
| [TC-L04](#tc-l04) | Latin pages declare Serbian in Latin script | Medium | Fails (DGR-04) |
| [TC-L05](#tc-l05) | Latin page title is fully in Latin | Low | Fails (DGR-05) |
| [TC-A01](#tc-a01) | Dataset page has one `<h1>` | Low | Fails (DGR-06) |
| [TC-A02](#tc-a02) | Search page title is the `<h1>` | Low | Fails (DGR-06) |
| [TC-API01](#tc-api01) | Dataset list returns paging information | High | Pass |
| [TC-API02](#tc-api02) | Next page link works without duplicates | Medium | Pass |
| [TC-API03](#tc-api03) | `page_size=0` returns only the total | Low | Pass |
| [TC-API04](#tc-api04) | Dataset by slug equals dataset by ID | Medium | Pass |
| [TC-API05](#tc-api05) | Unknown dataset and organization return 404 | Medium | Pass |
| [TC-API06](#tc-api06) | Page past the last one returns 404 | Low | Pass |
| [TC-API07](#tc-api07) | Invalid `page_size` returns 400 | Medium | Pass |
| [TC-API08](#tc-api08) | Error messages do not show internal details | Low | Fails (DGR-07) |
| [TC-API09](#tc-api09) | API v1 and v2 agree on filters | Medium | Pass |
| [TC-API10](#tc-api10) | API v1 and v2 agree on text search | Medium | Fails (DGR-03) |
| [TC-API11](#tc-api11) | Site statistics match real totals | Medium | Pass |
| [TC-API12](#tc-api12) | Organization statistics match its datasets | Low | Pass |
| [TC-API13](#tc-api13) | API documentation is published | Low | Pass |
| [TC-Q01](#tc-q01) | Datasets have a publisher and a license | Medium | Pass |
| [TC-Q02](#tc-q02) | Datasets have files with a format and a valid link | Medium | Pass |
| [TC-Q03](#tc-q03) | Dataset files can be downloaded | Medium | Pass |

The unit tests in `tests/unit` check the project's own transliteration helper, so they have no
manual equivalent.

---

## Search

<a id="tc-s01"></a>
### TC-S01 Cyrillic search returns relevant datasets
Automated: `tests/api/search.spec.ts`

1. Open https://data.gov.rs/sr/datasets/?q=буџет

**Expected:** Results are shown. Most of the first ten titles or descriptions contain "буџет".

<a id="tc-s02"></a>
### TC-S02 Search is not case-sensitive
Automated: `tests/api/search.spec.ts`

1. Search for `буџет` and note the number of results ("N сетова укупно").
2. Search for `БУЏЕТ`.

**Expected:** Both searches show the same number of results.

<a id="tc-s03"></a>
### TC-S03 Search ignores diacritics
Automated: `tests/api/search.spec.ts`

1. Search for `Šabac` and note the number of results.
2. Search for `Sabac`.

**Expected:** Same number of results.

<a id="tc-s04"></a>
### TC-S04 Search with no matches
Automated: `tests/ui/search.spec.ts`, `tests/api/search.spec.ts`

1. Search for `qxzv-nepostojeci-pojam`.

**Expected:** "0 сетова укупно", no result cards, no error page.

<a id="tc-s05"></a>
### TC-S05 Result count on the page matches the API
Automated: `tests/ui/search.spec.ts`

1. Open https://data.gov.rs/sr/datasets/?q=буџет and note the number of results.
2. Open https://data.gov.rs/api/2/datasets/search/?q=буџет&page_size=1 and find `total`.

**Expected:** The two numbers are equal.

<a id="tc-s06"></a>
### TC-S06 Result order on the page matches the API
Automated: `tests/ui/search.spec.ts`

1. Open https://data.gov.rs/sr/datasets/?q=Пирот and note the first five titles.
2. Open https://data.gov.rs/api/2/datasets/search/?q=Пирот&sort=-last_update&page_size=5

**Expected:** The `title` values in the API response are the same five, in the same order.

<a id="tc-s07"></a>
### TC-S07 New search from the search box
Automated: `tests/ui/search.spec.ts`

1. Open https://data.gov.rs/sr/datasets/?q=буџет
2. Clear the search box, type `Шабац`, press Enter.

**Expected:** The address bar contains `q=Шабац`, the box shows `Шабац`, the result count changes.

<a id="tc-s08"></a>
### TC-S08 Opening a search result
Automated: `tests/ui/search.spec.ts`

1. Search for `буџет`.
2. Click the first result.

**Expected:** The dataset page opens and shows the title of the clicked result.

<a id="tc-s09"></a>
### TC-S09 Same word in Cyrillic and Latin finds the same datasets
Automated: `tests/api/search.spec.ts`, `tests/ui/search.spec.ts` · Finding: [DGR-01](findings.md#dgr-01)

Test data:

| Cyrillic | Latin | Latin without diacritics |
|---|---|---|
| буџет | budžet | budzet |
| Шабац | Šabac | Sabac |
| ваздух | vazduh | vazduh |

1. On https://data.gov.rs/sr/datasets/ search for each word in the Cyrillic column and note the count.
2. Switch to "Srpski - lat" and search for the Latin and the no-diacritics spellings.

**Expected:** All spellings of a word give the same count.

<a id="tc-s10"></a>
### TC-S10 Searching for a tag finds tagged datasets
Automated: `tests/api/search.spec.ts` · Finding: [DGR-02](findings.md#dgr-02)

1. Open https://data.gov.rs/api/2/datasets/search/?tag=budzet&page_size=1 and note `total`.
2. Open https://data.gov.rs/api/2/datasets/search/?q=budzet&page_size=1

**Expected:** The search in step 2 returns at least as many datasets as step 1.

<a id="tc-s11"></a>
### TC-S11 Filtering by file format
Automated: `tests/ui/search.spec.ts`

1. Open https://data.gov.rs/sr/datasets/?q=буџет
2. In the format filter ("Претрага формата..."), type `csv` and choose **csv**.
3. Open https://data.gov.rs/api/2/datasets/search/?q=буџет&format=csv&page_size=1 and note `total`.
4. Open the first three results.

**Expected:** The address contains `format=csv`, the result count equals `total`, and each opened
dataset has at least one CSV file.

<a id="tc-s12"></a>
### TC-S12 Filtering by publisher
Automated: `tests/ui/search.spec.ts`

1. Open https://data.gov.rs/sr/datasets/?q=буџет and note the publisher of the first result.
2. In the organization filter ("Претрага организација..."), type the publisher's name and choose it.
3. Copy the `organization` value from the address and open
   https://data.gov.rs/api/2/datasets/search/?q=буџет&organization=<value>&page_size=1

**Expected:** The result count equals `total`, and the first results are all from that publisher.

## Dataset page

<a id="tc-d01"></a>
### TC-D01 Dataset page shows correct title, publisher and file count
Automated: `tests/ui/dataset.spec.ts`

1. Open https://data.gov.rs/api/1/datasets/budzet-grada-pirota-za-2026-godinu/ and note `title`,
   `organization.name` and how many items are in `resources`.
2. Open https://data.gov.rs/sr/datasets/budzet-grada-pirota-za-2026-godinu/

**Expected:** The page shows the same title and publisher, and "Ресурси" shows the same number.

<a id="tc-d02"></a>
### TC-D02 Publisher link opens the right organization
Automated: `tests/ui/dataset.spec.ts`

1. Open any dataset page, e.g. the one from TC-D01.
2. Click the publisher name (Град Пирот).

**Expected:** The organization page opens with the same name.

<a id="tc-d03"></a>
### TC-D03 Search, open dataset, open publisher
Automated: `tests/ui/dataset.spec.ts`

1. Search for `Шабац`.
2. Open the first result and note the publisher.
3. Click the publisher.

**Expected:** Each page opens, and the organization page shows the publisher from step 2.

<a id="tc-d04"></a>
### TC-D04 Unknown dataset returns 404
Automated: `tests/ui/dataset.spec.ts`

1. Open https://data.gov.rs/sr/datasets/ovaj-skup-podataka-ne-postoji/

**Expected:** A "not found" page (HTTP 404).

## Cyrillic and Latin versions

<a id="tc-l01"></a>
### TC-L01 Switching to Latin keeps the page and search
Automated: `tests/ui/language.spec.ts`

1. Open https://data.gov.rs/sr/datasets/?q=буџет
2. In the header, change the language from "Српски - ћир" to "Srpski - lat".

**Expected:** Still on the dataset search with `q=буџет`; the title is "Skupovi podataka".

<a id="tc-l02"></a>
### TC-L02 Switching back to Cyrillic
Automated: `tests/ui/language.spec.ts`

1. Open https://data.gov.rs/sl/datasets/?q=буџет
2. Change the language to "Српски - ћир".

**Expected:** The title is "Скупови података".

<a id="tc-l03"></a>
### TC-L03 Cyrillic pages declare Serbian
Automated: `tests/ui/language.spec.ts`

1. Open https://data.gov.rs/sr/datasets/
2. Right-click the page, choose "Inspect" and look at the first line, `<html lang="...">`.

**Expected:** `lang="sr"` (or `sr-Cyrl`).

<a id="tc-l04"></a>
### TC-L04 Latin pages declare Serbian in Latin script
Automated: `tests/ui/language.spec.ts` · Finding: [DGR-04](findings.md#dgr-04)

1. Open https://data.gov.rs/sl/datasets/ and inspect `<html lang="...">` as in TC-L03.

**Expected:** `lang="sr-Latn"`.

<a id="tc-l05"></a>
### TC-L05 Latin page title is fully in Latin
Automated: `tests/ui/language.spec.ts` · Finding: [DGR-05](findings.md#dgr-05)

1. Open https://data.gov.rs/sl/datasets/ and read the browser tab title.

**Expected:** No Cyrillic letters in the title.

## Accessibility

<a id="tc-a01"></a>
### TC-A01 Dataset page has one `<h1>`
Automated: `tests/ui/accessibility.spec.ts` · Finding: [DGR-06](findings.md#dgr-06)

1. Open https://data.gov.rs/sr/datasets/budzet-grada-pirota-za-2026-godinu/
2. Open the browser console (F12) and run `[...document.querySelectorAll('h1')].map(h => h.innerText)`

**Expected:** One item: the dataset title.

<a id="tc-a02"></a>
### TC-A02 Search page title is the `<h1>`
Automated: `tests/ui/accessibility.spec.ts` · Finding: [DGR-06](findings.md#dgr-06)

1. Open https://data.gov.rs/sr/datasets/?q=буџет and run the console command from TC-A01.

**Expected:** One item: "Скупови података".

## API

<a id="tc-api01"></a>
### TC-API01 Dataset list returns paging information
Automated: `tests/api/datasets.spec.ts`

1. Open https://data.gov.rs/api/1/datasets/?page_size=5

**Expected:** `page` is 1, `page_size` is 5, `data` has 5 items, `previous_page` is null,
`next_page` contains `page=2`.

<a id="tc-api02"></a>
### TC-API02 Next page link works without duplicates
Automated: `tests/api/datasets.spec.ts`

1. Open https://data.gov.rs/api/1/datasets/?page_size=10 and note the `id` values.
2. Open the URL in `next_page`.

**Expected:** `page` is 2, `total` is unchanged, none of the IDs from step 1 appear again.

<a id="tc-api03"></a>
### TC-API03 `page_size=0` returns only the total
Automated: `tests/api/datasets.spec.ts`

1. Open https://data.gov.rs/api/1/datasets/?page_size=0

**Expected:** `data` is empty, `total` is greater than 0.

<a id="tc-api04"></a>
### TC-API04 Dataset by slug equals dataset by ID
Automated: `tests/api/datasets.spec.ts`

1. Open https://data.gov.rs/api/1/datasets/budzet-grada-pirota-za-2026-godinu/ and copy `id`.
2. Open `https://data.gov.rs/api/1/datasets/<id>/`

**Expected:** Both responses are identical.

<a id="tc-api05"></a>
### TC-API05 Unknown dataset and organization return 404
Automated: `tests/api/datasets.spec.ts`, `tests/api/portal.spec.ts`

1. Open https://data.gov.rs/api/1/datasets/ovaj-skup-podataka-ne-postoji/
2. Open https://data.gov.rs/api/1/organizations/ova-organizacija-ne-postoji/

**Expected:** Both return 404 with a `message`.

<a id="tc-api06"></a>
### TC-API06 Page past the last one returns 404
Automated: `tests/api/datasets.spec.ts`

1. Open https://data.gov.rs/api/1/datasets/?page_size=100&page=99999

**Expected:** 404.

<a id="tc-api07"></a>
### TC-API07 Invalid `page_size` returns 400
Automated: `tests/api/datasets.spec.ts`

1. Open https://data.gov.rs/api/1/datasets/?page_size=abc

**Expected:** 400, and `errors` names the `page_size` field.

<a id="tc-api08"></a>
### TC-API08 Error messages do not show internal details
Automated: `tests/api/datasets.spec.ts` · Finding: [DGR-07](findings.md#dgr-07)

1. Open the URL from TC-API07 and read the error message.

**Expected:** A plain message, with no programming-language error text such as "int()" or "base 10".

<a id="tc-api09"></a>
### TC-API09 API v1 and v2 agree on filters
Automated: `tests/api/search.spec.ts`

1. Compare `total` in:
   - https://data.gov.rs/api/1/datasets/?tag=budzet&page_size=1
   - https://data.gov.rs/api/2/datasets/search/?tag=budzet&page_size=1
2. Repeat with `organization=<id>` instead of `tag=budzet`, using the `id` from
   https://data.gov.rs/api/1/organizations/grad-pirot/

**Expected:** Totals are equal in both comparisons.

<a id="tc-api10"></a>
### TC-API10 API v1 and v2 agree on text search
Automated: `tests/api/search.spec.ts` · Finding: [DGR-03](findings.md#dgr-03)

1. Compare `total` in:
   - https://data.gov.rs/api/1/datasets/?q=ваздух&page_size=1
   - https://data.gov.rs/api/2/datasets/search/?q=ваздух&page_size=1

**Expected:** Totals are equal.

<a id="tc-api11"></a>
### TC-API11 Site statistics match real totals
Automated: `tests/api/portal.spec.ts`

1. Open https://data.gov.rs/api/1/site/ and note `metrics.datasets` and `metrics.organizations`.
2. Open https://data.gov.rs/api/1/datasets/?page_size=0 and https://data.gov.rs/api/1/organizations/?page_size=1 and note each `total`.

**Expected:** The numbers match, or differ by less than 1%. The site statistics are recalculated
from time to time, so datasets published in the last few hours may not be counted yet.

<a id="tc-api12"></a>
### TC-API12 Organization statistics match its datasets
Automated: `tests/api/portal.spec.ts`

1. Open https://data.gov.rs/api/1/organizations/grad-pirot/ and note `id` and `metrics.datasets`.
2. Open `https://data.gov.rs/api/1/datasets/?organization=<id>&page_size=0`

**Expected:** `total` equals `metrics.datasets`.

<a id="tc-api13"></a>
### TC-API13 API documentation is published
Automated: `tests/api/portal.spec.ts`

1. Open https://data.gov.rs/api/1/swagger.json

**Expected:** Valid JSON with `"swagger": "2.0"`, listing `/datasets/`, `/organizations/` and `/site/`.

## Data quality

Checked on the 20 newest datasets: https://data.gov.rs/api/1/datasets/?page_size=20&sort=-created

<a id="tc-q01"></a>
### TC-Q01 Datasets have a publisher and a license
Automated: `tests/api/data-quality.spec.ts`

**Expected:** Each dataset has `organization` (or `owner`) and a `license`.

<a id="tc-q02"></a>
### TC-Q02 Datasets have files with a format and a valid link
Automated: `tests/api/data-quality.spec.ts`

**Expected:** Each dataset has at least one item in `resources`; each has a `format` and a `url`
starting with `http://` or `https://`.

<a id="tc-q03"></a>
### TC-Q03 Dataset files can be downloaded
Automated: `tests/api/data-quality.spec.ts`

1. Take the first dataset in the list and open each `resources[].url`.

**Expected:** Each file downloads (no error page).
