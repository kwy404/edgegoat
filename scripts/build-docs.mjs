// Builds everything that is derived from the library itself:
//   docs/catalog.json, assets/catalog.svg, the generated README sections,
//   and the static site in docs/ (index, guides, sitemap, robots, 404).
// Usage: npm run docs   (builds the library first)
import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { GUIDES } from './site-content.mjs';

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
  ['README.pt-BR.md', 'pt'],
]) {
  let text = readFileSync(join(root, file), 'utf8');
  text = replaceBetween(text, 'grid', grid(lang));
  text = text.replace(/<!-- total -->\d+<!-- \/total -->/g, `<!-- total -->${total}<!-- /total -->`);
  if (lang === 'en') text = replaceBetween(text, 'catalog', catalogTables());
  write(file, text);
}

// ------------------------------------------------------------ site
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

export function layout({ slug, title, description, body, jsonld, type = 'article' }) {
  const url = SITE + (slug === 'index.html' ? '' : slug);
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
<link rel="stylesheet" href="style.css">
<script type="application/ld+json">
${JSON.stringify(jsonld, null, 2)}
</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-row">
    <a class="brand" href="./"><img src="assets/mascot.svg" width="40" height="40" alt="Ledge the goat, edgegoat logo"><span>edge<b>goat</b></span></a>
    <nav aria-label="Main">
      <a href="./#catalog">Catalog</a>
      <a href="./#guides">Guides</a>
      <a href="${REPO}">GitHub</a>
      <a href="${NPM}">npm</a>
    </nav>
  </div>
</header>
<main id="main" class="wrap">
${body}
</main>
<footer class="site-footer">
  <div class="wrap">
    <p><strong>Guides:</strong> ${GUIDES.map((g) => `<a href="${g.slug}">${esc(g.nav)}</a>`).join(' <span aria-hidden="true">/</span> ')}</p>
    <p>edgegoat is MIT licensed, made by <a href="https://github.com/kwy404">Alexandre Kohler</a>. <a href="${REPO}">Source on GitHub</a>.</p>
  </div>
</footer>
</body>
</html>
`;
}

const code = (text, lang = 'js') => `<pre><code class="language-${lang}">${esc(text.trim())}</code></pre>`;

function caseArticle(c) {
  const tags = c.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('');
  const ref = c.ref ? ` <a class="ref" href="${esc(c.ref)}">real bug</a>` : '';
  const search = [c.generator, c.label, c.why, c.tags.join(' '), c.value, c.zone ?? ''].join(' ').toLowerCase();
  return `<li class="case" data-generator="${c.generator}" data-search="${esc(search)}">
  <div class="case-head"><code class="gen">${c.generator}()</code><h3>${esc(c.label)}</h3></div>
  <code class="value">${esc(c.value)}</code>
  <p>${esc(c.why)}${ref}</p>
  <div class="tags">${tags}</div>
</li>`;
}

const BUGS = [
  ['github/relative-time-element#384', 'https://github.com/github/relative-time-element/pull/384', 'The "is this the current year?" check used UTC instead of the display time zone, so dates near New Year showed or hid the year incorrectly.'],
  ['mozilla/pdf.js#22017', 'https://github.com/mozilla/pdf.js/pull/22017', 'util.printf dropped the sign of negative numbers greater than -1, such as -0.5.'],
  ['google/budoux#1411', 'https://github.com/google/budoux/pull/1411', 'Text segmentation could split a surrogate pair, producing half an emoji.'],
  ['microsoft/vscode-js-debug#2423', 'https://github.com/microsoft/vscode-js-debug/pull/2423', 'trimEnd style truncation could cut a surrogate pair in half.'],
  ['salesforce/tough-cookie#644', 'https://github.com/salesforce/tough-cookie/pull/644', 'A cookie with an infinite max-age has to be treated as never expiring.'],
  ['vuejs/core#15618', 'https://github.com/vuejs/core/pull/15618', 'A fix in the Vue 3 compat build.'],
];

function indexPage() {
  const tiles = GRID.map((g) => {
    const n = g.fns.length ? `${gridCount(g.fns)} cases` : '4 functions';
    return `<li><img src="assets/icons/${g.icon}.svg" width="40" height="40" alt="${esc(g.alt)}"><div><strong>${esc(g.en[0])}</strong> <span class="count">${n}</span><p>${esc(g.en[1])}</p></div></li>`;
  }).join('\n      ');
  const options = GENERATORS.map((g) => `<option value="${g.fn}">${g.fn}() (${counts[g.fn]})</option>`).join('');
  const body = `
<section class="hero">
  <img class="hero-mascot" src="assets/mascot.svg" width="168" height="168" alt="Ledge, the edgegoat mascot: a mountain goat standing on the edge of a cliff">
  <div>
    <h1>edgegoat: edge case test inputs for JavaScript</h1>
    <p class="tagline">The inputs that break code, ready to drop into your tests.</p>
    <p>${total} curated, documented edge cases for <strong>time zones</strong>, <strong>daylight saving time</strong>, <strong>dates before 1970</strong>, <strong>unicode test strings</strong>, <strong>-0 and NaN</strong>, URLs, paths and JSON. Each one says why it breaks code. Works with Vitest, Jest, node:test and Mocha, in TypeScript or JavaScript, with zero dependencies.</p>
    <p class="cta"><a class="button" href="#quick-start">Quick start</a> <a class="button ghost" href="${REPO}">View on GitHub</a></p>
  </div>
</section>

<section id="quick-start">
  <h2>Quick start</h2>
  ${code('npm install --save-dev edgegoat', 'sh')}
  ${code(`import { test, expect } from 'vitest';
import { dates, withTimeZone } from 'edgegoat';

test.each(dates({ tags: ['dst'] }))('$label', ({ value, zone }) => {
  withTimeZone(zone, () => expect(addDays(value, 1).getHours()).toBe(value.getHours()));
});`)}
  <p>Every generator returns an array of <code>{ label, value, why, tags }</code> objects, so it plugs straight into <code>test.each</code>. Filter with <code>{ tags: [...] }</code> or <code>{ exclude: [...] }</code>, pick zones with <code>dates({ zone: 'Europe/Berlin' })</code>.</p>
</section>

<section id="categories">
  <h2>What is in the box</h2>
  <ul class="grid">
      ${tiles}
  </ul>
</section>

<section id="bugs">
  <h2>Bugs these inputs found</h2>
  <p>Real bugs of this kind, fixed upstream by the author of edgegoat in widely used projects. The library packages the inputs that exposed them.</p>
  <ul class="bugs">
    ${BUGS.map(([name, url, text]) => `<li><a href="${url}">${esc(name)}</a>: ${esc(text)}</li>`).join('\n    ')}
  </ul>
</section>

<section id="catalog">
  <h2>Search the catalog</h2>
  <p>All ${total} cases, generated from the published library. Also available as <a href="catalog.json">catalog.json</a>. Emoji and invisible characters are shown as escaped code points.</p>
  <form class="filters" role="search" onsubmit="return false">
    <label for="q">Search cases</label>
    <input id="q" type="search" placeholder="Try dst, surrogate, -0, traversal" autocomplete="off">
    <label for="gen">Generator</label>
    <select id="gen"><option value="">All generators</option>${options}</select>
  </form>
  <p id="status" class="status" aria-live="polite">Showing ${total} of ${total} cases.</p>
  <ol id="cases" class="cases">
${cases.map(caseArticle).join('\n')}
  </ol>
</section>

<section id="guides">
  <h2>Guides</h2>
  <ul class="guides">
    ${GUIDES.map((g) => `<li><a href="${g.slug}"><strong>${esc(g.h1)}</strong></a><p>${esc(g.description)}</p></li>`).join('\n    ')}
  </ul>
</section>
<script src="app.js" defer></script>`;
  const jsonld = {
    '@context': 'https://schema.org',
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
  };
  return layout({
    slug: 'index.html',
    title: 'edgegoat: edge case test inputs for JavaScript (time zones, DST, unicode, -0)',
    description: `${total} documented edge cases for JavaScript tests: time zones, daylight saving time, dates before 1970, unicode test strings, -0, NaN, URLs, paths and JSON. Works with Vitest, Jest and node:test.`,
    body,
    jsonld,
    type: 'website',
  });
}

function guidePage(g) {
  const faq = g.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${a}</p></details>`).join('\n');
  const others = GUIDES.filter((o) => o.slug !== g.slug)
    .map((o) => `<li><a href="${o.slug}">${esc(o.h1)}</a></li>`)
    .join('\n    ');
  const body = `
<article class="guide">
  <p class="crumbs"><a href="./">edgegoat</a> <span aria-hidden="true">/</span> Guides</p>
  <h1>${esc(g.h1)}</h1>
  <p class="lede">${g.lede}</p>
  ${g.sections.map(([h, html]) => `<section><h2>${esc(h)}</h2>\n${html}\n</section>`).join('\n  ')}
  <section class="faq">
    <h2>FAQ</h2>
    ${faq}
  </section>
  <section>
    <h2>More guides</h2>
    <ul>
    ${others}
    </ul>
  </section>
</article>`;
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
console.log(`catalog: ${total} cases`, counts);
