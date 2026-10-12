// Jest quick start (CommonJS). Run with: npx jest
// Jest supports `$label` in test.each titles when the cases are objects.
const { dates, json, strings, withFrozenTime, withTimeZone } = require('edgegoat');

describe('daylight saving time', () => {
  test.each(dates({ tags: ['dst'] }))('$label', ({ value, zone }) => {
    withTimeZone(zone, () => {
      // Formatting and parsing back must give the same instant, even inside a DST overlap.
      const iso = value.toISOString();
      expect(new Date(iso).getTime()).toBe(value.getTime());
    });
  });

  test('a mocked "now" on New Year in Kiritimati', () => {
    withTimeZone('Pacific/Kiritimati', () => {
      withFrozenTime('2025-12-31T10:00:00Z', () => {
        expect(new Date().getFullYear()).toBe(2026);
        expect(new Date().getUTCFullYear()).toBe(2025);
      });
    });
  });
});

describe('unicode strings', () => {
  test.each(strings({ tags: ['normalization'] }))('$label survives NFC normalization', ({ value }) => {
    expect(value.normalize('NFC').normalize('NFC')).toBe(value.normalize('NFC'));
  });
});

describe('JSON parsing', () => {
  test.each(json({ tags: ['invalid'] }))('rejects $label', ({ value }) => {
    expect(() => JSON.parse(value)).toThrow();
  });
});
