// Mocha quick start. Run with: npx mocha examples/mocha/
const assert = require('node:assert/strict');
const { emails, numbers, withTimeZone, dates } = require('edgegoat');

describe('email validator', () => {
  // A deliberately simple validator: accepts anything with one @ and a dot after it.
  const looksLikeEmail = (s) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);

  for (const { label, value } of emails({ tags: ['valid'], exclude: ['quoted', 'domain'] })) {
    it(`accepts ${label}`, () => assert.ok(looksLikeEmail(value), value));
  }
});

describe('Set membership uses SameValueZero', () => {
  for (const { label, value } of numbers({ tags: ['zero', 'nan'] })) {
    it(label, () => assert.ok(new Set([value]).has(value)));
  }
});

describe('Sao Paulo midnight DST (2018)', () => {
  for (const { label, value, zone } of dates({ zone: 'America/Sao_Paulo', tags: ['gap'] })) {
    it(label, () => {
      withTimeZone(zone, () => assert.notEqual(value.getHours(), 0, 'midnight does not exist on this day'));
    });
  }
});
