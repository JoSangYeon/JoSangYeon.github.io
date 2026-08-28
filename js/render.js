/* ---------------------------------------------------------------------
   Renders the JSON in data/ into the section shells in index.html.
   No build step, no dependencies. To add a publication, edit
   data/publications.json — nothing here needs to change.
   --------------------------------------------------------------------- */

const ME = 'Sangyeon Cho';

/* key: [label, colour slot 1–8].  Add a line here and the tag just works —
   the slots live in css/style.css, so no CSS edit is needed. Any tag used in
   publications.json but missing here falls back to its raw key and slot 8. */
const TAGS = {
  multimodal: ['Multimodal',             1],
  audio:      ['Audio',                  5],
  kd:         ['Knowledge Distillation', 2],
  nlp:        ['NLP',                    3],
  medical:    ['Medical AI',             4],
};

const tagOf = (key) => TAGS[key] || [key, 8];

const $ = (sel) => document.querySelector(sel);

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* bold my own name wherever it appears in an author string */
const boldMe = (authors) =>
  esc(authors).split(ME).join(`<strong>${ME}</strong>`);

const linkChips = (links = []) => links
  .map((l) => `<a class="paper-link" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} &#8599;</a>`)
  .join('');

const bullets = (items = []) => items.length
  ? `<ul>${items.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`
  : '';

/* ------------------------------ news ------------------------------ */
function renderNews(items) {
  $('#news-list').innerHTML = items.map((n) => `
    <div class="news-row">
      <div class="news-date">${esc(n.date).replace('.', ' / ')}</div>
      <div class="news-body">${n.html}</div>
    </div>`).join('');
}

/* -------------------------- publications -------------------------- */
let PUBS = [];

function renderPubs(filter = 'all') {
  const shown = filter === 'all' ? PUBS : PUBS.filter((p) => p.tags.includes(filter));
  const years = [...new Set(shown.map((p) => p.year))].sort((a, b) => b - a);

  $('#pub-list').innerHTML = years.map((y) => `
    <h3 class="year-marker">${y}</h3>
    ${shown.filter((p) => p.year === y).map((p) => `
      <div class="pub-row">
        <div class="pub-id">${esc(p.id)}</div>
        <div class="pub-main">
          <div class="pub-title">${esc(p.title)}</div>
          <div class="pub-authors">${boldMe(p.authors)}</div>
          <div class="pub-venue">${esc(p.venue)}, ${p.year}</div>
          <div class="pub-meta">
            ${p.tags.map((t) => { const [label, slot] = tagOf(t);
              return `<span class="tag tag-c${slot}">${esc(label)}</span>`; }).join('')}
            ${linkChips(p.links)}
          </div>
        </div>
      </div>`).join('')}`).join('');
}

function renderPubFilters() {
  const used = ['all', ...Object.keys(TAGS).filter((t) => PUBS.some((p) => p.tags.includes(t)))];
  $('#pub-filters').innerHTML = used
    .map((t) => `<button data-filter="${t}"${t === 'all' ? ' class="active"' : ''}>${t === 'all' ? 'All' : esc(tagOf(t)[0])}</button>`)
    .join('');

  $('#pub-filters').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    $('#pub-filters .active')?.classList.remove('active');
    btn.classList.add('active');
    renderPubs(btn.dataset.filter);
  });
}

/* --------------------- experience & projects ---------------------- */
function renderExperience(items) {
  $('#experience-list').innerHTML = items.map((e) => `
    <div class="entry">
      <div class="entry-head">
        <div>
          <div class="entry-title">${esc(e.org)}</div>
          <div class="entry-sub">${esc(e.role)}${e.location ? ` &middot; ${esc(e.location)}` : ''}</div>
        </div>
        <div class="entry-period">${esc(e.period)}</div>
      </div>
      ${bullets(e.bullets)}
      ${e.links?.length ? `<div class="entry-meta">${linkChips(e.links)}</div>` : ''}
    </div>`).join('');
}

function renderProjects(items) {
  $('#projects-list').innerHTML = items.map((p) => `
    <div class="entry">
      <div class="entry-head">
        <div class="entry-title">${esc(p.title)}</div>
        <div class="entry-period">${esc(p.period)}</div>
      </div>
      ${bullets(p.bullets)}
      <div class="entry-meta">
        ${(p.stack || []).map((s) => `<span class="chip">${esc(s)}</span>`).join('')}
        ${linkChips(p.links)}
      </div>
    </div>`).join('');
}

/* ---------------------- awards & honors --------------------------- */
function renderAwards(data) {
  const rows = (list) => list.map((a) => `
    <div class="list-row">
      <div class="list-date">${esc(a.date)}</div>
      <div class="list-body">${esc(a.title)} <span class="detail">&mdash; ${esc(a.detail)}</span></div>
    </div>`).join('');

  $('#awards-list').innerHTML =
    `<div class="subhead">Awards</div>${rows(data.awards)}` +
    `<div class="subhead">Honors</div>${rows(data.honors)}`;
}

/* ------------------------------ boot ------------------------------ */
async function load(name) {
  const res = await fetch(`data/${name}.json`, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`${name}.json: HTTP ${res.status}`);
  return res.json();
}

(async function init() {
  try {
    const [news, pubs, exp, proj, awards] = await Promise.all(
      ['news', 'publications', 'experience', 'projects', 'awards'].map(load)
    );
    PUBS = pubs;
    renderNews(news);
    renderPubFilters();
    renderPubs();
    renderExperience(exp);
    renderProjects(proj);
    renderAwards(awards);
  } catch (err) {
    console.error(err);
    document.querySelectorAll('.js-target').forEach((el) => {
      el.innerHTML = `<div class="data-error">
        Could not load <code>data/*.json</code> (${esc(err.message)}).<br>
        Opening this file directly with <code>file://</code> blocks <code>fetch()</code>.
        Serve it instead: <code>python3 -m http.server 8000</code>, then open
        <code>http://localhost:8000</code>.
      </div>`;
    });
  }
})();

/* --------------------------- theme toggle -------------------------- */
(function theme() {
  const root = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  const SUN = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.2 4.2l1.5 1.5M18.3 18.3l1.5 1.5M2 12h2M20 12h2M4.2 19.8l1.5-1.5M18.3 5.7l1.5-1.5"/></svg>';
  const MOON = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8.2 8.2 0 0 1 9.5 4a8.3 8.3 0 1 0 10.5 10.5z"/></svg>';

  /* show the icon for the theme the click will switch TO */
  const isDarkNow = () => root.getAttribute('data-theme') === 'dark'
    || (!root.hasAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);

  const apply = (t) => {
    if (t) root.setAttribute('data-theme', t); else root.removeAttribute('data-theme');
    btn.innerHTML = isDarkNow() ? SUN : MOON;
  };
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (_) {}
  apply(saved);
  btn.addEventListener('click', () => {
    const next = isDarkNow() ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem('theme', next); } catch (_) {}
  });
})();
