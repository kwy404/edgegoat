// The docs site's own art: a line art icon set (one symbol per generator plus
// the interface icons) and the laboratory illustrations (specimen jars, a
// flask, the shelf on a mountain ridge). Everything is inline SVG drawn with
// currentColor and the --art-* custom properties from docs/style.css, so the
// same markup follows light and dark mode. Used by scripts/build-docs.mjs.

const LINE = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
// Accent strokes inside a <symbol>: a custom property inherits into the
// <use> shadow tree, a class selector would not.
const AC = 'style="stroke:var(--art-accent)"';
const ACF = 'style="fill:var(--art-accent);stroke:none"';

/** Generator glyphs. Keys are generator names, plus "all" for the whole catalog. */
const GLYPHS = {
  all: `<path d="M9.5 3.5h5M10.5 3.5v5.2L5 18a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5.5-9.3V3.5"/><path d="M7.4 15h9.2" ${AC}/><circle cx="11" cy="18" r=".6" ${ACF}/><circle cx="14" cy="17.6" r=".6" ${ACF}/>`,
  dates: `<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="M7.5 13.2h2M11 13.2h2M7.5 16.6h2" /><rect x="14.3" y="14.9" width="2.6" height="2.6" rx=".6" ${AC}/>`,
  timeZones: `<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.6 2.4 3.8 5.2 3.8 8.5s-1.2 6.1-3.8 8.5c-2.6-2.4-3.8-5.2-3.8-8.5S9.4 5.9 12 3.5z" ${AC}/>`,
  strings: `<path d="M3.5 18.5 8 5.5l4.5 13M5.2 14h5.6"/><path d="M17.5 5.5v13M15.5 5.5h4M15.5 18.5h4" ${AC}/>`,
  numbers: `<path d="M3 12h4.5" ${AC}/><ellipse cx="15" cy="12" rx="4.5" ry="7"/><path d="M12.6 17.2 17.4 6.8"/>`,
  numericStrings: `<path d="M5 6v3.5M8.5 6v3.5" ${AC}/><path d="M13 8.5 16 6v12.5M13 18.5h6"/>`,
  bigints: `<path d="M4 8.5 7 6v12.5M4.5 18.5h5"/><path d="M12.5 10v8.5M12.5 13a3.2 3.2 0 0 1 6.4 0v5.5" ${AC}/>`,
  urls: `<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" ${AC}/>`,
  emails: `<circle cx="12" cy="12" r="3.5" ${AC}/><path d="M15.5 12v1.5a2.5 2.5 0 0 0 5 0V12a8.5 8.5 0 1 0-3.4 6.8"/>`,
  paths: `<path d="M3.5 7.5v10a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-6l-2-2.5h-5a2 2 0 0 0-2 2z"/><path d="M10.2 16.8 13.8 10.8" ${AC}/>`,
  json: `<path d="M8.5 4.5H8a2 2 0 0 0-2 2v3A2.5 2.5 0 0 1 3.5 12 2.5 2.5 0 0 1 6 14.5v3a2 2 0 0 0 2 2h.5M15.5 4.5h.5a2 2 0 0 1 2 2v3a2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0-2.5 2.5v3a2 2 0 0 1-2 2h-.5"/><circle cx="12" cy="12" r="1.1" ${ACF}/>`,
  arrays: `<path d="M8 4.5H5v15h3M16 4.5h3v15h-3"/><circle cx="9.8" cy="12" r="1.1" style="fill:currentColor;stroke:none"/><circle cx="14.2" cy="12" r="1.3" ${AC}/>`,
};

/** Interface icons in the same line style. */
const UI = {
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.3-4.3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  system: '<rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M8.5 20h7M12 16.5V20"/>',
  copy: '<rect x="8.5" y="8.5" width="12" height="12" rx="2"/><path d="M15.5 8.5V5.5a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  tag: '<path d="M3.5 12.6V4.5a1 1 0 0 1 1-1h8.1l8 8a1.4 1.4 0 0 1 0 2l-7.1 7.1a1.4 1.4 0 0 1-2 0z"/><circle cx="8" cy="8" r="1.3"/>',
  book: '<path d="M4 5.5A2 2 0 0 1 6 3.5h13.5v14H6a2 2 0 0 0-2 2z"/><path d="M4 19.5a2 2 0 0 0 2 2h13.5v-4"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',
  bug: '<rect x="7" y="8" width="10" height="12" rx="5"/><path d="M12 8v12M9 5.5 10.5 8M15 5.5 13.5 8M3.5 13h3.5M17 13h3.5M4.5 8.5 7 10M19.5 8.5 17 10M4.5 18.5 7 17M19.5 18.5 17 17"/>',
  terminal: '<rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="m7 9.5 3 2.5-3 2.5M12.5 15H17"/>',
  filter: '<path d="M4 5.5h16l-6.2 7.3v5.4l-3.6 1.8v-7.2z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  sheet: '<path d="M4 4.5h16v15H4zM14.5 4.5v15"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>',
  jar: '<path d="M7.5 3.5h9v3h-9zM8.5 6.5v1.5C6.5 9 5.5 10.5 5.5 12.5v6a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-6c0-2-1-3.5-3-4.5V6.5"/><path d="M5.5 14.5h13"/>',
  json: '<path d="M8.5 4.5H8a2 2 0 0 0-2 2v3A2.5 2.5 0 0 1 3.5 12 2.5 2.5 0 0 1 6 14.5v3a2 2 0 0 0 2 2h.5M15.5 4.5h.5a2 2 0 0 1 2 2v3a2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0-2.5 2.5v3a2 2 0 0 1-2 2h-.5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
  steps: '<path d="M4 18.5h5v-5h5v-5h6"/>',
};

const BRANDS = {
  github: '<path fill="currentColor" stroke="none" d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.8 9.7.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.4-3.4-1.4-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1.1 1.5 1.1.9 1.6 2.4 1.1 2.9.8.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7 1 .7 2v2.9c0 .3.2.6.7.5A10.2 10.2 0 0 0 22 12.2C22 6.6 17.5 2 12 2z"/>',
  linkedin: '<path fill="currentColor" stroke="none" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/>',
  npm: '<path fill="currentColor" stroke="none" d="M2 7h20v9.3H12v1.4H7.6v-1.4H2zm1.1 8.2h4.4V9.4h1.1v5.8h1.1V8.1H3.1zm5.6-7.1v8.2h2.2v-1.1h2.2V8.1zm2.2 1.3h1.1v3.2h-1.1zm3.3-1.3v7.1h2.2V9.4h1.1v5.8h1.1V9.4h1.1v5.8h1.1V8.1z"/>',
};

/** One hidden sprite per page; every icon is then <svg><use href="#i-name"/></svg>. */
export function sprite() {
  const sym = (id, body) => `<symbol id="i-${id}" viewBox="0 0 24 24">${body}</symbol>`;
  return `<svg class="sprite" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><defs>
${Object.entries(GLYPHS).map(([k, v]) => sym(k, `<g ${LINE}>${v}</g>`)).join('\n')}
${Object.entries(UI).map(([k, v]) => sym(`ui-${k}`, `<g ${LINE}>${v}</g>`)).join('\n')}
${Object.entries(BRANDS).map(([k, v]) => sym(`brand-${k}`, v)).join('\n')}
</defs></svg>`;
}

/** An icon from the sprite. name is a generator, "all", "ui-*" or "brand-*". */
export function icon(name, cls = 'ic') {
  return `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#i-${name}"></use></svg>`;
}

/**
 * A specimen jar holding one glyph. glyphRef is either a literal symbol id
 * ("i-dates") or, with dynamic set, a Voodoo expression for :href.
 */
export function jar({ glyph = 'i-all', dynamic = '', label = '', cls = 'jar-art' } = {}) {
  const use = dynamic ? `<use :href="${dynamic}" x="25" y="38" width="30" height="30"></use>` : `<use href="#${glyph}" x="25" y="38" width="30" height="30"></use>`;
  return `<svg class="${cls}" viewBox="0 0 80 100" aria-hidden="true" focusable="false">
  <g ${LINE}>
    <path class="art-glass" d="M24 18v4c-7 2.5-11 8-11 15v43a11 11 0 0 0 11 11h32a11 11 0 0 0 11-11V37c0-7-4-12.5-11-15v-4"/>
    <path class="art-liquid" d="M14 58c6-3 12 3 18 0s12-3 18 0 12 3 16 0V80a10 10 0 0 1-10 10H24a10 10 0 0 1-10-10z" stroke="none"/>
    <rect x="20" y="7" width="40" height="11" rx="3" class="art-lid"/>
    <path d="M27 7v11M34 7v11M41 7v11M48 7v11M55 7v11" class="art-hatch"/>
    <path d="M19.5 44v18" class="art-shine"/>
  </g>
  <g class="art-specimen">${use}</g>
  ${label ? `<g ${LINE}><rect x="23" y="72" width="34" height="12" rx="2" class="art-label"/></g><text x="40" y="80.6" class="art-label-text" text-anchor="middle">${label}</text>` : ''}
</svg>`;
}

/** Ridge line: the jagged edge Ledge walks on, used to close sections. */
export function ridge(cls = 'ridge') {
  return `<svg class="${cls}" viewBox="0 0 1440 48" preserveAspectRatio="none" aria-hidden="true" focusable="false">
  <path class="ridge-fill" d="M0 48V34l70-14 46 10 68-24 58 18 40-8 76 20 64-22 52 12 88-24 60 20 44-10 72 22 58-16 66 10 80-26 54 18 48-8 70 20 62-16 74 12 90-20 52 14 48-6V48z"/>
  <path class="ridge-line" d="M0 34l70-14 46 10 68-24 58 18 40-8 76 20 64-22 52 12 88-24 60 20 44-10 72 22 58-16 66 10 80-26 54 18 48-8 70 20 62-16 74 12 90-20 52 14 48-6" fill="none"/>
</svg>`;
}

/**
 * The intro illustration: a lab shelf on a mountain ridge with specimen jars
 * holding a clock (time zones and DST), a NaN, a face split in two (half a
 * surrogate pair) and a path, plus a flask of -0.
 */
export function shelf() {
  const jarAt = (x, inner, label) => `<g transform="translate(${x} 58)">
    <g ${LINE}>
      <path class="art-glass" d="M14 14v5c-8 3-13 9-13 17v58a12 12 0 0 0 12 12h50a12 12 0 0 0 12-12V36c0-8-5-14-13-17v-5"/>
      <path class="art-liquid" d="M2 70c8-4 15 4 23 0s15-4 23 0 15 4 26 0v24a11 11 0 0 1-11 11H13A11 11 0 0 1 2 94z" stroke="none"/>
      <rect x="9" y="2" width="58" height="12" rx="3" class="art-lid"/>
      <path d="M18 2v12M27 2v12M36 2v12M45 2v12M54 2v12M63 2v12" class="art-hatch"/>
      <path d="M8 40v26" class="art-shine"/>
    </g>
    <g class="art-specimen" ${LINE}>${inner}</g>
    <rect x="16" y="82" width="44" height="14" rx="2" class="art-label" ${LINE}/>
    <text x="38" y="92.2" class="art-label-text" text-anchor="middle">${label}</text>
  </g>`;
  const clock = `<circle cx="38" cy="50" r="17"/><path d="M38 38v12l8 5"/><path d="M38 34.5v-1.5M38 67v-1.5M21.5 50H23M53 50h1.5"/><path d="M52 31.5a22 22 0 0 1 6 9" ${AC}/><path d="m58.6 36.4-.6 4.4-4.2-1.3" ${AC}/>`;
  const nan = `<path d="M18 60V40l11 20V40"/><circle cx="39.5" cy="55" r="5" ${AC}/><path d="M44.5 50v10" ${AC}/><path d="M50 60V40l11 20V40"/>`;
  const face = `<path d="M37 33a17 17 0 0 0 0 34"/><path d="M40 33a17 17 0 0 1 0 34" ${AC}/><path d="M38.5 29v42" stroke-dasharray="2 3"/><circle cx="31" cy="46" r="1.6" style="fill:currentColor;stroke:none"/><circle cx="46" cy="46" r="1.6" style="fill:var(--art-accent);stroke:none"/><path d="M29 54a9 9 0 0 0 8 5"/><path d="M40 59a9 9 0 0 0 8-5" ${AC}/>`;
  const path = `<path d="M20 40v20a3 3 0 0 0 3 3h30a3 3 0 0 0 3-3V45a3 3 0 0 0-3-3H39l-4-5H23a3 3 0 0 0-3 3z"/><path d="M30 58l5-11M37 58l5-11M45 58l5-11" ${AC}/>`;
  const flask = `<g transform="translate(262 50)">
    <g ${LINE}>
      <path class="art-glass" d="M18 8h22M22 8v28L4 92a8 8 0 0 0 7 12h36a8 8 0 0 0 7-12L36 36V8"/>
      <path class="art-liquid" d="M12 72c6-3 11 3 17 0s11-3 17 0l8 20a8 8 0 0 1-7 12H11a8 8 0 0 1-7-12z" stroke="none"/>
      <path d="M27 20v-8M31 26v-4" class="art-shine"/>
    </g>
    <g class="art-bubbles" ${LINE}><circle cx="24" cy="62" r="2.4"/><circle cx="33" cy="52" r="1.7"/><circle cx="28" cy="40" r="1.2"/></g>
    <text x="29" y="94" class="art-flask-text" text-anchor="middle">-0</text>
  </g>`;
  return `<svg class="shelf-art" viewBox="0 0 560 240" role="img" aria-labelledby="shelf-t">
  <title id="shelf-t">A lab shelf on a mountain ridge with specimen jars holding a clock, NaN, a face split in two and a file path, next to a flask of negative zero</title>
  <defs>
    <linearGradient id="shelf-fade-x"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".14" stop-color="#fff"/><stop offset=".86" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <mask id="shelf-fade" maskUnits="userSpaceOnUse" x="0" y="0" width="560" height="240"><rect width="560" height="240" fill="url(#shelf-fade-x)"/></mask>
  </defs>
  <g mask="url(#shelf-fade)">
    <path class="ridge-far" d="M0 150 52 112l40 22 62-58 46 40 34-20 70 52 60-74 52 40 40-24 64 50 40-22V212H0z"/>
    <path class="ridge-near" d="M0 186l46-26 36 14 58-38 44 30 52-16 62 34 72-48 48 28 54-20 46 22 42-12V212H0z"/>
    <path class="ridge-line" d="M0 186l46-26 36 14 58-38 44 30 52-16 62 34 72-48 48 28 54-20 46 22 42-12" fill="none"/>
  </g>
  ${jarAt(26, clock, 'TZ+0545')}
  ${jarAt(132, nan, 'NaN')}
  ${flask}
  ${jarAt(346, face, 'U+D83D')}
  ${jarAt(452, path, '..\\..\\')}
  <path class="shelf-board" d="M14 212h532" fill="none"/>
  <path class="shelf-leg" d="M60 214v14M500 214v14" fill="none"/>
</svg>`;
}

/** Small round mascot image, used in the brand, the footer and empty states. */
export function mascot(prefix, size = 32, alt = '') {
  return `<img src="${prefix}assets/mascot.svg" width="${size}" height="${size}" alt="${alt}" class="mascot">`;
}
