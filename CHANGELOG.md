# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

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

[0.1.0]: https://github.com/kwy404/edgegoat/releases/tag/v0.1.0
