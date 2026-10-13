// edgegoat docs site. Written by hand (not generated).
//
// 1. The specimen lab on index.html, a Voodoo.js component. The grid rows are
//    static HTML (indexable and readable without JavaScript); the component
//    filters them, keeps the filter in the URL, fills the inspector and writes
//    copy ready tests. Case data comes from catalog.json through
//    v-resource="cat:./catalog.json".
// 2. Small page wiring on every page: the search button opens the Monsoon
//    command palette, palette entries filter the lab in place, "/" focuses
//    the lab search.
/* global V */
(function () {
  var TAGS_SHOWN = 14;
  var POINTS_SHOWN = 48;
  var BS = String.fromCharCode(92);
  var NAMES = { 0: 'NUL', 9: 'TAB', 10: 'LF', 13: 'CR', 32: 'SP', 160: 'NBSP', 173: 'SHY', 0x200B: 'ZWSP', 0x200C: 'ZWNJ', 0x200D: 'ZWJ', 0x200E: 'LRM', 0x200F: 'RLM', 0x202A: 'LRE', 0x202B: 'RLE', 0x202C: 'PDF', 0x202D: 'LRO', 0x202E: 'RLO', 0x2028: 'LS', 0x2029: 'PS', 0x2066: 'LRI', 0x2067: 'RLI', 0x2068: 'FSI', 0x2069: 'PDI', 0xFE0F: 'VS16', 0xFEFF: 'BOM' };

  // ASCII only JavaScript string literal: emoji and invisible characters
  // become escapes, never raw glyphs.
  function lit(s) {
    return JSON.stringify(s).replace(/[\u007f-￿]/g, function (ch) {
      return BS + 'u' + ch.charCodeAt(0).toString(16).padStart(4, '0');
    });
  }

  function quoteTags(tags) {
    return '[' + tags.map(function (t) { return "'" + t + "'"; }).join(', ') + ']';
  }

  function testBody(source) {
    return [
      "import { test, expect } from 'vitest';",
      source.imports,
      '',
      source.setup,
      '',
      "test.each(cases)('$label', ({ value }) => {",
      '  // Replace with the function under test.',
      '  expect(() => myFunction(value)).not.toThrow();',
      '});',
    ].join('\n');
  }

  // A tiny highlighter for the live snippets, in the same light-plus and
  // dark-plus colors Shiki uses for the static code on the site.
  var COLORS = {
    kw: ['#AF00DB', '#C586C0'],
    st: ['#0000FF', '#569CD6'],
    str: ['#A31515', '#CE9178'],
    com: ['#008000', '#6A9955'],
    num: ['#098658', '#B5CEA8'],
    fn: ['#795E26', '#DCDCAA'],
    v: ['#001080', '#9CDCFE'],
    p: ['#000000', '#D4D4D4'],
  };
  var TOKENS = /(\/\/[^\n]*)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*")|\b(import|from|export|return)\b|\b(const|let|new|true|false|null)\b|\b(\d[\d_]*(?:\.\d+)?)\b|([A-Za-z_$][\w$]*)(?=\s*\()|([A-Za-z_$][\w$]*)|(\s+)|([^\s])/g;
  function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function span(kind, text) {
    var c = COLORS[kind];
    return '<span style="--shiki-light:' + c[0] + ';--shiki-dark:' + c[1] + '">' + escHtml(text) + '</span>';
  }
  function hl(code) {
    if (!code) return '';
    return code.split('\n').map(function (line) {
      var out = '';
      line.replace(TOKENS, function (m, com, str, kw, st, num, fn, v, ws) {
        if (com) out += span('com', m);
        else if (str) out += span('str', m);
        else if (kw) out += span('kw', m);
        else if (st) out += span('st', m);
        else if (num) out += span('num', m);
        else if (fn) out += span('fn', m);
        else if (v) out += span('v', m);
        else if (ws) out += m;
        else out += span('p', m);
        return m;
      });
      return '<span class="line">' + out + '</span>';
    }).join('\n');
  }

  // Turns the catalog's escaped display form back into the real string.
  function unescape(body) {
    return body.replace(/\\(u\{([0-9A-Fa-f]+)\}|u([0-9A-Fa-f]{4})|n|r|t|"|\\)/g, function (m, all, big, small) {
      if (big) return String.fromCodePoint(parseInt(big, 16));
      if (small) return String.fromCharCode(parseInt(small, 16));
      return { n: '\n', r: '\r', t: '\t', '"': '"' }[all] || BS;
    });
  }
  // The quoted part of a string value, or null when it is not a full string.
  function quoted(value) {
    var m = /^"([\s\S]*)"$/.exec(value);
    return m ? m[1] : null;
  }
  var segmenter = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('en', { granularity: 'grapheme' }) : null;
  var plural = function (n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); };

  function fromUrl(key) {
    return String(V.url.get(key, '') || '');
  }

  // Keeps a row in view inside the grid, and optionally focuses its button.
  function scrollRow(i, focus) {
    var row = document.querySelectorAll('#cases > tr')[i];
    if (!row) return;
    var box = row.closest('.lab-scroll');
    if (box) {
      var top = row.offsetTop - (box.querySelector('thead') || row).offsetHeight;
      if (top < box.scrollTop) box.scrollTop = top;
      else if (row.offsetTop + row.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = row.offsetTop + row.offsetHeight - box.clientHeight;
    }
    var b = row.querySelector('.row-btn');
    if (focus && b) b.focus({ preventScroll: true });
  }

  V.component('edge-lab', {
    state: function () {
      return {
        cat: null,
        q: fromUrl('q'),
        gen: fromUrl('gen'),
        tags: fromUrl('tags').split(',').filter(Boolean),
        want: fromUrl('case'),
        pick: -1,
        sheet: false,
        allTags: false,
      };
    },

    computed: {
      cases: function () {
        return this.cat && this.cat.data ? this.cat.data.cases : [];
      },
      generators: function () {
        return this.cat && this.cat.data ? this.cat.data.generators.map(function (g) { return g.name.slice(0, -2); }) : [];
      },
      haystacks: function () {
        return this.cases.map(function (c) {
          return [c.generator, c.label, c.why, c.tags.join(' '), c.value, c.zone || ''].join(' ').toLowerCase();
        });
      },
      // Indexes of the cases that match the search box and the tag filter.
      textAndTags: function () {
        var words = this.q.toLowerCase().split(/\s+/).filter(Boolean);
        var tags = this.tags;
        var hay = this.haystacks;
        var out = [];
        this.cases.forEach(function (c, i) {
          var tagOk = !tags.length || c.tags.some(function (t) { return tags.indexOf(t) !== -1; });
          var textOk = words.every(function (w) { return hay[i].indexOf(w) !== -1; });
          if (tagOk && textOk) out.push(i);
        });
        return out;
      },
      visible: function () {
        var gen = this.gen;
        var cases = this.cases;
        return this.textAndTags.filter(function (i) { return !gen || cases[i].generator === gen; });
      },
      visibleSet: function () {
        return new Set(this.visible);
      },
      genCounts: function () {
        var counts = {};
        var cases = this.cases;
        this.textAndTags.forEach(function (i) {
          var g = cases[i].generator;
          counts[g] = (counts[g] || 0) + 1;
        });
        return counts;
      },
      // Tag counts under the search box and generator, ignoring the tag filter
      // itself, so every tag shows how many cases it would add.
      tagCounts: function () {
        var words = this.q.toLowerCase().split(/\s+/).filter(Boolean);
        var gen = this.gen;
        var hay = this.haystacks;
        var counts = {};
        this.cases.forEach(function (c, i) {
          if (gen && c.generator !== gen) return;
          if (!words.every(function (w) { return hay[i].indexOf(w) !== -1; })) return;
          c.tags.forEach(function (t) { counts[t] = (counts[t] || 0) + 1; });
        });
        return counts;
      },
      sortedTags: function () {
        var counts = this.tagCounts;
        var names = Object.keys(counts);
        this.tags.forEach(function (t) { if (names.indexOf(t) === -1) names.push(t); });
        return names
          .map(function (name) { return { name: name, count: counts[name] || 0 }; })
          .sort(function (a, b) { return b.count - a.count || (a.name < b.name ? -1 : 1); });
      },
    },

    watch: {
      q: function () { this.syncUrl(); },
      gen: function () { this.syncUrl(); },
      tags: function () { this.syncUrl(); },
      pick: function () { this.syncUrl(); },
      cases: function () { this.boot(); },
      // When a filter hides the inspected case, inspect the first one left.
      visible: function (list) {
        if (!this.loaded() || this.sheet || !list.length || this.visibleSet.has(this.pick)) return;
        this.want = '';
        this.pick = list[0];
      },
    },

    mounted: function () {
      var self = this;
      document.addEventListener('edge:filter', function (e) {
        var d = e.detail || {};
        if (d.gen !== undefined) self.gen = d.gen;
        if (d.tag && self.tags.indexOf(d.tag) === -1) self.tags = self.tags.concat([d.tag]);
        var lab = document.getElementById('catalog');
        if (lab) lab.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      this.boot();
    },

    methods: {
      // Picks the case named in the URL, or the first visible one, once the
      // catalog has loaded, so the inspector is never empty on a wide screen.
      boot: function () {
        if (!this.loaded() || this.pick >= 0) return;
        var want = this.want;
        var i = want ? this.cases.findIndex(function (c) { return c.id === want; }) : -1;
        if (i >= 0) {
          if (!this.visibleSet.has(i)) this.reset();
          this.pick = i;
          this.$nextTick().then(function () { scrollRow(i, false); });
        } else if (this.visible.length) {
          this.want = '';
          this.pick = this.visible[0];
        }
      },
      syncUrl: function () {
        var c = this.current();
        V.url.merge({ q: this.q, gen: this.gen, tags: this.tags.join(','), case: c && this.want ? c.id : '' });
      },
      loaded: function () {
        return this.cases.length > 0;
      },
      isShown: function (i) {
        return !this.loaded() || this.visibleSet.has(i);
      },
      countFor: function (gen, fallback) {
        if (!this.loaded()) return fallback;
        if (!gen) return this.textAndTags.length;
        return this.genCounts[gen] || 0;
      },
      status: function (total) {
        if (!this.loaded()) return total + ' specimens';
        var n = this.visible.length;
        if (!n) return 'No match';
        return n === this.cases.length ? n + ' specimens' : n + ' of ' + this.cases.length + ' specimens';
      },
      tagList: function () {
        var list = this.sortedTags;
        if (this.allTags) return list;
        var selected = this.tags;
        return list.filter(function (t, i) { return i < TAGS_SHOWN || selected.indexOf(t.name) !== -1; });
      },
      moreTags: function () {
        return this.sortedTags.length > TAGS_SHOWN;
      },
      setGen: function (gen) {
        this.gen = this.gen === gen ? '' : gen;
      },
      toggleTag: function (tag) {
        var i = this.tags.indexOf(tag);
        this.tags = i === -1 ? this.tags.concat([tag]) : this.tags.filter(function (t) { return t !== tag; });
      },
      reset: function () {
        this.q = '';
        this.gen = '';
        this.tags = [];
      },
      current: function () {
        return this.pick >= 0 ? this.cases[this.pick] || null : null;
      },
      no: function () {
        return String(this.pick + 1).padStart(3, '0');
      },
      // A click on a row: pick it, and on a narrow screen open the sheet.
      open: function (i, fromUser) {
        this.pick = i;
        if (fromUser && this.cases[i]) this.want = this.cases[i].id;
        if (fromUser && window.matchMedia('(max-width: 1023px)').matches) {
          this.sheet = true;
          this.$nextTick().then(function () {
            var h = document.getElementById('insp-label');
            if (h) h.focus();
          });
        }
      },
      closeSheet: function () {
        if (!this.sheet) return;
        this.sheet = false;
        var i = this.pick;
        this.$nextTick().then(function () { scrollRow(i, true); });
      },
      // Up and Down move through the visible rows from anywhere in the grid.
      keys: function (e) {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        var list = this.visible;
        if (!list.length) return;
        e.preventDefault();
        var at = list.indexOf(this.pick);
        var next = at === -1 ? 0 : e.key === 'ArrowDown' ? Math.min(list.length - 1, at + 1) : Math.max(0, at - 1);
        this.pick = list[next];
        this.want = this.cases[this.pick].id;
        scrollRow(this.pick, true);
      },
      // The value as code points, for strings.
      points: function () {
        var c = this.current();
        var body = c ? quoted(c.value) : null;
        if (body === null) return [];
        return Array.from(unescape(body)).slice(0, POINTS_SHOWN).map(function (ch) {
          var cp = ch.codePointAt(0);
          var printable = cp > 32 && cp < 127;
          return { ch: printable ? ch : NAMES[cp] || '', u: 'U+' + cp.toString(16).toUpperCase().padStart(4, '0'), esc: !printable };
        });
      },
      pointsMore: function () {
        var c = this.current();
        var body = c ? quoted(c.value) : null;
        if (body === null) return '';
        var n = Array.from(unescape(body)).length;
        return n > POINTS_SHOWN ? 'and ' + (n - POINTS_SHOWN) + ' more code points' : '';
      },
      // UTF-16 length, code points and graphemes: where string bugs live.
      stats: function () {
        var c = this.current();
        if (!c) return '';
        var body = quoted(c.value);
        if (body === null) {
          var cut = /\((\d+) chars\)$/.exec(c.value);
          return cut ? plural(Number(cut[1]), 'code unit') + ', shown cut' : '';
        }
        var s = unescape(body);
        var parts = [plural(s.length, 'unit'), plural(Array.from(s).length, 'code point')];
        if (segmenter) parts.push(plural(Array.from(segmenter.segment(s)).length, 'grapheme'));
        return parts.join(', ');
      },
      hl: hl,
      filterSnippet: function () {
        if (!this.loaded()) return '';
        var self = this;
        var visible = this.visible;
        if (!visible.length) return '// No specimen matches the current filter.';
        var opts = this.tags.length ? '{ tags: ' + quoteTags(this.tags) + ' }' : '';
        var gens = this.gen
          ? [this.gen]
          : this.generators.filter(function (g) { return self.genCounts[g]; });
        var source = gens.length === 1
          ? gens[0] + '(' + opts + ')'
          : '[\n' + gens.map(function (g) { return '  ...' + g + '(' + opts + '),'; }).join('\n') + '\n]';
        var setup;
        if (this.q.trim()) {
          var labels = visible.map(function (i) { return '  ' + lit(self.cases[i].label) + ','; });
          setup = '// ' + visible.length + ' cases matching "' + this.q.trim().replace(/[^\x20-\x7e]/g, '?') + '"\n' +
            'const labels = new Set([\n' + labels.join('\n') + '\n]);\n' +
            'const cases = ' + source + '.filter((c) => labels.has(c.label));';
        } else {
          setup = '// ' + visible.length + ' cases\nconst cases = ' + source + ';';
        }
        return testBody({ imports: 'import { ' + gens.join(', ') + " } from 'edgegoat';", setup: setup });
      },
      caseSnippet: function () {
        var c = this.current();
        if (!c) return '';
        return testBody({
          imports: 'import { ' + c.generator + " } from 'edgegoat';",
          setup: 'const cases = ' + c.generator + '().filter((c) => c.label === ' + lit(c.label) + ');',
        });
      },
    },
  });

  // ---------------------------------------------------------------- page wiring
  function openPalette() {
    var d = document.getElementById('palette');
    if (!d) return;
    var cmd = d.querySelector('.command-palette');
    if (cmd && cmd.monsoon && cmd.monsoon.command) cmd.monsoon.command.open();
    else if (!d.open) d.showModal();
  }

  document.addEventListener('click', function (e) {
    var t = e.target instanceof Element ? e.target : e.target.parentElement;
    if (!t) return;
    if (t.closest('[data-open-palette]')) {
      e.preventDefault();
      openPalette();
      return;
    }
    var item = t.closest('#palette .command-palette-item');
    if (!item) return;
    if (item.dataset.action === 'theme') {
      if (window.V && V.theme) V.theme.cycle();
      return;
    }
    // On the lab page, generator and tag entries filter in place.
    if (document.getElementById('cases') && (item.dataset.gen || item.dataset.tag)) {
      e.preventDefault();
      var d = document.getElementById('palette');
      if (d && d.open) d.close();
      document.dispatchEvent(new CustomEvent('edge:filter', { detail: { gen: item.dataset.gen, tag: item.dataset.tag } }));
    }
  });

  // "/" focuses the lab search, like most data tools.
  document.addEventListener('keydown', function (e) {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
    var el = document.activeElement;
    if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
    var q = document.getElementById('q');
    if (!q) return;
    e.preventDefault();
    q.focus();
    q.select();
  });
})();
