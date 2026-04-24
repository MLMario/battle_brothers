(function () {
  'use strict';

  // ── Module state ─────────────────────────────────────────────
  // All module state for v2.0 Search & Sort is now declared (Phases 5 + 6).
  let allBgs = [];
  let globalMin = 0;              // scalar min across all attribute averages (plan contract)
  let globalMax = 0;              // scalar max across all attribute averages (plan contract)
  let globalMinByAttr = {};       // per-attribute min (needed by Phase 2 sparklines — mockup parity)
  let globalMaxByAttr = {};       // per-attribute max (needed by Phase 2 sparklines — mockup parity)
  let openId = null;              // id of the currently-open background; null when all collapsed (P3 D-01)

  // ── Phase 5 D-19: search state (consumed by applyFilter in 05-02) ──
  let filtered = [];
  let query = '';

  // ── Phase 6 D-19: sort state (consumed by applySort + pill handler in 06-02) ──
  let sortKey = 'name';
  let sortAsc = true;

  const DATA_URL = 'data/backgrounds.json';
  const SKELETON_DELAY_MS = 150;  // D-06
  const SKELETON_ROW_COUNT = 8;   // D-05 (~8 placeholder rows)
  const ATTR_KEYS = [
    { key: 'hitpoints',     label: 'HP'  },
    { key: 'meleeSkill',    label: 'MSk' },
    { key: 'rangedSkill',   label: 'RSk' },
    { key: 'meleeDefense',  label: 'MDf' },
    { key: 'rangedDefense', label: 'RDf' },
    { key: 'fatigue',       label: 'Fat' },
    { key: 'resolve',       label: 'Res' },
    { key: 'initiative',    label: 'Ini' },
  ];

  // ── D-10: icon URL helper (prefix JSON "icons/Foo.png" with "assets/") ──
  function iconUrl(bg) {
    return 'assets/' + bg.icon;
  }

  // ── D-11: icon fallback wiring (sword emoji). Helper exists now; Phase 2 calls it. ──
  function wireIconFallback(imgEl) {
    imgEl.addEventListener('error', function onIconError() {
      const fb = document.createElement('span');
      fb.className = 'bg-icon-fallback';
      fb.textContent = '\u2694\uFE0F';  // crossed swords emoji
      imgEl.replaceWith(fb);
    });
  }

  // ── Phase 4 D-07: write "X of Y backgrounds" to #result-count ──
  function updateCount(filtered, total) {
    const el = document.getElementById('result-count');
    if (!el) return;
    el.textContent = filtered + ' of ' + total + ' backgrounds';
  }

  // ── Phase 4 D-11/D-12/D-13: toggle #empty visibility (v1 uses only the dev hook) ──
  function setEmpty(show) {
    const emptyEl = document.getElementById('empty');
    const listEl = document.getElementById('list');
    if (!emptyEl || !listEl) return;
    emptyEl.style.display = show ? 'flex' : 'none';
    listEl.style.display = show ? 'none' : '';
  }

  // Phase 4 D-12: unconditional verification hook (no DEV guard — static frontend, no build step)
  window.__setEmpty = setEmpty;

  // ── D-15: compute global min/max across all attribute averages ──
  function computeGlobalMinMax(list) {
    let minScalar = Infinity;
    let maxScalar = -Infinity;
    const minByAttr = {};
    const maxByAttr = {};
    for (const { key } of ATTR_KEYS) {
      minByAttr[key] = Infinity;
      maxByAttr[key] = -Infinity;
    }
    for (const bg of list) {
      if (!bg || !bg.attributes) continue;
      for (const { key } of ATTR_KEYS) {
        const attr = bg.attributes[key];
        if (!attr || typeof attr.average !== 'number') continue;
        const avg = attr.average;
        if (avg < minScalar) minScalar = avg;
        if (avg > maxScalar) maxScalar = avg;
        if (avg < minByAttr[key]) minByAttr[key] = avg;
        if (avg > maxByAttr[key]) maxByAttr[key] = avg;
      }
    }
    return {
      min: Number.isFinite(minScalar) ? minScalar : 0,
      max: Number.isFinite(maxScalar) ? maxScalar : 0,
      minByAttr: minByAttr,
      maxByAttr: maxByAttr
    };
  }

  // ── D-05: reusable percentile helper (consumed by sparkline + Phase 3 expanded bars) ──
  function pct(key, val) {
    const lo = globalMinByAttr[key];
    const hi = globalMaxByAttr[key];
    if (hi === lo) return 50;
    return Math.max(0, Math.min(100, ((val - lo) / (hi - lo)) * 100));
  }

  // ── D-03 / D-05: verbatim mockup red→yellow→green interpolation on 0-100 percentile ──
  function barColor(p) {
    if (p <= 50) {
      const t = p / 50;
      const r = Math.round(192 + (230 - 192) * t);
      const g = Math.round(57  + (184 - 57)  * t);
      const b = Math.round(43  + (0   - 43)  * t);
      return `rgb(${r},${g},${b})`;
    } else {
      const t = (p - 50) / 50;
      const r = Math.round(230 + (39  - 230) * t);
      const g = Math.round(184 + (174 - 184) * t);
      const b = Math.round(0   + (96  - 0)   * t);
      return `rgb(${r},${g},${b})`;
    }
  }

  // ── D-01 / D-02 / D-04: build the 8-bar sparkline for one background ──
  function makeSparkline(bg) {
    const spark = document.createElement('div');
    spark.className = 'bg-sparkline';
    ATTR_KEYS.forEach(function (entry) {
      const key = entry.key;
      const avg = (bg.attributes && bg.attributes[key] && typeof bg.attributes[key].average === 'number')
        ? bg.attributes[key].average
        : 0;
      const p = pct(key, avg);
      const bar = document.createElement('div');
      bar.className = 'spark-bar';
      const h = Math.max(2, Math.round(p * 0.16)); // max 16px at p=100
      bar.style.cssText = `height:${h}px;background:${barColor(p)};`;
      spark.appendChild(bar);
    });
    return spark;
  }

  // ── D-05 / D-06: skeleton placeholder rows matching the nested .bg-row shape (icon + main + right) ──
  function renderSkeleton() {
    const listEl = document.getElementById('list');
    if (!listEl) return;
    listEl.textContent = '';
    for (let i = 0; i < SKELETON_ROW_COUNT; i++) {
      const item = document.createElement('article');
      item.className = 'bg-item bg-skeleton';

      const row = document.createElement('div');
      row.className = 'bg-row';

      // icon slot placeholder (div — no src to resolve)
      const icon = document.createElement('div');
      icon.className = 'bg-icon';
      icon.style.opacity = '0.35';

      const main = document.createElement('div');
      main.className = 'bg-main';

      const name = document.createElement('div');
      name.className = 'bg-name';
      name.style.width = '55%';
      name.style.height = '12px';
      name.style.background = '#222';
      name.style.borderRadius = '3px';
      name.style.opacity = '0.6';
      main.appendChild(name);

      const spark = document.createElement('div');
      spark.className = 'bg-sparkline';
      main.appendChild(spark);

      const right = document.createElement('div');
      right.className = 'bg-row-right';

      const wage = document.createElement('div');
      wage.className = 'wage-badge';
      wage.style.opacity = '0.3';
      wage.textContent = '\u2014';
      right.appendChild(wage);

      const chev = document.createElement('div');
      chev.className = 'chevron';
      right.appendChild(chev);

      row.appendChild(icon);
      row.appendChild(main);
      row.appendChild(right);
      item.appendChild(row);
      listEl.appendChild(item);
    }
  }

  // ── D-07 / D-08: error state with amber Retry button ──
  function renderError() {
    const listEl = document.getElementById('list');
    if (!listEl) return;
    listEl.textContent = '';

    const wrap = document.createElement('div');
    wrap.className = 'error-state';
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.alignItems = 'center';
    wrap.style.justifyContent = 'center';
    wrap.style.gap = '12px';
    wrap.style.padding = '60px 20px';
    wrap.style.textAlign = 'center';
    wrap.style.color = 'var(--text-sec)';

    const msg = document.createElement('div');
    msg.className = 'error-state__message';
    msg.textContent = "Couldn't load backgrounds";
    msg.style.fontSize = '14px';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'retry-btn pill pill--amber';
    btn.textContent = 'Retry';
    // Inline amber fallback styling (styles.css from Plan 2 has no .retry-btn / .pill--amber rule)
    btn.style.background = 'rgba(212,168,67,0.15)';
    btn.style.border = '1px solid var(--amber)';
    btn.style.color = 'var(--amber)';
    btn.style.padding = '8px 18px';
    btn.style.borderRadius = '999px';
    btn.style.fontSize = '12px';
    btn.style.fontWeight = '600';
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', function onRetryClick() {
      load();
    });

    wrap.appendChild(msg);
    wrap.appendChild(btn);
    listEl.appendChild(wrap);
  }

  // ── Phase 3 D-15: format the .attr-levelup cell per mockup spec ──
  function formatLevelUp(cell, luMin, luMax) {
    if (luMin == null && luMax == null) {
      cell.textContent = '\u2014';  // em-dash
      return;
    }
    const luMinStr = luMin != null ? luMin : '?';
    const luMaxStr = luMax != null ? luMax : '?';
    const val = (luMin != null) ? luMin : luMax;
    if (val > 0) {
      cell.textContent = '+' + luMinStr + '/+' + luMaxStr;
      cell.classList.add('positive');
    } else if (val < 0) {
      cell.textContent = luMinStr + '/' + luMaxStr;
      cell.classList.add('negative');
    } else {
      // val === 0 (edge case: zero level-up) — no color class, show raw
      cell.textContent = luMinStr + '/' + luMaxStr;
    }
  }

  // ── Phase 3 D-12/D-13/D-14/D-15: build one .attr-row for a given attribute ──
  function buildAttrRow(bg, key, label) {
    const attr = bg.attributes && bg.attributes[key];
    if (!attr) return null;

    const rowEl = document.createElement('div');
    rowEl.className = 'attr-row';

    // label
    const labelEl = document.createElement('div');
    labelEl.className = 'attr-label';
    labelEl.textContent = label;
    rowEl.appendChild(labelEl);

    // bar wrap + fill (D-13 — reuse pct + barColor)
    const barWrap = document.createElement('div');
    barWrap.className = 'attr-bar-wrap';
    const barFill = document.createElement('div');
    barFill.className = 'attr-bar-fill';
    const avg = (typeof attr.average === 'number') ? attr.average : 0;
    const p = pct(key, avg);
    const color = barColor(p);
    barFill.style.cssText = 'width:' + p + '%;background:' + color + ';';
    barWrap.appendChild(barFill);
    rowEl.appendChild(barWrap);

    // vals (D-14 — innerHTML verbatim from mockup)
    const vals = document.createElement('div');
    vals.className = 'attr-vals';
    const rangeMin = (attr.range && attr.range.min != null) ? attr.range.min : '?';
    const rangeMax = (attr.range && attr.range.max != null) ? attr.range.max : '?';
    vals.innerHTML = '<span class="attr-avg">' + avg + '</span> '
      + '<span style="color:#555;font-size:9px">' + rangeMin + '\u2013' + rangeMax + '</span>';
    rowEl.appendChild(vals);

    // levelup (D-15)
    const lu = document.createElement('div');
    lu.className = 'attr-levelup';
    const luMin = (attr.levelUp && attr.levelUp.min !== undefined) ? attr.levelUp.min : null;
    const luMax = (attr.levelUp && attr.levelUp.max !== undefined) ? attr.levelUp.max : null;
    formatLevelUp(lu, luMin, luMax);
    rowEl.appendChild(lu);

    return rowEl;
  }

  // ── Phase 3 D-06/D-11/D-12: build the .bg-panel subtree for a background ──
  function buildPanel(bg) {
    const panel = document.createElement('div');
    panel.className = 'bg-panel';

    const inner = document.createElement('div');
    inner.className = 'bg-panel-inner';

    // D-11: two fixed-template pills via innerHTML (mockup verbatim)
    const badges = document.createElement('div');
    badges.className = 'panel-badges';
    const lvlMin = (bg.startingLevel && bg.startingLevel.min != null) ? bg.startingLevel.min : '?';
    const lvlMax = (bg.startingLevel && bg.startingLevel.max != null) ? bg.startingLevel.max : '?';
    const wage = (bg.baseWage != null) ? bg.baseWage : '?';
    badges.innerHTML = '<div class="panel-badge">Level <span>' + lvlMin + '\u2013' + lvlMax + '</span></div>'
      + '<div class="panel-badge">Wage <span>' + wage + 'g</span></div>';
    inner.appendChild(badges);

    // D-12: iterate ATTR_KEYS for 8 attribute rows
    const attrList = document.createElement('div');
    attrList.className = 'attr-list';
    ATTR_KEYS.forEach(function (entry) {
      const row = buildAttrRow(bg, entry.key, entry.label);
      if (row) attrList.appendChild(row);
    });
    inner.appendChild(attrList);

    panel.appendChild(inner);
    return panel;
  }

  // ── Phase 3 D-01/D-03/D-04/D-07: accordion toggle with measured max-height animation ──
  function toggleItem(id, item) {
    const panel = item.querySelector('.bg-panel');
    const isOpen = item.classList.contains('open');

    // Close previously-open item if it's a different one (D-04)
    if (openId && openId !== id) {
      const prev = document.querySelector('.bg-item[data-id="' + openId + '"]');
      if (prev) {
        prev.classList.remove('open');
        const prevPanel = prev.querySelector('.bg-panel');
        if (prevPanel) prevPanel.style.maxHeight = '0';
      }
    }

    if (isOpen) {
      // Collapse (D-04 — tapping same row closes)
      item.classList.remove('open');
      if (panel) panel.style.maxHeight = '0';
      openId = null;
    } else {
      // Expand: measured scrollHeight overrides base CSS max-height: 0 (D-07)
      item.classList.add('open');
      if (panel) panel.style.maxHeight = panel.scrollHeight + 'px';
      openId = id;
      // D-03: 50ms delay lets the max-height animation start before scroll begins
      setTimeout(function () {
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
  }

  // ── D-13 / D-14: build the mockup-shape nested row for a single background ──
  function buildRow(bg) {
    const item = document.createElement('article');
    item.className = 'bg-item';
    item.setAttribute('data-id', bg.id);

    const row = document.createElement('div');
    row.className = 'bg-row';

    // ── icon (D-11 lazy, D-12 no placeholder, D-13 sizing from CSS, D-14 fallback via Phase 1 helper) ──
    const img = document.createElement('img');
    img.className = 'bg-icon';
    img.loading = 'lazy';
    img.alt = bg.name;
    img.src = iconUrl(bg);
    wireIconFallback(img);
    row.appendChild(img);

    // ── center column: name + sparkline ──
    const main = document.createElement('div');
    main.className = 'bg-main';

    const name = document.createElement('div');
    name.className = 'bg-name';
    name.textContent = bg.name;
    main.appendChild(name);

    main.appendChild(makeSparkline(bg));
    row.appendChild(main);

    // ── right column: wage badge + chevron (D-06/D-07 format, D-09 static chevron, D-10 glyph) ──
    const right = document.createElement('div');
    right.className = 'bg-row-right';

    const wage = document.createElement('div');
    wage.className = 'wage-badge';
    wage.textContent = bg.baseWage + 'g';
    right.appendChild(wage);

    const chev = document.createElement('div');
    chev.className = 'chevron';
    chev.textContent = '\u25BE';  // ▾ — mockup glyph (D-10)
    right.appendChild(chev);

    row.appendChild(right);

    // Phase 3 D-05/D-16: accordion toggle via toggleItem (replaces Phase 1 plumbing stub)
    row.addEventListener('click', function onRowClick() {
      toggleItem(bg.id, item);
    });

    item.appendChild(row);

    // Phase 3 D-06: eagerly build expanded panel subtree
    item.appendChild(buildPanel(bg));

    return item;
  }

  function renderList(list) {
    const listEl = document.getElementById('list');
    if (!listEl) return;
    listEl.textContent = '';
    for (const bg of list) {
      listEl.appendChild(buildRow(bg));
    }
  }

  // ── Phase 5 D-05/D-06/D-09/D-10: filter pipeline (drives render + count + empty) ──
  function applyFilter() {
    // D-10: clear stale openId before re-render destroys/recreates DOM nodes
    openId = null;

    // D-06: case-insensitive substring match on name; empty query → cloned full list
    const q = query.toLowerCase().trim();
    filtered = q
      ? allBgs.filter(function (b) { return b.name.toLowerCase().includes(q); })
      : allBgs.slice();   // CLONE — do NOT share reference with allBgs

    // D-05: direct pipeline (Phase 6 will insert applySort() between filter and render)
    renderList(filtered);
    updateCount(filtered.length, allBgs.length);

    // D-09: empty-state rule — zero matches AND data is loaded
    setEmpty(filtered.length === 0 && allBgs.length > 0);
  }

  // ── Phase 5 D-15/D-16/D-17: __setQuery dev hook (synchronous, bypasses 180ms debounce) ──
  window.__setQuery = function __setQuery(str) {
    const searchEl = document.getElementById('search');
    const value = String(str == null ? '' : str);
    if (searchEl) searchEl.value = value;
    query = value;
    applyFilter();   // synchronous — no setTimeout
  };

  // ── Phase 5 D-07/D-13/D-14: wire #search input → debounced applyFilter ──
  function wireControls() {
    const searchEl = document.getElementById('search');
    if (!searchEl) return;   // defensive guard — matches app.js convention

    let searchTimer = null;
    searchEl.addEventListener('input', function onSearchInput() {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function onSearchDebounce() {
        query = searchEl.value;
        applyFilter();   // applyFilter handles openId = null itself (D-10)
      }, 180);
    });
    // D-13: no keyboard handlers, no change/keyup wiring — type="search" native input event covers all clear paths.
    // D-14: never set searchEl.disabled — input is always typable; applyFilter no-ops against empty allBgs.
  }

  // ── fetch + lifecycle ────────────────────────────────────────
  function load() {
    const skeletonTimer = setTimeout(renderSkeleton, SKELETON_DELAY_MS);

    fetch('data/backgrounds.json')
      .then(function (r) {
        if (!r.ok) {
          const err = new Error('HTTP ' + r.status);
          err.status = r.status;
          throw err;
        }
        return r.json();
      })
      .then(function (data) {
        clearTimeout(skeletonTimer);
        // Data shape: { meta: {...}, backgrounds: [...] }
        const list = (data && Array.isArray(data.backgrounds)) ? data.backgrounds : [];
        allBgs = list;
        const mm = computeGlobalMinMax(allBgs);
        globalMin = mm.min;
        globalMax = mm.max;
        globalMinByAttr = mm.minByAttr;
        globalMaxByAttr = mm.maxByAttr;
        wireControls();   // Phase 5 D-07/D-20: one-time #search → applyFilter wiring (DOM is live)
        applyFilter();    // Phase 5 D-07: initial render — query is '' → filtered = allBgs.slice()
      })
      .catch(function (err) {
        clearTimeout(skeletonTimer);
        console.error('[backgrounds] load failed', {
          url: DATA_URL,
          status: (err && err.status) ? err.status : 'unknown',
          error: err
        });
        renderError();
      });
  }

  // ── startup ──────────────────────────────────────────────────
  // Script is loaded with `defer`, so DOM is ready by the time this IIFE runs,
  // but guard anyway in case the script tag is moved in a future iteration.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
