import type { Case, CaseOptions } from '../types';
import { c, filter } from '../internal/build';

const PDFJS_BUG = 'https://github.com/mozilla/pdf.js/pull/22017';
const TOUGH_COOKIE_BUG = 'https://github.com/salesforce/tough-cookie/pull/644';

/**
 * Number edge cases: signed zero, NaN, infinities, the limits of safe
 * integers and doubles, values between -1 and 0, floating point rounding
 * and the points where toString switches to exponent notation.
 *
 * @example
 * test.each(numbers())('$label', ({ value }) => {
 *   expect(parse(format(value))).toBe(value);
 * });
 */
export function numbers(options: CaseOptions = {}): Case<number>[] {
  const cases: Case<number>[] = [
    c('zero', 0, 'Falsy: `if (!count)` and `value || defaultValue` replace a legitimate 0.', ['zero', 'falsy']),
    c('negative zero', -0, '-0 === 0 is true, but Object.is(-0, 0) is false, 1 / -0 is -Infinity and String(-0) is "0", so the sign silently disappears.', ['zero', 'negative', 'sign']),
    c('NaN', Number.NaN, 'NaN !== NaN, indexOf cannot find it, JSON.stringify writes null and every comparison is false, so sorting with it is unstable.', ['nan', 'falsy']),
    c('Infinity', Number.POSITIVE_INFINITY, 'JSON.stringify writes null, toFixed returns "Infinity" and a max-age or timeout of Infinity can mean "never" or overflow a timer.', ['infinity'], TOUGH_COOKIE_BUG),
    c('-Infinity', Number.NEGATIVE_INFINITY, 'Math.max() of an empty list; a common reducer seed that leaks into output as "-Infinity".', ['infinity', 'negative']),
    c('MAX_SAFE_INTEGER', Number.MAX_SAFE_INTEGER, '2^53 - 1, the largest integer where n + 1 is exact; IDs and counters past it stop being unique.', ['integer', 'limit']),
    c('MAX_SAFE_INTEGER + 1', Number.MAX_SAFE_INTEGER + 1, '2^53: here n + 1 === n, so loops never advance and 64 bit IDs from JSON collide.', ['integer', 'limit', 'precision']),
    c('MAX_SAFE_INTEGER + 2', Number.MAX_SAFE_INTEGER + 2, 'Is not representable: the literal 9007199254740993 rounds to 9007199254740992 before your code ever sees it.', ['integer', 'limit', 'precision']),
    c('MIN_SAFE_INTEGER', Number.MIN_SAFE_INTEGER, '-(2^53 - 1), the negative safe integer limit; mirrors the positive overflow bugs.', ['integer', 'limit', 'negative']),
    c('MIN_SAFE_INTEGER - 1', Number.MIN_SAFE_INTEGER - 1, 'First unsafe negative integer: Number.isSafeInteger is false and decrementing it is not exact.', ['integer', 'limit', 'negative', 'precision']),
    c('MAX_VALUE', Number.MAX_VALUE, 'Largest finite double; doubling it or adding a large value gives Infinity.', ['limit', 'overflow']),
    c('MIN_VALUE', Number.MIN_VALUE, 'Smallest positive double (5e-324), not the most negative number; code that uses it as "minus infinity" is wrong.', ['limit', 'subnormal']),
    c('EPSILON', Number.EPSILON, 'Gap between 1 and the next double; only meaningful as a tolerance near 1, not for large or tiny values.', ['limit', 'precision']),
    c('2^32', 2 ** 32, 'Breaks `x | 0` and `x >>> 0` truncation, array index limits and 32 bit counters.', ['integer', 'overflow']),
    c('2^31', 2 ** 31, 'Overflows signed 32 bit math: `(2 ** 31) | 0` is -2147483648.', ['integer', 'overflow']),
    c('-0.5', -0.5, 'Between -1 and 0: Math.trunc gives -0, Math.round gives -0, and code that formats the integer part then the fraction drops the minus sign.', ['negative', 'sign', 'fraction'], PDFJS_BUG),
    c('-0.0001', -0.0001, 'A small negative between -1 and 0: formatting with toFixed(2) gives "-0.00", and splitting into integer and fraction parts loses the sign.', ['negative', 'sign', 'fraction'], PDFJS_BUG),
    c('-1e-7', -1e-7, 'Very small negative: String() gives "-1e-7", so string based number formatting and regexes for digits fail.', ['negative', 'exponent', 'fraction']),
    c('1e-7', 1e-7, 'Smallest magnitude where String() switches to exponent notation ("1e-7"), while 0.000001 still prints in full.', ['exponent', 'fraction']),
    c('0.1 + 0.2', 0.1 + 0.2, '0.30000000000000004, not 0.3: exact equality on money and percentages fails; compare with a tolerance or use integers.', ['float', 'precision']),
    c('1.005', 1.005, 'Stored as 1.00499999999999989..., so (1.005).toFixed(2) is "1.00" and Math.round(1.005 * 100) / 100 is 1.', ['float', 'rounding']),
    c('0.5 (round half)', 0.5, 'Math.round(0.5) is 1 but Math.round(-0.5) is -0 and toFixed uses a different rule: half rounding is not symmetric.', ['float', 'rounding']),
    c('1e21', 1e21, 'First integer where String() uses exponent notation ("1e+21"); toFixed also falls back to exponent form, breaking digit only checks.', ['exponent', 'integer']),
    c('999999999999999900000', 999999999999999900000, 'Largest round number below 1e21 that still prints all its digits; one step up the format changes.', ['exponent', 'integer']),
    c('negative integer', -42, 'Modulo keeps the sign (-42 % 5 is -2), so "positive modulo" wraparound for indexes and calendars is wrong.', ['negative', 'integer']),
    c('non-integer array index', 1.5, 'arr[1.5] is undefined and creates a string property on write; Number.isInteger guards are often missing.', ['fraction']),
  ];
  return filter(cases, options);
}

/**
 * Strings that look numeric (or almost numeric). Separate from `numbers()`
 * so each generator returns a single value type.
 */
export function numericStrings(options: CaseOptions = {}): Case<string>[] {
  const cases: Case<string>[] = [
    c('empty string', '', 'Number("") is 0, not NaN, so empty form fields become zero.', ['empty', 'coercion']),
    c('whitespace only', '  \n\t ', 'Number("  ") is 0 as well; parseFloat returns NaN, so the two parsers disagree.', ['whitespace', 'coercion']),
    c('padded number', '  42  ', 'Number trims whitespace and accepts it; strict validators and parseInt with a regex may not.', ['whitespace']),
    c('negative zero string', '-0', 'Number("-0") is -0, which then prints as "0"; round trips lose the sign.', ['sign', 'zero']),
    c('leading zeros', '007', 'Decimal 7 for Number and parseInt, but octal in some legacy parsers and a string ID that must keep its zeros.', ['leading-zero']),
    c('hex string', '0x1A', 'Number("0x1A") is 26 and parseInt("0x1A") is 26, but parseFloat("0x1A") is 0.', ['radix', 'coercion']),
    c('binary and octal prefixes', '0b101', 'Number("0b101") is 5 while parseInt("0b101") is 0; prefixes are accepted by one parser only.', ['radix', 'coercion']),
    c('exponent notation', '1e3', 'Number gives 1000 but parseInt gives 1, so "digits only" assumptions break.', ['exponent', 'coercion']),
    c('trailing garbage', '12px', 'parseInt and parseFloat return 12, Number returns NaN; lenient parsing hides bad input.', ['coercion']),
    c('comma decimal separator', '1,5', 'Decimal comma used in most of Europe and Brazil: parseFloat gives 1 and Number gives NaN.', ['locale']),
    c('thousands separators', '1,234,567.89', 'Grouped digits from formatted output; parseFloat stops at the first comma and returns 1.', ['locale']),
    c('numeric separator literal', '1_000', 'Valid in JavaScript source but Number("1_000") is NaN.', ['coercion']),
    c('Infinity string', 'Infinity', 'Number("Infinity") is Infinity, so numeric validation accepts a word; JSON cannot represent it.', ['infinity', 'coercion']),
    c('NaN string', 'NaN', 'Number("NaN") is NaN, which passes typeof === "number" checks after conversion.', ['nan', 'coercion']),
    c('unsafe integer string', '9007199254740993', 'Parses to 9007199254740992: IDs from JSON or databases silently change; parse as BigInt or keep as string.', ['precision', 'integer']),
    c('plus sign', '+5', 'Accepted by Number but rejected by many /^\\d+$/ validators, and vice versa for UI masks.', ['sign']),
    c('Arabic-Indic digits', '\u0664\u0662', 'Real digits for many users, but Number returns NaN; normalize with Intl or a digit map first.', ['unicode', 'digits']),
  ];
  return filter(cases, options);
}
