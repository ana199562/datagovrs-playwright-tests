# Findings

Issues found on [data.gov.rs](https://data.gov.rs) on 11 Nov 2026. Numbers are from that day.
Everything was found through normal, read-only use of the public website and API.

| ID | Issue | Severity | Test case |
|---|---|---|---|
| [DGR-01](#dgr-01) | Search does not match across Cyrillic and Latin script | High | TC-S09 |
| [DGR-02](#dgr-02) | Search ignores dataset tags | Medium | TC-S10 |
| [DGR-03](#dgr-03) | API v1 and v2 return different search results | Medium | TC-API10 |
| [DGR-04](#dgr-04) | Latin version declares the Slovenian language | Medium | TC-L04 |
| [DGR-05](#dgr-05) | Latin version has a Cyrillic site name in the page title | Low | TC-L05 |
| [DGR-06](#dgr-06) | Page title is not the `<h1>`, extra `<h1>` in the footer | Low | TC-A01, TC-A02 |
| [DGR-07](#dgr-07) | Validation errors contain internal Python error text | Low | TC-API08 |

<a id="dgr-01"></a>
## DGR-01 Search does not match across Cyrillic and Latin script

**Severity:** High

98.6% of dataset titles are in Cyrillic (3,483 of 3,531). A search typed in Latin script, which is
how most people type online, misses almost all of them. This happens on the Latin version of the
site as well.

**Steps**
1. Open https://data.gov.rs/sr/datasets/?q=буџет: 166 results.
2. Open https://data.gov.rs/sl/datasets/?q=budžet: 0 results.
3. Open https://data.gov.rs/sl/datasets/?q=budzet: 0 results.

**Expected:** Each spelling of a word finds the same datasets.

| Word | Cyrillic | Latin | Without diacritics |
|---|---|---|---|
| budget | буџет: 166 | budžet: 0 | budzet: 0 |
| Šabac | Шабац: 1,670 | Šabac: 8 | Sabac: 8 |
| air | ваздух: 1,563 | vazduh: 5 | vazduh: 5 |

Diacritics work correctly: `Šabac` and `Sabac` give the same results.

**Suggestion:** Index a transliterated copy of titles and descriptions, or transliterate the
query before searching. Serbian Cyrillic to Latin is a fixed one-to-one mapping.

<a id="dgr-02"></a>
## DGR-02 Search ignores dataset tags

**Severity:** Medium

Publishers tag Cyrillic datasets with Latin words (e.g. the Pirot city budget has `budzet`,
`budget`, `javne-finansije`). If search included tags, it would partly work around DGR-01.

**Steps**
1. Open https://data.gov.rs/api/2/datasets/search/?tag=budzet&page_size=1: `total` is 162.
2. Open https://data.gov.rs/api/2/datasets/search/?q=budzet&page_size=1: `total` is 0.

**Expected:** Searching for `budzet` finds the datasets tagged `budzet`.

<a id="dgr-03"></a>
## DGR-03 API v1 and v2 return different search results

**Severity:** Medium

The website uses API v2. Anyone using the v1 endpoint gets different results.

**Steps**
1. Open https://data.gov.rs/api/1/datasets/?q=ваздух&page_size=1: `total` is 1.
2. Open https://data.gov.rs/api/2/datasets/search/?q=ваздух&page_size=1: `total` is 1,563.

Also `Београд` (1 vs 20) and `IKEA` (0 vs 2). Filtering by tag or organization gives equal totals;
only text search differs.

**Expected:** Same results in both versions, or v1 search marked as deprecated.

<a id="dgr-04"></a>
## DGR-04 Latin version declares the Slovenian language

**Severity:** Medium

The Latin version uses `<html lang="sl">`. `sl` is the code for Slovenian. Serbian in Latin script
is `sr-Latn`.

Screen readers pick their voice and pronunciation from this attribute (WCAG 3.1.1), and search
engines and translation tools treat the pages as Slovenian.

**Steps:** Open https://data.gov.rs/sl/datasets/, right-click, Inspect, and check `<html lang>`.

**Expected:** `lang="sr-Latn"`. The `/sl/` URLs can stay if changing them is costly.

<a id="dgr-05"></a>
## DGR-05 Latin version has a Cyrillic site name in the page title

**Severity:** Low

On https://data.gov.rs/sl/datasets/ the tab title is `Skupovi podataka - Портал отворених података`.

**Expected:** `Skupovi podataka - Portal otvorenih podataka`.

<a id="dgr-06"></a>
## DGR-06 Page title is not the `<h1>`, extra `<h1>` in the footer

**Severity:** Low

Screen-reader users often jump to the `<h1>` to find out what a page is.

- Every page has an `<h1>` in a footer banner ("Укључите се у свет отворених података").
- On the dataset search page the title "Скупови података" is an `<h3>`, so the footer banner is
  the only `<h1>`.
- Dataset pages have two `<h1>`s: the dataset title and the footer banner.

**Expected:** One `<h1>` per page, naming the page.

<a id="dgr-07"></a>
## DGR-07 Validation errors contain internal Python error text

**Severity:** Low

**Steps:** Open https://data.gov.rs/api/1/datasets/?page_size=abc

The response is a correct 400, but the message is a raw Python error:
`The page size invalid literal for int() with base 10: 'abc'`

**Expected:** A plain message such as `page_size must be a positive whole number`.

---

## Checked and ruled out

Before reporting, every issue was checked a second way. These looked like bugs at first but weren't:

- **Cyrillic search returning nothing at all.** My Windows terminal was garbling the Cyrillic
  letters before sending them. With proper encoding, Cyrillic search works.
- **Five empty headings on dataset pages.** They have text; they're inside a collapsed panel, and
  the method I first used returns empty text for hidden elements.

## Other observations

- Dataset URLs spell `џ` two ways: `budzet-grada-pirota-za-2026-godinu` and
  `budzhet-grada-pirota-za-2022-godinu`, both from the same city.
- A page number past the end (`?page=99999`) returns 404 instead of an empty list. Unusual, but
  consistent, so the tests treat it as the expected behaviour.
