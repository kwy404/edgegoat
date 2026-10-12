import type { Case, CaseOptions } from '../types';
import { c, filter } from '../internal/build';

/**
 * A curated list of IANA time zones that expose bugs, each with the reason it
 * is interesting. Run your date code under each one with `withTimeZone()`.
 *
 * @example
 * for (const { value: tz } of timeZones()) {
 *   withTimeZone(tz, () => expect(formatDay(date)).toBe(expected));
 * }
 */
export function timeZones(options: CaseOptions = {}): Case<string>[] {
  const cases: Case<string>[] = [
    c('UTC', 'UTC', 'The control zone: offset 0 all year. Bugs that only show up away from UTC hide here, which is why CI should not run only in UTC.', ['utc', 'control']),
    c('America/New_York', 'America/New_York', 'UTC-05:00 with US DST rules: the classic negative offset where UTC midnight is the previous local day.', ['negative', 'dst']),
    c('America/Los_Angeles', 'America/Los_Angeles', 'UTC-08:00: late enough that evening events land on the next UTC day.', ['negative', 'dst']),
    c('America/Sao_Paulo', 'America/Sao_Paulo', 'UTC-03:00; used DST with midnight transitions until 2019, so historical dates have days without 00:00.', ['negative', 'historical-dst', 'midnight-dst']),
    c('America/St_Johns', 'America/St_Johns', 'UTC-03:30: a half hour offset with DST in the Americas; code that assumes whole hours breaks.', ['negative', 'fractional-offset', 'dst']),
    c('Europe/London', 'Europe/London', 'UTC+00:00 in winter but +01:00 in summer: tests that pass in January fail in July.', ['dst', 'zero-offset']),
    c('Europe/Dublin', 'Europe/Dublin', 'The tz database models Irish time with a negative DST save (standard time in summer), which trips code that reads the isDST flag of tz libraries.', ['dst', 'zero-offset']),
    c('Africa/Casablanca', 'Africa/Casablanca', 'UTC+01:00 that drops to +00:00 during Ramadan each year, so transitions move with the lunar calendar.', ['dst', 'irregular']),
    c('Asia/Kolkata', 'Asia/Kolkata', 'UTC+05:30, no DST: the most populous half hour offset.', ['positive', 'fractional-offset']),
    c('Asia/Kathmandu', 'Asia/Kathmandu', 'UTC+05:45: a quarter hour offset that breaks `offset / 60` rounding and hour only offset pickers.', ['positive', 'fractional-offset']),
    c('Asia/Tehran', 'Asia/Tehran', 'UTC+03:30; abolished DST in 2022, so historical and current rules differ.', ['positive', 'fractional-offset', 'historical-dst']),
    c('Australia/Adelaide', 'Australia/Adelaide', 'UTC+09:30 / +10:30: southern hemisphere DST plus a half hour offset.', ['positive', 'fractional-offset', 'dst', 'southern']),
    c('Australia/Lord_Howe', 'Australia/Lord_Howe', 'UTC+10:30 / +11:00: DST shifts by only 30 minutes, so "DST adds one hour" is false.', ['positive', 'fractional-offset', 'dst', 'unusual-dst', 'southern']),
    c('Pacific/Chatham', 'Pacific/Chatham', 'UTC+12:45 / +13:45: quarter hour offset with DST, far east of the date line.', ['positive', 'fractional-offset', 'dst', 'southern']),
    c('Pacific/Kiritimati', 'Pacific/Kiritimati', 'UTC+14:00, the largest offset: local dates are a full day ahead of most of the Americas and the first to reach New Year.', ['positive', 'extreme']),
    c('Pacific/Apia', 'Pacific/Apia', 'Samoa skipped 2011-12-30 entirely when it moved across the date line; day counting across that date is off by one.', ['positive', 'historical', 'skipped-day']),
    c('Pacific/Pago_Pago', 'Pacific/Pago_Pago', 'UTC-11:00, among the last places to leave a year; local dates lag a day behind most of Asia.', ['negative', 'extreme']),
    c('Antarctica/Troll', 'Antarctica/Troll', 'UTC+00:00 in winter and +02:00 in summer: a two hour DST jump.', ['dst', 'unusual-dst']),
  ];
  return filter(cases, options);
}
