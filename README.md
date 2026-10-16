<p align="right"><strong>English</strong> | <a href="https://github.com/kwy404/edgegoat/blob/main/i18n/README.pt-BR.md">Português (Brasil)</a></p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/assets/banner-dark.svg">
    <img src="https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/assets/banner.svg" width="880" alt="edgegoat banner with Ledge the mountain goat standing on a cliff edge">
  </picture>
</p>

<h1 align="center">edgegoat</h1>

<p align="center"><strong>The inputs that break code, ready to drop into your tests.</strong></p>

<p align="center">
  <a href="https://www.npmjs.com/package/edgegoat"><img height="20" src="https://img.shields.io/npm/v/edgegoat.svg?color=2E9C8A" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/edgegoat"><img height="20" src="https://img.shields.io/npm/dm/edgegoat?color=2E9C8A" alt="npm downloads per month"></a>
  <a href="https://github.com/kwy404/edgegoat/actions/workflows/ci.yml"><img height="20" src="https://github.com/kwy404/edgegoat/actions/workflows/ci.yml/badge.svg" alt="CI status"></a>
  <a href="https://github.com/kwy404/edgegoat/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-2E9C8A.svg" alt="MIT license"></a>
</p>

edgegoat is a curated set of <!-- total -->284<!-- /total --> inputs that are known to break JavaScript code: real DST transitions computed for each zone, New Year in Pacific/Kiritimati, dates before 1970, surrogate pairs, `-0`, Windows paths, deep JSON and sparse arrays. Every case has a label and a one line reason, so it drops straight into `test.each`. Zero dependencies, ESM and CommonJS, TypeScript types included.

**Try it in the browser:** pick a data type on [the website](https://kwy404.github.io/edgegoat/) and watch its edge cases appear, then run them against a function of your own.

```ts
import { test, expect } from 'vitest';
import { dates, withTimeZone } from 'edgegoat';

test.each(dates({ tags: ['dst'] }))('$label', ({ value, zone }) => {
  withTimeZone(zone, () => expect(addDays(value, 1).getHours()).toBe(value.getHours()));
});
```

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/assets/demo.svg" width="760" alt="Animated terminal: a naive isSameYear passes ordinary dates, then fails on the Pacific/Kiritimati and America/New_York New Year cases">
</p>

## Install

```sh
npm install --save-dev edgegoat
```

Node.js 18 or later, or any modern browser (`withTimeZone` needs Node.js).

## Usage

Every generator returns an array of `{ label, value, why, tags }` objects. Zone specific date cases also carry a `zone`.

```ts
import { assertNoThrow, casesFor, numbers, paths, strings } from 'edgegoat';

// Vitest or Jest
test.each(numbers({ tags: ['sign'] }))('$label keeps its sign', ({ value }) => {
  expect(formatNumber(value).startsWith('-')).toBe(value < 0);
});

// Not sure which generator? Pass a sample value.
test.each(casesFor('ana@example.com'))('normalizeEmail($label)', ({ value }) => {
  expect(() => normalizeEmail(value)).not.toThrow();
});

// node:test or Mocha: a plain loop
for (const { label, value } of paths({ tags: ['traversal'] })) {
  test(label, () => assert.throws(() => safeJoin('/srv/app', value)));
}

// One assertion for the whole list
assertNoThrow(slugify, strings());
```

Runnable versions for Vitest, Jest, node:test and Mocha live in [`examples/`](https://github.com/kwy404/edgegoat/blob/main/examples).

## What is included

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

Filter any generator by tags, and pick the zone and year for dates:

```ts
dates({ tags: ['dst'] });                         // only DST gaps and overlaps
dates({ zone: 'Europe/Berlin', year: 2027 });     // any IANA zone, computed at runtime
strings({ tags: ['emoji'], exclude: ['zwj'] });   // tags match any; exclude removes
```

Browse every case on [the website](https://kwy404.github.io/edgegoat/#catalog) or download [catalog.json](https://kwy404.github.io/edgegoat/catalog.json).

## API

| Function | What it does |
| --- | --- |
| `dates()`, `timeZones()`, `strings()`, `numbers()`, `numericStrings()`, `bigints()`, `urls()`, `emails()`, `paths()`, `json()`, `arrays()` | Return the cases. Options: `tags`, `exclude`, plus `zone` and `year` for `dates()`. |
| `generatorFor(sample)` | Names the generator for a kind of value, or `undefined`. Strings are classified by shape: JSON, URL, email, time zone, number, path, plain text. |
| `casesFor(sample, options?)` | The cases for inputs like `sample`. |
| `pick(cases, ...labels)` | Keeps the named cases in order. Throws on a label that does not exist. |
| `values(cases)` | Just the values, for loops and property based testing. |
| `withTimeZone(zone, fn)` | Runs `fn` with `process.env.TZ` set, then restores it, also when `fn` throws. Node.js only. |
| `withFrozenTime(date, fn)` | Freezes `Date.now()` and `new Date()` while `fn` runs, without fake timers. |
| `check(fn, cases, predicate?)` | Returns the cases where `fn` threw or `predicate` returned false. |
| `assertNoThrow(fn, cases)` | Throws one error listing every case where `fn` threw. |

Types: `Case<T>`, `DateCase`, `CaseOptions`, `DateOptions`, `Failure<T>`, `Predicate<T, R>` and `GeneratorName`.

## Bugs these inputs found

Real bugs of this kind, fixed upstream by the author of edgegoat. The library packages the inputs that exposed them.

| Fix | The bug | Cases |
| --- | --- | --- |
| [github/relative-time-element#384](https://github.com/github/relative-time-element/pull/384) | The current year check used UTC instead of the display time zone | `dates({ tags: ['year-boundary'] })` |
| [mozilla/pdf.js#22017](https://github.com/mozilla/pdf.js/pull/22017) | `util.printf` lost the sign of negative numbers greater than -1 | `numbers({ tags: ['sign'] })` |
| [google/budoux#1411](https://github.com/google/budoux/pull/1411) | Segmentation split surrogate pairs | `strings({ tags: ['surrogate'] })` |
| [microsoft/vscode-js-debug#2423](https://github.com/microsoft/vscode-js-debug/pull/2423) | `trimEnd` style truncation split surrogate pairs | `strings({ tags: ['truncation'] })` |
| [salesforce/tough-cookie#644](https://github.com/salesforce/tough-cookie/pull/644) | An infinite max-age has to mean "never expires" | `numbers({ tags: ['infinity'] })` |

## Guides

- [Testing time zones](https://kwy404.github.io/edgegoat/test-timezones-javascript.html)
- [Testing daylight saving time](https://kwy404.github.io/edgegoat/test-daylight-saving-time-jest.html)
- [Unicode strings](https://kwy404.github.io/edgegoat/unicode-test-strings.html)
- [Numbers](https://kwy404.github.io/edgegoat/javascript-number-edge-cases.html)

## Contributing

New cases are welcome when they have broken real code. Every case needs a `why`, and ideally a link to a real bug. See [CONTRIBUTING.md](https://github.com/kwy404/edgegoat/blob/main/CONTRIBUTING.md) and the [changelog](https://github.com/kwy404/edgegoat/blob/main/CHANGELOG.md).

## More from kwy404

<!-- more:start -->
- [Monsoon](https://kwy404.github.io/monsoon/): Utility-first CSS from a CDN with no build step, a whole theme from one seed color.
- [Voodoo.js](https://kwy404.github.io/Voodoo.js/): The HTML first JavaScript framework: reactive directives and JSX in a plain HTML file.
- [breakhound](https://kwy404.github.io/breakhound/): Find bugs in any JavaScript or TypeScript library automatically, no tests required.
- [vueleap](https://kwy404.github.io/vueleap/): Migrate Vue 2 to Vue 3 with one command, with the exact @vue/compat flags you need.
- [graphemely](https://kwy404.github.io/graphemely/): Truncate, slice and count strings with emoji safely, by grapheme cluster.
- [numberparrot](https://kwy404.github.io/numberparrot/): Parse localized number and currency strings back into real numbers, for any locale.
- [cookieowl](https://kwy404.github.io/cookieowl/): Free cookie consent banner for LGPD and GDPR that really blocks trackers before consent.
- [installkite](https://kwy404.github.io/installkite/): Make any website installable and offline capable with one command.
- [a11ymedic](https://kwy404.github.io/a11ymedic/): The accessibility checker that explains every problem and gives the exact fix.
- [fontsketch](https://kwy404.github.io/fontsketch/): Turn your handwriting into a font, free in your browser.
- [kastor](https://kwy404.github.io/kastor/): The TypeScript ORM for PostgreSQL, MySQL, SQLite, SQL Server, Oracle, MongoDB and more.
<!-- more:end -->

## Author

Made by [Alexandre Kohler](https://github.com/kwy404) ([LinkedIn](https://www.linkedin.com/in/alexandre-silva-173687256/)). The website is built with [Monsoon](https://kwy404.github.io/monsoon/), and its interactive parts are built with [Voodoo.js](https://kwy404.github.io/Voodoo.js/).

## License

[MIT](https://github.com/kwy404/edgegoat/blob/main/LICENSE) © 2026 Alexandre Kohler. Ledge the goat walks the edges so your code does not fall off them.
