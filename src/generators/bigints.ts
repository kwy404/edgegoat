import type { Case, CaseOptions } from '../types';
import { c, filter } from '../internal/build';

/**
 * BigInt edge cases: the 64 bit boundaries used by databases and binary
 * protocols, and the values where BigInt and Number disagree.
 */
export function bigints(options: CaseOptions = {}): Case<bigint>[] {
  const cases: Case<bigint>[] = [
    c('0n', 0n, 'Falsy like 0, and -0n is just 0n (BigInt has no negative zero), so sign preserving code paths diverge from Number.', ['zero', 'falsy']),
    c('-1n', -1n, 'BigInt division truncates toward zero (-1n / 2n is 0n) and % keeps the sign.', ['negative']),
    c('2^53 + 1 (first integer Number cannot hold)', 2n ** 53n + 1n, 'Number(2n ** 53n + 1n) rounds to 2^53; converting back to Number for math or JSON loses it.', ['precision', 'number-boundary']),
    c('int64 max', 2n ** 63n - 1n, 'Largest signed 64 bit integer (PostgreSQL bigint, Java long); one more overflows the column.', ['int64', 'limit']),
    c('int64 min', -(2n ** 63n), 'Smallest signed 64 bit integer; its absolute value does not fit in int64.', ['int64', 'limit', 'negative']),
    c('uint64 max', 2n ** 64n - 1n, 'Largest unsigned 64 bit integer; BigInt.asIntN(64, n) turns it into -1n.', ['uint64', 'limit']),
    c('2^64 (overflows uint64)', 2n ** 64n, 'Wraps to 0n with BigInt.asUintN(64, n); database drivers reject it.', ['uint64', 'overflow']),
    c('1e30 as BigInt', 10n ** 30n, 'Far beyond any Number integer: JSON.stringify throws TypeError for any BigInt, and mixing with Number in + throws.', ['large', 'json']),
  ];
  return filter(cases, options);
}
