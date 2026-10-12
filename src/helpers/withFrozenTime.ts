function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    value !== null &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof (value as { then?: unknown }).then === 'function'
  );
}

/**
 * Runs `fn` with `Date.now()` and `new Date()` frozen at `date`, then puts the
 * real `Date` back, even if `fn` throws or its promise rejects.
 *
 * It replaces `globalThis.Date` with a thin wrapper, so `instanceof Date`,
 * `Date.UTC`, `Date.parse` and `new Date(value)` keep working. Timers and
 * `performance.now()` are not touched; use your runner's fake timers for those.
 *
 * Caveats: code that captured `Date` before the call (for example
 * `const { now } = Date`) still sees real time, and while an async `fn` is
 * pending, all code in the process sees the frozen clock.
 *
 * @example
 * withFrozenTime('2026-12-31T23:30:00-05:00', () => {
 *   expect(isSameYear(new Date('2027-01-01T03:00:00Z'), 'America/New_York')).toBe(false);
 * });
 */
export function withFrozenTime<T>(date: Date | string | number, fn: () => T): T {
  const RealDate = globalThis.Date;
  const frozen = new RealDate(date instanceof RealDate ? date.getTime() : date).getTime();
  if (Number.isNaN(frozen)) {
    throw new RangeError(`edgegoat: withFrozenTime() got an invalid date: ${String(date)}`);
  }

  function FrozenDate(this: unknown, ...args: unknown[]): unknown {
    if (!new.target) return new RealDate(frozen).toString();
    return Reflect.construct(RealDate, args.length === 0 ? [frozen] : args, new.target);
  }
  FrozenDate.prototype = RealDate.prototype;
  Object.defineProperties(FrozenDate, {
    now: { value: () => frozen, writable: true, configurable: true },
    parse: { value: RealDate.parse, writable: true, configurable: true },
    UTC: { value: RealDate.UTC, writable: true, configurable: true },
    name: { value: 'Date', configurable: true },
    length: { value: 7, configurable: true },
  });

  const restore = (): void => {
    globalThis.Date = RealDate;
  };
  globalThis.Date = FrozenDate as unknown as DateConstructor;

  let result: T;
  try {
    result = fn();
  } catch (error) {
    restore();
    throw error;
  }
  if (isThenable(result)) {
    return Promise.resolve(result).finally(restore) as T;
  }
  restore();
  return result;
}
