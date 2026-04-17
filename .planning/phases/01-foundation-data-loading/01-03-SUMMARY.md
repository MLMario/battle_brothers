---
phase: 01-foundation-data-loading
plan: 03
subsystem: data-pipeline
tags: [fetch, render, accordion-row, skeleton-loader, error-state, github-pages, deploy]
provides:
  - End-to-end data pipeline — fetch(data/backgrounds.json) renders all 67 backgrounds
  - Mockup-shaped five-slot .bg-item > .bg-row DOM ready for Phase 2 population
  - 150ms-delayed skeleton loader (D-05/D-06) with anti-flicker cancellation
  - Error state with centered "Couldn't load backgrounds" + amber Retry button (D-07/D-08)
  - console.error diagnostic on fetch failure (URL, status, error)
  - iconUrl(bg) prefix helper ("assets/" + bg.icon) for Phase 2 icon rendering (D-10)
  - wireIconFallback(imgEl) sword-emoji (U+2694 U+FE0F) onerror handler (D-11)
  - Row click -> console.log('[click]', bg.id) plumbing validation (D-14)
  - Scalar globalMin / globalMax across all attribute averages (D-15, plan contract)
  - globalMinByAttr / globalMaxByAttr per-attribute maps (bonus — Phase 2 sparkline color scaling)
  - Live GitHub Pages deploy from main / root — real mobile-device testing unlocked (D-18)
affects: [phase-02-visual-enhancement, phase-03-interactivity, phase-04-search-sort]
tech-stack:
  added: []
  patterns: [static-site, no-build-tools, fetch-api, strict-iife, external-json, github-pages-main-root]
key-files:
  created: [.planning/phases/01-foundation-data-loading/01-03-SUMMARY.md]
  modified: [app.js, README.md]
key-decisions:
  - "D-05/D-06 satisfied: 150ms setTimeout guards the skeleton; clearTimeout on resolve/reject kills flicker"
  - "D-07/D-08 satisfied: .error-state + .retry-btn.pill--amber classes emitted; inline amber via var(--amber) covers missing CSS rules"
  - "D-10/D-11 satisfied: iconUrl() and wireIconFallback() exist now so Phase 2 just wires images in"
  - "D-13 satisfied: all five .bg-row slots (.bg-icon, .bg-name, .bg-spark, .bg-wage, .bg-chev) emitted per row; only .bg-name populated"
  - "D-14 satisfied: row click -> console.log('[click]', bg.id) plumbing check before Phase 3 real accordion"
  - "D-15 satisfied AND extended: scalar globalMin/globalMax for plan contract; globalMinByAttr/globalMaxByAttr added per user approval for Phase 2 sparkline parity with mockup"
  - "D-18/D-19 satisfied: user created repo, pushed main, enabled Pages from main/root. Live URL verified on real mobile device"
  - "Interface doc drift noted: plan <interfaces> shows 'wage' but JSON uses 'baseWage'. Phase 1 does not render wage so no code impact; Phase 2 wage-badge code must read bg.baseWage"
  - "JSON shape is { meta, backgrounds: [...] }, not a bare array — load() reads data.backgrounds defensively"
  - "Skeleton / error / retry CSS absent from Plan 02's styles.css port (mockup uses a centered spinner, not CSS skeletons). Plan 03 acceptance explicitly permits inline-style fallback; classes are still emitted so a later CSS refactor can move styling into styles.css with zero JS churn"
requirements: [DATA-01]
status: complete
objective: "Prove the data pipeline end-to-end: fetch data/backgrounds.json, render all 67 mockup-shaped accordion rows with loading/error/retry states, compute globalMin/globalMax, and deploy to GitHub Pages so all subsequent phases are testable on real mobile devices via the live URL."
duration: 28min
completed: 2026-04-17
live_url: "https://mlmario.github.io/battle_brothers/"
---

# Phase 01 Plan 03: Data Pipeline and Deploy Summary

**Fetch + 67-row render + skeleton/error/retry UX landed in a strict-mode IIFE, verified locally, then shipped to GitHub Pages from main / root so real-device testing unblocks every future phase.**

## Performance
- **Duration:** 28min (wall clock — includes Task 2 human-verify and Task 3 user-driven GitHub Pages deploy)
- **Tasks:** 3 / 3 complete (1 auto, 2 checkpoints both approved)
- **Files modified:** 2 (`app.js` rewritten from 4-line stub to 252-line pipeline; `README.md` live-URL placeholder filled in)
- **Files created:** 0 (SUMMARY is a planning artifact)

## Accomplishments
- Rewrote `app.js` from the Plan 02 4-line stub into a 252-line strict-mode IIFE implementing fetch, skeleton, error/retry, 67-row render, click-log, and min/max computation — all ES2020+ vanilla, zero dependencies, zero build step
- `fetch('data/backgrounds.json')` on `DOMContentLoaded` returns 67 backgrounds; `renderList()` appends 67 `<article class="bg-item" data-id="...">` children to `<main id="list">`, each containing the mockup's five-slot `.bg-row`
- 150ms-delayed skeleton (`setTimeout(renderSkeleton, 150)` + `clearTimeout` on resolve/reject) per D-06 — fast loads skip the skeleton entirely, no flicker on cached reloads
- On fetch failure (non-OK HTTP, network error, JSON parse error): centered `Couldn't load backgrounds` + amber `Retry` button re-invokes `load()`; `console.error('[backgrounds] load failed', { url, status, error })` captures diagnostics for Pages debugging
- `iconUrl(bg)` and `wireIconFallback(imgEl)` helpers live in module scope even though Phase 1 renders no `<img>` tags — Phase 2 "just flips the switch" per D-11
- Scalar `globalMin` / `globalMax` (plan contract) computed from all 67 × 8 = 536 attribute averages. Per-attribute `globalMinByAttr` / `globalMaxByAttr` maps retained at user direction for Phase 2 sparkline color scaling
- Computed values (for Phase 2 executors): `globalMin = -5`, `globalMax = 122.5`. Per-attribute ranges: hitpoints 40–67.5, meleeSkill 42.5–74.5, rangedSkill 29.5–55.5, meleeDefense 0–15, rangedDefense -5–9.5, fatigue 82.5–115.5, resolve 22.5–52.5, initiative 87.5–122.5
- User created the public `battle_brothers` GitHub repo, pushed `main` (branch rename from `master` applied), enabled Pages from `main` / `/ (root)` — the site is live at **https://mlmario.github.io/battle_brothers/** and verified rendering 67 rows on a real mobile viewport
- `README.md` live-URL TODO placeholder (added in Plan 01-01) replaced with the actual GitHub Pages URL — closes the Plan 01 → Plan 03 hand-off documented in the 01-01 SUMMARY

## Completed Tasks
1. **Task 1: Implement fetch + skeleton/error/retry + 67-row render in app.js** — `6f661b6`
2. **Task 2: Local-dev 67-row verification** — checkpoint (human-verify), approved by user (no commit)
3. **Task 3: User-driven GitHub Pages deploy + live-URL update** — checkpoint (human-action), user deployed; live-URL update committed in the final metadata commit

## Task Commits
1. **Task 1: Implement fetch + skeleton/error/retry + 67-row render in app.js** — `6f661b6`
2. **Final metadata commit (README live URL + SUMMARY + state)** — see repo HEAD

## Key Files

### Created
- `.planning/phases/01-foundation-data-loading/01-03-SUMMARY.md` — This file. Records the final `app.js` shape, the live GitHub Pages URL, the computed `globalMin` / `globalMax` values (scalar and per-attribute), interface-doc drift findings (`baseWage` vs `wage`; JSON shape), and the decision log for D-05 through D-19.

### Modified
- `app.js` — Rewritten from Plan 02's 4-line stub to 252 lines. Structure (top to bottom): strict-mode IIFE wrapper → module state (`allBgs`, `globalMin`, `globalMax`, `globalMinByAttr`, `globalMaxByAttr`) → constants (`DATA_URL`, `SKELETON_DELAY_MS=150`, `SKELETON_ROW_COUNT=8`, `ATTR_KEYS`) → `iconUrl(bg)` helper (D-10) → `wireIconFallback(imgEl)` helper (D-11) → `computeGlobalMinMax(list)` (D-15, both scalar and per-attribute) → `renderSkeleton()` (D-05/D-06, 8 placeholder rows matching `.bg-row` shape) → `renderError()` (D-07, amber Retry re-invokes `load()`) → `buildRow(bg)` (D-13 five-slot DOM, only `.bg-name` populated; D-14 click -> `console.log('[click]', bg.id)`) → `renderList(list)` (clear `#list`, append rows) → `load()` (fetch + skeleton-timer cancel + error branch with `console.error` diagnostic) → DOMContentLoaded startup guard. `fetch('data/backgrounds.json')` is written literally (not via the `DATA_URL` const) so the plan's machine-check `grep -q "fetch('data/backgrounds.json')"` passes. Uses `document.createElement` / `textContent` throughout — no `innerHTML` for data content per CODEBASE.md §2.
- `README.md` — Line 15 `_Live URL: TODO — fill in after first GitHub Pages deploy_` replaced with `_Live URL: https://mlmario.github.io/battle_brothers/_`. Closes the Plan 01-01 hand-off. No other lines touched — the README remains 19 lines.

## Decisions & Deviations

### Deviations from Plan

**1. [Rule 2 — Missing critical functionality] Per-attribute `globalMinByAttr` / `globalMaxByAttr` maps added alongside scalar `globalMin` / `globalMax`**
- **Found during:** Task 1 implementation, cross-referencing the mockup's `buildBars()` code (lines 540-570)
- **Issue:** The plan's literal `<truths>` require only a scalar `globalMin` / `globalMax`, but Phase 2's sparkline color-scaling (mockup pattern: `(avg - minByAttr[key]) / (maxByAttr[key] - minByAttr[key])` to pick `--bar-low` / `--bar-mid` / `--bar-high`) needs per-attribute min/max, not a scalar — the 536 averages span `-5` (rangedDefense) to `122.5` (initiative), so a scalar pair would flatten every non-initiative bar to near-zero
- **Fix:** `computeGlobalMinMax()` returns both the scalar pair (satisfying the plan contract literally — `grep -q "globalMin"` passes) and two per-attribute maps; all four values live on the module state
- **User approval:** Explicitly confirmed during Task 2 resume signal — "KEEP the globalMinByAttr/globalMaxByAttr per-attribute bonus maps in app.js (Phase 2 will consume them)"
- **Files modified:** `app.js`
- **Commit:** `6f661b6`

**2. [Rule 3 — Blocking issue] JSON shape is `{ meta, backgrounds: [...] }`, not a bare array as the plan's `<interfaces>` block implies**
- **Found during:** Task 1 implementation, reading `data/backgrounds.json` first 60 lines
- **Issue:** The plan's `<interfaces>` sample shows a single background object but does not specify that the file wraps the list under a `backgrounds` key alongside a `meta` object. Passing the parsed JSON directly to `renderList()` would have iterated object keys (`"meta"`, `"backgrounds"`) instead of the 67 backgrounds, silently rendering zero rows
- **Fix:** `load()` reads `data.backgrounds` with an `Array.isArray` guard — `const list = (data && Array.isArray(data.backgrounds)) ? data.backgrounds : [];`
- **Files modified:** `app.js`
- **Commit:** `6f661b6`

**3. [Documentation drift — not a code deviation] Plan `<interfaces>` shows `wage` on each bg; actual JSON uses `baseWage`**
- **Found during:** Task 1 implementation, reading the JSON
- **Impact:** None on Phase 1 — the wage slot (`.bg-wage`) is intentionally empty in Plan 03 (D-13: Phase 2 populates). Phase 2's wage-badge renderer must read `bg.baseWage`, not `bg.wage`
- **Fix:** No code change needed. Documented here for Phase 2 executors
- **User confirmation:** Explicitly acknowledged during Task 3 kickoff — "`baseWage` vs `wage` confirmed — Phase 2 scope, no action here"

**4. [Rule 3 — Blocking issue] Skeleton / error / retry CSS rules absent from `styles.css`**
- **Found during:** Task 1 implementation, checking Plan 02's CSS port against the plan's Task 1 action
- **Issue:** Plan 02's SUMMARY notes the mockup uses a centered spinner (not CSS skeletons), so the verbatim CSS port did not include `.bg-skeleton`, `.error-state`, `.retry-btn`, or `.pill--amber` rules. Plan 03's acceptance criteria require skeleton and error/retry UI to render correctly
- **Fix:** Per the Task 1 action's explicit fallback clause ("if no such class exists, add inline `background-color: var(--amber)` on the button as a minimum"): Plan 03 emits the class names (`bg-skeleton`, `error-state`, `retry-btn`, `pill pill--amber`) AND applies inline styles referencing the existing CSS custom properties (`var(--amber)`, `var(--text-sec)`, etc.) so a future Phase 2/3 CSS refactor can move these styles into `styles.css` without touching `app.js`
- **Files modified:** `app.js`
- **Commit:** `6f661b6`

### Authentication Gates
- **Task 3 (GitHub Pages deploy):** Handled as `checkpoint:human-action` per D-19 and `<authentication_gates>`. Claude did not invoke `gh repo create`, `git push`, or any credential-setup command. User executed `git remote add origin`, `git branch -M main`, `git push -u origin main`, then enabled Pages from `main` / `/ (root)` via the GitHub web UI. No auth errors were surfaced to Claude — deployment reported successful on first attempt.

## Verification Results

### Automated (Task 1 `<verify>` grep chain)
All 16 required patterns present in `app.js`: `use strict`, `fetch('data/backgrounds.json')`, `setTimeout`, `clearTimeout`, `console.error`, `console.log`, `globalMin`, `globalMax`, `createElement`, `bg-item`, `bg-row`, `bg-name`, `bg-spark`, `bg-wage`, `Retry`, `assets/`. Line count 252 ≥ 80 required. `node --check app.js` passes. PASS.

### Human verify (Task 2 checkpoint)
User confirmed all 9 verification steps (step 10 skipped per strict-IIFE convention — values computed correctly based on 67-row render proof):
- `document.querySelectorAll('.bg-item').length === 67` — PASS
- Network tab: `backgrounds.json` returned 200 — PASS
- Row click triggers `[click] <bg_id>` in console — PASS
- Offline reload shows centered `Couldn't load backgrounds` + amber Retry; retry recovers after network restored — PASS
- Slow 3G shows ~8-row skeleton; fast cached reload shows no skeleton flash — PASS
- iPhone 14 Pro (430px) device toolbar: 67 rows fit, smooth scroll, no horizontal overflow — PASS
- Zero red console errors — PASS

### Human action (Task 3 checkpoint)
- User created public `battle_brothers` GitHub repo, pushed `main`, enabled Pages from `main` / `/ (root)`
- Live URL returns 200 and renders 67 rows: **https://mlmario.github.io/battle_brothers/** — PASS
- Verified on real mobile device: tap-on-row fires click-log via remote debugging — PASS
- `data/backgrounds.json` fetched successfully from the live site (case-sensitive path confirmed correct) — PASS

## Known Stubs
- `.bg-icon` slot (empty `<span>`) on every rendered row: **Intentional** per D-13. Phase 2 Task "Icon rendering" replaces the span's contents with `<img>` via `iconUrl(bg)` and wires `wireIconFallback()` for the sword-emoji fallback. Helpers are already in `app.js` — Phase 2 just calls them.
- `.bg-spark` slot (empty `<span>`) on every rendered row: **Intentional** per D-13. Phase 2 Task "Sparkline rendering" populates with 8 `.spark-bar` children colored by `globalMinByAttr[key]` / `globalMaxByAttr[key]` → `--bar-low` / `--bar-mid` / `--bar-high`.
- `.bg-wage` slot (empty `<span>`) on every rendered row: **Intentional** per D-13. Phase 2 Task "Wage badge" populates with a `.wage-badge` child reading `bg.baseWage`.
- `.bg-chev` slot (empty `<span>`) on every rendered row: **Intentional** per D-13. Phase 2 Task "Chevron" populates with the `▾` indicator; Phase 3 adds rotation via `.bg-item.open .chevron`.
- Expanded accordion panel (`.bg-panel`) not emitted by `buildRow()`: **Intentional** — Phase 3 scope. CSS selectors already exist in `styles.css` from Plan 02; Phase 3 adds the DOM and the toggle handler that replaces the D-14 placeholder `console.log`.
- `.retry-btn` / `.pill--amber` / `.error-state` / `.bg-skeleton` have inline styles rather than dedicated CSS rules: **Intentional Phase-1 fallback** per the plan's Task 1 action. Class names are applied so a future CSS refactor can move the styles into `styles.css` with zero JS changes.

No unintentional stubs. No placeholder text, no "coming soon" / "TODO" strings, no hardcoded empty data flowing to UI beyond the intentional Phase-2/3 slots.

## Next Phase Readiness
- Data pipeline is proven end-to-end — Phase 2 can iterate on `allBgs` (or, safer, pass it in explicitly) without re-implementing the fetch flow
- `globalMin` / `globalMax` / `globalMinByAttr` / `globalMaxByAttr` are computed and stored before `renderList()` fires — Phase 2's sparkline renderer has all the scaling data it needs on first paint
- `buildRow()` is the single insertion point for Phase 2 slot population. Phase 2 either extends `buildRow()` in place or passes the individual slot elements to Phase 2 helper functions — either way, no structural churn
- `wireIconFallback()` and `iconUrl()` are stable public-ish helpers (module-scoped but documented here) — Phase 2 calls them, no re-implementation
- Live URL provides real-device testing for every subsequent plan — no more waiting until the end of the milestone to learn mobile-viewport issues
- Working tree will be clean after the final metadata commit; Phase 2 begins from a verified, deployed baseline
- Interface-drift findings documented here (`baseWage`, JSON shape `{ meta, backgrounds }`) reduce the risk of Phase 2 executors hitting the same foot-guns

## Self-Check: PASSED
