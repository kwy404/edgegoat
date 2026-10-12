import path from 'node:path';
import { describe, expect, test } from 'vitest';
import {
  arrays,
  bigints,
  dates,
  emails,
  json,
  numbers,
  numericStrings,
  paths,
  strings,
  timeZones,
  urls,
  type Case,
  type CaseOptions,
} from '../src/index';

const generators: Record<string, (options?: CaseOptions) => readonly Case<unknown>[]> = {
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

function isWellFormed(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = s.charCodeAt(i + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return false;
      i++;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      return false;
    }
  }
  return true;
}

describe.each(Object.entries(generators))('%s()', (_name, generate) => {
  const cases = generate();

  test('returns labeled cases', () => {
    expect(cases.length).toBeGreaterThanOrEqual(8);
    for (const c of cases) {
      expect(typeof c.label).toBe('string');
      expect(c.label.trim()).toBe(c.label);
      expect(c.label.length).toBeGreaterThan(0);
      expect(c.label.length).toBeLessThanOrEqual(90);
      expect(typeof c.why).toBe('string');
      expect(c.why.length).toBeGreaterThan(15);
      expect(c.why.length).toBeLessThanOrEqual(320);
      expect(Array.isArray(c.tags)).toBe(true);
      expect(c.tags.length).toBeGreaterThan(0);
      for (const t of c.tags) expect(t).toMatch(/^[a-z0-9-]+$/);
      if (c.ref !== undefined) expect(c.ref).toMatch(/^https:\/\//);
      expect('value' in c).toBe(true);
    }
  });

  test('labels are unique and ASCII', () => {
    expect(new Set(cases.map((c) => c.label)).size).toBe(cases.length);
    for (const c of cases) expect(c.label, c.label).toMatch(/^[\x20-\x7e]+$/);
  });

  test('why strings are plain ASCII prose', () => {
    for (const c of cases) expect(c.why, c.label).toMatch(/^[\x20-\x7e]+$/);
  });

  test('tags filter and exclude work', () => {
    const tag = cases[0]!.tags[0]!;
    const only = generate({ tags: [tag] });
    expect(only.length).toBeGreaterThan(0);
    expect(only.every((c) => c.tags.includes(tag))).toBe(true);
    const without = generate({ exclude: [tag] });
    expect(without.length).toBe(cases.length - only.length);
    expect(generate({ tags: ['no-such-tag'] })).toEqual([]);
  });

  test('returns a new array on every call', () => {
    const a = generate();
    const b = generate();
    expect(a).not.toBe(b);
    expect(a.map((c) => c.label)).toEqual(b.map((c) => c.label));
  });
});

describe('timeZones()', () => {
  test('every zone is supported by Intl', () => {
    for (const { value } of timeZones()) {
      expect(() => new Intl.DateTimeFormat('en', { timeZone: value })).not.toThrow();
    }
  });

  test('labels equal values', () => {
    for (const c of timeZones()) expect(c.label).toBe(c.value);
  });
});

describe('strings()', () => {
  const by = (label: string) => strings().find((c) => c.label === label)!.value;

  test('every value is a string', () => {
    for (const c of strings()) expect(typeof c.value).toBe('string');
  });

  test('malformed tag marks exactly the ill formed strings', () => {
    for (const c of strings()) {
      expect(isWellFormed(c.value), c.label).toBe(!c.tags.includes('malformed'));
    }
  });

  test('the cut boundary case really splits a surrogate pair', () => {
    expect(isWellFormed(by('surrogate pair cut by slice(0, 10)').slice(0, 10))).toBe(false);
    expect(isWellFormed(by('surrogate pair at the end for trimEnd style truncation').slice(0, -1))).toBe(false);
  });

  test('ZWJ family is one grapheme with length 11', () => {
    const family = by('ZWJ family emoji (man, woman, girl, boy)');
    expect(family.length).toBe(11);
    expect([...new Intl.Segmenter().segment(family)].length).toBe(1);
  });

  test('NFC and NFD forms differ until normalized', () => {
    const nfc = by('precomposed e acute (NFC)');
    const nfd = by('decomposed e acute (NFD)');
    expect(nfc).not.toBe(nfd);
    expect(nfc.normalize('NFC')).toBe(nfd.normalize('NFC'));
    expect(by('Hangul syllables (precomposed)').normalize('NFD').startsWith(by('Hangul jamo (decomposed)'))).toBe(true);
  });

  test('casing traps change length', () => {
    expect(by('German sharp s').toUpperCase()).toBe('STRASSE');
    expect(by('Turkish dotted and dotless i').toLowerCase().length).toBeGreaterThan(4);
  });

  test('whitespace cases trim as described', () => {
    expect(by('mixed ASCII whitespace').trim()).toBe('');
    expect(by('zero width space (U+200B)').trim()).toBe(by('zero width space (U+200B)'));
    expect(by('zero width space (U+200B)')).not.toBe('foobar');
    expect(/\s/.test(by('no-break space (U+00A0)'))).toBe(true);
  });

  test('unicode digits are not numbers', () => {
    expect(Number(by('Arabic-Indic digits'))).toBeNaN();
    expect(/^\d+$/.test(by('full width digits'))).toBe(false);
  });

  test('regex metacharacters break new RegExp', () => {
    expect(() => new RegExp(by('regex metacharacters'))).toThrow(SyntaxError);
  });
});

describe('numbers()', () => {
  const by = (label: string) => numbers().find((c) => c.label === label)!.value;

  test('every value is a number', () => {
    for (const c of numbers()) expect(typeof c.value).toBe('number');
  });

  test('values match the claims', () => {
    expect(Object.is(by('negative zero'), -0)).toBe(true);
    expect(by('NaN')).toBeNaN();
    expect(by('MAX_SAFE_INTEGER + 1') + 1).toBe(by('MAX_SAFE_INTEGER + 1'));
    expect(Number.isSafeInteger(by('MIN_SAFE_INTEGER - 1'))).toBe(false);
    expect(by('0.1 + 0.2')).not.toBe(0.3);
    expect(by('1.005').toFixed(2)).toBe('1.00');
    expect(String(by('1e21'))).toBe('1e+21');
    expect(String(by('999999999999999900000'))).toBe('999999999999999900000');
    expect(String(by('1e-7'))).toBe('1e-7');
    expect(String(0.000001)).toBe('0.000001');
    expect(by('-0.0001').toFixed(2)).toBe('-0.00');
    expect(Object.is(Math.trunc(by('-0.5')), -0)).toBe(true);
    expect((2 ** 31) | 0).toBe(-(2 ** 31));
  });

  test('pdf.js style formatting bug: integer part loses the sign', () => {
    const naive = (n: number) => `${Math.trunc(n)}.${String(Math.abs(n % 1)).slice(2, 4) || '00'}`;
    const failures = numbers({ tags: ['fraction'] }).filter((c) => c.value < 0 && !naive(c.value).startsWith('-'));
    expect(failures.length).toBeGreaterThan(0);
  });
});

describe('numericStrings()', () => {
  test('parsers disagree as described', () => {
    const by = (label: string) => numericStrings().find((c) => c.label === label)!.value;
    expect(Number(by('empty string'))).toBe(0);
    expect(Number.parseFloat(by('whitespace only'))).toBeNaN();
    expect(Number.parseInt(by('exponent notation'), 10)).toBe(1);
    expect(Number(by('numeric separator literal'))).toBeNaN();
    expect(Number(by('unsafe integer string'))).toBe(9007199254740992);
    expect(Object.is(Number(by('negative zero string')), -0)).toBe(true);
  });
});

describe('bigints()', () => {
  test('every value is a bigint and the limits are right', () => {
    const by = (label: string) => bigints().find((c) => c.label === label)!.value;
    for (const c of bigints()) expect(typeof c.value).toBe('bigint');
    expect(BigInt.asIntN(64, by('int64 max') + 1n)).toBe(by('int64 min'));
    expect(BigInt.asIntN(64, by('uint64 max'))).toBe(-1n);
    expect(BigInt.asUintN(64, by('2^64 (overflows uint64)'))).toBe(0n);
    expect(BigInt(Number(by('2^53 + 1 (first integer Number cannot hold)')))).not.toBe(by('2^53 + 1 (first integer Number cannot hold)'));
    expect(() => JSON.stringify(by('1e30 as BigInt'))).toThrow(TypeError);
  });
});

describe('urls()', () => {
  test('valid and invalid tags agree with the WHATWG URL parser', () => {
    for (const c of urls()) {
      const valid = c.tags.includes('valid');
      expect(valid !== c.tags.includes('invalid'), c.label).toBe(true);
      let parsed = true;
      try {
        new URL(c.value);
      } catch {
        parsed = false;
      }
      expect(parsed, c.label).toBe(valid);
    }
  });

  test('normalizations happen as described', () => {
    const by = (label: string) => urls().find((c) => c.label === label)!.value;
    expect(new URL(by('shorthand IPv4 (127.1)')).hostname).toBe('127.0.0.1');
    expect(new URL(by('hex IPv4 (0x7f.0.0.1)')).hostname).toBe('127.0.0.1');
    expect(new URL(by('explicit default port')).port).toBe('');
    expect(new URL(by('javascript: with a newline inside')).href).toBe('javascript:alert(1)');
    expect(new URL(by('dot segments in path')).pathname).toBe('/secret');
    expect(new URL(by('internationalized domain')).hostname.startsWith('xn--')).toBe(true);
    expect(new URL(by('backslash relative'), 'https://good.test').host).toBe('example.com');
    expect(new URL(by('protocol relative'), 'https://good.test').host).toBe('example.com');
  });
});

describe('emails()', () => {
  test('each case is tagged exactly one of valid or invalid', () => {
    for (const c of emails()) {
      expect(c.tags.includes('valid') !== c.tags.includes('invalid'), c.label).toBe(true);
    }
  });

  test('local part length cases sit on the RFC 5321 limit', () => {
    const by = (label: string) => emails().find((c) => c.label === label)!.value;
    expect(by('64 character local part (maximum)').split('@')[0]).toHaveLength(64);
    expect(by('65 character local part (too long)').split('@')[0]).toHaveLength(65);
  });
});

describe('paths()', () => {
  test('every case names a platform', () => {
    for (const c of paths()) expect(c.tags.includes('windows') || c.tags.includes('posix'), c.label).toBe(true);
  });

  test('traversal cases escape their base directory', () => {
    for (const c of paths({ tags: ['traversal'] })) {
      const impl = c.tags.includes('windows') ? path.win32 : path.posix;
      const base = c.tags.includes('windows') ? 'C:\\app\\data' : '/app/data';
      const resolved = impl.resolve(base, c.value);
      expect(impl.relative(base, resolved).startsWith('..'), c.label).toBe(true);
    }
  });

  test('Windows specific parsing differs from POSIX', () => {
    const by = (label: string) => paths().find((c) => c.label === label)!.value;
    expect(path.win32.isAbsolute(by('drive relative path'))).toBe(false);
    expect(path.win32.isAbsolute(by('Windows absolute path'))).toBe(true);
    expect(path.posix.isAbsolute(by('Windows absolute path'))).toBe(false);
    expect(path.posix.basename(by('trailing slash'))).toBe('sub');
    expect(by('trailing slash').split('/').pop()).toBe('');
    expect(path.posix.extname(by('dotfile'))).toBe('');
    expect(by('path longer than 260 characters').length).toBeGreaterThan(260);
  });
});

describe('json()', () => {
  test('valid and invalid tags agree with JSON.parse', () => {
    for (const c of json()) {
      const valid = c.tags.includes('valid');
      expect(valid !== c.tags.includes('invalid'), c.label).toBe(true);
      let parsed = true;
      try {
        JSON.parse(c.value);
      } catch {
        parsed = false;
      }
      expect(parsed, c.label).toBe(valid);
    }
  });

  test('round trips change values as described', () => {
    const by = (label: string) => json().find((c) => c.label === label)!.value;
    expect(JSON.parse(by('duplicate keys'))).toEqual({ a: 2 });
    expect(JSON.parse(by('integer above 2^53')).id).toBe(9007199254740992);
    expect(JSON.parse(by('huge exponent'))).toBe(Number.POSITIVE_INFINITY);
    expect(Object.is(JSON.parse(by('negative zero')), -0)).toBe(true);
    expect(Object.getPrototypeOf(JSON.parse(by('__proto__ key')))).toBe(Object.prototype);
    expect(Object.hasOwn(JSON.parse(by('__proto__ key')), '__proto__')).toBe(true);
  });
});

describe('arrays()', () => {
  test('every value is an array and holes are real holes', () => {
    const by = (label: string) => arrays().find((c) => c.label === label)!.value;
    for (const c of arrays()) expect(Array.isArray(c.value)).toBe(true);
    expect(1 in by('array with a hole')).toBe(false);
    expect(1 in by('explicit undefined')).toBe(true);
    expect(by('huge sparse length (2^32 - 1)').length).toBe(2 ** 32 - 1);
    expect(by('NaN element').indexOf(Number.NaN)).toBe(-1);
    expect(by('NaN element').includes(Number.NaN)).toBe(true);
    expect([...by('numbers that sort as strings')].sort()).toEqual([1, 10, 100, 9]);
    expect(() => Math.max(...(by('500000 elements (too many to spread)') as number[]))).toThrow(RangeError);
  });
});
