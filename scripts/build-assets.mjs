// Generates the static artwork from assets/mascot.svg: README banners, the
// category icon set, the favicon and the animated terminal demo.
// Usage: node scripts/build-assets.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = (file, text) => {
  mkdirSync(dirname(join(root, file)), { recursive: true });
  writeFileSync(join(root, file), text);
  console.log(`wrote ${file} (${Buffer.byteLength(text)} bytes)`);
};

export const COLORS = {
  teal: '#2E9C8A',
  amber: '#F2A93B',
  slate: '#22303C',
  cream: '#FBF7EE',
};
const FONT = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;
const MONO = `ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace`;

const mascot = readFileSync(join(root, 'assets/mascot.svg'), 'utf8');
/** Inner markup of the mascot with ids made unique for the host document. */
function mascotInner(prefix) {
  return mascot
    .replace(/^[\s\S]*?<desc[^>]*>[\s\S]*?<\/desc>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replaceAll('ledge-badge', `${prefix}-badge`)
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

// ---------------------------------------------------------------- banners
const CHIPS = ['time zones', 'DST', 'unicode', '-0 and NaN', 'URLs', 'paths', 'JSON'];

function banner(theme) {
  const dark = theme === 'dark';
  const ink = dark ? '#F3F4F6' : COLORS.slate;
  const sub = dark ? '#C9D1D9' : '#3D4B57';
  const chipFill = dark ? 'rgba(46,156,138,0.22)' : 'rgba(46,156,138,0.12)';
  const chipInk = dark ? '#8FE0D2' : '#1F6F62';
  let x = 452;
  const chips = CHIPS.map((label) => {
    const w = Math.round(label.length * 11.2 + 32);
    const g = `<g transform="translate(${x} 250)"><rect width="${w}" height="38" rx="19" fill="${chipFill}"/><text x="${w / 2}" y="25" text-anchor="middle" font-size="19" font-weight="600" fill="${chipInk}">${label}</text></g>`;
    x += w + 10;
    return g;
  }).join('\n    ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 360" width="1280" height="360" role="img" aria-labelledby="t d">
  <title id="t">edgegoat: edge case test inputs for JavaScript</title>
  <desc id="d">Ledge the mountain goat standing on a cliff edge next to the edgegoat name and the tagline: the inputs that break code, ready to drop into your tests.</desc>
  <g transform="translate(96 30) scale(0.75)">
    ${mascotInner(`banner-${theme}`)}
  </g>
  <g font-family="${FONT}">
    <text x="448" y="150" font-size="104" font-weight="800" letter-spacing="-3" fill="${ink}">edge<tspan fill="${COLORS.teal}">goat</tspan></text>
    <text x="452" y="212" font-size="31" font-weight="500" fill="${sub}">The inputs that break code, ready to drop into your tests.</text>
    ${chips}
  </g>
</svg>
`;
}

// ---------------------------------------------------------------- icons
const ICON_STROKE = `fill="none" stroke="${COLORS.teal}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`;
const ICONS = {
  dates: {
    title: 'Dates',
    body: `<rect x="10" y="13" width="28" height="25" rx="5" ${ICON_STROKE}/>
  <path d="M10 21h28M18 9v7M30 9v7" ${ICON_STROKE}/>
  <rect x="25" y="27" width="7" height="6" rx="1.5" fill="${COLORS.amber}"/>`,
  },
  'time-zones': {
    title: 'Time zones',
    body: `<circle cx="24" cy="24" r="13" ${ICON_STROKE}/>
  <ellipse cx="24" cy="24" rx="5.5" ry="13" ${ICON_STROKE}/>
  <path d="M11 24h26" ${ICON_STROKE}/>
  <circle cx="35" cy="13" r="4" fill="${COLORS.amber}"/>`,
  },
  strings: {
    title: 'Strings',
    body: `<path d="M11 15h26M11 23h18M11 31h11" ${ICON_STROKE}/>
  <path d="M30 27v12M27 27h6M27 39h6" fill="none" stroke="${COLORS.amber}" stroke-width="3" stroke-linecap="round"/>`,
  },
  numbers: {
    title: 'Numbers',
    body: `<path d="M20 11l-3 26M31 11l-3 26M12 19h25M11 29h25" ${ICON_STROKE}/>
  <path d="M33 38h7" fill="none" stroke="${COLORS.amber}" stroke-width="3.5" stroke-linecap="round"/>`,
  },
  urls: {
    title: 'URLs and emails',
    body: `<rect x="7" y="19" width="20" height="10" rx="5" transform="rotate(-45 17 24)" ${ICON_STROKE}/>
  <rect x="21" y="19" width="20" height="10" rx="5" transform="rotate(-45 31 24)" ${ICON_STROKE}/>
  <circle cx="24" cy="24" r="2.6" fill="${COLORS.amber}"/>`,
  },
  paths: {
    title: 'Paths',
    body: `<path d="M9 16a3 3 0 0 1 3-3h8l4 4h12a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3z" ${ICON_STROKE}/>
  <path d="M21 32l6-10" fill="none" stroke="${COLORS.amber}" stroke-width="3" stroke-linecap="round"/>`,
  },
  json: {
    title: 'JSON',
    body: `<path d="M19 11c-4 0-5 2-5 5v4c0 2-1 4-4 4c3 0 4 2 4 4v4c0 3 1 5 5 5M29 11c4 0 5 2 5 5v4c0 2 1 4 4 4c-3 0-4 2-4 4v4c0 3-1 5-5 5" ${ICON_STROKE}/>
  <circle cx="24" cy="24" r="2.8" fill="${COLORS.amber}"/>`,
  },
  arrays: {
    title: 'Arrays',
    body: `<path d="M17 11h-6v26h6M31 11h6v26h-6" ${ICON_STROKE}/>
  <circle cx="18" cy="24" r="2.4" fill="${COLORS.teal}"/>
  <circle cx="24" cy="24" r="2.4" fill="none" stroke="${COLORS.amber}" stroke-width="2"/>
  <circle cx="30" cy="24" r="2.4" fill="${COLORS.teal}"/>`,
  },
  helpers: {
    title: 'Helpers',
    body: `<circle cx="24" cy="26" r="12" ${ICON_STROKE}/>
  <path d="M20 9h8M24 9v5M24 26v-7" ${ICON_STROKE}/>
  <path d="M24 26l6 4" fill="none" stroke="${COLORS.amber}" stroke-width="3" stroke-linecap="round"/>`,
  },
};

function icon(name, { title, body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="${title} icon">
  <title>${title}</title>
  <rect width="48" height="48" rx="12" fill="${COLORS.teal}" fill-opacity="0.14"/>
  ${body}
</svg>
`;
}

// ---------------------------------------------------------------- favicon
function favicon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <title>edgegoat</title>
  <defs><clipPath id="fav"><circle cx="32" cy="32" r="31"/></clipPath></defs>
  <circle cx="32" cy="32" r="31" fill="${COLORS.teal}"/>
  <g clip-path="url(#fav)">
    <g transform="translate(-72 -20) scale(0.4)">
      <g stroke="${COLORS.slate}" stroke-width="9" stroke-linejoin="round" stroke-linecap="round" fill="${COLORS.cream}">
        <path d="M226 196 L246 140 L284 146 L266 232 L222 232 Z"/>
        <path d="M240 122 Q258 112 284 124 L316 154 Q322 166 308 172 L274 170 Q250 168 240 150 Z"/>
        <path d="M276 168 L300 170 L288 204 Z"/>
        <path d="M244 134 Q222 128 212 140 Q228 148 246 146 Z"/>
      </g>
      <path d="M252 120 Q244 86 214 82" fill="none" stroke="${COLORS.slate}" stroke-width="14" stroke-linecap="round"/>
      <path d="M266 120 Q262 92 238 80" fill="none" stroke="${COLORS.slate}" stroke-width="11" stroke-linecap="round"/>
      <circle cx="278" cy="140" r="8" fill="${COLORS.slate}"/>
    </g>
  </g>
</svg>
`;
}

// ---------------------------------------------------------------- demo
// An animated terminal (SMIL, so it plays inside an <img> on GitHub).
function demo() {
  const W = 920;
  const LINE = 25;
  const DUR = 14;
  const lines = [
    { t: '$ npx vitest run is-same-year.test.ts', c: '#E5E7EB', cmd: true },
    { t: '' },
    { t: ' isSameYear(a, b, timeZone)', c: '#E5E7EB', bold: true },
    { badge: 'PASS', t: 'March 14 and November 2, 2026 in America/New_York' },
    { badge: 'PASS', t: 'July 1, 2025 and July 1, 2026 are different years' },
    { badge: 'PASS', t: 'two summer dates in Europe/London' },
    { badge: 'FAIL', t: 'edgegoat: Pacific/Kiritimati: first instant of 2026 local time' },
    { t: '         expected false to be true', c: '#FCA5A5' },
    { t: '         Local time is 2026-01-01 00:00 (UTC+14:00) but the UTC year is', c: '#94A3B8' },
    { t: '         still 2025; a year check with getUTCFullYear() is off by one.', c: '#94A3B8' },
    { badge: 'FAIL', t: 'edgegoat: America/New_York: last instant of 2025 local time' },
    { t: '         expected false to be true', c: '#FCA5A5' },
    { t: '' },
    { summary: true },
  ];
  const H = 64 + lines.length * LINE + 30;
  const start = 1.6;
  const step = 0.55;
  const k = (s) => (s / DUR).toFixed(4);
  const fade = (i) => {
    const t0 = start + i * step;
    return `<animate attributeName="opacity" dur="${DUR}s" repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes="0;${k(t0)};${k(t0 + 0.15)};${k(DUR - 1.2)};${k(DUR - 0.8)};1"/>`;
  };
  const body = lines
    .map((line, i) => {
      const y = 64 + (i + 1) * LINE;
      if (line.cmd) {
        const typeEnd = 1.3;
        return `<g>
      <clipPath id="type"><rect x="20" y="${y - 18}" height="26" width="0">
        <animate attributeName="width" dur="${DUR}s" repeatCount="indefinite" values="0;0;${W - 40};${W - 40};0;0" keyTimes="0;${k(0.2)};${k(typeEnd)};${k(DUR - 1.2)};${k(DUR - 0.8)};1"/>
      </rect></clipPath>
      <text x="24" y="${y}" fill="${line.c}" clip-path="url(#type)"><tspan fill="${COLORS.teal}">$</tspan>${line.t.slice(1)}</text>
    </g>`;
      }
      if (!line.t && !line.summary) return '';
      if (line.summary) {
        return `<g opacity="0">${fade(i)}
      <text x="24" y="${y}" fill="#E5E7EB"><tspan font-weight="700"> Tests </tspan><tspan fill="#F87171" font-weight="700">2 failed</tspan><tspan fill="#94A3B8"> | </tspan><tspan fill="#34D399" font-weight="700">3 passed</tspan><tspan fill="#94A3B8"> (5)</tspan></text>
    </g>`;
      }
      if (line.badge) {
        const fail = line.badge === 'FAIL';
        return `<g opacity="0">${fade(i)}
      <rect x="30" y="${y - 16}" width="50" height="21" rx="4" fill="${fail ? '#DC2626' : '#059669'}"/>
      <text x="55" y="${y}" text-anchor="middle" fill="#FFFFFF" font-weight="700" font-size="13">${line.badge}</text>
      <text x="92" y="${y}" fill="${fail ? '#FCA5A5' : '#D1D5DB'}">${line.t}</text>
    </g>`;
      }
      const indented = line.t.startsWith('         ');
      return `<g opacity="0">${fade(i)}
      <text x="${indented ? 92 : 24}" y="${y}" fill="${line.c}"${line.bold ? ' font-weight="700"' : ''}>${indented ? line.t.trim() : line.t}</text>
    </g>`;
    })
    .join('\n    ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
  <title id="t">edgegoat demo: a naive isSameYear fails on New Year edge cases</title>
  <desc id="d">Animated terminal: Vitest runs isSameYear tests, three ordinary cases pass, then two edgegoat time zone cases around New Year in Pacific/Kiritimati and America/New_York fail because the code compared UTC years.</desc>
  <rect width="${W}" height="${H}" rx="14" fill="#0F1720"/>
  <rect width="${W}" height="40" rx="14" fill="#1B2733"/>
  <rect y="26" width="${W}" height="14" fill="#1B2733"/>
  <circle cx="26" cy="20" r="6.5" fill="#F87171"/>
  <circle cx="48" cy="20" r="6.5" fill="${COLORS.amber}"/>
  <circle cx="70" cy="20" r="6.5" fill="#34D399"/>
  <text x="${W / 2}" y="25" text-anchor="middle" font-family="${FONT}" font-size="14" fill="#94A3B8">edgegoat: test isSameYear across time zones</text>
  <g font-family="${MONO}" font-size="15" xml:space="preserve">
    ${body}
  </g>
</svg>
`;
}

out('assets/banner.svg', banner('light'));
out('assets/banner-dark.svg', banner('dark'));
for (const [name, def] of Object.entries(ICONS)) out(`assets/icons/${name}.svg`, icon(name, def));
out('assets/favicon.svg', favicon());
out('assets/demo.svg', demo());
