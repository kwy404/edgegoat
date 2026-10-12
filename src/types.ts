/**
 * A single labeled edge case.
 *
 * The shape is designed to plug straight into `test.each` in Vitest and Jest:
 * `test.each(numbers())('$label', ({ value }) => { ... })`.
 */
export interface Case<T> {
  /** Short, unique, human readable name. Safe to use as a test title. */
  readonly label: string;
  /** The input to feed to the code under test. */
  readonly value: T;
  /** One sentence on why this input breaks code. */
  readonly why: string;
  /** Tags used for filtering, for example `dst`, `surrogate`, `invalid`. */
  readonly tags: readonly string[];
  /** Optional link to a real bug or spec section that explains the case. */
  readonly ref?: string;
}

/** A date case. Zone specific cases carry the IANA zone they were computed for. */
export interface DateCase extends Case<Date> {
  /** IANA time zone the case is about, when it is zone specific. */
  readonly zone?: string;
}

/** Options accepted by every generator. */
export interface CaseOptions {
  /**
   * Keep only cases that have at least one of these tags.
   * Example: `strings({ tags: ['surrogate', 'emoji'] })`.
   */
  readonly tags?: readonly string[];
  /** Drop cases that have any of these tags. Applied after `tags`. */
  readonly exclude?: readonly string[];
}

/** Options for `dates()`. */
export interface DateOptions extends CaseOptions {
  /**
   * IANA time zone (or list of zones) for the zone specific cases
   * (DST transitions and year boundaries). Any zone supported by `Intl` works.
   * Defaults to a curated set of zones with interesting rules.
   */
  readonly zone?: string | readonly string[];
  /**
   * Year used for DST transitions and year boundaries. Defaults to 2026, and to
   * 2018 for America/Sao_Paulo, which abolished DST in 2019.
   */
  readonly year?: number;
}

/** A case that failed in `check()`. */
export interface Failure<T = unknown> {
  readonly label: string;
  readonly value: T;
  readonly why: string;
  /** Present when the function threw. */
  readonly error?: unknown;
  /** Present when the function returned but the predicate rejected the result. */
  readonly result?: unknown;
}
