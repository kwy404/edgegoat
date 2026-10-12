# edgegoat examples

| Folder | Runner | How to run |
| --- | --- | --- |
| [`vitest/`](vitest) | Vitest | `npx vitest run examples/vitest` |
| [`jest/`](jest) | Jest (CommonJS) | `npx jest examples/jest` |
| [`node-test/`](node-test) | node:test | `npm run build && npm run examples:node-test` |
| [`mocha/`](mocha) | Mocha | `npx mocha examples/mocha` |
| [`real-world/`](real-world) | Vitest | `npx vitest run examples/real-world` |

`real-world/` holds two bugs of the kind edgegoat was built to catch, each with a naive and a fixed implementation:

- [`format-date.ts`](real-world/format-date.ts): a "hide the year if it is the current year" formatter that compares UTC years, like the bug fixed in github/relative-time-element#384. Every `year-boundary` case from `dates()` breaks the naive version.
- [`truncate.ts`](real-world/truncate.ts): a truncate that cuts by UTF-16 code units and splits surrogate pairs, like the bugs fixed in google/budoux#1411 and microsoft/vscode-js-debug#2423.

The Vitest, node:test and real-world examples run in CI. The Jest and Mocha examples use the published package name, so install edgegoat (and the runner) in your project to run them.
