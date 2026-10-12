// Vitest quick start. Run with: npx vitest
import { describe, expect, test } from 'vitest';
import { assertNoThrow, dates, numbers, strings, timeZones, withTimeZone } from 'edgegoat';

// Code under test: add whole days in the local time zone.
function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

describe('addDays', () => {
  test.each(dates({ tags: ['dst'] }))('$label', ({ value, zone }) => {
    withTimeZone(zone!, () => {
      const next = addDays(value, 1);
      const tomorrow = new Date(value.getFullYear(), value.getMonth(), value.getDate() + 1);
      // Next calendar day, same wall clock time, even when the day is 23 or 25 hours long.
      expect([next.getFullYear(), next.getMonth(), next.getDate()]).toEqual([tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()]);
      expect([next.getHours(), next.getMinutes()]).toEqual([value.getHours(), value.getMinutes()]);
    });
  });
});

describe('formatting numbers keeps the sign', () => {
  test.each(numbers({ tags: ['sign'] }))('$label', ({ value }) => {
    // Intl keeps the sign of -0 and of tiny negatives when enough digits are allowed.
    const formatted = new Intl.NumberFormat('en-US', { maximumFractionDigits: 20 }).format(value);
    expect(formatted.startsWith('-')).toBe(value < 0 || Object.is(value, -0));
  });
});

test('slugify never throws on unicode input', () => {
  const slugify = (s: string) => s.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  assertNoThrow(slugify, strings());
});

describe.each(timeZones({ tags: ['fractional-offset'] }))('in $label', ({ value: tz }) => {
  test('local midnight is a whole day after the previous one', () => {
    withTimeZone(tz, () => {
      const a = new Date(2026, 0, 1);
      const b = new Date(2026, 0, 2);
      expect(b.getTime() - a.getTime()).toBe(86_400_000);
    });
  });
});
