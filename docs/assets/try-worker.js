// edgegoat docs: the worker behind the "try it" demo. Written by hand.
// It runs the real library (edgegoat.js, the published build) off the main
// thread, so generating DST instants or running a slow function never blocks
// the page. The page can terminate it when a pasted function hangs.
//
// Messages in:  { id, type: 'detect', text }
//               { id, type: 'cases', gen, options }
//               { id, type: 'run', gen, options, src }
// Messages out: { id, ok: true, ... } or { id, ok: false, error }
import * as edge from './edgegoat.js';

const BS = String.fromCharCode(92);

// ASCII only rendering, so emoji and invisible characters show as escapes.
function escapeCodePoints(s) {
  let out = '';
  for (const ch of s) {
    const cp = ch.codePointAt(0);
    if (ch === '"') out += BS + '"';
    else if (ch === BS) out += BS + BS;
    else if (ch === '\n') out += BS + 'n';
    else if (ch === '\r') out += BS + 'r';
    else if (ch === '\t') out += BS + 't';
    else if (cp >= 0x20 && cp <= 0x7e) out += ch;
    else if (cp > 0xffff) out += BS + 'u{' + cp.toString(16).toUpperCase() + '}';
    else out += BS + 'u' + cp.toString(16).toUpperCase().padStart(4, '0');
  }
  return out;
}

function show(value, depth = 0) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? 'Invalid Date' : value.toISOString();
  if (typeof value === 'number') return Object.is(value, -0) ? '-0' : String(value);
  if (typeof value === 'bigint') return value + 'n';
  if (typeof value === 'string') {
    if (value.length > 120) return '"' + escapeCodePoints(value.slice(0, 40)) + '..." (' + value.length + ' chars)';
    return '"' + escapeCodePoints(value) + '"';
  }
  if (Array.isArray(value)) {
    if (depth > 3) return '[...]';
    const limit = Math.min(value.length, 6);
    const parts = [];
    for (let i = 0; i < limit; i++) parts.push(i in value ? show(value[i], depth + 1) : '<hole>');
    let text = '[' + parts.join(', ') + (value.length > limit ? ', ...' : '') + ']';
    if (value.length > limit) text += ' (length ' + value.length + ')';
    return text;
  }
  if (value === null || value === undefined || typeof value === 'boolean') return String(value);
  if (typeof value === 'function') return 'function';
  if (typeof value === 'symbol') return value.toString();
  if (value instanceof Error) return value.name + ': ' + value.message;
  try {
    const text = JSON.stringify(value, (k, v) => (typeof v === 'bigint' ? v + 'n' : v));
    if (text === undefined) return String(value);
    return text.length > 120 ? text.slice(0, 117) + '...' : text;
  } catch {
    return Object.prototype.toString.call(value);
  }
}

// What a pasted sample means, written the way it would appear in code.
function interpret(text) {
  const t = text.trim();
  if (!t) return undefined;
  if (/^[+-]?\d+n$/.test(t)) return BigInt(t.slice(0, -1));
  if (/^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/.test(t)) {
    const d = new Date(t);
    if (!Number.isNaN(d.getTime())) return d;
  }
  if (/^new Date\b/.test(t)) return new Date();
  const quoted = /^(['"`])([\s\S]*)\1$/.exec(t);
  if (quoted) return quoted[2];
  if (/^\[[\s\S]*\]$/.test(t)) {
    try {
      const v = JSON.parse(t);
      if (Array.isArray(v)) return v;
    } catch {
      // Not JSON: treat it as text below.
    }
  }
  if (/^[+-]?(?:\d[\d_]*\.?\d*(?:e[+-]?\d+)?|\.\d+|Infinity|NaN)$/i.test(t)) return Number(t.replace(/_/g, ''));
  return text;
}

const KIND = {
  dates: 'a date',
  timeZones: 'an IANA time zone',
  strings: 'text',
  numbers: 'a number',
  numericStrings: 'a number written as text',
  bigints: 'a BigInt',
  urls: 'a URL',
  emails: 'an email address',
  paths: 'a file path',
  json: 'JSON text',
  arrays: 'an array',
};

function cleanOptions(gen, options) {
  const out = {};
  if (options && options.tags && options.tags.length) out.tags = options.tags;
  if (gen === 'dates' && options) {
    if (options.zone) out.zone = options.zone;
    if (options.year) out.year = Number(options.year);
  }
  return out;
}

function generate(gen, options) {
  const fn = edge[gen];
  if (typeof fn !== 'function') throw new Error('Unknown generator ' + gen);
  return fn(cleanOptions(gen, options));
}

// Signs that a function returned something it probably should not have.
function oddity(out) {
  if (typeof out === 'number' && Number.isNaN(out)) return 'returned NaN';
  if (out instanceof Date && Number.isNaN(out.getTime())) return 'returned an Invalid Date';
  if (out === undefined) return 'returned undefined';
  if (typeof out === 'string') {
    if (typeof out.isWellFormed === 'function' && !out.isWellFormed()) return 'returned half an emoji (a lone surrogate)';
    if (/\b(?:NaN|undefined|Invalid Date)\b|\bInfinity\b|\[object Object\]/.test(out)) return 'the text contains ' + /\b(NaN|undefined|Invalid Date|Infinity)\b|\[object Object\]/.exec(out)[0];
  }
  return '';
}

function run(gen, options, src) {
  let fn;
  try {
    fn = new Function('"use strict"; return (' + src + '\n);')();
  } catch (error) {
    throw new Error('Your code does not parse: ' + error.message);
  }
  if (typeof fn !== 'function') throw new Error('Write a function, for example (value) => value.trim()');
  return generate(gen, options).map((c) => {
    try {
      const out = fn(c.value);
      const odd = oddity(out);
      return { label: c.label, status: odd ? 'odd' : 'ok', out: show(out), note: odd };
    } catch (error) {
      const message = error instanceof Error ? error.name + ': ' + error.message : 'threw ' + show(error);
      return { label: c.label, status: 'threw', out: message.length > 160 ? message.slice(0, 157) + '...' : message, note: '' };
    }
  });
}

self.onmessage = (event) => {
  const msg = event.data || {};
  try {
    if (msg.type === 'detect') {
      const sample = interpret(String(msg.text || ''));
      const gen = sample === undefined ? '' : edge.generatorFor(sample) || '';
      self.postMessage({ id: msg.id, ok: true, gen, kind: gen ? KIND[gen] : '' });
    } else if (msg.type === 'cases') {
      const cases = generate(msg.gen, msg.options).map((c) => ({
        label: c.label,
        value: show(c.value),
        why: c.why,
        tags: [...c.tags],
        zone: c.zone || '',
      }));
      self.postMessage({ id: msg.id, ok: true, cases });
    } else if (msg.type === 'run') {
      self.postMessage({ id: msg.id, ok: true, results: run(msg.gen, msg.options, String(msg.src || '')) });
    }
  } catch (error) {
    self.postMessage({ id: msg.id, ok: false, error: error instanceof Error ? error.message : String(error) });
  }
};
