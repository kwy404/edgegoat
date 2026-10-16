/* Seasonal decorations, loaded by seasons.js only while a season is active:
   the "<Season> mode" chip with its off switch, Ledge in costume, the hero
   accent and one light particle canvas. Decorations are aria-hidden; the
   particles are skipped with prefers-reduced-motion and pause while the tab
   is hidden. Written by hand. */
(function () {
  var S = window.edgeSeasons;
  var id = S && S.active;
  if (!id) return;
  var d = document;
  var root = d.documentElement;
  var me = d.currentScript && d.currentScript.src;
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init);
  else init();
  function init() {
  var base = (me ? me.replace(/season-fx\.js(\?.*)?$/, '') : './') + 'assets/seasons/' + id + '/';
  var br = /^pt-br$/i.test(S.lang || '');
  var NAMES = {
    newyear: 'New Year',
    carnival: 'Carnival',
    easter: 'Easter',
    valentine: br && new Date().getMonth() === 5 ? 'Dia dos Namorados' : "Valentine's",
    junina: br ? 'Festa Junina' : 'Midsummer',
    halloween: 'Halloween',
    christmas: 'Christmas',
  };
  var name = NAMES[id];
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var darkMq = window.matchMedia('(prefers-color-scheme: dark)');
  var cleanups = [];

  function isDark() {
    var t = root.getAttribute('data-theme');
    return t === 'dark' || (t !== 'light' && darkMq.matches);
  }
  function pair(file, cls) {
    return '<img class="on-light' + (cls ? ' ' + cls : '') + '" src="' + base + file + '.svg" alt="">' +
      '<img class="on-dark' + (cls ? ' ' + cls : '') + '" src="' + base + file + '-dark.svg" alt="">';
  }

  // Ledge in costume: every mascot image follows the theme.
  var goats = [].slice.call(d.querySelectorAll('img.mascot'));
  goats.forEach(function (img) { img.setAttribute('data-plain-src', img.getAttribute('src')); });
  function dressGoats() {
    var file = base + (isDark() ? 'mascot-dark.svg' : 'mascot.svg');
    goats.forEach(function (img) { img.src = file; });
  }
  dressGoats();
  var mo = new MutationObserver(dressGoats);
  mo.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  darkMq.addEventListener('change', dressGoats);
  cleanups.push(function () {
    mo.disconnect();
    darkMq.removeEventListener('change', dressGoats);
    goats.forEach(function (img) { img.src = img.getAttribute('data-plain-src'); });
  });

  // The hero accent on the home page.
  var hero = d.querySelector('.hero');
  if (hero) {
    var art = d.createElement('div');
    art.className = 'season-hero season-art';
    art.setAttribute('aria-hidden', 'true');
    art.innerHTML = pair('hero');
    hero.insertBefore(art, hero.firstChild);
    cleanups.push(function () { art.remove(); });
  }

  // The chip, with the off switch. The choice is kept per season.
  var chip = d.createElement('div');
  chip.className = 'season-chip season-art';
  chip.setAttribute('role', 'region');
  chip.setAttribute('aria-label', name + ' theme');
  chip.innerHTML = '<span aria-hidden="true">' + pair('icon-1') + '</span><span>' + name + ' mode</span>' +
    '<button type="button" aria-label="Turn off ' + name + ' mode">Turn off</button>';
  chip.querySelector('button').addEventListener('click', function () {
    try { localStorage.setItem('edgegoat:season-off:' + id, '1'); } catch (e) { /* storage blocked */ }
    root.removeAttribute('data-season');
    chip.remove();
    cleanups.forEach(function (fn) { fn(); });
  });
  d.body.appendChild(chip);

  // Particles: one canvas, a few dozen shapes, nothing with reduced motion.
  var PALETTE = {
    halloween: ['#d97a2b', '#b8562a', '#e2a23b', '#8a5a2b'],
    christmas: ['#ffffff', '#dfe9f3', '#c9d8e6'],
    newyear: ['#f2c94c', '#ffe9a8', '#ffffff', '#e8b04b'],
    carnival: ['#e0457b', '#2bb3a3', '#f2a93b', '#7b61ff', '#4aa3df'],
    easter: ['#f4b6c2', '#c7b6f4', '#f7dc8f', '#b6e3c6'],
    valentine: ['#e0607e', '#f29bb0', '#c2405f'],
    junina: ['#f2a93b', '#ffcf5a', '#e86a2b'],
  };
  var KIND = { halloween: 'leaf', christmas: 'snow', newyear: 'spark', carnival: 'confetti', easter: 'petal', valentine: 'heart', junina: 'ember' };
  function startParticles() {
    if (reduce.matches) return;
    var canvas = d.createElement('canvas');
    canvas.className = 'season-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    d.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var kind = KIND[id];
    var colors = PALETTE[id];
    var rising = kind === 'spark' || kind === 'ember';
    var W = 0, H = 0, dpr = 1, raf = 0, last = 0, items = [], bats = [];
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function spawn(initial) {
      var size = kind === 'snow' ? 1.5 + Math.random() * 2.5 : kind === 'spark' || kind === 'ember' ? 1 + Math.random() * 1.8 : 4 + Math.random() * 5;
      return {
        x: Math.random() * W,
        y: initial ? Math.random() * H : rising ? H + 10 : -12,
        s: size,
        vy: (rising ? -1 : 1) * (kind === 'snow' ? 18 + Math.random() * 22 : 22 + Math.random() * 30),
        vx: -8 + Math.random() * 16,
        r: Math.random() * 6.28,
        vr: -1.5 + Math.random() * 3,
        sway: Math.random() * 6.28,
        c: colors[Math.floor(Math.random() * colors.length)],
        a: 0.45 + Math.random() * 0.35,
      };
    }
    function heart(s) {
      ctx.beginPath();
      ctx.moveTo(0, s * 0.35);
      ctx.bezierCurveTo(-s, -s * 0.35, -s * 0.45, -s, 0, -s * 0.45);
      ctx.bezierCurveTo(s * 0.45, -s, s, -s * 0.35, 0, s * 0.35);
      ctx.fill();
    }
    function draw(p) {
      ctx.save();
      ctx.globalAlpha = p.a;
      ctx.fillStyle = p.c;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      if (kind === 'snow' || kind === 'spark' || kind === 'ember') {
        ctx.beginPath();
        ctx.arc(0, 0, p.s, 0, 6.283);
        ctx.fill();
      } else if (kind === 'confetti') {
        ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      } else if (kind === 'heart') {
        heart(p.s);
      } else {
        ctx.beginPath();
        ctx.ellipse(0, 0, p.s, p.s * 0.45, 0, 0, 6.283);
        ctx.fill();
      }
      ctx.restore();
    }
    function drawBat(b) {
      var flap = Math.sin(b.t * 9) * 0.6;
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = isDark() ? '#5b6672' : '#2b2f36';
      ctx.translate(b.x, b.y);
      ctx.scale(b.dir, 1);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-7, -8 * flap - 2, -15, -2 * flap);
      ctx.quadraticCurveTo(-9, 1, -5, 3);
      ctx.quadraticCurveTo(0, 6, 5, 3);
      ctx.quadraticCurveTo(9, 1, 15, -2 * flap);
      ctx.quadraticCurveTo(7, -8 * flap - 2, 0, 0);
      ctx.fill();
      ctx.restore();
    }
    function frame(now) {
      raf = requestAnimationFrame(frame);
      var dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < items.length; i++) {
        var p = items[i];
        p.sway += dt;
        p.x += (p.vx + Math.sin(p.sway * 1.3) * 12) * dt;
        p.y += p.vy * dt;
        p.r += p.vr * dt;
        if (rising) p.a = Math.max(0, p.a - dt * 0.05);
        if (p.y > H + 16 || p.y < -16 || p.a <= 0.02 || p.x < -20 || p.x > W + 20) items[i] = spawn(false);
        draw(items[i]);
      }
      for (var j = 0; j < bats.length; j++) {
        var b = bats[j];
        b.t += dt;
        b.x += b.dir * 60 * dt;
        b.y += Math.sin(b.t * 2) * 12 * dt;
        if (b.x < -40 || b.x > W + 40) { b.dir = -b.dir; b.y = 60 + Math.random() * H * 0.4; }
        drawBat(b);
      }
    }
    function play() {
      if (!raf && !d.hidden) { last = 0; raf = requestAnimationFrame(frame); }
    }
    function pause() {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    function onVisibility() { if (d.hidden) pause(); else play(); }
    resize();
    var count = W < 640 ? 16 : 34;
    for (var i = 0; i < count; i++) items.push(spawn(true));
    if (id === 'halloween') for (var k = 0; k < (W < 640 ? 1 : 3); k++) bats.push({ x: Math.random() * W, y: 60 + Math.random() * H * 0.35, dir: k % 2 ? 1 : -1, t: Math.random() * 3 });
    window.addEventListener('resize', resize);
    d.addEventListener('visibilitychange', onVisibility);
    play();
    function stop() {
      pause();
      window.removeEventListener('resize', resize);
      d.removeEventListener('visibilitychange', onVisibility);
      canvas.remove();
    }
    function onMotion() { if (reduce.matches) stop(); }
    reduce.addEventListener('change', onMotion);
    cleanups.push(function () { stop(); reduce.removeEventListener('change', onMotion); });
  }
  startParticles();
  }
})();
