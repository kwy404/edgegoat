import type { Case, CaseOptions } from '../types';
import { c, filter } from '../internal/build';

const BUDOUX_BUG = 'https://github.com/google/budoux/pull/1411';
const VSCODE_JS_DEBUG_BUG = 'https://github.com/microsoft/vscode-js-debug/pull/2423';

/**
 * String edge cases: whitespace variants, invisible characters, emoji
 * sequences, surrogates, combining marks, bidi text, casing traps, newline
 * variants, injection shaped text and non Latin scripts.
 *
 * Every non ASCII character is written as an escape, so the source stays
 * readable and nothing invisible hides in it.
 *
 * @example
 * test.each(strings({ tags: ['surrogate'] }))('$label', ({ value }) => {
 *   expect(truncate(value, 10).isWellFormed()).toBe(true);
 * });
 */
export function strings(options: CaseOptions = {}): Case<string>[] {
  const cases: Case<string>[] = [
    // Empty and whitespace
    c('empty string', '', 'Falsy, length 0: `if (!name)` and `str[0].toUpperCase()` both misbehave.', ['empty', 'falsy']),
    c('single space', ' ', 'Truthy but blank: passes `if (str)` checks and fails after trim().', ['whitespace', 'blank']),
    c('mixed ASCII whitespace', ' \t\n\r\v\f ', 'Every ASCII whitespace character; trim() returns an empty string but `str.length > 0` validators accept it.', ['whitespace', 'blank']),
    c('no-break space (U+00A0)', 'a\u00A0b', 'Arrives from HTML &nbsp; and copy paste; \\s and trim() treat it as whitespace but split(" ") and many tokenizers do not.', ['whitespace', 'invisible']),
    c('ideographic space (U+3000)', '\u3000\u65E5\u672C\u3000', 'Full width space used in CJK text; trim() removes it, byte based or ASCII only trimming does not.', ['whitespace', 'cjk']),
    c('zero width space (U+200B)', 'foo\u200Bbar', 'Invisible and not whitespace for trim() or \\s, so it looks identical to "foobar" but is not equal to it.', ['invisible', 'zero-width']),
    c('byte order mark prefix (U+FEFF)', '\uFEFFid', 'Left by Windows editors at the start of files: CSV headers become "\\uFEFFid" and JSON.parse of BOM prefixed text throws.', ['invisible', 'bom']),
    c('soft hyphen (U+00AD)', 'co\u00ADoperate', 'Invisible unless a line breaks there, so search and equality fail on text that looks the same.', ['invisible']),
    c('very long string (100000 chars)', 'a'.repeat(100_000), 'Exceeds column and header limits, overflows layouts and exposes quadratic algorithms and backtracking regexes.', ['long']),

    // Emoji and graphemes
    c('emoji outside the BMP (U+1F600)', '\u{1F600}', 'One visible character but length 2 (a surrogate pair); charAt(0) and str[0] return half of it.', ['emoji', 'surrogate', 'grapheme']),
    c(
      'ZWJ family emoji (man, woman, girl, boy)',
      '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}',
      'Seven code points joined by zero width joiners render as one glyph with length 11; splitting by code point shows four people.',
      ['emoji', 'zwj', 'grapheme', 'surrogate'],
    ),
    c('flag emoji (regional indicators B and R)', '\u{1F1E7}\u{1F1F7}', 'A flag is two regional indicator letters; cutting between them leaves letters and reversing them names another country or none.', ['emoji', 'grapheme', 'surrogate']),
    c('skin tone modifier (thumbs up, medium)', '\u{1F44D}\u{1F3FD}', 'Base emoji plus a modifier: one grapheme, two code points, four code units; truncating after the base drops the tone.', ['emoji', 'grapheme', 'surrogate']),
    c('emoji with variation selector (red heart)', '\u2764\uFE0F', 'U+2764 plus U+FE0F: removing "invisible" characters changes emoji presentation, and the base alone is in the BMP.', ['emoji', 'variation-selector', 'grapheme']),
    c('keycap sequence (digit one)', '1\uFE0F\u20E3', 'Starts with an ASCII digit, so /^\\d/ matches what renders as a single keycap symbol.', ['emoji', 'grapheme', 'digits']),

    // Surrogates
    c(
      'surrogate pair cut by slice(0, 10)',
      'abcdefghi\u{1F600}',
      'The emoji starts at index 9, so slice(0, 10) keeps only its high surrogate and produces malformed UTF-16.',
      ['surrogate', 'truncation', 'emoji'],
      BUDOUX_BUG,
    ),
    c(
      'surrogate pair at the end for trimEnd style truncation',
      'Done \u{1F389}',
      'Truncating "to N code units" from the end lands inside the pair; output ends in a lone surrogate that renders as U+FFFD.',
      ['surrogate', 'truncation', 'emoji'],
      VSCODE_JS_DEBUG_BUG,
    ),
    c('lone high surrogate', 'a\uD83Db', 'Malformed UTF-16: encodeURIComponent throws URIError, TextEncoder writes U+FFFD and isWellFormed() is false.', ['surrogate', 'malformed']),
    c('lone low surrogate', '\uDE00', 'A trailing surrogate with no lead: string comparison works but encoding, hashing and JSON round trips through UTF-8 change it.', ['surrogate', 'malformed']),

    // Combining marks and normalization
    c('precomposed e acute (NFC)', 'caf\u00E9', 'Length 4. Compare with the decomposed form: same rendering, different code points.', ['normalization', 'combining']),
    c('decomposed e acute (NFD)', 'cafe\u0301', 'Length 5 and !== the NFC form; macOS file names and some keyboards produce this form. Use normalize() before comparing.', ['normalization', 'combining']),
    c(
      'stacked combining marks',
      'Z\u0351\u036B\u0343\u036A\u0302\u036B\u033D\u034F\u0334\u0319',
      'One base letter with ten combining marks: one grapheme, eleven code units, and rendering that escapes its line box.',
      ['combining', 'grapheme'],
    ),
    c('leading combining mark', '\u0301abc', 'A combining mark with nothing to attach to; it combines with whatever precedes the string after concatenation.', ['combining']),
    c('Hangul syllables (precomposed)', '\uD55C\uAD6D\uC5B4', 'Korean syllable blocks. NFD splits each into two or three jamo, so lengths change after normalization.', ['script', 'normalization', 'cjk']),
    c('Hangul jamo (decomposed)', '\u1112\u1161\u11AB', 'Three jamo that render as one syllable and equal the first syllable of the previous case only after NFC normalization.', ['script', 'normalization', 'combining']),

    // Bidi
    c('right to left text mixed with Latin and digits', 'abc \u05E9\u05DC\u05D5\u05DD 123', 'Hebrew mixed with Latin and numbers: visual order differs from memory order, which breaks cursor math and naive truncation with ellipsis.', ['rtl', 'bidi', 'script']),
    c('Arabic text', '\u0645\u0631\u062D\u0628\u0627', 'Right to left script with contextual letter shapes; per code point styling or splitting breaks the joining.', ['rtl', 'script']),
    c('right to left override (U+202E)', 'invoice\u202Etxt.exe', 'Displays as "invoiceexe.txt": the Trojan Source trick (CVE-2021-42574) for file names and code review.', ['bidi', 'security', 'invisible']),
    c('bidi isolate controls (U+2067, U+2069)', 'user\u2067admin\u2069', 'Invisible directional isolates change display order; strip or escape them in identifiers and logs.', ['bidi', 'invisible', 'security']),

    // Casing
    c('Turkish dotted and dotless i', 'I\u0130\u0131i', 'Capital dotted I lowercases to i plus U+0307 (length grows), and toLocaleLowerCase("tr") maps I to dotless i; case insensitive keys break.', ['casing', 'locale']),
    c('German sharp s', 'stra\u00DFe', 'toUpperCase() gives "STRASSE" (length 6 to 7), so upper and lower case comparisons disagree and length based layouts shift.', ['casing', 'locale']),
    c('Greek final sigma', '\u039F\u0394\u039F\u03A3', 'Lowercasing the whole word yields a final sigma at the end; lowercasing letter by letter does not, so results differ.', ['casing', 'script']),

    // Control and newlines
    c('null character', 'a\u0000b', 'Terminates C strings, is rejected by PostgreSQL text columns and disappears in some loggers.', ['control', 'null']),
    c('CRLF newline', 'line1\r\nline2', 'split("\\n") leaves a trailing "\\r" on each line; Windows files and HTTP headers use this form.', ['newline']),
    c('CR only newline', 'line1\rline2', 'Classic Mac line ending: code that only looks for \\n sees one line.', ['newline']),
    c('line separator (U+2028)', 'a\u2028b', 'A JavaScript line terminator: `.` in a regex does not match it, and it broke inline scripts and JSONP before ES2019.', ['newline', 'invisible']),
    c('paragraph separator (U+2029)', 'a\u2029b', 'Another JavaScript line terminator that most text editors render as nothing; line counting tools disagree about it.', ['newline', 'invisible']),
    c('vertical tab and form feed', 'a\vb\fc', 'Rarely seen whitespace that XML 1.0 forbids and some JSON encoders escape inconsistently.', ['control', 'whitespace']),

    // Injection shaped plain text
    c('HTML markup as text', '<script>alert("x")</script>', 'Must render as literal text; any innerHTML or template without escaping executes it.', ['injection', 'html']),
    c('already escaped HTML', '&lt;b&gt; &amp;amp;', 'Escaping twice shows "&amp;lt;" to users; unescaping on input then escaping on output corrupts it.', ['injection', 'html']),
    c('SQL quote and comment', "Robert'); DROP TABLE Students;--", 'A quote ends a string literal in hand built SQL; also tests that names with apostrophes survive a round trip.', ['injection', 'sql']),
    c('regex metacharacters', '.*+?^${}()|[]\\', 'Passing user text to new RegExp() throws on "(" or matches everything with ".*"; escape it first.', ['injection', 'regex']),
    c('template placeholders', '${7*7} {{7*7}} %s %d', 'Text that looks like template or printf syntax; any second pass through a formatter changes it.', ['injection', 'template']),
    c('__proto__ as a key', '__proto__', 'Used as an object key it sets the prototype instead of a property; use Map or Object.create(null) for user keys.', ['injection', 'prototype']),
    c('the word null', 'null', 'A real surname and a common placeholder: systems that treat "null" as missing lose data.', ['falsy-text']),

    // Digits and scripts
    c('Arabic-Indic digits', '\u0663\u0664', 'Unicode digits: Number() and parseInt return NaN and \\d only matches ASCII 0 to 9, yet users type these.', ['digits', 'rtl']),
    c('full width digits', '\uFF11\uFF12\uFF13', 'Typed by CJK input methods; look like 123 but fail /^\\d+$/ and Number().', ['digits', 'cjk']),
    c('Thai without spaces', '\u0E20\u0E32\u0E29\u0E32\u0E44\u0E17\u0E22', 'Thai writes words without spaces and uses combining vowels; word wrapping and counting need Intl.Segmenter.', ['script', 'combining']),
    c('wide CJK characters', '\u4F60\u597D\uFF01', 'Each character takes two terminal columns, so padEnd based tables and fixed width output misalign.', ['cjk', 'script']),
  ];
  return filter(cases, options);
}
