# Project Codebase and Domain Research

**Mode:** brownfield — existing code analyzed on 2026-04-24 (re-entry after v1 shipped same day)
**Researched:** 2026-04-24
**Confidence:** HIGH (code-grounded; reference implementation inspected line-by-line)

> This file is an **overwrite** of the pre-implementation CODEBASE.md drafted 2026-04-16. The previous file described a planned state; this one reflects the shipped v1 and the gap to SRCH-01/02/03.

## 1. Stack & Architecture

**Architectural style:** Zero-dependency static SPA. Single HTML entry (`index.html`) + single CSS file (`styles.css`, 442 lines) + single JS file (`app.js`, 476 lines as a strict-mode IIFE). Data loaded at runtime via `fetch('data/backgrounds.json')`. Deployed live on GitHub Pages from `main` / root at https://mlmario.github.io/battle_brothers/.

**Mobile-first viewport:** `#app { max-width: 430px; height: 100dvh; }` — all layout is a single vertical flex column, intentionally phone-sized even on desktop.

**Runtime pipeline (v1, as shipped):**
```
DOMContentLoaded
  → load()
    → setTimeout(renderSkeleton, 150ms)      // anti-flicker skeleton
    → fetch('data/backgrounds.json')
      → clearTimeout(skeletonTimer)
      → allBgs = data.backgrounds
      → computeGlobalMinMax(allBgs)          // fills globalMin/Max + *ByAttr
      → renderList(allBgs)                   // buildRow() per bg; eager buildPanel()
      → updateCount(allBgs.length, allBgs.length)
    → catch → renderError()                  // amber Retry button
```

**Key state (v1 scope):** `allBgs`, `globalMin`, `globalMax`, `globalMinByAttr`, `globalMaxByAttr`, `openId`. **Intentionally absent** (reserved for this cycle): `filtered`, `sortKey`, `sortAsc`, `query`.

| Technology | Version | Purpose | Why / Confidence |
|------------|---------|---------|------------------|
| HTML5 | n/a | Single-page shell, semantic `<main>/<nav>/<article>` | Constraint: static frontend. HIGH |
| CSS3 (vanilla) | n/a | 16 `:root` design tokens, flexbox layout, `max-height` accordion transition | No preprocessor/framework; mockup was vanilla. HIGH |
| JavaScript (ES2017+) | n/a | `const`/`let`, arrow fns sparingly, `fetch`, template literals; optional-chaining not used | Strict-mode IIFE wrapper; runs directly in browser with `<script defer>`. HIGH |
| Fetch API | native | Load `data/backgrounds.json` at startup | No bundler; relative path served from same origin. HIGH |
| GitHub Pages | n/a | Deploy target | Zero-cost static hosting from `main` root. HIGH |
| Python http.server | 3.x | Local dev (CORS-safe fetch of local JSON) | `python -m http.server 8000` per README. HIGH |

**No build tools. No package.json. No node_modules. No tests.** The `.gitignore` is 4 lines. Dependency footprint = zero.

**Data contract (`data/backgrounds.json`):**
- Top level: `{ meta: { source, scrapedAt, totalBackgrounds }, backgrounds: [...] }`
- Each background: `{ id, name, startingLevel: {min,max}, baseWage, attributes: { hitpoints, meleeSkill, rangedSkill, meleeDefense, rangedDefense, fatigue, resolve, initiative }, icon }`
- Each attribute: `{ range: {min,max}, average, levelUp: {min,max} }` — `levelUp.min`/`levelUp.max` may be `null`.
- 67 backgrounds confirmed; icons at `assets/icons/Background_NN.png` (67 files); JSON stores the path as `icons/Background_NN.png` and `iconUrl()` prefixes `assets/`.

## 2. Conventions & Patterns

**Code style (observed in `app.js`):**
- Single top-level IIFE with `'use strict'`. All module state is `let` at IIFE scope — not exported, not on `window` (sole escape hatch: `window.__setEmpty` dev hook, D-12).
- `function` declarations for named helpers; arrow functions used only for event handler and array iterator callbacks when convenient.
- 2-space indentation; single quotes for strings; template literals only inside `barColor()` style strings.
- Double-fence comment blocks `// ── Section ──` demarcate phases and decision-IDs (D-NN) — e.g. `// ── D-15: compute global min/max ──`. Preserve this convention when adding SRCH code.
- DOM construction uses imperative `document.createElement` + `className` + `textContent` — **no innerHTML assembly** except for fixed-template expanded-panel badges and stat vals (two deliberate spots). Maintain this boundary: user-supplied strings (the search query) MUST go through `textContent`, never `innerHTML`.
- Event wiring is direct (no delegation) EXCEPT where the mockup uses delegation (`pills` click handler — copy that pattern for SRCH-02).
- Defensive null guards at the top of every function that touches the DOM: `if (!el) return;`.

**CSS conventions (`styles.css`):**
- ID selectors for singletons (`#app`, `#list`, `#controls`, `#search`, `#pills`, `#pills-wrap`, `#search-wrap`, `#search-icon`, `#result-count`, `#empty`, `#bottom-nav`).
- Class selectors for repeatables (`.bg-item`, `.bg-row`, `.bg-panel`, `.pill`, `.pill.active`, `.attr-row`, etc.).
- `:root` design tokens for all colors, nav height, controls height. Never hard-code a color in a new rule — use a token or add one to `:root`.
- Transitions on specific properties (`max-height .32s`, `transform .25s`, `width .35s`) — not `all`. Respect this.

**File/directory conventions:**
- Single file per concern at repo root: one HTML, one CSS, one JS. Do not split into subdirectories — cycle decision was "no framework, no bundler."
- Data lives in `data/`, static assets in `assets/icons/`, planning in `.planning/`, design exemplars in `mockups/`. `mockups/` is a reference archive — never imported at runtime.

**Testing conventions:** None. There is no test runner, no test files, no test directory. The `window.__setEmpty` dev hook is the sole runtime verification surface (Plan 4 D-12). For this cycle, expect verification to be manual + optional dev hooks (e.g. `window.__setSort(key, asc)`, `window.__setQuery(str)`).

**Mockup-parity discipline:** The dominant historical pattern is **verbatim port from `mockups/design3_accordion.html`**. Every major algorithm (`pct`, `barColor`, `sortValue`, `applySort`, `applyFilter`, pill active-state toggle) was already written in the mockup. For this cycle, the primary motion is: lift lines 534–548 (state + element refs), 592–617 (sort/filter), 817–855 (event wiring) out of the mockup and adapt to the shipped `app.js` structure. Do **not** re-invent a different search/sort algorithm.

**Accessibility patterns (current, minimal):** `<main role="list" aria-label="Backgrounds">` is the only ARIA markup in `index.html`. No keyboard handlers on rows (click only). No `aria-expanded` on `.bg-item.open`. No `tabindex`. This is a known v1 gap and is being carried forward unchanged — SRCH additions should meet or exceed this bar (use `<button>` for pills — the mockup already does — to get keyboard activation for free).

## 3. Structure

**Repo root (shipped v1):**
```
battle_brothers/
├── index.html              # 47 lines — app shell + #result-count, #list, #empty, #bottom-nav
├── styles.css              # 442 lines — full mockup CSS ported verbatim in Phase 1
├── app.js                  # 476 lines — strict-mode IIFE, v1 pipeline
├── README.md               # 19 lines — local dev + live URL
├── .gitignore              # 4 lines
├── data/
│   └── backgrounds.json    # 6708 lines — 67 backgrounds, pretty-printed
├── assets/
│   └── icons/              # 67 × Background_NN.png (36×36 display, 6px radius)
├── mockups/
│   ├── design1_card_grid.html
│   ├── design2_dense_table.html
│   └── design3_accordion.html   # 868 lines — reference implementation for THIS cycle
└── .planning/              # GSD/Light state: PROJECT.md, CODEBASE.md, CYCLE-LOG.md, config.json
```

**`index.html` DOM (v1 shipped):**
```
<div id="app">
  <div id="result-count"></div>        ← populated by updateCount()
  <main id="list" role="list"></main>  ← populated by renderList() / renderSkeleton() / renderError()
  <div id="empty"> … </div>            ← display:none by default; shown by setEmpty(true)
  <nav id="bottom-nav">                ← two static .nav-tab divs
    Backgrounds (active) | Build
  </nav>
</div>
```
Note: `#controls`, `#search-wrap`, `#search`, `#search-icon`, `#pills-wrap`, `#pills` are **NOT in the DOM**. Their CSS rules (styles.css lines 43–140) are dormant and must be activated by adding the DOM this cycle.

**`app.js` logical layout (as shipped):**
```
IIFE scope
├── Module state (lines 5–12)        allBgs, globalMin/Max[, ByAttr], openId
├── Constants (lines 13–25)          DATA_URL, SKELETON_DELAY_MS, SKELETON_ROW_COUNT, ATTR_KEYS
├── Helpers
│   ├── iconUrl, wireIconFallback                      (28–40)
│   ├── updateCount, setEmpty, window.__setEmpty       (43–59)
│   ├── computeGlobalMinMax                            (62–89)
│   ├── pct, barColor, makeSparkline                   (92–133)
│   ├── renderSkeleton, renderError                    (136–231)
│   ├── formatLevelUp, buildAttrRow, buildPanel        (234–329)
│   ├── toggleItem                                     (332–361)
│   ├── buildRow                                       (364–420)
│   └── renderList                                     (422–429)
├── load()                                             (432–466)
└── startup guard                                      (471–475)
```
For SRCH work, a `filter + sort + render` pipeline will slot between `computeGlobalMinMax` and `renderList`. `renderList` itself stays as-is — it already accepts any array.

**Recommended insertion points for SRCH (this cycle):**
- State additions: immediately after line 12 (next to `openId`).
- New helpers `sortValue`, `applySort`, `applyFilter`: between `renderList` (line 429) and `load` (line 432).
- Event wiring: inside or just before `load()` — but only after the controls DOM exists. Cleanest: add a `wireControls()` function called once from the `.then()` success branch in `load()`, after `renderList` but before / alongside `updateCount`.

## 4. Concerns & Gaps

### 4.1 SRCH-01/02/03 — Concrete gap enumeration

**DOM additions required (`index.html`):**
Insert inside `#app`, **before `#result-count`** (matches mockup line 459–480 order; `#controls` is `position: sticky; top: 0` and must be the first visible child to stick correctly):

```
<div id="controls">
  <div id="search-wrap">
    <svg id="search-icon" …>…</svg>                                        ← 14×14 search glyph
    <input id="search" type="search" placeholder="Search backgrounds…"
           autocomplete="off" spellcheck="false">
  </div>
  <div id="pills-wrap">
    <div id="pills">
      <button class="pill active" data-key="name">Name <span class="arrow">▲</span></button>
      <button class="pill" data-key="baseWage">Wage</button>
      <button class="pill" data-key="hitpoints">HP</button>
      <button class="pill" data-key="meleeSkill">MSk</button>
      <button class="pill" data-key="rangedSkill">RSk</button>
      <button class="pill" data-key="meleeDefense">MDf</button>
      <button class="pill" data-key="rangedDefense">RDf</button>
      <button class="pill" data-key="fatigue">Fat</button>
      <button class="pill" data-key="resolve">Res</button>
      <button class="pill" data-key="initiative">Ini</button>
    </div>
  </div>
</div>
```
Pills use `<button>` (not `<div>`) per the mockup — critical for keyboard activation + focus ring without extra ARIA. **10 pills total** (Name, Wage, + 8 attrs).

**State additions (`app.js`, after line 12):**
```
let filtered = [];
let sortKey = 'name';
let sortAsc = true;
let query   = '';
```
Initial defaults mirror the mockup: `sortKey='name'`, `sortAsc=true`. Note the mockup's per-key default direction rule at line 827: `sortAsc = key === 'name'` — name defaults ASC, every stat defaults DESC (higher = better, shown first). Preserve this.

**Sort contract (from mockup lines 593–607):**
```
sortValue(bg, 'name')     → bg.name.toLowerCase()
sortValue(bg, 'baseWage') → bg.baseWage
sortValue(bg, <attrKey>)  → bg.attributes[attrKey]?.average ?? 0
```
Sort is stable-enough via simple `<`/`>` comparison; no tie-breaker needed (mockup has none). Note: `rangedDefense.average` can be negative (e.g. `-5` for Adventurous Noble) — arithmetic comparison handles this naturally, **do not** `Math.abs()` it.

**Filter contract (from mockup lines 610–617):**
- Case-insensitive: `query.toLowerCase().trim()` compared against `bg.name.toLowerCase()`.
- Match type: `includes()` — substring match anywhere in name. Not prefix, not fuzzy.
- Matches **name only** — not `bg.id`. Confirmed: mockup line 613 uses `b.name.toLowerCase().includes(q)`.
- Empty query → clone `[...allBgs]`; do not share reference.

**Debounce contract (from mockup lines 847–855):** 180ms on `input`, single timer, `clearTimeout` on each keystroke. Note mockup also resets `openId = null` when query changes — **preserve this** since a filtered row scroll-into-view from `toggleItem` (app.js line 357) would jump to nowhere if the open item got filtered out.

**Pill-click contract (from mockup lines 818–844):**
1. Same pill clicked → toggle `sortAsc`.
2. Different pill clicked → switch `sortKey`; direction defaults by attribute (name=asc, else desc).
3. Remove `.active` class and any `.arrow` child from all pills.
4. Add `.active` to clicked pill; append a fresh `<span class="arrow">` with `▲` (asc) or `▼` (desc).
5. Call `applySort()` then re-render.

**Render integration:** Replace the direct `renderList(allBgs)` call site (app.js line 454) with `applyFilter()` which internally calls `applySort()` → re-renders `filtered` → updates count. `updateCount` already takes `(filtered, total)` signature — it's wired for this from Phase 4 and just needs `updateCount(filtered.length, allBgs.length)`.

**Empty state integration:** `setEmpty()` already exists (app.js 50–56) and toggles `#empty` + `#list`. Currently only called via `window.__setEmpty` dev hook. This cycle must wire the real call: when `filtered.length === 0 && allBgs.length > 0` show empty; otherwise hide. Mockup implements this inline in `render()` (line 624–628).

**Icon for search:** The 14×14 magnifying-glass SVG is styled by CSS rule `#search-icon { position: absolute; left: 20px; … }` (styles.css 81–88) which **requires** `#search-wrap` to be `position: relative` (it already is, line 77–79). The SVG must be a sibling of `<input id="search">` inside `#search-wrap`. Copy mockup lines 461–462 verbatim.

### 4.2 CSS — is the dormant sheet sufficient?

**YES, with one caveat.** Confirmed selectors already shipped in `styles.css`:
- `#controls` (43–50) — sticky top, bordered bottom
- `#search-wrap` (52–57, 77–79) — flex + position:relative
- `#search-wrap svg` (59–62)
- `#search` (64–75) — padding-left 32px leaves room for the icon
- `#search-icon` (81–88) — absolute, left:20px
- `#search:focus` (90–92) — amber-dim border
- `#search::placeholder` (94)
- `#pills-wrap` (96–102) — horizontal scroll, hidden scrollbar
- `#pills` (104–108) — flex row, `width: max-content`
- `.pill` (110–126) — pill shape, transitions
- `.pill:active` (128)
- `.pill.active` (130–134) — amber filled state
- `.pill .arrow` (136–140) — 9px font arrow span

**No CSS additions needed for baseline behavior.** The one caveat:
- `#controls` has no `height` but `:root --ctrl-h: 88px` is defined (line 19) and is currently unused. The mockup does not reference `--ctrl-h` either. Acceptable to leave as-is; controls will auto-size to content (~78px: 10+8 search padding + input 31px + pills 30px).
- Focus-visible ring: `.pill` has no `:focus-visible` rule. Minor a11y gap — optionally add one (one-line addition, not blocking).

### 4.3 Accessibility gaps for new controls

- `<input id="search" type="search">` — `type="search"` gives a native clear "×" on iOS/desktop for free. No `aria-label` in the mockup, but the `placeholder` is not a substitute. Recommend adding `aria-label="Search backgrounds"` (the placeholder gets dropped once the user types).
- Pills are `<button>` (good — keyboard accessible by default). Recommend `aria-pressed="true|false"` on each pill to convey toggle state to screen readers; currently only visual `.active` class.
- `#pills-wrap` scrolls horizontally with hidden scrollbar — keyboard users cannot scroll it without arrow keys landing on off-screen pills. Acceptable because all 10 pills receive focus in order; on-focus auto-scroll is native browser behavior. No fix required.
- Announcing result count changes: `#result-count` has no `aria-live` region. Recommend `aria-live="polite"` so screen readers hear "3 of 67 backgrounds" after each search keystroke settles. Small, cheap, high-value addition.

### 4.4 Data parity — sanity check

- All 10 sort keys present in data: ✓ `name`, ✓ `baseWage`, ✓ `attributes.{hitpoints, meleeSkill, rangedSkill, meleeDefense, rangedDefense, fatigue, resolve, initiative}.average`.
- `rangedDefense.average` routinely negative — `sortValue` treats as scalar, ordering is numerically correct.
- `baseWage` is an integer in the range observed (~10–50g). Sorts cleanly.
- No missing `attributes[key].average` observed in a spot-check, but the mockup defensively uses `?? 0`. The shipped `app.js` uses a longer `typeof … === 'number' ? … : 0` guard (line 273). Match whichever style the rest of `app.js` uses — consistency wins.
- Icon paths: 67 icons on disk, 67 backgrounds in JSON. Icon fallback (crossed-swords emoji) is already wired in `wireIconFallback`; unaffected by this cycle.

### 4.5 Pre-existing concerns (carried from v1, not in this cycle's scope)

Flagged for awareness; **do not attempt to address in this cycle unless a SRCH plan trips over them**:
- `renderList` does a full `listEl.textContent = ''` + rebuild. With filter/sort re-running on every keystroke (debounced) and potentially re-rendering all 67 items, there is a paint cost. Historical data: 67 items × modest DOM per item renders in well under 16ms on a mid-range phone. Acceptable. Do not pre-optimize.
- Panel expansion measures `scrollHeight` once on first open. If the user expands a row, then filters/sorts causing re-render, and expands again — fine (fresh measurement). The mockup intentionally clears `openId = null` on search input to avoid stale references; **the v1 `toggleItem` sets `openId` but filter/sort re-renders will destroy those `<article>` elements**, leaving `openId` pointing to an id whose DOM node is now fresh and **not** open-classed. Copy the mockup's "reset `openId = null` on sort or query change" behavior to keep state sane.
- No `aria-expanded` on rows; no keyboard expand/collapse. Known v1 gap. Don't expand scope.
- No tests, no test runner. This cycle will continue that pattern — verification is manual + dev hooks.
- The error-state `Retry` button has inline styles (app.js 215–223) because `styles.css` has no `.retry-btn` / `.pill--amber` rule. Cosmetic debt; don't touch.
- `--ctrl-h: 88px` is defined but unused. Harmless.
- `CYCLE-LOG.md` claims `styles.css` is 445 lines; actual count 442. Off by 3 (pre-existing count error in the log, not worth chasing).

### 4.6 Domain-level pitfalls (search/sort UI, mobile)

- **Debounce window too long feels laggy; too short thrashes render.** 180ms (mockup) is a well-tested default — keep it. Do not introduce `requestIdleCallback` complexity for 67 items.
- **Stat semantics in sort direction:** for most stats (HP, MSk, etc.) higher = better; for `baseWage`, lower = better (cheaper mercenary). The mockup's heuristic `sortAsc = key === 'name'` (everything else defaults DESC) means clicking Wage first shows most expensive — which is surprising. Two options: (a) ship mockup behavior unchanged (parity), or (b) special-case `baseWage` to default ASC. **Recommendation: ship parity in this cycle; file as a UX nit if users complain.** Do not fork from the mockup contract without explicit sign-off.
- **Clearing search ≠ restoring scroll position.** When search narrows the list, then the user clears it, the list reverts to 67 items but `#list.scrollTop` stays wherever it was. Mockup doesn't address this; acceptable v1-style behavior.
- **`type="search"` native clear button also fires `input`** — debounce will handle it correctly. Verified by spec.
- **Sticky `#controls` + scrolling `#list`:** `#app` is `overflow: hidden` (styles.css 39) and `#list` is `overflow-y: auto` (line 153). Controls stick to `#app`'s top, not the viewport. This is the correct pattern and matches the mockup. Do not remove `overflow: hidden` on `#app`.

## Sources

- `.planning/PROJECT.md` — requirements (Active list, Out of Scope, Key Decisions). HIGH.
- `.planning/CYCLE-LOG.md` (entry 2026-04-24) — v1 shipment detail, deferred SRCH items. HIGH.
- `index.html`, `styles.css`, `app.js`, `data/backgrounds.json`, `README.md` — shipped v1 source, read in full. HIGH.
- `mockups/design3_accordion.html` lines 455–480 (DOM), 530–548 (state), 560–617 (sort/filter), 817–855 (event wiring) — reference implementation, read in full for contracts. HIGH.
- `assets/icons/` directory listing (67 files) — icon parity check. HIGH.
- No external/domain WebSearch performed: the work is a porting task against an in-repo reference. Domain-level best practices (debounce ~180ms, substring-match case-insensitive, sticky controls) are mockup-verified and match common ecosystem patterns — MEDIUM confidence on "this is what the wider ecosystem does," HIGH confidence on "this is what the mockup does and what should ship."
