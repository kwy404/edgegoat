/**
 * A short date formatter that hides the year when the date is in the current
 * year, like "Mar 4" vs "Mar 4, 2025". GitHub's <relative-time> element had
 * exactly this bug: the "current year" check used UTC, not the display time
 * zone (fixed in github/relative-time-element#384).
 */

/** Buggy: decides "same year" with UTC years. */
export function formatShortNaive(date: Date, timeZone: string): string {
  const now = new Date();
  const sameYear = date.getUTCFullYear() === now.getUTCFullYear();
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  }).format(date);
}

function yearIn(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric' }).format(date);
}

/** Fixed: compares the years as they appear in the display time zone. */
export function formatShort(date: Date, timeZone: string): string {
  const sameYear = yearIn(date, timeZone) === yearIn(new Date(), timeZone);
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  }).format(date);
}
