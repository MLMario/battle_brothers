---
plan: 06-02
phase: 06-sort-pills-direction
objective: "Wire the sort pipeline and pill interaction in app.js: sortValue + applySort helpers, single-line applySort() insertion inside applyFilter, delegated pill-click handler wired via wireControls(), reusable updatePillUI() routine, and the window.__setSort dev hook. Closes SRCH-02-c1 and SRCH-03-c1 and the v2.0 Search & Sort milestone."
status: complete
---

# Plan 06-02 Summary

## Completed Tasks

| Task | Description | Commits |
|------|-------------|---------|
| 06-02-01 | Add `sortValue(bg, key)` (D-03) and `applySort()` (D-02/D-05) helpers in `app.js` between `renderList` and `applyFilter`; insert single `applySort();` line inside `applyFilter()` between the `filtered = …` assignment and `renderList(filtered)` per D-04 — the "single line insertion" promised by Phase 5 | 0a199d6 |
| 06-02-02 | Add `SORT_KEYS` module-scope constant (10 known keys) next to `ATTR_KEYS`; add reusable `updatePillUI()` helper (D-13/D-14/D-29) scoped to `#pills .pill`; extend `wireControls()` with delegated pill-click listener on `#pills` per D-11/D-12/D-25 (null-guard → read `dataset.key` → same-key toggles `sortAsc` / different-key switches with D-01 default → reset `openId` → `updatePillUI()` → `applyFilter()`); add `window.__setSort` dev hook per D-21/D-22/D-23/D-24 (validates key against `SORT_KEYS`, `console.warn` + no-op on invalid, synchronous on valid). Literal U+25B2 (▲) / U+25BC (▼) glyphs per D-29. No change to `load()` — D-26 satisfied by the existing Phase 5 `applyFilter()` call which now sorts-on-load via the Task 1 D-04 insertion. | fb0021d |

## Key Files

### Created

- None — plan modifies one existing file only.

### Modified

- `app.js` — Five inserts into the Phase 5 IIFE:
  1. `const SORT_KEYS = [...];` (10 strings) at line 36, immediately after `ATTR_KEYS` (ends line 33). Mirrors `ATTR_KEYS` precedent per D-22 discretion.
  2. `function sortValue(bg, key)` at line 443, between `renderList` (ends line 437) and the preceding helpers block. Returns `bg.name.toLowerCase()` for `name`, `bg.baseWage` for `baseWage`, and `bg.attributes[key].average` with `typeof … === 'number'` guard (fallback `0`) for attribute keys. No `Math.abs` per D-03 — negative `rangedDefense.average` flows through numeric `<` / `>` correctly.
  3. `function applySort()` at line 452, sorts module-scope `filtered` in place via `filtered.sort(function (a, b) { … })` using bare `<` / `>` flipped by `sortAsc`. No-arg, no secondary tie-breaker — ES2019+ stable sort preserves insertion order for ties (D-02).
  4. `function updatePillUI()` at line 463, between `applySort` and `applyFilter`. Scoped to `#pills .pill` (defensive); iterates and resets `.active` + `aria-pressed="false"` + removes any existing `<span class="arrow">` child on every pill, then finds the pill matching `data-key === sortKey` (defensive null-return), adds `.active` + `aria-pressed="true"` + fresh `<span class="arrow">` child with `textContent = sortAsc ? '▲' : '▼'` (literal U+25B2 / U+25BC per D-29). Uses `setAttribute('aria-pressed', …)` per app.js attribute-update idiom.
  5. `applySort();` single-line insertion at line 492 inside `applyFilter()`, between the `filtered = …` assignment (lines 488–490) and `renderList(filtered)` (line 495) per D-04. All other lines of `applyFilter` unchanged. The `openId = null` top-of-applyFilter reset (Phase 5 D-10) stays put.
  6. `window.__setSort = function __setSort(key, asc) { … };` at line 512, immediately after `window.__setQuery` (line 503). Validates `key` via `SORT_KEYS.indexOf(key) === -1` → `console.warn('__setSort: unknown key', key)` + return; on valid key sets `sortKey`, `sortAsc = !!asc`, `openId = null`, calls `updatePillUI()`, calls `applyFilter()` synchronously. No `setTimeout`, no hostname gating — matches `__setQuery` / `__setEmpty` precedent.
  7. Extended `wireControls()` at line 525 — after the existing Phase 5 `#search` input listener, added a single delegated `'click'` listener on `#pills` (with defensive `if (!pillsEl) return;` guard). Handler uses `e.target.closest('.pill')` null-guard → reads `pill.dataset.key` → same-key `sortAsc = !sortAsc` / different-key `sortKey = key; sortAsc = (key === 'name');` (D-01) → `openId = null` → `updatePillUI()` → `applyFilter()`. Single listener, not per-pill, per D-11 (the one documented delegation exception in CODEBASE.md §2).
  - Also updated the stale inline comment inside `applyFilter` from `// D-05: direct pipeline (Phase 6 will insert applySort() between filter and render)` to `// D-05/D-04: pipeline — filter → sort → render → count → empty` for accuracy (optional discretion item flagged in the plan).
  - No edits to `load()` — D-26 is satisfied by the existing Phase 5 `applyFilter()` call at the end of the success branch, which now sorts-on-load thanks to the Task 1 D-04 `applySort()` insertion (initial state `sortKey='name', sortAsc=true` matches the hard-coded Name-active preset in index.html). The "IMPORTANT: D-26 clarification" block in the plan explicitly prohibits adding a duplicate `applyFilter()` call.

## Decisions Implemented

- **D-01** — Default-direction rule `sortAsc = (key === 'name')` applied in the different-key branch of the pill-click handler. Name defaults ASC; every other key (including `baseWage`) defaults DESC per mockup line 827. User-visible consequence for `baseWage` (most expensive first on first click) explicitly accepted for cycle-2; deferred as UX nit.
- **D-02** — `applySort` uses bare `a < b` / `a > b` comparison via `sortValue`, flipped by `sortAsc`. No secondary tie-breaker. ES2019+ stable `Array.prototype.sort` preserves `allBgs` insertion order for ties.
- **D-03** — `sortValue(bg, key)` shipped with the three branches: `name` → `bg.name.toLowerCase()`; `baseWage` → `bg.baseWage`; any other key → `bg.attributes[key].average` (with `typeof === 'number'` guard + `0` fallback — matches app.js line 281 precedent rather than mockup's `?? 0`). No `Math.abs` — negative `rangedDefense.average` (e.g. Adventurous Noble = -5) sorts correctly at the bottom of RDf DESC.
- **D-04** — `applyFilter` grows by exactly ONE new line: `applySort();` inserted between `filtered = …` and `renderList(filtered)`. All other lines of `applyFilter` unchanged. Pipeline reads `openId=null → filter → sort → render → count → empty`.
- **D-05** — `applySort()` is no-arg, operates on module-scope `filtered`, mutates in place (no reassignment). Matches app.js convention where helpers read module state directly.
- **D-06** — Pill-click handler calls `applyFilter()` (not `applySort + renderList` directly). One predictable re-render entry point; accepts the redundant filter pass over 67 items.
- **D-11** — Single delegated `click` listener on `#pills` (not per-pill). Documented exception to CODEBASE.md §2's "direct wiring" rule.
- **D-12** — Handler implements the six steps in order: (1) `e.target.closest('.pill')` null-guard; (2) read `pill.dataset.key`; (3) same-key toggles `sortAsc`, different-key switches `sortKey` and applies D-01; (4) `openId = null` reset; (5) `updatePillUI()`; (6) `applyFilter()`.
- **D-13** — `updatePillUI()` shipped as a reusable named helper (called from both the pill-click handler and `__setSort`). Iterates `#pills .pill`, resets `.active` + `aria-pressed="false"` + removes arrow span on every pill, then adds `.active` + `aria-pressed="true"` + fresh `<span class="arrow">` with ▲/▼ text content to the pill matching `data-key === sortKey`.
- **D-14** — `aria-pressed` updated in lockstep with `.active` class: every pill gets `aria-pressed="false"` during the reset pass, then the active pill gets `aria-pressed="true"` along with `.active`. Implementation uses `setAttribute('aria-pressed', …)` per app.js idiom.
- **D-21** — `window.__setSort = function __setSort(key, asc) { … };` signature requires both args. Mirrors `__setEmpty` / `__setQuery` precedent.
- **D-22** — Validates `key` against `SORT_KEYS` (module-scope `const`) via `SORT_KEYS.indexOf(key) === -1`. On invalid: `console.warn('__setSort: unknown key', key)` + return (no state change). On valid: sets `sortKey`, `sortAsc = !!asc`, `openId = null`, calls `updatePillUI()`, calls `applyFilter()` synchronously.
- **D-23** — Partial-arg forms technically defined: `__setSort('hitpoints')` coerces `asc === undefined` → `!!undefined === false` → DESC. No warn on missing `asc` (the key was valid). Verification scripts pass both args explicitly.
- **D-24** — `window.__setSort` always exposed — no hostname/env gating.
- **D-25** — Pill listener added INSIDE the existing `wireControls()` function (not a new function). `wireControls()` is still called exactly once from the `load()` success branch.
- **D-26** — Confirmed via static analysis: the existing Phase 5 `applyFilter()` call at the end of the `load()` success branch now serves as the initial-sort trigger (applySort runs inside applyFilter after the D-04 insertion). No second `applyFilter()` call added — duplicate would be a regression per the plan's explicit guidance.
- **D-29** — Arrow glyph rendering completed for dynamic cases: `updatePillUI()` creates `<span class="arrow">` elements with literal U+25B2 (▲) or U+25BC (▼) text content. Codepoint verified via `node -e` script reading `app.js` and inspecting the ternary output.

## Confirmation: D-26 satisfied without duplicate call

Static check via `node -e`: the regex match for `\.then\(function \(data\) \{[\s\S]*?\}\)[\s\S]*?\.catch` on `app.js` yields exactly **1** occurrence of `applyFilter()` in the `load()` success branch — the original Phase 5 call. No duplicate added. That call now runs `applySort()` internally (Task 1 D-04 insertion), so the initial render is name-ASC even if `backgrounds.json` arrives unsorted. Belt-and-suspenders behavior delivered via pipeline composition, not via a second call site.

## Manual Verification (Browser Console — User's Responsibility Post-Merge)

This is a static frontend with no test runner (CODEBASE.md §2); the plan's `<verify>` block specifies browser-console verification, which is the user's responsibility post-merge. Static structural verification performed by the executor:

- `node -c app.js` passes (syntax OK).
- `function sortValue` exists at line 443.
- `function applySort` exists at line 452.
- `function updatePillUI` exists at line 463.
- `function applyFilter` exists at line 482 with exactly ONE `applySort()` call inside (line 492).
- `window.__setQuery` assignment exists at line 503.
- `window.__setSort` assignment exists at line 512.
- `function wireControls` exists at line 525, extended with pill-click listener at line 543 (delegated on `#pills`).
- `Math.abs` occurrences in `app.js`: 0 (confirms no wrap on `rangedDefense.average` per D-03).
- `applyFilter()` calls inside `load()` success branch: 1 (D-26 confirmation — no duplicate).
- Arrow glyph codepoints in `updatePillUI()`: `▲` = U+25B2, `▼` = U+25BC (verified via `node -e` codepoint extraction).
- Pills DOM from Plan 06-01 present at `index.html` lines 24–37 (verified during plan read).

**Planned manual verification sequence (user executes on merge):** Start local server (`python -m http.server 8000`), visit `http://localhost:8000`, confirm all 27 verification steps from `<verify>` block in `06-02-PLAN.md` — including direction toggle on same-key click (▲↔▼ glyph flip + list reverse), switch-key with D-01 defaults (Name ASC, all others DESC), filter + sort composition (type query → click pill → only filtered subset sorts), stale-openId reset (expand a row → click a pill → no stale open-row pointer), and `__setSort` smoke tests (valid key applies sort; invalid key warns + no-ops; partial-arg coerces to DESC; combined with `__setQuery` sorts filtered subset synchronously). Negative-data parity spot check: click RDf pill, confirm Adventurous Noble (RDf avg = -5) appears at the bottom of the DESC list (not the middle — confirms no `Math.abs` per D-03 / CODEBASE.md §4.4).

## ROADMAP Phase 6 Success Criteria — Post-Plan Status

- **SC-1** — 10-pill row visible below search, horizontal scroll + hidden scrollbar: ✅ delivered by Plan 06-01 DOM + dormant CSS; unaffected this plan.
- **SC-2** — Name pill active + ▲ ASC on first load: ✅ delivered by Plan 06-01's hard-coded HTML preset; Plan 06-02's initial `applyFilter()` (via `load()` success branch) now runs `applySort()` and confirms the data order matches the Name-ASC preset (data is already name-sorted in JSON; applySort is belt-and-suspenders).
- **SC-3** — Non-active pill click switches key with per-key default direction: ✅ implemented in the pill-click handler via the D-01 rule `sortAsc = (key === 'name')`. Awaits browser-console confirmation.
- **SC-4** — Active pill click toggles direction; ▲/▼ glyph flips; list order reverses: ✅ implemented via `if (key === sortKey) sortAsc = !sortAsc;` + `updatePillUI()` + `applyFilter()`. Awaits browser-console confirmation.
- **SC-5** — Sort composes with search: ✅ the `applyFilter()` pipeline is now `filter → sort → render` — a single entry point for both query and sort changes. Awaits browser-console confirmation.
- **SC-6** — Sort change resets `openId`: ✅ triple-redundant reset — in the pill-click handler (before `updatePillUI`), in `__setSort`, and at the top of `applyFilter`. Awaits browser-console confirmation.

## Requirements Closed

- **SRCH-02-c1** — User can sort the background list by any of 10 attributes with a visible amber active-pill fill. Handler, `applySort`, `sortValue`, and `updatePillUI` shipped; pills DOM from Plan 06-01 is active. ✅
- **SRCH-03-c1** — Direction toggle on re-click of the active pill; ▲/▼ glyph reflects current direction. Handler toggle + dynamic arrow-span creation shipped. ✅

## v2.0 Search & Sort Milestone Closeout

SRCH-01-c1 (Plan 05-02), SRCH-02-c1 (this plan), and SRCH-03-c1 (this plan) all complete. Phase 6 has no remaining plans; cycle-2 execution is complete pending verification.

**Hand-off note for project milestone close-out:** No further plans in this cycle. Recommended next steps: advance STATE.md / ROADMAP.md to milestone-complete status; consider opening a new cycle for deferred items enumerated in `06-CONTEXT.md` `<deferred>` section (baseWage ASC default, `aria-live` on `#result-count`, `aria-expanded` on accordion rows, secondary tie-breaker, Escape-to-clear on `#search`, auto-scroll active pill into view).

## Known Stubs

None.

Scan performed across `app.js` for TODO/FIXME/placeholder/coming-soon patterns: the 4 matches found are all pre-existing Phase 1 skeleton/loading-state comments (lines 23, 146, 158, 383 — `SKELETON_ROW_COUNT`, skeleton block comments, icon-slot comments). No stubs introduced by Plan 06-02. All behavioral contracts (pill click → sort, direction toggle, glyph swap, `__setSort`, composition with search, stale-openId reset) are fully wired.

## Deviations from Plan

None — plan executed exactly as written. No Rule 1/2/3 auto-fixes triggered during execution. No architectural questions (Rule 4). No authentication gates. No CLAUDE.md-driven adjustments (no project CLAUDE.md exists at repo root).

One optional-discretion item from the plan was applied: updated the stale inline comment inside `applyFilter` from `// D-05: direct pipeline (Phase 6 will insert applySort() between filter and render)` to `// D-05/D-04: pipeline — filter → sort → render → count → empty`. The plan's `<action>` block for Task 1 explicitly flagged this as acceptable ("You MAY update this to … or leave as-is (both are fine; prefer minimal churn)") — not a deviation, just an optional-discretion choice.

## Self-Check: PASSED

Verified after writing this SUMMARY:

- Commit `0a199d6` (Task 1 — sortValue + applySort + applyFilter wiring) found in `git log` — confirmed via `git log --oneline --all | grep 0a199d6`.
- Commit `fb0021d` (Task 2 — SORT_KEYS + updatePillUI + pill-click handler + __setSort) found in `git log`.
- `app.js` exists and passes `node -c app.js`.
- `function sortValue` declared at `app.js` line 443 (grep confirmed).
- `function applySort` declared at `app.js` line 452.
- `function updatePillUI` declared at `app.js` line 463.
- `function applyFilter` declared at `app.js` line 482 and contains exactly ONE `applySort()` call at line 492 (regex count confirmed).
- `window.__setSort` assignment at `app.js` line 512.
- `function wireControls` at line 525 with delegated `addEventListener('click', …)` on `#pills` at line 543.
- `const SORT_KEYS = [...]` at line 36 (contains the 10 expected strings: `name`, `baseWage`, `hitpoints`, `meleeSkill`, `rangedSkill`, `meleeDefense`, `rangedDefense`, `fatigue`, `resolve`, `initiative`).
- `Math.abs` occurrences in `app.js`: 0 (verified via `node -e` regex count).
- `applyFilter()` calls in `load()` success branch: 1 (D-26 confirmation — no duplicate).
- Arrow glyphs in `updatePillUI()` ternary are literal `▲` = U+25B2 and `▼` = U+25BC (verified via `node -e` codepoint extraction).
- No stub/placeholder/TODO patterns introduced by this plan (scan confirmed all matches are pre-existing Phase 1 skeleton comments).
