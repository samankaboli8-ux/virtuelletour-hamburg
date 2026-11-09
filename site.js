/* Globale Seitenlogik: Smooth Scroll, Mobile-Menü, aktiver Menüpunkt, Footer-Jahr */
(function () {
  /* ---- Smooth Scroll mit Lenis (lenis.min.js, lokal gehostet) ----
     Bei "Bewegung reduzieren" bleibt Lenis aus, dann scrollt alles nativ. */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lenis = null;
  if (!reduce && typeof Lenis === 'function') {
    lenis = new Lenis({
      lerp: 0.18,              // Dämpfung: höher = straffer (Standard 0.1 war zu weich)
      autoRaf: true,           // eigene Animationsschleife
      anchors: true,           // Sprungmarken (#id) weich anfahren, scroll-padding-top wird beachtet
      allowNestedScroll: true  // scrollbare Bereiche (z. B. Mobile-Menü) scrollen weiter für sich
    });
    window.lenis = lenis;
    /* Während des Preloaders scrollt nichts */
    if (document.documentElement.classList.contains('has-intro')) {
      lenis.stop();
      setTimeout(function () { lenis.start(); }, 1500);
    }
  }

  /* Element mittig in den Viewport scrollen: per Lenis, ohne Lenis nativ */
  window.scrollToCenter = function (el) {
    if (!el) return;
    if (!lenis) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    var rect = el.getBoundingClientRect();
    lenis.scrollTo(rect.top + window.pageYOffset - Math.max(0, (window.innerHeight - rect.height) / 2));
  };

  var burger = document.querySelector('.burger');
  var links = document.getElementById('navLinks');
  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
      document.documentElement.classList.toggle('nav-open', open);
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.documentElement.classList.remove('nav-open');
      });
    });
  }

  // Branchen-Dropdown: beim Verlassen erst nach kurzer Verzögerung schließen,
  // damit der Mauszeiger in Ruhe nach unten ins Untermenü wandern kann
  document.querySelectorAll('.nav__has-sub').forEach(function (item) {
    var timer = null;
    item.addEventListener('mouseenter', function () {
      clearTimeout(timer);
      item.classList.add('is-open');
    });
    item.addEventListener('mouseleave', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { item.classList.remove('is-open'); }, 350);
    });
  });

  // Aktiven Menüpunkt anhand des Dateinamens markieren
  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (page === '') page = 'index.html';
  document.querySelectorAll('#navLinks a[data-page]').forEach(function (a) {
    if (a.getAttribute('data-page') === page) a.setAttribute('aria-current', 'page');
  });


  /* ---- Google Street View: erst nach Klick laden (Datenschutz) ---- */
  document.querySelectorAll('.sv-embed[data-src]').forEach(function (box) {
    var btn = box.querySelector('.sv-embed__btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = box.getAttribute('data-src');
      f.title = box.getAttribute('data-title') || 'Google Street View';
      f.allowFullscreen = true;
      f.referrerPolicy = 'no-referrer-when-downgrade';
      box.querySelectorAll('picture, img, .sv-embed__btn').forEach(function (el) { el.remove(); });
      box.appendChild(f);
    });
  });

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---- Scroll-Reveal + Count-up (dezent) ---- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('[data-reveal],[data-reveal-stagger]'));
  var counters = Array.prototype.slice.call(document.querySelectorAll('.stat__num[data-count]'));

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
  } else {

    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('is-visible');
        el.querySelectorAll && el.querySelectorAll('.stat__num[data-count]').forEach(runCount);
        if (el.matches('.stat__num[data-count]')) runCount(el);
        obs.unobserve(el);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(function (el) { io.observe(el); });
    // Zähler, die nicht selbst data-reveal sind, separat beobachten
    counters.forEach(function (el) {
      if (!el.hasAttribute('data-reveal') && !el.closest('[data-reveal]')) io.observe(el);
    });
  }

  /* ---- Vorher/Nachher-Slider (Möbel digital entfernen) ---- */
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
  /* ---- Mobiler Anfrage-Balken: sichtbar zwischen Hero und CTA-Band ---- */
  var mobileCta = document.getElementById('mobileCta');
  if (mobileCta && 'IntersectionObserver' in window) {
    var heroEl = document.querySelector('.hero');
    var ctaBand = document.querySelector('.cta-band, .cta');
    var heroGone = false, ctaNear = false, footNear = false;
    var updateCta = function () {
      var show = heroGone && !ctaNear && !footNear;
      mobileCta.classList.toggle('is-visible', show);
      mobileCta.setAttribute('aria-hidden', show ? 'false' : 'true');
    };
    if (heroEl) new IntersectionObserver(function (en) {
      heroGone = !en[0].isIntersecting && en[0].boundingClientRect.bottom < 0; updateCta();
    }, { threshold: 0 }).observe(heroEl);
    var footEl = document.querySelector('.site-footer');
    if (ctaBand) new IntersectionObserver(function (en) {
      ctaNear = en[0].isIntersecting; updateCta();
    }, { rootMargin: '0px 0px 80px 0px' }).observe(ctaBand);
    if (footEl) new IntersectionObserver(function (en) {
      footNear = en[0].isIntersecting; updateCta();
    }, { rootMargin: '0px 0px 80px 0px' }).observe(footEl);
  }


  /* =====================================================================
     Premium-Bewegungssystem (nur aktiv, wenn die Elemente auf der Seite stehen)
     ===================================================================== */
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var EMBED = 'https://my.matterport.com/show/?m=';

  /* ---- Header: Haarlinie und Blur nach 40px, per Sentinel statt Scroll-Listener ---- */
  var sentinel = document.getElementById('headerSentinel');
  var siteHeader = document.getElementById('siteHeader');
  if (sentinel && siteHeader && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      siteHeader.classList.toggle('is-scrolled', !en[0].isIntersecting);
    }).observe(sentinel);
  }

  /* ---- Hero-Titel: Wörter für die Einblendung aufteilen (Unterseiten, data-split) ----
     Textknoten werden in Wörter zerlegt, Elemente (z. B. .nb) bleiben als ein Wort zusammen. */
  document.querySelectorAll('.hero__title[data-split]').forEach(function (h) {
    var idx = 0, frag = document.createDocumentFragment();
    var wrapWord = function (content) {
      var w = document.createElement('span'); w.className = 'w';
      var inner = document.createElement('span'); inner.style.setProperty('--w', idx++);
      if (typeof content === 'string') inner.textContent = content; else inner.appendChild(content);
      w.appendChild(inner); return w;
    };
    Array.prototype.slice.call(h.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(' ')); else frag.appendChild(wrapWord(part));
        });
      } else if (n.nodeType === 1 && n.tagName === 'BR') { frag.appendChild(n); }
      else if (n.nodeType === 1) { frag.appendChild(wrapWord(n)); }
    });
    h.textContent = ''; h.appendChild(frag); h.classList.add('is-split');
  });

  /* ---- Hero-Medium: Klick lädt den Rundgang im Medium ---- */
  var heroCard = document.getElementById('heroTour');
  var heroFrame = document.getElementById('heroFrame');
  if (heroCard && heroFrame) {
    var heroClose = document.getElementById('heroClose');
    var openHero = function () {
      if (heroCard.classList.contains('is-open')) return;
      heroCard.classList.add('is-open');
      heroFrame.removeAttribute('role'); heroFrame.removeAttribute('tabindex');
      var spin = document.createElement('div');
      spin.className = 'spinner';
      heroFrame.appendChild(spin);
      var f = document.createElement('iframe');
      f.src = EMBED + heroCard.dataset.m + '&play=1';
      f.title = 'Virtuelle Tour: ' + (heroFrame.dataset.title || '');
      f.allow = 'autoplay; fullscreen; web-share; xr-spatial-tracking;';
      f.allowFullscreen = true;
      f.addEventListener('load', function () { spin.remove(); });
      heroFrame.appendChild(f);
    };
    var closeHero = function () {
      heroCard.classList.remove('is-open');
      heroFrame.querySelectorAll('iframe,.spinner').forEach(function (el) { el.remove(); });
      heroFrame.setAttribute('role', 'button'); heroFrame.setAttribute('tabindex', '0');
      heroFrame.focus();
    };
    heroFrame.addEventListener('click', openHero);
    heroFrame.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target === heroFrame) { e.preventDefault(); openHero(); }
    });
    if (heroClose) heroClose.addEventListener('click', closeHero);
  }

  /* ---- Umschalter unter dem Hero-Medium: Poster, Tour-ID und Beschriftung wechseln ---- */
  var switchBtns = document.querySelectorAll('.hero-switch__btn[data-m]');
  if (heroCard && heroFrame && switchBtns.length) {
    switchBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.getAttribute('aria-pressed') === 'true') return;
        switchBtns.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
        var m = btn.dataset.m, name = btn.dataset.name || '';
        heroCard.dataset.m = m;
        heroFrame.dataset.title = name;
        heroFrame.setAttribute('aria-label', 'Virtuelle Tour ' + name + ' starten');
        var src = heroFrame.querySelector('picture source'), img = heroFrame.querySelector('img');
        if (src) src.srcset = 'images/tours/' + m + '-1280.webp';
        if (img) { img.src = 'images/tours/' + m + '-1280.jpg'; img.alt = btn.dataset.alt || ('Virtuelle 3D-Tour: ' + name); }
        var f = heroFrame.querySelector('iframe');
        if (f) { f.src = EMBED + m + '&play=1'; f.title = 'Virtuelle Tour: ' + name; }
        var nameEl = document.getElementById('heroTourName');
        if (nameEl) nameEl.textContent = name;
      });
    });
  }

  /* ---- Kontaktformular: Auswahl aus der Festpreis-Leiste übernehmen, Erfolgsmeldung zeigen ---- */
  var anfrage = document.querySelector('form[name="anfrage"]');
  if (anfrage && 'URLSearchParams' in window) {
    var qs = new URLSearchParams(location.search);
    var BRANCHE = { gastronomie: 'Gastronomie / Café / Bar', eventlocations: 'Eventlocation / Hotel', immobilien: 'Immobilie / Wohnung', gewerbe: 'Gewerbe / Showroom', freizeit: 'Freizeit / Sport', baubranche: 'Bauprojekt' };
    var typeSel = document.getElementById('f-type'), areaIn = document.getElementById('f-area'), msgIn = document.getElementById('f-msg');
    var br = qs.get('branche');
    if (br && BRANCHE[br] && typeSel) {
      Array.prototype.forEach.call(typeSel.options, function (o) { if (o.text === BRANCHE[br]) typeSel.value = o.value; });
    }
    var fl = qs.get('flaeche');
    if (fl && areaIn) {
      if (/^\d+$/.test(fl)) areaIn.value = fl;
      else if (fl === 'ueber500' && msgIn && !msgIn.value) msgIn.value = 'Fläche: über 500 m²\n';
    }
    if (qs.get('anfrage') === 'ok') {
      var notice = document.getElementById('formNotice');
      if (notice) { notice.hidden = false; notice.setAttribute('tabindex', '-1'); notice.focus({ preventScroll: true }); }
    }
  }

  /* ---- Scroll-Zoom des Hero-Mediums: Breite wächst von 88 % auf 100 % (nur transform) ---- */
  var zoomEl = document.getElementById('heroZoom');
  if (zoomEl) {
    var Z_MIN = 0.88, zoomEnd = 500, zoomTick = false;
    var measureZoom = function () {
      var top = zoomEl.getBoundingClientRect().top + window.pageYOffset;
      zoomEnd = Math.max(240, top - window.innerHeight * 0.1);
    };
    var applyZoom = function () {
      zoomTick = false;
      var p = Math.min(1, Math.max(0, window.pageYOffset / zoomEnd));
      zoomEl.style.setProperty('--z', (Z_MIN + (1 - Z_MIN) * p).toFixed(4));
    };
    if (!reduce) {
      measureZoom(); applyZoom();
      window.addEventListener('scroll', function () {
        if (!zoomTick) { zoomTick = true; requestAnimationFrame(applyZoom); }
      }, { passive: true });
      window.addEventListener('resize', function () { measureZoom(); applyZoom(); });
      window.addEventListener('load', function () { measureZoom(); applyZoom(); });
    }
  }

  /* Magnetischer Primärbutton im Hero: max. 8px Zug, nur mit Maus */
  var magBtn = document.getElementById('heroCta');
  if (magBtn && finePointer && !reduce) {
    document.addEventListener('mousemove', function (e) {
      var r = magBtn.getBoundingClientRect();
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var dx = e.clientX - cx, dy = e.clientY - cy;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 140) {
        var k = 8 / 140;
        magBtn.style.setProperty('--mx', (dx * k).toFixed(2) + 'px');
        magBtn.style.setProperty('--my', (dy * k).toFixed(2) + 'px');
      } else {
        magBtn.style.setProperty('--mx', '0px');
        magBtn.style.setProperty('--my', '0px');
      }
    }, { passive: true });
  }

  /* ---- Warum als Karten-Flow: Bildstapel, Textwechsel, Autolauf über die Fortschrittsanimation ----
     Der aktive Fortschrittsbalken läuft per CSS (6 s); sein animationend schaltet weiter. Pause bei Hover,
     außerhalb des Sichtbereichs und bei verstecktem Tab. Pfeile, Segmente, Wischen und Pfeiltasten. */
  var flow = document.getElementById('flow');
  if (flow) {
    var fCards = Array.prototype.slice.call(flow.querySelectorAll('.flow__card'));
    var fItems = Array.prototype.slice.call(flow.querySelectorAll('.flow__item'));
    var fSegs = Array.prototype.slice.call(flow.querySelectorAll('.flow__seg'));
    var fStage = document.getElementById('flowStage');
    var fN = fCards.length, fCur = 0, fSwiped = false;
    var fApply = function () {
      fCards.forEach(function (c, i) {
        var d = (i - fCur + fN) % fN;
        c.className = 'flow__card' + (d === 0 ? ' is-active' : d === 1 ? ' is-next' : d === 2 ? ' is-after' : d === fN - 1 ? ' is-prev' : '');
        c.setAttribute('aria-hidden', d === 0 ? 'false' : 'true');
      });
      fItems.forEach(function (t, i) { t.classList.toggle('is-active', i === fCur); t.setAttribute('aria-hidden', i === fCur ? 'false' : 'true'); });
      fSegs.forEach(function (sg, i) {
        sg.classList.remove('is-active', 'is-done');
        if (i < fCur) sg.classList.add('is-done');
        if (i === fCur) { void sg.offsetWidth; sg.classList.add('is-active'); }
        sg.setAttribute('aria-current', i === fCur ? 'true' : 'false');
      });
    };
    var fGo = function (i) { fCur = (i + fN) % fN; fApply(); };
    fSegs.forEach(function (sg, i) {
      sg.addEventListener('click', function () { fGo(i); });
      sg.addEventListener('animationend', function () { if (sg.classList.contains('is-active')) fGo(fCur + 1); });
    });
    var fPrev = document.getElementById('flowPrev'), fNext = document.getElementById('flowNext');
    if (fPrev) fPrev.addEventListener('click', function () { fGo(fCur - 1); });
    if (fNext) fNext.addEventListener('click', function () { fGo(fCur + 1); });
    if (fStage) {
      var fx0 = 0, fDown = false;
      fStage.addEventListener('pointerdown', function (e) { fDown = true; fSwiped = false; fx0 = e.clientX; });
      fStage.addEventListener('pointerup', function (e) {
        if (!fDown) return; fDown = false;
        var dx = e.clientX - fx0;
        if (Math.abs(dx) > 40) { fSwiped = true; fGo(dx < 0 ? fCur + 1 : fCur - 1); }
      });
      fStage.addEventListener('pointercancel', function () { fDown = false; });
      fStage.addEventListener('click', function () { if (fSwiped) { fSwiped = false; return; } fGo(fCur + 1); });
    }
    flow.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); fGo(fCur + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); fGo(fCur - 1); }
    });
    var fPause = function (on) { flow.classList.toggle('is-paused', !!on); };
    var fHover = false, fOut = false;
    flow.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { fHover = true; fPause(true); } });
    flow.addEventListener('pointerleave', function () { fHover = false; fPause(fOut || document.hidden); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { fOut = !en[0].isIntersecting; fPause(fHover || fOut || document.hidden); }).observe(flow);
    document.addEventListener('visibilitychange', function () { fPause(fHover || fOut || document.hidden); });
    /* Startzustand erst setzen, wenn der Abschnitt eingeblendet ist, damit der erste Balken nicht unsichtbar abläuft */
    fPause(true);
    if ('IntersectionObserver' in window) {
      var fFirst = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { fOut = false; fPause(fHover); fFirst.disconnect(); } }, { threshold: 0.3 });
      fFirst.observe(flow);
    } else fPause(false);
  }

  /* ---- Touren: Klick lädt den Rundgang im Fenster ---- */
  var tourGrid = document.getElementById('tourGrid');
  if (tourGrid) {
    var toastTimer;
    var showToast = function () {
      var toast = document.getElementById('toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.setAttribute('role', 'status');
        toast.textContent = 'Link kopiert';
        toast.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(20px);background:#0A0A0A;color:#fff;padding:12px 22px;border-radius:999px;font-size:14px;font-weight:600;box-shadow:0 10px 30px rgba(0,0,0,.25);opacity:0;pointer-events:none;transition:opacity .3s,transform .3s;z-index:950';
        document.body.appendChild(toast);
      }
      requestAnimationFrame(function () { toast.style.opacity = '1'; toast.style.transform = 'translateX(-50%) translateY(0)'; });
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.style.opacity = '0'; toast.style.transform = 'translateX(-50%) translateY(20px)'; }, 1800);
    };
    var copyLink = function (url) {
      var fallback = function () {
        var ta = document.createElement('textarea');
        ta.value = url; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        ta.remove(); showToast();
      };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(showToast).catch(fallback);
      else fallback();
    };
    var openTour = function (tour) {
      if (tour.classList.contains('is-open')) return;
      var win = tour.querySelector('.tour__window');
      tour.classList.add('is-open');
      win.removeAttribute('role'); win.removeAttribute('tabindex');
      hideCursor();
      var spin = document.createElement('div');
      spin.className = 'spinner';
      win.appendChild(spin);
      var f = document.createElement('iframe');
      f.src = EMBED + tour.dataset.m + '&play=1';
      f.title = 'Virtuelle Tour: ' + (win.dataset.title || '');
      f.allow = 'autoplay; fullscreen; web-share; xr-spatial-tracking;';
      f.allowFullscreen = true;
      f.addEventListener('load', function () { spin.remove(); });
      win.appendChild(f);
      window.scrollToCenter(tour);
    };
    var closeTour = function (tour) {
      var win = tour.querySelector('.tour__window');
      tour.classList.remove('is-open');
      win.querySelectorAll('iframe,.spinner').forEach(function (el) { el.remove(); });
      win.setAttribute('role', 'button'); win.setAttribute('tabindex', '0');
      win.focus();
    };
    tourGrid.querySelectorAll('.tour').forEach(function (tour) {
      var win = tour.querySelector('.tour__window');
      win.addEventListener('click', function () { openTour(tour); });
      win.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openTour(tour); }
      });
      var cl = tour.querySelector('.close'); if (cl) cl.addEventListener('click', function () { closeTour(tour); });
      var cp = tour.querySelector('.copy'); if (cp) cp.addEventListener('click', function (e) { copyLink(e.currentTarget.dataset.url); });
    });

    /* ---- Cursor-Label "Tour starten": nur Desktop mit Maus, nie bei reduzierter Bewegung ---- */
    var label = null, lx = 0, ly = 0, tx = 0, ty = 0, raf = 0, over = false;
    var loop = function () {
      lx += (tx - lx) * 0.18; ly += (ty - ly) * 0.18;
      label.style.transform = 'translate3d(' + (lx + 18).toFixed(1) + 'px,' + (ly + 18).toFixed(1) + 'px,0)';
      if (over || Math.abs(tx - lx) > 0.3 || Math.abs(ty - ly) > 0.3) raf = requestAnimationFrame(loop); else raf = 0;
    };
    var hideCursor = function () { over = false; if (label) label.classList.remove('is-on'); };
    if (finePointer && !reduce) {
      label = document.createElement('div');
      label.className = 'cursor-label';
      label.setAttribute('aria-hidden', 'true');
      label.textContent = 'Tour starten';
      document.body.appendChild(label);
      tourGrid.querySelectorAll('.tour__window').forEach(function (win) {
        win.addEventListener('mouseenter', function (e) {
          if (win.parentNode.classList.contains('is-open')) return;
          tx = lx = e.clientX; ty = ly = e.clientY;
          over = true; label.classList.add('is-on');
          if (!raf) raf = requestAnimationFrame(loop);
        });
        win.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(loop); }, { passive: true });
        win.addEventListener('mouseleave', hideCursor);
      });
    }
  }

  /* ---- FAQ: weiches Öffnen per grid-template-rows (details bleibt zugänglich) ---- */
  document.querySelectorAll('.faq details').forEach(function (d) {
    var sum = d.querySelector('summary');
    if (!sum || !d.querySelector('.faq__a')) return;
    if (d.open) d.classList.add('is-open');
    var closeTimer;
    sum.addEventListener('click', function (e) {
      e.preventDefault();
      clearTimeout(closeTimer);
      if (d.classList.contains('is-open')) {
        d.classList.remove('is-open');
        closeTimer = setTimeout(function () { d.removeAttribute('open'); }, reduce ? 0 : 320);
      } else {
        d.setAttribute('open', '');
        requestAnimationFrame(function () { requestAnimationFrame(function () { d.classList.add('is-open'); }); });
      }
    });
  });
  /* =====================================================================
     Bogen-Karussell im Hero (Prototyp): Tour-Poster auf einem Zylinder.
     Ziehen mit Schwung, horizontales Mausrad, Pfeiltasten, langsamer Autolauf.
     Tipp oder Klick auf eine Karte öffnet die Tour im Hero-Medium. Bei reduzierter
     Bewegung bleibt es eine flache, scrollbare Reihe (nur CSS).
     ===================================================================== */
  var arc = document.querySelector('.arc');
  if (arc) {
    var ring = arc.querySelector('.arc__ring');
    var cards = Array.prototype.slice.call(ring.children);
    var stage = arc.closest('.arc-stage');
    var N = cards.length, step = 360 / N;
    var rot = 0, vel = 0, cw = 400, degPerPx = 0.1, dragging = false, lastX = 0, moved = 0, pauseUntil = 0, hover = false, inView = true, rafId = 0;
    var downCard = null, suppressClick = false;
    var AUTO = 0.035; // Grad pro Frame, etwa 2 Grad pro Sekunde

    var openCard = function (c) {
      if (!heroCard || !heroFrame || !stage) return;
      var id = c.dataset.m, name = c.dataset.title || '';
      heroCard.dataset.m = id; heroFrame.dataset.title = name;
      heroFrame.setAttribute('aria-label', 'Virtuelle Tour ' + name + ' starten');
      var src = heroFrame.querySelector('picture source'), img = heroFrame.querySelector('img'), cimg = c.querySelector('img');
      /* 960er-Poster gibt es für jede Tour, 1280 nur für Hero-Touren */
      if (src) src.srcset = 'images/tours/' + id + '-960.webp';
      if (img) { img.src = 'images/tours/' + id + '-960.jpg'; if (cimg) img.alt = cimg.alt; }
      stage.classList.add('is-open');
      heroFrame.click();
      if (window.scrollToCenter) window.scrollToCenter(heroCard);
    };

    var measure = function () {
      cw = parseFloat(getComputedStyle(cards[0]).width) || 400;
      var radius = ((cw * 1.08) / 2) / Math.tan(Math.PI / N);
      degPerPx = step / cw;
      ring.style.setProperty('--rz', radius.toFixed(1) + 'px'); // Ring nach hinten, Frontkarte steht in Originalgröße
      cards.forEach(function (c, i) { c.style.setProperty('--a', (i * step) + 'deg'); c.style.setProperty('--rz', radius.toFixed(1) + 'px'); });
    };
    var paint = function () {
      ring.style.setProperty('--rot', rot.toFixed(3) + 'deg');
      cards.forEach(function (c, i) {
        var a = ((i * step + rot) % 360 + 540) % 360 - 180; // -180..180, 0 = vorne
        var abs = Math.abs(a);
        var dim = Math.min(1, Math.max(0, (abs - 22) / 68));
        c.style.setProperty('--dim', dim.toFixed(3));
        c.style.setProperty('--back', abs > 90 ? '1' : '0'); // Rückseite: kleiner, gedimmt, ohne Chip und Play
        var hidden = abs > 90;
        c.setAttribute('aria-hidden', hidden ? 'true' : 'false');
        c.tabIndex = hidden ? -1 : 0;
      });
    };
    var tick = function () {
      if (!dragging) {
        if (!hover && performance.now() > pauseUntil) rot -= AUTO;
        rot += vel; vel *= 0.93;
        if (Math.abs(vel) < 0.002) vel = 0;
      }
      paint();
      rafId = inView ? requestAnimationFrame(tick) : 0;
    };
    var start = function () { if (!rafId && !reduce) rafId = requestAnimationFrame(tick); };

    if (!reduce) {
      measure(); paint(); start();
      window.addEventListener('resize', function () { measure(); paint(); });
      if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { inView = en[0].isIntersecting; if (inView) start(); }).observe(arc);

      arc.addEventListener('pointerenter', function () { hover = true; });
      arc.addEventListener('pointerleave', function () { hover = false; });

      /* Ziehen: Bewegung und Loslassen am Fenster verfolgen, damit auch außerhalb weitergezogen wird.
         Kein setPointerCapture, sonst käme der Klick nie bei der Karte an. */
      var onMove = function (e) {
        if (!dragging) return;
        var dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx);
        rot += dx * degPerPx; vel = dx * degPerPx * 0.9;
      };
      var onUp = function (e) {
        if (!dragging) return;
        dragging = false; arc.classList.remove('is-dragging');
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        pauseUntil = performance.now() + 5000;
        if (e.type === 'pointerup' && moved <= 6 && downCard && downCard.getAttribute('aria-hidden') !== 'true') {
          suppressClick = true; openCard(downCard);
          setTimeout(function () { suppressClick = false; }, 0);
        }
        downCard = null;
      };
      arc.addEventListener('pointerdown', function (e) {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        dragging = true; moved = 0; vel = 0; lastX = e.clientX;
        downCard = e.target.closest ? e.target.closest('.arc__card') : null;
        arc.classList.add('is-dragging');
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
      });
      arc.addEventListener('dragstart', function (e) { e.preventDefault(); });
      arc.addEventListener('wheel', function (e) {
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // vertikal scrollt die Seite
        e.preventDefault();
        rot -= e.deltaX * degPerPx * 0.6; vel = 0;
        pauseUntil = performance.now() + 5000;
      }, { passive: false });
      arc.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        rot += e.key === 'ArrowLeft' ? step : -step; vel = 0;
        pauseUntil = performance.now() + 8000;
      });
    }

    /* Klick per Tastatur (Enter, Leertaste) oder ohne Bewegungssystem */
    cards.forEach(function (c) {
      c.addEventListener('click', function (e) {
        if (suppressClick || moved > 6) { e.preventDefault(); return; }
        openCard(c);
      });
    });
    var arcClose = document.getElementById('heroClose');
    if (arcClose && stage) arcClose.addEventListener('click', function () { stage.classList.remove('is-open'); pauseUntil = performance.now() + 3000; });
  }
})();
