// Pre-renders syntax highlighting for every code block in docs/*.html with
// Shiki and the VS Code themes light-plus and dark-plus (dual themes, switched
// by CSS). No highlighter runs in the browser.
//
// Source blocks are written by scripts/build-docs.mjs as
//   <pre><code class="language-js" data-title="optional file name">raw code</code></pre>
// and replaced by an editor style block. Running this again first turns every
// highlighted block back into its source form, so the output is idempotent.
// Usage: npm run docs:highlight   (also runs at the end of npm run docs)
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHighlighter } from 'shiki';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const docs = join(root, 'docs');

// File icon text per language, in the colors VS Code uses (see style.css).
const ICONS = { js: 'JS', ts: 'TS', sh: '&gt;_', yaml: 'YML', json: 'JSON', html: '&lt;/&gt;' };

/** File name shown in the editor tab when the block has no data-title. */
function defaultTitle(lang, code) {
  const isTest = /\b(test|it|describe)(\.each)?\(/.test(code);
  if (lang === 'js' || lang === 'ts') return `example${isTest ? '.test' : ''}.${lang}`;
  if (lang === 'sh') return 'Terminal';
  if (lang === 'yaml') return 'ci.yml';
  return lang;
}
const THEMES = { light: 'light-plus', dark: 'dark-plus' };

const SOURCE = /<pre><code class="language-([\w-]+)"(?: data-title="([^"]*)")?>([\s\S]*?)<\/code><\/pre>/g;
const RENDERED = /<div class="code-block" data-lang="([\w-]+)"(?: data-title="([^"]*)")?>[\s\S]*?<code>([\s\S]*?)<\/code><\/pre><\/div><!--\/code-block-->/g;

const escText = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const escAttr = (s) => escText(s).replaceAll('"', '&quot;');

function decode(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&');
}

/** Turns highlighted blocks back into source blocks. */
export function unhighlight(html) {
  return html.replace(RENDERED, (_, lang, title, inner) => {
    const t = title === undefined ? '' : ` data-title="${title}"`;
    return `<pre><code class="language-${lang}"${t}>${escText(decode(inner))}</code></pre>`;
  });
}

let highlighter;
async function getHighlighter(langs) {
  highlighter ??= await createHighlighter({ themes: Object.values(THEMES), langs: [] });
  for (const lang of langs) {
    if (!highlighter.getLoadedLanguages().includes(lang)) await highlighter.loadLanguage(lang);
  }
  return highlighter;
}

/** Highlights every source block of one HTML document. */
export async function highlightHtml(html) {
  const source = unhighlight(html);
  const blocks = [...source.matchAll(SOURCE)];
  if (!blocks.length) return source;
  const hl = await getHighlighter([...new Set(blocks.map((b) => b[1]))]);
  let n = 0;
  return source.replace(SOURCE, (_, lang, title, inner) => {
    n += 1;
    const id = `code-${n}`;
    const code = decode(inner);
    const lines = code.split('\n').length;
    const label = title ? decode(title) : defaultTitle(lang, code);
    const pre = hl
      .codeToHtml(code, { lang, themes: THEMES, defaultColor: false })
      .replace('<pre class="shiki', `<pre id="${id}" v-pre aria-label="${escAttr(label)} code" class="shiki${lines >= 3 ? ' numbered' : ''}`);
    const t = title === undefined ? '' : ` data-title="${title}"`;
    return (
      `<div class="code-block" data-lang="${lang}"${t}>` +
      `<div class="code-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>` +
      `<span class="code-tab"><span class="file-icon" data-lang="${lang}" aria-hidden="true">${ICONS[lang] ?? ''}</span><span class="code-title">${escText(label)}</span></span>` +
      `<button type="button" class="copy" v-cloak v-copy-from="#${id}" v-copy-label="Copied" aria-label="Copy ${escAttr(label)} code">Copy</button></div>` +
      `${pre}</div><!--/code-block-->`
    );
  });
}

/** Highlights every docs/*.html file in place. Returns the files that changed. */
export async function highlightDocs() {
  const changed = [];
  for (const file of readdirSync(docs).filter((f) => f.endsWith('.html')).sort()) {
    const path = join(docs, file);
    const before = readFileSync(path, 'utf8');
    const after = await highlightHtml(before);
    if (after !== before) {
      writeFileSync(path, after);
      changed.push(file);
    }
  }
  return changed;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const changed = await highlightDocs();
  console.log(changed.length ? `highlighted ${changed.join(', ')}` : 'code blocks already highlighted');
}
