---
plan: 05-02
phase: 05-search-filter
objective: "Wire the filter-to-render pipeline in app.js: implement applyFilter(), the 180ms debounced #search input handler, the wireControls() setup function called once from load(), and the window.__setQuery dev hook. After this plan ships, SRCH-01-c1 is complete."
status: complete
---

# Plan 05-02 Summary

## Completed Tasks

| Task | Description | Commits |
|------|-------------|---------|
| 05-02-01 | Implement applyFilter, wireControls, and the __setQuery dev hook in app.js; wire load() success branch to the new pipeline | ffaac0c |

## Key Files

### Created

- None — plan modifies one existing file only.

### Modified

- `app.js` — Three additions inserted between `renderList` (ends line 433) and `load` (starts line 481): (1) `applyFilter()` helper at lines 435–452 implementing the D-05/D-06/D-09/D-10 contract — `openId = null` reset, case-insensitive `name.toLowerCase().includes(q)` substring match, `allBgs.slice()` clone when query empty, then `renderList(filtered) + updateCount(filtered.length, allBgs.length) + setEmpty(filtered.length === 0 && allBgs.length > 0)`; (2) `window.__setQuery` dev hook at lines 454–461 mirroring the existing `window.__setEmpty` precedent — sets `#search.value`, sets `query`, calls `applyFilter()` synchronously bypassing the 180ms debounce; (3) `wireControls()` function at lines 463–478 with defensive `if (!searchEl) return;` guard, single `'input'` listener, closure-scoped `searchTimer`, 180ms `setTimeout` + `clearTimeout` debounce — no `keyup`/`change`/keyboard handlers, no `disabled` toggling, no `scrollTop` reset. Inside `load()`'s `.then()` success branch (now lines 503–504), the previous `renderList(allBgs);` + `updateCount(allBgs.length, allBgs.length);` two-line pair was REPLACED by `wireControls();` + `applyFilter();` — initial render is now driven by `applyFilter()` (empty query → `filtered = allBgs.slice()` → renders all 67 + count `67 of 67` + empty=false). One additional housekeeping edit: the stale module-state header comment at lines 4–5 was updated from `// Phase 1 scope only — D-15` / `// Phase 2+ state (filtered, sortKey, openId) intentionally absent.` to `// Module state` / `// Phase 6 state (sortKey, sortAsc) intentionally absent.` — accuracy fix, no behavior change (optional discretion item flagged in the plan).

## Decisions Implemented

- **D-04** — Build-tab navigation does NOT clear the search input (no Build-tab handler wired).
- **D-05** — Pipeline shape is exactly `applyFilter() → renderList(filtered) + updateCount(filtered.length, allBgs.length) + setEmpty(...)`. NO `applySort()` call (Phase 6 will insert one line between the `filtered = …` assignment and `renderList(filtered)`).
- **D-06** — `filtered` is the single source of truth: `q ? allBgs.filter(b => b.name.toLowerCase().includes(q)) : allBgs.slice()`. Cloned (not shared reference) when query is empty. Match is name-only, case-insensitive substring, with `.trim()` applied to the query.
- **D-07** — `applyFilter()` fires on two triggers: (1) debounced 180ms `input` event on `#search` wired in `wireControls()` via single `setTimeout` + `clearTimeout`; (2) once on initial `load()` success after `wireControls()` is set up. No `keyup`/`change` wiring.
- **D-08** — `#list.scrollTop` is NOT touched on query change or clear (mockup parity).
- **D-09** — Empty-state rule: `setEmpty(filtered.length === 0 && allBgs.length > 0)`. Initial paint with no data → setEmpty(false) (no flash). Zero matches with data loaded → setEmpty(true).
- **D-10** — `openId = null` reset fires at the top of `applyFilter()` on every query change — covers debounced, initial, AND dev-hook code paths via the single shared helper.
- **D-13** — No custom keyboard handlers wired on `#search`. Only `'input'` event is listened to. Browser defaults (native clear "×", native Escape on supporting browsers) cover all clear paths.
- **D-14** — `#search` is never set to `disabled`. Always typable from initial paint; before data arrives `applyFilter()` no-ops against an empty `allBgs`.
- **D-15** — `window.__setQuery = function __setQuery(str) { … }` shipped following the existing `window.__setEmpty = setEmpty;` precedent at line 63.
- **D-16** — `__setQuery` bypasses the 180ms debounce by calling `applyFilter()` synchronously after assigning to `#search.value` and `query`. No `setTimeout` wrapper.
- **D-17** — `__setQuery` always exposed on `window` — no hostname/env gating. Matches `__setEmpty` precedent.
- **D-18** — Only `__setQuery` shipped. NO `__setSort` stub (Phase 6 scope).
- **D-20** (second half) — `applyFilter` and `wireControls` insertion location is between `renderList` and `load`. `wireControls()` is a named function declaration consistent with app.js convention. `wireControls()` is called once from the `.then()` success branch of `load()`, immediately followed by the initial `applyFilter()` call. The `window.__setQuery = …` exposure is positioned immediately after `applyFilter` is defined, mirroring `window.__setEmpty = setEmpty;` pattern.

## Manual Verification (Browser Console)

This is a static frontend with no test runner (CODEBASE.md §2). The plan's `<verify>` block specifies browser-console verification, which is the user's responsibility post-merge. Static structural verification performed by the executor:

- `node -c app.js` passes (syntax OK).
- `function applyFilter` exists at line 436.
- `function wireControls` exists at line 464.
- `window.__setQuery` assignment exists at line 455.
- `setEmpty(filtered.length === 0 && allBgs.length > 0)` rule present at line 451.
- `}, 180);` debounce delay present at line 474.
- `applySort` only appears in a comment (line 446) — no actual call.
- `__setSort` does NOT appear anywhere.
- `renderList(allBgs)` and `updateCount(allBgs.length, allBgs.length)` removed from `load()` success branch (verified by grep — no matches).
- No CSS files modified (`git status --short` shows only app.js dirty post-commit).
- No `'keyup'`, `'change'`, or `'keydown'` listeners added (only single `'input'` listener).

The five ROADMAP Phase 5 success criteria require browser interaction to confirm:
1. Sticky search input above #result-count — delivered by Plan 05-01, not regressed by this plan (no DOM/CSS edits).
2. Typing `knight` filters list ~180ms after last keystroke — `wireControls()` provides this via 180ms `setTimeout` + `clearTimeout`.
3. Native clear restores all 67 — `type="search"` clear button fires `input` per spec; debounced path runs `applyFilter()` with empty query → `filtered = allBgs.slice()`.
4. Zero matches → `#empty` + `0 of 67 backgrounds` — D-09 `setEmpty(filtered.length === 0 && allBgs.length > 0)` covers this.
5. Open-then-filter-out leaves no stale openId — D-10 `openId = null` at top of `applyFilter()` covers all paths.

## Hand-off Note for Phase 6

Phase 5 ships SRCH-01-c1; pipeline lands as:

```
applyFilter() → renderList(filtered) + updateCount + setEmpty
```

Phase 6's `applySort()` insertion is a single line between the `filtered = …` assignment (app.js line 442–444) and the `renderList(filtered)` call (app.js line 447). That is the only edit Phase 6 makes to `applyFilter`. Phase 6 also adds:

- Module state: `let sortKey = 'name';` and `let sortAsc = true;` (currently absent — see line 5 comment).
- DOM: `#pills-wrap > #pills` with the 10 pill buttons inside `#controls` (currently `#controls` only contains `#search-wrap`).
- Pill-click delegated handler wired from `wireControls()` (or a new helper called from there).
- `sortValue(bg, key)` helper for the `baseWage`-desc-default and per-attribute sort key extraction.
- `window.__setSort(key, asc)` dev hook (D-18 deferred from Phase 5).

No CSS additions are anticipated for Phase 6 — pill selectors already ship dormant in `styles.css` (per Phase 1 D-16).

## Phase 5 Closeout

- SRCH-01-c1 complete.
- No remaining work in Phase 5. Phase 5 plan count: 2 / 2 complete.
- Plan 05-01 delivered DOM scaffold + state slots; Plan 05-02 delivered the pipeline + handlers + dev hook.
- Ready to advance to Phase 6 (Sort pills + direction toggle).

## Known Stubs

None. The `<input id="search">` plumbing stub flagged in 05-01-SUMMARY is now resolved by this plan — typing in the search box is wired to the debounced `applyFilter()` pipeline. No new stubs introduced.

## Self-Check: PASSED

Verified after writing this SUMMARY:

- `app.js` exists and contains `function applyFilter`, `function wireControls`, and `window.__setQuery` (verified via grep at lines 436, 464, 455).
- `app.js` `load()` `.then()` success branch contains `wireControls();` and `applyFilter();` (verified at lines 503–504); the previous `renderList(allBgs);` + `updateCount(allBgs.length, allBgs.length);` lines are absent (verified by grep — no matches).
- `app.js` passes `node -c` syntax check.
- Commit `ffaac0c` (Task 1 — app.js wiring) found in `git log` (verified post-commit).
- No CSS files modified.
- No `__setSort` reference anywhere in app.js.
- No `applySort()` call (only a comment-mention reserving the Phase 6 insertion point).
- Plan 05-01 SUMMARY's flagged stub (search input not wired) is now resolved.
