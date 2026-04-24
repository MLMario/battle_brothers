---
phase: 06-sort-pills-direction
verified: 2026-04-24T00:00:00Z
status: human_needed
resolved_gap_ids: []
score: "7/7 must-haves verified (automated); 6/6 ROADMAP SCs await human confirmation"
---

# Phase 06: Sort pills + direction Verification Report

**Phase Goal:** User can reorder the background list by any of 10 attributes and flip ascending/descending by re-clicking the active pill.
**Verified:** 2026-04-24
**Status:** human_needed

## Goal Achievement

The phase ROADMAP defines 6 Success Criteria (SC-1..SC-6). Plan 06-01 lands the DOM/state/CSS scaffold; Plan 06-02 wires the sort pipeline, click handler, dev hook, and `applySort()` insertion into `applyFilter()`. All seven plan-frontmatter must-have truths from each plan are observable in the codebase via grep / file inspection. However, the six ROADMAP SCs themselves describe runtime visual + interaction behavior (amber pill fill, ▲/▼ glyph swap on click, list re-sorts, sort composes with search, openId reset on sort change). The static frontend has no test runner (CODEBASE.md §2: "Testing conventions: None"), and both plans explicitly acknowledged that browser-console verification is the user's responsibility post-merge. Automated grep confirms the wiring is in place; human verification confirms the wiring works.

### Observable Truths

The list below merges the ROADMAP Phase 6 Success Criteria (SC-1..SC-6, from `roadmap_truths`) with plan-frontmatter must-have truths (Plans 06-01 and 06-02). Truths whose grep evidence is sufficient are marked VERIFIED; truths that depend on runtime behavior are marked UNCERTAIN with deferral to the human verification section.

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | (SC-1) A horizontal row of 10 pill buttons (Name, Wage, HP, MSk, RSk, MDf, RDf, Fat, Res, Ini) is visible below the search input; row scrolls horizontally on narrow viewports with no visible scrollbar. | ? UNCERTAIN | DOM present at `index.html` lines 24–37 with 10 `<button class="pill">` children in the exact order. CSS `#pills-wrap { overflow-x: auto; scrollbar-width: none; }` + `#pills-wrap::-webkit-scrollbar { display: none; }` shipped at `styles.css` lines 96–102. Visible rendering, sticky positioning, and hidden-scrollbar behavior require browser confirmation. |
| 2 | (SC-2) On first load, the Name pill is active (amber-filled) with `▲`; list is sorted alphabetically ASC by name. | ? UNCERTAIN | First-paint preset hard-coded at `index.html` line 26 (`class="pill active" data-key="name" aria-pressed="true"` + `<span class="arrow">▲</span>`). Initial state `sortKey='name', sortAsc=true` at `app.js` lines 18–19. Initial `applyFilter()` call at `app.js` line 586 now runs `applySort()` (line 492) so data order is name-ASC even if JSON arrives unsorted. Visible amber-fill + ▲ glyph requires browser confirmation. |
| 3 | (SC-3) Clicking a non-active pill switches sort key; previously active pill returns to unfilled state; name defaults `▲` ASC, every other key defaults `▼` DESC. | ? UNCERTAIN | Pill-click handler at `app.js` lines 543–559 implements the D-01 rule `sortAsc = (key === 'name')` at line 553 inside the `else` branch (different-key path). `updatePillUI()` (lines 463–479) clears `.active` + `aria-pressed="false"` + removes arrow on every pill, then sets the new active pill. Runtime behavior requires browser confirmation. |
| 4 | (SC-4) Clicking the currently active pill toggles direction; ▲/▼ glyph flips and list order reverses. | ? UNCERTAIN | Same-key branch at `app.js` lines 549–550: `if (key === sortKey) { sortAsc = !sortAsc; }`. Glyph swap implemented via `arrowSpan.textContent = sortAsc ? '▲' : '▼';` at line 477. `applyFilter()` → `applySort()` re-renders. Runtime behavior requires browser confirmation. |
| 5 | (SC-5) Sort composes with search: filter→sort applies to filtered subset; clearing search applies sort to all 67. | ? UNCERTAIN | `applyFilter()` at `app.js` lines 482–500 reads `openId=null → filter q on allBgs → applySort() → renderList(filtered) → updateCount → setEmpty`. Single entry point composes both query and sort changes. Runtime composition requires browser confirmation. |
| 6 | (SC-6) Changing sort key or direction resets `openId` so re-renders leave no stale open-row pointer. | ? UNCERTAIN | Triple-redundant reset confirmed: `app.js` line 484 (top of `applyFilter`), line 519 (`__setSort`), line 556 (pill-click handler). All three set `openId = null;` before re-rendering. Runtime "no stale open row" requires browser confirmation. |
| 7 | (Plan 06-01) Other 9 pills render as `<button class="pill" data-key="…" aria-pressed="false">…</button>` with NO `.active` class and NO `<span class="arrow">` child. | ✓ VERIFIED | `index.html` lines 27–35: each of the 9 non-Name pills has exactly `class="pill" data-key="…" aria-pressed="false"` and label text only — no `.active`, no `<span class="arrow">`. |
| 8 | (Plan 06-01) Module-scope state `let sortKey = 'name';` and `let sortAsc = true;` declared in `app.js` after Phase 5 search-state additions. | ✓ VERIFIED | `app.js` lines 18–19, immediately after `let query = '';` (line 15) and the Phase 5 D-19 block. Declared inside the IIFE, demarcated by the Phase 6 D-19 comment header at line 17. |
| 9 | (Plan 06-01) Single new CSS rule `.pill:focus-visible { outline: 2px solid var(--amber); outline-offset: 2px; }` ships in `styles.css`; no other CSS edits. | ✓ VERIFIED | `styles.css` lines 142–145, immediately after `.pill .arrow` (ends line 140) and before the `RESULT COUNT` section header (line 147). Uses `var(--amber)` (token defined at `:root`), `outline` (not `border`), `outline-offset: 2px`. |
| 10 | (Plan 06-01) The page still loads, renders all 67 backgrounds via the existing Phase 5 `applyFilter` pipeline, no JS errors. | ? UNCERTAIN | `node -c app.js` passes (syntax OK). `applyFilter()` is called from `load()` success branch at line 586 and from `wireControls()` debounce at line 534. Whether the page actually renders 67 backgrounds with no console errors requires browser confirmation. |
| 11 | (Plan 06-02) `window.__setSort(key, asc)` validates key against the 10 known keys (warns + no-ops on invalid), sets sortKey/sortAsc, resets openId, updates pill UI, and calls applyFilter() synchronously bypassing any debounce. | ✓ VERIFIED | `app.js` lines 512–522. Validation via `SORT_KEYS.indexOf(key) === -1` → `console.warn` + `return`. On valid key: sets `sortKey`, `sortAsc = !!asc`, `openId = null`, calls `updatePillUI()`, calls `applyFilter()` synchronously (no `setTimeout`). |
| 12 | (Plan 06-02) Pipeline `applyFilter()` reads `openId=null → filter → applySort → render → count → empty` (single-line `applySort()` insertion per D-04). | ✓ VERIFIED | `app.js` lines 482–500. The `applySort();` call is at line 492, between `filtered = q ? … : allBgs.slice();` (lines 488–490) and `renderList(filtered);` (line 495). Exactly one new line inserted per the D-04 promise. |

**Score:** 5/12 truths automated-VERIFIED; 7/12 await human runtime confirmation. All 7 plan-frontmatter must_haves truths are addressable; all 6 ROADMAP SCs depend on observable runtime behavior.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `index.html` | `#pills-wrap > #pills` inside `#controls`, AFTER `#search-wrap`; 10 `<button class="pill" data-key="…">` children; Name-active preset | ✓ EXISTS + SUBSTANTIVE + WIRED | 68 lines total. Pills DOM at lines 24–37 inside `#controls` (lines 17–38), as a sibling AFTER `#search-wrap` (lines 18–23). 10 `<button class="pill">` children present in exact required order: name, baseWage, hitpoints, meleeSkill, rangedSkill, meleeDefense, rangedDefense, fatigue, resolve, initiative. Name pill has `class="pill active" data-key="name" aria-pressed="true"` + `<span class="arrow">▲</span>`. Other 9 have `class="pill" data-key="…" aria-pressed="false"` and label only. CSS selectors `.pill`, `.pill.active`, `#pills-wrap`, `#pills`, `.pill .arrow` (already shipped in `styles.css` 96–140) match the new DOM and are activated by it. |
| `app.js` (state additions) | `let sortKey = 'name';` and `let sortAsc = true;` after Phase 5 D-19 block | ✓ EXISTS + SUBSTANTIVE + WIRED | Lines 18–19, demarcated by `// ── Phase 6 D-19: sort state (consumed by applySort + pill handler in 06-02) ──` at line 17. Both consumed by `applySort` (line 452, reads `sortKey`/`sortAsc`), `updatePillUI` (line 471, reads `sortKey`; line 477, reads `sortAsc`), pill-click handler (lines 549–553), `__setSort` (lines 517–518). |
| `app.js` (sortValue + applySort helpers) | `sortValue(bg, key)` per D-03, `applySort()` per D-02/D-05, single-line `applySort()` insertion in `applyFilter` per D-04 | ✓ EXISTS + SUBSTANTIVE + WIRED | `sortValue` at lines 443–449: `name` → `bg.name.toLowerCase()`, `baseWage` → `bg.baseWage`, attribute → `bg.attributes[key].average` with `typeof === 'number'` guard + `0` fallback. NO `Math.abs` (grep count = 0). `applySort` at lines 452–460 uses bare `<` / `>` flipped by `sortAsc`, no tie-breaker. `applySort();` invocation at line 492, between `filtered = …` (lines 488–490) and `renderList(filtered);` (line 495). |
| `app.js` (updatePillUI helper) | Reusable D-13 routine: clear `.active` + `aria-pressed="false"` + remove arrow on every pill, then add `.active` + `aria-pressed="true"` + fresh `<span class="arrow">` ▲/▼ to active pill | ✓ EXISTS + SUBSTANTIVE + WIRED | Lines 463–479, scoped to `#pills .pill`. Called from pill-click handler (line 557) AND `__setSort` (line 520). Glyphs are literal `'▲'` (U+25B2) and `'▼'` (U+25BC) at line 477. |
| `app.js` (pill-click handler in `wireControls`) | Single delegated `'click'` listener on `#pills`; null-guard via `closest('.pill')`; same-key toggle / different-key D-01 default; openId reset; updatePillUI; applyFilter | ✓ EXISTS + SUBSTANTIVE + WIRED | `wireControls` at lines 525–560 with the pill listener at lines 543–559. Defensive `if (!pillsEl) return;` guard at line 542. Handler implements D-12 steps 1–6 in order: `closest('.pill')` null-guard → read `dataset.key` → same-key toggle vs. different-key switch with D-01 default → `openId = null` → `updatePillUI()` → `applyFilter()`. `wireControls()` is called once from `load()` success branch at line 585. |
| `app.js` (`window.__setSort` dev hook) | Validate key against SORT_KEYS, warn+no-op on invalid, set state + reset openId + update pill UI + applyFilter synchronously | ✓ EXISTS + SUBSTANTIVE + WIRED | Lines 512–522. `SORT_KEYS` constant at line 36 (10 strings). Always exposed on `window`, no env gating. Mirrors `window.__setQuery` precedent at line 503. |
| `styles.css` (`.pill:focus-visible` rule) | `outline: 2px solid var(--amber); outline-offset: 2px;` immediately after `.pill .arrow` | ✓ EXISTS + SUBSTANTIVE + WIRED | Lines 142–145, between `.pill .arrow` (ends line 140) and `/* ── RESULT COUNT ── */` (line 147). Token `--amber` defined in `:root` at `styles.css` line ~9 (resolved as `#d4a843`). Rule will activate on keyboard focus of any `<button class="pill">` — the new DOM provides the focus targets. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `index.html #controls` | `#pills-wrap` (new) | sibling placement AFTER `#search-wrap` (D-07) | ✓ WIRED | Pattern `id="search-wrap"[\s\S]*?id="pills-wrap"` matches (`#search-wrap` opens line 18, closes line 23; `#pills-wrap` opens line 24, closes line 37; both inside `#controls` which closes line 38). |
| `#pills-wrap > #pills` | `styles.css #pills-wrap, #pills, .pill, .pill.active, .pill .arrow` (already shipped, dormant) | id/class selector match — activates sticky/scroll/pill CSS | ✓ WIRED | Selector match confirmed: `#pills-wrap` rule at `styles.css` line 96; `#pills` line 104; `.pill` line 110; `.pill.active` line 130; `.pill .arrow` line 136. New DOM ids/classes all match. |
| `app.js` IIFE state block | `applySort()` / pill handler / `__setSort` (Plan 06-02) | module-scope `sortKey` and `sortAsc` vars consumed by Plan 06-02 pipeline | ✓ WIRED | `let sortKey` / `let sortAsc` at lines 18–19; consumed at lines 454, 456, 471, 477, 549, 553, 517–518. |
| Name pill hard-coded `.active` + `aria-pressed="true"` + `▲` | D-19 initial state (`sortKey='name', sortAsc=true`) | first-paint match — eliminates flicker per D-10 | ✓ WIRED | Hard-coded preset at `index.html` line 26 matches `app.js` initial state at lines 18–19. The `applyFilter()` call in `load()` success branch (line 586) runs `applySort()` (line 492) which sorts by `sortKey='name'`/`sortAsc=true` — matching the first-paint preset. |
| `#pills` click event (delegated) | `applyFilter()` | single click listener on `#pills` inside `wireControls()`; handler updates `sortKey/sortAsc`, resets `openId`, updates pill UI, calls `applyFilter` | ✓ WIRED | Pattern `addEventListener('click'` matches at `app.js` line 543. Listener target is `pillsEl` (= `document.getElementById('pills')` at line 541). Handler body lines 543–559 calls `applyFilter()` at line 558. |
| `applyFilter()` | `applySort()` → `renderList(filtered)` | single-line insertion between `filtered = …` and `renderList` per D-04 | ✓ WIRED | Pattern `applySort\(\)` matches at line 492 inside `applyFilter` (lines 482–500). Single line insertion confirmed; all other `applyFilter` lines unchanged. |
| `applySort()` | `filtered.sort` via `sortValue(a, sortKey)` vs `sortValue(b, sortKey)` | bare `<` / `>` comparison flipped by `sortAsc` per D-02 | ✓ WIRED | Pattern `filtered\.sort` matches at line 453. Comparator at lines 453–459 uses bare `<` / `>` comparison with `sortAsc` flip. No tie-breaker. |
| `window.__setSort` | `applyFilter()` + pill UI update | synchronous dispatch — validates key, sets state, updates pill UI, calls `applyFilter` without debounce | ✓ WIRED | `window.__setSort` assignment at line 512; body at lines 512–522 validates via `SORT_KEYS.indexOf` (line 513), sets state (lines 517–519), calls `updatePillUI()` (line 520), calls `applyFilter()` synchronously (line 521). No `setTimeout`. |
| `load()` `.then()` success branch | `applyFilter()` post-`wireControls` | single `applyFilter()` call at end of success branch per D-26 — belt-and-suspenders initial sort | ✓ WIRED | Pattern `wireControls\(\);[\s\S]*?applyFilter\(\);` matches at lines 585–586. The single existing Phase 5 `applyFilter()` call now runs `applySort()` internally (Task 1 D-04 insertion), so D-26 "guarantee initial sort" is satisfied without a duplicate call site (per the explicit D-26 clarification in 06-02-PLAN.md). |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| SRCH-02-c1 | 06-01 + 06-02 | User can sort the background list by any of 10 attributes via a horizontal row of sticky sort pills (Name, Wage, HP, MSk, RSk, MDf, RDf, Fat, Res, Ini) with a visible active-pill amber fill state. | ? NEEDS HUMAN | Plan 06-01 shipped the 10-pill DOM with hard-coded Name-active preset; CSS `.pill.active` (`styles.css` line 130) renders amber fill. Plan 06-02 wired `sortValue` + `applySort` + pill-click handler + `updatePillUI` (the `.active` swap that animates the amber fill). All wiring grep-confirmed. Visible amber fill + actual list re-sort on click requires browser confirmation. |
| SRCH-03-c1 | 06-02 | User can toggle ascending / descending sort direction by re-clicking the active pill; the pill displays an ▲ (asc) or ▼ (desc) arrow glyph reflecting current direction. | ? NEEDS HUMAN | Same-key branch at `app.js` line 549–550 toggles `sortAsc`; `updatePillUI` (line 477) sets `arrowSpan.textContent = sortAsc ? '▲' : '▼';`. Glyph flip + list reverse requires browser confirmation. |

REQUIREMENTS.md Phase 6 traceability table maps SRCH-02-c1 (currently In Progress) and SRCH-03-c1 (currently Complete) — both align with the plans' frontmatter. No orphaned requirements. SRCH-02-c1 was intentionally NOT marked complete by Plan 06-01 (per the 06-01-SUMMARY.md "Deviations from Plan" Rule 1 self-correction); it should flip to Complete after Plan 06-02 — that downstream tooling is the orchestrator's responsibility, not the verifier's.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | | | | |

Scan ran across `index.html`, `app.js`, `styles.css` for TODO/FIXME/XXX/HACK/PLACEHOLDER, hardcoded empty data, `return null` on user-rendering paths, console.log-only handlers, props with hardcoded empty values. Four `placeholder` matches in `app.js` (lines 23, 146, 158, 383) are pre-existing Phase 1 skeleton-rendering comments (literal "8 placeholder rows" for the loading skeleton); one in `index.html` line 22 is the `placeholder="Search backgrounds…"` HTML attribute (legitimate UI hint); one in `styles.css` line 94 is the `::placeholder` CSS pseudo-element (legitimate selector). None of these flag stub behavior. `Math.abs` count in `app.js` = 0 (D-03 / CODEBASE.md §4.4 honored — negative `rangedDefense.average` flows through numeric comparison correctly). All five Phase 6 commits (`a5f1bd4`, `5116a72`, `f9fd6b2`, `0a199d6`, `fb0021d`) verified present via `git cat-file -e`.

### Regressions

| Truth | Previously Passed In | Now Status | Evidence |
|-------|---------------------|-----------|----------|
| (none — first verification in cycle) | | | |

Per the prompt's note "No prior `[0-9][0-9]-VERIFICATION.md` files exist (this is the first verification in the current cycle)", `find .planning/phases -name "*-VERIFICATION.md"` returned empty. No prior phases to regress against in this cycle. Phases 1–4 (v1.0) shipped before LGSD verification was instituted; the 06-CONTEXT.md/CODEBASE.md/SUMMARY trail confirm they shipped clean and Phase 5/6 compose onto that v1 substrate without regression — but that compositional check is incidental, not regression-against-VERIFICATION.

## Human Verification Required

Static frontend; no test runner (CODEBASE.md §2). The six ROADMAP Phase 6 Success Criteria describe runtime visual + interaction behavior that grep cannot prove. Both plans' `<verify>` blocks explicitly delegated runtime confirmation to the user. The smoke checks below cover SC-1..SC-6 plus the `__setSort` dev-hook contract.

### 1. SC-1 — Pill row visible with horizontal scroll, hidden scrollbar

**Test:** Run `python -m http.server 8000` and visit http://localhost:8000. Look at the area immediately below the search input. On a wide viewport (≥430px), confirm 10 pills are visible in order: Name, Wage, HP, MSk, RSk, MDf, RDf, Fat, Res, Ini. Resize the browser window to <430px wide (or use DevTools device emulator at 390px iPhone width). Try to swipe / scroll the pill row horizontally.
**Expected:** All 10 pills present in order. On narrow viewport, the pill row scrolls horizontally to reveal off-screen pills; no visible scrollbar (neither standard nor webkit). Both `#search-wrap` and `#pills-wrap` are sticky to the top of `#app` when the background list scrolls (i.e. they stay pinned in view).
**Why human:** Visual rendering, sticky-positioning fidelity, hidden-scrollbar behavior on platform-specific renderers, and horizontal-scroll affordance are not detectable by file inspection.

### 2. SC-2 — First-load Name pill is amber-filled with ▲ ASC

**Test:** Reload http://localhost:8000 with DevTools Console open. Look at the pill row immediately on first paint (no clicking).
**Expected:** Name pill is visibly amber-filled (background tint + amber border + amber text per `.pill.active` rule); a ▲ glyph appears to the right of the "Name" label inside a `<span class="arrow">` child. The other 9 pills render as unfilled outlines (dark background, gray text). The list of 67 backgrounds is sorted alphabetically ASC by name (A-named backgrounds at top). Result count reads `67 of 67 backgrounds`. No JS errors in Console.
**Why human:** Amber fill rendering, glyph visibility, alphabetical-ASC ordering of 67 names, and absence of console errors are visual + runtime properties.

### 3. SC-3 — Non-active pill click switches sort key with per-key default direction (D-01)

**Test:** From the SC-2 starting state (Name active + ▲), click the HP pill. Then click the Wage pill. Then click the RDf (ranged defense) pill.
**Expected:** Each click: previously active pill loses amber fill + arrow glyph; clicked pill gains amber fill + a fresh arrow glyph. Per D-01 rule (`sortAsc = key === 'name'`), the HP/Wage/RDf clicks all default to `▼` (DESC) since none are `name`. List order changes accordingly: HP DESC = highest-HP backgrounds first; Wage DESC = most-expensive first (yes, even though low wage = cheap mercenary — D-01 mockup parity); RDf DESC = highest rangedDefense first. Critically for the D-03 "no Math.abs" check: when sorting RDf DESC, "Adventurous Noble" (whose `rangedDefense.average = -5`) appears at the **bottom** of the list, NOT in the middle.
**Why human:** Visual amber-fill swap, glyph rendering, list re-sort, and the data-parity spot-check (negative rangedDefense floats to bottom of DESC list — confirms numeric comparison handles negatives correctly without `Math.abs`) all require runtime observation.

### 4. SC-4 — Active pill click toggles direction; ▲/▼ glyph flips and list reverses

**Test:** From the SC-3 ending state (RDf active + ▼), click the RDf pill again. Then click it a third time.
**Expected:** First re-click: arrow flips from ▼ to ▲; list reverses (lowest rangedDefense first — Adventurous Noble at top with -5). Second re-click: arrow flips back to ▼; list reverses again (Adventurous Noble back at bottom). Same-key clicks toggle `sortAsc`; `updatePillUI()` rewrites the arrow span text.
**Why human:** Glyph swap and list-reversal animation are runtime visual behavior.

### 5. SC-5 — Sort composes with search

**Test:** With the list at any sort state, type `a` into the search input and wait ~200ms. Confirm the list narrows to names containing "a". Now click the HP pill. Confirm only the filtered subset re-sorts by HP DESC. Click the search input's native "×" clear button. Confirm all 67 backgrounds return, still sorted by HP DESC. Click the Name pill. Confirm Name pill becomes active + ▲ and list sorts name-ASC.
**Expected:** Filter + sort compose without conflicts. Result count updates correctly across each transition (e.g. `N of 67 backgrounds` while filtered, `67 of 67 backgrounds` after clear). No JS errors. The currently-active sort persists through filter changes.
**Why human:** Multi-step interactive composition (type → click → click → click) and the result-count transitions cannot be grep-verified.

### 6. SC-6 — Sort change resets `openId` (no stale open-row pointer)

**Test:** Clear the search input. Sort by Name ASC. Click the very first background row (e.g. "Adventurer") to expand it — confirm the panel animates open. Now click the HP pill. Wait for the re-render. Scroll through the list to find the row that was previously open (search "Adventurer" if needed) and confirm it renders in the **collapsed** state. Then click another background to expand it; click the Wage pill; confirm again that the previously-open row renders collapsed in the new sort order.
**Expected:** No row spuriously renders as open after a sort change. The previously-open row's DOM node is destroyed by `renderList`, and `openId = null` (set in three places: `applyFilter` line 484, pill handler line 556, `__setSort` line 519) prevents any stale-id matching.
**Why human:** Open/closed visual state of a re-rendered row depends on a runtime check (`openId`-vs-`bg.id` match in `toggleItem`), which is only observable in the browser.

### 7. `window.__setSort` dev hook contract (D-21..D-24)

**Test:** Open DevTools Console. Run each of the following lines in order:
```js
__setSort('meleeSkill', false);  // expect: MSk pill active + ▼; list sorts by meleeSkill.average DESC (highest first)
__setSort('name', true);         // expect: Name pill active + ▲; list alphabetically ASC
__setSort('bogus_key', true);    // expect: console.warn('__setSort: unknown key', 'bogus_key'); pills + list unchanged
__setSort('hitpoints');          // expect: HP pill active + ▼ (asc coerces to !!undefined === false → DESC per D-23)
__setQuery('knight');            // expect: list narrows to knight-containing names
__setSort('hitpoints', true);    // expect: filtered subset re-sorts by HP ASC synchronously (no debounce wait)
```
**Expected:** Each call updates the pill UI and list synchronously (no setTimeout); the invalid-key call warns and no-ops; the partial-arg call coerces correctly per D-23; the combined `__setQuery` + `__setSort` call composes filter + sort on the filtered subset without any 180ms wait.
**Why human:** DevTools Console interaction, synchronous-execution timing, and observation of the `console.warn` output are runtime concerns.

### 8. Regression check — Phase 1–5 functionality unaffected

**Test:** Confirm: (a) accordion expand/collapse animates smoothly when clicking a row; (b) icons render at 36×36 with 6px radius, with the crossed-swords emoji fallback firing if any icon is missing; (c) the sparkline 8-bar gradient renders inside each row's center column; (d) the expanded panel shows level-up badges + 8 attribute bars; (e) the Retry button in the error state still works (force-fail by renaming `data/backgrounds.json` temporarily, then restore); (f) bottom nav shows two tabs (Backgrounds active); (g) `#empty` shows correctly when search yields zero matches.
**Expected:** All Phase 1–5 behaviors unchanged. No new console errors anywhere across this checklist.
**Why human:** Interactive regression observation for visual + animation features.

## Prior Gaps Closed

| Gap ID | Origin Phase | Status | Evidence |
|--------|--------------|--------|----------|
| — | — | — | No prior gaps addressed |

## UAT Results

*(Pending — main session appends after walking through the human verification items above.)*
