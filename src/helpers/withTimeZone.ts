import { assertZone, offsetMinutes } from '../internal/tz';

interface NodeLikeProcess {
  env: Record<string, string | undefined>;
  versions?: { node?: string };
}

function nodeProcess(): NodeLikeProcess | undefined {
  const p = (globalThis as { process?: NodeLikeProcess }).process;
  return p && typeof p.env === 'object' && p.versions?.node ? p : undefined;
}

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    value !== null &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof (value as { then?: unknown }).then === 'function'
  );
}

function setZone(proc: NodeLikeProcess, zone: string | undefined, systemZone: string): void {
  if (zone === undefined) {
    // Deleting TZ does not make Node drop its cached zone, so switch to the
    // zone that was active before and then remove the variable.
    proc.env.TZ = systemZone;
    delete proc.env.TZ;
  } else {
    proc.env.TZ = zone;
  }
}

/**
 * Runs `fn` with the process time zone set to `zone`, then restores the
 * previous zone, even if `fn` throws or its promise rejects.
 *
 * Works in Node.js (and runtimes that honor `process.env.TZ` at runtime) by
 * assigning `process.env.TZ`, which Node applies immediately to `Date` and to
 * the default zone of `Intl`. Throws in browsers, where the zone cannot change
 * at runtime.
 *
 * Caveats:
 * - The zone is process wide. Code that runs concurrently while an async `fn`
 *   is pending (other tests in the same worker, timers) sees it too, so do not
 *   run zone tests with `test.concurrent`.
 * - `Intl.DateTimeFormat` instances created before the switch keep their zone.
 * - Worker threads share the environment of the process in Node.
 *
 * @example
 * withTimeZone('Asia/Kathmandu', () => {
 *   expect(new Date('2026-01-01T00:00:00Z').getTimezoneOffset()).toBe(-345);
 * });
 */
export function withTimeZone<T>(zone: string, fn: () => T): T {
  const proc = nodeProcess();
  if (!proc) {
    throw new Error(
      'edgegoat: withTimeZone() needs Node.js, because browsers cannot change the time zone at runtime. ' +
        'Start the browser or test runner with the zone instead (for example TZ=Asia/Kathmandu, or the timezoneId option in Playwright).',
    );
  }
  assertZone(zone);

  const previous = proc.env.TZ;
  const systemZone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
  proc.env.TZ = zone;

  // Verify the runtime really switched, instead of silently testing the wrong zone.
  const now = Date.now();
  const expected = -Math.round(offsetMinutes(zone, now));
  const actual = new Date(now).getTimezoneOffset();
  if (expected !== actual) {
    setZone(proc, previous, systemZone);
    throw new Error(
      `edgegoat: this runtime did not apply TZ="${zone}" (expected getTimezoneOffset() ${expected}, got ${actual}). ` +
        'Set the TZ environment variable before starting the process instead.',
    );
  }

  let result: T;
  try {
    result = fn();
  } catch (error) {
    setZone(proc, previous, systemZone);
    throw error;
  }
  if (isThenable(result)) {
    return Promise.resolve(result).finally(() => setZone(proc, previous, systemZone)) as T;
  }
  setZone(proc, previous, systemZone);
  return result;
}
