import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { describe, expect, test } from 'vitest';

const root = fileURLToPath(new URL('..', import.meta.url));
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  name: string;
  exports: Record<string, { import: { types: string; default: string }; require: { types: string; default: string } }>;
};
const entry = pkg.exports['.']!;

const EXPECTED_EXPORTS = [
  'DEFAULT_DATE_ZONES',
  'arrays',
  'assertNoThrow',
  'bigints',
  'casesFor',
  'check',
  'dates',
  'emails',
  'generatorFor',
  'json',
  'numbers',
  'numericStrings',
  'paths',
  'pick',
  'strings',
  'timeZones',
  'urls',
  'values',
  'withFrozenTime',
  'withTimeZone',
];

describe('package entry points', () => {
  test('every file in the exports map exists (run `npm run build` first)', () => {
    for (const file of [entry.import.types, entry.import.default, entry.require.types, entry.require.default]) {
      expect(existsSync(join(root, file)), file).toBe(true);
    }
  });

  test('the ESM build exposes the public API', async () => {
    const mod = (await import(pathToFileURL(join(root, entry.import.default)).href)) as Record<string, unknown>;
    expect(Object.keys(mod).sort()).toEqual(EXPECTED_EXPORTS);
  });

  test('the CJS build exposes the same API and the same cases', async () => {
    const require = createRequire(import.meta.url);
    const cjs = require(join(root, entry.require.default)) as Record<string, (...args: unknown[]) => { label: string }[]>;
    const esm = (await import(pathToFileURL(join(root, entry.import.default)).href)) as typeof cjs;
    expect(Object.keys(cjs).filter((k) => k !== '__esModule').sort()).toEqual(EXPECTED_EXPORTS);
    for (const name of ['dates', 'strings', 'numbers', 'urls', 'paths', 'json', 'arrays']) {
      expect(cjs[name]!().map((c) => c.label)).toEqual(esm[name]!().map((c) => c.label));
    }
  });

  test('the package can import itself by name (self reference through exports)', async () => {
    const require = createRequire(join(root, 'package.json'));
    expect(typeof (require(pkg.name) as { dates: unknown }).dates).toBe('function');
  });

  test('the ESM build has no top level side effects besides definitions', () => {
    const code = readFileSync(join(root, entry.import.default), 'utf8');
    expect(code).not.toMatch(/^process\.env\.TZ\s*=/m);
    expect(code).not.toMatch(/^globalThis\.Date\s*=/m);
  });

  test('type declarations exist for both formats', () => {
    for (const file of [entry.import.types, entry.require.types]) {
      const text = readFileSync(join(root, file), 'utf8');
      expect(text).toContain('declare function dates');
      expect(text).toContain('interface Case<T>');
    }
  });

  test('source files contain only ASCII, so no invisible or confusable character hides in them', () => {
    const walk = (dir: string): string[] =>
      readdirSync(dir).flatMap((name) => {
        const full = join(dir, name);
        return statSync(full).isDirectory() ? walk(full) : [full];
      });
    for (const file of walk(join(root, 'src'))) {
      const text = readFileSync(file, 'utf8');
      const bad = [...text].findIndex((ch) => ch.charCodeAt(0) > 0x7e || (ch.charCodeAt(0) < 0x20 && ch !== '\n' && ch !== '\r'));
      expect(bad, `${file} has a non ASCII character at index ${bad}`).toBe(-1);
    }
  });
});
