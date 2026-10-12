import type { Case, CaseOptions } from '../types';
import { c, filter } from '../internal/build';

/**
 * File path edge cases for Windows and POSIX: drive letters, UNC and long
 * path prefixes, trailing separators, `..` traversal, reserved device names,
 * unicode normalization and names that only differ in invisible ways.
 *
 * Tags say which platform a case is about: `windows`, `posix` or both.
 */
export function paths(options: CaseOptions = {}): Case<string>[] {
  const cases: Case<string>[] = [
    c('Windows absolute path', 'C:\\Users\\Ana\\file.txt', 'Backslash separators: splitting on "/" returns one segment, and on POSIX this is a relative file name containing backslashes.', ['windows', 'absolute']),
    c('Windows path with forward slashes', 'C:/Users/Ana/file.txt', 'Windows accepts it, path.win32 understands it, path.posix treats it as relative.', ['windows', 'absolute', 'mixed']),
    c('drive relative path', 'C:file.txt', 'Relative to the current directory of drive C, not the root; path.win32.isAbsolute returns false.', ['windows', 'relative']),
    c('root relative on Windows', '\\temp\\file.txt', 'Absolute on the current drive only; the result depends on process.cwd() drive.', ['windows', 'absolute']),
    c('UNC share path', '\\\\server\\share\\folder\\file.txt', 'Starts with two backslashes; the "root" is \\\\server\\share\\, so dirname and parent walking stop there.', ['windows', 'absolute', 'unc']),
    c('long path prefix', '\\\\?\\C:\\very\\long\\path', 'Disables normalization: "/" is not a separator and ".." is literal; needed beyond 260 characters.', ['windows', 'absolute', 'long']),
    c('path longer than 260 characters', `C:\\${'segment\\'.repeat(35)}file.txt`, 'Exceeds the classic MAX_PATH limit; many Windows tools fail without long path support.', ['windows', 'long', 'limit']),
    c('reserved device name', 'CON', 'CON, PRN, AUX, NUL, COM1 and LPT1 cannot be file names on Windows, with any extension.', ['windows', 'reserved']),
    c('reserved name with extension', 'aux.txt', 'Still the AUX device on Windows; repositories with this file cannot be checked out there.', ['windows', 'reserved']),
    c('trailing dot', 'file.', 'Windows strips trailing dots, so "file." and "file" are the same file there but different on POSIX.', ['windows', 'trailing']),
    c('trailing space', 'file ', 'Windows strips trailing spaces as well; invisible in most UIs.', ['windows', 'trailing', 'whitespace']),
    c('case only difference', 'README.md', 'Case insensitive on default Windows and macOS file systems, so readme.md and README.md collide.', ['windows', 'posix', 'case']),
    c('POSIX absolute path', '/usr/local/bin', 'Absolute on POSIX; on Windows path.win32 treats it as root relative on the current drive.', ['posix', 'absolute']),
    c('trailing slash', 'dir/sub/', 'basename("dir/sub/") is "sub", but split("/").pop() is ""; joining adds a double slash.', ['posix', 'trailing']),
    c('repeated slashes', '/a//b///c', 'Equivalent to /a/b/c after normalization; string comparisons and cache keys disagree.', ['posix', 'normalization']),
    c('root only', '/', 'dirname("/") is "/" and basename is ""; loops that walk up until dirname changes must stop here.', ['posix', 'absolute', 'root']),
    c('empty path', '', 'path.join("", "") is "." and path.resolve("") is the cwd; empty is not "no path".', ['posix', 'windows', 'empty']),
    c('current directory', '.', 'A path that refers to the cwd; extname(".") is "" and basename is ".".', ['posix', 'windows', 'relative']),
    c('parent directory traversal', '../../etc/passwd', 'Escapes the base directory after join; validate with path.relative after resolving.', ['posix', 'traversal', 'security']),
    c('traversal hidden inside a path', 'uploads/./a/../../../secret', 'Looks rooted in uploads/ but normalizes outside it.', ['posix', 'traversal', 'security']),
    c('Windows traversal with backslashes', '..\\..\\Windows\\win.ini', 'Checks that only look for "../" miss backslash traversal on Windows.', ['windows', 'traversal', 'security']),
    c('dotfile', '.env', 'extname(".env") is "", not ".env"; hidden on POSIX and easy to leak in static servers.', ['posix', 'extension', 'hidden']),
    c('double extension', 'archive.tar.gz', 'extname gives ".gz"; type detection and "strip the extension" give "archive.tar".', ['posix', 'windows', 'extension']),
    c('spaces in names', 'My Documents/file name.txt', 'Breaks unquoted shell commands and URL building without encoding.', ['posix', 'windows', 'whitespace']),
    c('backslash in a POSIX file name', 'a\\b.txt', 'A legal single file name on Linux that becomes two segments on Windows.', ['posix', 'mixed']),
    c('NFC unicode name', 'caf\u00E9.txt', 'Precomposed form, as typed on Windows and Linux.', ['posix', 'windows', 'unicode', 'normalization']),
    c('NFD unicode name', 'cafe\u0301.txt', 'Decomposed form produced by older macOS file systems; looks the same as the NFC name but does not match it.', ['posix', 'unicode', 'normalization']),
    c('emoji in file name', 'notes \u{1F4DD}.md', 'Surrogate pairs in a path: byte limits, truncation and some archive tools mishandle them.', ['posix', 'windows', 'unicode', 'emoji']),
    c('leading dash', '-rf', 'Interpreted as an option by command line tools unless passed after "--".', ['posix', 'security']),
    c('newline in file name', 'a\nb.txt', 'Legal on Linux; breaks line based tools such as `find | xargs` and log parsing.', ['posix', 'control']),
  ];
  return filter(cases, options);
}
