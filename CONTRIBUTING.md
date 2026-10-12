# Contributing to edgegoat

Thanks for helping. edgegoat is a curated list, so every case has to earn its place.

## Adding a case

1. Pick the generator in `src/generators/` (dates, strings, numbers, urls, emails, paths, json, arrays, time zones).
2. Add one `c(label, value, why, tags, ref?)` entry:
   - **label**: short, unique, ASCII, readable as a test title. Example: `surrogate pair cut by slice(0, 10)`.
   - **value**: the input itself. Write every non ASCII character as an escape (`'\u00A0'`, `'\u{1F600}'`) so nothing invisible hides in the source. A test enforces ASCII only sources.
   - **why**: one sentence, plain ASCII, that names the code that breaks and how. "Breaks things" is not a why; "split(' ') does not treat U+00A0 as a separator" is.
   - **tags**: lowercase words used for filtering. Reuse existing tags when you can.
   - **ref** (optional, but strongly preferred): a link to a real bug, fix or spec section that shows the case matters.
3. If the case makes a claim that can be checked (a parser accepts it, a method returns something surprising), add an assertion for it in `test/`.
4. Run `npm test`, `npm run lint` and `npm run typecheck`.
5. Regenerate the docs catalog with `npm run docs` so the site and the README counts stay in sync.

## What makes a good case

- It has broken real code. A link to a merged fix is the best evidence.
- It is not a duplicate of an existing case with a different value.
- It is deterministic. Date cases are computed from `Intl`, never hard coded offsets.

## Development

```sh
npm install
npm run build
npm test
TZ=Asia/Kathmandu npm test   # the suite must pass in any time zone
```

## Pull requests

Keep pull requests small and focused, describe the bug the case catches, and link it.
By contributing you agree that your contribution is licensed under the MIT License.
