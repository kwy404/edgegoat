// Builds everything that is derived from the library itself:
//   docs/catalog.json, assets/catalog.svg, the generated README sections,
//   and the static site in docs/ (index, guides, sitemap, robots, 404),
//   with code blocks highlighted by scripts/highlight-docs.mjs.
// Usage: npm run docs   (builds the library first)
import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { GUIDES } from './site-content.mjs';
import { highlightDocs } from './highlight-docs.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lib = await import(pathToFileURL(join(root, 'dist/index.js')).href);
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const SITE = 'https://kwy404.github.io/edgegoat/';
const REPO = 'https://github.com/kwy404/edgegoat';
const NPM = 'https://www.npmjs.com/package/edgegoat';
const CDN = 'https://cdn.jsdelivr.net/gh/kwy404/edgegoat@main/';
const UPDATED = '2026-10-12';
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

// Sibling projects, listed in the site footer and in README.md.
const PROJECTS = [
  ['graphemely', 'https://kwy404.github.io/graphemely/', 'Truncate, slice and count strings with emoji safely, by grapheme cluster.'],
  ['edgegoat', 'https://kwy404.github.io/edgegoat/', 'Edge case test inputs for JavaScript: time zones, DST, unicode, -0 and NaN.'],
  ['vueleap', 'https://kwy404.github.io/vueleap/', 'Migrate Vue 2 to Vue 3 with one command, with the exact @vue/compat flags you need.'],
  ['numberparrot', 'https://kwy404.github.io/numberparrot/', 'Parse localized number and currency strings back into real numbers, for any locale.'],
  ['breakhound', 'https://github.com/kwy404/breakhound', 'Find bugs in any JavaScript or TypeScript library automatically, no tests required.'],
  ['Voodoo.js', 'https://github.com/kwy404/Voodoo.js', 'The HTML first JavaScript framework: reactive directives and JSX in a plain HTML file.'],
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

const cases = [];
const counts = {};
for (const g of GENERATORS) {
  const list = lib[g.fn]();
  counts[g.fn] = list.length;
  for (const c of list) {
    const entry = { generator: g.fn, label: c.label, value: display(c.value), why: c.why, tags: [...c.tags] };
    if (c.zone) entry.zone = c.zone;
    if (c.ref) entry.ref = c.ref;
    cases.push(entry);
  }
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
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const VOODOO = 'https://cdn.jsdelivr.net/npm/voodoojs@1.0.0/dist/voodoo.full.min.js';

// Restores a saved light or dark choice before the first paint. Voodoo.js
// (v-theme-toggle) writes the choice to localStorage under voodoo:theme and
// applies it once the deferred bundle runs; this only avoids a flash before that.
const THEME_BOOT = `<script>try{var t=localStorage.getItem('voodoo:theme');if(t==='"light"'||t==='"dark"')t=t.slice(1,-1);if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t}}catch(e){}</script>`;

const ICON_THEME = '<svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 2.5a7.5 7.5 0 0 1 0 15z" fill="currentColor"/></svg>';
const ICON_MENU = '<svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

// FAQ as a Voodoo.js accordion. Questions and answers stay in the static HTML;
// without JavaScript every answer is simply open.
export function faqAccordion(faq) {
  const items = faq
    .map(
      ([q, a], i) => `<div class="faq-item" v-accordion-item${i === 0 ? '="open"' : ''}>
      <button type="button" class="faq-q">${esc(q)}</button>
      <div class="faq-a"><p>${a}</p></div>
    </div>`,
    )
    .join('\n    ');
  return `<div class="faq" v-accordion>
    ${items}
  </div>`;
}

export function layout({ slug, title, description, body, jsonld, type = 'article', scripts = [] }) {
  const url = SITE + (slug === 'index.html' ? '' : slug);
  const home = slug === 'index.html' ? '' : './';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="author" content="Alexandre Kohler">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#2E9C8A">
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
${THEME_BOOT}
<link rel="stylesheet" href="style.css">
<noscript><style>.site-nav { display: flex; }</style></noscript>
<script src="${VOODOO}" defer></script>
${scripts.map((s) => `<script src="${s}" defer></script>\n`).join('')}<script type="application/ld+json">
${JSON.stringify(jsonld, null, 2)}
</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header" v-data="{ menu: false }" @keydown.esc="menu = false">
  <div class="wrap header-row">
    <a class="brand" href="./"><img src="assets/mascot.svg" width="36" height="36" alt="Ledge the goat, edgegoat logo"><span>edge<b>goat</b></span></a>
    <nav id="site-nav" class="site-nav" :class="{ open: menu }" aria-label="Main">
      <a href="${home}#catalog" @click="menu = false">Catalog</a>
      <a href="${home}#how-it-works" @click="menu = false">How it works</a>
      <a href="${home}#guides" @click="menu = false">Guides</a>
      <a href="${home}#faq" @click="menu = false">FAQ</a>
      <a href="${REPO}">GitHub</a>
      <a href="${NPM}">npm</a>
    </nav>
    <div class="header-actions">
      <button type="button" class="icon-button" v-theme-toggle v-cloak aria-label="Toggle dark mode" title="Toggle dark mode">${ICON_THEME}</button>
      <button type="button" class="icon-button menu-button" v-cloak @click="menu = !menu" :aria-expanded="menu ? 'true' : 'false'" aria-controls="site-nav" aria-label="Menu">${ICON_MENU}</button>
    </div>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      <a class="brand" href="./"><img src="assets/mascot.svg" width="36" height="36" alt=""><span>edge<b>goat</b></span></a>
      <p>The inputs that break code, ready to drop into your tests. Zero dependencies, MIT licensed.</p>
      <p class="footer-links"><a href="${REPO}">GitHub</a> <a href="${NPM}">npm</a> <a href="catalog.json">catalog.json</a> <a href="${REPO}/blob/main/CHANGELOG.md">Changelog</a></p>
    </div>
    <div>
      <h2 class="footer-title">Guides</h2>
      <ul class="footer-list">
        ${GUIDES.map((g) => `<li><a href="${g.slug}">${esc(g.nav)}</a></li>`).join('\n        ')}
      </ul>
    </div>
    <div class="footer-more">
      <h2 class="footer-title">More from kwy404</h2>
      <ul class="footer-list projects">
        ${PROJECTS.map(([name, href, line]) => `<li><a href="${href}">${esc(name)}</a><span>${esc(line)}</span></li>`).join('\n        ')}
      </ul>
    </div>
  </div>
  <div class="wrap footer-bottom">
    <p>Made by <a href="https://github.com/kwy404">Alexandre Kohler</a>. MIT license.</p>
    <p class="credit">Interactive parts built with <a href="https://github.com/kwy404/Voodoo.js">Voodoo.js</a>.</p>
  </div>
</footer>
</body>
</html>
`;
}

// Source form of a code block. scripts/highlight-docs.mjs turns it into a
// highlighted, editor style block at the end of the build.
const code = (text, lang = 'js', title) =>
  `<pre><code class="language-${lang}"${title ? ` data-title="${esc(title)}"` : ''}>${esc(text.trim())}</code></pre>`;

// Each case stays in the static HTML. Voodoo.js only shows, hides and selects
// them. Text that may contain braces carries v-pre so it is never read as a
// template expression.
function caseArticle(c, i) {
  const tags = c.tags.map((t) => `<button type="button" class="tag" @click="toggleTag('${t}')">${esc(t)}</button>`).join('');
  const ref = c.ref ? ` <a class="ref" href="${esc(c.ref)}">real bug</a>` : '';
  return `<li class="case" v-show="isShown(${i})" :class="{ picked: pick === ${i} }">
  <div class="case-head"><code class="gen">${c.generator}()</code><h3 v-pre>${esc(c.label)}</h3><button type="button" class="more" v-cloak @click="open(${i})" :aria-expanded="pick === ${i} ? 'true' : 'false'" aria-controls="detail">Details</button></div>
  <code class="value">${esc(c.value)}</code>
  <p v-pre>${esc(c.why)}${ref}</p>
  <div class="tags" role="group" aria-label="Tags, select to filter">${tags}</div>
</li>`;
}

const INSTALL = [
  ['npm', 'npm install --save-dev edgegoat'],
  ['pnpm', 'pnpm add --save-dev edgegoat'],
  ['yarn', 'yarn add --dev edgegoat'],
  ['bun', 'bun add --dev edgegoat'],
];

function catalogUi() {
  const chips = GENERATORS.map(
    (g) =>
      `<button type="button" class="chip" :class="{ on: gen === '${g.fn}' }" :aria-pressed="gen === '${g.fn}' ? 'true' : 'false'" @click="setGen('${g.fn}')">${g.fn}() <span class="n" v-text="countFor('${g.fn}', ${counts[g.fn]})">${counts[g.fn]}</span></button>`,
  ).join('\n      ');
  return `<div class="catalog-ui" v-resource="cat:./catalog.json">
  <div class="filters" role="search">
    <label for="q">Search cases</label>
    <input id="q" type="search" v-model="q" placeholder="Try dst, surrogate, -0, traversal" autocomplete="off" spellcheck="false">
  </div>
  <div class="chips" role="group" aria-label="Filter by generator">
      <button type="button" class="chip" :class="{ on: gen === '' }" :aria-pressed="gen === '' ? 'true' : 'false'" @click="setGen('')">All <span class="n" v-text="countFor('', ${total})">${total}</span></button>
      ${chips}
  </div>
  <div class="tag-filter" v-cloak>
    <span class="tag-filter-label" id="tag-filter-label">Tags, any of:</span>
    <div class="chips" role="group" aria-labelledby="tag-filter-label">
      <button type="button" class="chip small" v-for="t in tagList()" :key="t.name" :class="{ on: tags.includes(t.name) }" :aria-pressed="tags.includes(t.name) ? 'true' : 'false'" @click="toggleTag(t.name)"><span v-text="t.name"></span> <span class="n" v-text="t.count"></span></button>
      <button type="button" class="chip small ghost" v-show="moreTags()" @click="allTags = !allTags" v-text="allTags ? 'Fewer tags' : 'More tags'"></button>
      <button type="button" class="chip small ghost" v-show="tags.length || q || gen" @click="reset()">Clear filters</button>
    </div>
  </div>
  <p id="status" class="status" role="status" v-text="status(${total})">Showing ${total} of ${total} cases.</p>
  <details class="snippet" v-cloak>
    <summary>Use this filter in a test</summary>
    <div class="code-block live">
      <div class="code-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="code-tab"><span class="file-icon" data-lang="js" aria-hidden="true">JS</span><span class="code-title">edge-cases.test.js</span></span><button type="button" class="copy" v-copy-from="#filter-snippet" v-copy-label="Copied" aria-label="Copy the test for the current filter">Copy</button></div>
      <pre class="snippet-code" tabindex="0"><code id="filter-snippet" v-text="filterSnippet()"></code></pre>
    </div>
  </details>
  <div class="catalog-body">
    <div class="case-list">
    <ol id="cases" class="cases">
${cases.map(caseArticle).join('\n')}
    </ol>
    <button type="button" class="button ghost show-all" v-cloak v-show="hiddenCount()" @click="showAll = true" v-text="'Show ' + hiddenCount() + ' more cases'"></button>
    </div>
    <aside id="detail" class="detail" v-cloak :class="{ open: pick >= 0 }" aria-label="Case details" @keydown.esc="close()">
      <div v-if="current()">
        <div class="detail-head">
          <code class="gen" v-text="current().generator + '()'"></code>
          <button type="button" class="close" @click="close()" aria-label="Close case details">Close</button>
        </div>
        <h3 id="detail-title" tabindex="-1" v-text="current().label"></h3>
        <dl>
          <dt>Value</dt>
          <dd><code class="value" v-text="current().value"></code></dd>
          <dt>Why it breaks code</dt>
          <dd v-text="current().why"></dd>
          <dt v-if="current().zone">Time zone</dt>
          <dd v-if="current().zone"><code v-text="current().zone"></code></dd>
          <dt>Tags</dt>
          <dd class="tags"><button type="button" class="tag" v-for="t in current().tags" :key="t" @click="toggleTag(t)" v-text="t"></button></dd>
        </dl>
        <p v-if="current().ref"><a :href="current().ref">Read the real bug or spec</a></p>
        <div class="code-block live">
          <div class="code-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="code-tab"><span class="file-icon" data-lang="js" aria-hidden="true">JS</span><span class="code-title">edge-case.test.js</span></span><button type="button" class="copy" v-copy-from="#case-snippet" v-copy-label="Copied" aria-label="Copy the test for this case">Copy</button></div>
          <pre class="snippet-code" tabindex="0"><code id="case-snippet" v-text="caseSnippet()"></code></pre>
        </div>
      </div>
      <p v-else class="hint">Select <strong>Details</strong> on any case to see its value, why it breaks code and a ready to paste test.</p>
    </aside>
  </div>
</div>`;
}

const BUGS = [
  ['github/relative-time-element#384', 'https://github.com/github/relative-time-element/pull/384', 'The "is this the current year?" check used UTC instead of the display time zone, so dates near New Year showed or hid the year incorrectly.'],
  ['mozilla/pdf.js#22017', 'https://github.com/mozilla/pdf.js/pull/22017', 'util.printf dropped the sign of negative numbers greater than -1, such as -0.5.'],
  ['google/budoux#1411', 'https://github.com/google/budoux/pull/1411', 'Text segmentation could split a surrogate pair, producing half an emoji.'],
  ['microsoft/vscode-js-debug#2423', 'https://github.com/microsoft/vscode-js-debug/pull/2423', 'trimEnd style truncation could cut a surrogate pair in half.'],
  ['salesforce/tough-cookie#644', 'https://github.com/salesforce/tough-cookie/pull/644', 'A cookie with an infinite max-age has to be treated as never expiring.'],
  ['vuejs/core#15618', 'https://github.com/vuejs/core/pull/15618', 'A fix in the Vue 3 compat build.'],
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

function heroTerminal() {
  const tabs = INSTALL.map(([pm], i) => `<button type="button" class="term-tab" v-tab="${pm}" aria-selected="${i === 0}">${pm}</button>`).join('\n        ');
  const panels = INSTALL.map(([pm, cmd], i) => `<div class="term-panel" v-tab-panel="${pm}"${i ? ' hidden' : ''}>
      ${code(cmd, 'sh', 'Terminal')}
    </div>`).join('\n    ');
  return `<div class="terminal" v-tabs>
    <div class="term-bar">
      <span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
      <div class="term-tabs" role="tablist" aria-label="Package manager">
        ${tabs}
      </div>
    </div>
    ${panels}
  </div>`;
}

const STEPS = [
  ['Install', 'Add edgegoat as a dev dependency. No configuration, no runtime dependencies.'],
  ['Pick the inputs', 'Call a generator and filter it with <code>{ tags }</code> or <code>{ exclude }</code>: DST gaps, surrogate pairs, <code>-0</code>, path traversal.'],
  ['Run them with test.each', 'Each case has a <code>label</code> for the test title and a <code>why</code> for the failure, so a red test tells you what broke.'],
];

function indexPage() {
  const tiles = GRID.map((g) => {
    const n = g.fns.length ? `${gridCount(g.fns)} cases` : '4 functions';
    return `<li class="tile"><img src="assets/icons/${g.icon}.svg" width="44" height="44" alt="${esc(g.alt)}"><div><h3>${esc(g.en[0])} <span class="count">${n}</span></h3><p>${esc(g.en[1])}</p></div></li>`;
  }).join('\n      ');
  const body = `
<section class="hero">
  <div class="hero-bg" aria-hidden="true"></div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="eyebrow"><span>v${pkg.version}</span> ${total} cases, ${GENERATORS.length} generators, zero dependencies</p>
      <h1>edgegoat: <span class="grad">edge case test inputs</span> for JavaScript</h1>
      <p class="tagline">The inputs that break code, ready to drop into your tests.</p>
      <p class="hero-text">Curated, documented edge cases for <strong>time zones</strong>, <strong>daylight saving time</strong>, <strong>dates before 1970</strong>, <strong>unicode test strings</strong>, <strong>-0 and NaN</strong>, URLs, paths and JSON. Each one says why it breaks code. Works with Vitest, Jest, node:test and Mocha, in TypeScript or JavaScript.</p>
      <div class="cta">
        <a class="button" href="#catalog">Browse the catalog</a>
        <a class="button ghost" href="${REPO}">View on GitHub</a>
      </div>
      <p class="badges">
        <a href="${NPM}"><img src="https://img.shields.io/npm/v/edgegoat?color=2E9C8A&amp;label=npm" height="20" alt="edgegoat npm version"></a>
        <a href="${NPM}"><img src="https://img.shields.io/npm/dm/edgegoat?color=2E9C8A" height="20" alt="edgegoat npm downloads per month"></a>
        <a href="${REPO}/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-2E9C8A" height="20" alt="MIT license"></a>
      </p>
    </div>
    <div class="hero-side">
      <img class="hero-mascot" src="assets/mascot.svg" width="200" height="200" alt="Ledge, the edgegoat mascot: a mountain goat standing on the edge of a cliff">
      ${heroTerminal()}
    </div>
  </div>
</section>

<section id="quick-start" class="band">
  <div class="wrap">
    <p class="kicker">Quick start</p>
    <h2>Edge cases in a real test suite</h2>
    <p class="section-lede">Every generator returns an array of <code>{ label, value, why, tags }</code> objects, so it plugs straight into <code>test.each</code>. Filter with <code>{ tags: [...] }</code> or <code>{ exclude: [...] }</code>, pick zones with <code>dates({ zone: 'Europe/Berlin' })</code>.</p>
    <div class="showcase">
      ${code(SHOWCASE, 'ts', 'dates.test.ts')}
    </div>
  </div>
</section>

<section id="how-it-works" class="band soft">
  <div class="wrap">
    <p class="kicker">How it works</p>
    <h2>Three steps, no setup</h2>
    <ol class="steps">
      ${STEPS.map(([h, p], i) => `<li><span class="step-n" aria-hidden="true">${i + 1}</span><h3>${esc(h)}</h3><p>${p}</p></li>`).join('\n      ')}
    </ol>
  </div>
</section>

<section id="categories" class="band">
  <div class="wrap">
    <p class="kicker">What is in the box</p>
    <h2>${total} cases across ${GENERATORS.length} generators</h2>
    <ul class="tiles">
      ${tiles}
    </ul>
  </div>
</section>

<section id="bugs" class="band soft">
  <div class="wrap">
    <p class="kicker">Proof</p>
    <h2>Bugs these inputs found</h2>
    <p class="section-lede">Real bugs of this kind, fixed upstream by the author of edgegoat in widely used projects. The library packages the inputs that exposed them.</p>
    <ul class="bugs">
      ${BUGS.map(([name, url, text]) => `<li><a href="${url}">${esc(name)}</a><p>${esc(text)}</p></li>`).join('\n      ')}
    </ul>
  </div>
</section>

<section id="catalog" class="band" v-component="edge-catalog">
  <div class="wrap">
    <p class="kicker">Catalog</p>
    <h2>Search the catalog</h2>
    <p class="section-lede">All ${total} cases, generated from the published library. Also available as <a href="catalog.json">catalog.json</a>. Emoji and invisible characters are shown as escaped code points. Pick a generator or a tag to narrow the list, open <strong>Details</strong> on a case, and copy a ready <code>test.each</code> for the current filter.</p>
    ${catalogUi()}
  </div>
</section>

<section id="guides" class="band soft">
  <div class="wrap">
    <p class="kicker">Guides</p>
    <h2>Guides</h2>
    <ul class="guides">
      ${GUIDES.map((g) => `<li><a href="${g.slug}"><strong>${esc(g.h1)}</strong><span>${esc(g.description)}</span></a></li>`).join('\n      ')}
    </ul>
  </div>
</section>

<section id="faq" class="band">
  <div class="wrap narrow">
    <p class="kicker">FAQ</p>
    <h2>Frequently asked questions</h2>
    ${faqAccordion(INDEX_FAQ)}
  </div>
</section>`;
  const strip = (html) => html.replace(/<[^>]+>/g, '').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&').replaceAll('&quot;', '"');
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
        author: { '@type': 'Person', name: 'Alexandre Kohler', url: 'https://github.com/kwy404' },
        image: `${SITE}og.png`,
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
    scripts: ['site.js'],
  });
}

function guidePage(g) {
  const others = GUIDES.filter((o) => o.slug !== g.slug)
    .map((o) => `<li><a href="${o.slug}">${esc(o.h1)}</a></li>`)
    .join('\n    ');
  const body = `
<div class="wrap">
<article class="guide">
  <p class="crumbs"><a href="./">edgegoat</a> <span aria-hidden="true">/</span> Guides</p>
  <h1>${esc(g.h1)}</h1>
  <p class="lede">${g.lede}</p>
  ${g.sections.map(([h, html]) => `<section><h2>${esc(h)}</h2>\n${html}\n</section>`).join('\n  ')}
  <section>
    <h2>FAQ</h2>
    ${faqAccordion(g.faq)}
  </section>
  <section>
    <h2>More guides</h2>
    <ul>
    ${others}
    </ul>
  </section>
</article>
</div>`;
  const strip = (html) => html.replace(/<[^>]+>/g, '').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&').replaceAll('&quot;', '"');
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        headline: g.h1,
        description: g.description,
        url: SITE + g.slug,
        image: `${SITE}og.png`,
        datePublished: UPDATED,
        dateModified: UPDATED,
        inLanguage: 'en',
        proficiencyLevel: 'Intermediate',
        author: { '@type': 'Person', name: 'Alexandre Kohler', url: 'https://github.com/kwy404' },
        about: g.about,
        isPartOf: { '@type': 'WebSite', name: 'edgegoat', url: SITE },
      },
      {
        '@type': 'FAQPage',
        mainEntity: g.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: strip(a) } })),
      },
    ],
  };
  return layout({ slug: g.slug, title: g.title, description: g.description, body, jsonld });
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
<title>Page not found | edgegoat</title>
<meta name="robots" content="noindex">
${THEME_BOOT}
<meta name="color-scheme" content="light dark">
<link rel="icon" href="/edgegoat/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/edgegoat/style.css">
</head>
<body>
<main id="main" class="wrap notfound">
  <img src="/edgegoat/assets/mascot.svg" width="160" height="160" alt="Ledge the goat looking over the cliff edge">
  <h1>This page fell off the edge</h1>
  <p>The page you were looking for does not exist. Ledge checked every ledge.</p>
  <p><a class="button" href="/edgegoat/">Back to edgegoat</a></p>
</main>
</body>
</html>
`,
);

write(
  'docs/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}</loc><lastmod>${UPDATED}</lastmod><priority>1.0</priority></url>
${GUIDES.map((g) => `  <url><loc>${SITE}${g.slug}</loc><lastmod>${UPDATED}</lastmod><priority>0.8</priority></url>`).join('\n')}
</urlset>
`,
);
write('docs/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);
write('docs/.nojekyll', '');

// Static files the site needs from assets/.
mkdirSync(join(root, 'docs/assets/icons'), { recursive: true });
copyFileSync(join(root, 'assets/mascot.svg'), join(root, 'docs/assets/mascot.svg'));
copyFileSync(join(root, 'assets/favicon.svg'), join(root, 'docs/favicon.svg'));
for (const f of readdirSync(join(root, 'assets/icons'))) copyFileSync(join(root, 'assets/icons', f), join(root, 'docs/assets/icons', f));
// Syntax highlighting is part of the build, so the generated docs check covers it.
const highlighted = await highlightDocs();
console.log(`highlighted code in ${highlighted.length} pages`);
console.log(`catalog: ${total} cases`, counts);
