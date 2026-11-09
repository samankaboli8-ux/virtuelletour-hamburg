/* =====================================================================
   Galerie-Hero (Prototyp nach Framer „Infinite Exhibition“)
   Die Kamera läuft durch einen Korridor in CSS 3D. Der Hero ist gepinnt: der Scrollweg
   (--track) entspricht einer vollen Runde durch alle Rahmen, dazu kommt ein langsamer
   Lauf im Leerlauf. Die Rahmen liegen auf einer Schleife und werden hinter der Kamera
   wieder vorn im Nebel eingereiht, der Gang endet also nie.
   Klick auf ein Bild: Kamera tritt heran und dreht sich zum Bild. Zweiter Klick oder
   „360° Tour starten“ öffnet die Tour im Vollbild-Fenster. Esc oder Scrollen führt zurück.
   ===================================================================== */
(function () {
  var hero = document.getElementById('galleryHero');
  if (!hero) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EMBED = 'https://my.matterport.com/show/?m=';

  var sticky = hero.querySelector('.gal-sticky');
  var view = document.getElementById('galView');
  var space = document.getElementById('galSpace');
  var world = document.getElementById('galWorld');
  var frames = Array.prototype.slice.call(world.querySelectorAll('.gf'));
  var focusBar = document.getElementById('galFocus');
  var focusTitle = document.getElementById('galFocusTitle');
  var viewer = document.getElementById('galViewer');
  var viewerBox = document.getElementById('galViewerBox');
  var viewerClose = document.getElementById('galViewerClose');
  var N = frames.length;
  if (!N) return;

  /* ---- Maße aus dem CSS lesen (über Messelemente, damit clamp() aufgelöst ist) ---- */
  var meter = document.createElement('div');
  meter.setAttribute('aria-hidden', 'true');
  meter.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden;pointer-events:none;box-sizing:content-box;padding:0;border:0;width:var(--cw);height:var(--fw);margin-left:var(--P);margin-top:var(--ch);';
  hero.appendChild(meter);
  var cfg = { cw: 1400, fw: 518, P: 1000, ch: 1000, gap: 570, L: 6840, bound: 400, start: 0 };
  var heroTop = 0, trackLen = 1, K = 0;

  var measure = function () {
    var cs = getComputedStyle(meter);
    cfg.cw = parseFloat(cs.width) || cfg.cw;
    cfg.fw = parseFloat(cs.height) || cfg.fw;
    cfg.P = parseFloat(cs.marginLeft) || cfg.P;
    cfg.ch = parseFloat(cs.marginTop) || cfg.ch;
    cfg.gap = cfg.fw * 1.1;                      // Abstand aufeinanderfolgender Rahmen (abwechselnd links/rechts)
    cfg.L = cfg.gap * N;                          // eine volle Runde
    cfg.start = cfg.cw * 0.45;                    // erster Rahmen beim Start
    /* Hinter dieser z-Position ist ein Rahmen sicher aus dem Bild (hintere Kante jenseits des Bildrands) */
    var halfW = window.innerWidth / 2 + 60;
    var zt = cfg.P - (cfg.cw / 2) * cfg.P / halfW;
    cfg.bound = Math.min(cfg.P * 0.72, Math.max(120, zt + cfg.fw / 2 + 20));
    heroTop = hero.getBoundingClientRect().top + window.pageYOffset;
    trackLen = Math.max(1, hero.offsetHeight - sticky.offsetHeight);
    K = reduce ? 0 : cfg.L / trackLen;
  };

  /* ---- Kamera ---- */
  var drift = 0, driftSpeed = reduce ? 0 : 54;   // Einheiten pro Sekunde im Leerlauf
  var cam = 0, camX = 0, camXT = 0, yaw = 0, yawT = 0;
  var yawP = 0, yawPT = 0, camXP = 0, camXPT = 0;   // leichte Parallaxe zur Mausposition
  var focus = null, lastFocus = null, focusScrollY = null, viewerOpen = false;
  var scrollPart = function () {
    var y = window.pageYOffset - heroTop;
    return Math.max(0, Math.min(trackLen, y)) * K;
  };

  frames.forEach(function (f, i) {
    f._side = f.dataset.side === 'l' ? -1 : 1;
    f._i = i;
    f._face = f.querySelector('.gf__face');
    f._zz = 0;
  });

  var paint = function () {
    space.style.transform = 'rotateY(' + (yaw + yawP).toFixed(3) + 'deg) translateX(' + (-(camX + camXP)).toFixed(2) + 'px)';
    var xw = cfg.cw / 2 - 10, L = cfg.L, b = cfg.bound;
    var fogFrom = cfg.cw * 0.7, fogLen = cfg.cw * 3.7;
    for (var i = 0; i < N; i++) {
      var f = frames[i];
      var zz = -(i * cfg.gap) - cfg.start + cam;
      var bb = (f === focus || f === lastFocus) ? cfg.P - 20 : b; // Bild im Fokus darf neben der Kamera stehen
      zz = ((zz - bb) % L + L) % L - L + bb;        // Schleife: (-L + bound, bound]
      var d = -zz;
      var fog = Math.max(0, Math.min(1, (d - fogFrom) / fogLen));
      f.style.transform = 'translate3d(' + (f._side * xw).toFixed(1) + 'px,0,' + zz.toFixed(2) + 'px) rotateY(' + (f._side < 0 ? 90 : -90) + 'deg)';
      f.style.setProperty('--fog', fog.toFixed(3));
      f.style.visibility = fog >= 1 ? 'hidden' : '';
      f._zz = zz;
    }
  };

  var last = performance.now(), rafId = 0, inView = true;
  var tick = function (now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!focus && !viewerOpen) drift += driftSpeed * dt;
    var camT = scrollPart() + drift;
    var k = 1 - Math.exp(-dt * 6.5), k2 = 1 - Math.exp(-dt * 4.5);
    cam += (camT - cam) * k;
    camX += (camXT - camX) * k2;
    yaw += (yawT - yaw) * k2;
    var k3 = 1 - Math.exp(-dt * 2.5);
    yawP += (yawPT - yawP) * k3; camXP += (camXPT - camXP) * k3;
    if (lastFocus && !focus && Math.abs(yaw) < 0.8 && Math.abs(camX) < 1.5) lastFocus = null; // wieder im Gang: Bild darf hinten einreihen
    paint();
    rafId = inView ? requestAnimationFrame(tick) : 0;
  };
  var start = function () { if (!rafId) { last = performance.now(); rafId = requestAnimationFrame(tick); } };

  /* ---- Fokus: näher treten ---- */
  var setFocus = function (f) {
    if (focus) focus.classList.remove('is-focus');
    focus = f; focusScrollY = window.pageYOffset;
    hero.classList.add('is-focus'); f.classList.add('is-focus');
    yawPT = 0; camXPT = 0;
    /* Kamera (steht bei z = P) rückt vor, zur Wand hinüber und dreht sich um theta zum Bild, das dann
       mittig in Entfernung R vor ihr steht: Bild-z = P - R*cos(theta), Kamera-x = Bild-x - s*R*sin(theta) */
    var mobile = window.innerWidth < 640;
    var theta = mobile ? 56 : 50, R = cfg.fw * (mobile ? 1.5 : 1.22), rad = theta * Math.PI / 180;
    var xf = f._side * (cfg.cw / 2 - 10);
    drift += (cfg.P - R * Math.cos(rad)) - f._zz;
    camXT = xf - f._side * R * Math.sin(rad);
    yawT = f._side * theta;
    lastFocus = f;
    focusTitle.textContent = (f._face.dataset.title || '') + (f._face.dataset.place ? ' · ' + f._face.dataset.place : '');
    start();
  };
  var clearFocus = function (keepCamera) {
    if (!focus) return;
    focus.classList.remove('is-focus');
    var was = focus; focus = null; focusScrollY = null;
    hero.classList.remove('is-focus');
    camXT = 0; yawT = 0;
    if (!keepCamera) was._face.focus({ preventScroll: true });
    start();
  };

  /* ---- Tour-Fenster ---- */
  var openTour = function (f) {
    var id = f._face.dataset.m, name = f._face.dataset.title || '';
    viewerBox.innerHTML = '';
    var spin = document.createElement('div'); spin.className = 'spinner'; viewerBox.appendChild(spin);
    var ifr = document.createElement('iframe');
    ifr.src = EMBED + id + '&play=1';
    ifr.title = 'Virtuelle Tour: ' + name;
    ifr.allow = 'autoplay; fullscreen; web-share; xr-spatial-tracking;';
    ifr.allowFullscreen = true;
    ifr.addEventListener('load', function () { spin.remove(); });
    viewerBox.appendChild(ifr);
    viewer.hidden = false; viewer.classList.add('is-open'); viewerOpen = true;
    document.documentElement.classList.add('gal-lock');
    if (window.lenis) window.lenis.stop();
    viewerClose.focus();
  };
  var closeTour = function () {
    if (!viewerOpen) return;
    viewer.classList.remove('is-open'); viewer.hidden = true; viewerOpen = false;
    viewerBox.innerHTML = '';
    document.documentElement.classList.remove('gal-lock');
    if (window.lenis) window.lenis.start();
    if (focus) focus._face.focus({ preventScroll: true });
    start();
  };

  frames.forEach(function (f) {
    f._face.addEventListener('click', function (e) {
      e.stopPropagation();
      if (focus === f) openTour(f); else setFocus(f);
    });
  });
  view.addEventListener('click', function () { clearFocus(); });
  focusBar.addEventListener('click', function (e) {
    var act = e.target.closest('[data-act]'); if (!act) return;
    e.stopPropagation();
    if (act.dataset.act === 'start' && focus) openTour(focus);
    if (act.dataset.act === 'back') clearFocus();
  });
  viewerClose.addEventListener('click', closeTour);
  viewer.addEventListener('click', function (e) { if (e.target === viewer) closeTour(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (viewerOpen) { closeTour(); return; }
    if (focus) clearFocus();
  });
  /* Scrollen während des Fokus führt zurück in den Gang */
  window.addEventListener('scroll', function () {
    if (focus && focusScrollY !== null && Math.abs(window.pageYOffset - focusScrollY) > 40) clearFocus(true);
  }, { passive: true });

  /* Parallaxe: Kamera folgt der Maus ein wenig (nur feine Zeiger, nicht im Fokus) */
  if (!reduce && window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
    sticky.addEventListener('pointermove', function (e) {
      if (focus) { yawPT = 0; camXPT = 0; return; }
      var nx = (e.clientX / window.innerWidth - 0.5) * 2;
      yawPT = nx * 1.6; camXPT = nx * cfg.cw * 0.02;
    });
    sticky.addEventListener('pointerleave', function () { yawPT = 0; camXPT = 0; });
  }

  /* ---- Umschalter Hell/Dunkel (nur Vorschau) ---- */
  var themeBtns = hero.querySelectorAll('.gal__theme button');
  var setTheme = function (t) {
    hero.setAttribute('data-theme', t);
    themeBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.theme === t ? 'true' : 'false'); });
    try { localStorage.setItem('galTheme', t); } catch (e) {}
  };
  themeBtns.forEach(function (b) { b.addEventListener('click', function () { setTheme(b.dataset.theme); }); });
  try { var saved = localStorage.getItem('galTheme'); if (saved === 'light' || saved === 'dark') setTheme(saved); } catch (e) {}

  /* ---- Start, Größe, Sichtbarkeit ---- */
  measure(); paint();
  window.addEventListener('resize', function () { measure(); paint(); });
  window.addEventListener('load', function () { measure(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { inView = en[0].isIntersecting; if (inView) start(); }, { threshold: 0 }).observe(sticky);
  }
  start();
})();
