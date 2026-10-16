import type { Case, DateCase, DateOptions } from '../types';
import { arrays } from './arrays';
import { bigints } from './bigints';
import { dates } from './dates';
import { emails } from './emails';
import { json } from './json';
import { numbers, numericStrings } from './numbers';
import { paths } from './paths';
import { strings } from './strings';
import { timeZones } from './timeZones';
import { urls } from './urls';

/** Name of a generator, as exported by edgegoat. */
export type GeneratorName =
  | 'dates'
  | 'timeZones'
  | 'strings'
  | 'numbers'
  | 'numericStrings'
  | 'bigints'
  | 'urls'
  | 'emails'
  | 'paths'
  | 'json'
  | 'arrays';

const GENERATORS: Readonly<Record<GeneratorName, (options?: DateOptions) => Case<unknown>[]>> = {
  dates,
  timeZones,
  strings,
  numbers,
  numericStrings,
  bigints,
  urls,
  emails,
  paths,
  json,
  arrays,
};

function isTimeZone(s: string): boolean {
  if (s !== 'UTC' && !/^[A-Z][A-Za-z_-]+(?:\/[A-Za-z0-9_+-]+)+$/.test(s)) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: s });
    return true;
  } catch {
    return false;
  }
}

function isJson(s: string): boolean {
  if (!/^[[{]/.test(s)) return false;
  try {
    JSON.parse(s);
    return true;
  } catch {
    return false;
  }
}

function kindOfString(raw: string): GeneratorName {
  const s = raw.trim();
  if (s === '') return 'strings';
  if (isJson(s)) return 'json';
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(s) || /^(?:mailto|tel|data|javascript|blob|about):/i.test(s)) return 'urls';
  if (/^[^\s@]+@[^\s@]+$/.test(s)) return 'emails';
  if (isTimeZone(s)) return 'timeZones';
  if (/^[+-]?(?:Infinity|NaN)$/.test(s) || !Number.isNaN(Number(s))) return 'numericStrings';
  if (!/\s/.test(s) && (/^(?:[A-Za-z]:[\\/]|\\\\|~|\.{1,2}[\\/]|\/)/.test(s) || /[\\/]/.test(s))) return 'paths';
  return 'strings';
}

/**
 * The generator whose cases are the same kind of input as `sample`, or
 * `undefined` when edgegoat has none (booleans, plain objects, functions).
 *
 * Strings are classified by shape: JSON text, URLs, email addresses, IANA
 * time zones, numeric strings and file paths, then plain text.
 *
 * @example
 * generatorFor('ana@example.com'); // 'emails'
 * generatorFor(new Date());        // 'dates'
 * generatorFor(42);                // 'numbers'
 */
export function generatorFor(sample: unknown): GeneratorName | undefined {
  if (sample instanceof Date) return 'dates';
  if (Array.isArray(sample)) return 'arrays';
  switch (typeof sample) {
    case 'number':
      return 'numbers';
    case 'bigint':
      return 'bigints';
    case 'string':
      return kindOfString(sample);
    default:
      return undefined;
  }
}

/**
 * Edge cases for inputs like `sample`: picks the generator with
 * `generatorFor()` and calls it with `options`. `zone` and `year` only apply
 * when the sample is a `Date`. Throws a `TypeError` when edgegoat has no
 * generator for that kind of value.
 *
 * @example
 * test.each(casesFor(user.email))('$label', ({ value }) => {
 *   expect(() => normalizeEmail(value)).not.toThrow();
 * });
 */
export function casesFor(sample: Date, options?: DateOptions): DateCase[];
export function casesFor(sample: string, options?: DateOptions): Case<string>[];
export function casesFor(sample: number, options?: DateOptions): Case<number>[];
export function casesFor(sample: bigint, options?: DateOptions): Case<bigint>[];
export function casesFor(sample: readonly unknown[], options?: DateOptions): Case<unknown[]>[];
export function casesFor(sample: unknown, options?: DateOptions): Case<unknown>[];
export function casesFor(sample: unknown, options: DateOptions = {}): Case<unknown>[] {
  const name = generatorFor(sample);
  if (!name) {
    const kind = sample === null ? 'null' : typeof sample;
    throw new TypeError(
      `edgegoat has no generator for ${kind} values. Supported: Date, number, bigint, string and arrays.`,
    );
  }
  return GENERATORS[name](options);
}
