/* Globale Seitenlogik: Mobile-Menü, aktiver Menüpunkt, Footer-Jahr */
(function () {
  var burger = document.querySelector('.burger');
  var links = document.getElementById('navLinks');
  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Aktiven Menüpunkt anhand des Dateinamens markieren
  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (page === '') page = 'index.html';
  document.querySelectorAll('#navLinks a[data-page]').forEach(function (a) {
    if (a.getAttribute('data-page') === page) a.setAttribute('aria-current', 'page');
  });

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---- Scroll-Reveal + Count-up (dezent) ---- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  var counters = Array.prototype.slice.call(document.querySelectorAll('.stat__num[data-count]'));
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setFinal(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    el.textContent = (el.getAttribute('data-prefix') || '') + target + (el.getAttribute('data-suffix') || '');
  }
  function runCount(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1100, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target + suffix;
    }
    requestAnimationFrame(step);
  }

  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
    counters.forEach(setFinal);
    return;
  }

  var io = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.classList.add('is-visible');
      el.querySelectorAll && el.querySelectorAll('.stat__num[data-count]').forEach(runCount);
      if (el.matches('.stat__num[data-count]')) runCount(el);
      obs.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(function (el) { io.observe(el); });
  // Zähler, die nicht selbst data-reveal sind, separat beobachten
  counters.forEach(function (el) {
    if (!el.hasAttribute('data-reveal') && !el.closest('[data-reveal]')) io.observe(el);
  });

  /* ---- Vorher/Nachher-Slider (Defurnishing) ---- */
  var ba = document.getElementById('baSlider');
  if (ba) {
    var dragging = false;
    function setPos(pct) {
      pct = Math.max(0, Math.min(100, pct));
      ba.style.setProperty('--pos', pct + '%');
      ba.setAttribute('aria-valuenow', Math.round(pct));
    }
    function posFromEvent(clientX) {
      var rect = ba.getBoundingClientRect();
      setPos(((clientX - rect.left) / rect.width) * 100);
    }
    ba.addEventListener('pointerdown', function (e) {
      dragging = true;
      ba.setPointerCapture && ba.setPointerCapture(e.pointerId);
      posFromEvent(e.clientX);
    });
    ba.addEventListener('pointermove', function (e) {
      if (dragging) posFromEvent(e.clientX);
    });
    ba.addEventListener('pointerup', function () { dragging = false; });
    ba.addEventListener('pointercancel', function () { dragging = false; });
    ba.addEventListener('keydown', function (e) {
      var cur = parseFloat(ba.getAttribute('aria-valuenow')) || 50;
      if (e.key === 'ArrowLeft') { setPos(cur - 4); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { setPos(cur + 4); e.preventDefault(); }
      else if (e.key === 'Home') { setPos(0); e.preventDefault(); }
      else if (e.key === 'End') { setPos(100); e.preventDefault(); }
    });
  }
})();
