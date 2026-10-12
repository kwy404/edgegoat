import { describe, expect, test } from 'vitest';
import { check, strings } from 'edgegoat';
import { isWellFormed, truncate, truncateNaive } from './truncate';

// Inputs that are well formed to begin with, so any lone surrogate in the
// output was created by the truncation itself.
const inputs = strings({ tags: ['surrogate', 'emoji', 'grapheme', 'combining'], exclude: ['malformed'] });
const limits = [1, 3, 6, 10];

describe('truncate() against unicode edge cases', () => {
  test.each(inputs)('fixed: $label', ({ value }) => {
    for (const max of limits) {
      const out = truncate(value, max);
      expect(isWellFormed(out)).toBe(true);
      expect(out.length).toBeLessThanOrEqual(max + 1);
    }
  });

  test('naive: edgegoat finds the split surrogate pairs', () => {
    const failures = check((s: string) => truncateNaive(s, 10), inputs, (out) => isWellFormed(out));
    expect(failures.map((f) => f.label)).toContain('surrogate pair cut by slice(0, 10)');
  });

  test('naive: and more of them at other lengths', () => {
    const labels = new Set<string>();
    for (const max of limits) {
      for (const f of check((s: string) => truncateNaive(s, max), inputs, (out) => isWellFormed(out))) labels.add(f.label);
    }
    expect(labels.size).toBeGreaterThanOrEqual(4);
  });
});
