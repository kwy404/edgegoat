// Content of the guide pages in docs/. Each guide targets one search intent:
// the bug explained, a naive implementation that fails, and the edgegoat test
// that catches it. Rendered by scripts/build-docs.mjs.

const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const code = (text, lang = 'js') => `<pre><code class="language-${lang}">${esc(text.trim())}</code></pre>`;
const fails = (text) => `<div class="callout callout-danger"><p class="callout-title">Fails on</p><p>${text}</p></div>`;
const tip = (text) => `<div class="callout callout-info"><p class="callout-title">Note</p><p>${text}</p></div>`;

export const GUIDES = [
  {
    slug: 'test-timezones-javascript.html',
    nav: 'Time zones',
    title: 'How to test time zones in JavaScript (Node, Vitest, Jest) | edgegoat',
    description:
      'Test JavaScript date code in any time zone: run tests under TZ, switch zones per test with withTimeZone, and catch New Year and UTC offset bugs with ready made edge cases.',
    h1: 'How to test time zones in JavaScript',
    about: ['time zones', 'JavaScript Date', 'Intl.DateTimeFormat', 'unit testing'],
    lede: 'Most date bugs are invisible in the time zone of the developer who wrote the code. The fix is to run the same assertions in zones that disagree with UTC, at the instants where they disagree the most: local midnight and New Year.',
    sections: [
      [
        'The bug: deciding "this year" in UTC',
        `<p>GitHub's <code>&lt;relative-time&gt;</code> element hides the year for dates in the current year ("Mar 4") and shows it otherwise ("Mar 4, 2025"). The check compared years in UTC instead of in the display time zone, so around New Year the year was shown or hidden incorrectly. It was fixed in <a href="https://github.com/github/relative-time-element/pull/384">github/relative-time-element#384</a>.</p>
<p>The window is not small. At <code>2025-12-31T10:00:00Z</code> it is already 2026 in Pacific/Kiritimati (UTC+14:00), and at <code>2026-01-01T03:00:00Z</code> it is still 2025 in New York. Every zone away from UTC has hours each year where the local year and the UTC year disagree.</p>`,
      ],
      [
        'A naive implementation that fails',
        code(`
// Shows "Dec 31" for dates in the current year and "Dec 31, 2025" otherwise.
function formatShort(date, timeZone) {
  const sameYear = date.getUTCFullYear() === new Date().getUTCFullYear();
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  }).format(date);
}`),
      ],
      [
        'The edgegoat test that catches it',
        `<p><code>dates({ tags: ['year-boundary'] })</code> returns, for each zone, the instant where the local year and the UTC year disagree. Freeze "now" at that instant and format a date one hour away, on the other side of the local New Year:</p>
${code(`
import { expect, test } from 'vitest';
import { dates, withFrozenTime } from 'edgegoat';

const HOUR = 3_600_000;
const yearIn = (d, timeZone) => new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric' }).format(d);
const edges = dates({ tags: ['year-boundary'] }).filter((c) => c.zone);

test.each(edges)('$label', ({ value, zone }) => {
  const before = new Date(value.getTime() - HOUR);
  const after = new Date(value.getTime() + HOUR);
  const other = yearIn(before, zone) !== yearIn(value, zone) ? before : after;
  const out = withFrozenTime(value, () => formatShort(other, zone));
  expect(out).toContain(yearIn(other, zone));
});`)}
${fails('Pacific/Kiritimati, Asia/Kathmandu, Australia/Lord_Howe, America/New_York, America/Sao_Paulo and Pacific/Pago_Pago. The fix compares <code>yearIn(date, zone)</code> with <code>yearIn(new Date(), zone)</code>.')}
<p>The same test lives in the repository as a runnable example: <a href="https://github.com/kwy404/edgegoat/tree/main/examples/real-world">examples/real-world</a>.</p>`,
      ],
      [
        'Run the whole suite in another time zone',
        `<p>The <code>TZ</code> environment variable sets the zone of a Node.js process. Run your existing suite under zones with unusual offsets; most suites that only ever ran in UTC will fail somewhere.</p>
${code(`
TZ=Asia/Kathmandu npx vitest run
TZ=Pacific/Kiritimati npx jest

# Windows PowerShell
$env:TZ = 'Asia/Kathmandu'; npx vitest run`, 'sh')}
<p>In CI, add a matrix entry per zone. edgegoat's own workflow runs the suite in UTC, America/Sao_Paulo and Asia/Kathmandu:</p>
${code(`
strategy:
  matrix:
    tz: [UTC, America/Sao_Paulo, Asia/Kathmandu]
env:
  TZ: \${{ matrix.tz }}`, 'yaml')}`,
      ],
      [
        'Switch zones inside a single test',
        `<p><code>withTimeZone(zone, fn)</code> sets <code>process.env.TZ</code>, verifies that the runtime applied it, runs <code>fn</code> and restores the previous zone, also when <code>fn</code> throws or returns a rejected promise.</p>
${code(`
import { withTimeZone } from 'edgegoat';

withTimeZone('Asia/Kathmandu', () => {
  new Date('2026-01-01T00:00:00Z').getTimezoneOffset(); // -345
});`)}
${tip('The zone is process wide, so do not combine <code>withTimeZone</code> with <code>test.concurrent</code>. In browsers it throws, because a page cannot change its own time zone; launch the browser in the zone instead (for example Playwright\'s <code>timezoneId</code> option).')}`,
      ],
      [
        'Which time zones to test',
        `<ul>
<li><strong>UTC</strong>: the control. Bugs hide here, which is why CI that only runs in UTC misses them.</li>
<li><strong>America/New_York</strong> and <strong>Pacific/Pago_Pago</strong> (UTC-11:00): local dates lag behind UTC.</li>
<li><strong>Pacific/Kiritimati</strong> (UTC+14:00): local dates run ahead; first place to reach New Year.</li>
<li><strong>Asia/Kathmandu</strong> (UTC+05:45) and <strong>Asia/Kolkata</strong> (UTC+05:30): offsets that are not whole hours.</li>
<li><strong>Australia/Lord_Howe</strong>: DST that shifts by 30 minutes.</li>
<li><strong>America/Sao_Paulo</strong> before 2019: DST changes at midnight, so some days had no 00:00.</li>
</ul>
<p><code>timeZones()</code> returns 18 such zones, each with the reason it is interesting.</p>`,
      ],
    ],
    faq: [
      ['How do I test time zones in JavaScript?', 'Run the same date assertions under several time zones, either for the whole process with the <code>TZ</code> environment variable or per test with <code>withTimeZone()</code>, and feed them instants where local and UTC dates disagree, such as the <code>year-boundary</code> cases from <code>dates()</code>.'],
      ['Can I change the time zone of a running Node.js process?', 'Yes. Assigning <code>process.env.TZ</code> makes Node.js reset its cached zone, so later <code>Date</code> and <code>Intl</code> calls use the new one. Deleting the variable does not reset it, which is why <code>withTimeZone()</code> switches back explicitly.'],
      ['How do I set the time zone in browser tests?', 'A page cannot change its own zone at runtime. Launch the browser in the zone: Playwright has a <code>timezoneId</code> option, and Chrome DevTools Protocol has <code>Emulation.setTimezoneOverride</code>.'],
      ['Why do my date tests pass locally and fail in CI?', 'CI runners usually run in UTC while your machine does not, so dates near midnight or New Year land on different days. Pin <code>TZ</code> in CI and add matrix entries with zones far from UTC.'],
    ],
  },
  {
    slug: 'test-daylight-saving-time-jest.html',
    nav: 'DST in Jest',
    title: 'How to test daylight saving time in Jest (and Vitest) | edgegoat',
    description:
      'Test DST transitions in Jest: real spring forward gaps and fall back overlaps for New York, London, Sao Paulo and Lord Howe, computed from Intl, plus mocking the date without fake timers.',
    h1: 'How to test daylight saving time in Jest',
    about: ['daylight saving time', 'Jest', 'Vitest', 'JavaScript Date'],
    lede: 'Twice a year a local day is 23 or 25 hours long, a wall clock time is skipped or repeated, and code that treats a day as 86,400,000 milliseconds drifts by an hour.',
    sections: [
      [
        'The bug: one day is not always 24 hours',
        `<p>On 2026-03-08 in New York, clocks jump from 02:00 to 03:00. That local day lasts 23 hours. On 2026-11-01 they fall back from 02:00 to 01:00, so 01:30 happens twice and the day lasts 25 hours. Reminders, recurring events, "same time tomorrow" and date pickers all break here.</p>
<p>Some zones are stranger: Australia/Lord_Howe shifts by 30 minutes, and America/Sao_Paulo used to change at midnight, so on 2018-11-04 local midnight did not exist and <code>new Date(2018, 10, 4)</code> returns 01:00.</p>`,
      ],
      [
        'A naive implementation that fails',
        code(`
// Same time tomorrow, or so it seems.
function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}`),
      ],
      [
        'The edgegoat test that catches it',
        `<p><code>dates({ tags: ['dst'] })</code> returns the last instant before each spring forward, the first instant after it, and both occurrences of the repeated time at each fall back, for every zone. Each case carries its <code>zone</code>:</p>
${code(`
const { dates, withTimeZone } = require('edgegoat');

describe('addDays keeps the wall clock time', () => {
  test.each(dates({ tags: ['dst'] }))('$label', ({ value, zone }) => {
    withTimeZone(zone, () => {
      const next = addDays(value, 1);
      expect([next.getHours(), next.getMinutes()]).toEqual([value.getHours(), value.getMinutes()]);
    });
  });
});`)}
${fails('every case whose next 24 hours cross a transition, for example "America/New_York 2026: 1 ms before spring forward" (01:59 becomes 02:59) and "fall back, first 01:30" (01:30 becomes 00:30).')}
<p>The fix is to move the calendar date and let the engine resolve the wall clock time:</p>
${code(`
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}`)}`,
      ],
      [
        'Set the time zone for the whole Jest run',
        `${code(`
TZ=America/New_York npx jest`, 'sh')}
<p>Or set it once in a global setup file so every worker inherits it:</p>
${code(`
// jest.config.js
module.exports = { globalSetup: './jest.global-setup.js' };

// jest.global-setup.js
module.exports = async () => {
  process.env.TZ = 'America/New_York';
};`)}`,
      ],
      [
        'Mock the current date during a DST change',
        `<p>To test code that reads "now", freeze the clock at a DST instant. <code>withFrozenTime</code> needs no fake timers, and it nests inside <code>withTimeZone</code>:</p>
${code(`
const { dates, withFrozenTime, withTimeZone } = require('edgegoat');

for (const { label, value, zone } of dates({ tags: ['overlap'] })) {
  test(label, () => {
    withTimeZone(zone, () =>
      withFrozenTime(value, () => {
        expect(minutesUntilMidnight()).toBeGreaterThan(0);
      }),
    );
  });
}`)}
<p>With Jest's own fake timers the equivalent is <code>jest.useFakeTimers({ now: value })</code>.</p>`,
      ],
    ],
    faq: [
      ['How do I test daylight saving time in Jest?', 'Use real transition instants (<code>dates({ tags: [\'dst\'] })</code>), run each one in its zone with <code>withTimeZone()</code> or by starting Jest with <code>TZ</code>, and assert on local wall clock values, not on millisecond differences.'],
      ['How do I mock the date in Jest during a DST change?', 'Either <code>jest.useFakeTimers({ now: date })</code>, or <code>withFrozenTime(date, fn)</code> from edgegoat, which only replaces <code>Date</code> and leaves timers alone. Combine it with <code>withTimeZone()</code> to control the zone too.'],
      ['Are the DST instants hard coded?', 'No. edgegoat scans UTC offsets with <code>Intl.DateTimeFormat</code> and binary searches each change down to the minute, so the instants match the tz database of the runtime. Its test suite checks that every case is a real transition.'],
      ['Which zones have unusual DST rules?', 'Australia/Lord_Howe shifts by 30 minutes, Antarctica/Troll by two hours, America/Sao_Paulo switched at midnight until 2019, and the tz database models Europe/Dublin with a negative DST save.'],
    ],
  },
  {
    slug: 'unicode-test-strings.html',
    nav: 'Unicode strings',
    title: 'Unicode test strings for JavaScript: emoji, surrogate pairs, RTL | edgegoat',
    description:
      'Ready to use unicode test strings for JavaScript: ZWJ emoji, flags, lone surrogates, NFC vs NFD, bidi controls, invisible spaces and Turkish i, each with the reason it breaks code.',
    h1: 'Unicode test strings for JavaScript',
    about: ['Unicode', 'UTF-16', 'surrogate pairs', 'JavaScript strings'],
    lede: 'JavaScript strings are sequences of UTF-16 code units, not characters. Anything that slices, counts, reverses or compares text by code unit will eventually split an emoji or treat two identical looking strings as different.',
    sections: [
      [
        'The bug: cutting a surrogate pair in half',
        `<p>Characters outside the Basic Multilingual Plane, including most emoji, take two code units (a surrogate pair). <code>slice</code>, <code>substring</code> and <code>str[i]</code> do not know that. Cut between the two halves and you get a lone surrogate: it renders as a replacement character, <code>encodeURIComponent</code> throws <code>URIError</code>, and some databases reject the text.</p>
<p>Real bugs of this kind were fixed in <a href="https://github.com/google/budoux/pull/1411">google/budoux#1411</a> (do not split surrogate pairs) and <a href="https://github.com/microsoft/vscode-js-debug/pull/2423">microsoft/vscode-js-debug#2423</a> (avoid splitting surrogate pairs in trimEnd).</p>`,
      ],
      [
        'A naive implementation that fails',
        code(`
function truncate(text, max) {
  return text.length <= max ? text : text.slice(0, max) + '...';
}`),
      ],
      [
        'The edgegoat test that catches it',
        `${code(`
import { expect, test } from 'vitest';
import { check, strings } from 'edgegoat';

test('truncate never produces malformed UTF-16', () => {
  const inputs = strings({ exclude: ['malformed'] });
  const failures = check((s) => truncate(s, 10), inputs, (out) => out.isWellFormed());
  expect(failures.map((f) => f.label)).toEqual([]);
});`)}
${fails('<code>surrogate pair cut by slice(0, 10)</code>: the emoji starts at index 9. Other lengths also break the ZWJ family, flag and skin tone cases. (<code>isWellFormed</code> needs Node.js 20; older versions can use a regex.)')}
<p>The fix walks grapheme clusters with <code>Intl.Segmenter</code>:</p>
${code(`
function truncate(text, max) {
  if (text.length <= max) return text;
  let out = '';
  for (const { segment } of new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)) {
    if (out.length + segment.length > max) break;
    out += segment;
  }
  return out + '...';
}`)}`,
      ],
      [
        'What strings() contains',
        `<ul>
<li><strong>Whitespace and invisible characters</strong>: no-break space, ideographic space, zero width space, byte order mark, soft hyphen.</li>
<li><strong>Emoji and graphemes</strong>: ZWJ family, regional indicator flags, skin tone modifiers, variation selectors, keycaps.</li>
<li><strong>Surrogates</strong>: a pair at a cut boundary, lone high and low surrogates.</li>
<li><strong>Normalization</strong>: NFC vs NFD accents, Hangul syllables vs jamo, stacked combining marks.</li>
<li><strong>Bidirectional text</strong>: Hebrew and Arabic mixed with Latin, the right to left override used by Trojan Source, bidi isolates.</li>
<li><strong>Casing</strong>: Turkish dotted and dotless i, German sharp s, Greek final sigma.</li>
<li><strong>Newlines and control characters</strong>: CRLF, CR, U+2028, U+2029, NUL, vertical tab.</li>
<li><strong>Injection shaped text</strong>: HTML, SQL quotes, regex metacharacters, template placeholders, <code>__proto__</code>.</li>
<li><strong>Digits and scripts</strong>: Arabic-Indic and full width digits, Thai without spaces, wide CJK characters.</li>
</ul>
<p>Every value is written with escapes in the source, so the catalog shows emoji as code points such as <code>\\u{1F600}</code>, never as hidden glyphs. Filter with tags, for example <code>strings({ tags: ['emoji', 'bidi'] })</code>.</p>`,
      ],
    ],
    faq: [
      ['What are good unicode test strings?', 'Strings that break assumptions about length, equality and display: emoji outside the BMP, ZWJ sequences, NFC vs NFD pairs, right to left text, invisible spaces, lone surrogates and locale sensitive casing. <code>strings()</code> returns 49 of them with the reason each one breaks code.'],
      ['What is a surrogate pair?', 'UTF-16 encodes code points above U+FFFF as two 16 bit code units, a high surrogate followed by a low surrogate. JavaScript string indexes count code units, so one emoji has <code>length</code> 2 and can be cut in half.'],
      ['How do I count characters in a JavaScript string?', '<code>s.length</code> counts UTF-16 code units, <code>[...s].length</code> counts code points, and <code>[...new Intl.Segmenter().segment(s)].length</code> counts grapheme clusters, which is what users perceive as characters.'],
      ['How is this different from the big list of naughty strings?', 'The big list of naughty strings is a large raw list, great for fuzzing. edgegoat is smaller and curated: every string has a label, a one line reason and tags, plus typed generators for dates, numbers and URLs. They work well together.'],
    ],
  },
  {
    slug: 'javascript-number-edge-cases.html',
    nav: 'Number edge cases',
    title: 'JavaScript number edge cases for tests: -0, NaN, Infinity, 2^53 | edgegoat',
    description:
      'Test JavaScript number handling with -0, NaN, Infinity, MAX_SAFE_INTEGER + 1, 0.1 + 0.2, 1e21 and values between -1 and 0, plus numeric strings and BigInt limits.',
    h1: 'JavaScript number edge cases to test',
    about: ['JavaScript numbers', 'IEEE 754', 'NaN', 'negative zero'],
    lede: 'A JavaScript number is an IEEE 754 double. That gives you two zeros, a value that is not equal to itself, two infinities, and integers that stop being exact after 2^53.',
    sections: [
      [
        'The bug: losing the sign between -1 and 0',
        `<p>A formatter that prints the integer part and the fraction separately works for -1.5 and 0.5, but not for -0.5: the integer part of -0.5 is -0, and <code>String(-0)</code> is <code>"0"</code>. pdf.js had exactly this bug in <code>util.printf</code>, fixed in <a href="https://github.com/mozilla/pdf.js/pull/22017">mozilla/pdf.js#22017</a>.</p>`,
      ],
      [
        'A naive implementation that fails',
        code(`
function formatFixed(n, digits) {
  const int = Math.trunc(n);
  const frac = Math.abs(n - int).toFixed(digits).slice(1); // ".50"
  return String(int) + frac;
}

formatFixed(-0.5, 2); // "0.50", expected "-0.50"`),
      ],
      [
        'The edgegoat test that catches it',
        `${code(`
import { expect, test } from 'vitest';
import { numbers } from 'edgegoat';

test.each(numbers({ tags: ['sign', 'negative'] }))('$label keeps its sign', ({ value }) => {
  expect(formatFixed(value, 2).startsWith('-')).toBe(value < 0);
});`)}
${fails('<code>-0.5</code>, <code>-0.0001</code> and <code>-1e-7</code>: each truncates to -0, which prints as 0. A sign aware version formats <code>Math.abs(n)</code> and prefixes the minus sign when <code>n &lt; 0</code>.')}`,
      ],
      [
        'Infinity is a real value',
        `<p>Infinity shows up as a "never expires" or "no limit" sentinel. tough-cookie had to treat an infinite max-age as a cookie that never expires (<a href="https://github.com/salesforce/tough-cookie/pull/644">salesforce/tough-cookie#644</a>). Elsewhere it overflows: <code>setTimeout(fn, Infinity)</code> fires after about 1 ms in Node.js, because delays that do not fit in 32 bits are reset to 1, and <code>JSON.stringify(Infinity)</code> is <code>"null"</code>.</p>`,
      ],
      [
        'What numbers() contains',
        `<ul>
<li>Zeros and signs: <code>0</code>, <code>-0</code>, <code>-0.5</code>, <code>-0.0001</code>, <code>-1e-7</code>.</li>
<li>Special values: <code>NaN</code>, <code>Infinity</code>, <code>-Infinity</code>.</li>
<li>Limits: <code>MAX_SAFE_INTEGER</code> and its neighbors, <code>MIN_SAFE_INTEGER - 1</code>, <code>MAX_VALUE</code>, <code>MIN_VALUE</code>, <code>EPSILON</code>, <code>2^31</code>, <code>2^32</code>.</li>
<li>Rounding and formatting: <code>0.1 + 0.2</code>, <code>1.005</code>, <code>0.5</code>, <code>1e21</code>, <code>1e-7</code>.</li>
</ul>
<p><code>numericStrings()</code> adds inputs like <code>""</code>, <code>"1e3"</code>, <code>"0x1A"</code>, <code>"1,5"</code> and <code>"9007199254740993"</code>, where <code>Number</code>, <code>parseInt</code> and <code>parseFloat</code> disagree. <code>bigints()</code> covers the int64 and uint64 limits.</p>`,
      ],
    ],
    faq: [
      ['Why is 0.1 + 0.2 not 0.3 in JavaScript?', 'Neither 0.1 nor 0.2 has an exact binary representation, so their sum is 0.30000000000000004. Compare with a tolerance, or keep money in integer cents.'],
      ['What is the largest safe integer in JavaScript?', '<code>Number.MAX_SAFE_INTEGER</code>, 2^53 - 1 (9007199254740991). Above it, consecutive integers can no longer all be represented, so <code>2 ** 53 + 1 === 2 ** 53</code>. Use BigInt or strings for 64 bit IDs.'],
      ['How do I check for NaN?', 'Use <code>Number.isNaN(x)</code>. The global <code>isNaN</code> converts its argument first, so <code>isNaN("abc")</code> is true, and <code>x === NaN</code> is always false.'],
      ['Why does 1e21 print in exponent notation?', '<code>Number.prototype.toString</code> switches to exponent notation for magnitudes of 1e21 and above and below 1e-6, so <code>String(1e21)</code> is <code>"1e+21"</code> and digit only checks fail.'],
    ],
  },
  {
    slug: 'test-dates-before-1970.html',
    nav: 'Dates before 1970',
    title: 'Testing dates before 1970 in JavaScript (negative timestamps) | edgegoat',
    description:
      'Dates before the Unix epoch have negative timestamps, and fractional seconds round the wrong way with Math.trunc and %. Test pre-1970 dates, local mean time and year 0 with edgegoat.',
    h1: 'Testing dates before 1970 in JavaScript',
    about: ['Unix epoch', 'negative timestamps', 'JavaScript Date'],
    lede: 'JavaScript dates reach 271,821 years before 1970, yet a lot of code quietly assumes timestamps are positive. One negative timestamp with a fraction of a second is usually enough to show it.',
    sections: [
      [
        'The bug: negative milliseconds round toward zero',
        `<p><code>new Date(-1500)</code> is <code>1969-12-31T23:59:58.500Z</code>, one and a half seconds before the epoch. <code>Math.trunc(-1.5)</code> is -1, not -2, and <code>-1500 % 1000</code> is -500, not 500. Code that splits a timestamp into seconds and a fraction with truncation and <code>%</code> gets 23:59:59 and a negative fraction.</p>`,
      ],
      [
        'A naive implementation that fails',
        `<p>Protocol Buffers and many APIs encode time as <code>{ seconds, nanos }</code> where <code>nanos</code> must be between 0 and 999,999,999:</p>
${code(`
function toTimestamp(date) {
  const ms = date.getTime();
  return { seconds: Math.trunc(ms / 1000), nanos: (ms % 1000) * 1e6 };
}

toTimestamp(new Date(-1500)); // { seconds: -1, nanos: -500000000 }  invalid`)}`,
      ],
      [
        'The edgegoat test that catches it',
        `${code(`
import { expect, test } from 'vitest';
import { dates } from 'edgegoat';

test.each(dates({ tags: ['pre-1970', 'epoch'] }))('$label', ({ value }) => {
  const { seconds, nanos } = toTimestamp(value);
  expect(nanos).toBeGreaterThanOrEqual(0);
  expect(nanos).toBeLessThan(1e9);
  expect(seconds * 1000 + nanos / 1e6).toBe(value.getTime());
});`)}
${fails('<code>1 ms before the epoch</code>, <code>before 1970 with fractional seconds</code> and <code>moon landing 1969-07-20T20:17:40.123Z</code>. The fix floors: <code>const seconds = Math.floor(ms / 1000)</code> and <code>nanos = (ms - seconds * 1000) * 1e6</code>.')}`,
      ],
      [
        'Local mean time before time zones existed',
        `<p>Before standard time zones were adopted, each city kept its own local mean time. The tz database records offsets with seconds, such as -03:06:28 for Sao Paulo before 1914. <code>getTimezoneOffset()</code> reports whole minutes, so local arithmetic on old dates can drift by seconds. The <code>lmt</code> case in <code>dates()</code> covers it.</p>`,
      ],
      [
        'Year 0, negative years and the far edges',
        `<p><code>dates()</code> also includes year 0, year -1 (<code>-000001</code> in ISO format), the minimum and maximum valid dates (plus and minus 8.64e15 ms), year 9999 and year 10000, where <code>toISOString()</code> switches to a six digit, signed year.</p>
${tip('<code>new Date(0, 0, 1)</code> is 1900, not year 0: the Date constructor maps years 0 to 99 to 1900 to 1999. Use <code>setFullYear</code> to build early years.')}`,
      ],
    ],
    faq: [
      ['Can JavaScript Date represent dates before 1970?', 'Yes. A Date stores milliseconds since 1970-01-01T00:00:00Z as a signed number, so earlier dates are negative. The valid range is -271821-04-20 to +275760-09-13.'],
      ['Why is my pre-1970 timestamp off by one second?', 'Truncation rounds negative values toward zero. Use <code>Math.floor</code> for the seconds and compute the remainder from it, so the fraction stays positive.'],
      ['Why does a date in 1850 have a strange UTC offset?', 'Before standard time, zones used local mean time, with offsets such as -03:06:28. <code>Intl</code> reports them exactly, <code>getTimezoneOffset()</code> in whole minutes.'],
      ['Does new Date(0, 0, 1) give year 0?', 'No. Years 0 to 99 passed to the Date constructor or <code>Date.UTC</code> become 1900 to 1999. Call <code>setFullYear(0, 0, 1)</code> instead.'],
    ],
  },
  {
    slug: 'javascript-negative-zero.html',
    nav: 'Negative zero',
    title: 'Negative zero in JavaScript: why -0 is not 0 and how to test it | edgegoat',
    description:
      '-0 === 0 is true, yet 1 / -0 is -Infinity and Object.is(-0, 0) is false. Learn where -0 comes from, which code it breaks, and how to test it.',
    h1: 'Negative zero in JavaScript: why -0 is different from 0',
    about: ['negative zero', 'IEEE 754', 'JavaScript numbers'],
    lede: 'IEEE 754 numbers carry a sign bit even for zero. JavaScript hides it in most places and exposes it in a few, and that inconsistency is exactly what turns into a bug.',
    sections: [
      [
        'Where -0 comes from',
        `<ul>
<li>Rounding small negatives: <code>Math.round(-0.4)</code>, <code>Math.trunc(-0.5)</code>, <code>Math.ceil(-0.5)</code>.</li>
<li>Arithmetic: <code>-1 % 1</code>, <code>-0.5 * 0</code>, <code>0 / -5</code>.</li>
<li>Parsing: <code>Number("-0")</code> and <code>JSON.parse("-0")</code>.</li>
</ul>`,
      ],
      [
        'Where it shows up',
        `<ul>
<li><code>1 / -0</code> is <code>-Infinity</code> and <code>Math.atan2(0, -0)</code> is pi.</li>
<li><code>Object.is(-0, 0)</code> is false, so React state, memoization and <code>Object.is</code> based equality treat them as different.</li>
<li><code>String(-0)</code> and <code>JSON.stringify(-0)</code> print <code>"0"</code>, but <code>Intl.NumberFormat</code> and <code>toLocaleString()</code> print <code>"-0"</code>.</li>
</ul>`,
      ],
      [
        'The bug: "-0" on screen',
        `<p>A change indicator rounds a tiny negative delta to zero, and <code>Intl.NumberFormat</code> keeps the sign. Users see <code>-0</code>.</p>
${code(`
function formatDelta(n) {
  return (n > 0 ? '+' : '') + new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(n);
}

formatDelta(-0.04); // "-0"`)}`,
      ],
      [
        'The edgegoat test that catches it',
        `${code(`
import { expect, test } from 'vitest';
import { numbers } from 'edgegoat';

test.each(numbers({ tags: ['zero', 'sign'] }))('$label', ({ value }) => {
  expect(formatDelta(value)).not.toBe('-0');
});`)}
${fails('<code>negative zero</code> and <code>-0.0001</code>. The fix is <code>signDisplay: \'exceptZero\'</code>, which prints <code>+0.5</code>, <code>-0.5</code> and a plain <code>0</code>.')}`,
      ],
    ],
    faq: [
      ['Why is -0 different from 0?', 'Floating point numbers store a sign bit separately from the magnitude, so zero can be positive or negative. <code>===</code> treats them as equal, but division, <code>Object.is</code>, <code>Math.atan2</code> and <code>Intl</code> formatting can tell them apart.'],
      ['How do I check for negative zero in JavaScript?', 'Use <code>Object.is(x, -0)</code>, or <code>x === 0 &amp;&amp; 1 / x === -Infinity</code> in older code.'],
      ['Does JSON keep negative zero?', '<code>JSON.parse("-0")</code> returns -0, but <code>JSON.stringify(-0)</code> returns <code>"0"</code>, so a round trip loses the sign.'],
      ['How do I get rid of -0?', 'Add zero (<code>x + 0</code>) or write <code>x === 0 ? 0 : x</code>. For display, <code>Intl.NumberFormat</code> with <code>signDisplay: \'exceptZero\'</code> or <code>\'negative\'</code> avoids printing it.'],
    ],
  },
  {
    slug: 'mock-date-javascript.html',
    nav: 'Mock Date',
    title: 'How to mock Date in JavaScript tests without fake timers | edgegoat',
    description:
      'Freeze new Date() and Date.now() in Vitest, Jest, node:test or Mocha with a tiny helper, combine it with a time zone, and test New Year and DST edge instants.',
    h1: 'How to mock Date in JavaScript tests',
    about: ['mocking', 'JavaScript Date', 'Jest', 'Vitest'],
    lede: 'Code that reads the current time is untestable until you control the clock. You do not always need fake timers: often you only need new Date() to return one specific edge instant.',
    sections: [
      [
        'Freeze the clock for one function call',
        `${code(`
import { withFrozenTime } from 'edgegoat';

withFrozenTime('2026-12-31T23:59:59.999Z', () => {
  Date.now();         // 1798761599999
  new Date();         // 2026-12-31T23:59:59.999Z
  new Date(2020, 0);  // still works normally
});`)}
<p>It accepts a Date, an ISO string or a timestamp, works with any test runner, restores the real <code>Date</code> afterwards (also when the function throws or its promise rejects) and leaves timers alone.</p>`,
      ],
      [
        'The bug: "is this today?" in UTC',
        `${code(`
function isToday(date) {
  return date.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);
}`)}
<p>It compares UTC calendar days. At 23:30 in New York, 00:30 the same evening is "yesterday" in UTC terms. Test it with the clock frozen late in the evening, in every zone from <code>timeZones()</code>:</p>
${code(`
import { expect, test } from 'vitest';
import { timeZones, withFrozenTime, withTimeZone } from 'edgegoat';

test.each(timeZones())('$label', ({ value: zone }) => {
  withTimeZone(zone, () => {
    const now = new Date(2026, 11, 31, 23, 30);
    const earlierToday = new Date(2026, 11, 31, 0, 30);
    withFrozenTime(now, () => expect(isToday(earlierToday)).toBe(true));
  });
});`)}
${fails('every zone with a non zero offset at that moment, from Pacific/Pago_Pago to Pacific/Kiritimati. Only UTC-like zones pass. The fix compares local fields or formats both dates with <code>Intl.DateTimeFormat</code> in the user\'s zone.')}`,
      ],
      [
        'How it works, and its limits',
        `<p><code>withFrozenTime</code> swaps <code>globalThis.Date</code> for a thin wrapper whose prototype is the real one, so <code>instanceof Date</code>, <code>Date.UTC</code>, <code>Date.parse</code>, subclasses and <code>new Date(value)</code> keep working. Only <code>Date.now()</code>, <code>new Date()</code> and <code>Date()</code> are frozen.</p>
${tip('Code that captured <code>Date</code> or <code>Date.now</code> before the call still sees real time, and <code>performance.now()</code> and timers are not touched. When you need to advance time or run timers, use your runner\'s fake timers instead.')}`,
      ],
      [
        'When to use fake timers instead',
        `<ul>
<li>Jest: <code>jest.useFakeTimers({ now: date })</code> or <code>jest.setSystemTime(date)</code>.</li>
<li>Vitest: <code>vi.useFakeTimers()</code> then <code>vi.setSystemTime(date)</code>.</li>
<li>node:test: <code>mock.timers</code> in recent Node.js versions, including the <code>Date</code> API.</li>
</ul>
<p>Fake timers are the right tool for debounce, intervals and timeouts. For "what does this function do at 23:59:59.999 on New Year's Eve", a frozen clock is simpler.</p>`,
      ],
    ],
    faq: [
      ['How do I mock new Date() in Jest?', 'Use <code>jest.useFakeTimers({ now: date })</code>, or <code>withFrozenTime(date, fn)</code> from edgegoat if you only need a fixed "now" without fake timers.'],
      ['How do I mock Date.now() in Vitest?', '<code>vi.setSystemTime(date)</code> with fake timers enabled. <code>vi.spyOn(Date, \'now\')</code> only covers <code>Date.now()</code>, while <code>withFrozenTime</code> also freezes <code>new Date()</code>.'],
      ['Does withFrozenTime affect setTimeout?', 'No. It only replaces <code>Date</code>. Timers, <code>performance.now()</code> and the event loop run normally.'],
      ['Can I freeze time and change the time zone together?', 'Yes. Nest them: <code>withTimeZone(zone, () =&gt; withFrozenTime(date, fn))</code>. Both restore their state when the function returns.'],
    ],
  },
  {
    slug: 'property-based-testing-edge-cases.html',
    nav: 'Property based testing',
    title: 'Property based testing and edge cases in JavaScript: fast-check plus edgegoat | edgegoat',
    description:
      'Property based testing finds bugs with random inputs; curated edge cases find the known ones every time. How to combine fast-check with edgegoat\'s labeled inputs in Vitest or Jest.',
    h1: 'Property based testing and curated edge cases in JavaScript',
    about: ['property based testing', 'fast-check', 'edge cases', 'fuzzing'],
    lede: 'fast-check generates thousands of random inputs and shrinks failures to a minimal example. edgegoat hands you the few hundred inputs that already broke real code, with names and reasons. They answer different questions and work well together.',
    sections: [
      [
        'What each approach is good at',
        `<table>
<thead><tr><th scope="col">Aspect</th><th>fast-check</th><th>edgegoat</th><th>big-list-of-naughty-strings</th></tr></thead>
<tbody>
<tr><th scope="row">Inputs</th><td>Random, generated from arbitraries</td><td>Curated, deterministic</td><td>Curated raw strings</td></tr>
<tr><th scope="row">Finds</th><td>Unknown bugs, with shrinking</td><td>Known bug classes, every run</td><td>String handling bugs</td></tr>
<tr><th scope="row">Explains why</th><td>No</td><td>Yes, one line per case</td><td>Comments by section</td></tr>
<tr><th scope="row">Types</th><td>Any</td><td>Dates, zones, strings, numbers, URLs, paths, JSON, arrays</td><td>Strings</td></tr>
<tr><th scope="row">DST and New Year instants</th><td>Rarely hit by chance</td><td>Computed per zone</td><td>No</td></tr>
</tbody>
</table>`,
      ],
      [
        'The bug random inputs rarely find',
        `<p>A uniformly random instant falls inside a given one hour window about once in 8,760 tries, so a property test over random dates almost never lands on the hour where clocks jump. <code>dates({ tags: ['dst'] })</code> hits it on every run, in every zone you choose. The same goes for a surrogate pair exactly at a cut boundary or a number between -1 and 0.</p>`,
      ],
      [
        'Seed fast-check with edgegoat values',
        `${code(`
import fc from 'fast-check';
import { test } from 'vitest';
import { strings } from 'edgegoat';

const tricky = fc.constantFrom(...strings().map((c) => c.value));
const text = fc.oneof(tricky, fc.string({ unit: 'grapheme' }));

test('slugify is idempotent', () => {
  fc.assert(fc.property(text, (s) => slugify(slugify(s)) === slugify(s)));
});`)}
<p>fast-check mixes the curated values with random ones and still shrinks failures. <code>unit: 'grapheme'</code> needs fast-check 3.22 or later.</p>`,
      ],
      [
        'Or keep the labels with check()',
        `<p>The same property, without a property testing library, reports failures by name and reason:</p>
${code(`
import { expect, test } from 'vitest';
import { check, strings } from 'edgegoat';

test('slugify is idempotent on every edge case', () => {
  const failures = check(slugify, strings(), (out) => slugify(out) === out);
  expect(failures.map((f) => \`\${f.label}: \${f.why}\`)).toEqual([]);
});`)}`,
      ],
    ],
    faq: [
      ['What is property based testing?', 'Instead of writing examples, you state a property that must hold for all inputs (for example "decode(encode(x)) equals x") and a library such as fast-check checks it against many generated inputs, shrinking any failure to a minimal case.'],
      ['Should I use fast-check or edgegoat?', 'Both. Use fast-check to explore inputs you did not think of, and edgegoat to make sure the inputs that are known to break code are always tested, with readable names in the test report.'],
      ['Does edgegoat generate random data?', 'No. Every call returns the same cases, so failures are reproducible. DST instants are computed from the runtime tz database, so they are deterministic for a given Node.js version.'],
      ['How is edgegoat different from big-list-of-naughty-strings?', 'The big list is a large list of strings for fuzzing. edgegoat is smaller, explains every case, is filterable by tags and also covers dates, time zones, numbers, URLs, paths, JSON and arrays.'],
    ],
  },
];
