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
  { id:"7CpYpsEXAhs", title:"Die MachBar Lübeck – Workshops, Tagungen & Teamevents", cat:"event" },
  { id:"1kCCq3heNPJ", title:"StrandPauli – Winter", cat:"event" },
  { id:"m52qjE1sm2e", title:"Vecchio Amore – Italienischer Flair für Ihre Veranstaltung", cat:"event" },
  { id:"HMV7RcycNR2", title:"DECK 10 – Über den Dächern Hamburgs", cat:"event" },
  { id:"R2wMMZ31NfV", title:"Eventlocation ElbHof – Hamburg HafenCity", cat:"event" },
  { id:"qDN2mxB522G", title:"Tunici Team – Hotel & Eventlocation Hamburg", cat:"event" },
  // Gastronomie & Cafés
  { id:"NsvWLbUKDEX", title:"Restaurant Caspari", cat:"gastro" },
  { id:"uDdPTJRfy2R", title:"Doro Ristorante – Italienisches Restaurant", cat:"gastro" },
  { id:"e43gx9VXfzg", title:"Tandoori Flame – Indisches Restaurant Winterhude", cat:"gastro" },
  { id:"C6A8Zt3dq5K", title:"New City Smash Burger – Hamburg", cat:"gastro" },
  { id:"yQSGoSj83NT", title:"Restaurant Aspera", cat:"gastro" },
  { id:"d6EKByVzyrT", title:"Golden Bean Winterhude – Café in der Gertigstraße", cat:"gastro" },
  // Sport & Freizeit
  { id:"t4sME6NCR3Y", title:"WE ARE PADEL – Berlin", cat:"sport" },
  { id:"MbKADxZgAGB", title:"Caprice Fitness Club", cat:"sport" },
  { id:"W76rohTnCso", title:"Flipperwelten Bad Schwartau", cat:"sport" },
  { id:"Wm9g9K5ebNR", title:"Flipperhalle – Berlin", cat:"sport" },
  // Gewerbe & Wohnen
  { id:"jW4ha2PrbZB", title:"DEVK Versicherung Völklingen – Christoph Horbach", cat:"gewerbe" },
  { id:"vq4xfBEHq3V", title:"DEVK Versicherungen – Torsten Schalber", cat:"gewerbe" },
  { id:"KNbB5EPAmre", title:"Wohnungseinheit Lessingstraße 7, Hamburg", cat:"gewerbe" },
];

/* Vom Sortiermodus (sort-mode.js) gespeicherte Reihenfolge als Vorschau anwenden.
   Wirkt nur im Browser des Betreibers – für alle Besucher wird die Reihenfolge
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
  { file:"images/Vecchio-Amore-Italienischer-Flair-fur-Ihre-Veranstaltung-01092026_104936.jpg", full:"images/full/Vecchio-Amore-Italienischer-Flair-fur-Ihre-Veranstaltung-01092026_104936.jpg", title:"Vecchio Amore – Festsaal & Eventfläche" },
  { file:"images/Vecchio-Amore-Italienischer-Flair-fur-Ihre-Veranstaltung-01092026_110048.jpg", full:"images/full/Vecchio-Amore-Italienischer-Flair-fur-Ihre-Veranstaltung-01092026_110048.jpg", title:"Vecchio Amore – Terrasse an der Speicherstadt" },
  { file:"images/Living-Room-2.jpg", full:"images/full/Living-Room-2.jpg", title:"Living Room – Restaurant & Eventfläche" },
  { file:"images/New-City-Smash-Burger-Hamburg--12052024_121200.jpg", full:"images/full/New-City-Smash-Burger-Hamburg--12052024_121200.jpg", title:"New City Smash Burger – Hamburg" },
  { file:"images/Golden-Bean-Winterhude-Dein-Cafe-in-der-Gertigstrae-04142026_155150.jpg", full:"images/full/Golden-Bean-Winterhude-Dein-Cafe-in-der-Gertigstrae-04142026_155150.jpg", title:"Golden Bean Winterhude – Café" },
  { file:"images/Golden-Bean-Eimsbuttel-Kaffee-Geback-Barista-Kurse-04102026_130046.jpg", full:"images/full/Golden-Bean-Eimsbuttel-Kaffee-Geback-Barista-Kurse-04102026_130046.jpg", title:"Golden Bean Eimsbüttel – Barista-Kurse" },
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
function thumbUrl(id){ return 'https://my.matterport.com/api/v1/player/models/' + id + '/thumb?width=960&dpr=1&disable=upscale'; }

const DEFAULT_OPEN = false;

function makeCard(t){
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.id = t.id;
  card.innerHTML = `
    <div class="frame" role="button" tabindex="0" aria-label="Tour starten: ${t.title}">
      <img class="thumb" src="${thumbUrl(t.id)}" alt="Vorschau der virtuellen Tour: ${t.title}" loading="lazy"
           onerror="this.style.display='none'">
      <div class="scrim"></div>
      <div class="play">
        <div class="btn-play">${ICON_PLAY}</div>
        <span class="label">Tour starten</span>
      </div>
    </div>
    <div class="meta">
      <div>
        <h4>${t.title}</h4>
        <div class="sub">Virtueller Rundgang</div>
      </div>
      <div class="actions">
        <a class="iconbtn" href="${tourUrl(t.id)}" target="_blank" rel="noopener" title="In neuem Tab öffnen" aria-label="In neuem Tab öffnen">${ICON_OPEN}</a>
        <button class="iconbtn copy" title="Tour-Link kopieren" aria-label="Tour-Link kopieren" data-url="${tourUrl(t.id)}">${ICON_LINK}</button>
        <button class="iconbtn close" title="Tour schließen" aria-label="Tour schließen">${ICON_CLOSE}</button>
      </div>
    </div>`;
  const frame = card.querySelector('.frame');
  frame.addEventListener('click', () => openTour(card, t));
  frame.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openTour(card, t);} });
  card.querySelector('.close').addEventListener('click', () => closeTour(card));
  card.querySelector('.copy').addEventListener('click', e => copyLink(e.currentTarget.dataset.url));
  return card;
}

function addCategory(label, items, forceOpen){
  const sec = document.createElement('section');
  sec.className = 'cat' + ((forceOpen || DEFAULT_OPEN) ? '' : ' collapsed');

  const head = document.createElement('button');
  head.className = 'cat-head';
  head.setAttribute('aria-expanded', sec.classList.contains('collapsed') ? 'false' : 'true');
  head.innerHTML = `${ICON_CHEV}<h3>${label}</h3><span class="cnt">${items.length}</span><span class="line"></span>`;

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
    if(items.length) addCategory(c.label, items);
  });
  const rest = list.filter(t => !CATEGORIES.some(c => c.key === t.cat));
  if(rest.length) addCategory('Weitere Touren', rest);
}

function openTour(card, t){
  if(card.classList.contains('is-open')) return;
  const frame = card.querySelector('.frame');
  card.classList.add('is-open');
  frame.querySelector('.play').style.display = 'none';
  const spin = document.createElement('div');
  spin.className = 'spinner';
  frame.appendChild(spin);
  const iframe = document.createElement('iframe');
  iframe.src = tourUrl(t.id) + '&play=1';
  iframe.title = 'Virtuelle Tour: ' + t.title;
  iframe.allow = 'autoplay; fullscreen; web-share; xr-spatial-tracking;';
  iframe.allowFullscreen = true;
  iframe.loading = 'lazy';
  iframe.addEventListener('load', () => spin.remove());
  frame.appendChild(iframe);
  card.scrollIntoView({behavior:'smooth', block:'center'});
}

function closeTour(card){
  const frame = card.querySelector('.frame');
  card.classList.remove('is-open');
  frame.querySelectorAll('iframe,.spinner').forEach(el => el.remove());
  frame.querySelector('.play').style.display = '';
}

function copyLink(url){
  navigator.clipboard?.writeText(url).then(showToast).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = url; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); ta.remove(); showToast();
  });
}
let toastTimer;
function showToast(){
  let toast = document.getElementById('toast');
  if(!toast){
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.textContent = 'Link kopiert';
    toast.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(20px);background:#4E7B53;color:#fff;padding:11px 20px;border-radius:999px;font-size:14px;font-weight:600;box-shadow:0 10px 40px rgba(22,36,46,.18);opacity:0;pointer-events:none;transition:all .25s;z-index:300';
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
const ICON_ZOOM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/></svg>';
let lbIndex = 0;

function renderGallery(){
  galleryEl.innerHTML = '';
  GALLERY.forEach((g, i) => {
    const el = document.createElement('div');
    el.className = 'shot';
    el.innerHTML = `
      <img src="${g.file}" alt="4K-Foto aus virtueller Tour: ${g.title}" loading="lazy">
      <span class="tag badge-4k">4K</span>
      <div class="overlay">
        <span class="name">${g.title}</span>
        <span class="zoom">${ICON_ZOOM}</span>
      </div>`;
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
}
function closeLightbox(){
  lightbox.classList.remove('show');
  lightbox.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
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
