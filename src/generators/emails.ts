import type { Case, CaseOptions } from '../types';
import { c, filter } from '../internal/build';

/**
 * Email address edge cases, tagged `valid` or `invalid` by the addr-spec
 * grammar of RFC 5321 and RFC 5322 (plus RFC 6531 for internationalized
 * addresses, tagged `smtputf8`). Syntax only: deliverability is a different
 * question.
 */
export function emails(options: CaseOptions = {}): Case<string>[] {
  const cases: Case<string>[] = [
    c('plus addressing', 'user+tag@example.com', 'Gmail and others deliver it to "user"; validators that reject "+" lose real users.', ['valid', 'local-part']),
    c('dots in local part', 'first.last@example.com', 'Valid and common; some providers ignore the dots, so deduplication by string misses duplicates.', ['valid', 'local-part']),
    c('apostrophe in local part', "o'brien@example.com", 'Valid; breaks SQL built by concatenation and regexes limited to [a-z0-9._].', ['valid', 'local-part']),
    c('quoted local part with space', '"john doe"@example.com', 'A quoted string may contain spaces; nearly every regex rejects it and naive splitting on spaces breaks.', ['valid', 'quoted']),
    c('quoted local part with @', '"a@b"@example.com', 'Splitting on the first "@" yields the wrong domain; use the last "@".', ['valid', 'quoted']),
    c('IP address literal domain', 'user@[192.168.0.1]', 'Domain literal in brackets; DNS based checks and domain allow lists do not expect it.', ['valid', 'domain']),
    c('dotless domain', 'user@localhost', 'Valid syntax used on intranets and in tests, rejected by "needs a TLD" rules.', ['valid', 'domain']),
    c('uppercase address', 'USER@EXAMPLE.COM', 'Domains are case insensitive, local parts technically are not; lowercasing everything can merge different mailboxes, not lowercasing creates duplicates.', ['valid', 'case']),
    c('subdomains and long TLD', 'user@mail.sub.example.co.uk', 'Multi label domains and two part public suffixes; "last two labels" logic picks co.uk.', ['valid', 'domain']),
    c('new generic TLD', 'user@example.photography', 'TLDs longer than 4 letters exist; {2,4} quantifiers reject them.', ['valid', 'domain']),
    c('shortest realistic address', 'a@b.co', 'Single character local part and short domain; minimum length rules are often too strict.', ['valid', 'short']),
    c('64 character local part (maximum)', `${'a'.repeat(64)}@example.com`, 'The longest local part RFC 5321 allows; storage columns sized at 50 truncate it.', ['valid', 'long', 'limit']),
    c('internationalized local part', 'jos\u00E9@example.com', 'Valid with SMTPUTF8 (RFC 6531) but rejected by ASCII only servers; decide explicitly what you accept.', ['valid', 'smtputf8', 'unicode']),
    c('internationalized domain', 'user@\u4F8B\u3048.jp', 'The domain must be converted to punycode for DNS and SMTP; comparing raw strings fails.', ['valid', 'smtputf8', 'unicode', 'idn']),
    c('65 character local part (too long)', `${'a'.repeat(65)}@example.com`, 'One over the RFC 5321 limit; lenient validators accept it and the SMTP server rejects it later.', ['invalid', 'long', 'limit']),
    c('missing @', 'plainaddress', 'No separator at all; code that splits on "@" gets one part and reads undefined.', ['invalid']),
    c('missing local part', '@example.com', 'Empty local part; split("@")[0] is "".', ['invalid', 'empty']),
    c('missing domain', 'user@', 'Empty domain; split("@")[1] is "".', ['invalid', 'empty']),
    c('two @ signs', 'user@@example.com', 'Unquoted second "@" is invalid; splitting gives three parts.', ['invalid']),
    c('leading dot', '.user@example.com', 'A dot may not start the local part.', ['invalid', 'local-part']),
    c('trailing dot in local part', 'user.@example.com', 'A dot may not end the local part (some providers accept it anyway).', ['invalid', 'local-part']),
    c('consecutive dots', 'us..er@example.com', 'Consecutive dots are not allowed unquoted.', ['invalid', 'local-part']),
    c('consecutive dots in domain', 'user@example..com', 'Empty domain label; DNS lookups fail.', ['invalid', 'domain']),
    c('domain label starting with hyphen', 'user@-example.com', 'Host labels may not start with a hyphen.', ['invalid', 'domain']),
    c('unquoted space', 'john doe@example.com', 'Spaces need quoting; forms that do not trim also produce trailing spaces.', ['invalid', 'whitespace']),
    c('display name format', 'John Doe <john@example.com>', 'A valid mailbox header, not a bare address; pasted from mail clients into address fields.', ['invalid', 'header']),
  ];
  return filter(cases, options);
}
