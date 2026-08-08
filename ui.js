/* eslint-env browser */
// The interface. Deliberately a plain script rather than a module, so the build
// can inline it into a single self-contained file alongside the engine.
// Everything it needs arrives through `api`.

window.mountApp = function mountApp(api) {
  const $ = (sel) => document.querySelector(sel);

  const input = $('#name-input');
  const suggestBox = $('#suggest');
  const results = $('#results');
  const meta = $('#result-meta');
  const controls = $('#controls');
  const searchbar = $('.searchbar');

  let current = null; // { name, entry }
  let round = 0;
  let filter = 'all';

  const FILTERS = {
    all: { label: 'Everything', opts: {} },
    wordplay: { label: 'Name puns', opts: { categories: ['pun', 'wordplay'] } },
    playful: { label: 'Playful', opts: { categories: ['playful'] } },
    question: { label: 'Ask something', opts: { categories: ['question'] } },
    lowkey: { label: 'Low cheese', opts: { maxCheese: 1 } },
  };

  const CATEGORY_LABEL = {
    pun: 'pun', wordplay: 'wordplay', playful: 'playful',
    question: 'question', sincere: 'sincere', data: 'stats',
  };

  $('#stat-total').textContent = api.TOTAL.toLocaleString();

  const genderWord = (g) => (g === 'f' ? 'girls’ name' : g === 'm' ? 'boys’ name' : 'unisex');

  const escapeHtml = (s) =>
    s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Mark every occurrence of the name. Splitting on the RAW text and escaping the
  // pieces afterwards keeps names with an apostrophe working — escaping first
  // would turn O'Brien into O&#39;Brien and the match would never land.
  function highlight(text, name) {
    if (!name) return escapeHtml(text);
    const parts = text.split(name);
    return parts.map(escapeHtml).join(`<mark>${escapeHtml(name)}</mark>`);
  }

  // --- type-ahead ------------------------------------------------------------
  let hits = [];
  let cursor = -1;

  function renderSuggestions() {
    if (!hits.length) {
      suggestBox.hidden = true;
      suggestBox.innerHTML = '';
      input.setAttribute('aria-expanded', 'false');
      return;
    }
    suggestBox.innerHTML = hits
      .map((h, i) => `
        <li role="option" aria-selected="${i === cursor}" class="${i === cursor ? 'on' : ''}" data-name="${h.name}">
          <span class="s-name">${escapeHtml(h.name)}</span>
          <span class="s-meta">${genderWord(h.gender)} · #${h.rank}</span>
        </li>`)
      .join('');
    suggestBox.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  input.addEventListener('input', () => {
    hits = api.search(input.value, 8);
    cursor = hits.length ? 0 : -1;
    renderSuggestions();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!hits.length) return;
      e.preventDefault();
      cursor = (cursor + (e.key === 'ArrowDown' ? 1 : hits.length - 1)) % hits.length;
      renderSuggestions();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // A name nobody has heard of is still a valid search — several families
      // need nothing but the letters.
      show(cursor >= 0 && hits[cursor] ? hits[cursor].name : input.value);
      input.blur(); // drops the phone keyboard so the results are visible
    } else if (e.key === 'Escape') {
      suggestBox.hidden = true;
    }
  });

  suggestBox.addEventListener('mousedown', (e) => {
    const li = e.target.closest('li[data-name]');
    if (li) { e.preventDefault(); show(li.dataset.name); input.blur(); }
  });

  document.addEventListener('click', (e) => {
    if (!suggestBox.contains(e.target) && e.target !== input) renderSuggestionsClosed();
  });

  function renderSuggestionsClosed() {
    hits = [];
    renderSuggestions();
  }

  $('#surprise').addEventListener('click', () => {
    const all = api.ALL_NAMES;
    show(all[Math.floor(Math.random() * all.length)].name);
  });

  // --- rendering -------------------------------------------------------------
  function show(rawName, keepRound) {
    const name = api.normalizeName(rawName);
    if (!name) return;
    if (!keepRound) round = 0;
    current = { name, entry: api.lookup(name) };
    input.value = name;
    renderSuggestionsClosed();
    render();
  }

  function render() {
    if (!current) return;
    const { name, entry } = current;
    const out = api.linesFor(name, entry || {}, { round, ...FILTERS[filter].opts });

    meta.innerHTML = entry
      ? `<strong>${escapeHtml(name)}</strong><span class="stat">${genderWord(entry.gender)} · about #${entry.rank} in America</span>`
      : `<strong>${escapeHtml(name)}</strong><span class="stat">not in the top 2,000 — built from the letters</span>`;

    controls.hidden = false;

    if (!out.lines.length) {
      results.innerHTML = `<p class="empty">No lines survive that filter for ${escapeHtml(name)}. Try “Everything”.</p>`;
      return;
    }

    results.innerHTML = out.lines
      .map((line, i) => `
        <article class="line">
          <div class="line-head">
            <span>${i + 1}</span>
            <span class="chip-${line.category}">${CATEGORY_LABEL[line.category]}</span>
            <span class="cheese" title="Cheese level ${line.cheese} of 3">${'●'.repeat(line.cheese) + '○'.repeat(Math.max(0, 3 - line.cheese))}</span>
          </div>
          <p class="text">${highlight(line.text, name)}</p>
          <button class="copy" data-idx="${i}" type="button">Copy</button>
        </article>`)
      .join('');

    results.querySelectorAll('.copy').forEach((btn) => {
      btn.addEventListener('click', () => copy(out.lines[Number(btn.dataset.idx)].text, btn));
    });
  }

  async function copy(text, btn) {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      // The async clipboard needs a secure context, which file:// is not — fall
      // back so the offline single-file build still copies.
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '0';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length); // iOS ignores select() on its own
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      ta.remove();
    }
    const was = btn.textContent;
    btn.textContent = ok ? 'Copied' : 'Press and hold the line to copy';
    btn.classList.toggle('done', ok);
    setTimeout(() => { btn.textContent = was; btn.classList.remove('done'); }, 1600);
  }

  $('#more').addEventListener('click', () => {
    round++;
    render();
  });

  // --- filter chips ----------------------------------------------------------
  const chipRow = $('#filters');
  chipRow.innerHTML = Object.entries(FILTERS)
    .map(([key, f]) => `<button type="button" class="fchip${key === 'all' ? ' on' : ''}" data-filter="${key}">${f.label}</button>`)
    .join('');
  chipRow.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    filter = btn.dataset.filter;
    round = 0;
    chipRow.querySelectorAll('.fchip').forEach((b) => b.classList.toggle('on', b === btn));
    render();
  });

  // The sticky search bar only earns a rule once it has something above it.
  const onScroll = () => searchbar.classList.toggle('stuck', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // A name on screen at load beats an empty box.
  show('Emma');
};
