// Seasonal art for the website: Ledge the goat in costume, 4 line icons and
// one hero accent per season, each in a light and a dark version. Writes
// assets/seasons/<id>/*.svg; scripts/build-docs.mjs copies them into docs/.
// Usage: node scripts/season-art.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Two palettes: the mascot badge and the line art on a light page and on a
// dark page. Same hues, the dark one is calmer so nothing glows.
const THEMES = {
  light: { badge: '#2E9C8A', ink: '#22303C', fur: '#FBF7EE', line: '#22303C', faint: '#C9D6DC', snow: '#FFFFFF', sky: '#F2A93B' },
  dark: { badge: '#1E6A5F', ink: '#0F171E', fur: '#EFE9DC', line: '#D5DEE6', faint: '#33424C', snow: '#E9F0F5', sky: '#D69A3A' },
};

// Accent colors per season, [light, dark].
const C = {
  orange: ['#E07A26', '#D9822F'],
  orangeDeep: ['#B8562A', '#B9623A'],
  purple: ['#4B3A63', '#5A4877'],
  moon: ['#F4E3A1', '#E8D58F'],
  red: ['#C8423B', '#B9463F'],
  green: ['#2F7D5B', '#3A8A66'],
  gold: ['#E8B04B', '#D9A445'],
  pink: ['#E0607E', '#D35D7A'],
  rose: ['#F29BB0', '#D98A9E'],
  magenta: ['#D6457B', '#C24A79'],
  teal: ['#2BB3A3', '#2E9E91'],
  violet: ['#7B61FF', '#7462E0'],
  blue: ['#4AA3DF', '#4794C8'],
  straw: ['#E9C46A', '#D8B460'],
  brown: ['#8A5A2B', '#7E5A36'],
  egg1: ['#F4B6C2', '#D9A2AE'],
  egg2: ['#C7B6F4', '#AFA2D9'],
  egg3: ['#F7DC8F', '#DCC57F'],
  egg4: ['#B6E3C6', '#9FCBB0'],
  flame: ['#F2A93B', '#E0993A'],
  flameHot: ['#FFD86B', '#F0C860'],
};
const col = (name, mode) => C[name][mode === 'light' ? 0 : 1];

// ------------------------------------------------------------ mascot
// The goat from assets/mascot.svg, with the sun swappable and room for a
// costume on top. Coordinates match the original 400 x 400 badge.
function goat(t) {
  return `<g stroke="${t.ink}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">
    <rect x="138" y="232" width="20" height="58" rx="9" fill="${t.fur}"/>
    <rect x="224" y="232" width="20" height="58" rx="9" fill="${t.fur}"/>
    <path d="M112 196 Q96 186 100 172 Q112 178 118 190" fill="${t.fur}"/>
    <path d="M226 196 L246 140 L284 146 L266 212 Z" fill="${t.fur}"/>
    <path d="M110 214 Q108 180 146 178 L232 178 Q262 180 262 214 Q262 250 232 252 L222 260 L212 252 L172 252 L162 260 L152 252 L142 252 Q110 250 110 214 Z" fill="${t.fur}"/>
    <rect x="118" y="236" width="20" height="54" rx="9" fill="${t.fur}"/>
    <rect x="244" y="236" width="20" height="54" rx="9" fill="${t.fur}"/>
    <path d="M240 122 Q258 112 284 124 L316 154 Q322 166 308 172 L274 170 Q250 168 240 150 Z" fill="${t.fur}"/>
    <path d="M276 168 L300 170 L288 204 Z" fill="${t.fur}"/>
    <path d="M244 134 Q222 128 212 140 Q228 148 246 146 Z" fill="${t.fur}"/>
  </g>
  <g fill="${t.ink}">
    <rect x="114" y="278" width="28" height="14" rx="5"/><rect x="134" y="278" width="28" height="14" rx="5"/>
    <rect x="220" y="278" width="28" height="14" rx="5"/><rect x="240" y="278" width="28" height="14" rx="5"/>
  </g>
  <path d="M252 120 Q244 86 214 82" fill="none" stroke="${t.ink}" stroke-width="12" stroke-linecap="round"/>
  <path d="M266 120 Q262 92 238 80" fill="none" stroke="${t.ink}" stroke-width="9" stroke-linecap="round"/>`;
}
const eye = (t) => `<circle cx="278" cy="140" r="6" fill="${t.ink}"/><circle cx="280" cy="138" r="2" fill="${t.fur}"/><circle cx="312" cy="158" r="4" fill="${t.ink}"/>`;

function badge(t, sky, ground, front, title, desc) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img" aria-labelledby="t d">
  <title id="t">${title}</title>
  <desc id="d">${desc}</desc>
  <defs><clipPath id="b"><circle cx="200" cy="200" r="192"/></clipPath></defs>
  <circle cx="200" cy="200" r="192" fill="${t.badge}"/>
  <g clip-path="url(#b)">
    ${sky}
    <path d="M0 292 H268 L276 300 L268 330 L282 366 L276 400 H0 Z" fill="${t.ink}"/>
    <path d="M40 318 H120 M70 344 H190 M30 372 H96" stroke="${t.badge}" stroke-width="6" stroke-linecap="round" opacity="0.5"/>
    <circle cx="300" cy="338" r="6" fill="${t.ink}"/><circle cx="312" cy="372" r="4" fill="${t.ink}"/>
    ${ground}
  </g>
  ${goat(t)}
  ${front}
</svg>
`;
}

// Shared drawing helpers (outlined with the ink color, flat fills).
const pumpkin = (x, y, s, m, t, face = true, sw = 5) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="${t.ink}" stroke-width="${(sw / s).toFixed(2)}" stroke-linejoin="round">
    <path d="M-2 -26 q2 -12 10 -14" fill="none" stroke="${col('green', m)}" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="-14" cy="0" rx="18" ry="24" fill="${col('orange', m)}"/>
    <ellipse cx="14" cy="0" rx="18" ry="24" fill="${col('orange', m)}"/>
    <ellipse cx="0" cy="0" rx="14" ry="25" fill="${col('orange', m)}"/>
    ${face ? `<path d="M-14 -6 l6 -9 l6 9 z M2 -6 l6 -9 l6 9 z M-16 8 q16 12 32 0 l-6 2 l-4 -4 l-4 5 l-4 -5 l-4 4 z" fill="${t.ink}" stroke="none"/>` : ''}
  </g>`;
const bat = (x, y, s, fill) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 0 Q-7 -9 -16 -3 Q-10 0 -8 4 Q-4 1 0 6 Q4 1 8 4 Q10 0 16 -3 Q7 -9 0 0 Z" fill="${fill}"/>`;
const flake = (x, y, r, fill) => `<g transform="translate(${x} ${y})" stroke="${fill}" stroke-width="${Math.max(1.5, r / 5)}" stroke-linecap="round"><path d="M0 ${-r}V${r}M${-r * 0.87} ${-r / 2}L${r * 0.87} ${r / 2}M${-r * 0.87} ${r / 2}L${r * 0.87} ${-r / 2}"/></g>`;
const heartPath = (x, y, s) => `M${x} ${y + s * 0.9} C${x - s * 1.6} ${y - s * 0.1} ${x - s * 0.8} ${y - s * 1.3} ${x} ${y - s * 0.4} C${x + s * 0.8} ${y - s * 1.3} ${x + s * 1.6} ${y - s * 0.1} ${x} ${y + s * 0.9} Z`;
const burst = (x, y, r, stroke, n = 12) => {
  let p = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r1 = r * 0.35;
    p += `M${(x + Math.cos(a) * r1).toFixed(1)} ${(y + Math.sin(a) * r1).toFixed(1)}L${(x + Math.cos(a) * r).toFixed(1)} ${(y + Math.sin(a) * r).toFixed(1)}`;
  }
  return `<path d="${p}" stroke="${stroke}" stroke-width="${Math.max(2, r / 9)}" stroke-linecap="round" fill="none"/><circle cx="${x}" cy="${y}" r="${r / 9}" fill="${stroke}"/>`;
};
const bunting = (x1, x2, y, sag, colors, size = 22, stroke = '#22303C', sw = 3) => {
  const n = Math.max(3, Math.round((x2 - x1) / (size * 1.4)));
  let flags = '';
  for (let i = 0; i < n; i++) {
    const tx = x1 + ((i + 0.5) / n) * (x2 - x1);
    const u = (tx - x1) / (x2 - x1);
    const ty = y + 4 * sag * u * (1 - u);
    flags += `<path d="M${(tx - size / 2).toFixed(1)} ${ty.toFixed(1)}h${size}l${(-size / 2).toFixed(1)} ${(size * 1.15).toFixed(1)}z" fill="${colors[i % colors.length]}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  }
  return `<path d="M${x1} ${y}Q${(x1 + x2) / 2} ${y + 2 * sag} ${x2} ${y}" fill="none" stroke="${stroke}" stroke-width="${sw}"/>${flags}`;
};
const egg = (x, y, s, fill, band, ink, sw = 4) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -20 C12 -20 16 0 16 8 C16 18 9 23 0 23 C-9 23 -16 18 -16 8 C-16 0 -12 -20 0 -20Z" fill="${fill}" stroke="${ink}" stroke-width="${sw}"/><path d="M-15 4 l5 -5 l5 5 l5 -5 l5 5 l5 -5 l5 5" fill="none" stroke="${band}" stroke-width="${sw * 0.8}" stroke-linejoin="round"/></g>`;
const flower = (x, y, r, petal, center, ink, sw = 3) => {
  let p = '';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    p += `<circle cx="${(x + Math.cos(a) * r).toFixed(1)}" cy="${(y + Math.sin(a) * r).toFixed(1)}" r="${(r * 0.72).toFixed(1)}" fill="${petal}" stroke="${ink}" stroke-width="${sw}"/>`;
  }
  return `${p}<circle cx="${x}" cy="${y}" r="${(r * 0.62).toFixed(1)}" fill="${center}" stroke="${ink}" stroke-width="${sw}"/>`;
};
const fire = (x, y, s, m, t) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="${t.ink}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
    <path d="M-26 14 L26 -2 M-26 -2 L26 14" stroke="${col('brown', m)}" stroke-width="10"/>
    <path d="M0 -44 C14 -28 22 -16 16 0 C12 10 -12 10 -16 0 C-20 -12 -8 -18 -6 -30 C-2 -22 2 -22 0 -44Z" fill="${col('flame', m)}"/>
    <path d="M1 -20 C8 -12 10 -4 6 2 C3 6 -5 6 -7 1 C-8 -5 -2 -8 1 -20Z" fill="${col('flameHot', m)}" stroke-width="3"/>
  </g>`;

const MASCOT = {
  halloween(t, m) {
    const sky = `<circle cx="104" cy="112" r="38" fill="${col('moon', m)}"/><circle cx="122" cy="100" r="32" fill="${t.badge}"/>
    ${bat(176, 70, 1.6, t.ink)}${bat(60, 190, 1.1, t.ink)}`;
    const ground = '';
    const front = `${pumpkin(64, 262, 1.15, m, t)}
  <g stroke="${t.ink}" stroke-width="6" stroke-linejoin="round">
    <path d="M226 118 Q262 98 304 110 Q292 124 262 124 Q236 126 226 118Z" fill="${col('purple', m)}"/>
    <path d="M244 112 L262 46 Q268 30 288 30 Q274 40 276 54 L284 108 Z" fill="${col('purple', m)}"/>
    <path d="M246 104 L282 100" stroke="${col('orange', m)}" stroke-width="7"/>
  </g>
  ${eye(t)}`;
    return [sky, ground, front, 'Ledge the goat in a witch hat next to a carved pumpkin, under a crescent moon with bats'];
  },
  christmas(t, m) {
    const sky = `<circle cx="104" cy="104" r="18" fill="${col('gold', m)}"/>${burst(104, 104, 34, col('gold', m), 8)}
    ${flake(60, 170, 9, t.snow)}${flake(180, 60, 8, t.snow)}${flake(330, 90, 10, t.snow)}${flake(200, 140, 6, t.snow)}`;
    const ground = `<path d="M0 292 H268 L270 298 Q250 306 236 298 Q214 308 196 298 Q170 308 150 298 Q126 308 104 298 Q80 308 60 298 Q34 308 14 298 Q6 302 0 300Z" fill="${t.snow}"/>`;
    const front = `<g stroke="${t.ink}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
    <path d="M232 120 Q238 84 214 70 Q196 62 186 78 Q206 76 216 96 Q222 108 226 122Z" fill="${col('red', m)}"/>
    <path d="M232 120 Q266 96 300 116 L292 128 Q262 112 238 132Z" fill="${col('red', m)}"/>
    <path d="M230 124 Q264 100 302 118" stroke="${t.snow}" stroke-width="12"/>
    <circle cx="184" cy="80" r="10" fill="${t.snow}"/>
    <path d="M232 170 Q256 184 284 176 L282 192 Q256 200 230 186Z" fill="${col('red', m)}"/>
    <path d="M258 186 L250 228 L266 230 L270 190Z" fill="${col('red', m)}"/>
  </g>
  <path d="M244 178 l-2 14 M258 182 l-1 14 M272 180 l-1 13 M252 206 l14 2 M250 218 l14 2" stroke="${col('green', m)}" stroke-width="5" stroke-linecap="round"/>
  ${eye(t)}`;
    return [sky, ground, front, 'Ledge the goat in a red hat and a striped scarf, with snow on the cliff and a star in the sky'];
  },
  newyear(t, m) {
    const sky = `${burst(100, 104, 40, col('gold', m))}${burst(178, 58, 24, t.snow, 10)}${burst(330, 86, 22, col('pink', m), 10)}
    <circle cx="60" cy="180" r="3" fill="${col('gold', m)}"/><circle cx="214" cy="120" r="2.5" fill="${t.snow}"/>`;
    const front = `<g stroke="${t.ink}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
    <path d="M238 118 L266 44 L296 112 Q268 124 238 118Z" fill="${col('violet', m)}"/>
    <path d="M250 86 L284 84 M244 102 L290 100 M258 66 L276 64" stroke="${col('gold', m)}" stroke-width="7"/>
    <circle cx="266" cy="42" r="9" fill="${col('gold', m)}"/>
  </g>
  ${eye(t)}`;
    return [sky, '', front, 'Ledge the goat in a striped party hat, with fireworks in the sky'];
  },
  carnival(t, m) {
    const colors = ['magenta', 'teal', 'gold', 'violet', 'blue'].map((n) => col(n, m));
    let dots = '';
    const spots = [[50, 80], [90, 150], [150, 60], [200, 120], [320, 70], [350, 140], [130, 200], [30, 150], [240, 50]];
    spots.forEach(([x, y], i) => { dots += `<rect x="${x}" y="${y}" width="12" height="6" rx="1.5" transform="rotate(${(i * 37) % 90 - 45} ${x + 6} ${y + 3})" fill="${colors[i % colors.length]}"/>`; });
    const sky = `${dots}<path d="M20 112 q20 -20 40 0 t40 0 t40 0" fill="none" stroke="${colors[0]}" stroke-width="5" stroke-linecap="round"/><path d="M24 236 q14 -14 28 0 t28 0" fill="none" stroke="${colors[2]}" stroke-width="5" stroke-linecap="round"/>`;
    const front = `<g stroke="${t.ink}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
    <path d="M276 116 Q270 94 282 82 Q284 100 290 112Z" fill="${colors[0]}"/>
    <path d="M290 114 Q292 90 306 82 Q302 102 300 118Z" fill="${colors[2]}"/>
    <path d="M256 134 Q276 120 302 132 Q312 140 308 150 Q292 156 278 150 Q262 154 254 146 Q250 140 256 134Z" fill="${colors[3]}"/>
  </g>
  <circle cx="278" cy="140" r="6" fill="${t.fur}"/><circle cx="278" cy="140" r="5" fill="${t.ink}"/><circle cx="280" cy="138" r="1.8" fill="${t.fur}"/><circle cx="312" cy="158" r="4" fill="${t.ink}"/>`;
    return [sky, '', front, 'Ledge the goat in a feathered carnival mask, with confetti and streamers in the air'];
  },
  easter(t, m) {
    const sky = `<circle cx="104" cy="112" r="38" fill="${t.sky}"/>${flower(330, 92, 9, t.snow, col('gold', m), t.ink, 2.5)}`;
    const ground = '';
    const front = `<g stroke="${t.ink}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
    <path d="M30 248 Q66 190 102 248" fill="none" stroke="${col('brown', m)}" stroke-width="8"/>
    ${egg(46, 246, 0.9, col('egg1', m), col('egg2', m), t.ink, 5)}${egg(68, 240, 1, col('egg3', m), col('egg1', m), t.ink, 5)}${egg(88, 248, 0.85, col('egg4', m), col('egg2', m), t.ink, 5)}
    <path d="M24 252 H110 L100 288 H34Z" fill="${col('straw', m)}"/>
    <path d="M30 266 H104 M36 278 H98" stroke="${col('brown', m)}" stroke-width="4"/>
  </g>
  ${flower(226, 84, 7, t.snow, col('gold', m), t.ink, 3)}
  ${eye(t)}`;
    return [sky, ground, front, 'Ledge the goat with a flower on its horn next to a basket of painted eggs'];
  },
  valentine(t, m) {
    const sky = `<path d="${heartPath(112, 92, 30)}" fill="${col('pink', m)}" stroke="${t.ink}" stroke-width="6" stroke-linejoin="round"/>
    <path d="${heartPath(176, 150, 9)}" fill="${col('rose', m)}"/><path d="${heartPath(58, 170, 7)}" fill="${col('rose', m)}"/><path d="${heartPath(330, 80, 10)}" fill="${col('rose', m)}"/>`;
    const front = `<path d="M112 120 Q140 170 190 120 Q214 98 236 96" fill="none" stroke="${t.ink}" stroke-width="3.5" stroke-linecap="round"/>
  ${eye(t)}`;
    return [sky, '', front, 'Ledge the goat holding a heart balloon tied to its horn, with small hearts floating around'];
  },
  junina(t, m) {
    const colors = ['magenta', 'gold', 'teal', 'blue', 'orange'].map((n) => col(n, m));
    const sky = `${bunting(10, 390, 46, 26, colors, 22, t.ink, 3)}<circle cx="96" cy="140" r="4" fill="${col('flameHot', m)}"/><circle cx="120" cy="170" r="3" fill="${col('flame', m)}"/>`;
    const front = `${fire(70, 262, 1.15, m, t)}
  <g stroke="${t.ink}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="266" cy="116" rx="46" ry="11" transform="rotate(-8 266 116)" fill="${col('straw', m)}"/>
    <path d="M240 114 Q240 80 266 78 Q290 78 292 108Z" fill="${col('straw', m)}"/>
    <path d="M242 104 Q266 98 291 100" stroke="${col('red', m)}" stroke-width="6"/>
    <path d="M258 86 l6 6 M272 84 l-4 7" stroke="${col('brown', m)}" stroke-width="3"/>
  </g>
  ${eye(t)}`;
    return [sky, '', front, 'Ledge the goat in a straw hat next to a small bonfire, under a string of colored flags'];
  },
};

// ------------------------------------------------------------ icons
// 24 x 24 line icons in the site's style: one ink stroke plus an accent.
const ICONS = {
  halloween: [
    ['pumpkin', (a) => `<path d="M12 6.5c-1-2 0-3.5 1.5-4"/><ellipse cx="8.5" cy="13.5" rx="4.5" ry="6"/><ellipse cx="15.5" cy="13.5" rx="4.5" ry="6"/><path d="M10 11.5l1-1.5 1 1.5M13 11.5l1-1.5 1 1.5M9.5 15.5q2.5 2 5 0" style="stroke:${a}"/>`],
    ['bat', (a) => `<path d="M12 9c-1.5-2-5-3-9-1 2 1 2.5 3 2 5 1.5-1 3-1 4 .5 1-1.5 2-1.5 3 0 1-1.5 2-1.5 3 0 1-1.5 2.5-1.5 4-.5-.5-2 0-4 2-5-4-2-7.5-1-9 1z"/><path d="M11 10.5h.01M13 10.5h.01" style="stroke:${a}"/>`],
    ['hat', (a) => `<path d="M3 18.5c3 1.5 15 1.5 18 0-2-1-4-1.5-6-1.5H9c-2 0-4 .5-6 1.5z"/><path d="M8 17l2.5-10.5Q11.5 3 15 3.5q-2 1-1.5 3L16 17"/><path d="M8.6 14.5h6.9" style="stroke:${a}"/>`],
    ['moon', (a) => `<path d="M19.5 15A8 8 0 1 1 10 4.5 6.5 6.5 0 0 0 19.5 15z"/><path d="M15 5l.6 1.4L17 7l-1.4.6L15 9l-.6-1.4L13 7l1.4-.6z" style="stroke:${a}"/>`],
  ],
  christmas: [
    ['snowflake', (a) => `<path d="M12 2.5v19M3.8 7.25l16.4 9.5M3.8 16.75l16.4-9.5"/><path d="M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5" style="stroke:${a}"/>`],
    ['tree', (a) => `<path d="M12 3l-5 6h3l-4 5h3l-4 5h14l-4-5h3l-4-5h3z"/><path d="M12 19v2.5" /><circle cx="10.5" cy="12" r=".6" style="stroke:${a}"/><circle cx="13.5" cy="16" r=".6" style="stroke:${a}"/>`],
    ['gift', (a) => `<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M3 9h18M12 9v11"/><path d="M12 9c-1-3-5-4-5-1.5S12 9 12 9zm0 0c1-3 5-4 5-1.5S12 9 12 9z" style="stroke:${a}"/>`],
    ['bell', (a) => `<path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0" style="stroke:${a}"/><path d="M12 5V3"/>`],
  ],
  newyear: [
    ['firework', (a) => `<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/><circle cx="12" cy="12" r="1.5" style="stroke:${a}"/>`],
    ['partyhat', (a) => `<path d="M6 20.5 12 4l6 16.5z"/><path d="M8.2 14.5h7.6M9.8 10h4.4" style="stroke:${a}"/><circle cx="12" cy="3" r="1"/>`],
    ['clock', (a) => `<circle cx="12" cy="13" r="8"/><path d="M12 13V8" style="stroke:${a}"/><path d="M9 2.5h6"/>`],
    ['sparkle', (a) => `<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M18.5 16l.6 1.9 1.9.6-1.9.6-.6 1.9-.6-1.9-1.9-.6 1.9-.6z" style="stroke:${a}"/>`],
  ],
  carnival: [
    ['mask', (a) => `<path d="M3 9c3-1.5 6-1 9 1 3-2 6-2.5 9-1 0 4-2 7-5 7-2 0-3-1.5-4-3-1 1.5-2 3-4 3-3 0-5-3-5-7z"/><path d="M7 11.5h2.5M14.5 11.5H17" style="stroke:${a}"/>`],
    ['confetti', (a) => `<path d="M4 20 9 7l8 8z"/><path d="M14 4.5l1 1M19 9l1 1M17.5 3.5c.5 2-1 2.5-.5 4.5M20.5 13c-2-.5-2.5 1-4.5.5" style="stroke:${a}"/>`],
    ['note', (a) => `<path d="M9 18V5.5l11-2V16"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5" style="stroke:${a}"/>`],
    ['streamer', (a) => `<path d="M3 6c3 0 3 4 6 4s3-4 6-4 3 4 6 4"/><path d="M3 14c3 0 3 4 6 4s3-4 6-4 3 4 6 4" style="stroke:${a}"/>`],
  ],
  easter: [
    ['egg', (a) => `<path d="M12 3c4 0 6.5 6 6.5 10a6.5 6.5 0 0 1-13 0C5.5 9 8 3 12 3z"/><path d="M6 12l2-1.5 2 1.5 2-1.5 2 1.5 2-1.5 2 1.5" style="stroke:${a}"/>`],
    ['basket', (a) => `<path d="M3.5 11h17l-2 9h-13z"/><path d="M6 11a6 6 0 0 1 12 0"/><path d="M7 14.5h10M8 17.5h8" style="stroke:${a}"/>`],
    ['flower', (a) => `<circle cx="12" cy="9" r="2" style="stroke:${a}"/><path d="M12 7a2.5 2.5 0 1 1 2-3.5 2.5 2.5 0 1 1 1.5 4.5 2.5 2.5 0 1 1-2 4 2.5 2.5 0 1 1-4 0 2.5 2.5 0 1 1-2-4A2.5 2.5 0 1 1 10 3.5 2.5 2.5 0 0 1 12 7z"/><path d="M12 13v8M12 17c-2 0-3.5-1-4-2.5"/>`],
    ['rabbit', (a) => `<path d="M9 9C8 5 8 2.5 9.5 2.5S11 6 11 9M15 9c1-4 1-6.5-.5-6.5S13 6 13 9"/><circle cx="12" cy="14" r="6"/><path d="M10 13.5h.01M14 13.5h.01M11 16.5q1 .8 2 0" style="stroke:${a}"/>`],
  ],
  valentine: [
    ['heart', (a) => `<path d="M12 20s-7.5-4.5-7.5-10A4 4 0 0 1 12 7.5 4 4 0 0 1 19.5 10c0 5.5-7.5 10-7.5 10z"/><path d="M8 10.5a1.8 1.8 0 0 1 1.8-1.8" style="stroke:${a}"/>`],
    ['balloon', (a) => `<path d="M12 15s-6-3.5-6-8A3.2 3.2 0 0 1 12 5a3.2 3.2 0 0 1 6 2c0 4.5-6 8-6 8z"/><path d="M12 15c-1 2 1 3 0 6.5" style="stroke:${a}"/>`],
    ['letter', (a) => `<rect x="3" y="6" width="18" height="13" rx="1.5"/><path d="M3.5 7l8.5 6.5L20.5 7"/><path d="M12 17.5s-2-1.2-2-2.6a1 1 0 0 1 2-.4 1 1 0 0 1 2 .4c0 1.4-2 2.6-2 2.6z" style="stroke:${a}"/>`],
    ['rose', (a) => `<path d="M12 10c-3 0-4.5-2-4.5-4.5 2 0 3 .5 4.5 2 1.5-1.5 2.5-2 4.5-2C16.5 8 15 10 12 10z" style="stroke:${a}"/><path d="M12 10v11M12 15c-2.5 0-4-1.5-4.5-3M12 17c2 0 3-1 3.5-2.5"/>`],
  ],
  junina: [
    ['bonfire', (a) => `<path d="M4 20.5l16-3.5M4 17l16 3.5"/><path d="M12 3c2.5 3 4.5 5 4.5 8a4.5 4.5 0 0 1-9 0c0-2 1.5-3 2-5 .8 1.2 1.5 1.5 2.5 1C12.5 6 12 4.5 12 3z" style="stroke:${a}"/>`],
    ['flags', (a) => `<path d="M2.5 5q9.5 5 19 0"/><path d="M5 6.3l1.5 5 2-4.4M10.5 7.6l1.5 5 1.5-5M15.5 7l2 4.4 1.5-5" style="stroke:${a}"/>`],
    ['strawhat', (a) => `<ellipse cx="12" cy="15.5" rx="9.5" ry="3"/><path d="M7 14.5c0-5 2-7.5 5-7.5s5 2.5 5 7.5"/><path d="M7.2 12.8c3 1 6.6 1 9.6 0" style="stroke:${a}"/>`],
    ['corn', (a) => `<path d="M12 3c2.5 0 4 3.5 4 8s-1.5 7-4 7-4-2.5-4-7 1.5-8 4-8z"/><path d="M10 8h4M9.5 11h5M10 14h4M12 3v15" style="stroke:${a}"/><path d="M8 13c-2 2-3 5-2 8 2.5-1 4.5-2.5 6-3M16 13c2 2 3 5 2 8-2.5-1-4.5-2.5-6-3"/>`],
  ],
};
const ACCENT = { halloween: 'orange', christmas: 'red', newyear: 'gold', carnival: 'magenta', easter: 'violet', valentine: 'pink', junina: 'orange' };

function iconSvg(body, t, accent, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" role="img" aria-label="${title}"><g fill="none" stroke="${t.line}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${body(accent)}</g></svg>
`;
}

// ------------------------------------------------------------ hero accents
// 560 x 180 strips that sit in the empty top right corner of the home hero.
const ridgeLine = (t) => `<path d="M0 168 60 150l40 10 60-26 50 18 44-10 66 22 56-20 50 12 74-24 60 26V180H0z" fill="${t.faint}" opacity=".55"/>`;
function scaledIcon(id, i, x, y, s, t, m) {
  const body = ICONS[id][i][1](col(ACCENT[id], m));
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${t.line}" stroke-width="${(3.2 / s).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round">${body}</g>`;
}
const HERO = {
  halloween: (t, m) => `${ridgeLine(t)}${pumpkin(420, 140, 0.9, m, { ink: t.line }, true, 3)}${pumpkin(486, 150, 0.6, m, { ink: t.line }, false, 3)}
  <mask id="crescent"><rect width="560" height="180" fill="#fff"/><circle cx="511" cy="36" r="20" fill="#000"/></mask>
  <circle cx="500" cy="44" r="24" fill="${col('moon', m)}" mask="url(#crescent)"/>
  ${bat(330, 50, 1.4, t.line)}${bat(380, 86, 0.9, t.line)}${bat(250, 70, 1, t.line)}
  ${scaledIcon('halloween', 2, 170, 100, 2, t, m)}`,
  christmas: (t, m) => `${ridgeLine(t)}
  <g stroke="${t.line}" stroke-width="3" stroke-linejoin="round"><path d="M430 160 L450 112 L470 160Z M436 136 L450 96 L464 136Z" fill="${col('green', m)}"/><path d="M490 166 L506 128 L522 166Z M495 146 L506 114 L517 146Z" fill="${col('green', m)}"/></g>
  <path d="M450 96 l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z" fill="${col('gold', m)}"/>
  ${flake(300, 50, 10, t.line)}${flake(370, 90, 7, t.line)}${flake(530, 50, 8, t.line)}${flake(230, 80, 6, t.line)}
  ${scaledIcon('christmas', 2, 330, 118, 1.8, t, m)}`,
  newyear: (t, m) => `${ridgeLine(t)}${burst(460, 64, 44, col('gold', m), 14)}${burst(360, 40, 26, col('pink', m), 10)}${burst(530, 120, 20, t.line, 10)}${burst(270, 90, 18, col('violet', m), 10)}
  ${scaledIcon('newyear', 2, 380, 110, 1.8, t, m)}`,
  carnival: (t, m) => {
    const colors = ['magenta', 'teal', 'gold', 'violet', 'blue'].map((n) => col(n, m));
    return `${ridgeLine(t)}${bunting(200, 560, 18, 30, colors, 20, t.line, 2.5)}
  <path d="M240 120 q15 -15 30 0 t30 0 t30 0" fill="none" stroke="${colors[1]}" stroke-width="4" stroke-linecap="round"/>
  <g transform="translate(430 96) scale(3.2)" fill="${colors[3]}" stroke="${t.line}" stroke-width="1" stroke-linejoin="round"><path d="M3 9c3-1.5 6-1 9 1 3-2 6-2.5 9-1 0 4-2 7-5 7-2 0-3-1.5-4-3-1 1.5-2 3-4 3-3 0-5-3-5-7z"/></g>
  <rect x="380" y="140" width="10" height="5" fill="${colors[0]}" transform="rotate(30 385 142)"/><rect x="520" y="150" width="10" height="5" fill="${colors[2]}" transform="rotate(-20 525 152)"/>`;
  },
  easter: (t, m) => `${ridgeLine(t)}${egg(430, 140, 1.3, col('egg1', m), col('egg2', m), t.line, 3)}${egg(470, 148, 1.1, col('egg3', m), col('egg1', m), t.line, 3)}${egg(505, 140, 1.25, col('egg4', m), col('egg2', m), t.line, 3)}
  ${flower(360, 120, 9, t.snow, col('gold', m), t.line, 2)}${flower(540, 100, 7, col('egg2', m), col('gold', m), t.line, 2)}${flower(300, 140, 6, col('egg1', m), col('gold', m), t.line, 2)}
  <path d="M352 160 V140 M300 166 V150" stroke="${col('green', m)}" stroke-width="3"/>`,
  valentine: (t, m) => `${ridgeLine(t)}<path d="${heartPath(470, 70, 34)}" fill="${col('pink', m)}" stroke="${t.line}" stroke-width="3"/><path d="M470 100 q-14 30 8 60" fill="none" stroke="${t.line}" stroke-width="2"/>
  <path d="${heartPath(380, 50, 12)}" fill="${col('rose', m)}"/><path d="${heartPath(540, 130, 10)}" fill="${col('rose', m)}"/><path d="${heartPath(300, 90, 9)}" fill="${col('rose', m)}"/><path d="${heartPath(240, 40, 7)}" fill="${col('rose', m)}"/>`,
  junina: (t, m) => {
    const colors = ['magenta', 'gold', 'teal', 'blue', 'orange'].map((n) => col(n, m));
    return `${ridgeLine(t)}${bunting(180, 560, 16, 34, colors, 20, t.line, 2.5)}${fire(470, 146, 1, m, { ink: t.line })}
  <circle cx="440" cy="90" r="3" fill="${col('flameHot', m)}"/><circle cx="500" cy="80" r="2.5" fill="${col('flame', m)}"/><circle cx="470" cy="66" r="2" fill="${col('flameHot', m)}"/>`;
  },
};
const HERO_ALT = {
  halloween: 'Pumpkins on a ridge under a moon with bats',
  christmas: 'Snowy pine trees with a star and snowflakes',
  newyear: 'Fireworks over a ridge',
  carnival: 'Carnival flags, streamers and a mask',
  easter: 'Painted eggs and spring flowers on a ridge',
  valentine: 'A heart balloon with small hearts',
  junina: 'Colored flags over a small bonfire',
};

for (const id of Object.keys(MASCOT)) {
  const dir = join(root, 'assets/seasons', id);
  mkdirSync(dir, { recursive: true });
  for (const mode of ['light', 'dark']) {
    const t = THEMES[mode];
    const suffix = mode === 'dark' ? '-dark' : '';
    const [sky, ground, front, desc] = MASCOT[id](t, mode);
    writeFileSync(join(dir, `mascot${suffix}.svg`), badge(t, sky, ground, front, 'Ledge, the edgegoat mascot', desc));
    writeFileSync(
      join(dir, `hero${suffix}.svg`),
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 180" width="560" height="180" role="img" aria-label="${HERO_ALT[id]}">\n  ${HERO[id](t, mode)}\n</svg>\n`,
    );
    ICONS[id].forEach(([name, body], i) => {
      writeFileSync(join(dir, `icon-${i + 1}${suffix}.svg`), iconSvg(body, t, col(ACCENT[id], mode), name));
    });
  }
  console.log(`wrote assets/seasons/${id}`);
}

// Keep the source of truth honest: every season has the same file set.
const expected = ['mascot', 'hero', 'icon-1', 'icon-2', 'icon-3', 'icon-4'];
for (const id of Object.keys(MASCOT)) {
  for (const f of expected) for (const s of ['', '-dark']) readFileSync(join(root, 'assets/seasons', id, `${f}${s}.svg`));
}
