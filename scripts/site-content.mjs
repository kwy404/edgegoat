// Content of the guide pages in docs/. Each guide covers one bug class:
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
    title: 'Testing time zones | edgegoat',
    description:
      'Run date code in zones that disagree with UTC and catch the New Year bug before your users do.',
    h1: 'Testing time zones',
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
      ['Can I change the time zone of a running Node.js process?', 'Yes. Assigning <code>process.env.TZ</code> makes Node.js reset its cached zone, so later <code>Date</code> and <code>Intl</code> calls use the new one. Deleting the variable does not reset it, which is why <code>withTimeZone()</code> switches back explicitly.'],
      ['How do I set the time zone in browser tests?', 'A page cannot change its own zone at runtime. Launch the browser in the zone: Playwright has a <code>timezoneId</code> option, and Chrome DevTools Protocol has <code>Emulation.setTimezoneOverride</code>.'],
      ['Why do my date tests pass locally and fail in CI?', 'CI runners usually run in UTC while your machine does not, so dates near midnight or New Year land on different days. Pin <code>TZ</code> in CI and add matrix entries with zones far from UTC.'],
    ],
  },
  {
    slug: 'test-daylight-saving-time-jest.html',
    nav: 'Daylight saving time',
    title: 'Testing daylight saving time | edgegoat',
    description:
      'Use real spring forward and fall back instants to test code that adds days, hours or intervals.',
    h1: 'Testing daylight saving time',
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
      ['How do I mock the date in Jest during a DST change?', 'Either <code>jest.useFakeTimers({ now: date })</code>, or <code>withFrozenTime(date, fn)</code> from edgegoat, which only replaces <code>Date</code> and leaves timers alone. Combine it with <code>withTimeZone()</code> to control the zone too.'],
      ['Are the DST instants hard coded?', 'No. edgegoat scans UTC offsets with <code>Intl.DateTimeFormat</code> and binary searches each change down to the minute, so the instants match the tz database of the runtime. Its test suite checks that every case is a real transition.'],
      ['Which zones have unusual DST rules?', 'Australia/Lord_Howe shifts by 30 minutes, Antarctica/Troll by two hours, America/Sao_Paulo switched at midnight until 2019, and the tz database models Europe/Dublin with a negative DST save.'],
    ],
  },
  {
    slug: 'unicode-test-strings.html',
    nav: 'Unicode strings',
    title: 'Unicode strings | edgegoat',
    description:
      'Why slicing, counting and comparing text by code unit breaks, and the strings that show it.',
    h1: 'Unicode strings',
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
      ['What is a surrogate pair?', 'UTF-16 encodes code points above U+FFFF as two 16 bit code units, a high surrogate followed by a low surrogate. JavaScript string indexes count code units, so one emoji has <code>length</code> 2 and can be cut in half.'],
      ['How do I count characters in a JavaScript string?', '<code>s.length</code> counts UTF-16 code units, <code>[...s].length</code> counts code points, and <code>[...new Intl.Segmenter().segment(s)].length</code> counts grapheme clusters, which is what users perceive as characters.'],
    ],
  },
  {
    slug: 'javascript-number-edge-cases.html',
    nav: 'Numbers',
    title: 'Numbers | edgegoat',
    description:
      'Two zeros, a value not equal to itself and integers that stop being exact: how numbers break formatting and parsing.',
    h1: 'Numbers',
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
];
