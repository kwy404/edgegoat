import type { Case } from '../types';

/**
 * Keeps only the cases with these labels, in the order you list them.
 * Throws when a label does not exist, so a typo never turns into a test
 * that silently runs zero cases.
 *
 * @example
 * test.each(pick(strings(), 'lone high surrogate', 'flag emoji'))('$label', ...);
 */
export function pick<C extends Case<unknown>>(cases: readonly C[], ...labels: string[]): C[] {
  const byLabel = new Map(cases.map((item) => [item.label, item] as const));
  const missing = labels.filter((label) => !byLabel.has(label));
  if (missing.length > 0) {
    const known = cases.slice(0, 5).map((item) => JSON.stringify(item.label)).join(', ');
    throw new RangeError(
      `No case labeled ${missing.map((m) => JSON.stringify(m)).join(', ')}. ` +
        `Labels are exact and case sensitive, for example ${known}${cases.length > 5 ? ', ...' : ''}.`,
    );
  }
  return labels.map((label) => byLabel.get(label)!);
}

/**
 * Just the values, without labels and reasons. Handy for loops and for
 * property based testing libraries that take a plain list of inputs.
 *
 * @example
 * fc.constantFrom(...values(strings()));
 */
export function values<T>(cases: readonly Case<T>[]): T[] {
  return cases.map((item) => item.value);
}
