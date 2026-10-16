/* Seasonal themes. Sets data-season on <html> during a few dates a year
   (local date), then loads season-fx.js for the chip, art and particles.
   ?season=<id> forces one, ?season=off disables. Written by hand. */
(function (w, d) {
  var IDS = ['newyear', 'carnival', 'easter', 'valentine', 'junina', 'halloween', 'christmas'];
  function easter(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, e = Math.floor(b / 4), f = b % 4;
    var g = Math.floor((b + 8) / 25), h = (19 * a + b - e - Math.floor((b - g + 1) / 3) + 15) % 30;
    var i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * f + 2 * i - h - k) % 7;
    var m = Math.floor((a + 11 * h + 22 * l) / 451), n = h + l - 7 * m + 114;
    return new Date(y, Math.floor(n / 31) - 1, (n % 31) + 1);
  }
  function day(dt) { return Math.round(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()) / 864e5); }
  function season(date, lang) {
    var m = date.getMonth() + 1, dd = date.getDate(), md = m * 100 + dd, t = day(date);
    var br = /^pt-br$/i.test(lang || '');
    var es = day(easter(date.getFullYear()));
    if (md >= 1230 || md <= 102) return 'newyear';
    if (md >= 1218 && md <= 1226) return 'christmas';
    if (md >= 1024 && md <= 1031) return 'halloween';
    if (t >= es - 2 && t <= es) return 'easter';
    if (t >= es - 50 && t <= es - 46) return 'carnival';
    if (md === 214 || (br && md === 612)) return 'valentine';
    if (md >= 613 && md <= 629) return 'junina';
    return '';
  }
  var api = { IDS: IDS, easter: easter, season: season };
  w.edgeSeasons = api;
  if (!d) return;
  var id = '';
  var forced = false;
  try {
    var q = new URLSearchParams(w.location.search).get('season');
    if (q === 'off') return;
    if (q && IDS.indexOf(q) !== -1) { id = q; forced = true; }
  } catch (e) { /* old browser: no override */ }
  if (!id) id = season(new Date(), (w.navigator && w.navigator.language) || '');
  if (!id) return;
  try { if (!forced && w.localStorage.getItem('edgegoat:season-off:' + id) === '1') return; } catch (e) { /* storage blocked */ }
  api.active = id;
  api.lang = (w.navigator && w.navigator.language) || '';
  d.documentElement.setAttribute('data-season', id);
  var s = d.createElement('script');
  s.src = (d.currentScript && d.currentScript.src ? d.currentScript.src.replace(/seasons\.js(\?.*)?$/, '') : '') + 'season-fx.js';
  s.defer = true;
  d.head.appendChild(s);
})(typeof window !== 'undefined' ? window : globalThis, typeof document !== 'undefined' ? document : null);
