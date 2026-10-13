// Builds everything that is derived from the library itself:
//   docs/catalog.json, assets/catalog.svg, the generated README sections,
//   and the static site in docs/ (the lab on index.html, the guides, sitemap,
//   robots, 404), with code blocks highlighted by scripts/highlight-docs.mjs
//   and the art from scripts/site-art.mjs. docs/style.css and docs/site.js
//   are written by hand.
// Usage: npm run docs   (builds the library first)
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { GUIDES } from './site-content.mjs';
import { highlightDocs } from './highlight-docs.mjs';
import { icon, jar, mascot, ridge, shelf, sprite } from './site-art.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lib = await import(pathToFileURL(join(root, 'dist/index.js')).href);
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const SITE = 'https://kwy404.github.io/edgegoat/';
const REPO = 'https://github.com/kwy404/edgegoat';
const NPM = 'https://www.npmjs.com/package/edgegoat';
const CDN = 'https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/';
const PUBLISHED = '2026-10-12';
const UPDATED = '2026-10-13';
const BS = String.fromCharCode(92);

const write = (file, text) => {
  mkdirSync(dirname(join(root, file)), { recursive: true });
  writeFileSync(join(root, file), text);
  console.log(`wrote ${file}`);
};

// ------------------------------------------------------------ catalog data
export const GENERATORS = [
  { fn: 'dates', title: 'Dates', icon: 'dates' },
  { fn: 'timeZones', title: 'Time zones', icon: 'time-zones' },
  { fn: 'strings', title: 'Strings', icon: 'strings' },
  { fn: 'numbers', title: 'Numbers', icon: 'numbers' },
  { fn: 'numericStrings', title: 'Numeric strings', icon: 'numbers' },
  { fn: 'bigints', title: 'BigInts', icon: 'numbers' },
  { fn: 'urls', title: 'URLs', icon: 'urls' },
  { fn: 'emails', title: 'Emails', icon: 'urls' },
  { fn: 'paths', title: 'Paths', icon: 'paths' },
  { fn: 'json', title: 'JSON', icon: 'json' },
  { fn: 'arrays', title: 'Arrays', icon: 'arrays' },
];

const GRID = [
  { icon: 'dates', fns: ['dates'], en: ['Dates', 'DST gaps and overlaps, New Year in 7 zones, leap days, before 1970, 2038, year 10000'], pt: ['Datas', 'Horário de verão (lacunas e sobreposições), Ano Novo em 7 fusos, 29 de fevereiro, antes de 1970, 2038, ano 10000'], alt: 'Calendar icon for date and daylight saving time edge cases' },
  { icon: 'time-zones', fns: ['timeZones'], en: ['Time zones', 'Curated IANA zones: +05:45, +14:00, -11:00, 30 minute DST, midnight DST'], pt: ['Fusos horários', 'Fusos IANA escolhidos: +05:45, +14:00, -11:00, horário de verão de 30 minutos e à meia-noite'], alt: 'Globe icon for time zone test cases' },
  { icon: 'strings', fns: ['strings'], en: ['Strings', 'Emoji, surrogate pairs, NFC vs NFD, bidi, invisible spaces, Turkish i, newlines'], pt: ['Strings', 'Emoji, pares substitutos, NFC vs NFD, bidi, espaços invisíveis, i turco, quebras de linha'], alt: 'Text icon for unicode test strings' },
  { icon: 'numbers', fns: ['numbers', 'numericStrings', 'bigints'], en: ['Numbers', '-0, NaN, Infinity, safe integer limits, 0.1 + 0.2, 1e21, numeric strings and BigInt'], pt: ['Números', '-0, NaN, Infinity, limites de inteiros seguros, 0.1 + 0.2, 1e21, strings numéricas e BigInt'], alt: 'Hash icon for JavaScript number edge cases like negative zero and NaN' },
  { icon: 'urls', fns: ['urls', 'emails'], en: ['URLs and emails', 'WHATWG parser surprises, SSRF and open redirect shapes, RFC 5321 limits'], pt: ['URLs e emails', 'Surpresas do parser WHATWG, formatos de SSRF e open redirect, limites da RFC 5321'], alt: 'Link icon for URL and email edge cases' },
  { icon: 'paths', fns: ['paths'], en: ['Paths', 'Windows vs POSIX, UNC, reserved names, traversal, NFD file names'], pt: ['Caminhos', 'Windows vs POSIX, UNC, nomes reservados, travessia com .., nomes em NFD'], alt: 'Folder icon for Windows and POSIX file path edge cases' },
  { icon: 'json', fns: ['json'], en: ['JSON', '10000 levels deep, duplicate keys, 2^53 + 1, __proto__, BOM'], pt: ['JSON', '10000 níveis, chaves duplicadas, 2^53 + 1, __proto__, BOM'], alt: 'Curly braces icon for JSON parsing edge cases' },
  { icon: 'arrays', fns: ['arrays'], en: ['Arrays', 'Holes, length 2^32 - 1, NaN membership, default sort, too big to spread'], pt: ['Arrays', 'Buracos, length 2^32 - 1, NaN, sort padrão, grande demais para spread'], alt: 'Brackets icon for array edge cases with holes and huge lengths' },
  { icon: 'helpers', fns: [], en: ['Helpers', 'withTimeZone, withFrozenTime, check, assertNoThrow'], pt: ['Helpers', 'withTimeZone, withFrozenTime, check, assertNoThrow'], alt: 'Stopwatch icon for the time zone and frozen time test helpers' },
];

// Sibling projects, listed in the site footer and in README.md (never this one).
const PROJECTS = [
  ['Monsoon', 'https://kwy404.github.io/monsoon/', 'Utility-first CSS from a CDN with no build step, a whole theme from one seed color.'],
  ['Voodoo.js', 'https://kwy404.github.io/Voodoo.js/', 'The HTML first JavaScript framework: reactive directives and JSX in a plain HTML file.'],
  ['breakhound', 'https://kwy404.github.io/breakhound/', 'Find bugs in any JavaScript or TypeScript library automatically, no tests required.'],
  ['vueleap', 'https://kwy404.github.io/vueleap/', 'Migrate Vue 2 to Vue 3 with one command, with the exact @vue/compat flags you need.'],
  ['graphemely', 'https://kwy404.github.io/graphemely/', 'Truncate, slice and count strings with emoji safely, by grapheme cluster.'],
  ['numberparrot', 'https://kwy404.github.io/numberparrot/', 'Parse localized number and currency strings back into real numbers, for any locale.'],
];

function escapeCodePoints(s) {
  let out = '';
  for (const ch of s) {
    const cp = ch.codePointAt(0);
    if (ch === '"') out += BS + '"';
    else if (ch === BS) out += BS + BS;
    else if (ch === '\n') out += BS + 'n';
    else if (ch === '\r') out += BS + 'r';
    else if (ch === '\t') out += BS + 't';
    else if (cp >= 0x20 && cp <= 0x7e) out += ch;
    else if (cp > 0xffff) out += `${BS}u{${cp.toString(16).toUpperCase()}}`;
    else out += `${BS}u${cp.toString(16).toUpperCase().padStart(4, '0')}`;
  }
  return out;
}

/** Readable, ASCII only rendering of any case value. Emoji and invisible characters appear as escapes. */
export function display(value, depth = 0) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? 'Invalid Date' : value.toISOString();
  if (typeof value === 'number') return Object.is(value, -0) ? '-0' : String(value);
  if (typeof value === 'bigint') return `${value}n`;
  if (typeof value === 'undefined') return 'undefined';
  if (typeof value === 'string') {
    if (value.length > 120) {
      const head = value.slice(0, 40);
      return `"${escapeCodePoints(head)}..." (${value.length} chars)`;
    }
    return `"${escapeCodePoints(value)}"`;
  }
  if (Array.isArray(value)) {
    if (depth > 3) return '[...]';
    const shown = [];
    const limit = Math.min(value.length, 6);
    for (let i = 0; i < limit; i++) {
      if (i in value) shown.push(display(value[i], depth + 1));
      else shown.push('<hole>');
    }
    let text = `[${shown.join(', ')}${value.length > limit ? ', ...' : ''}]`;
    if (value.length > limit) text += ` (length ${value.length})`;
    return text;
  }
  return String(value);
}

/** Kind of value, shown in the site's inspector. */
function kind(value) {
  if (value instanceof Date) return 'Date';
  if (Array.isArray(value)) return 'Array';
  return typeof value;
}

const cases = [];
const counts = {};
for (const g of GENERATORS) {
  const list = lib[g.fn]();
  counts[g.fn] = list.length;
  list.forEach((c, n) => {
    const entry = { id: `${g.fn}-${n + 1}`, generator: g.fn, label: c.label, value: display(c.value), type: kind(c.value), why: c.why, tags: [...c.tags] };
    if (c.zone) entry.zone = c.zone;
    if (c.ref) entry.ref = c.ref;
    cases.push(entry);
  });
}
const total = cases.length;
const gridCount = (fns) => fns.reduce((n, f) => n + counts[f], 0);

write(
  'docs/catalog.json',
  JSON.stringify(
    {
      name: 'edgegoat',
      version: pkg.version,
      total,
      generators: GENERATORS.map((g) => ({ name: `${g.fn}()`, title: g.title, count: counts[g.fn] })),
      cases,
    },
    null,
    2,
  ) + '\n',
);

// ------------------------------------------------------------ catalog.svg
function catalogSvg() {
  const rowH = 38;
  const top = 96;
  const max = Math.max(...Object.values(counts));
  const barX = 250;
  const barW = 560;
  const rows = GENERATORS.map((g, i) => {
    const y = top + i * rowH;
    const w = Math.max(8, Math.round((counts[g.fn] / max) * barW));
    return `<g transform="translate(0 ${y})">
    <text class="label" x="${barX - 16}" y="21" text-anchor="end">${g.fn}()</text>
    <rect class="track" x="${barX}" y="4" width="${barW}" height="24" rx="12"/>
    <rect class="bar${i % 3}" x="${barX}" y="4" width="${w}" height="24" rx="12"/>
    <text class="count" x="${barX + w + 10}" y="22">${counts[g.fn]}</text>
  </g>`;
  }).join('\n  ');
  const H = top + GENERATORS.length * rowH + 40;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 ${H}" width="900" height="${H}" role="img" aria-labelledby="t d">
  <title id="t">edgegoat catalog: ${total} edge cases in ${GENERATORS.length} generators</title>
  <desc id="d">Bar chart of edge case counts: ${GENERATORS.map((g) => `${g.fn} ${counts[g.fn]}`).join(', ')}.</desc>
  <style>
    text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .bg { fill: #FFFFFF; stroke: #D0D7DE; }
    .title { fill: #22303C; font-size: 26px; font-weight: 800; }
    .sub { fill: #57606A; font-size: 15px; }
    .label { fill: #22303C; font-size: 16px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    .count { fill: #22303C; font-size: 15px; font-weight: 700; }
    .track { fill: #2E9C8A; fill-opacity: 0.1; }
    .bar0 { fill: #2E9C8A; } .bar1 { fill: #3BB09C; } .bar2 { fill: #F2A93B; }
    @media (prefers-color-scheme: dark) {
      .bg { fill: #0D1117; stroke: #30363D; }
      .title, .label, .count { fill: #E6EDF3; }
      .sub { fill: #8B949E; }
      .track { fill-opacity: 0.18; }
    }
  </style>
  <rect class="bg" x="1" y="1" width="898" height="${H - 2}" rx="16"/>
  <text class="title" x="40" y="50">${total} edge cases, ${GENERATORS.length} generators</text>
  <text class="sub" x="40" y="75">Every case has a label, a value, a one line why, and tags for filtering.</text>
  ${rows}
</svg>
`;
}
write('assets/catalog.svg', catalogSvg());

// ------------------------------------------------------------ README sections
const mdCell = (s) => s.replaceAll('|', BS + '|').replaceAll('\n', ' ');
const mdCode = (s) => {
  const short = s.length > 48 ? `${s.slice(0, 45)}...` : s;
  return '`' + mdCell(short).replaceAll('`', "'") + '`';
};

function grid(lang) {
  const cells = GRID.map((g) => {
    const [title, line] = g[lang];
    const n = g.fns.length ? gridCount(g.fns) : 4;
    const unit = g.fns.length ? (lang === 'en' ? 'cases' : 'casos') : lang === 'en' ? 'functions' : 'funções';
    return `<td width="33%" valign="top"><img src="${CDN}assets/icons/${g.icon}.svg" width="40" height="40" alt="${g.alt}"><br><strong>${title}</strong> <code>${n} ${unit}</code><br><sub>${line}</sub></td>`;
  });
  const rows = [];
  for (let i = 0; i < cells.length; i += 3) rows.push(`<tr>\n${cells.slice(i, i + 3).join('\n')}\n</tr>`);
  return `<table>\n${rows.join('\n')}\n</table>`;
}

function catalogTables() {
  return GENERATORS.map((g) => {
    const list = cases.filter((c) => c.generator === g.fn);
    const rows = list.map((c) => `| ${mdCell(c.label)} | ${mdCode(c.value)} | ${mdCell(c.why)} |`).join('\n');
    return `<details>
<summary><strong><code>${g.fn}()</code></strong>: ${list.length} cases</summary>

| Label | Value | Why it breaks code |
| --- | --- | --- |
${rows}

</details>`;
  }).join('\n\n');
}

function replaceBetween(text, name, content) {
  const re = new RegExp(`(<!-- ${name}:start -->)[\\s\\S]*?(<!-- ${name}:end -->)`);
  if (!re.test(text)) throw new Error(`marker ${name} not found`);
  return text.replace(re, `$1\n${content}\n$2`);
}

for (const [file, lang] of [
  ['README.md', 'en'],
  ['i18n/README.pt-BR.md', 'pt'],
]) {
  let text = readFileSync(join(root, file), 'utf8');
  text = replaceBetween(text, 'grid', grid(lang));
  text = text.replace(/<!-- total -->\d+<!-- \/total -->/g, `<!-- total -->${total}<!-- /total -->`);
  if (lang === 'en') text = replaceBetween(text, 'catalog', catalogTables());
  if (lang === 'en') text = replaceBetween(text, 'more', PROJECTS.map(([name, href, line]) => `- [${name}](${href}): ${line}`).join('\n'));
  write(file, text);
}


// ------------------------------------------------------------ site
// The site is a laboratory: the home page is the catalog explorer itself
// (generator rail, specimen grid, inspector), and the guides are lab notes
// with a tab bar per category. Styled with Monsoon from the CDN plus
// docs/style.css; interactive parts are Voodoo.js (docs/site.js).
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const strip = (html) => html.replace(/<[^>]+>/g, '').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&').replaceAll('&quot;', '"');

const MONSOON_CSS = 'https://cdn.jsdelivr.net/npm/monsooncss@0.2.0/dist/monsoon.min.css';
const MONSOON_JS = 'https://cdn.jsdelivr.net/npm/monsooncss@0.2.0/dist/monsoon.js';
const VOODOO = 'https://cdn.jsdelivr.net/npm/voodoojs@1.0.0/dist/voodoo.full.min.js';
const AUTHOR = 'https://github.com/kwy404';
const LINKEDIN = 'https://www.linkedin.com/in/alexandre-silva-173687256/';

// Restores a saved light or dark choice before the first paint. Voodoo.js
// (v-theme-toggle) stores the choice in localStorage under voodoo:theme, raw
// or as JSON; "system" (or nothing) leaves data-theme off.
const THEME_BOOT = `<script>(function(){try{var t=localStorage.getItem('voodoo:theme');if(t&&t.charAt(0)==='"')t=JSON.parse(t);var r=document.documentElement;if(t==='light'||t==='dark'){r.setAttribute('data-theme',t);r.style.colorScheme=t}}catch(e){}})();</script>`;

// Guide categories: the tab bar on every guide page.
const GROUPS = [
  { id: 'time', name: 'Time', icon: 'dates', slugs: ['test-timezones-javascript.html', 'test-daylight-saving-time-jest.html', 'test-dates-before-1970.html', 'mock-date-javascript.html'] },
  { id: 'unicode', name: 'Unicode', icon: 'strings', slugs: ['unicode-test-strings.html'] },
  { id: 'numbers', name: 'Numbers', icon: 'numbers', slugs: ['javascript-number-edge-cases.html', 'javascript-negative-zero.html'] },
  { id: 'method', name: 'Method', icon: 'all', slugs: ['property-based-testing-edge-cases.html'] },
];
// The specimens each guide is about, shown in its side panel and linked to the lab.
const RELATED = {
  'test-timezones-javascript.html': { gen: 'timeZones', tags: [] },
  'test-daylight-saving-time-jest.html': { gen: 'dates', tags: ['dst'] },
  'test-dates-before-1970.html': { gen: 'dates', tags: ['pre-1970', 'far-past', 'epoch'] },
  'mock-date-javascript.html': { gen: 'dates', tags: ['year-boundary', 'leap', 'month-end'] },
  'unicode-test-strings.html': { gen: 'strings', tags: ['surrogate', 'emoji', 'normalization', 'bidi', 'invisible'] },
  'javascript-number-edge-cases.html': { gen: 'numbers', tags: [] },
  'javascript-negative-zero.html': { gen: 'numbers', tags: ['zero', 'sign'] },
  'property-based-testing-edge-cases.html': { gen: 'numbers', tags: ['nan', 'infinity', 'precision'] },
};
const groupOf = (slug) => GROUPS.find((g) => g.slugs.includes(slug));
const guideBySlug = (slug) => GUIDES.find((g) => g.slug === slug);
const relatedCases = ({ gen, tags }) => cases.filter((c) => c.generator === gen && (!tags.length || c.tags.some((t) => tags.includes(t))));
const labHref = (prefix, { gen, tags }) => `${prefix}?gen=${gen}${tags.length ? `&amp;tags=${tags.join(',')}` : ''}#catalog`;

// Tags offered in the command palette.
const PALETTE_TAGS = ['dst', 'year-boundary', 'surrogate', 'emoji', 'normalization', 'bidi', 'sign', 'nan', 'precision', 'traversal', 'windows', 'security', 'invalid', 'sparse'];

const slugify = (s) => s.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Source form of a code block. scripts/highlight-docs.mjs turns it into a
// highlighted, editor style block at the end of the build.
const code = (text, lang = 'js', title) =>
  `<pre><code class="language-${lang}"${title ? ` data-title="${esc(title)}"` : ''}>${esc(text.trim())}</code></pre>`;

const themeButton = () => `<button type="button" class="icon-btn theme-btn" v-theme-toggle.cycle aria-label="Color theme: system, light or dark" title="Color theme">
      <span class="ti ti-system">${icon('ui-system')}</span><span class="ti ti-light">${icon('ui-sun')}</span><span class="ti ti-dark">${icon('ui-moon')}</span>
    </button>`;

function palette(prefix) {
  const item = (attrs, ic, text, extra = '') => `<a class="command-palette-item" ${attrs}>${ic}<span>${text}</span>${extra}</a>`;
  const gens = GENERATORS.map((g) => item(`href="${prefix}?gen=${g.fn}#catalog" data-gen="${g.fn}" data-keywords="${esc(g.title)} generator"`, icon(g.fn), `${g.fn}()`, `<span class="command-palette-shortcut">${counts[g.fn]}</span>`)).join('\n      ');
  const tagCount = (t) => cases.filter((c) => c.tags.includes(t)).length;
  const tags = PALETTE_TAGS.map((t) => item(`href="${prefix}?tags=${t}#catalog" data-tag="${t}" data-keywords="tag filter"`, icon('ui-tag'), `Tag: ${t}`, `<span class="command-palette-shortcut">${tagCount(t)}</span>`)).join('\n      ');
  const guides = GUIDES.map((g) => item(`href="${prefix}${g.slug}" data-keywords="guide ${esc(g.about.join(' '))}"`, icon('ui-book'), esc(g.h1))).join('\n      ');
  return `<dialog id="palette" class="modal modal-top" aria-label="Search the lab">
  <div class="command-palette" data-m-command data-m-command-hotkey="mod+k" data-m-command-empty="Nothing on this shelf. Try another word.">
    <label class="command-palette-search"><input class="command-palette-input" placeholder="Search generators, tags and guides" aria-label="Search generators, tags and guides"></label>
    <div class="command-palette-list">
      <p class="command-palette-heading">Generators</p>
      ${gens}
      <p class="command-palette-heading">Tags</p>
      ${tags}
      <p class="command-palette-heading">Guides</p>
      ${guides}
      <p class="command-palette-heading">Links</p>
      ${item(`href="${REPO}" data-keywords="source code repository"`, icon('brand-github'), 'GitHub repository')}
      ${item(`href="${NPM}" data-keywords="package install"`, icon('brand-npm'), 'edgegoat on npm')}
      ${item(`href="${prefix}catalog.json" data-keywords="data download export"`, icon('ui-json'), 'catalog.json')}
      ${item(`href="${REPO}/blob/main/CHANGELOG.md" data-keywords="releases versions"`, icon('ui-steps'), 'Changelog')}
      <button type="button" class="command-palette-item" data-action="theme" data-keywords="dark light mode appearance">${icon('ui-moon')}<span>Switch color theme</span></button>
    </div>
    <div class="command-palette-footer"><span><kbd>Up</kbd> <kbd>Down</kbd> to move</span><span><kbd>Enter</kbd> to open</span><span><kbd>Esc</kbd> to close</span></div>
  </div>
  <form method="dialog" class="modal-backdrop"><button aria-label="Close search">Close</button></form>
</dialog>`;
}

function topbar(prefix, current) {
  const link = (href, text, key) => `<a href="${href}" class="navbar-link"${current === key ? ' aria-current="page"' : ''}>${text}</a>`;
  const links = [
    link(`${prefix}#catalog`, 'Lab', 'lab'),
    link(`${prefix}${GUIDES[0].slug}`, 'Guides', 'guides'),
    link(`${prefix}#quick-start`, 'Quick start', 'start'),
    link(`${prefix}catalog.json`, 'catalog.json', 'json'),
  ].join('');
  return `<header class="navbar navbar-sticky navbar-blur topbar">
  <div class="navbar-start">
    <a href="${prefix}" class="navbar-brand brand" aria-label="edgegoat home">${mascot(prefix, 30)}<span class="wordmark">edge<b>goat</b></span></a>
    <a href="${REPO}/blob/main/CHANGELOG.md" class="badge badge-sm badge-outline ver" title="Changelog">v${pkg.version}</a>
  </div>
  <nav class="navbar-center navbar-nav" aria-label="Main">${links}</nav>
  <div class="navbar-end">
    <button type="button" class="search-btn" data-open-palette aria-haspopup="dialog" aria-controls="palette">${icon('ui-search')}<span class="search-btn-label">Search</span><span class="kbd-pair" aria-hidden="true"><kbd class="kbd kbd-xs">Ctrl</kbd><kbd class="kbd kbd-xs">K</kbd></span></button>
    <a href="${REPO}" class="icon-btn" aria-label="edgegoat on GitHub">${icon('brand-github')}</a>
    ${themeButton()}
    <details class="navbar-mobile"><summary class="navbar-burger" aria-label="Menu"></summary><nav class="navbar-mobile-panel" aria-label="Mobile">${links}<a href="${REPO}" class="navbar-link">GitHub</a><a href="${NPM}" class="navbar-link">npm</a></nav></details>
  </div>
</header>`;
}

function footer(prefix) {
  return `<footer class="site-footer">
  ${ridge('ridge footer-ridge')}
  <div class="footer wrap">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="${prefix}" class="navbar-brand brand">${mascot(prefix, 34)}<span class="wordmark">edge<b>goat</b></span></a>
        <p>The inputs that break code, ready to drop into your tests. ${total} specimens, zero dependencies, MIT licensed.</p>
        <p class="made">Made by <a href="${AUTHOR}" rel="me noopener">Alexandre Kohler</a> <span class="footer-social"><a href="${AUTHOR}" rel="me noopener" aria-label="Alexandre Kohler on GitHub">${icon('brand-github')}</a><a href="${LINKEDIN}" rel="me noopener" aria-label="Alexandre Kohler on LinkedIn">${icon('brand-linkedin')}</a></span></p>
        <p class="built">Built with <a href="https://kwy404.github.io/monsoon/">Monsoon</a>. Interactive parts built with <a href="https://kwy404.github.io/Voodoo.js/">Voodoo.js</a>.</p>
      </div>
      <nav aria-label="Guides">
        <p class="footer-title">Lab notes</p>
        <ul class="footer-links">
          ${GUIDES.map((g) => `<li><a href="${prefix}${g.slug}">${esc(g.nav)}</a></li>`).join('\n          ')}
        </ul>
      </nav>
      <nav aria-label="Project">
        <p class="footer-title">edgegoat</p>
        <ul class="footer-links">
          <li><a href="${prefix}#catalog">Specimen lab</a></li>
          <li><a href="${prefix}catalog.json">catalog.json</a></li>
          <li><a href="${REPO}">GitHub</a></li>
          <li><a href="${NPM}">npm</a></li>
          <li><a href="${REPO}/blob/main/CHANGELOG.md">Changelog</a></li>
          <li><a href="${REPO}/blob/main/CONTRIBUTING.md">Contributing</a></li>
        </ul>
      </nav>
      <nav aria-label="More from kwy404" class="footer-more">
        <p class="footer-title">More from kwy404</p>
        <ul class="footer-links">
          ${PROJECTS.map(([name, href, line]) => `<li><a href="${href}">${esc(name)}</a><span>${esc(line)}</span></li>`).join('\n          ')}
        </ul>
      </nav>
    </div>
    <div class="footer-bottom">
      <p>MIT license. Ledge the goat walks the edges so your code does not fall off them.</p>
      <p><a href="${prefix}sitemap.xml">Sitemap</a></p>
    </div>
  </div>
</footer>`;
}

export function layout({ slug, title, description, body, jsonld, type = 'article', current = '', bodyClass = '' }) {
  const url = SITE + (slug === 'index.html' ? '' : slug);
  const prefix = './';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
${THEME_BOOT}
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="author" content="Alexandre Kohler">
<meta name="theme-color" content="#0e8f9c">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="edgegoat">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Ledge the mountain goat on a cliff edge next to the edgegoat name and tagline">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE}og.png">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="${MONSOON_CSS}">
<link rel="stylesheet" href="style.css">
<script src="${MONSOON_JS}" defer></script>
<script src="${VOODOO}" defer></script>
<script src="site.js" defer></script>
<script type="application/ld+json">
${JSON.stringify(jsonld, null, 2)}
</script>
</head>
<body class="antialiased${bodyClass ? ` ${bodyClass}` : ''}">
${sprite()}
<a href="#main" class="skip-link">Skip to content</a>
${topbar(prefix, current)}
${palette(prefix)}
<main id="main">
${body}
</main>
${footer(prefix)}
</body>
</html>
`;
}

// ------------------------------------------------------------ home: the lab
const pad = (n) => String(n).padStart(3, '0');

// One grid row per case. The rows stay in the static HTML (indexable and
// readable without JavaScript); Voodoo.js only filters and selects them.
// Text that may contain braces carries v-pre so it is never read as a
// template expression.
function caseRow(c, i) {
  const shown = c.tags.slice(0, 1).map((t) => `<span class="badge badge-sm" v-pre>${esc(t)}</span>`).join('');
  const more = c.tags.length > 1 ? `<span class="badge badge-sm badge-outline" title="${esc(c.tags.slice(1).join(', '))}">+${c.tags.length - 1}</span>` : '';
  return `<tr id="${c.id}" v-show="isShown(${i})" :class="{ 'is-picked': pick === ${i} }" @click="open(${i}, true)">
  <td class="col-no">${pad(i + 1)}</td>
  <td><button type="button" class="row-btn" :aria-pressed="pick === ${i} ? 'true' : 'false'" aria-controls="inspector"><span class="row-label" v-pre>${esc(c.label)}</span></button><span class="row-gen">${icon(c.generator, 'ic ic-xs')}${c.generator}()</span></td>
  <td class="col-value"><code v-pre>${esc(c.value)}</code></td>
  <td class="col-tags">${shown}${more}</td>
</tr>`;
}

function rail() {
  const gen = (fn, title, n) => `<button type="button" class="rail-item" :class="{ 'is-on': gen === '${fn}' }" :aria-pressed="gen === '${fn}' ? 'true' : 'false'" @click="setGen('${fn}')">${icon(fn || 'all')}<span class="rail-name">${title}</span><span class="badge badge-sm rail-count" v-text="countFor('${fn}', ${n})">${n}</span></button>`;
  return `<nav class="rail" aria-label="Filter by generator and tag">
    <p class="rail-title">Shelves</p>
    <div class="rail-gens">
      ${gen('', 'All specimens', total)}
      ${GENERATORS.map((g) => gen(g.fn, `${g.fn}()`, counts[g.fn])).join('\n      ')}
    </div>
    <div class="rail-tags" v-cloak>
      <p class="rail-title"><span>Tags</span><button type="button" class="rail-more" v-show="moreTags()" @click="allTags = !allTags" v-text="allTags ? 'Fewer' : 'All tags'"></button></p>
      <div class="rail-tag-list" role="group" aria-label="Filter by tag, any of">
        <button type="button" class="rail-tag" v-for="t in tagList()" :key="t.name" :class="{ 'is-on': tags.includes(t.name) }" :aria-pressed="tags.includes(t.name) ? 'true' : 'false'" @click="toggleTag(t.name)"><span v-text="t.name"></span><span class="rail-tag-n" v-text="t.count"></span></button>
      </div>
    </div>
  </nav>`;
}

function inspector() {
  return `<aside id="inspector" class="splitter-pane inspector" data-min="26" aria-label="Specimen inspector" :class="{ 'is-open': sheet }" @keydown.esc="closeSheet()">
      <div class="inspector-in" v-cloak v-if="current()">
        <div class="insp-head">
          ${jar({ dynamic: "'#i-' + current().generator", cls: 'jar-art insp-jar' })}
          <div class="insp-title">
            <p class="insp-kicker"><span>Specimen <span v-text="'#' + no()"></span></span><span class="badge badge-sm badge-soft badge-primary" v-text="current().generator + '()'"></span><span class="badge badge-sm badge-outline" v-text="current().type"></span></p>
            <h2 id="insp-label" tabindex="-1" v-text="current().label"></h2>
          </div>
          <button type="button" class="icon-btn insp-close" @click="closeSheet()" aria-label="Close the inspector">${icon('ui-close')}</button>
        </div>
        <section class="insp-block" aria-labelledby="insp-value-h">
          <div class="insp-block-head"><h3 id="insp-value-h">Value</h3><span class="insp-meta" v-text="stats()"></span><button type="button" class="copy-btn copy-btn-sm" v-copy-from="#insp-value" v-copy-label="Copied" aria-label="Copy the escaped value">${icon('ui-copy')}${icon('ui-check')}<span>Copy</span></button></div>
          <pre class="insp-value" tabindex="0"><code id="insp-value" v-text="current().value"></code></pre>
          <ol class="cp-strip" v-if="points().length" aria-label="Code points">
            <li v-for="(p, k) in points()" :key="k" :class="{ 'is-esc': p.esc }"><span class="cp-ch" v-text="p.ch"></span><span class="cp-u" v-text="p.u"></span></li>
          </ol>
          <p class="cp-more" v-if="pointsMore()" v-text="pointsMore()"></p>
        </section>
        <section class="insp-block" aria-labelledby="insp-why-h">
          <h3 id="insp-why-h">Why it breaks code</h3>
          <p class="insp-why" v-text="current().why"></p>
          <p class="insp-zone" v-if="current().zone">${icon('timeZones')}<span>Time zone</span> <code v-text="current().zone"></code></p>
          <p class="insp-ref" v-if="current().ref"><a :href="current().ref" class="link link-primary">${icon('ui-bug')}Read the real bug or spec</a></p>
        </section>
        <section class="insp-block" aria-labelledby="insp-tags-h">
          <h3 id="insp-tags-h">Tags</h3>
          <div class="insp-tags"><button type="button" class="tag tag-primary" v-for="t in current().tags" :key="t" :class="{ 'is-on': tags.includes(t) }" :aria-pressed="tags.includes(t) ? 'true' : 'false'" @click="toggleTag(t)" v-text="t"></button></div>
        </section>
        <section class="insp-block insp-code" aria-label="Ready to paste test">
          <div class="tabs tabs-line tabs-sm" role="tablist" aria-label="Test snippet">
            <input type="radio" name="snippet" class="tab" aria-label="This specimen" checked>
            <div class="tab-content" role="tabpanel">
              <div class="ed ed-live">
                <div class="ed-bar"><span class="ed-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="ed-tab"><span class="ed-file" data-lang="js" aria-hidden="true">JS</span><span class="ed-title">specimen.test.js</span></span><button type="button" class="copy-btn ed-copy" v-copy-from="#snip-case" v-copy-label="Copied" aria-label="Copy the test for this specimen">${icon('ui-copy')}${icon('ui-check')}<span>Copy</span></button></div>
                <pre id="snip-case" class="shiki numbered" tabindex="0"><code v-html="hl(caseSnippet())"></code></pre>
              </div>
            </div>
            <input type="radio" name="snippet" class="tab" aria-label="Current filter">
            <div class="tab-content" role="tabpanel">
              <div class="ed ed-live">
                <div class="ed-bar"><span class="ed-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="ed-tab"><span class="ed-file" data-lang="js" aria-hidden="true">JS</span><span class="ed-title">edge-cases.test.js</span></span><button type="button" class="copy-btn ed-copy" v-copy-from="#snip-filter" v-copy-label="Copied" aria-label="Copy the test for the current filter">${icon('ui-copy')}${icon('ui-check')}<span>Copy</span></button></div>
                <pre id="snip-filter" class="shiki numbered" tabindex="0"><code v-html="hl(filterSnippet())"></code></pre>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div class="insp-empty empty-state" v-else>
        ${jar({ glyph: 'i-all', cls: 'jar-art empty-jar' })}
        <h2 class="empty-state-title">Pick a specimen</h2>
        <p class="empty-state-description">Select any row to see its value as escaped code points, why it breaks code and a <code>test.each</code> you can paste.</p>
      </div>
    </aside>`;
}

function lab() {
  return `<section id="catalog" class="lab-wrap" aria-labelledby="lab-h" v-component="edge-lab">
  <h2 id="lab-h" class="sr-only">Specimen lab: every edge case in the catalog</h2>
  <div class="lab" v-resource="cat:./catalog.json">
    ${rail()}
    <div class="lab-main splitter" data-m-splitter data-m-splitter-sizes="60,40" data-m-splitter-persist="edgegoat-lab" data-m-splitter-label="Resize the inspector">
      <div class="splitter-pane grid-pane data-table" data-min="38">
        <div class="data-table-toolbar lab-toolbar">
          <label class="search-field data-table-filter lab-search">
            <input id="q" type="search" class="input input-sm" v-model="q" placeholder="Search ${total} specimens: dst, surrogate, -0" aria-label="Search specimens" autocomplete="off" spellcheck="false">
            <kbd class="search-field-shortcut">/</kbd>
          </label>
          <div class="active-filters" v-cloak>
            <button type="button" class="chip chip-sm chip-primary" v-if="gen" @click="gen = ''" :aria-label="'Remove generator filter ' + gen"><span v-text="gen + '()'"></span>${icon('ui-close', 'ic ic-xs')}</button>
            <button type="button" class="chip chip-sm" v-for="t in tags" :key="t" @click="toggleTag(t)" :aria-label="'Remove tag filter ' + t"><span v-text="t"></span>${icon('ui-close', 'ic ic-xs')}</button>
            <button type="button" class="btn btn-ghost btn-xs" v-show="tags.length || q || gen" @click="reset()">Clear</button>
          </div>
          <p class="data-table-status" role="status" v-text="status(${total})">${total} specimens</p>
        </div>
        <div class="data-table-scroll lab-scroll" tabindex="-1" @keydown="keys($event)">
          <table class="table table-compact table-hover table-pin-header lab-table">
            <caption class="sr-only">All ${total} edge cases. Select a row to inspect it.</caption>
            <thead><tr><th scope="col" class="col-no">No.</th><th scope="col">Specimen</th><th scope="col">Value</th><th scope="col" class="col-tags">Tags</th></tr></thead>
            <tbody id="cases">
${cases.map(caseRow).join('\n')}
            </tbody>
          </table>
          <div class="empty-state lab-empty" v-cloak v-if="loaded() && !visible.length">
            ${mascot('./', 72)}
            <h3 class="empty-state-title">No specimen on this shelf</h3>
            <p class="empty-state-description">Nothing matches the current search and filters.</p>
            <div class="empty-state-actions"><button type="button" class="btn btn-sm btn-outline btn-neutral" @click="reset()">Clear the filters</button></div>
          </div>
        </div>
        <div class="data-table-footer lab-foot"><span class="data-table-info">Generated from edgegoat ${pkg.version}. Emoji and invisible characters are shown as escapes.</span><span class="keys-hint"><kbd class="kbd kbd-xs">Up</kbd> <kbd class="kbd kbd-xs">Down</kbd> move <kbd class="kbd kbd-xs">/</kbd> search</span></div>
      </div>
      ${inspector()}
    </div>
    <div class="sheet-backdrop" v-cloak :class="{ 'is-open': sheet }" @click="closeSheet()" aria-hidden="true"></div>
  </div>
</section>`;
}

const INSTALL = [
  ['npm', 'npm install --save-dev edgegoat'],
  ['pnpm', 'pnpm add --save-dev edgegoat'],
  ['yarn', 'yarn add --dev edgegoat'],
  ['bun', 'bun add --dev edgegoat'],
];

const BUGS = [
  ['github/relative-time-element#384', 'https://github.com/github/relative-time-element/pull/384', 'dates', 'The "is this the current year?" check used UTC instead of the display time zone, so dates near New Year showed or hid the year incorrectly.'],
  ['mozilla/pdf.js#22017', 'https://github.com/mozilla/pdf.js/pull/22017', 'numbers', 'util.printf dropped the sign of negative numbers greater than -1, such as -0.5.'],
  ['google/budoux#1411', 'https://github.com/google/budoux/pull/1411', 'strings', 'Text segmentation could split a surrogate pair, producing half an emoji.'],
  ['microsoft/vscode-js-debug#2423', 'https://github.com/microsoft/vscode-js-debug/pull/2423', 'strings', 'trimEnd style truncation could cut a surrogate pair in half.'],
  ['salesforce/tough-cookie#644', 'https://github.com/salesforce/tough-cookie/pull/644', 'numbers', 'A cookie with an infinite max-age has to be treated as never expiring.'],
  ['vuejs/core#15618', 'https://github.com/vuejs/core/pull/15618', 'urls', 'A fix in the Vue 3 compat build.'],
];

const SHOWCASE = `import { describe, expect, test } from 'vitest';
import { dates, numbers, strings, withTimeZone } from 'edgegoat';
import { addDays, formatPrice, truncate } from './my-code';

describe('addDays keeps the wall clock across DST', () => {
  test.each(dates({ tags: ['dst'] }))('$label', ({ value, zone }) => {
    withTimeZone(zone, () => {
      expect(addDays(value, 1).getHours()).toBe(value.getHours());
    });
  });
});

test.each(strings({ tags: ['surrogate'] }))('truncate keeps $label whole', ({ value }) => {
  expect(truncate(value, 5).isWellFormed()).toBe(true);
});

test.each(numbers({ tags: ['sign'] }))('formatPrice($label)', ({ value }) => {
  expect(formatPrice(value)).not.toMatch(/^-0/);
});`;

const INDEX_FAQ = [
  ['What is edgegoat?', `A small, curated library of ${total} inputs that are known to break JavaScript code: DST transitions, New Year in far away zones, dates before 1970, surrogate pairs, invisible characters, <code>-0</code>, <code>NaN</code>, Windows paths, deep JSON and sparse arrays. Every case has a label, a value, a one line reason and tags.`],
  ['Which test runners does it work with?', 'Any of them. Generators return plain arrays of <code>{ label, value, why, tags }</code>, so they plug into <code>test.each</code> in Vitest and Jest, a loop in node:test or Mocha, or a property based testing library such as fast-check.'],
  ['Does edgegoat generate random data?', 'No. Every call returns the same cases, so failures are reproducible. DST instants are computed from the runtime tz database, so they are deterministic for a given Node.js version.'],
  ['How do I run a test in another time zone?', 'Wrap it in <code>withTimeZone(zone, fn)</code>. In Node.js it sets <code>process.env.TZ</code>, which applies to <code>Date</code> and <code>Intl</code> immediately, and restores the previous zone afterwards, even when the function throws.'],
  ['Why are emoji shown as escapes in the catalog?', 'So you can see exactly what is in each string. Invisible characters, combining marks and surrogate pairs look identical or empty when rendered, so the catalog prints code points such as <code>\\u{1F600}</code> instead.'],
  ['Does it add weight to my bundle?', 'It is a dev dependency with zero runtime dependencies, shipped as ESM and CommonJS with TypeScript types. It only runs in your tests.'],
];

const STEPS = [
  ['Install', 'Add edgegoat as a dev dependency. No configuration, no runtime dependencies.'],
  ['Pick the specimens', 'Call a generator and filter it with <code>{ tags }</code> or <code>{ exclude }</code>: DST gaps, surrogate pairs, <code>-0</code>, path traversal.'],
  ['Run them with test.each', 'Each case has a <code>label</code> for the test title and a <code>why</code> for the failure, so a red test tells you what broke.'],
];

// FAQ as a Monsoon accordion: native <details>, open without any script.
function faqAccordion(faq, name) {
  return `<div class="accordion collapse-plus faq" v-pre>
    ${faq.map(([q, a], i) => `<details class="collapse" name="${name}"${i === 0 ? ' open' : ''}><summary class="collapse-title">${esc(q)}</summary><div class="collapse-content"><p>${a}</p></div></details>`).join('\n    ')}
  </div>`;
}

function installTabs(name) {
  return `<div class="tabs tabs-boxed tabs-sm install-tabs" role="tablist" aria-label="Package manager">
    ${INSTALL.map(([pm, cmd], i) => `<input type="radio" name="${name}" class="tab" aria-label="${pm}"${i === 0 ? ' checked' : ''}>
    <div class="tab-content" role="tabpanel">${code(cmd, 'sh', 'Terminal')}</div>`).join('\n    ')}
  </div>`;
}

function indexPage() {
  const stat = (n, label) => `<div class="stat"><p class="stat-value">${n}</p><p class="stat-title">${label}</p></div>`;
  const tagTotal = new Set(cases.flatMap((c) => c.tags)).size;
  const body = `
<section class="intro" aria-labelledby="intro-h">
  <div class="wrap intro-grid">
    <div>
      <p class="eyebrow">${icon('ui-jar')}<span>Specimen catalog, v${pkg.version}</span></p>
      <h1 id="intro-h">edgegoat: <span class="hl">edge case test inputs</span> for JavaScript</h1>
      <p class="lede">The inputs that break code, ready to drop into your tests. Curated specimens for <strong>time zones</strong>, <strong>daylight saving time</strong>, <strong>dates before 1970</strong>, <strong>unicode test strings</strong>, <strong>-0 and NaN</strong>, URLs, paths and JSON, each with the reason it breaks code. For Vitest, Jest, node:test and Mocha.</p>
      <div class="intro-actions">
        <div class="mini-term">${code(INSTALL[0][1], 'sh', 'Terminal')}</div>
        <a class="btn btn-primary" href="#catalog">Open the lab ${icon('ui-arrow')}</a>
        <a class="btn btn-outline btn-neutral" href="${GUIDES[0].slug}">${icon('ui-book')}Read the guides</a>
      </div>
    </div>
    <div class="intro-side">
      ${shelf()}
      <div class="stats intro-stats">
        ${stat(total, 'specimens')}
        ${stat(GENERATORS.length, 'generators')}
        ${stat(tagTotal, 'tags')}
        ${stat(0, 'dependencies')}
      </div>
    </div>
  </div>
  ${ridge('ridge intro-ridge')}
</section>

${lab()}

<div>
<section id="quick-start" class="nb-section" aria-labelledby="qs-h">
  <div class="wrap nb-grid">
    <div class="nb-head">
      <p class="kicker">${icon('ui-terminal')}Procedure</p>
      <h2 id="qs-h">Edge cases in a real test suite</h2>
      <p>Every generator returns an array of <code>{ label, value, why, tags }</code> objects, so it plugs straight into <code>test.each</code>. Filter with <code>{ tags: [...] }</code> or <code>{ exclude: [...] }</code>, pick zones with <code>dates({ zone: 'Europe/Berlin' })</code>.</p>
      <ol id="how-it-works" class="procedure">
        ${STEPS.map(([h, p], i) => `<li><span class="proc-n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><div><h3>${esc(h)}</h3><p>${p}</p></div></li>`).join('\n        ')}
      </ol>
      ${installTabs('pm')}
    </div>
    <div class="nb-code">
      ${code(SHOWCASE, 'ts', 'dates.test.ts')}
    </div>
  </div>
</section>

<section id="bugs" class="nb-section nb-alt" aria-labelledby="bugs-h">
  <div class="wrap">
    <div class="nb-title">
      <p class="kicker">${icon('ui-bug')}Field samples</p>
      <h2 id="bugs-h">Bugs these inputs found</h2>
      <p>Real bugs of this kind, fixed upstream by the author of edgegoat in widely used projects. The library packages the inputs that exposed them.</p>
    </div>
    <ul class="samples">
      ${BUGS.map(([name, url, gen, text], i) => `<li class="sample"><div class="sample-head">${icon(gen, 'ic sample-ic')}<span class="sample-no">Sample ${String.fromCharCode(65 + i)}</span></div><a href="${url}" class="sample-link">${esc(name)}</a><p>${esc(text)}</p></li>`).join('\n      ')}
    </ul>
  </div>
</section>

<section id="guides" class="nb-section" aria-labelledby="guides-h">
  <div class="wrap">
    <div class="nb-title">
      <p class="kicker">${icon('ui-book')}Lab notes</p>
      <h2 id="guides-h">Guides</h2>
      <p>One bug class per guide: the bug explained, a naive implementation that fails, and the edgegoat test that catches it.</p>
    </div>
    <ul class="notes">
      ${GUIDES.map((g) => `<li><a href="${g.slug}" class="note">${icon(groupOf(g.slug).icon, 'ic note-ic')}<span class="note-cat">${groupOf(g.slug).name}</span><strong>${esc(g.h1)}</strong><span class="note-desc">${esc(g.description)}</span><span class="note-n">${relatedCases(RELATED[g.slug]).length} specimens</span></a></li>`).join('\n      ')}
    </ul>
  </div>
</section>

<section id="faq" class="nb-section nb-alt" aria-labelledby="faq-h">
  <div class="wrap narrow">
    <div class="nb-title">
      <p class="kicker">${icon('ui-steps')}FAQ</p>
      <h2 id="faq-h">Frequently asked questions</h2>
    </div>
    ${faqAccordion(INDEX_FAQ, 'faq')}
  </div>
</section>
</div>`;
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareSourceCode',
        name: 'edgegoat',
        description: pkg.description,
        url: SITE,
        codeRepository: REPO,
        programmingLanguage: ['TypeScript', 'JavaScript'],
        runtimePlatform: 'Node.js 18+, modern browsers',
        license: 'https://opensource.org/licenses/MIT',
        version: pkg.version,
        keywords: pkg.keywords.join(', '),
        author: { '@type': 'Person', name: 'Alexandre Kohler', url: AUTHOR, sameAs: [AUTHOR, LINKEDIN] },
        image: `${SITE}og.png`,
      },
      {
        '@type': 'Dataset',
        name: 'edgegoat edge case catalog',
        description: `${total} documented edge case test inputs for JavaScript, each with a label, a value, the reason it breaks code and tags.`,
        url: `${SITE}#catalog`,
        license: 'https://opensource.org/licenses/MIT',
        creator: { '@type': 'Person', name: 'Alexandre Kohler', url: AUTHOR },
        distribution: { '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: `${SITE}catalog.json` },
      },
      {
        '@type': 'FAQPage',
        mainEntity: INDEX_FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: strip(a) } })),
      },
    ],
  };
  return layout({
    slug: 'index.html',
    title: 'edgegoat: edge case test inputs for JavaScript (time zones, DST, unicode, -0)',
    description: `${total} documented edge cases for JavaScript tests: time zones, daylight saving time, dates before 1970, unicode test strings, -0, NaN, URLs, paths and JSON. Works with Vitest, Jest and node:test.`,
    body,
    jsonld,
    type: 'website',
    current: 'lab',
  });
}

// ------------------------------------------------------------ guides: lab notes
function guideTabs(slug) {
  const group = groupOf(slug);
  const top = GROUPS.map((g) => {
    const on = g === group;
    return `<a href="${g.slugs[0]}" class="tab"${on ? ' aria-current="page"' : ''}>${icon(g.icon)}${g.name}<span class="badge badge-xs${on ? ' badge-primary' : ''}">${g.slugs.length}</span></a>`;
  }).join('');
  const sub = group.slugs.map((s) => `<a href="${s}" class="tab"${s === slug ? ' aria-current="page"' : ''}>${esc(guideBySlug(s).nav)}</a>`).join('');
  return `<div class="dash-tabs">
  <div class="wrap">
    <nav class="tabs tabs-line cat-tabs" aria-label="Guide categories"><a href="./#catalog" class="tab">${icon('all')}Lab</a>${top}</nav>
    <nav class="tabs tabs-pills tabs-sm sub-tabs" aria-label="${group.name} guides">${sub}</nav>
  </div>
</div>`;
}

function guidePage(g) {
  const group = groupOf(g.slug);
  const rel = RELATED[g.slug];
  const specimens = relatedCases(rel);
  const words = strip(g.lede + g.sections.map(([, html]) => html).join(' ')).split(/\s+/).length;
  const minutes = Math.max(2, Math.round(words / 200));
  const sections = g.sections.map(([h, html]) => [h, slugify(h), html.replace(/<table>/g, '<div class="table-wrap"><table class="table table-compact">').replace(/<\/table>/g, '</table></div>')]);
  const toc = [...sections.map(([h, id]) => [h, id]), ['FAQ', 'faq']];
  const panel = specimens.slice(0, 8).map((c) => `<li><a href="./?case=${c.id}#catalog" class="spec-row"><span class="spec-label" v-pre>${esc(c.label)}</span><code v-pre>${esc(c.value.length > 46 ? `${c.value.slice(0, 43)}...` : c.value)}</code></a></li>`).join('\n          ');
  const others = GUIDES.filter((o) => o.slug !== g.slug)
    .map((o) => `<li><a href="${o.slug}" class="note">${icon(groupOf(o.slug).icon, 'ic note-ic')}<span class="note-cat">${groupOf(o.slug).name}</span><strong>${esc(o.h1)}</strong></a></li>`)
    .join('\n      ');
  const body = `
${guideTabs(g.slug)}
<div class="wrap dash">
  <header class="dash-head">
    <nav aria-label="Breadcrumb"><ol class="breadcrumbs"><li><a href="./">edgegoat</a></li><li><a href="${group.slugs[0]}">${group.name}</a></li><li><span aria-current="page">${esc(g.nav)}</span></li></ol></nav>
    <h1>${esc(g.h1)}</h1>
    <p class="lede" v-pre>${g.lede}</p>
    <div class="stats dash-stats">
      <div class="stat"><p class="stat-title">Specimens</p><p class="stat-value">${specimens.length}</p><p class="stat-desc">${rel.gen}()${rel.tags.length ? `, ${rel.tags.length} tag${rel.tags.length > 1 ? 's' : ''}` : ''}</p></div>
      <div class="stat"><p class="stat-title">Reading time</p><p class="stat-value">${minutes} min</p><p class="stat-desc">${sections.length} sections</p></div>
      <div class="stat"><p class="stat-title">Updated</p><p class="stat-value stat-date">${UPDATED}</p><p class="stat-desc">edgegoat ${pkg.version}</p></div>
    </div>
  </header>
  <div class="dash-grid">
    <article class="prose dash-article">
      ${sections.map(([h, id, html]) => `<section id="${id}" class="dash-card" aria-labelledby="${id}-h"><h2 id="${id}-h">${esc(h)}</h2>\n${html}\n</section>`).join('\n      ')}
      <section id="faq" class="dash-card" aria-labelledby="faq-h"><h2 id="faq-h">FAQ</h2>
        ${faqAccordion(g.faq, 'faq')}
      </section>
    </article>
    <aside class="dash-side" aria-label="Related specimens and contents">
      <div class="side-card">
        <div class="side-head">${jar({ glyph: `i-${rel.gen}`, cls: 'jar-art side-jar' })}<div><p class="side-kicker">From the lab</p><p class="side-title">${specimens.length} specimens for this note</p></div></div>
        <ul class="spec-list">
          ${panel}
        </ul>
        <a href="${labHref('./', rel)}" class="btn btn-sm btn-primary side-btn">Open them in the lab ${icon('ui-arrow')}</a>
      </div>
      <nav class="side-card toc-card" aria-labelledby="toc-h">
        <p id="toc-h" class="toc-title">On this page</p>
        <ul class="toc">
          ${toc.map(([h, id]) => `<li><a href="#${id}">${esc(h)}</a></li>`).join('\n          ')}
        </ul>
      </nav>
    </aside>
  </div>
  <section class="more-notes" aria-labelledby="more-h">
    <h2 id="more-h">More lab notes</h2>
    <ul class="notes notes-sm">
      ${others}
    </ul>
  </section>
</div>`;
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        headline: g.h1,
        description: g.description,
        url: SITE + g.slug,
        image: `${SITE}og.png`,
        datePublished: PUBLISHED,
        dateModified: UPDATED,
        inLanguage: 'en',
        proficiencyLevel: 'Intermediate',
        author: { '@type': 'Person', name: 'Alexandre Kohler', url: AUTHOR, sameAs: [AUTHOR, LINKEDIN] },
        about: g.about,
        timeRequired: `PT${minutes}M`,
        isPartOf: { '@type': 'WebSite', name: 'edgegoat', url: SITE },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'edgegoat', item: SITE },
          { '@type': 'ListItem', position: 2, name: group.name, item: SITE + group.slugs[0] },
          { '@type': 'ListItem', position: 3, name: g.nav, item: SITE + g.slug },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: g.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: strip(a) } })),
      },
    ],
  };
  return layout({ slug: g.slug, title: g.title, description: g.description, body, jsonld, current: 'guides' });
}

write('docs/index.html', indexPage());
for (const g of GUIDES) write(`docs/${g.slug}`, guidePage(g));

write(
  'docs/404.html',
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
${THEME_BOOT}
<title>Page not found | edgegoat</title>
<meta name="robots" content="noindex">
<link rel="icon" href="/edgegoat/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${MONSOON_CSS}">
<link rel="stylesheet" href="/edgegoat/style.css">
</head>
<body class="antialiased page-404">
${sprite()}
<main id="main" class="lost">
  <div class="lost-card">
    ${jar({ glyph: 'i-paths', cls: 'jar-art lost-jar', label: '404' })}
    <p class="kicker">Specimen missing</p>
    <h1>This page fell off the edge</h1>
    <p>The page you were looking for is not on any shelf. Ledge checked every ledge.</p>
    <p class="lost-actions"><a class="btn btn-primary" href="/edgegoat/">Back to the lab</a> <a class="btn btn-outline btn-neutral" href="/edgegoat/${GUIDES[0].slug}">Read the guides</a></p>
    <p class="lost-made"><img src="/edgegoat/assets/mascot.svg" width="28" height="28" alt="" class="mascot"> Made by <a href="${AUTHOR}" rel="me noopener">Alexandre Kohler</a> (<a href="${LINKEDIN}" rel="me noopener">LinkedIn</a>). Built with <a href="https://kwy404.github.io/monsoon/">Monsoon</a>. Interactive parts built with <a href="https://kwy404.github.io/Voodoo.js/">Voodoo.js</a>.</p>
    <p class="lost-more">More from kwy404: ${PROJECTS.map(([name, href]) => `<a href="${href}">${esc(name)}</a>`).join(', ')}.</p>
  </div>
  ${ridge('ridge lost-ridge')}
</main>
</body>
</html>
`,
);

write(
  'docs/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}</loc><lastmod>${UPDATED}</lastmod><changefreq>monthly</changefreq><priority>1.0</priority></url>
${GUIDES.map((g) => `  <url><loc>${SITE}${g.slug}</loc><lastmod>${UPDATED}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`).join('\n')}
</urlset>
`,
);
write('docs/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);
write('docs/.nojekyll', '');

// Static files the site needs from assets/.
mkdirSync(join(root, 'docs/assets'), { recursive: true });
copyFileSync(join(root, 'assets/mascot.svg'), join(root, 'docs/assets/mascot.svg'));
copyFileSync(join(root, 'assets/favicon.svg'), join(root, 'docs/favicon.svg'));
// The site draws its icons inline (scripts/site-art.mjs); the old copies go.
rmSync(join(root, 'docs/assets/icons'), { recursive: true, force: true });
// Syntax highlighting is part of the build, so the generated docs check covers it.
const highlighted = await highlightDocs();
console.log(`highlighted code in ${highlighted.length} pages`);
console.log(`catalog: ${total} cases`, counts);
