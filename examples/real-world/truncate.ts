const ELLIPSIS = '\u2026';

/**
 * Buggy: cuts by UTF-16 code units, so it can split a surrogate pair (half an
 * emoji) or a grapheme cluster (a family emoji, a flag, an accented letter).
 * Real bugs of this kind were fixed in google/budoux#1411 and
 * microsoft/vscode-js-debug#2423.
 */
export function truncateNaive(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max) + ELLIPSIS;
}

/**
 * Fixed: keeps whole grapheme clusters, at most `max` UTF-16 code units of
 * text, then the ellipsis.
 */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  let out = '';
  for (const { segment } of new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)) {
    if (out.length + segment.length > max) break;
    out += segment;
  }
  return out + ELLIPSIS;
}

/** True when the string has no lone surrogates (String#isWellFormed needs Node 20). */
export function isWellFormed(s: string): boolean {
  return !/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(s);
}
