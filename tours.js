/* =====================================================================
   Touren-Portfolio + 4K-Galerie (Referenzen-Seite)
   Touren bearbeiten: { id:"MATTERPORT_ID", title:"Name", cat:"<key>" }
   ===================================================================== */
const CATEGORIES = [
  { key:"event",   label:"Bars, Restaurants & Eventlocations" },
  { key:"gastro",  label:"Gastronomie & Cafés" },
  { key:"sport",   label:"Freizeit & Entertainment" },
  { key:"gewerbe", label:"Gewerbe & Wohnen" },
];

const TOURS = [
  // Bars, Restaurants & Eventlocations
  { id:"2JgeWuujp21", title:"StrandPauli", cat:"event" },
  { id:"7CpYpsEXAhs", title:"Die MachBar Lübeck: Workshops, Tagungen & Teamevents", cat:"event" },
  { id:"1kCCq3heNPJ", title:"StrandPauli Winter", cat:"event" },
  { id:"zgWUkeHqJUr", title:"Tunici Team, Hotel & Eventlocation Hamburg", cat:"event" },
  // Gastronomie & Cafés
  { id:"NsvWLbUKDEX", title:"Restaurant Caspari", cat:"gastro" },
  { id:"uDdPTJRfy2R", title:"Doro Ristorante, Italienisches Restaurant", cat:"gastro" },
  { id:"e43gx9VXfzg", title:"Tandoori Flame, Indisches Restaurant Winterhude", cat:"gastro" },
  { id:"C6A8Zt3dq5K", title:"New City Smash Burger Hamburg", cat:"gastro" },
  { id:"yQSGoSj83NT", title:"Restaurant Aspera", cat:"gastro" },
  { id:"d6EKByVzyrT", title:"Golden Bean Winterhude, Café in der Gertigstraße", cat:"gastro" },
  // Sport & Freizeit
  { id:"t4sME6NCR3Y", title:"WE ARE PADEL Berlin", cat:"sport" },
  { id:"MbKADxZgAGB", title:"Caprice Fitness Club", cat:"sport" },
  { id:"W76rohTnCso", title:"Flipperwelten Bad Schwartau", cat:"sport" },
  { id:"ot6rttoEU96", title:"Flipperhalle Berlin", cat:"sport" },
  // Gewerbe & Wohnen
  { id:"jW4ha2PrbZB", title:"DEVK Versicherung Völklingen, Christoph Horbach", cat:"gewerbe" },
  { id:"vq4xfBEHq3V", title:"DEVK Versicherungen, Torsten Schalber", cat:"gewerbe" },
  { id:"KNbB5EPAmre", title:"Wohnungseinheit Lessingstraße 7, Hamburg", cat:"gewerbe" },
];

/* Vom Sortiermodus (sort-mode.js) gespeicherte Reihenfolge als Vorschau anwenden.
   Wirkt nur im Browser des Betreibers, für alle Besucher wird die Reihenfolge
   erst durch Anpassen des TOURS-Arrays oben live. */
(function () {
  try {
    var saved = JSON.parse(localStorage.getItem('tourOrder') || 'null');
    if (Array.isArray(saved) && saved.length) {
      var rank = {};
      saved.forEach(function (id, i) { rank[id] = i; });
      TOURS.sort(function (a, b) {
        var ra = (a.id in rank) ? rank[a.id] : 1e9;
        var rb = (b.id in rank) ? rank[b.id] : 1e9;
        return ra - rb;
      });
    }
  } catch (e) {}
})();

/* file = schlanke Grid-Vorschau (1920px), full = echtes 4K (3840px) für die Lightbox */
const GALLERY = [
  { file:"images/Living-Room-2.jpg", full:"images/full/Living-Room-2.jpg", title:"Living Room, Restaurant & Eventfläche" },
  { file:"images/New-City-Smash-Burger-Hamburg--12052024_121200.jpg", full:"images/full/New-City-Smash-Burger-Hamburg--12052024_121200.jpg", title:"New City Smash Burger Hamburg" },
  { file:"images/Golden-Bean-Winterhude-Dein-Cafe-in-der-Gertigstrae-04142026_155150.jpg", full:"images/full/Golden-Bean-Winterhude-Dein-Cafe-in-der-Gertigstrae-04142026_155150.jpg", title:"Golden Bean Winterhude, Café" },
  { file:"images/Golden-Bean-Eimsbuttel-Kaffee-Geback-Barista-Kurse-04102026_130046.jpg", full:"images/full/Golden-Bean-Eimsbuttel-Kaffee-Geback-Barista-Kurse-04102026_130046.jpg", title:"Golden Bean Eimsbüttel, Barista-Kurse" },
  { file:"images/strandpauli-eingang.jpg", full:"images/full/strandpauli-eingang.jpg", title:"StrandPauli, Eingang" },
  { file:"images/strandpauli-strandterrasse.jpg", full:"images/full/strandpauli-strandterrasse.jpg", title:"StrandPauli, Strandterrasse an der Elbe" },
  { file:"images/machbar-kueche-lounge.jpg", full:"images/full/machbar-kueche-lounge.jpg", title:"Die MachBar Lübeck, Küche & Lounge" },
  { file:"images/machbar-workshopflaeche.jpg", full:"images/full/machbar-workshopflaeche.jpg", title:"Die MachBar Lübeck, Workshopfläche" },
  { file:"images/machbar-kreativbereich.jpg", full:"images/full/machbar-kreativbereich.jpg", title:"Die MachBar Lübeck, Kreativbereich" },
  { file:"images/caspari-terrasse.jpg", full:"images/full/caspari-terrasse.jpg", title:"Restaurant Caspari, Terrasse" },
  { file:"images/caspari-gastraum.jpg", full:"images/full/caspari-gastraum.jpg", title:"Restaurant Caspari, Gastraum" },
  { file:"images/devk-horbach-empfang.jpg", full:"images/full/devk-horbach-empfang.jpg", title:"DEVK Team Horbach, Empfang" },
  { file:"images/devk-horbach-buero-kaffeebar.jpg", full:"images/full/devk-horbach-buero-kaffeebar.jpg", title:"DEVK Team Horbach, Büro & Kaffeebar" },
  { file:"images/devk-horbach-dollhouse.jpg", full:"images/full/devk-horbach-dollhouse.jpg", title:"DEVK Team Horbach, Dollhouse-Ansicht" },

];

const grid = document.getElementById('grid');
const emptyEl = document.getElementById('empty');
const searchEl = document.getElementById('search');

const ICON_PLAY  = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
const ICON_LINK  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>';
const ICON_OPEN  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></svg>';
const ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>';
const ICON_CHEV  = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m6 9 6 6 6-6"/></svg>';

function tourUrl(id){ return 'https://my.matterport.com/show/?m=' + id; }
function thumbBase(id){ return 'images/tours/' + id; }

const DEFAULT_OPEN = false;

function makeCard(t){
  const card = document.createElement('article');
  card.className = 'tour';
  card.dataset.id = t.id;
  card.dataset.m = t.id;
  card.innerHTML = `
    <div class="tour__window" role="button" tabindex="0" aria-label="Tour starten: ${t.title}" data-title="${t.title}">
      <picture><source type="image/webp" srcset="${thumbBase(t.id)}-640.webp 640w, ${thumbBase(t.id)}-960.webp 960w" sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 400px"><img src="${thumbBase(t.id)}-960.jpg" alt="Vorschau der virtuellen Tour: ${t.title}" width="960" height="540" loading="lazy" decoding="async"></picture>
      <span class="chip chip--glass">360° Tour</span>
      <span class="play play--sm" aria-hidden="true">${ICON_PLAY}</span>
    </div>
    <div class="tour__meta">
      <div><h3>${t.title}</h3><p>${t.sub || 'Virtueller Rundgang'}</p></div>
      <div class="tour__actions">
        <a class="iconbtn" href="${tourUrl(t.id)}" target="_blank" rel="noopener" title="In neuem Tab öffnen" aria-label="Tour in neuem Tab öffnen">${ICON_OPEN}</a>
        <button type="button" class="iconbtn copy" title="Tour-Link kopieren" aria-label="Tour-Link kopieren" data-url="${tourUrl(t.id)}">${ICON_LINK}</button>
        <button type="button" class="iconbtn close" title="Tour schließen" aria-label="Tour schließen">${ICON_CLOSE}</button>
      </div>
    </div>`;
  const win = card.querySelector('.tour__window');
  win.addEventListener('click', () => openTour(card, t));
  win.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openTour(card, t);} });
  card.querySelector('.close').addEventListener('click', () => closeTour(card));
  card.querySelector('.copy').addEventListener('click', e => copyLink(e.currentTarget.dataset.url));
  return card;
}

function addCategory(label, items, forceOpen){
  const sec = document.createElement('section');
  sec.className = 'cat' + ((forceOpen || DEFAULT_OPEN) ? '' : ' collapsed');

  const head = document.createElement('button');
  head.type = 'button';
  head.className = 'cat-head';
  head.setAttribute('aria-expanded', sec.classList.contains('collapsed') ? 'false' : 'true');
  head.innerHTML = `<h2>${label}</h2><span class="cnt">${items.length} ${items.length === 1 ? 'Tour' : 'Touren'}</span>${ICON_CHEV}`;

  const body = document.createElement('div');
  body.className = 'grid';
  items.forEach(t => body.appendChild(makeCard(t)));
  if(sec.classList.contains('collapsed')) body.style.maxHeight = '0px';

  head.addEventListener('click', () => toggleCat(sec, body, head));
  sec.appendChild(head);
  sec.appendChild(body);
  grid.appendChild(sec);
}

function toggleCat(sec, body, head){
  const isOpen = !sec.classList.contains('collapsed');
  if(isOpen){
    body.style.maxHeight = body.scrollHeight + 'px';
    requestAnimationFrame(() => {
      sec.classList.add('collapsed');
      body.style.maxHeight = '0px';
    });
    head.setAttribute('aria-expanded', 'false');
  } else {
    sec.classList.remove('collapsed');
    body.style.maxHeight = body.scrollHeight + 'px';
    head.setAttribute('aria-expanded', 'true');
    body.addEventListener('transitionend', function te(e){
      if(e.propertyName === 'max-height'){
        body.style.maxHeight = 'none';
        body.removeEventListener('transitionend', te);
      }
    });
  }
}

function render(list){
  grid.innerHTML = '';
  CATEGORIES.forEach(c => {
    const items = list.filter(t => t.cat === c.key);
    if(items.length) addCategory(c.label, items, grid.children.length === 0);
  });
  const rest = list.filter(t => !CATEGORIES.some(c => c.key === t.cat));
  if(rest.length) addCategory('Weitere Touren', rest);
  const countEl = document.getElementById('tourCount');
  if(countEl) countEl.textContent = list.length + (list.length === 1 ? ' Tour' : ' Touren');
}

function openTour(card, t){
  if(card.classList.contains('is-open')) return;
  const win = card.querySelector('.tour__window');
  card.classList.add('is-open');
  win.removeAttribute('role'); win.removeAttribute('tabindex');
  const spin = document.createElement('div');
  spin.className = 'spinner';
  win.appendChild(spin);
  const iframe = document.createElement('iframe');
  iframe.src = tourUrl(t.id) + '&play=1';
  iframe.title = 'Virtuelle Tour: ' + t.title;
  iframe.allow = 'autoplay; fullscreen; web-share; xr-spatial-tracking;';
  iframe.allowFullscreen = true;
  iframe.addEventListener('load', () => spin.remove());
  win.appendChild(iframe);
  const cat = card.closest('.cat');
  if(cat){ const body = cat.querySelector('.grid'); if(body && body.style.maxHeight !== 'none') body.style.maxHeight = 'none'; }
  if(window.scrollToCenter) window.scrollToCenter(card); else card.scrollIntoView({behavior:'smooth', block:'center'});
}

function closeTour(card){
  const win = card.querySelector('.tour__window');
  card.classList.remove('is-open');
  win.querySelectorAll('iframe,.spinner').forEach(el => el.remove());
  win.setAttribute('role', 'button'); win.setAttribute('tabindex', '0');
  win.focus();
}

function copyLink(url){
  const fallback = () => {
    const ta = document.createElement('textarea');
    ta.value = url; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    ta.remove(); showToast();
  };
  if(navigator.clipboard) navigator.clipboard.writeText(url).then(showToast).catch(fallback); else fallback();
}
let toastTimer;
function showToast(){
  let toast = document.getElementById('toast');
  if(!toast){
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.setAttribute('role', 'status');
    toast.textContent = 'Link kopiert';
    toast.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(20px);background:#0A0A0A;color:#fff;padding:12px 22px;border-radius:999px;font-size:14px;font-weight:600;box-shadow:0 10px 30px rgba(0,0,0,.25);opacity:0;pointer-events:none;transition:opacity .3s,transform .3s;z-index:950';
    document.body.appendChild(toast);
  }
  requestAnimationFrame(() => { toast.style.opacity='1'; toast.style.transform='translateX(-50%) translateY(0)'; });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.style.opacity='0'; toast.style.transform='translateX(-50%) translateY(20px)'; }, 1800);
}

searchEl.addEventListener('input', () => {
  const q = searchEl.value.trim().toLowerCase();
  const filtered = TOURS.filter(t => t.title.toLowerCase().includes(q));
  render(filtered);
  emptyEl.style.display = filtered.length ? 'none' : 'block';
});

render(TOURS);

/* ===== 4K-Galerie + Lightbox ===== */
const galleryEl = document.getElementById('gallery');
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbCap = document.getElementById('lbCap');
let lbIndex = 0;

function webp(file, w){ return file.replace(/^images\//, 'images/opt/').replace(/\.(jpg|png)$/, '-' + w + '.webp'); }
function renderGallery(){
  galleryEl.innerHTML = '';
  GALLERY.forEach((g, i) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'shot';
    el.setAttribute('aria-label', '4K-Bild groß ansehen: ' + g.title);
    el.innerHTML = `
      <picture><source type="image/webp" srcset="${webp(g.file,640)} 640w, ${webp(g.file,1200)} 1200w" sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 620px"><img src="${g.file}" alt="4K-Foto aus virtueller Tour: ${g.title}" loading="lazy" decoding="async" width="1920" height="1080"></picture>
      <span class="chip chip--glass shot__tag">4K</span>
      <span class="chip chip--glass shot__name">${g.title}</span>`;
    el.addEventListener('click', () => openLightbox(i));
    galleryEl.appendChild(el);
  });
}

function openLightbox(i){
  lbIndex = i;
  lbImg.src = GALLERY[i].full || GALLERY[i].file;
  lbImg.alt = GALLERY[i].title;
  lbCap.textContent = GALLERY[i].title;
  lightbox.classList.add('show');
  lightbox.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
  if(window.lenis) window.lenis.stop();
  document.getElementById('lbClose').focus();
}
function closeLightbox(){
  lightbox.classList.remove('show');
  lightbox.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
  if(window.lenis) window.lenis.start();
}
function navLightbox(dir){
  lbIndex = (lbIndex + dir + GALLERY.length) % GALLERY.length;
  lbImg.src = GALLERY[lbIndex].full || GALLERY[lbIndex].file;
  lbImg.alt = GALLERY[lbIndex].title;
  lbCap.textContent = GALLERY[lbIndex].title;
}

document.getElementById('lbClose').addEventListener('click', closeLightbox);
document.getElementById('lbPrev').addEventListener('click', e => { e.stopPropagation(); navLightbox(-1); });
document.getElementById('lbNext').addEventListener('click', e => { e.stopPropagation(); navLightbox(1); });
lightbox.addEventListener('click', e => { if(e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if(!lightbox.classList.contains('show')) return;
  if(e.key === 'Escape') closeLightbox();
  if(e.key === 'ArrowLeft') navLightbox(-1);
  if(e.key === 'ArrowRight') navLightbox(1);
});

renderGallery();
