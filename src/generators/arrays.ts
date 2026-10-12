import type { Case, CaseOptions } from '../types';
import { c, filter } from '../internal/build';

function withHole(): unknown[] {
  const a: unknown[] = [1, 2, 3];
  delete a[1];
  return a;
}

/**
 * Array edge cases: holes, sparse and huge lengths, NaN and -0 membership,
 * default sort order, mixed types and arrays too large to spread.
 */
export function arrays(options: CaseOptions = {}): Case<unknown[]>[] {
  const cases: Case<unknown[]>[] = [
    c('empty array', [], 'Truthy even though empty; reduce without a seed throws and Math.max(...[]) is -Infinity.', ['empty']),
    c('array with a hole', withHole(), 'forEach, map and filter skip the hole but for...of and spread yield undefined, so the two styles disagree.', ['sparse', 'hole']),
    c('explicit undefined', [1, undefined, 3], 'Looks like the hole case when printed, but every iteration method visits it and `1 in arr` is true.', ['undefined']),
    c('length 5 with no elements', new Array(5), 'new Array(5) has five holes: map returns holes, not values, and JSON.stringify writes nulls.', ['sparse', 'hole']),
    c('huge sparse length (2^32 - 1)', (() => { const a: unknown[] = []; a.length = 2 ** 32 - 1; a[0] = 'first'; return a; })(), 'The maximum array length: cheap to create, but any loop to length or Array.from runs four billion times.', ['sparse', 'huge', 'limit']),
    c('NaN element', [Number.NaN], 'indexOf(NaN) is -1 while includes(NaN) is true; Set and Map treat NaN as equal to itself.', ['nan']),
    c('-0 and 0', [-0, 0], 'Set collapses them into one value and includes(-0) finds 0; Object.is tells them apart.', ['zero', 'sign']),
    c('numbers that sort as strings', [10, 9, 1, 100], 'Default sort() compares strings, giving [1, 10, 100, 9]; always pass a comparator.', ['sort']),
    c('undefined during sort', [3, undefined, 1], 'sort() moves undefined to the end without calling the comparator, so comparators never see it.', ['sort', 'undefined']),
    c('mixed number and numeric string', [1, '1'], 'includes("1") and Set treat them as different, while == and loose lookups do not.', ['mixed', 'coercion']),
    c('nested empty arrays', [[[]]], 'flat() and recursive flatten helpers must handle empty levels; String([[[]]]) is "".', ['nested']),
    c('array with extra property', Object.assign([1, 2], { extra: 'x' }), 'for...in visits "extra" and Object.keys includes it, but length and JSON.stringify ignore it.', ['properties']),
    c('frozen array', Object.freeze([1, 2, 3]) as unknown as unknown[], 'push and in place sort throw TypeError in strict mode; libraries that mutate input break.', ['frozen']),
    c('500000 elements (too many to spread)', Array.from({ length: 500_000 }, (_, i) => i), 'Math.max(...arr) and fn.apply(null, arr) exceed the argument limit and throw RangeError.', ['large', 'stack']),
  ];
  return filter(cases, options);
}
