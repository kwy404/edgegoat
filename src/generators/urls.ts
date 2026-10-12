import type { Case, CaseOptions } from '../types';
import { c, filter } from '../internal/build';

/**
 * URL edge cases. Each case is tagged `valid` or `invalid` according to the
 * WHATWG URL parser (`new URL(value)` without a base), which is what browsers
 * and Node use.
 */
export function urls(options: CaseOptions = {}): Case<string>[] {
  const cases: Case<string>[] = [
    c('localhost with port', 'http://localhost:3000/', 'No dot in the host: "must contain a TLD" validators reject development URLs.', ['valid', 'host']),
    c('credentials in URL', 'https://user:p%40ss@example.com/', 'Userinfo with an encoded @; naive parsers split on the first @ and leak or mangle the password.', ['valid', 'userinfo', 'security']),
    c('IPv6 host with port', 'http://[::1]:8080/', 'hostname is "[::1]" with brackets; splitting host and port on ":" breaks.', ['valid', 'ip', 'host']),
    c('shorthand IPv4 (127.1)', 'http://127.1/', 'The parser normalizes it to 127.0.0.1, so SSRF block lists that compare strings miss it.', ['valid', 'ip', 'security']),
    c('hex IPv4 (0x7f.0.0.1)', 'http://0x7f.0.0.1/', 'Also loopback after normalization; another SSRF filter bypass.', ['valid', 'ip', 'security']),
    c('internationalized domain', 'https://\u4F8B\u3048.jp/', 'hostname becomes punycode ("xn--r8jz45g.jp"), so comparing the input string with url.hostname fails.', ['valid', 'idn', 'unicode', 'host']),
    c('trailing dot in host', 'https://example.com./', 'A fully qualified name that is a different origin from example.com for cookies, CORS and allow lists.', ['valid', 'host']),
    c('uppercase scheme and host', 'HTTPS://EXAMPLE.COM/Path', 'Scheme and host are lowercased but the path keeps its case; string compares of URLs disagree with the parser.', ['valid', 'case']),
    c('explicit default port', 'https://example.com:443/', 'url.port is "" because the default port is dropped; code expecting "443" breaks.', ['valid', 'port']),
    c('port out of range', 'http://example.com:65536/', 'Ports above 65535 make the URL invalid; regex validators accept any digits.', ['invalid', 'port']),
    c('encoded slash in path', 'https://example.com/a%2Fb', 'Servers and routers disagree on whether %2F is a path separator; decode once at the right layer.', ['valid', 'encoding', 'path']),
    c('plus and space in query', 'https://example.com/?q=a+b&q=%20c', 'URLSearchParams decodes "+" as a space but decodeURIComponent does not; the key also repeats.', ['valid', 'encoding', 'query']),
    c('double encoded space', 'https://example.com/file%2520name', 'Decoding twice turns %2520 into a space; decoding once gives "%20" literally.', ['valid', 'encoding']),
    c('empty fragment', 'https://example.com/#', 'url.hash is "" even though href ends with "#", so hash based checks see no fragment.', ['valid', 'fragment']),
    c('dot segments in path', 'http://example.com/public/../secret', 'Normalized to /secret by the parser; checks done on the raw string allow traversal.', ['valid', 'path', 'security']),
    c('non ASCII path and query', 'https://example.com/\u{1F600}?q=caf\u00E9', 'The parser percent encodes both as UTF-8, so href no longer equals the input.', ['valid', 'unicode', 'encoding']),
    c('very long URL (8000 char path)', `https://example.com/${'a'.repeat(8000)}`, 'Exceeds common 2048 character limits and 8 KB request line limits in proxies and servers.', ['valid', 'long']),
    c('javascript: scheme', 'javascript:alert(1)', 'A valid URL that runs code when used as an href; allow list schemes instead of block listing.', ['valid', 'scheme', 'security']),
    c('javascript: with a newline inside', 'java\nscript:alert(1)', 'The parser removes tabs and newlines, so this is javascript:alert(1); block lists that match the raw string miss it.', ['valid', 'scheme', 'security']),
    c('data: URL with HTML', 'data:text/html,<script>alert(1)</script>', 'Valid and executable in some contexts; never forward user supplied data URLs to href or src.', ['valid', 'scheme', 'security']),
    c('file URL with Windows drive', 'file:///C:/Windows/win.ini', 'host is empty and pathname is "/C:/Windows/win.ini" with a leading slash before the drive letter.', ['valid', 'scheme', 'windows']),
    c('mailto URL', 'mailto:user@example.com', 'No host at all: url.host is "" and url.origin is "null".', ['valid', 'scheme']),
    c('surrounding spaces', '  https://example.com/  ', 'The parser strips leading and trailing spaces, so it is valid, but the stored string is not.', ['valid', 'whitespace']),
    c('protocol relative', '//example.com/path', 'Invalid without a base, but resolves to another host with one: "starts with /" open redirect checks pass it.', ['invalid', 'relative', 'security']),
    c('backslash relative', '/\\example.com', 'Browsers treat "\\" as "/" in http URLs, so this resolves to //example.com: a classic open redirect.', ['invalid', 'relative', 'security']),
    c('bare domain without scheme', 'example.com', 'What users type, but not a URL: new URL throws and links become relative paths.', ['invalid', 'relative']),
    c('space in host', 'http://exa mple.com/', 'Forbidden host code point; new URL throws.', ['invalid', 'host']),
    c('empty string', '', 'new URL("") throws; optional URL fields must be checked before parsing.', ['invalid', 'empty']),
  ];
  return filter(cases, options);
}
