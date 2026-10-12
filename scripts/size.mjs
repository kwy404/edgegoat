// Prints the size of the ESM build: raw, gzipped, and minified + gzipped
// (the number bundlephobia reports). Usage: npm run build && npm run size
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { transform } from 'esbuild';

const code = readFileSync(new URL('../dist/index.js', import.meta.url), 'utf8');
const min = (await transform(code, { minify: true, format: 'esm' })).code;
const kb = (n) => `${(n / 1024).toFixed(1)} kB`;
console.log(`raw            ${kb(Buffer.byteLength(code))}`);
console.log(`gzip           ${kb(gzipSync(code).length)}`);
console.log(`min + gzip     ${kb(gzipSync(min).length)}`);
