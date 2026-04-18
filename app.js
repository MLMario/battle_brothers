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
