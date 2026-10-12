// Client side filtering for the catalog on index.html. The full list is
// rendered in the HTML, so the page works (and is indexable) without this.
(function () {
  var input = document.getElementById('q');
  var select = document.getElementById('gen');
  var status = document.getElementById('status');
  var items = Array.prototype.slice.call(document.querySelectorAll('#cases .case'));
  if (!input || !select || !status) return;

  function apply() {
    var words = input.value.toLowerCase().split(/\s+/).filter(Boolean);
    var gen = select.value;
    var shown = 0;
    items.forEach(function (item) {
      var text = item.getAttribute('data-search');
      var ok = (!gen || item.getAttribute('data-generator') === gen) &&
        words.every(function (w) { return text.indexOf(w) !== -1; });
      item.hidden = !ok;
      if (ok) shown++;
    });
    status.textContent = 'Showing ' + shown + ' of ' + items.length + ' cases.';
    var params = new URLSearchParams();
    if (input.value) params.set('q', input.value);
    if (gen) params.set('gen', gen);
    var query = params.toString();
    history.replaceState(null, '', query ? '?' + query + '#catalog' : location.pathname + location.hash);
  }

  var initial = new URLSearchParams(location.search);
  if (initial.get('q')) input.value = initial.get('q');
  if (initial.get('gen')) select.value = initial.get('gen');

  input.addEventListener('input', apply);
  select.addEventListener('change', apply);
  if (input.value || select.value) apply();
})();
