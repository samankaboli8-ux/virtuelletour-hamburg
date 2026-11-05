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
      f.title = 'Virtuelle Tour: StrandPauli Hamburg';
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

  /* ---- Festpreis-Leiste: Preis folgt der Fläche, Link trägt die Auswahl ---- */
  var pricebar = document.getElementById('pricebar');
  if (pricebar) {
    var selB = document.getElementById('pb-branche');
    var selF = document.getElementById('pb-flaeche');
    var out = document.getElementById('pb-price');
    var cta = document.getElementById('pb-cta');
    var PRICES = { '80': '430 €', '150': '540 €', '250': '690 €', '350': '810 €', '500': '950 €', 'ueber500': 'auf Anfrage' };
    var updatePricebar = function (animate) {
      out.textContent = PRICES[selF.value] || 'auf Anfrage';
      cta.href = 'kontakt.html?branche=' + encodeURIComponent(selB.value) + '&flaeche=' + encodeURIComponent(selF.value) + '#anfrage';
      if (animate && !reduce) {
        out.classList.remove('is-changing');
        void out.offsetWidth;
        out.classList.add('is-changing');
      }
    };
    selB.addEventListener('change', function () { updatePricebar(false); });
    selF.addEventListener('change', function () { updatePricebar(true); });
    updatePricebar(false);
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
})();
