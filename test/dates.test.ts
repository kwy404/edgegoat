import { describe, expect, test } from 'vitest';
import { dates, DEFAULT_DATE_ZONES, withTimeZone } from '../src/index';
import { findTransitions, formatWall, offsetMinutes } from '../src/internal/tz';

const MINUTE = 60_000;

function isoWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  return { year: d.getUTCFullYear(), week: Math.ceil(((d.getTime() - yearStart) / 86_400_000 + 1) / 7) };
}

describe('dates()', () => {
  const all = dates();

  test('returns Date values with unique labels and a why', () => {
    expect(all.length).toBeGreaterThan(40);
    expect(new Set(all.map((c) => c.label)).size).toBe(all.length);
    for (const c of all) {
      expect(c.value).toBeInstanceOf(Date);
      expect(c.why.length).toBeGreaterThan(20);
      expect(c.tags.length).toBeGreaterThan(0);
    }
  });

  test('only the invalid case holds an invalid date', () => {
    const invalid = all.filter((c) => Number.isNaN(c.value.getTime()));
    expect(invalid.map((c) => c.label)).toEqual(['invalid date']);
    expect(invalid[0]?.tags).toContain('invalid');
  });

  test('covers every default zone, with DST for the zones that have it', () => {
    for (const zone of DEFAULT_DATE_ZONES) {
      expect(all.some((c) => c.zone === zone)).toBe(true);
    }
    const dstZones = new Set(all.filter((c) => c.tags.includes('dst')).map((c) => c.zone));
    expect([...dstZones].sort()).toEqual(['America/New_York', 'America/Sao_Paulo', 'Australia/Lord_Howe', 'Europe/London']);
  });

  test('labels with an ISO timestamp match their value', () => {
    for (const c of all) {
      const m = /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z)/.exec(c.label);
      if (m?.[1] && !c.label.startsWith('-')) {
        const expected = m[1].includes('.') ? m[1] : m[1].replace('Z', '.000Z');
        if (/^(\+|-)\d{6}/.test(c.value.toISOString())) continue;
        expect(c.value.toISOString(), c.label).toBe(expected);
      }
    }
  });

  test('fixed instants are what the labels claim', () => {
    const by = (label: string) => all.find((c) => c.label === label)!.value;
    expect(by('year 10000 (+010000-01-01T00:00:00.000Z)').toISOString()).toBe('+010000-01-01T00:00:00.000Z');
    expect(by('negative year (-000001-01-01T00:00:00Z)').toISOString()).toBe('-000001-01-01T00:00:00.000Z');
    expect(by('year 0 (0000-01-01T00:00:00Z)').toISOString()).toBe('0000-01-01T00:00:00.000Z');
    expect(by('maximum Date (+275760-09-13T00:00:00.000Z)').getTime()).toBe(8.64e15);
    expect(new Date(by('maximum Date (+275760-09-13T00:00:00.000Z)').getTime() + 1).getTime()).toBeNaN();
    expect(by('year 2038 overflow 2038-01-19T03:14:08Z').getTime() / 1000).toBe(2 ** 31);
    expect((by('year 2038 overflow 2038-01-19T03:14:08Z').getTime() / 1000) | 0).toBe(-(2 ** 31));
    expect(by('before 1970 with fractional seconds (1969-12-31T23:59:58.500Z)').toISOString()).toBe('1969-12-31T23:59:58.500Z');
  });

  test('ISO week cases are true', () => {
    const by = (label: string) => all.find((c) => c.label === label)!.value;
    expect(isoWeek(by('2027-01-01 is in ISO week 53 of 2026'))).toEqual({ year: 2026, week: 53 });
    expect(isoWeek(by('2024-12-30 is in ISO week 1 of 2025'))).toEqual({ year: 2025, week: 1 });
    expect(isoWeek(by('2023-01-01 is a Sunday in ISO week 52 of 2022'))).toEqual({ year: 2022, week: 52 });
    expect(by('2023-01-01 is a Sunday in ISO week 52 of 2022').getUTCDay()).toBe(0);
  });

  test('leap and month end cases behave as described', () => {
    const by = (label: string) => new Date(all.find((c) => c.label === label)!.value);
    const leap = by('leap day 2024-02-29');
    leap.setUTCFullYear(2025);
    expect(leap.toISOString().slice(0, 10)).toBe('2025-03-01');
    const jan31 = by('month end 2026-01-31');
    jan31.setUTCMonth(1);
    expect(jan31.toISOString().slice(0, 10)).toBe('2026-03-03');
    const mar31 = by('month end 2026-03-31');
    mar31.setUTCMonth(3);
    expect(mar31.toISOString().slice(0, 10)).toBe('2026-05-01');
    expect(new Date(Date.UTC(2100, 1, 29)).getUTCMonth()).toBe(2);
    expect(new Date(Date.UTC(2000, 1, 29)).getUTCMonth()).toBe(1);
  });

  test('every call returns fresh Date objects', () => {
    const a = dates();
    a[0]!.value.setTime(123);
    expect(dates()[0]!.value.getTime()).toBe(0);
  });
});

describe('DST cases are real transitions', () => {
  const dst = dates({ tags: ['dst'] });

  test('gap cases: the offset changes exactly at the spring forward instant', () => {
    const gaps = dst.filter((c) => c.tags.includes('gap') && c.label.includes(': spring forward'));
    expect(gaps.length).toBeGreaterThanOrEqual(4);
    for (const c of gaps) {
      const zone = c.zone!;
      const at = c.value.getTime();
      const before = offsetMinutes(zone, at - 1);
      const after = offsetMinutes(zone, at);
      expect(after, c.label).toBeGreaterThan(before);
      // One millisecond of real time moves the wall clock by the whole gap.
      const wallJump = formatWall(zone, at) !== formatWall(zone, at - MINUTE);
      expect(wallJump).toBe(true);
    }
  });

  test('1 ms before cases sit right before a spring forward', () => {
    const pre = dst.filter((c) => c.label.includes('1 ms before spring forward'));
    for (const c of pre) {
      const zone = c.zone!;
      const t = c.value.getTime();
      expect(offsetMinutes(zone, t + 1)).toBeGreaterThan(offsetMinutes(zone, t));
    }
  });

  test('overlap cases: both instants show the same wall clock time', () => {
    const overlaps = dst.filter((c) => c.tags.includes('overlap'));
    expect(overlaps.length % 2).toBe(0);
    for (let i = 0; i < overlaps.length; i += 2) {
      const first = overlaps[i]!;
      const second = overlaps[i + 1]!;
      expect(first.zone).toBe(second.zone);
      expect(formatWall(first.zone!, first.value.getTime())).toBe(formatWall(second.zone!, second.value.getTime()));
      expect(second.value.getTime()).toBeGreaterThan(first.value.getTime());
      expect(offsetMinutes(first.zone!, first.value.getTime())).toBeGreaterThan(offsetMinutes(second.zone!, second.value.getTime()));
    }
  });

  test('Lord Howe shifts by 30 minutes and is tagged unusual-dst', () => {
    const lordHowe = dst.filter((c) => c.zone === 'Australia/Lord_Howe');
    expect(lordHowe.length).toBe(4);
    for (const c of lordHowe) expect(c.tags).toContain('unusual-dst');
    const tr = findTransitions('Australia/Lord_Howe', 2026);
    expect(tr.map((t) => Math.abs(t.after - t.before))).toEqual([30, 30]);
  });

  test('New York 2026 transitions match the US rule (second Sunday of March, first Sunday of November)', () => {
    const tr = findTransitions('America/New_York', 2026);
    expect(tr.map((t) => new Date(t.at).toISOString())).toEqual(['2026-03-08T07:00:00.000Z', '2026-11-01T06:00:00.000Z']);
  });

  test('the Node runtime agrees: getTimezoneOffset changes across each transition', () => {
    for (const c of dst.filter((x) => x.label.includes('1 ms before spring forward'))) {
      withTimeZone(c.zone!, () => {
        const t = c.value.getTime();
        expect(new Date(t).getTimezoneOffset(), c.label).not.toBe(new Date(t + 1).getTimezoneOffset());
      });
    }
  });

  test('Sao Paulo 2018: local midnight did not exist on November 4', () => {
    withTimeZone('America/Sao_Paulo', () => {
      const d = new Date(2018, 10, 4);
      expect(d.getHours()).toBe(1);
      expect(d.toISOString()).toBe('2018-11-04T03:00:00.000Z');
    });
  });

  test('New York: local 02:30 on the spring forward day becomes 03:30', () => {
    withTimeZone('America/New_York', () => {
      const d = new Date(2026, 2, 8, 2, 30);
      expect(d.getHours()).toBe(3);
      expect(d.getMinutes()).toBe(30);
    });
  });
});

describe('dates() options', () => {
  test('tags filter keeps only matching cases', () => {
    const leap = dates({ tags: ['leap'] });
    expect(leap.length).toBe(3);
    for (const c of leap) expect(c.tags).toContain('leap');
  });

  test('exclude removes cases', () => {
    const noZones = dates({ exclude: ['timezone'] });
    expect(noZones.every((c) => !c.tags.includes('timezone'))).toBe(true);
  });

  test('zone selects one zone, including zones outside the default list', () => {
    const berlin = dates({ zone: 'Europe/Berlin', tags: ['dst'] });
    expect(berlin.length).toBe(4);
    expect(berlin.every((c) => c.zone === 'Europe/Berlin')).toBe(true);
    const several = dates({ zone: ['Asia/Kathmandu', 'Pacific/Kiritimati'], tags: ['year-boundary'] });
    expect(several.filter((c) => c.zone).map((c) => c.zone)).toEqual(['Asia/Kathmandu', 'Pacific/Kiritimati']);
  });

  test('year option changes the DST sample year', () => {
    const y2025 = dates({ zone: 'America/New_York', year: 2025, tags: ['gap'] });
    expect(y2025.map((c) => c.value.toISOString())).toEqual(['2025-03-09T06:59:59.999Z', '2025-03-09T07:00:00.000Z']);
  });

  test('year boundary cases really straddle the UTC year', () => {
    for (const c of dates({ tags: ['year-boundary'] }).filter((x) => x.zone)) {
      const localYear = Number(formatWall(c.zone!, c.value.getTime()).slice(0, 4));
      expect(localYear, c.label).not.toBe(c.value.getUTCFullYear());
    }
  });

  test('unknown zones throw a readable RangeError', () => {
    expect(() => dates({ zone: 'Mars/Olympus_Mons' })).toThrow(/unknown time zone "Mars\/Olympus_Mons"/);
  });
});
