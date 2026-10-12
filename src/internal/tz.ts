/**
 * Time zone math derived from `Intl.DateTimeFormat`, so results always match the
 * tz database shipped with the running engine. Nothing here is hard coded.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(zone: string): Intl.DateTimeFormat {
  let f = formatters.get(zone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      era: 'short',
    });
    formatters.set(zone, f);
  }
  return f;
}

/** Throws a readable error when `zone` is not a time zone the engine knows. */
export function assertZone(zone: string): void {
  try {
    formatter(zone);
  } catch {
    throw new RangeError(`edgegoat: unknown time zone "${zone}". Use an IANA name such as "America/New_York".`);
  }
}

/** Wall clock fields of instant `ms` in `zone`, as a UTC timestamp of the same fields. */
export function wallClockAsUtc(zone: string, ms: number): number {
  const parts = formatter(zone).formatToParts(new Date(ms));
  const get = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((p) => p.type === type);
    return part ? Number(part.value) : 0;
  };
  const era = parts.find((p) => p.type === 'era')?.value ?? 'AD';
  let year = get('year');
  if (era === 'BC' || era === 'B') year = 1 - year;
  const hour = get('hour') % 24;
  const d = new Date(0);
  d.setUTCFullYear(year, get('month') - 1, get('day'));
  d.setUTCHours(hour, get('minute'), get('second'), 0);
  return d.getTime();
}

/** UTC offset of `zone` at instant `ms`, in minutes (positive east of UTC). May be fractional for LMT. */
export function offsetMinutes(zone: string, ms: number): number {
  const whole = ms - (((ms % 1000) + 1000) % 1000);
  return (wallClockAsUtc(zone, whole) - whole) / MINUTE;
}

/** Formats a minute offset as `+05:45` or `-03:00`. */
export function formatOffset(minutes: number): string {
  const sign = minutes < 0 ? '-' : '+';
  const abs = Math.abs(Math.round(minutes));
  const h = String(Math.floor(abs / 60)).padStart(2, '0');
  const m = String(abs % 60).padStart(2, '0');
  return `${sign}${h}:${m}`;
}

/** Formats the wall clock of `ms` in `zone` as `YYYY-MM-DD HH:mm`. */
export function formatWall(zone: string, ms: number): string {
  return new Date(wallClockAsUtc(zone, ms)).toISOString().slice(0, 16).replace('T', ' ');
}

export interface Transition {
  /** First instant (ms since epoch) at which the new offset applies. */
  readonly at: number;
  /** Offset in minutes just before `at`. */
  readonly before: number;
  /** Offset in minutes from `at` on. */
  readonly after: number;
}

/**
 * Finds every offset change of `zone` during UTC year `year` by scanning in
 * 6 hour steps and then binary searching down to the minute.
 */
export function findTransitions(zone: string, year: number): Transition[] {
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year + 1, 0, 1);
  const step = 6 * HOUR;
  const out: Transition[] = [];
  let prevTime = start;
  let prevOffset = offsetMinutes(zone, start);
  for (let t = start + step; t <= end; t += step) {
    const offset = offsetMinutes(zone, t);
    if (offset !== prevOffset) {
      // Invariant: offset(lo) === prevOffset, offset(hi) !== prevOffset.
      let lo = Math.floor(prevTime / MINUTE);
      let hi = Math.floor(t / MINUTE);
      while (hi - lo > 1) {
        const mid = Math.floor((lo + hi) / 2);
        if (offsetMinutes(zone, mid * MINUTE) === prevOffset) lo = mid;
        else hi = mid;
      }
      const at = hi * MINUTE;
      out.push({ at, before: prevOffset, after: offsetMinutes(zone, at) });
    }
    prevTime = t;
    prevOffset = offset;
  }
  return out.filter((tr) => tr.at < end);
}

/**
 * Instant at which the local wall clock in `zone` reads `wallUtc` (fields
 * encoded as a UTC timestamp). Picks the earlier instant when ambiguous.
 */
export function instantForWall(zone: string, wallUtc: number): number {
  let guess = wallUtc - offsetMinutes(zone, wallUtc) * MINUTE;
  for (let i = 0; i < 3; i++) {
    const next = wallUtc - offsetMinutes(zone, guess) * MINUTE;
    if (next === guess) break;
    guess = next;
  }
  return guess;
}
