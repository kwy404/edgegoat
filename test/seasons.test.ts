// Date logic of the website's seasonal themes (docs/seasons.js). The script
// is plain browser JavaScript; here it runs in a sandbox without a document,
// where it only exposes its functions.
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, test } from 'vitest';

interface Seasons {
  IDS: string[];
  easter(year: number): Date;
  season(date: Date, lang: string): string;
}

function load(): Seasons {
  const source = readFileSync(new URL('../docs/seasons.js', import.meta.url), 'utf8');
  const sandbox: { window: Record<string, unknown> } = { window: {} };
  runInNewContext(source, sandbox);
  return sandbox.window.edgeSeasons as Seasons;
}

const S = load();
const on = (y: number, m: number, d: number, lang = 'en-US') => S.season(new Date(y, m - 1, d, 12), lang);
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

describe('easter()', () => {
  test.each([
    [2024, '2024-03-31'],
    [2025, '2025-04-20'],
    [2026, '2026-04-05'],
    [2027, '2027-03-28'],
    [2028, '2028-04-16'],
    [2029, '2029-04-01'],
    [2030, '2030-04-21'],
  ])('%i is %s', (year, expected) => {
    expect(iso(S.easter(year))).toBe(expected);
  });
});

describe('season()', () => {
  test('lists the seven seasons', () => {
    expect([...S.IDS].sort()).toEqual(['carnival', 'christmas', 'easter', 'halloween', 'junina', 'newyear', 'valentine']);
  });

  test('New Year: Dec 30 to Jan 2', () => {
    expect(on(2026, 12, 29)).toBe('');
    expect(on(2026, 12, 30)).toBe('newyear');
    expect(on(2026, 12, 31)).toBe('newyear');
    expect(on(2027, 1, 1)).toBe('newyear');
    expect(on(2027, 1, 2)).toBe('newyear');
    expect(on(2027, 1, 3)).toBe('');
  });

  test('Christmas: Dec 18 to Dec 26', () => {
    expect(on(2026, 12, 17)).toBe('');
    expect(on(2026, 12, 18)).toBe('christmas');
    expect(on(2026, 12, 25)).toBe('christmas');
    expect(on(2026, 12, 26)).toBe('christmas');
    expect(on(2026, 12, 27)).toBe('');
  });

  test('Halloween: Oct 24 to Oct 31', () => {
    expect(on(2026, 10, 23)).toBe('');
    expect(on(2026, 10, 24)).toBe('halloween');
    expect(on(2026, 10, 31)).toBe('halloween');
    expect(on(2026, 11, 1)).toBe('');
  });

  test('Easter: Good Friday to Easter Sunday', () => {
    expect(on(2026, 4, 2)).toBe('');
    expect(on(2026, 4, 3)).toBe('easter');
    expect(on(2026, 4, 5)).toBe('easter');
    expect(on(2026, 4, 6)).toBe('');
    expect(on(2024, 3, 29)).toBe('easter');
    expect(on(2024, 3, 31)).toBe('easter');
  });

  test('Carnival: the Saturday before Ash Wednesday through Ash Wednesday', () => {
    // 2027: Easter on March 28, Ash Wednesday on February 10.
    expect(on(2027, 2, 5)).toBe('');
    expect(on(2027, 2, 6)).toBe('carnival');
    expect(on(2027, 2, 9)).toBe('carnival');
    expect(on(2027, 2, 10)).toBe('carnival');
    expect(on(2027, 2, 11)).toBe('');
    // 2025: Easter on April 20, Ash Wednesday on March 5.
    expect(on(2025, 3, 1)).toBe('carnival');
    expect(on(2025, 3, 5)).toBe('carnival');
    expect(on(2025, 3, 6)).toBe('');
  });

  test('Carnival wins when it falls on February 14', () => {
    // 2026: Ash Wednesday on February 18, Carnival from February 14.
    expect(on(2026, 2, 14)).toBe('carnival');
    expect(on(2027, 2, 14)).toBe('valentine');
  });

  test("Valentine's: Feb 14 for everyone, June 12 only for pt-BR", () => {
    expect(on(2027, 2, 13)).toBe('');
    expect(on(2027, 2, 14)).toBe('valentine');
    expect(on(2027, 2, 14, 'pt-BR')).toBe('valentine');
    expect(on(2027, 2, 15)).toBe('');
    expect(on(2026, 6, 12, 'pt-BR')).toBe('valentine');
    expect(on(2026, 6, 12, 'pt-br')).toBe('valentine');
    expect(on(2026, 6, 12, 'en-US')).toBe('');
    expect(on(2026, 6, 12, 'pt-PT')).toBe('');
  });

  test('Festa Junina (Midsummer elsewhere): June 13 to June 29', () => {
    for (const lang of ['pt-BR', 'en-US']) {
      expect(on(2026, 6, 13, lang)).toBe('junina');
      expect(on(2026, 6, 29, lang)).toBe('junina');
      expect(on(2026, 6, 30, lang)).toBe('');
    }
  });

  test('an ordinary day has no season', () => {
    expect(on(2026, 10, 15)).toBe('');
    expect(on(2026, 8, 1)).toBe('');
  });
});

describe('overrides', () => {
  function boot(search: string, stored: Record<string, string> = {}, now = new Date(2026, 9, 15, 12)) {
    const attrs: Record<string, string> = {};
    const appended: string[] = [];
    const RealDate = Date;
    class FixedDate extends RealDate {
      constructor(...args: []) {
        if (args.length) super(...(args as unknown as [number]));
        else super(now.getTime());
      }
    }
    const sandbox = {
      Date: FixedDate,
      URLSearchParams,
      window: {
        location: { search },
        navigator: { language: 'en-US' },
        localStorage: { getItem: (k: string) => stored[k] ?? null },
      } as Record<string, unknown>,
      document: {
        documentElement: { setAttribute: (k: string, v: string) => { attrs[k] = v; } },
        currentScript: { src: 'https://example.test/edgegoat/seasons.js' },
        createElement: () => ({}) as { src?: string },
        head: { appendChild: (el: { src: string }) => appended.push(el.src) },
      },
    };
    const source = readFileSync(new URL('../docs/seasons.js', import.meta.url), 'utf8');
    runInNewContext(source, sandbox);
    return { season: attrs['data-season'], scripts: appended };
  }

  test('?season=<id> forces a season and loads the effects', () => {
    const r = boot('?season=halloween');
    expect(r.season).toBe('halloween');
    expect(r.scripts).toEqual(['https://example.test/edgegoat/season-fx.js']);
  });

  test('?season=off disables it, even on the day', () => {
    expect(boot('?season=off', {}, new Date(2026, 9, 31, 12)).season).toBeUndefined();
  });

  test('an unknown id is ignored', () => {
    expect(boot('?season=summer').season).toBeUndefined();
  });

  test('follows the date when nothing is forced', () => {
    expect(boot('', {}, new Date(2026, 9, 31, 12)).season).toBe('halloween');
    expect(boot('', {}, new Date(2026, 9, 15, 12)).season).toBeUndefined();
  });

  test('the off switch is remembered per season, and a forced preview ignores it', () => {
    const off = { 'edgegoat:season-off:halloween': '1' };
    expect(boot('', off, new Date(2026, 9, 31, 12)).season).toBeUndefined();
    expect(boot('?season=halloween', off).season).toBe('halloween');
    expect(boot('', off, new Date(2026, 11, 20, 12)).season).toBe('christmas');
  });
});
