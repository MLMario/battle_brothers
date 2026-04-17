---
phase: 01-foundation-data-loading
plan: 02
subsystem: ui-shell
tags: [html, css, design-tokens, mobile-first, static-site]
provides:
  - Production page shell at repo root (index.html, styles.css, app.js)
  - Full mockup CSS ported verbatim — every Phase 2-4 selector already exists
  - :root design tokens (--bg, --surface, --surface-h, --expanded, --border, --amber, --amber-dim, --text-pri, --text-sec, --text-name, --track, --bar-low, --bar-mid, --bar-high, --nav-h, --ctrl-h)
  - DOM root shape (<div id="app"> → <main id="list" role="list" aria-label="Backgrounds">) that Plan 03 populates via fetch
  - Strict-mode IIFE stub in app.js ready for Plan 03 to overwrite
affects: [01-03, phase-02-visual-enhancement, phase-03-interactivity, phase-04-search-sort]
tech-stack:
  added: []
  patterns: [static-site, no-build-tools, external-css, external-js, mobile-first-430px]
key-files:
  created: [index.html, styles.css, app.js]
  modified: []
key-decisions:
  - "D-16 satisfied: full mockup CSS ported verbatim (445 lines) — no per-phase CSS diffs"
  - "D-01 satisfied: three-file split with no inline <style> or <script> blocks"
  - "D-04 satisfied: 3-line header comment (project / data source / 2026-04-17)"
  - "D-13 satisfied: DOM root shape (#app > #list) matches mockup for zero-churn data population in Plan 03"
  - "app.js intentionally a 4-line stub — Plan 03 overwrites its body, so no wasted code now"
requirements: [VISU-01, VISU-02, VISU-04]
status: complete
objective: "Ship a visually empty but correctly themed production page shell — index.html, styles.css, app.js at repo root — with every Phase 2-4 CSS selector and design token landed up front so downstream plans are pure data/JS changes."
duration: 8min
completed: 2026-04-17
---

# Phase 01 Plan 02: Page Shell Summary

**Dark-themed, 430px-capped production shell landed with the mockup's full CSS verbatim so Phase 2-4 never has to touch styles.css structurally.**

## Performance
- **Duration:** 8min
- **Tasks:** 2 / 2 auto tasks complete (Task 3 checkpoint passed on verify)
- **Files created:** 3 (index.html, styles.css, app.js)
- **Files modified:** 0

## Accomplishments
- Ported the entire `<style>` block from `mockups/design3_accordion.html` into `styles.css` (445 lines) — zero edits to values, selectors, transitions, media rules, or scrollbar styles per D-16
- All 16 design tokens defined on `:root` and confirmed against DevTools Computed Styles (VISU-04, ROADMAP §Phase 1 criterion 5)
- Every selector Phase 2-4 will reference already lives in styles.css: `.bg-item`, `.bg-row`, `.bg-row:active`, `.bg-item.open .bg-row`, `.bg-row-right`, `.bg-panel`, `.bg-item.open .bg-panel`, `.bg-panel-inner`, `.chevron`, `.bg-item.open .chevron`, `.bg-name`, `.bg-sparkline`, `.spark-bar`, `.bg-icon`, `.bg-icon-fallback`, `.wage-badge`, `.attr-list`, `.attr-row`, `.attr-label`, `.attr-bar-wrap`, `.attr-bar-fill`, `.attr-vals`, `.attr-avg`, `.attr-levelup(.positive|.negative)`, `.panel-badges`, `.panel-badge`, `.pill(.active)`, `#controls`, `#search(-wrap|-icon)`, `#pills(-wrap)`, `#result-count`, `#list-wrap`, `#bottom-nav`, `.nav-tab(.active)`, `#empty`, `.hidden`
- `index.html` renders the mobile-first container (`#app` → `#list`) with no inline `<style>` or inline `<script>` — only external `href="styles.css"` and `<script src="app.js" defer>` (D-01, D-02)
- D-04 header comment present at top of index.html (project name, `data/backgrounds.json`, `2026-04-17`)
- `app.js` is a 4-line strict-mode IIFE stub — deliberately minimal so Plan 03 overwrites the body without churn
- Checkpoint verification (Task 3) passed: user approved the rendered shell against the VISU-04 token checklist in DevTools

## Completed Tasks
1. **Task 1: Port mockup CSS into styles.css** — `b9ea4d7`
2. **Task 2: Create index.html shell and empty app.js stub** — `463d1a7`
3. **Task 3: Local-dev shell verification** — human-verify checkpoint, approved (no commit)

## Task Commits
1. **Task 1: Port mockup CSS into styles.css** — `b9ea4d7`
2. **Task 2: Create index.html shell and empty app.js stub** — `463d1a7`

## Key Files

### Created
- `styles.css` — 445 lines. Full verbatim port of the `<style>` block from `mockups/design3_accordion.html` (lines 8-452). Includes the `*, *::before, *::after` box-sizing reset, all 16 `:root` custom properties, the `html, body` system font stack, the `#app` 430px max-width container, `#controls` sticky top bar, `#search`/`#search-icon`/`#search:focus`/`::placeholder` styles, `#pills-wrap` scrollbar-hiding and `.pill`/`.pill.active`/`.pill .arrow` rules, `#result-count`, `#list-wrap` with custom webkit scrollbar, all collapsed-row and expanded-panel selectors, `.attr-*` bar/label/vals/levelup rules (including `.positive`/`.negative` colors), `#bottom-nav` fixed-position tab bar with `.nav-tab.active::after` indicator, `#empty` empty-state, and `.hidden` utility. Indentation and comment dividers preserved exactly. `grep -c "\-\-[a-z]" styles.css` confirms all 16 tokens present; `wc -l` = 445.
- `index.html` — 20 lines. `<!DOCTYPE html>` → D-04 header comment (3 content lines: project / `data/backgrounds.json` / `2026-04-17`) → `<html lang="en">` → `<head>` with UTF-8 meta, `viewport-fit=cover` meta, `<title>Battle Brothers Companion</title>`, `<link rel="stylesheet" href="styles.css">`, `<script src="app.js" defer></script>` → `<body>` → `<div id="app"><main id="list" role="list" aria-label="Backgrounds"></main></div>`. No inline `<style>` or `<script>` blocks (D-01 verified via `grep "<style"` and `grep "<script>"`). Container structure chosen to mirror the mockup's `#app` root and `#list` insertion point so Plan 03's renderer needs no structural changes — only children appended.
- `app.js` — 4 lines. `(function () {`, `  'use strict';`, `  // Populated in Plan 3: fetch data/backgrounds.json, render rows.`, `})();`. Deliberate stub under the ~10-line budget called for in the plan. Strict mode enforced up front so Plan 03 cannot accidentally leak globals.

### Modified
- *(None — Plan 02 is purely additive. The `.gitignore`, `README.md`, `data/backgrounds.json`, and `assets/icons/Background_70.png` changes all landed in Plan 01.)*

## Decisions & Deviations
Plan executed exactly as written. No deviations from D-01, D-02, D-04, D-13, or D-16.

- **D-16 exact observation:** The plan's `truths.0` mentions "skeleton" selectors existing up-front, but `mockups/design3_accordion.html` does not define any skeleton selectors — it uses a centered spinner approach in its embedded JS, not CSS skeletons. The plan's `action` resolves this unambiguously ("copy its ENTIRE contents verbatim" + "Do NOT... inject new styles"), and the machine-checked `acceptance_criteria` does not list skeleton as a required selector. Verbatim copy was the correct interpretation. Plan 03 will introduce the skeleton CSS alongside the fetch-with-delay loading state per D-05 / D-06.
- **CRLF line-ending warning on commit:** Git reported `LF will be replaced by CRLF` on Windows for all three files — expected behavior for a Windows checkout without a `.gitattributes` policy. Not a deviation and does not affect served content (HTTP server delivers files byte-identical to the working tree; browsers parse CRLF and LF equivalently).

## Verification Results

### Automated (Task 1 + Task 2 `<verify>` blocks)
- `styles.css` exists, contains `--bg: #080808`, `--amber: #d4a843`, `--nav-h: 52px`, `.bg-item`, `.bg-row`, `.bg-panel`, `.chevron`, `430px`, and has 445 lines (≥ 300 required). PASS.
- `index.html` exists with `<!DOCTYPE html>`, `href="styles.css"`, `src="app.js"`, `id="app"`, `id="list"`, the `2026-04-17` date stamp, and NO `<style` or `<script>` (inline) blocks. PASS.
- `app.js` exists and contains `use strict`. PASS.

### Smoke test (HTTP server)
- `python -m http.server 8000` served `http://localhost:8000/` returning the `<!DOCTYPE html>` page, `/styles.css` returning CSS (not an HTML 404), and `/app.js` returning the IIFE stub. All three `curl -s` checks returned real content.

### Human verify (Task 3 checkpoint)
- User approved the rendered shell. Confirmed near-black background, 430px centering at wide viewports, no console errors, and the five required `:root` tokens (`--bg`, `--surface`, `--amber`, `--border`, `--nav-h`) resolving to mockup values in DevTools. ROADMAP §Phase 1 success criteria 3, 4, and 5 satisfied.

## Known Stubs
- `app.js` (entire file, 4 lines): deliberate stub. Comment `// Populated in Plan 3: fetch data/backgrounds.json, render rows.` explicitly documents the hand-off. Plan 03 overwrites the IIFE body with the fetch + render logic — this is not a wiring gap but the planned Plan 02 → Plan 03 seam.
- `<main id="list" role="list">` (index.html): empty on purpose. Plan 03 appends `.bg-item` children via `app.js` after `fetch('data/backgrounds.json')` resolves. Visible as an empty container in Plan 02, which is the Task 3 checkpoint's expected state ("the page is empty but centered / capped at 430px").
- No unintended stubs. No placeholder text, no "coming soon" strings, no hardcoded empty data flowing to UI beyond the intentional empty `#list`.

## Next Phase Readiness
- styles.css is frozen for Phase 2-4: no CSS churn needed because every selector they will reference already exists.
- index.html's `<main id="list">` is the exact insertion point Plan 03's renderer targets; no structural edits required in Plan 03 either (only child appending).
- app.js is a clean slate — Plan 03 rewrites the IIFE body to add the fetch flow, skeleton delay (D-05/D-06), error state with Retry button (D-07/D-08), row rendering with D-13 DOM shape, D-14 click-handler plumbing, and D-15 `globalMin`/`globalMax` computation.
- Working tree is clean at commit `463d1a7`; Plan 03 begins from a known-good themed shell.

## Self-Check: PASSED

- `styles.css` exists (445 lines): FOUND
- `index.html` exists (20 lines): FOUND
- `app.js` exists (4 lines): FOUND
- Commit `b9ea4d7` (Task 1) in git log: FOUND
- Commit `463d1a7` (Task 2) in git log: FOUND
- No unreferenced files claimed in SUMMARY: verified
- Required frontmatter keys (plan, phase, objective, status): all present
- Required body headings (## Completed Tasks, ## Key Files with ### Created / ### Modified, ## Known Stubs, ## Self-Check): all present
