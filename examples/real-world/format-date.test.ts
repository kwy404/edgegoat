import { describe, expect, test } from 'vitest';
import { check, dates, withFrozenTime, type Case } from 'edgegoat';
import { formatShort, formatShortNaive } from './format-date';

const HOUR = 3_600_000;

const localYear = (ms: number, zone: string) =>
  Number(new Intl.DateTimeFormat('en-US', { timeZone: zone, year: 'numeric' }).format(new Date(ms)));

/**
 * For every New Year case, "now" is the edge instant and the date being
 * formatted sits one hour away, on the other side of the local New Year.
 * The output must show that date's year, because it is not the current year.
 */
interface Scenario {
  now: Date;
  date: Date;
  zone: string;
}

const scenarios: Case<Scenario>[] = dates({ tags: ['year-boundary'] })
  .filter((c) => c.zone !== undefined)
  .map((c) => {
    const zone = c.zone!;
    const t = c.value.getTime();
    const other = [t - HOUR, t + HOUR].find((x) => localYear(x, zone) !== localYear(t, zone))!;
    return { ...c, value: { now: c.value, date: new Date(other), zone } };
  });

const showsYear = (out: string, s: Scenario) => out.includes(String(localYear(s.date.getTime(), s.zone)));

describe('formatShort around New Year in many time zones', () => {
  test('there is a scenario for every zone with a non zero offset', () => {
    expect(scenarios.map((s) => s.value.zone)).toEqual(
      expect.arrayContaining(['America/New_York', 'Asia/Kathmandu', 'Pacific/Kiritimati', 'Pacific/Pago_Pago']),
    );
  });

  test.each(scenarios)('fixed: $label', ({ value }) => {
    const out = withFrozenTime(value.now, () => formatShort(value.date, value.zone));
    expect(showsYear(out, value)).toBe(true);
  });

  test('naive: edgegoat catches the UTC year bug', () => {
    const failures = check(
      (s: Scenario) => withFrozenTime(s.now, () => formatShortNaive(s.date, s.zone)),
      scenarios,
      showsYear,
    );
    // Every New Year case breaks the naive version, in both directions.
    expect(failures.map((f) => f.label)).toEqual(scenarios.map((s) => s.label));
    expect(failures.length).toBeGreaterThanOrEqual(5);
  });
});
