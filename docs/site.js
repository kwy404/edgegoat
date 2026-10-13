// Catalog browser for index.html, a Voodoo.js component.
// The case list itself is static HTML (indexable and readable without
// JavaScript). This component only filters it, counts it, shows the details of
// one case and writes copy ready tests. Case data comes from catalog.json
// through v-resource="cat:./catalog.json" inside the component.
/* global V */
(function () {
  var TAGS_SHOWN = 16;
  // Cases rendered before "Show all". Every case is still in the static HTML.
  var PAGE = 24;

  // ASCII only JavaScript string literal: emoji and invisible characters
  // become escapes, never raw glyphs.
  function lit(s) {
    return JSON.stringify(s).replace(/[\u007f-￿]/g, function (ch) {
      return '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0');
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

  function fromUrl(key) {
    return V.url.get(key, '') || '';
  }

  V.component('edge-catalog', {
    state: function () {
      return {
        cat: null,
        q: fromUrl('q'),
        gen: fromUrl('gen'),
        tags: fromUrl('tags').split(',').filter(Boolean),
        pick: -1,
        allTags: false,
        showAll: false,
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
        return new Set(this.showAll ? this.visible : this.visible.slice(0, PAGE));
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
        var selected = this.tags;
        var names = Object.keys(counts);
        selected.forEach(function (t) { if (names.indexOf(t) === -1) names.push(t); });
        return names
          .map(function (name) { return { name: name, count: counts[name] || 0 }; })
          .sort(function (a, b) { return b.count - a.count || (a.name < b.name ? -1 : 1); });
      },
    },

    watch: {
      q: function () { this.syncUrl(); },
      gen: function () { this.syncUrl(); },
      tags: function () { this.syncUrl(); },
    },

    methods: {
      syncUrl: function () {
        V.url.merge({ q: this.q, gen: this.gen, tags: this.tags.join(',') });
      },
      loaded: function () {
        return this.cases.length > 0;
      },
      isShown: function (i) {
        return !this.loaded() || this.visibleSet.has(i) || this.pick === i;
      },
      hiddenCount: function () {
        return this.loaded() && !this.showAll ? Math.max(0, this.visible.length - PAGE) : 0;
      },
      countFor: function (gen, fallback) {
        if (!this.loaded()) return fallback;
        if (!gen) return this.textAndTags.length;
        return this.genCounts[gen] || 0;
      },
      status: function (total) {
        if (!this.loaded()) return 'Showing ' + total + ' of ' + total + ' cases.';
        var n = this.visible.length;
        return n
          ? 'Showing ' + n + ' of ' + this.cases.length + ' cases.'
          : 'No case matches this filter. Try fewer words or clear the filters.';
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
      open: function (i) {
        this.pick = this.pick === i ? -1 : i;
        if (this.pick === -1) return;
        this.$nextTick().then(function () {
          var title = document.getElementById('detail-title');
          if (title) title.focus({ preventScroll: window.matchMedia('(min-width: 900px)').matches });
        });
      },
      close: function () {
        var i = this.pick;
        this.pick = -1;
        var item = document.querySelectorAll('#cases > li')[i];
        var button = item && item.querySelector('.more');
        if (button) button.focus();
      },
      filterSnippet: function () {
        if (!this.loaded()) return '';
        var self = this;
        var visible = this.visible;
        if (!visible.length) return '// No case matches the current filter.';
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
})();
