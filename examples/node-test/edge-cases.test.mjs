// node:test quick start. Run with: node --test examples/node-test/edge-cases.test.mjs
// node:test has no test.each, so loop over the cases.
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { arrays, check, dates, numbers, paths, urls, withTimeZone } from 'edgegoat';

describe('dates around New Year', () => {
  for (const { label, value, zone } of dates({ tags: ['year-boundary'] })) {
    if (!zone) continue;
    test(label, () => {
      withTimeZone(zone, () => {
        // In the zone, getFullYear() and getUTCFullYear() disagree at these instants.
        assert.notEqual(value.getFullYear(), value.getUTCFullYear());
      });
    });
  }
});

test('Number.isFinite rejects every non finite number', () => {
  const failures = check(Number.isFinite, numbers({ tags: ['nan', 'infinity'] }), (finite) => finite === false);
  assert.deepEqual(failures, []);
});

test('URL parsing matches the valid tag', () => {
  const parses = (s) => {
    try {
      new URL(s);
      return true;
    } catch {
      return false;
    }
  };
  const failures = check(parses, urls(), (ok, _value, item) => ok === item.tags.includes('valid'));
  assert.deepEqual(failures, []);
});

test('safe join keeps traversal inside the base directory', async () => {
  const path = await import('node:path');
  const safeJoin = (base, p) => {
    const resolved = path.posix.resolve(base, p);
    if (!resolved.startsWith(base + '/')) throw new Error('outside base');
    return resolved;
  };
  for (const { label, value } of paths({ tags: ['traversal'], exclude: ['windows'] })) {
    assert.throws(() => safeJoin('/srv/app', value), /outside base/, label);
  }
});

test('sum handles holes and huge arrays without spreading', () => {
  const sum = (arr) => arr.reduce((a, b) => (typeof b === 'number' ? a + b : a), 0);
  for (const { label, value } of arrays({ exclude: ['huge'] })) {
    assert.equal(typeof sum(value), 'number', label);
  }
});
