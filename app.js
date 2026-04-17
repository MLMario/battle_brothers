(function () {
  'use strict';

  // ── Module state (Phase 1 scope only — D-15) ─────────────────
  // Phase 2+ state (filtered, sortKey, openId) intentionally absent.
  let allBgs = [];
  let globalMin = 0;              // scalar min across all attribute averages (plan contract)
  let globalMax = 0;              // scalar max across all attribute averages (plan contract)
  let globalMinByAttr = {};       // per-attribute min (needed by Phase 2 sparklines — mockup parity)
  let globalMaxByAttr = {};       // per-attribute max (needed by Phase 2 sparklines — mockup parity)

  const DATA_URL = 'data/backgrounds.json';
  const SKELETON_DELAY_MS = 150;  // D-06
  const SKELETON_ROW_COUNT = 8;   // D-05 (~8 placeholder rows)
  const ATTR_KEYS = [
    'hitpoints', 'meleeSkill', 'rangedSkill', 'meleeDefense',
    'rangedDefense', 'fatigue', 'resolve', 'initiative'
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

  // ── D-15: compute global min/max across all attribute averages ──
  function computeGlobalMinMax(list) {
    let minScalar = Infinity;
    let maxScalar = -Infinity;
    const minByAttr = {};
    const maxByAttr = {};
    for (const key of ATTR_KEYS) {
      minByAttr[key] = Infinity;
      maxByAttr[key] = -Infinity;
    }
    for (const bg of list) {
      if (!bg || !bg.attributes) continue;
      for (const key of ATTR_KEYS) {
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

  // ── D-05 / D-06: skeleton placeholder rows matching the five-slot .bg-row shape ──
  function renderSkeleton() {
    const listEl = document.getElementById('list');
    if (!listEl) return;
    listEl.textContent = '';
    for (let i = 0; i < SKELETON_ROW_COUNT; i++) {
      const item = document.createElement('article');
      item.className = 'bg-item bg-skeleton';

      const row = document.createElement('div');
      row.className = 'bg-row';

      const icon = document.createElement('span');
      icon.className = 'bg-icon';
      icon.style.opacity = '0.35';
      icon.style.background = '#1c1c1c';

      const name = document.createElement('span');
      name.className = 'bg-name';
      name.style.display = 'inline-block';
      name.style.width = '55%';
      name.style.height = '12px';
      name.style.background = '#222';
      name.style.borderRadius = '3px';
      name.style.opacity = '0.6';

      const spark = document.createElement('span');
      spark.className = 'bg-spark';

      const wage = document.createElement('span');
      wage.className = 'bg-wage';

      const chev = document.createElement('span');
      chev.className = 'bg-chev';

      row.appendChild(icon);
      row.appendChild(name);
      row.appendChild(spark);
      row.appendChild(wage);
      row.appendChild(chev);
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

  // ── D-13 / D-14: build the mockup's five-slot row for a single background ──
  function buildRow(bg) {
    const item = document.createElement('article');
    item.className = 'bg-item';
    item.setAttribute('data-id', bg.id);

    const row = document.createElement('div');
    row.className = 'bg-row';

    // icon slot (empty in Phase 1 — Phase 2 inserts <img> + calls wireIconFallback)
    const icon = document.createElement('span');
    icon.className = 'bg-icon';

    // name slot (populated in Phase 1)
    const name = document.createElement('span');
    name.className = 'bg-name';
    name.textContent = bg.name;

    // sparkline slot (empty in Phase 1 — Phase 2 populates 8 bars)
    const spark = document.createElement('span');
    spark.className = 'bg-spark';

    // wage slot (empty in Phase 1 — Phase 2 populates badge)
    const wage = document.createElement('span');
    wage.className = 'bg-wage';

    // chevron slot (empty in Phase 1 — Phase 2 populates)
    const chev = document.createElement('span');
    chev.className = 'bg-chev';

    row.appendChild(icon);
    row.appendChild(name);
    row.appendChild(spark);
    row.appendChild(wage);
    row.appendChild(chev);

    // D-14: plumbing-validation click handler (real accordion toggle lands in Phase 3)
    row.addEventListener('click', function onRowClick() {
      console.log('[click]', bg.id);
    });

    item.appendChild(row);
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
        renderList(allBgs);
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
