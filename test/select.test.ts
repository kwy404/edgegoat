import { describe, expect, test } from 'vitest';
import {
  arrays,
  bigints,
  casesFor,
  dates,
  emails,
  generatorFor,
  json,
  numbers,
  numericStrings,
  paths,
  pick,
  strings,
  timeZones,
  urls,
  values,
} from '../src/index';

describe('generatorFor()', () => {
  test.each([
    [new Date(0), 'dates'],
    [42, 'numbers'],
    [-0, 'numbers'],
    [Number.NaN, 'numbers'],
    [10n, 'bigints'],
    [[1, 2], 'arrays'],
    [[], 'arrays'],
    ['hello', 'strings'],
    ['', 'strings'],
    ['two words', 'strings'],
    ['https://example.com/a?b=1', 'urls'],
    ['mailto:ana@example.com', 'urls'],
    ['ana@example.com', 'emails'],
    ['Europe/Berlin', 'timeZones'],
    ['America/Argentina/Buenos_Aires', 'timeZones'],
    ['UTC', 'timeZones'],
    ['42', 'numericStrings'],
    [' -1.5e3 ', 'numericStrings'],
    ['0x1A', 'numericStrings'],
    ['NaN', 'numericStrings'],
    ['C:\\Users\\ana', 'paths'],
    ['/usr/local/bin', 'paths'],
    ['./src/index.ts', 'paths'],
    ['src/index.ts', 'paths'],
    ['{"a":1}', 'json'],
    ['[1,2,3]', 'json'],
    ['{not json}', 'strings'],
  ] as const)('%s is %s', (sample, name) => {
    expect(generatorFor(sample)).toBe(name);
  });

  test('returns undefined for values without a generator', () => {
    for (const sample of [true, null, undefined, {}, () => 1, Symbol('x')]) {
      expect(generatorFor(sample)).toBeUndefined();
    }
  });

  test('a slash alone does not make a time zone', () => {
    expect(generatorFor('Mars/Olympus_Mons')).toBe('paths');
  });
});

describe('casesFor()', () => {
  test('returns the same cases as the matching generator', () => {
    const pairs: [unknown, () => { label: string }[]][] = [
      [new Date(), () => dates()],
      [1, () => numbers()],
      [1n, () => bigints()],
      [[0], () => arrays()],
      ['text', () => strings()],
      ['https://a.b', () => urls()],
      ['a@b.c', () => emails()],
      ['Asia/Tokyo', () => timeZones()],
      ['12', () => numericStrings()],
      ['/tmp/x', () => paths()],
      ['{}', () => json()],
    ];
    for (const [sample, gen] of pairs) {
      expect(casesFor(sample).map((c) => c.label)).toEqual(gen().map((c) => c.label));
    }
  });

  test('passes options through, including zone and year for dates', () => {
    const berlin = casesFor(new Date(), { zone: 'Europe/Berlin', year: 2027, tags: ['dst'] });
    expect(berlin.length).toBeGreaterThan(0);
    expect(berlin.every((c) => c.zone === 'Europe/Berlin')).toBe(true);
    expect(casesFor('x', { tags: ['surrogate'] }).every((c) => c.tags.includes('surrogate'))).toBe(true);
  });

  test('throws a TypeError for values without a generator', () => {
    expect(() => casesFor(true)).toThrow(TypeError);
    expect(() => casesFor(null)).toThrow(/null values/);
  });
});

describe('pick()', () => {
  test('returns the named cases in the order given', () => {
    const all = strings();
    const [a, b] = [all[3]!.label, all[0]!.label];
    expect(pick(all, a, b).map((c) => c.label)).toEqual([a, b]);
  });

  test('throws a RangeError naming every missing label', () => {
    expect(() => pick(numbers(), 'zero', 'nope', 'also nope')).toThrow(RangeError);
    expect(() => pick(numbers(), 'nope', 'also nope')).toThrow(/"nope", "also nope"/);
  });

  test('keeps the case type', () => {
    const [nz] = pick(numbers(), 'negative zero');
    expect(Object.is(nz!.value, -0)).toBe(true);
  });
});

describe('values()', () => {
  test('returns the values only, in order', () => {
    const cases = numbers({ tags: ['zero'] });
    expect(values(cases)).toEqual(cases.map((c) => c.value));
  });
});
