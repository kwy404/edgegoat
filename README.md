<p align="right"><strong>English</strong> | <a href="https://github.com/kwy404/edgegoat/blob/main/i18n/README.pt-BR.md">Português (Brasil)</a></p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/assets/banner-dark.svg">
    <img src="https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/assets/banner.svg" width="880" alt="edgegoat banner: Ledge the mountain goat standing on a cliff edge next to the tagline, edge case test inputs for JavaScript time zones, daylight saving time, unicode test strings and numbers">
  </picture>
</p>

<h1 align="center">edgegoat: edge case test inputs for JavaScript, time zones, DST, unicode and numbers</h1>

<p align="center"><strong>The inputs that break code, ready to drop into your tests.</strong></p>

<p align="center">
  <a href="https://www.npmjs.com/package/edgegoat"><img height="20" src="https://img.shields.io/npm/v/edgegoat.svg?color=2E9C8A" alt="edgegoat npm version"></a>
  <a href="https://www.npmjs.com/package/edgegoat"><img height="20" src="https://img.shields.io/npm/dm/edgegoat?color=2E9C8A" alt="edgegoat npm downloads per month"></a>
  <a href="https://www.npmjs.com/package/edgegoat"><img height="20" src="https://img.shields.io/npm/dt/edgegoat?color=2E9C8A" alt="edgegoat npm downloads in total"></a>
  <a href="https://bundlephobia.com/package/edgegoat"><img height="20" src="https://img.shields.io/bundlephobia/minzip/edgegoat?color=2E9C8A" alt="edgegoat bundle size, minified and gzipped"></a>
  <a href="https://github.com/kwy404/edgegoat/actions/workflows/ci.yml"><img height="20" src="https://github.com/kwy404/edgegoat/actions/workflows/ci.yml/badge.svg" alt="CI status: build, typecheck, lint and tests on Node 18, 20 and 22"></a>
  <a href="https://github.com/kwy404/edgegoat/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-2E9C8A.svg" alt="MIT license"></a>
  <a href="https://www.typescriptlang.org/"><img height="20" src="https://img.shields.io/badge/types-TypeScript-3178C6.svg" alt="TypeScript types included"></a>
</p>

Need to **test time zone code in JavaScript**, **test daylight saving time in Jest** or Vitest, or find **unicode test strings** and **JavaScript edge cases** like `-0`, `NaN` and `2^53 + 1`? edgegoat is a curated, documented library of <!-- total -->284<!-- /total --> inputs that are known to break code: real DST transitions computed for each zone, New Year in Pacific/Kiritimati, dates before 1970 with fractional seconds, surrogate pairs at a cut boundary, Turkish dotted i, Windows paths, deep JSON and sparse arrays. Every case comes with a label and a one line explanation of **why** it breaks code, so it drops straight into `test.each` in Vitest, Jest, node:test or Mocha. Zero dependencies, ESM and CommonJS, TypeScript types included.

```ts
import { test, expect } from 'vitest';
import { dates, withTimeZone } from 'edgegoat';

test.each(dates({ tags: ['dst'] }))('$label', ({ value, zone }) => {
  withTimeZone(zone, () => expect(addDays(value, 1).getHours()).toBe(value.getHours()));
});
```

<!-- grid:start -->
<table>
<tr>
<td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/assets/icons/dates.svg" width="40" height="40" alt="Calendar icon for date and daylight saving time edge cases"><br><strong>Dates</strong> <code>46 cases</code><br><sub>DST gaps and overlaps, New Year in 7 zones, leap days, before 1970, 2038, year 10000</sub></td>
<td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/assets/icons/time-zones.svg" width="40" height="40" alt="Globe icon for time zone test cases"><br><strong>Time zones</strong> <code>18 cases</code><br><sub>Curated IANA zones: +05:45, +14:00, -11:00, 30 minute DST, midnight DST</sub></td>
<td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/assets/icons/strings.svg" width="40" height="40" alt="Text icon for unicode test strings"><br><strong>Strings</strong> <code>49 cases</code><br><sub>Emoji, surrogate pairs, NFC vs NFD, bidi, invisible spaces, Turkish i, newlines</sub></td>
</tr>
<tr>
<td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/assets/icons/numbers.svg" width="40" height="40" alt="Hash icon for JavaScript number edge cases like negative zero and NaN"><br><strong>Numbers</strong> <code>51 cases</code><br><sub>-0, NaN, Infinity, safe integer limits, 0.1 + 0.2, 1e21, numeric strings and BigInt</sub></td>
<td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/assets/icons/urls.svg" width="40" height="40" alt="Link icon for URL and email edge cases"><br><strong>URLs and emails</strong> <code>54 cases</code><br><sub>WHATWG parser surprises, SSRF and open redirect shapes, RFC 5321 limits</sub></td>
<td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/assets/icons/paths.svg" width="40" height="40" alt="Folder icon for Windows and POSIX file path edge cases"><br><strong>Paths</strong> <code>30 cases</code><br><sub>Windows vs POSIX, UNC, reserved names, traversal, NFD file names</sub></td>
</tr>
<tr>
<td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/assets/icons/json.svg" width="40" height="40" alt="Curly braces icon for JSON parsing edge cases"><br><strong>JSON</strong> <code>22 cases</code><br><sub>10000 levels deep, duplicate keys, 2^53 + 1, __proto__, BOM</sub></td>
<td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/assets/icons/arrays.svg" width="40" height="40" alt="Brackets icon for array edge cases with holes and huge lengths"><br><strong>Arrays</strong> <code>14 cases</code><br><sub>Holes, length 2^32 - 1, NaN membership, default sort, too big to spread</sub></td>
<td width="33%" valign="top"><img src="https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/assets/icons/helpers.svg" width="40" height="40" alt="Stopwatch icon for the time zone and frozen time test helpers"><br><strong>Helpers</strong> <code>4 functions</code><br><sub>withTimeZone, withFrozenTime, check, assertNoThrow</sub></td>
</tr>
</table>
<!-- grid:end -->

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/assets/demo.svg" width="760" alt="Animated terminal demo of edgegoat with Vitest: a naive isSameYear passes ordinary dates, then fails on the Pacific/Kiritimati and America/New_York New Year time zone edge cases">
</p>

## Table of contents

- [How do I install edgegoat?](#how-do-i-install-edgegoat)
- [How do I use edgegoat with Vitest, Jest, node:test or Mocha?](#how-do-i-use-edgegoat-with-vitest-jest-nodetest-or-mocha)
- [What edge cases are included?](#what-edge-cases-are-included)
- [How do the helpers work?](#how-do-the-helpers-work)
- [Bugs these inputs found](#bugs-these-inputs-found)
- [FAQ](#faq)
- [How does edgegoat compare to fast-check and big-list-of-naughty-strings?](#how-does-edgegoat-compare-to-fast-check-and-big-list-of-naughty-strings)
- [Where are the guides and docs?](#where-are-the-guides-and-docs)
- [How can I contribute?](#how-can-i-contribute)
- [License](#license)

## How do I install edgegoat?

```sh
npm install --save-dev edgegoat
# or: pnpm add -D edgegoat / yarn add -D edgegoat / bun add -d edgegoat
```

Works in Node.js 18 and later and in modern browsers (`withTimeZone` needs Node.js). Ships ESM and CommonJS builds with type declarations, has no runtime dependencies and is tree shakeable: everything is about 19 kB minified and gzipped, a single generator is 2 to 4.5 kB.

## How do I use edgegoat with Vitest, Jest, node:test or Mocha?

Every generator returns an array of `{ label, value, why, tags }` objects. Zone specific date cases also carry a `zone`.

### Vitest

```ts
import { describe, expect, test } from 'vitest';
import { numbers, strings, assertNoThrow } from 'edgegoat';

test.each(numbers({ tags: ['sign'] }))('$label keeps its sign', ({ value }) => {
  expect(formatNumber(value).startsWith('-')).toBe(value < 0);
});

test('slugify never throws on unicode input', () => {
  assertNoThrow(slugify, strings());
});
```

### Jest

```js
const { dates, withTimeZone } = require('edgegoat');

test.each(dates({ tags: ['year-boundary'] }).filter((c) => c.zone))('$label', ({ value, zone }) => {
  withTimeZone(zone, () => {
    expect(isSameYear(value, new Date(value.getFullYear(), 6, 1))).toBe(true);
  });
});
```

### node:test

```js
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { paths } from 'edgegoat';

for (const { label, value } of paths({ tags: ['traversal'] })) {
  test(label, () => assert.throws(() => safeJoin('/srv/app', value)));
}
```

### Mocha

```js
const { emails } = require('edgegoat');

describe('email validation', () => {
  for (const { label, value } of emails({ tags: ['valid'] })) {
    it(`accepts ${label}`, () => assert.ok(isEmail(value)));
  }
});
```

### Without a test runner

```ts
import { check, strings } from 'edgegoat';

const failures = check((s) => truncate(s, 10), strings(), (out) => out.isWellFormed());
// [{ label: 'surrogate pair cut by slice(0, 10)', value: 'abcdefghi\u{1F600}', why: '...', result: '...' }]
```

Runnable versions of these live in [`examples/`](https://github.com/kwy404/edgegoat/blob/main/examples), including two real world style bugs that edgegoat catches: a [New Year time zone bug](https://github.com/kwy404/edgegoat/blob/main/examples/real-world/format-date.ts) mirroring github/relative-time-element#384 and a [truncate that splits emoji](https://github.com/kwy404/edgegoat/blob/main/examples/real-world/truncate.ts).

## What edge cases are included?

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/assets/catalog.svg" width="760" alt="edgegoat catalog chart: number of edge cases per generator for dates, time zones, unicode strings, numbers, numeric strings, BigInt, URLs, emails, paths, JSON and arrays">
</p>

| Generator | What it covers | Example tags |
| --- | --- | --- |
| `dates()` | DST gaps and overlaps computed from `Intl` (New York, Sao Paulo 2018, London, Lord Howe), New Year where local and UTC years differ (Kathmandu +05:45, Kiritimati +14, Pago Pago -11), epoch, before 1970 with fractional seconds, local mean time, 2038, year 0, 9999, 10000, min and max Date, invalid date, leap days, month ends, ISO weeks | `dst`, `gap`, `overlap`, `year-boundary`, `pre-1970`, `leap`, `week`, `invalid` |
| `timeZones()` | 18 IANA zones with odd offsets or rules, each with the reason | `fractional-offset`, `dst`, `unusual-dst`, `extreme` |
| `strings()` | Whitespace and invisible characters, emoji sequences, surrogates, NFC vs NFD, bidi, casing traps, newlines, injection shaped text, unicode digits, Hangul, Thai | `emoji`, `surrogate`, `normalization`, `bidi`, `casing`, `newline`, `injection` |
| `numbers()` | `0`, `-0`, `NaN`, infinities, safe integer limits, `MIN_VALUE`, `EPSILON`, values between -1 and 0, `0.1 + 0.2`, `1.005`, `1e21` | `sign`, `nan`, `infinity`, `limit`, `precision`, `exponent` |
| `numericStrings()` | Strings where `Number`, `parseInt` and `parseFloat` disagree | `coercion`, `locale`, `radix` |
| `bigints()` | int64 and uint64 limits, `2^53 + 1`, JSON and mixing pitfalls | `int64`, `uint64`, `precision` |
| `urls()` | WHATWG parser normalizations, SSRF and open redirect shapes, encodings, schemes; tagged `valid` or `invalid` | `security`, `encoding`, `idn`, `valid`, `invalid` |
| `emails()` | RFC 5321/5322 valid addresses that validators reject, and invalid ones they accept | `valid`, `invalid`, `quoted`, `smtputf8` |
| `paths()` | Windows vs POSIX, drive relative, UNC, long paths, reserved names, traversal, NFD names | `windows`, `posix`, `traversal`, `reserved` |
| `json()` | 10000 levels deep, duplicate keys, integers above 2^53, `__proto__`, BOM, JSON5 style syntax | `valid`, `invalid`, `deep`, `security` |
| `arrays()` | Holes, length 2^32 - 1, `NaN` and `-0` membership, default sort, too large to spread | `sparse`, `sort`, `nan`, `large` |

Search every case online in the [catalog](https://kwy404.github.io/edgegoat/#catalog), or download it as [catalog.json](https://kwy404.github.io/edgegoat/catalog.json).

### Filtering by tag, zone and year

```ts
dates({ tags: ['dst'] });                             // only DST gaps and overlaps
dates({ zone: 'Europe/Berlin', tags: ['dst'] });      // any IANA zone, computed at runtime
dates({ zone: ['Asia/Kathmandu', 'Pacific/Apia'] });  // several zones
dates({ year: 2027 });                                // another year for DST and New Year
strings({ tags: ['emoji'], exclude: ['zwj'] });       // tags match any; exclude removes
```

### Full catalog

<!-- catalog:start -->
<details>
<summary><strong><code>dates()</code></strong>: 46 cases</summary>

| Label | Value | Why it breaks code |
| --- | --- | --- |
| unix epoch 1970-01-01T00:00:00.000Z | `1970-01-01T00:00:00.000Z` | Timestamp 0 is falsy, so `if (!time)` treats a valid date as missing, and west of UTC it is still 1969 locally. |
| 1 ms before the epoch | `1969-12-31T23:59:59.999Z` | Negative timestamps: `ms % 1000` is -1, not 999, so splitting seconds and milliseconds with % and Math.floor disagree. |
| before 1970 with fractional seconds (1969-12-31T23:59:58.500Z) | `1969-12-31T23:59:58.500Z` | Truncating -1.5 s toward zero gives 23:59:59 instead of 23:59:58; Math.trunc vs Math.floor and integer division bugs live here. |
| moon landing 1969-07-20T20:17:40.123Z | `1969-07-20T20:17:40.123Z` | Negative timestamp with milliseconds: serializers that build "seconds.millis" from a negative value print a wrong or doubly negative fraction. |
| local mean time era 1850-01-01T00:00:00Z | `1850-01-01T00:00:00.000Z` | Before standard time, zones used local mean time with second level offsets (Sao Paulo was -03:06:28); getTimezoneOffset() reports whole minutes, so local arithmetic drifts by seconds. |
| year 0 (0000-01-01T00:00:00Z) | `0000-01-01T00:00:00.000Z` | Date.UTC(0, 0, 1) and new Date(0, 0, 1) map years 0 to 99 to 1900 to 1999, and toISOString() yields "0000", which "1 BC" formatting must handle. |
| negative year (-000001-01-01T00:00:00Z) | `-000001-01-01T00:00:00.000Z` | toISOString() produces an expanded, signed year "-000001"; regexes that expect four digits reject it. |
| year 2038 limit 2038-01-19T03:14:07Z | `2038-01-19T03:14:07.000Z` | Last second representable as a signed 32 bit Unix time; anything that stores seconds in an int32 (or uses `\| 0`) is fine here. |
| year 2038 overflow 2038-01-19T03:14:08Z | `2038-01-19T03:14:08.000Z` | One second past the int32 limit: `(ms / 1000) \| 0` wraps to 1901-12-13, and so do 32 bit database columns. |
| last instant of year 9999 | `9999-12-31T23:59:59.999Z` | Largest instant with a four digit year; one millisecond later toISOString() switches to "+010000". |
| year 10000 (+010000-01-01T00:00:00.000Z) | `+010000-01-01T00:00:00.000Z` | toISOString() returns a six digit signed year; parsers, databases and YYYY format strings break. |
| maximum Date (+275760-09-13T00:00:00.000Z) | `+275760-09-13T00:00:00.000Z` | Largest valid Date. Adding 1 ms produces Invalid Date, so "end of time" sentinels overflow. |
| minimum Date (-271821-04-20T00:00:00.000Z) | `-271821-04-20T00:00:00.000Z` | Smallest valid Date. Subtracting anything produces Invalid Date, and local offsets west of UTC push the local wall clock out of range. |
| invalid date | `Invalid Date` | getTime() is NaN, toISOString() throws RangeError, JSON.stringify gives null and every comparison is false. |
| date-only string parsed as UTC (new Date("2026-03-01")) | `2026-03-01T00:00:00.000Z` | Date-only ISO strings are UTC midnight, while date-time strings without Z are local; west of UTC this date displays as February 28. |
| leap day 2024-02-29 | `2024-02-29T12:00:00.000Z` | Adding a year with setFullYear(y + 1) lands on 2025-03-01 because Feb 29 2025 does not exist; birthdays and anniversaries drift. |
| leap day 2000-02-29 (400 year rule) | `2000-02-29T12:00:00.000Z` | 2000 is a leap year because it is divisible by 400, unlike 1900 and 2100; a "divisible by 100 means not leap" rule rejects it. |
| not a leap year 2100-02-28 | `2100-02-28T12:00:00.000Z` | 2100 is not a leap year; `year % 4 === 0` claims Feb 29 2100 exists and the day after this is computed wrong. |
| month end 2026-01-31 | `2026-01-31T12:00:00.000Z` | setMonth(month + 1) on January 31 overflows to March 3, because February 31 does not exist. |
| month end 2026-03-31 | `2026-03-31T12:00:00.000Z` | Adding one month to March 31 gives May 1, since April has 30 days; "same day next month" needs clamping. |
| last millisecond of 2026 (UTC) | `2026-12-31T23:59:59.999Z` | Range queries ending at 23:59:59 miss this millisecond; month index 11 plus one must roll over into the next year. |
| 2027-01-01 is in ISO week 53 of 2026 | `2027-01-01T12:00:00.000Z` | ISO week years differ from calendar years: this Friday belongs to week 53 of 2026, so `getFullYear()` plus week number is wrong. |
| 2024-12-30 is in ISO week 1 of 2025 | `2024-12-30T12:00:00.000Z` | A Monday in December that belongs to week 1 of the next ISO year; "yyyy-ww" built from the calendar year shows 2024-01. |
| 2023-01-01 is a Sunday in ISO week 52 of 2022 | `2023-01-01T12:00:00.000Z` | ISO weeks start on Monday, US weeks on Sunday: this day is week 52 of 2022 in ISO but week 1 of 2023 in US numbering. |
| America/New_York 2026: 1 ms before spring forward (2026-03-08 01:59 local) | `2026-03-08T06:59:59.999Z` | Last instant before clocks jump from 02:00 to 03:00 (UTC-05:00 to UTC-04:00); adding 60 minutes of wall time here is not 60 minutes of real time. |
| America/New_York 2026: spring forward (2026-03-08 03:00 local) | `2026-03-08T07:00:00.000Z` | Clocks jump from 02:00 to 03:00; local times in between do not exist, so building a Date from local fields shifts it and that local day is 23 hours long. |
| America/New_York 2026: fall back, first 01:30 (2026-11-01) | `2026-11-01T05:30:00.000Z` | Clocks fall back from 02:00 to 01:00, so 01:30 happens twice; this is the first one (UTC-04:00). Parsing the local time picks one of the two. |
| America/New_York 2026: fall back, second 01:30 (2026-11-01) | `2026-11-01T06:30:00.000Z` | Same wall clock reading as the first 01:30, 60 minutes later (UTC-05:00); sorting or deduplicating by local time breaks and that local day is 25 hours long. |
| America/New_York: last instant of 2025 local time | `2026-01-01T04:59:59.999Z` | Local time is 2025-12-31 23:59:59.999 (UTC-05:00) but the UTC year is already 2026; a year check with getUTCFullYear() is off by one. |
| America/Sao_Paulo 2018: fall back, first 23:30 (2018-02-17) | `2018-02-18T01:30:00.000Z` | Clocks fall back from 00:00 to 23:00, so 23:30 happens twice; this is the first one (UTC-02:00). Parsing the local time picks one of the two. |
| America/Sao_Paulo 2018: fall back, second 23:30 (2018-02-17) | `2018-02-18T02:30:00.000Z` | Same wall clock reading as the first 23:30, 60 minutes later (UTC-03:00); sorting or deduplicating by local time breaks and that local day is 25 hours long. |
| America/Sao_Paulo 2018: 1 ms before spring forward (2018-11-03 23:59 local) | `2018-11-04T02:59:59.999Z` | Last instant before clocks jump from 00:00 to 01:00 (UTC-03:00 to UTC-02:00); adding 60 minutes of wall time here is not 60 minutes of real time. |
| America/Sao_Paulo 2018: spring forward (2018-11-04 01:00 local) | `2018-11-04T03:00:00.000Z` | Clocks jump from 00:00 to 01:00; local times in between do not exist, so building a Date from local fields shifts it and that local day is 23 hours long. Midnight does not exist that day, so new Date(2018, 10, 4) returns 01:00. |
| America/Sao_Paulo: last instant of 2017 local time | `2018-01-01T01:59:59.999Z` | Local time is 2017-12-31 23:59:59.999 (UTC-02:00) but the UTC year is already 2018; a year check with getUTCFullYear() is off by one. |
| Europe/London 2026: 1 ms before spring forward (2026-03-29 00:59 local) | `2026-03-29T00:59:59.999Z` | Last instant before clocks jump from 01:00 to 02:00 (UTC+00:00 to UTC+01:00); adding 60 minutes of wall time here is not 60 minutes of real time. |
| Europe/London 2026: spring forward (2026-03-29 02:00 local) | `2026-03-29T01:00:00.000Z` | Clocks jump from 01:00 to 02:00; local times in between do not exist, so building a Date from local fields shifts it and that local day is 23 hours long. |
| Europe/London 2026: fall back, first 01:30 (2026-10-25) | `2026-10-25T00:30:00.000Z` | Clocks fall back from 02:00 to 01:00, so 01:30 happens twice; this is the first one (UTC+01:00). Parsing the local time picks one of the two. |
| Europe/London 2026: fall back, second 01:30 (2026-10-25) | `2026-10-25T01:30:00.000Z` | Same wall clock reading as the first 01:30, 60 minutes later (UTC+00:00); sorting or deduplicating by local time breaks and that local day is 25 hours long. |
| Australia/Lord_Howe 2026: fall back, first 01:45 (2026-04-05) | `2026-04-04T14:45:00.000Z` | Clocks fall back from 02:00 to 01:30, so 01:45 happens twice; this is the first one (UTC+11:00). Parsing the local time picks one of the two. |
| Australia/Lord_Howe 2026: fall back, second 01:45 (2026-04-05) | `2026-04-04T15:15:00.000Z` | Same wall clock reading as the first 01:45, 30 minutes later (UTC+10:30); sorting or deduplicating by local time breaks and that local day is 24.5 hours long. |
| Australia/Lord_Howe 2026: 1 ms before spring forward (2026-10-04 01:59 local) | `2026-10-03T15:29:59.999Z` | Last instant before clocks jump from 02:00 to 02:30 (UTC+10:30 to UTC+11:00); adding 30 minutes of wall time here is not 30 minutes of real time. |
| Australia/Lord_Howe 2026: spring forward (2026-10-04 02:30 local) | `2026-10-03T15:30:00.000Z` | Clocks jump from 02:00 to 02:30; local times in between do not exist, so building a Date from local fields shifts it and that local day is 23.5 hours long. |
| Australia/Lord_Howe: first instant of 2026 local time | `2025-12-31T13:00:00.000Z` | Local time is 2026-01-01 00:00 (UTC+11:00) but the UTC year is still 2025; a year check with getUTCFullYear() is off by one. |
| Asia/Kathmandu: first instant of 2026 local time | `2025-12-31T18:15:00.000Z` | Local time is 2026-01-01 00:00 (UTC+05:45) but the UTC year is still 2025; a year check with getUTCFullYear() is off by one. |
| Pacific/Kiritimati: first instant of 2026 local time | `2025-12-31T10:00:00.000Z` | Local time is 2026-01-01 00:00 (UTC+14:00) but the UTC year is still 2025; a year check with getUTCFullYear() is off by one. This zone is among the first places on Earth to enter the new year. |
| Pacific/Pago_Pago: last instant of 2025 local time | `2026-01-01T10:59:59.999Z` | Local time is 2025-12-31 23:59:59.999 (UTC-11:00) but the UTC year is already 2026; a year check with getUTCFullYear() is off by one. This zone is among the last places on Earth to leave the old year. |

</details>

<details>
<summary><strong><code>timeZones()</code></strong>: 18 cases</summary>

| Label | Value | Why it breaks code |
| --- | --- | --- |
| UTC | `"UTC"` | The control zone: offset 0 all year. Bugs that only show up away from UTC hide here, which is why CI should not run only in UTC. |
| America/New_York | `"America/New_York"` | UTC-05:00 with US DST rules: the classic negative offset where UTC midnight is the previous local day. |
| America/Los_Angeles | `"America/Los_Angeles"` | UTC-08:00: late enough that evening events land on the next UTC day. |
| America/Sao_Paulo | `"America/Sao_Paulo"` | UTC-03:00; used DST with midnight transitions until 2019, so historical dates have days without 00:00. |
| America/St_Johns | `"America/St_Johns"` | UTC-03:30: a half hour offset with DST in the Americas; code that assumes whole hours breaks. |
| Europe/London | `"Europe/London"` | UTC+00:00 in winter but +01:00 in summer: tests that pass in January fail in July. |
| Europe/Dublin | `"Europe/Dublin"` | The tz database models Irish time with a negative DST save (standard time in summer), which trips code that reads the isDST flag of tz libraries. |
| Africa/Casablanca | `"Africa/Casablanca"` | UTC+01:00 that drops to +00:00 during Ramadan each year, so transitions move with the lunar calendar. |
| Asia/Kolkata | `"Asia/Kolkata"` | UTC+05:30, no DST: the most populous half hour offset. |
| Asia/Kathmandu | `"Asia/Kathmandu"` | UTC+05:45: a quarter hour offset that breaks `offset / 60` rounding and hour only offset pickers. |
| Asia/Tehran | `"Asia/Tehran"` | UTC+03:30; abolished DST in 2022, so historical and current rules differ. |
| Australia/Adelaide | `"Australia/Adelaide"` | UTC+09:30 / +10:30: southern hemisphere DST plus a half hour offset. |
| Australia/Lord_Howe | `"Australia/Lord_Howe"` | UTC+10:30 / +11:00: DST shifts by only 30 minutes, so "DST adds one hour" is false. |
| Pacific/Chatham | `"Pacific/Chatham"` | UTC+12:45 / +13:45: quarter hour offset with DST, far east of the date line. |
| Pacific/Kiritimati | `"Pacific/Kiritimati"` | UTC+14:00, the largest offset: local dates are a full day ahead of most of the Americas and the first to reach New Year. |
| Pacific/Apia | `"Pacific/Apia"` | Samoa skipped 2011-12-30 entirely when it moved across the date line; day counting across that date is off by one. |
| Pacific/Pago_Pago | `"Pacific/Pago_Pago"` | UTC-11:00, among the last places to leave a year; local dates lag a day behind most of Asia. |
| Antarctica/Troll | `"Antarctica/Troll"` | UTC+00:00 in winter and +02:00 in summer: a two hour DST jump. |

</details>

<details>
<summary><strong><code>strings()</code></strong>: 49 cases</summary>

| Label | Value | Why it breaks code |
| --- | --- | --- |
| empty string | `""` | Falsy, length 0: `if (!name)` and `str[0].toUpperCase()` both misbehave. |
| single space | `" "` | Truthy but blank: passes `if (str)` checks and fails after trim(). |
| mixed ASCII whitespace | `" \t\n\r\u000B\u000C "` | Every ASCII whitespace character; trim() returns an empty string but `str.length > 0` validators accept it. |
| no-break space (U+00A0) | `"a\u00A0b"` | Arrives from HTML &nbsp; and copy paste; \s and trim() treat it as whitespace but split(" ") and many tokenizers do not. |
| ideographic space (U+3000) | `"\u3000\u65E5\u672C\u3000"` | Full width space used in CJK text; trim() removes it, byte based or ASCII only trimming does not. |
| zero width space (U+200B) | `"foo\u200Bbar"` | Invisible and not whitespace for trim() or \s, so it looks identical to "foobar" but is not equal to it. |
| byte order mark prefix (U+FEFF) | `"\uFEFFid"` | Left by Windows editors at the start of files: CSV headers become "\uFEFFid" and JSON.parse of BOM prefixed text throws. |
| soft hyphen (U+00AD) | `"co\u00ADoperate"` | Invisible unless a line breaks there, so search and equality fail on text that looks the same. |
| very long string (100000 chars) | `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa..."...` | Exceeds column and header limits, overflows layouts and exposes quadratic algorithms and backtracking regexes. |
| emoji outside the BMP (U+1F600) | `"\u{1F600}"` | One visible character but length 2 (a surrogate pair); charAt(0) and str[0] return half of it. |
| ZWJ family emoji (man, woman, girl, boy) | `"\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200...` | Seven code points joined by zero width joiners render as one glyph with length 11; splitting by code point shows four people. |
| flag emoji (regional indicators B and R) | `"\u{1F1E7}\u{1F1F7}"` | A flag is two regional indicator letters; cutting between them leaves letters and reversing them names another country or none. |
| skin tone modifier (thumbs up, medium) | `"\u{1F44D}\u{1F3FD}"` | Base emoji plus a modifier: one grapheme, two code points, four code units; truncating after the base drops the tone. |
| emoji with variation selector (red heart) | `"\u2764\uFE0F"` | U+2764 plus U+FE0F: removing "invisible" characters changes emoji presentation, and the base alone is in the BMP. |
| keycap sequence (digit one) | `"1\uFE0F\u20E3"` | Starts with an ASCII digit, so /^\d/ matches what renders as a single keycap symbol. |
| surrogate pair cut by slice(0, 10) | `"abcdefghi\u{1F600}"` | The emoji starts at index 9, so slice(0, 10) keeps only its high surrogate and produces malformed UTF-16. |
| surrogate pair at the end for trimEnd style truncation | `"Done \u{1F389}"` | Truncating "to N code units" from the end lands inside the pair; output ends in a lone surrogate that renders as U+FFFD. |
| lone high surrogate | `"a\uD83Db"` | Malformed UTF-16: encodeURIComponent throws URIError, TextEncoder writes U+FFFD and isWellFormed() is false. |
| lone low surrogate | `"\uDE00"` | A trailing surrogate with no lead: string comparison works but encoding, hashing and JSON round trips through UTF-8 change it. |
| precomposed e acute (NFC) | `"caf\u00E9"` | Length 4. Compare with the decomposed form: same rendering, different code points. |
| decomposed e acute (NFD) | `"cafe\u0301"` | Length 5 and !== the NFC form; macOS file names and some keyboards produce this form. Use normalize() before comparing. |
| stacked combining marks | `"Z\u0351\u036B\u0343\u036A\u0302\u036B\u033D\...` | One base letter with ten combining marks: one grapheme, eleven code units, and rendering that escapes its line box. |
| leading combining mark | `"\u0301abc"` | A combining mark with nothing to attach to; it combines with whatever precedes the string after concatenation. |
| Hangul syllables (precomposed) | `"\uD55C\uAD6D\uC5B4"` | Korean syllable blocks. NFD splits each into two or three jamo, so lengths change after normalization. |
| Hangul jamo (decomposed) | `"\u1112\u1161\u11AB"` | Three jamo that render as one syllable and equal the first syllable of the previous case only after NFC normalization. |
| right to left text mixed with Latin and digits | `"abc \u05E9\u05DC\u05D5\u05DD 123"` | Hebrew mixed with Latin and numbers: visual order differs from memory order, which breaks cursor math and naive truncation with ellipsis. |
| Arabic text | `"\u0645\u0631\u062D\u0628\u0627"` | Right to left script with contextual letter shapes; per code point styling or splitting breaks the joining. |
| right to left override (U+202E) | `"invoice\u202Etxt.exe"` | Displays as "invoiceexe.txt": the Trojan Source trick (CVE-2021-42574) for file names and code review. |
| bidi isolate controls (U+2067, U+2069) | `"user\u2067admin\u2069"` | Invisible directional isolates change display order; strip or escape them in identifiers and logs. |
| Turkish dotted and dotless i | `"I\u0130\u0131i"` | Capital dotted I lowercases to i plus U+0307 (length grows), and toLocaleLowerCase("tr") maps I to dotless i; case insensitive keys break. |
| German sharp s | `"stra\u00DFe"` | toUpperCase() gives "STRASSE" (length 6 to 7), so upper and lower case comparisons disagree and length based layouts shift. |
| Greek final sigma | `"\u039F\u0394\u039F\u03A3"` | Lowercasing the whole word yields a final sigma at the end; lowercasing letter by letter does not, so results differ. |
| null character | `"a\u0000b"` | Terminates C strings, is rejected by PostgreSQL text columns and disappears in some loggers. |
| CRLF newline | `"line1\r\nline2"` | split("\n") leaves a trailing "\r" on each line; Windows files and HTTP headers use this form. |
| CR only newline | `"line1\rline2"` | Classic Mac line ending: code that only looks for \n sees one line. |
| line separator (U+2028) | `"a\u2028b"` | A JavaScript line terminator: `.` in a regex does not match it, and it broke inline scripts and JSONP before ES2019. |
| paragraph separator (U+2029) | `"a\u2029b"` | Another JavaScript line terminator that most text editors render as nothing; line counting tools disagree about it. |
| vertical tab and form feed | `"a\u000Bb\u000Cc"` | Rarely seen whitespace that XML 1.0 forbids and some JSON encoders escape inconsistently. |
| HTML markup as text | `"<script>alert(\"x\")</script>"` | Must render as literal text; any innerHTML or template without escaping executes it. |
| already escaped HTML | `"&lt;b&gt; &amp;amp;"` | Escaping twice shows "&amp;lt;" to users; unescaping on input then escaping on output corrupts it. |
| SQL quote and comment | `"Robert'); DROP TABLE Students;--"` | A quote ends a string literal in hand built SQL; also tests that names with apostrophes survive a round trip. |
| regex metacharacters | `".*+?^${}()\|[]\\"` | Passing user text to new RegExp() throws on "(" or matches everything with ".*"; escape it first. |
| template placeholders | `"${7*7} {{7*7}} %s %d"` | Text that looks like template or printf syntax; any second pass through a formatter changes it. |
| __proto__ as a key | `"__proto__"` | Used as an object key it sets the prototype instead of a property; use Map or Object.create(null) for user keys. |
| the word null | `"null"` | A real surname and a common placeholder: systems that treat "null" as missing lose data. |
| Arabic-Indic digits | `"\u0663\u0664"` | Unicode digits: Number() and parseInt return NaN and \d only matches ASCII 0 to 9, yet users type these. |
| full width digits | `"\uFF11\uFF12\uFF13"` | Typed by CJK input methods; look like 123 but fail /^\d+$/ and Number(). |
| Thai without spaces | `"\u0E20\u0E32\u0E29\u0E32\u0E44\u0E17\u0E22"` | Thai writes words without spaces and uses combining vowels; word wrapping and counting need Intl.Segmenter. |
| wide CJK characters | `"\u4F60\u597D\uFF01"` | Each character takes two terminal columns, so padEnd based tables and fixed width output misalign. |

</details>

<details>
<summary><strong><code>numbers()</code></strong>: 26 cases</summary>

| Label | Value | Why it breaks code |
| --- | --- | --- |
| zero | `0` | Falsy: `if (!count)` and `value \|\| defaultValue` replace a legitimate 0. |
| negative zero | `-0` | -0 === 0 is true, but Object.is(-0, 0) is false, 1 / -0 is -Infinity and String(-0) is "0", so the sign silently disappears. |
| NaN | `NaN` | NaN !== NaN, indexOf cannot find it, JSON.stringify writes null and every comparison is false, so sorting with it is unstable. |
| Infinity | `Infinity` | JSON.stringify writes null, toFixed returns "Infinity" and a max-age or timeout of Infinity can mean "never" or overflow a timer. |
| -Infinity | `-Infinity` | Math.max() of an empty list; a common reducer seed that leaks into output as "-Infinity". |
| MAX_SAFE_INTEGER | `9007199254740991` | 2^53 - 1, the largest integer where n + 1 is exact; IDs and counters past it stop being unique. |
| MAX_SAFE_INTEGER + 1 | `9007199254740992` | 2^53: here n + 1 === n, so loops never advance and 64 bit IDs from JSON collide. |
| MAX_SAFE_INTEGER + 2 | `9007199254740992` | Is not representable: the literal 9007199254740993 rounds to 9007199254740992 before your code ever sees it. |
| MIN_SAFE_INTEGER | `-9007199254740991` | -(2^53 - 1), the negative safe integer limit; mirrors the positive overflow bugs. |
| MIN_SAFE_INTEGER - 1 | `-9007199254740992` | First unsafe negative integer: Number.isSafeInteger is false and decrementing it is not exact. |
| MAX_VALUE | `1.7976931348623157e+308` | Largest finite double; doubling it or adding a large value gives Infinity. |
| MIN_VALUE | `5e-324` | Smallest positive double (5e-324), not the most negative number; code that uses it as "minus infinity" is wrong. |
| EPSILON | `2.220446049250313e-16` | Gap between 1 and the next double; only meaningful as a tolerance near 1, not for large or tiny values. |
| 2^32 | `4294967296` | Breaks `x \| 0` and `x >>> 0` truncation, array index limits and 32 bit counters. |
| 2^31 | `2147483648` | Overflows signed 32 bit math: `(2 ** 31) \| 0` is -2147483648. |
| -0.5 | `-0.5` | Between -1 and 0: Math.trunc gives -0, Math.round gives -0, and code that formats the integer part then the fraction drops the minus sign. |
| -0.0001 | `-0.0001` | A small negative between -1 and 0: formatting with toFixed(2) gives "-0.00", and splitting into integer and fraction parts loses the sign. |
| -1e-7 | `-1e-7` | Very small negative: String() gives "-1e-7", so string based number formatting and regexes for digits fail. |
| 1e-7 | `1e-7` | Smallest magnitude where String() switches to exponent notation ("1e-7"), while 0.000001 still prints in full. |
| 0.1 + 0.2 | `0.30000000000000004` | 0.30000000000000004, not 0.3: exact equality on money and percentages fails; compare with a tolerance or use integers. |
| 1.005 | `1.005` | Stored as 1.00499999999999989..., so (1.005).toFixed(2) is "1.00" and Math.round(1.005 * 100) / 100 is 1. |
| 0.5 (round half) | `0.5` | Math.round(0.5) is 1 but Math.round(-0.5) is -0 and toFixed uses a different rule: half rounding is not symmetric. |
| 1e21 | `1e+21` | First integer where String() uses exponent notation ("1e+21"); toFixed also falls back to exponent form, breaking digit only checks. |
| 999999999999999900000 | `999999999999999900000` | Largest round number below 1e21 that still prints all its digits; one step up the format changes. |
| negative integer | `-42` | Modulo keeps the sign (-42 % 5 is -2), so "positive modulo" wraparound for indexes and calendars is wrong. |
| non-integer array index | `1.5` | arr[1.5] is undefined and creates a string property on write; Number.isInteger guards are often missing. |

</details>

<details>
<summary><strong><code>numericStrings()</code></strong>: 17 cases</summary>

| Label | Value | Why it breaks code |
| --- | --- | --- |
| empty string | `""` | Number("") is 0, not NaN, so empty form fields become zero. |
| whitespace only | `"  \n\t "` | Number("  ") is 0 as well; parseFloat returns NaN, so the two parsers disagree. |
| padded number | `"  42  "` | Number trims whitespace and accepts it; strict validators and parseInt with a regex may not. |
| negative zero string | `"-0"` | Number("-0") is -0, which then prints as "0"; round trips lose the sign. |
| leading zeros | `"007"` | Decimal 7 for Number and parseInt, but octal in some legacy parsers and a string ID that must keep its zeros. |
| hex string | `"0x1A"` | Number("0x1A") is 26 and parseInt("0x1A") is 26, but parseFloat("0x1A") is 0. |
| binary and octal prefixes | `"0b101"` | Number("0b101") is 5 while parseInt("0b101") is 0; prefixes are accepted by one parser only. |
| exponent notation | `"1e3"` | Number gives 1000 but parseInt gives 1, so "digits only" assumptions break. |
| trailing garbage | `"12px"` | parseInt and parseFloat return 12, Number returns NaN; lenient parsing hides bad input. |
| comma decimal separator | `"1,5"` | Decimal comma used in most of Europe and Brazil: parseFloat gives 1 and Number gives NaN. |
| thousands separators | `"1,234,567.89"` | Grouped digits from formatted output; parseFloat stops at the first comma and returns 1. |
| numeric separator literal | `"1_000"` | Valid in JavaScript source but Number("1_000") is NaN. |
| Infinity string | `"Infinity"` | Number("Infinity") is Infinity, so numeric validation accepts a word; JSON cannot represent it. |
| NaN string | `"NaN"` | Number("NaN") is NaN, which passes typeof === "number" checks after conversion. |
| unsafe integer string | `"9007199254740993"` | Parses to 9007199254740992: IDs from JSON or databases silently change; parse as BigInt or keep as string. |
| plus sign | `"+5"` | Accepted by Number but rejected by many /^\d+$/ validators, and vice versa for UI masks. |
| Arabic-Indic digits | `"\u0664\u0662"` | Real digits for many users, but Number returns NaN; normalize with Intl or a digit map first. |

</details>

<details>
<summary><strong><code>bigints()</code></strong>: 8 cases</summary>

| Label | Value | Why it breaks code |
| --- | --- | --- |
| 0n | `0n` | Falsy like 0, and -0n is just 0n (BigInt has no negative zero), so sign preserving code paths diverge from Number. |
| -1n | `-1n` | BigInt division truncates toward zero (-1n / 2n is 0n) and % keeps the sign. |
| 2^53 + 1 (first integer Number cannot hold) | `9007199254740993n` | Number(2n ** 53n + 1n) rounds to 2^53; converting back to Number for math or JSON loses it. |
| int64 max | `9223372036854775807n` | Largest signed 64 bit integer (PostgreSQL bigint, Java long); one more overflows the column. |
| int64 min | `-9223372036854775808n` | Smallest signed 64 bit integer; its absolute value does not fit in int64. |
| uint64 max | `18446744073709551615n` | Largest unsigned 64 bit integer; BigInt.asIntN(64, n) turns it into -1n. |
| 2^64 (overflows uint64) | `18446744073709551616n` | Wraps to 0n with BigInt.asUintN(64, n); database drivers reject it. |
| 1e30 as BigInt | `1000000000000000000000000000000n` | Far beyond any Number integer: JSON.stringify throws TypeError for any BigInt, and mixing with Number in + throws. |

</details>

<details>
<summary><strong><code>urls()</code></strong>: 28 cases</summary>

| Label | Value | Why it breaks code |
| --- | --- | --- |
| localhost with port | `"http://localhost:3000/"` | No dot in the host: "must contain a TLD" validators reject development URLs. |
| credentials in URL | `"https://user:p%40ss@example.com/"` | Userinfo with an encoded @; naive parsers split on the first @ and leak or mangle the password. |
| IPv6 host with port | `"http://[::1]:8080/"` | hostname is "[::1]" with brackets; splitting host and port on ":" breaks. |
| shorthand IPv4 (127.1) | `"http://127.1/"` | The parser normalizes it to 127.0.0.1, so SSRF block lists that compare strings miss it. |
| hex IPv4 (0x7f.0.0.1) | `"http://0x7f.0.0.1/"` | Also loopback after normalization; another SSRF filter bypass. |
| internationalized domain | `"https://\u4F8B\u3048.jp/"` | hostname becomes punycode ("xn--r8jz45g.jp"), so comparing the input string with url.hostname fails. |
| trailing dot in host | `"https://example.com./"` | A fully qualified name that is a different origin from example.com for cookies, CORS and allow lists. |
| uppercase scheme and host | `"HTTPS://EXAMPLE.COM/Path"` | Scheme and host are lowercased but the path keeps its case; string compares of URLs disagree with the parser. |
| explicit default port | `"https://example.com:443/"` | url.port is "" because the default port is dropped; code expecting "443" breaks. |
| port out of range | `"http://example.com:65536/"` | Ports above 65535 make the URL invalid; regex validators accept any digits. |
| encoded slash in path | `"https://example.com/a%2Fb"` | Servers and routers disagree on whether %2F is a path separator; decode once at the right layer. |
| plus and space in query | `"https://example.com/?q=a+b&q=%20c"` | URLSearchParams decodes "+" as a space but decodeURIComponent does not; the key also repeats. |
| double encoded space | `"https://example.com/file%2520name"` | Decoding twice turns %2520 into a space; decoding once gives "%20" literally. |
| empty fragment | `"https://example.com/#"` | url.hash is "" even though href ends with "#", so hash based checks see no fragment. |
| dot segments in path | `"http://example.com/public/../secret"` | Normalized to /secret by the parser; checks done on the raw string allow traversal. |
| non ASCII path and query | `"https://example.com/\u{1F600}?q=caf\u00E9"` | The parser percent encodes both as UTF-8, so href no longer equals the input. |
| very long URL (8000 char path) | `"https://example.com/aaaaaaaaaaaaaaaaaaaa..."...` | Exceeds common 2048 character limits and 8 KB request line limits in proxies and servers. |
| javascript: scheme | `"javascript:alert(1)"` | A valid URL that runs code when used as an href; allow list schemes instead of block listing. |
| javascript: with a newline inside | `"java\nscript:alert(1)"` | The parser removes tabs and newlines, so this is javascript:alert(1); block lists that match the raw string miss it. |
| data: URL with HTML | `"data:text/html,<script>alert(1)</script>"` | Valid and executable in some contexts; never forward user supplied data URLs to href or src. |
| file URL with Windows drive | `"file:///C:/Windows/win.ini"` | host is empty and pathname is "/C:/Windows/win.ini" with a leading slash before the drive letter. |
| mailto URL | `"mailto:user@example.com"` | No host at all: url.host is "" and url.origin is "null". |
| surrounding spaces | `"  https://example.com/  "` | The parser strips leading and trailing spaces, so it is valid, but the stored string is not. |
| protocol relative | `"//example.com/path"` | Invalid without a base, but resolves to another host with one: "starts with /" open redirect checks pass it. |
| backslash relative | `"/\\example.com"` | Browsers treat "\" as "/" in http URLs, so this resolves to //example.com: a classic open redirect. |
| bare domain without scheme | `"example.com"` | What users type, but not a URL: new URL throws and links become relative paths. |
| space in host | `"http://exa mple.com/"` | Forbidden host code point; new URL throws. |
| empty string | `""` | new URL("") throws; optional URL fields must be checked before parsing. |

</details>

<details>
<summary><strong><code>emails()</code></strong>: 26 cases</summary>

| Label | Value | Why it breaks code |
| --- | --- | --- |
| plus addressing | `"user+tag@example.com"` | Gmail and others deliver it to "user"; validators that reject "+" lose real users. |
| dots in local part | `"first.last@example.com"` | Valid and common; some providers ignore the dots, so deduplication by string misses duplicates. |
| apostrophe in local part | `"o'brien@example.com"` | Valid; breaks SQL built by concatenation and regexes limited to [a-z0-9._]. |
| quoted local part with space | `"\"john doe\"@example.com"` | A quoted string may contain spaces; nearly every regex rejects it and naive splitting on spaces breaks. |
| quoted local part with @ | `"\"a@b\"@example.com"` | Splitting on the first "@" yields the wrong domain; use the last "@". |
| IP address literal domain | `"user@[192.168.0.1]"` | Domain literal in brackets; DNS based checks and domain allow lists do not expect it. |
| dotless domain | `"user@localhost"` | Valid syntax used on intranets and in tests, rejected by "needs a TLD" rules. |
| uppercase address | `"USER@EXAMPLE.COM"` | Domains are case insensitive, local parts technically are not; lowercasing everything can merge different mailboxes, not lowercasing creates duplicates. |
| subdomains and long TLD | `"user@mail.sub.example.co.uk"` | Multi label domains and two part public suffixes; "last two labels" logic picks co.uk. |
| new generic TLD | `"user@example.photography"` | TLDs longer than 4 letters exist; {2,4} quantifiers reject them. |
| shortest realistic address | `"a@b.co"` | Single character local part and short domain; minimum length rules are often too strict. |
| 64 character local part (maximum) | `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa...` | The longest local part RFC 5321 allows; storage columns sized at 50 truncate it. |
| internationalized local part | `"jos\u00E9@example.com"` | Valid with SMTPUTF8 (RFC 6531) but rejected by ASCII only servers; decide explicitly what you accept. |
| internationalized domain | `"user@\u4F8B\u3048.jp"` | The domain must be converted to punycode for DNS and SMTP; comparing raw strings fails. |
| 65 character local part (too long) | `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa...` | One over the RFC 5321 limit; lenient validators accept it and the SMTP server rejects it later. |
| missing @ | `"plainaddress"` | No separator at all; code that splits on "@" gets one part and reads undefined. |
| missing local part | `"@example.com"` | Empty local part; split("@")[0] is "". |
| missing domain | `"user@"` | Empty domain; split("@")[1] is "". |
| two @ signs | `"user@@example.com"` | Unquoted second "@" is invalid; splitting gives three parts. |
| leading dot | `".user@example.com"` | A dot may not start the local part. |
| trailing dot in local part | `"user.@example.com"` | A dot may not end the local part (some providers accept it anyway). |
| consecutive dots | `"us..er@example.com"` | Consecutive dots are not allowed unquoted. |
| consecutive dots in domain | `"user@example..com"` | Empty domain label; DNS lookups fail. |
| domain label starting with hyphen | `"user@-example.com"` | Host labels may not start with a hyphen. |
| unquoted space | `"john doe@example.com"` | Spaces need quoting; forms that do not trim also produce trailing spaces. |
| display name format | `"John Doe <john@example.com>"` | A valid mailbox header, not a bare address; pasted from mail clients into address fields. |

</details>

<details>
<summary><strong><code>paths()</code></strong>: 30 cases</summary>

| Label | Value | Why it breaks code |
| --- | --- | --- |
| Windows absolute path | `"C:\\Users\\Ana\\file.txt"` | Backslash separators: splitting on "/" returns one segment, and on POSIX this is a relative file name containing backslashes. |
| Windows path with forward slashes | `"C:/Users/Ana/file.txt"` | Windows accepts it, path.win32 understands it, path.posix treats it as relative. |
| drive relative path | `"C:file.txt"` | Relative to the current directory of drive C, not the root; path.win32.isAbsolute returns false. |
| root relative on Windows | `"\\temp\\file.txt"` | Absolute on the current drive only; the result depends on process.cwd() drive. |
| UNC share path | `"\\\\server\\share\\folder\\file.txt"` | Starts with two backslashes; the "root" is \\server\share\, so dirname and parent walking stop there. |
| long path prefix | `"\\\\?\\C:\\very\\long\\path"` | Disables normalization: "/" is not a separator and ".." is literal; needed beyond 260 characters. |
| path longer than 260 characters | `"C:\\segment\\segment\\segment\\segment\\segm...` | Exceeds the classic MAX_PATH limit; many Windows tools fail without long path support. |
| reserved device name | `"CON"` | CON, PRN, AUX, NUL, COM1 and LPT1 cannot be file names on Windows, with any extension. |
| reserved name with extension | `"aux.txt"` | Still the AUX device on Windows; repositories with this file cannot be checked out there. |
| trailing dot | `"file."` | Windows strips trailing dots, so "file." and "file" are the same file there but different on POSIX. |
| trailing space | `"file "` | Windows strips trailing spaces as well; invisible in most UIs. |
| case only difference | `"README.md"` | Case insensitive on default Windows and macOS file systems, so readme.md and README.md collide. |
| POSIX absolute path | `"/usr/local/bin"` | Absolute on POSIX; on Windows path.win32 treats it as root relative on the current drive. |
| trailing slash | `"dir/sub/"` | basename("dir/sub/") is "sub", but split("/").pop() is ""; joining adds a double slash. |
| repeated slashes | `"/a//b///c"` | Equivalent to /a/b/c after normalization; string comparisons and cache keys disagree. |
| root only | `"/"` | dirname("/") is "/" and basename is ""; loops that walk up until dirname changes must stop here. |
| empty path | `""` | path.join("", "") is "." and path.resolve("") is the cwd; empty is not "no path". |
| current directory | `"."` | A path that refers to the cwd; extname(".") is "" and basename is ".". |
| parent directory traversal | `"../../etc/passwd"` | Escapes the base directory after join; validate with path.relative after resolving. |
| traversal hidden inside a path | `"uploads/./a/../../../secret"` | Looks rooted in uploads/ but normalizes outside it. |
| Windows traversal with backslashes | `"..\\..\\Windows\\win.ini"` | Checks that only look for "../" miss backslash traversal on Windows. |
| dotfile | `".env"` | extname(".env") is "", not ".env"; hidden on POSIX and easy to leak in static servers. |
| double extension | `"archive.tar.gz"` | extname gives ".gz"; type detection and "strip the extension" give "archive.tar". |
| spaces in names | `"My Documents/file name.txt"` | Breaks unquoted shell commands and URL building without encoding. |
| backslash in a POSIX file name | `"a\\b.txt"` | A legal single file name on Linux that becomes two segments on Windows. |
| NFC unicode name | `"caf\u00E9.txt"` | Precomposed form, as typed on Windows and Linux. |
| NFD unicode name | `"cafe\u0301.txt"` | Decomposed form produced by older macOS file systems; looks the same as the NFC name but does not match it. |
| emoji in file name | `"notes \u{1F4DD}.md"` | Surrogate pairs in a path: byte limits, truncation and some archive tools mishandle them. |
| leading dash | `"-rf"` | Interpreted as an option by command line tools unless passed after "--". |
| newline in file name | `"a\nb.txt"` | Legal on Linux; breaks line based tools such as `find \| xargs` and log parsing. |

</details>

<details>
<summary><strong><code>json()</code></strong>: 22 cases</summary>

| Label | Value | Why it breaks code |
| --- | --- | --- |
| deeply nested arrays (10000 levels) | `"[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[..."...` | Valid JSON that overflows the stack of recursive walkers, deep equality checks and schema validators. |
| deeply nested objects (10000 levels) | `"{\"a\":{\"a\":{\"a\":{\"a\":{\"a\":{\"a\":{\...` | Same as nested arrays for code that recurses into object values, such as deep merge and clone helpers. |
| duplicate keys | `"{\"a\":1,\"a\":2}"` | Allowed by JSON.parse, which keeps the last value; other parsers keep the first or reject it, so validators and consumers disagree. |
| integer above 2^53 | `"{\"id\":9007199254740993}"` | Parses to 9007199254740992: IDs silently change. Send large IDs as strings. |
| huge exponent | `"1e400"` | Valid JSON that parses to Infinity, which JSON.stringify then writes as null. |
| negative zero | `"-0"` | Parses to -0, but JSON.stringify(-0) is "0", so round trips lose the sign. |
| number with trailing zeros | `"1.0"` | Parses to 1 and stringifies as "1": signatures and hashes over JSON text change after a round trip. |
| __proto__ key | `"{\"__proto__\":{\"isAdmin\":true}}"` | JSON.parse creates an own property, but merging the result into another object with assignment pollutes its prototype. |
| empty key | `"{\"\":1}"` | Valid; path based libraries (a.b.c syntax) cannot address it. |
| escaped lone surrogate | `"\"\\ud800\""` | Valid JSON that decodes to malformed UTF-16; re-encoding to UTF-8 or a database fails. |
| line and paragraph separators | `"\"a\u2028b\u2029c\""` | Valid JSON that was invalid in JavaScript string literals before ES2019, which broke JSONP and inline script tags. |
| top level string | `"\"just a string\""` | Valid JSON since RFC 7159; code that assumes an object reads properties of a string. |
| top level null | `"null"` | Valid JSON that parses to null; `const { a } = JSON.parse(text)` throws. |
| whitespace around value | `" \n\t {\"a\":1} \r\n"` | Valid; byte or regex based detectors that check the first character for "{" fail. |
| byte order mark prefix | `"\uFEFF{\"a\":1}"` | Windows tools write a BOM; JSON.parse throws on it, so strip it when reading files. |
| trailing comma | `"[1,2,]"` | Accepted by JavaScript and JSON5, rejected by JSON.parse. |
| comments | `"{\"a\":1 /* note */}"` | Common in config files (JSONC) but invalid JSON. |
| single quotes | `"{'a':1}"` | JavaScript object syntax, not JSON. |
| NaN literal | `"{\"a\":NaN}"` | Python json.dumps writes NaN by default, and JSON.parse rejects it. |
| unquoted key | `"{a:1}"` | JavaScript object literal syntax that JSON does not allow. |
| empty text | `""` | An empty response body is not JSON; JSON.parse("") throws "Unexpected end of JSON input". |
| raw control character in string | `"\"a\tb\""` | Unescaped tab inside a string is invalid JSON even though it looks harmless. |

</details>

<details>
<summary><strong><code>arrays()</code></strong>: 14 cases</summary>

| Label | Value | Why it breaks code |
| --- | --- | --- |
| empty array | `[]` | Truthy even though empty; reduce without a seed throws and Math.max(...[]) is -Infinity. |
| array with a hole | `[1, <hole>, 3]` | forEach, map and filter skip the hole but for...of and spread yield undefined, so the two styles disagree. |
| explicit undefined | `[1, undefined, 3]` | Looks like the hole case when printed, but every iteration method visits it and `1 in arr` is true. |
| length 5 with no elements | `[<hole>, <hole>, <hole>, <hole>, <hole>]` | new Array(5) has five holes: map returns holes, not values, and JSON.stringify writes nulls. |
| huge sparse length (2^32 - 1) | `["first", <hole>, <hole>, <hole>, <hole>, <ho...` | The maximum array length: cheap to create, but any loop to length or Array.from runs four billion times. |
| NaN element | `[NaN]` | indexOf(NaN) is -1 while includes(NaN) is true; Set and Map treat NaN as equal to itself. |
| -0 and 0 | `[-0, 0]` | Set collapses them into one value and includes(-0) finds 0; Object.is tells them apart. |
| numbers that sort as strings | `[10, 9, 1, 100]` | Default sort() compares strings, giving [1, 10, 100, 9]; always pass a comparator. |
| undefined during sort | `[3, undefined, 1]` | sort() moves undefined to the end without calling the comparator, so comparators never see it. |
| mixed number and numeric string | `[1, "1"]` | includes("1") and Set treat them as different, while == and loose lookups do not. |
| nested empty arrays | `[[[]]]` | flat() and recursive flatten helpers must handle empty levels; String([[[]]]) is "". |
| array with extra property | `[1, 2]` | for...in visits "extra" and Object.keys includes it, but length and JSON.stringify ignore it. |
| frozen array | `[1, 2, 3]` | push and in place sort throw TypeError in strict mode; libraries that mutate input break. |
| 500000 elements (too many to spread) | `[0, 1, 2, 3, 4, 5, ...] (length 500000)` | Math.max(...arr) and fn.apply(null, arr) exceed the argument limit and throw RangeError. |

</details>
<!-- catalog:end -->

## How do the helpers work?

### `withTimeZone(zone, fn)`

Runs `fn` with `process.env.TZ` set to `zone`, then restores the previous zone, also when `fn` throws or returns a rejected promise. It checks that the runtime really applied the zone (comparing `getTimezoneOffset()` with `Intl`) and throws a clear error otherwise.

```ts
withTimeZone('Asia/Kathmandu', () => new Date('2026-01-01T00:00:00Z').getTimezoneOffset()); // -345
```

Caveats: the zone is process wide, so do not use it with `test.concurrent`; `Intl.DateTimeFormat` instances created earlier keep their zone; in browsers it throws, because a page cannot change its own time zone (start the browser in the zone instead, for example with Playwright's `timezoneId`).

### `withFrozenTime(date, fn)`

Freezes `Date.now()`, `new Date()` and `Date()` at `date` while `fn` runs, without fake timers. `instanceof Date`, `Date.UTC`, `Date.parse`, subclasses and `new Date(value)` keep working. Timers and `performance.now()` are not touched. Nests with `withTimeZone`.

```ts
withTimeZone('Pacific/Kiritimati', () =>
  withFrozenTime('2025-12-31T10:00:00Z', () => new Date().getFullYear()), // 2026
);
```

### `check(fn, cases, predicate?)`

Runs `fn(value)` for every case and returns the failures: cases where `fn` threw, or where `predicate(result, value, case)` returned false. Each failure has `label`, `value`, `why` and `error` or `result`. An empty array means everything passed.

### `assertNoThrow(fn, cases)`

Throws one `EdgeCaseError` that lists every case where `fn` threw, with the reason each case matters. The error has a `failures` property with the same objects `check` returns.

### Types

`Case<T>`, `DateCase`, `CaseOptions`, `DateOptions`, `Failure<T>` and `Predicate<T, R>` are exported for TypeScript users.

## Bugs these inputs found

Real bugs of this kind, fixed upstream by the author of edgegoat ([kwy404](https://github.com/kwy404), more than 120 merged fixes in projects from Google, Microsoft, GitHub, Vue, JetBrains, Mozilla and others). The library packages the inputs that exposed them.

| Fix | The bug | edgegoat cases |
| --- | --- | --- |
| [github/relative-time-element#384](https://github.com/github/relative-time-element/pull/384) | The current year check used UTC instead of the display time zone | `dates({ tags: ['year-boundary'] })` |
| [mozilla/pdf.js#22017](https://github.com/mozilla/pdf.js/pull/22017) | `util.printf` lost the sign of negative numbers greater than -1 | `numbers({ tags: ['sign'] })` |
| [google/budoux#1411](https://github.com/google/budoux/pull/1411) | Segmentation split surrogate pairs | `strings({ tags: ['surrogate'] })` |
| [microsoft/vscode-js-debug#2423](https://github.com/microsoft/vscode-js-debug/pull/2423) | `trimEnd` style truncation split surrogate pairs | `strings({ tags: ['truncation'] })` |
| [salesforce/tough-cookie#644](https://github.com/salesforce/tough-cookie/pull/644) | An infinite max-age has to mean "never expires" | `numbers({ tags: ['infinity'] })` |
| [vuejs/core#15618](https://github.com/vuejs/core/pull/15618) | A fix in the Vue 3 compat build | |

## FAQ

### How do I test time zones in JavaScript?

Run the same assertions in several zones and feed them instants where local and UTC dates disagree. Set the zone for the whole run with `TZ=Asia/Kathmandu npx vitest run`, or per test with `withTimeZone(zone, fn)`, and use `dates({ tags: ['year-boundary'] })` and `timeZones()` as inputs. Guide: [How to test time zones in JavaScript](https://kwy404.github.io/edgegoat/test-timezones-javascript.html).

### How do I test daylight saving time in Jest?

Use real transition instants: `test.each(dates({ tags: ['dst'] }))` gives you the last instant before each spring forward, the first one after it, and both occurrences of the repeated time at each fall back, with the `zone` to run them in. Assert on local wall clock values, not on millisecond differences. Guide: [How to test daylight saving time in Jest](https://kwy404.github.io/edgegoat/test-daylight-saving-time-jest.html).

### How do I mock the date in Jest or Vitest without fake timers?

`withFrozenTime(date, fn)` freezes `new Date()` and `Date.now()` for one call and restores them afterwards. Use your runner's fake timers (`jest.useFakeTimers`, `vi.setSystemTime`) when you also need to control timers. Guide: [How to mock Date in JavaScript tests](https://kwy404.github.io/edgegoat/mock-date-javascript.html).

### Why is -0 different from 0?

Floating point numbers have a sign bit even for zero. `-0 === 0` is true, but `Object.is(-0, 0)` is false, `1 / -0` is `-Infinity`, `String(-0)` is `"0"` and `Intl.NumberFormat` prints `"-0"`. It appears whenever a small negative number is rounded or truncated. Guide: [Negative zero in JavaScript](https://kwy404.github.io/edgegoat/javascript-negative-zero.html).

### What are good unicode test strings for JavaScript?

Strings that break assumptions about length, equality and display: emoji outside the BMP, ZWJ sequences, flags, NFC vs NFD accents, right to left text and bidi controls, invisible spaces, lone surrogates and locale sensitive casing. `strings()` has 49 of them. Guide: [Unicode test strings for JavaScript](https://kwy404.github.io/edgegoat/unicode-test-strings.html).

### Can dates before 1970 break my code?

Yes. Their timestamps are negative, so `Math.trunc` and `%` round fractional seconds toward zero and produce 23:59:59 instead of 23:59:58, or negative nanoseconds. Guide: [Testing dates before 1970](https://kwy404.github.io/edgegoat/test-dates-before-1970.html).

### Are the DST transition times hard coded?

No. edgegoat scans UTC offsets with `Intl.DateTimeFormat` and binary searches every change down to the minute, so the instants always match the tz database of the runtime. The test suite verifies that each case is a real transition and that Node's `getTimezoneOffset()` agrees.

### Does edgegoat generate random data?

No. Every call returns the same cases, so failures are reproducible and test titles are stable. For random exploration, pair it with fast-check (see below).

### Does it work in the browser?

All generators, `withFrozenTime`, `check` and `assertNoThrow` work in any modern browser. `withTimeZone` needs Node.js, because a page cannot change its own time zone.

## How does edgegoat compare to fast-check and big-list-of-naughty-strings?

They are complementary. [fast-check](https://github.com/dubzzz/fast-check) is a property based testing library: it generates random inputs and shrinks failures, which finds bugs nobody thought of. [big-list-of-naughty-strings](https://github.com/minimaxir/big-list-of-naughty-strings) is a large list of strings for fuzzing input fields. edgegoat is a smaller, curated set of inputs that are known to break code, across several types, each explained and tagged.

| | edgegoat | fast-check | big-list-of-naughty-strings |
| --- | --- | --- | --- |
| Inputs | Curated, deterministic | Random, shrinkable | Curated strings |
| Types | Dates, time zones, strings, numbers, BigInt, URLs, emails, paths, JSON, arrays | Any, via arbitraries | Strings |
| Explains each input | Yes, a one line `why` and tags | No | Section comments |
| DST and New Year instants per zone | Computed from `Intl` | Rarely hit by chance | No |
| Time zone and clock helpers | `withTimeZone`, `withFrozenTime` | No | No |

Feed edgegoat values into fast-check with `fc.constantFrom(...strings().map((c) => c.value))`. Guide: [Property based testing and curated edge cases](https://kwy404.github.io/edgegoat/property-based-testing-edge-cases.html).

## Where are the guides and docs?

The documentation site is at **[kwy404.github.io/edgegoat](https://kwy404.github.io/edgegoat/)**, with a searchable catalog of every case and these guides:

- [How to test time zones in JavaScript](https://kwy404.github.io/edgegoat/test-timezones-javascript.html)
- [How to test daylight saving time in Jest](https://kwy404.github.io/edgegoat/test-daylight-saving-time-jest.html)
- [Unicode test strings for JavaScript](https://kwy404.github.io/edgegoat/unicode-test-strings.html)
- [JavaScript number edge cases to test](https://kwy404.github.io/edgegoat/javascript-number-edge-cases.html)
- [Testing dates before 1970 in JavaScript](https://kwy404.github.io/edgegoat/test-dates-before-1970.html)
- [Negative zero in JavaScript: why -0 is different from 0](https://kwy404.github.io/edgegoat/javascript-negative-zero.html)
- [How to mock Date in JavaScript tests](https://kwy404.github.io/edgegoat/mock-date-javascript.html)
- [Property based testing and curated edge cases in JavaScript](https://kwy404.github.io/edgegoat/property-based-testing-edge-cases.html)

## How can I contribute?

New cases are welcome when they have broken real code. Every case needs a `why`, and ideally a link to a real bug. See [CONTRIBUTING.md](https://github.com/kwy404/edgegoat/blob/main/CONTRIBUTING.md) for the checklist and the [changelog](https://github.com/kwy404/edgegoat/blob/main/CHANGELOG.md) for releases.

## More from kwy404

<!-- more:start -->
- [graphemely](https://kwy404.github.io/graphemely/): Truncate, slice and count strings with emoji safely, by grapheme cluster.
- [edgegoat](https://kwy404.github.io/edgegoat/): Edge case test inputs for JavaScript: time zones, DST, unicode, -0 and NaN.
- [vueleap](https://kwy404.github.io/vueleap/): Migrate Vue 2 to Vue 3 with one command, with the exact @vue/compat flags you need.
- [numberparrot](https://kwy404.github.io/numberparrot/): Parse localized number and currency strings back into real numbers, for any locale.
- [breakhound](https://github.com/kwy404/breakhound): Find bugs in any JavaScript or TypeScript library automatically, no tests required.
- [Voodoo.js](https://github.com/kwy404/Voodoo.js): The HTML first JavaScript framework: reactive directives and JSX in a plain HTML file.
<!-- more:end -->

## License

[MIT](https://github.com/kwy404/edgegoat/blob/main/LICENSE) © 2026 Alexandre Kohler. Mascot: Ledge the goat, who walks the edges so your code does not fall off them.
