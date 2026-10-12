import type { Case, CaseOptions } from '../types';
import { c, filter } from '../internal/build';

/**
 * JSON text edge cases (the values are strings to feed to a parser), tagged
 * `valid` or `invalid` according to `JSON.parse`.
 */
export function json(options: CaseOptions = {}): Case<string>[] {
  const depth = 10_000;
  const cases: Case<string>[] = [
    c('deeply nested arrays (10000 levels)', '['.repeat(depth) + ']'.repeat(depth), 'Valid JSON that overflows the stack of recursive walkers, deep equality checks and schema validators.', ['valid', 'deep']),
    c('deeply nested objects (10000 levels)', '{"a":'.repeat(depth) + '1' + '}'.repeat(depth), 'Same as nested arrays for code that recurses into object values, such as deep merge and clone helpers.', ['valid', 'deep']),
    c('duplicate keys', '{"a":1,"a":2}', 'Allowed by JSON.parse, which keeps the last value; other parsers keep the first or reject it, so validators and consumers disagree.', ['valid', 'duplicate-keys', 'security']),
    c('integer above 2^53', '{"id":9007199254740993}', 'Parses to 9007199254740992: IDs silently change. Send large IDs as strings.', ['valid', 'big-number', 'precision']),
    c('huge exponent', '1e400', 'Valid JSON that parses to Infinity, which JSON.stringify then writes as null.', ['valid', 'big-number', 'infinity']),
    c('negative zero', '-0', 'Parses to -0, but JSON.stringify(-0) is "0", so round trips lose the sign.', ['valid', 'sign']),
    c('number with trailing zeros', '1.0', 'Parses to 1 and stringifies as "1": signatures and hashes over JSON text change after a round trip.', ['valid', 'canonical']),
    c('__proto__ key', '{"__proto__":{"isAdmin":true}}', 'JSON.parse creates an own property, but merging the result into another object with assignment pollutes its prototype.', ['valid', 'security', 'prototype']),
    c('empty key', '{"":1}', 'Valid; path based libraries (a.b.c syntax) cannot address it.', ['valid', 'keys']),
    c('escaped lone surrogate', '"\\ud800"', 'Valid JSON that decodes to malformed UTF-16; re-encoding to UTF-8 or a database fails.', ['valid', 'unicode', 'surrogate']),
    c('line and paragraph separators', '"a\u2028b\u2029c"', 'Valid JSON that was invalid in JavaScript string literals before ES2019, which broke JSONP and inline script tags.', ['valid', 'unicode']),
    c('top level string', '"just a string"', 'Valid JSON since RFC 7159; code that assumes an object reads properties of a string.', ['valid', 'scalar']),
    c('top level null', 'null', 'Valid JSON that parses to null; `const { a } = JSON.parse(text)` throws.', ['valid', 'scalar']),
    c('whitespace around value', ' \n\t {"a":1} \r\n', 'Valid; byte or regex based detectors that check the first character for "{" fail.', ['valid', 'whitespace']),
    c('byte order mark prefix', '\uFEFF{"a":1}', 'Windows tools write a BOM; JSON.parse throws on it, so strip it when reading files.', ['invalid', 'bom']),
    c('trailing comma', '[1,2,]', 'Accepted by JavaScript and JSON5, rejected by JSON.parse.', ['invalid', 'syntax']),
    c('comments', '{"a":1 /* note */}', 'Common in config files (JSONC) but invalid JSON.', ['invalid', 'syntax']),
    c('single quotes', "{'a':1}", 'JavaScript object syntax, not JSON.', ['invalid', 'syntax']),
    c('NaN literal', '{"a":NaN}', 'Python json.dumps writes NaN by default, and JSON.parse rejects it.', ['invalid', 'nan']),
    c('unquoted key', '{a:1}', 'JavaScript object literal syntax that JSON does not allow.', ['invalid', 'syntax']),
    c('empty text', '', 'An empty response body is not JSON; JSON.parse("") throws "Unexpected end of JSON input".', ['invalid', 'empty']),
    c('raw control character in string', '"a\tb"', 'Unescaped tab inside a string is invalid JSON even though it looks harmless.', ['invalid', 'control']),
  ];
  return filter(cases, options);
}
