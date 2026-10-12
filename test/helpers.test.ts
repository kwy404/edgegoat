import { afterEach, describe, expect, test } from 'vitest';
import { assertNoThrow, check, numbers, strings, withFrozenTime, withTimeZone, type Case } from '../src/index';

const JAN = new Date('2026-01-15T12:00:00Z');
const JUL = new Date('2026-07-15T12:00:00Z');

describe('withTimeZone()', () => {
  const initialOffset = JAN.getTimezoneOffset();
  const initialZone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
  const initialEnv = process.env.TZ;

  afterEach(() => {
    expect(JAN.getTimezoneOffset()).toBe(initialOffset);
    expect(new Intl.DateTimeFormat().resolvedOptions().timeZone).toBe(initialZone);
    expect(process.env.TZ).toBe(initialEnv);
  });

  test('changes getTimezoneOffset for the duration of fn', () => {
    expect(withTimeZone('Asia/Kathmandu', () => JAN.getTimezoneOffset())).toBe(-345);
    expect(withTimeZone('Pacific/Kiritimati', () => JAN.getTimezoneOffset())).toBe(-840);
    expect(withTimeZone('Pacific/Pago_Pago', () => JAN.getTimezoneOffset())).toBe(660);
    expect(withTimeZone('UTC', () => JAN.getTimezoneOffset())).toBe(0);
  });

  test('applies DST rules of the zone', () => {
    withTimeZone('America/New_York', () => {
      expect(JAN.getTimezoneOffset()).toBe(300);
      expect(JUL.getTimezoneOffset()).toBe(240);
    });
    withTimeZone('Australia/Lord_Howe', () => {
      expect(JAN.getTimezoneOffset()).toBe(-660);
      expect(JUL.getTimezoneOffset()).toBe(-630);
    });
  });

  test('changes local getters and the Intl default zone', () => {
    withTimeZone('Pacific/Kiritimati', () => {
      const d = new Date('2025-12-31T10:00:00Z');
      expect(d.getFullYear()).toBe(2026);
      expect(d.getUTCFullYear()).toBe(2025);
      expect(new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(d)).toBe('2026');
    });
  });

  test('restores the zone after fn throws', () => {
    expect(() =>
      withTimeZone('Asia/Kathmandu', () => {
        throw new Error('boom');
      }),
    ).toThrow('boom');
  });

  test('supports async functions and restores after they settle', async () => {
    const offset = await withTimeZone('Asia/Kathmandu', async () => {
      await new Promise((r) => setTimeout(r, 5));
      return new Date(JAN).getTimezoneOffset();
    });
    expect(offset).toBe(-345);
    await expect(
      withTimeZone('Asia/Kathmandu', async () => {
        await Promise.resolve();
        throw new Error('async boom');
      }),
    ).rejects.toThrow('async boom');
  });

  test('nests and restores the outer zone', () => {
    withTimeZone('America/New_York', () => {
      withTimeZone('Asia/Kathmandu', () => expect(JAN.getTimezoneOffset()).toBe(-345));
      expect(JAN.getTimezoneOffset()).toBe(300);
      expect(process.env.TZ).toBe('America/New_York');
    });
  });

  test('rejects unknown zones before touching the environment', () => {
    expect(() => withTimeZone('Not/A_Zone', () => 1)).toThrow(RangeError);
  });

  test('throws a clear error outside Node (for example in a browser)', () => {
    const g = globalThis as { process?: unknown };
    const saved = g.process;
    g.process = undefined;
    try {
      expect(() => withTimeZone('UTC', () => 1)).toThrow(/needs Node\.js/);
    } finally {
      g.process = saved;
    }
  });
});

describe('withFrozenTime()', () => {
  const RealDate = Date;
  afterEach(() => {
    expect(globalThis.Date).toBe(RealDate);
  });

  test('freezes Date.now() and new Date()', () => {
    withFrozenTime('2026-12-31T23:59:59.999Z', () => {
      expect(Date.now()).toBe(Date.UTC(2026, 11, 31, 23, 59, 59, 999));
      expect(new Date().toISOString()).toBe('2026-12-31T23:59:59.999Z');
      expect(new Date().getTime()).toBe(Date.now());
    });
  });

  test('accepts Date, string and number inputs', () => {
    const d = new Date(0);
    expect(withFrozenTime(d, () => Date.now())).toBe(0);
    expect(withFrozenTime(1_000, () => Date.now())).toBe(1_000);
    expect(withFrozenTime('1969-12-31T23:59:58.500Z', () => Date.now())).toBe(-1500);
  });

  test('keeps the rest of Date working', () => {
    withFrozenTime(0, () => {
      expect(new Date(2020, 0, 1)).toBeInstanceOf(Date);
      expect(new Date('2020-01-01T00:00:00Z').getTime()).toBe(1577836800000);
      expect(new Date(5).getTime()).toBe(5);
      expect(Date.UTC(2020, 0, 1)).toBe(1577836800000);
      expect(Date.parse('2020-01-01T00:00:00Z')).toBe(1577836800000);
      expect(typeof Date()).toBe('string');
      expect(Date()).toBe(new RealDate(0).toString());
      expect(new Date() instanceof RealDate).toBe(true);
      class Sub extends Date {}
      expect(new Sub().getTime()).toBe(0);
      expect(new Sub()).toBeInstanceOf(Sub);
    });
  });

  test('restores Date after throw and after async completion', async () => {
    expect(() =>
      withFrozenTime(0, () => {
        throw new Error('boom');
      }),
    ).toThrow('boom');
    const t = await withFrozenTime(42, async () => {
      await Promise.resolve();
      return Date.now();
    });
    expect(t).toBe(42);
  });

  test('nests', () => {
    withFrozenTime(1, () => {
      withFrozenTime(2, () => expect(Date.now()).toBe(2));
      expect(Date.now()).toBe(1);
    });
  });

  test('rejects invalid dates', () => {
    expect(() => withFrozenTime('not a date', () => 1)).toThrow(RangeError);
  });

  test('works together with withTimeZone', () => {
    withTimeZone('Pacific/Pago_Pago', () =>
      withFrozenTime('2026-01-01T10:59:59.999Z', () => {
        expect(new Date().getFullYear()).toBe(2025);
      }),
    );
  });
});

describe('check()', () => {
  const cases: Case<number>[] = [
    { label: 'one', value: 1, why: 'a', tags: ['x'] },
    { label: 'two', value: 2, why: 'b', tags: ['x'] },
    { label: 'three', value: 3, why: 'c', tags: ['x'] },
  ];

  test('returns an empty array when everything passes', () => {
    expect(check((n) => n * 2, cases)).toEqual([]);
    expect(check((n) => n * 2, cases, (r) => r % 2 === 0)).toEqual([]);
  });

  test('reports thrown errors with labels', () => {
    const failures = check((n) => {
      if (n === 2) throw new Error('two is bad');
      return n;
    }, cases);
    expect(failures).toHaveLength(1);
    expect(failures[0]).toMatchObject({ label: 'two', value: 2, why: 'b' });
    expect((failures[0]!.error as Error).message).toBe('two is bad');
  });

  test('reports predicate rejections with the result', () => {
    const failures = check((n) => n * 10, cases, (r, v) => r !== 30 && v !== 1);
    expect(failures.map((f) => [f.label, f.result])).toEqual([
      ['one', 10],
      ['three', 30],
    ]);
  });

  test('a throwing predicate is a failure, not a crash', () => {
    const failures = check((n) => n, cases, () => {
      throw new Error('predicate');
    });
    expect(failures).toHaveLength(3);
  });

  test('passes the full case to the predicate', () => {
    const seen: string[] = [];
    check((n) => n, cases, (_r, _v, item) => {
      seen.push(item.label);
      return true;
    });
    expect(seen).toEqual(['one', 'two', 'three']);
  });

  test('finds real failures in a naive function', () => {
    const buggy = (n: number) => {
      const int = Math.trunc(n);
      return `${int}${Math.abs(n - int).toFixed(2).slice(1)}`;
    };
    const fixed = (n: number) => (n < 0 ? '-' : '') + Math.abs(n).toFixed(2);
    const keepsSign = (out: string, v: number) => out.startsWith('-') === v < 0;
    const failures = check(buggy, numbers({ tags: ['sign'] }), keepsSign);
    expect(failures.map((f) => f.label)).toEqual(['-0.5', '-0.0001']);
    expect(check(fixed, numbers({ tags: ['sign'] }), keepsSign)).toEqual([]);
    const strict = check((s: string) => encodeURIComponent(s), strings({ tags: ['malformed'] }));
    expect(strict.length).toBe(2);
    expect((strict[0]!.error as Error).name).toBe('URIError');
  });
});

describe('assertNoThrow()', () => {
  test('passes silently when nothing throws', () => {
    expect(() => assertNoThrow((s: string) => s.length, strings())).not.toThrow();
  });

  test('throws one error listing every failing label and why', () => {
    let caught: (Error & { failures?: unknown[] }) | undefined;
    try {
      assertNoThrow((s: string) => encodeURIComponent(s), strings());
    } catch (error) {
      caught = error as Error & { failures?: unknown[] };
    }
    expect(caught).toBeInstanceOf(Error);
    expect(caught!.name).toBe('EdgeCaseError');
    expect(caught!.message).toContain('lone high surrogate');
    expect(caught!.message).toContain('lone low surrogate');
    expect(caught!.message).toContain('why it matters');
    expect(caught!.failures).toHaveLength(2);
  });
});
