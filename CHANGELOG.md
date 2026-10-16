# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- `generatorFor(sample)` names the generator for a kind of value: `Date`, number, bigint,
  array, and strings by shape (JSON text, URL, email, IANA time zone, numeric string, path,
  plain text). Returns `undefined` when there is none.
- `casesFor(sample, options?)` returns the edge cases for inputs like `sample`, so
  `test.each(casesFor(user.email))` works without knowing the generator name.
- `pick(cases, ...labels)` keeps the named cases in order and throws on a missing label,
  so a typo never runs zero cases.
- `values(cases)` returns just the values, for loops and property based testing.

## [1.0.0] - 2026-10-13

### Changed

- First stable release. The public API is now covered by semantic versioning: breaking changes only in a new major version.

## [0.1.1] - 2026-10-12

### Changed

- The Portuguese README moved to `i18n/README.pt-BR.md`, so the npm page shows the
  English README only. The package now ships a single README.
- README images and links use absolute URLs, so they render on npmjs.com.
- README badges for npm downloads per month and in total, and a "More from kwy404" section.
- Documentation site redesign: Voodoo.js for the interactive parts (catalog search, generator
  and tag filters, case details, install tabs, theme toggle, copy buttons, FAQ) and
  build time syntax highlighting with Shiki in VS Code Light+ and Dark+ colors.

No changes to the library API or to the cases.

## [0.1.0] - 2026-10-12

### Added

- Generators that return labeled cases (`{ label, value, why, tags }`) ready for `test.each`:
  `dates()`, `timeZones()`, `strings()`, `numbers()`, `numericStrings()`, `bigints()`,
  `urls()`, `emails()`, `paths()`, `json()` and `arrays()`.
- DST gap and overlap instants computed from `Intl` for any IANA zone, with a curated
  default set (America/New_York, America/Sao_Paulo 2018, Europe/London,
  Australia/Lord_Howe, Asia/Kathmandu, Pacific/Kiritimati, Pacific/Pago_Pago).
- Filtering by `tags` and `exclude`, plus `zone` and `year` options for `dates()`.
- Helpers: `withTimeZone()`, `withFrozenTime()`, `check()` and `assertNoThrow()`.
- ESM and CommonJS builds with type declarations, zero runtime dependencies.

[0.1.1]: https://github.com/kwy404/edgegoat/releases/tag/v0.1.1
[0.1.0]: https://github.com/kwy404/edgegoat/releases/tag/v0.1.0
