import type { Case, CaseOptions } from '../types';

/** Creates a frozen case object. Kept tiny so generators stay readable. */
export function c<T>(label: string, value: T, why: string, tags: readonly string[], ref?: string): Case<T> {
  const out: { label: string; value: T; why: string; tags: readonly string[]; ref?: string } = {
    label,
    value,
    why,
    tags: Object.freeze([...tags]),
  };
  if (ref !== undefined) out.ref = ref;
  return out;
}

/** Applies `tags` and `exclude` filters. Does not mutate the input. */
export function filter<C extends Case<unknown>>(cases: readonly C[], options: CaseOptions | undefined): C[] {
  const include = options?.tags;
  const exclude = options?.exclude;
  return cases.filter((item) => {
    if (include && include.length > 0 && !include.some((t) => item.tags.includes(t))) return false;
    if (exclude && exclude.some((t) => item.tags.includes(t))) return false;
    return true;
  });
}
