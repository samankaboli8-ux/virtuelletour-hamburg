/* =====================================================================
   Sortiermodus für die Referenzen-Seite
   Aktivierung: referenzen.html?sort  (Lesezeichen setzen!)
   - Touren pro Kategorie per Maus/Touch verschieben
   - "Reihenfolge speichern" merkt sich die Reihenfolge in diesem Browser
     UND erzeugt den fertigen Code zum Weitergeben (damit sie live geht).
   Setzt voraus, dass tours.js (mit TOURS) bereits geladen ist.
   ===================================================================== */
(function () {
  if (typeof TOURS === 'undefined') return;

  var STORAGE_KEY = 'tourOrder';
  var params = new URLSearchParams(location.search);
  if (!params.has('sort')) return;

  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState !== 'loading') init();

  var started = false;
  function init() {
    if (started) return;
    started = true;
    injectStyles();
    document.body.classList.add('sort-mode');
    // Alle Kategorien aufklappen, damit alles ziehbar ist
    document.querySelectorAll('#grid .cat.collapsed').forEach(function (c) {
      c.classList.remove('collapsed');
      var b = c.querySelector('.grid');
      if (b) b.style.maxHeight = 'none';
    });
    enableDnD();
    buildPanel();
    // Suche im Sortiermodus deaktivieren (verhindert Neu-Rendern)
    var s = document.getElementById('search');
    if (s) { s.disabled = true; s.placeholder = 'Im Sortiermodus deaktiviert'; }
  }

  var dragEl = null;
  function enableDnD() {
    document.querySelectorAll('#grid .cat .grid').forEach(function (gridEl) {
      gridEl.querySelectorAll('.card').forEach(makeDraggable);
      gridEl.addEventListener('dragover', function (e) {
        e.preventDefault();
        if (!dragEl || dragEl.parentElement !== gridEl) return; // nur innerhalb derselben Kategorie
        var after = getDragAfterElement(gridEl, e.clientY);
        if (after == null) gridEl.appendChild(dragEl);
        else gridEl.insertBefore(dragEl, after);
      });
    });
  }

  function makeDraggable(card) {
    card.setAttribute('draggable', 'true');
    card.addEventListener('dragstart', function (e) {
      dragEl = card;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', card.dataset.id); } catch (err) {}
    });
    card.addEventListener('dragend', function () {
      card.classList.remove('dragging');
      dragEl = null;
    });
  }

  function getDragAfterElement(container, y) {
    var els = Array.prototype.slice.call(container.querySelectorAll('.card:not(.dragging)'));
    var closest = { offset: -Infinity, element: null };
    els.forEach(function (child) {
      var box = child.getBoundingClientRect();
      var offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) closest = { offset: offset, element: child };
    });
    return closest.element;
  }

  function currentOrderIds() {
    var ids = [];
    document.querySelectorAll('#grid .cat .card').forEach(function (card) {
      if (card.dataset.id) ids.push(card.dataset.id);
    });
    return ids;
  }

  function buildToursSnippet(ids) {
    var byId = {};
    TOURS.forEach(function (t) { byId[t.id] = t; });
    var lines = ['const TOURS = ['];
    var lastCat = null;
    ids.forEach(function (id) {
      var t = byId[id];
      if (!t) return;
      if (t.cat !== lastCat) {
        lines.push('  // ' + t.cat);
        lastCat = t.cat;
      }
      lines.push('  { id:"' + t.id + '", title:"' + t.title.replace(/"/g, '\\"') + '", cat:"' + t.cat + '" },');
    });
    lines.push('];');
    return lines.join('\n');
  }

  function buildPanel() {
    var bar = document.createElement('div');
    bar.id = 'sortBar';
    bar.innerHTML =
      '<div class="sb-inner">' +
      '  <span class="sb-title">Sortiermodus aktiv – Touren ziehen zum Umsortieren</span>' +
      '  <button class="sb-btn sb-save" type="button">Reihenfolge speichern</button>' +
      '  <button class="sb-btn sb-reset" type="button">Zurücksetzen</button>' +
      '  <a class="sb-btn sb-exit" href="referenzen.html">Beenden</a>' +
      '</div>';
    document.body.appendChild(bar);

    bar.querySelector('.sb-save').addEventListener('click', function () {
      var ids = currentOrderIds();
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch (e) {}
      showSnippet(buildToursSnippet(ids));
    });
    bar.querySelector('.sb-reset').addEventListener('click', function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      location.href = 'referenzen.html?sort';
    });
  }

  function showSnippet(code) {
    var back = document.createElement('div');
    back.id = 'sortModal';
    back.innerHTML =
      '<div class="sm-box">' +
      '  <h3>Reihenfolge gespeichert ✓</h3>' +
      '  <p>Deine neue Reihenfolge ist in diesem Browser als Vorschau gemerkt. Damit sie für alle Besucher live geht, schick mir einfach diesen Text (oder füge ihn in <code>tours.js</code> ein):</p>' +
      '  <textarea class="sm-code" readonly></textarea>' +
      '  <div class="sm-actions">' +
      '    <button class="sb-btn sm-copy" type="button">Code kopieren</button>' +
      '    <button class="sb-btn sm-close" type="button">Schließen</button>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(back);
    var ta = back.querySelector('.sm-code');
    ta.value = code;
    back.querySelector('.sm-copy').addEventListener('click', function () {
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      if (navigator.clipboard) navigator.clipboard.writeText(code).catch(function () {});
      this.textContent = ok || navigator.clipboard ? 'Kopiert ✓' : 'Bitte manuell kopieren';
    });
    function close() { back.remove(); }
    back.querySelector('.sm-close').addEventListener('click', close);
    back.addEventListener('click', function (e) { if (e.target === back) close(); });
  }

  function injectStyles() {
    var css =
      '#grid .cat .grid{transition:none}' +
      'body.sort-mode #grid .cat .grid{grid-template-columns:1fr!important;max-height:none!important;overflow:visible!important}' +
      'body.sort-mode .cat.collapsed .grid{max-height:none!important}' +
      'body.sort-mode .card{cursor:grab;border:2px dashed transparent;transition:border-color .15s,opacity .15s}' +
      'body.sort-mode .card:hover{border-color:#cfe0d2}' +
      'body.sort-mode .card.dragging{opacity:.45;border-color:#4E7B53;cursor:grabbing}' +
      'body.sort-mode .card .frame{pointer-events:none}' +
      'body.sort-mode{padding-bottom:80px}' +
      '#sortBar{position:fixed;left:0;right:0;bottom:0;z-index:400;background:#16242E;color:#fff;box-shadow:0 -6px 24px rgba(0,0,0,.2)}' +
      '#sortBar .sb-inner{max-width:1200px;margin:0 auto;display:flex;flex-wrap:wrap;gap:12px;align-items:center;padding:12px 20px}' +
      '#sortBar .sb-title{font-weight:600;margin-right:auto;font-size:15px}' +
      '.sb-btn{font-family:inherit;font-weight:600;font-size:14px;padding:9px 16px;border-radius:10px;border:1px solid transparent;cursor:pointer;text-decoration:none;color:#fff;background:#4E7B53}' +
      '.sb-btn.sb-reset{background:transparent;border-color:rgba(255,255,255,.35)}' +
      '.sb-btn.sb-exit{background:transparent;border-color:rgba(255,255,255,.35)}' +
      '.sb-btn:hover{filter:brightness(1.08)}' +
      '#sortModal{position:fixed;inset:0;z-index:500;background:rgba(16,36,46,.6);display:flex;align-items:center;justify-content:center;padding:20px}' +
      '#sortModal .sm-box{background:#fff;color:#16242E;max-width:640px;width:100%;border-radius:16px;padding:26px}' +
      '#sortModal h3{margin:0 0 10px;font-size:22px}' +
      '#sortModal p{font-size:15px;line-height:1.5;margin:0 0 14px}' +
      '#sortModal code{background:#eef2ee;padding:2px 6px;border-radius:5px;font-size:13px}' +
      '.sm-code{width:100%;height:220px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;border:1px solid #d7ded8;border-radius:10px;padding:12px;resize:vertical;background:#f7faf7}' +
      '.sm-actions{display:flex;gap:10px;margin-top:14px}';
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
  }
})();
