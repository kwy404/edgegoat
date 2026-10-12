import type { Case, Failure } from '../types';

/**
 * Decides whether a result is acceptable. Return `false` to report a failure.
 * Throwing inside the predicate also counts as a failure.
 */
export type Predicate<T, R> = (result: R, value: T, item: Case<T>) => boolean;

/**
 * Runs `fn` on every case and returns the cases that failed: those where `fn`
 * threw, or where `predicate` returned false. An empty array means all passed.
 *
 * Works with any test runner, or without one.
 *
 * @example
 * const failures = check((s) => truncate(s, 10), strings(), (out) => out.isWellFormed());
 * expect(failures).toEqual([]);
 */
export function check<T, R>(fn: (value: T) => R, cases: readonly Case<T>[], predicate?: Predicate<T, R>): Failure<T>[] {
  const failures: Failure<T>[] = [];
  for (const item of cases) {
    let result: R;
    try {
      result = fn(item.value);
    } catch (error) {
      failures.push({ label: item.label, value: item.value, why: item.why, error });
      continue;
    }
    if (!predicate) continue;
    let ok: boolean;
    try {
      ok = predicate(result, item.value, item);
    } catch (error) {
      failures.push({ label: item.label, value: item.value, why: item.why, error, result });
      continue;
    }
    if (!ok) failures.push({ label: item.label, value: item.value, why: item.why, result });
  }
  return failures;
}

function describe(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return String(error);
}

/**
 * Throws one readable error listing every case where `fn` threw.
 * Returns nothing when all cases pass.
 *
 * @example
 * assertNoThrow((s) => slugify(s), strings());
 */
export function assertNoThrow<T>(fn: (value: T) => unknown, cases: readonly Case<T>[]): void {
  const failures = check(fn, cases);
  if (failures.length === 0) return;
  const lines = failures.map((f) => `  - ${f.label}: ${describe(f.error)}\n    why it matters: ${f.why}`);
  const error = new Error(`${failures.length} of ${cases.length} edge cases threw:\n${lines.join('\n')}`);
  error.name = 'EdgeCaseError';
  (error as Error & { failures: Failure<T>[] }).failures = failures;
  throw error;
}
