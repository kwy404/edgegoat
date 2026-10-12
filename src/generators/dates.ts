import type { DateCase, DateOptions } from '../types';
import { filter } from '../internal/build';
import {
  assertZone,
  findTransitions,
  formatOffset,
  formatWall,
  instantForWall,
  offsetMinutes,
} from '../internal/tz';

const MINUTE = 60_000;

const RELATIVE_TIME_BUG = 'https://github.com/github/relative-time-element/pull/384';

/** Zones used by `dates()` when no `zone` option is given. */
export const DEFAULT_DATE_ZONES: readonly string[] = Object.freeze([
  'America/New_York',
  'America/Sao_Paulo',
  'Europe/London',
  'Australia/Lord_Howe',
  'Asia/Kathmandu',
  'Pacific/Kiritimati',
  'Pacific/Pago_Pago',
]);

/** America/Sao_Paulo observed DST until 2019, so its default sample year is 2018. */
const HISTORICAL_YEAR: Readonly<Record<string, number>> = { 'America/Sao_Paulo': 2018 };

const DEFAULT_YEAR = 2026;

function utc(year: number, month: number, day: number, h = 0, m = 0, s = 0, ms = 0): Date {
  const d = new Date(0);
  d.setUTCFullYear(year, month - 1, day);
  d.setUTCHours(h, m, s, ms);
  return d;
}

function dc(label: string, value: Date, why: string, tags: readonly string[], extra?: { zone?: string; ref?: string }): DateCase {
  const out: { -readonly [K in keyof DateCase]: DateCase[K] } = { label, value, why, tags: Object.freeze([...tags]) };
  if (extra?.zone !== undefined) out.zone = extra.zone;
  if (extra?.ref !== undefined) out.ref = extra.ref;
  return out;
}

function genericCases(): DateCase[] {
  return [
    dc(
      'unix epoch 1970-01-01T00:00:00.000Z',
      new Date(0),
      'Timestamp 0 is falsy, so `if (!time)` treats a valid date as missing, and west of UTC it is still 1969 locally.',
      ['epoch', 'falsy'],
    ),
    dc(
      '1 ms before the epoch',
      new Date(-1),
      'Negative timestamps: `ms % 1000` is -1, not 999, so splitting seconds and milliseconds with % and Math.floor disagree.',
      ['epoch', 'pre-1970', 'negative'],
    ),
    dc(
      'before 1970 with fractional seconds (1969-12-31T23:59:58.500Z)',
      new Date(-1500),
      'Truncating -1.5 s toward zero gives 23:59:59 instead of 23:59:58; Math.trunc vs Math.floor and integer division bugs live here.',
      ['pre-1970', 'fractional', 'negative'],
    ),
    dc(
      'moon landing 1969-07-20T20:17:40.123Z',
      utc(1969, 7, 20, 20, 17, 40, 123),
      'Negative timestamp with milliseconds: serializers that build "seconds.millis" from a negative value print a wrong or doubly negative fraction.',
      ['pre-1970', 'fractional', 'negative'],
    ),
    dc(
      'local mean time era 1850-01-01T00:00:00Z',
      utc(1850, 1, 1),
      'Before standard time, zones used local mean time with second level offsets (Sao Paulo was -03:06:28); getTimezoneOffset() reports whole minutes, so local arithmetic drifts by seconds.',
      ['pre-1970', 'lmt', 'timezone'],
    ),
    dc(
      'year 0 (0000-01-01T00:00:00Z)',
      utc(0, 1, 1),
      'Date.UTC(0, 0, 1) and new Date(0, 0, 1) map years 0 to 99 to 1900 to 1999, and toISOString() yields "0000", which "1 BC" formatting must handle.',
      ['far-past', 'two-digit-year'],
    ),
    dc(
      'negative year (-000001-01-01T00:00:00Z)',
      utc(-1, 1, 1),
      'toISOString() produces an expanded, signed year "-000001"; regexes that expect four digits reject it.',
      ['far-past', 'iso-format'],
    ),
    dc(
      'year 2038 limit 2038-01-19T03:14:07Z',
      new Date(2_147_483_647_000),
      'Last second representable as a signed 32 bit Unix time; anything that stores seconds in an int32 (or uses `| 0`) is fine here.',
      ['y2038'],
    ),
    dc(
      'year 2038 overflow 2038-01-19T03:14:08Z',
      new Date(2_147_483_648_000),
      'One second past the int32 limit: `(ms / 1000) | 0` wraps to 1901-12-13, and so do 32 bit database columns.',
      ['y2038', 'overflow'],
    ),
    dc(
      'last instant of year 9999',
      utc(9999, 12, 31, 23, 59, 59, 999),
      'Largest instant with a four digit year; one millisecond later toISOString() switches to "+010000".',
      ['far-future', 'iso-format'],
    ),
    dc(
      'year 10000 (+010000-01-01T00:00:00.000Z)',
      utc(10000, 1, 1),
      'toISOString() returns a six digit signed year; parsers, databases and YYYY format strings break.',
      ['far-future', 'iso-format'],
    ),
    dc(
      'maximum Date (+275760-09-13T00:00:00.000Z)',
      new Date(8.64e15),
      'Largest valid Date. Adding 1 ms produces Invalid Date, so "end of time" sentinels overflow.',
      ['far-future', 'limit'],
    ),
    dc(
      'minimum Date (-271821-04-20T00:00:00.000Z)',
      new Date(-8.64e15),
      'Smallest valid Date. Subtracting anything produces Invalid Date, and local offsets west of UTC push the local wall clock out of range.',
      ['far-past', 'limit'],
    ),
    dc(
      'invalid date',
      new Date(Number.NaN),
      'getTime() is NaN, toISOString() throws RangeError, JSON.stringify gives null and every comparison is false.',
      ['invalid'],
    ),
    dc(
      'date-only string parsed as UTC (new Date("2026-03-01"))',
      new Date('2026-03-01'),
      'Date-only ISO strings are UTC midnight, while date-time strings without Z are local; west of UTC this date displays as February 28.',
      ['parsing', 'timezone'],
    ),
    dc(
      'leap day 2024-02-29',
      utc(2024, 2, 29, 12),
      'Adding a year with setFullYear(y + 1) lands on 2025-03-01 because Feb 29 2025 does not exist; birthdays and anniversaries drift.',
      ['leap', 'arithmetic'],
    ),
    dc(
      'leap day 2000-02-29 (400 year rule)',
      utc(2000, 2, 29, 12),
      '2000 is a leap year because it is divisible by 400, unlike 1900 and 2100; a "divisible by 100 means not leap" rule rejects it.',
      ['leap'],
    ),
    dc(
      'not a leap year 2100-02-28',
      utc(2100, 2, 28, 12),
      '2100 is not a leap year; `year % 4 === 0` claims Feb 29 2100 exists and the day after this is computed wrong.',
      ['leap'],
    ),
    dc(
      'month end 2026-01-31',
      utc(2026, 1, 31, 12),
      'setMonth(month + 1) on January 31 overflows to March 3, because February 31 does not exist.',
      ['month-end', 'arithmetic'],
    ),
    dc(
      'month end 2026-03-31',
      utc(2026, 3, 31, 12),
      'Adding one month to March 31 gives May 1, since April has 30 days; "same day next month" needs clamping.',
      ['month-end', 'arithmetic'],
    ),
    dc(
      'last millisecond of 2026 (UTC)',
      utc(2026, 12, 31, 23, 59, 59, 999),
      'Range queries ending at 23:59:59 miss this millisecond; month index 11 plus one must roll over into the next year.',
      ['month-end', 'year-boundary'],
    ),
    dc(
      '2027-01-01 is in ISO week 53 of 2026',
      utc(2027, 1, 1, 12),
      'ISO week years differ from calendar years: this Friday belongs to week 53 of 2026, so `getFullYear()` plus week number is wrong.',
      ['week'],
    ),
    dc(
      '2024-12-30 is in ISO week 1 of 2025',
      utc(2024, 12, 30, 12),
      'A Monday in December that belongs to week 1 of the next ISO year; "yyyy-ww" built from the calendar year shows 2024-01.',
      ['week'],
    ),
    dc(
      '2023-01-01 is a Sunday in ISO week 52 of 2022',
      utc(2023, 1, 1, 12),
      'ISO weeks start on Monday, US weeks on Sunday: this day is week 52 of 2022 in ISO but week 1 of 2023 in US numbering.',
      ['week'],
    ),
  ];
}

function zoneCases(zone: string, year: number): DateCase[] {
  const out: DateCase[] = [];
  for (const tr of findTransitions(zone, year)) {
    const shift = tr.after - tr.before;
    const day = formatWall(zone, tr.at).slice(0, 10);
    const beforeWall = formatWall(zone, tr.at - 1);
    const hours = (minutes: number): string => String(minutes / 60);
    const toWall = formatWall(zone, tr.at).slice(11);
    const unusual = Math.abs(shift) !== 60 ? ['unusual-dst'] : [];
    if (shift > 0) {
      const gapStart = new Date(tr.at + tr.before * MINUTE).toISOString().slice(11, 16);
      const gapEnd = new Date(tr.at + tr.after * MINUTE).toISOString().slice(11, 16);
      const midnight = gapStart === '00:00'
        ? ` Midnight does not exist that day, so new Date(${day.slice(0, 4)}, ${Number(day.slice(5, 7)) - 1}, ${Number(day.slice(8, 10))}) returns ${gapEnd}.`
        : '';
      out.push(
        dc(
          `${zone} ${year}: 1 ms before spring forward (${beforeWall} local)`,
          new Date(tr.at - 1),
          `Last instant before clocks jump from ${gapStart} to ${gapEnd} (UTC${formatOffset(tr.before)} to UTC${formatOffset(tr.after)}); adding ${shift} minutes of wall time here is not ${shift} minutes of real time.`,
          ['dst', 'gap', 'timezone', ...unusual],
          { zone },
        ),
        dc(
          `${zone} ${year}: spring forward (${day} ${toWall} local)`,
          new Date(tr.at),
          `Clocks jump from ${gapStart} to ${gapEnd}; local times in between do not exist, so building a Date from local fields shifts it and that local day is ${hours(24 * 60 - shift)} hours long.${midnight}`,
          ['dst', 'gap', 'timezone', ...unusual],
          { zone },
        ),
      );
    } else if (shift < 0) {
      const half = Math.abs(shift) / 2;
      const repeated = formatWall(zone, tr.at - half * MINUTE).slice(11);
      const backFrom = new Date(tr.at + tr.before * MINUTE).toISOString().slice(11, 16);
      const backTo = new Date(tr.at + tr.after * MINUTE).toISOString().slice(11, 16);
      out.push(
        dc(
          `${zone} ${year}: fall back, first ${repeated} (${day})`,
          new Date(tr.at - half * MINUTE),
          `Clocks fall back from ${backFrom} to ${backTo}, so ${repeated} happens twice; this is the first one (UTC${formatOffset(tr.before)}). Parsing the local time picks one of the two.`,
          ['dst', 'overlap', 'ambiguous', 'timezone', ...unusual],
          { zone },
        ),
        dc(
          `${zone} ${year}: fall back, second ${repeated} (${day})`,
          new Date(tr.at + half * MINUTE),
          `Same wall clock reading as the first ${repeated}, ${Math.abs(shift)} minutes later (UTC${formatOffset(tr.after)}); sorting or deduplicating by local time breaks and that local day is ${hours(24 * 60 - shift)} hours long.`,
          ['dst', 'overlap', 'ambiguous', 'timezone', ...unusual],
          { zone },
        ),
      );
    }
  }

  // Year boundary: the instant where the local year and the UTC year disagree.
  const firstLocal = instantForWall(zone, Date.UTC(year, 0, 1));
  const offset = offsetMinutes(zone, firstLocal);
  if (offset !== 0) {
    const fractional = offset % 60 !== 0 ? ['fractional-offset'] : [];
    if (offset > 0) {
      const note = offset >= 14 * 60 ? ' This zone is among the first places on Earth to enter the new year.' : '';
      out.push(
        dc(
          `${zone}: first instant of ${year} local time`,
          new Date(firstLocal),
          `Local time is ${year}-01-01 00:00 (UTC${formatOffset(offset)}) but the UTC year is still ${year - 1}; a year check with getUTCFullYear() is off by one.${note}`,
          ['year-boundary', 'timezone', ...fractional],
          { zone, ref: RELATIVE_TIME_BUG },
        ),
      );
    } else {
      const lastPrev = firstLocal - 1;
      const note = offset <= -11 * 60 ? ' This zone is among the last places on Earth to leave the old year.' : '';
      out.push(
        dc(
          `${zone}: last instant of ${year - 1} local time`,
          new Date(lastPrev),
          `Local time is ${year - 1}-12-31 23:59:59.999 (UTC${formatOffset(offset)}) but the UTC year is already ${year}; a year check with getUTCFullYear() is off by one.${note}`,
          ['year-boundary', 'timezone', ...fractional],
          { zone, ref: RELATIVE_TIME_BUG },
        ),
      );
    }
  }
  return out;
}

/**
 * Date edge cases: DST gaps and overlaps computed from `Intl` for several
 * zones, year boundaries, leap days, the epoch, dates before 1970 with
 * fractional seconds, 2038, years 9999 and 10000, invalid dates, month ends
 * and ISO week numbering.
 *
 * @example
 * test.each(dates({ tags: ['dst'] }))('$label', ({ value, zone }) => {
 *   expect(addOneDay(value, zone)).toEqual(expected(value, zone));
 * });
 */
export function dates(options: DateOptions = {}): DateCase[] {
  const zones = options.zone === undefined ? DEFAULT_DATE_ZONES : typeof options.zone === 'string' ? [options.zone] : options.zone;
  const cases = genericCases();
  for (const zone of zones) {
    assertZone(zone);
    const year = options.year ?? HISTORICAL_YEAR[zone] ?? DEFAULT_YEAR;
    cases.push(...zoneCases(zone, year));
  }
  return filter(cases, options);
}
