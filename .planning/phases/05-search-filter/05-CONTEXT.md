---
phase: 05-search-filter
phase_name: Search filter
gathered: 2026-04-24
status: Ready for planning
---

# Phase 5: Search filter - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Add a sticky search input above the existing accordion list that filters the 67 backgrounds by name in real time — case-insensitive substring match with a 180 ms debounce. Lands the `#controls` DOM scaffold and the `applyFilter` / `filtered` pipeline that Phase 6's sort pills will compose onto. Sort pills and direction toggle (SRCH-02-c1, SRCH-03-c1) are Phase 6 — out of scope here.

</domain>

<decisions>
## Implementation Decisions

### `#controls` DOM scope
- **D-01:** Phase 5 adds only `#controls > #search-wrap` (containing `#search-icon` + `<input id="search">`). Phase 6 will add `#pills-wrap > #pills` with the 10 pill buttons. Minimal YAGNI exposure; clean phase boundary.
- **D-02:** `#controls` inserts inside `#app` as the first visible child, **before** `#result-count`. Matches CODEBASE.md §4.1 and mockup lines 459–480; `position: sticky; top: 0` anchors correctly.
- **D-03:** Search input attributes are verbatim from the mockup: `type="search"`, `autocomplete="off"`, `spellcheck="false"`, `placeholder="Search backgrounds…"`. Governing mockup-parity discipline (STATE.md Accumulated Context).
- **D-04:** Build-tab navigation is a v1 placeholder only; the search input does NOT clear on Build-tab click. Deferred until the Build tab actually lands in a future cycle.

### Filter-to-render pipeline
- **D-05:** Pipeline shape is `applyFilter() → renderList(filtered) + updateCount(filtered.length, allBgs.length) + setEmpty(…)`. Direct — no intermediate `applySort` stub this phase. Phase 6 will insert its `applySort()` call as a single line between filter and render.
- **D-06:** `filtered` is the single source of truth for the rendered list. When query is empty: `filtered = [...allBgs]` (cloned, NOT shared reference — CODEBASE.md §4.1). When query is non-empty: `filtered = allBgs.filter(b => b.name.toLowerCase().includes(q))`. `renderList` always takes `filtered`.
- **D-07:** `applyFilter()` fires on two triggers: (1) debounced 180 ms `input` event on `#search` (single `setTimeout`, `clearTimeout` on each keystroke — matches mockup lines 847–855); (2) once on initial `load()` success to populate `filtered = [...allBgs]` and render. No `keyup`/`change` wiring — `type="search"` native clear already fires `input` per spec (CODEBASE.md §4.6).
- **D-08:** `#list.scrollTop` is NOT reset on query change or clear. Mockup parity — accepted v1-style behavior (CODEBASE.md §4.6).
- **D-09:** Empty-state wiring: when `filtered.length === 0 && allBgs.length > 0` → `setEmpty(true)` (shows `#empty`, hides `#list`). Otherwise `setEmpty(false)`. Mockup parity (lines 624–628).
- **D-10:** `openId = null` reset fires at the top of `applyFilter()` on every query change — prevents stale `openId` pointers after the filtered row is destroyed by re-render. Matches mockup lines 851–852 and CODEBASE.md §4.5.

### Accessibility
- **D-11:** Add `aria-label="Search backgrounds"` to the new `#search` input. Placeholder disappears on typing; `aria-label` persists for screen readers. Allowed because `#search` is NEW DOM — respects the REQUIREMENTS.md Out-of-Scope line "Accessibility refactor of existing v1 DOM — not re-opened this cycle."
- **D-12:** Do NOT add `aria-live="polite"` (or any a11y attribute) to the existing `#result-count` element. Crosses the v1-DOM exclusion line. Future a11y cycle can revisit.
- **D-13:** No custom keyboard handlers on `#search`. Browser defaults only — `type="search"` gives native clear on iOS/desktop and native Escape-to-clear in some browsers.
- **D-14:** `#search` is always enabled (never `disabled`). Typable from initial paint; before data arrives `applyFilter()` no-ops against an empty `allBgs`. Skeleton already signals loading visually.

### Dev hook (verification)
- **D-15:** Ship `window.__setQuery = (str) => { … }` following the existing `__setEmpty` pattern (app.js lines 57–59). Anticipated by CODEBASE.md §2.
- **D-16:** `__setQuery` bypasses the 180 ms debounce: sets `#search.value`, then calls `applyFilter()` synchronously. Enables scripted verification without `await sleep(200)`.
- **D-17:** `__setQuery` is always exposed on `window` — no hostname or env gating. Matches `__setEmpty` precedent; static GitHub Pages site has no meaningful prod/dev split.
- **D-18:** Only `__setQuery` this phase. No `__setSort` stub — Phase 6 ships that.

### State additions (inside IIFE, after line 12)
- **D-19:** Add module-scope state `let filtered = [];` and `let query = '';`. Do NOT add `sortKey` or `sortAsc` in this phase — those belong to Phase 6. CODEBASE.md §4.1 lists all four but the sort pair is Phase 6's contract.
- **D-20:** New helpers (`applyFilter`, possibly a small debounce wrapper) insert between `renderList` (line 429) and `load` (line 432). Wire the `#search` input event from a new `wireControls()` function called once from the `.then()` success branch in `load()`, after `renderList` (CODEBASE.md §3 insertion points).

### Claude's Discretion
- Exact function signature / inner factoring of `applyFilter()` (e.g. whether to extract a `filterByQuery(bgs, q)` pure helper) — any shape that honors D-05, D-06, D-07 is fine.
- Exact debounce implementation (inline `setTimeout` with a module-scope timer id, or a tiny `debounce(fn, ms)` helper). Both are acceptable.
- Whether `wireControls()` is inline in `load()`'s success branch or a named helper — any style consistent with app.js's existing convention (named function declarations for helpers).
- Comment header style for the new section (follow the existing `// ── Section ──` + `// ── D-NN ──` convention from CODEBASE.md §2).
- Whether to use `input.dataset` / data attributes vs. IIFE-scope state for the query (latter matches existing convention — recommended but not locked).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Reference implementation (mockup-parity — governing)
- `mockups/design3_accordion.html` lines 455–480 — `#controls` / `#search-wrap` / `#search-icon` / `#search` / `#pills-wrap` / `#pills` DOM structure. Phase 5 ports lines 455–467 (search-wrap only); Phase 6 ports 468–478 (pills).
- `mockups/design3_accordion.html` lines 530–548 — module state block. Phase 5 ports `query`, `filtered`; sort state is Phase 6.
- `mockups/design3_accordion.html` lines 610–617 — `applyFilter()` contract: `const q = query.toLowerCase().trim();` → empty clone vs `b.name.toLowerCase().includes(q)`.
- `mockups/design3_accordion.html` lines 817–855 — event-wiring reference, especially lines 847–855 (debounced input handler with `setTimeout` + `clearTimeout`, 180 ms, `openId = null` reset).
- `mockups/design3_accordion.html` lines 624–628 — empty-state trigger inside render.

### Current shipped code (insertion targets)
- `app.js` lines 5–12 — module-scope state block (append `filtered`, `query` after line 12).
- `app.js` lines 43–59 — `updateCount`, `setEmpty`, `window.__setEmpty`. Model for `__setQuery` (D-15).
- `app.js` lines 422–429 — `renderList(arr)`. Accepts any array; unchanged by this phase.
- `app.js` lines 432–466 — `load()`. Add `wireControls()` call in the `.then()` success branch after `renderList`.
- `index.html` lines inside `#app` — `#controls` DOM inserts before `#result-count`.
- `styles.css` lines 43–140 — dormant selectors (`#controls`, `#search-wrap`, `#search`, `#search-icon`, `#search:focus`, `#search::placeholder`) already ship. No CSS additions required (CODEBASE.md §4.2).

### Requirements and roadmap
- `.planning/REQUIREMENTS.md` SRCH-01-c1 — the sole requirement this phase delivers: case-insensitive substring match on name, 180 ms debounce, name-only.
- `.planning/ROADMAP.md` Phase 5 Success Criteria — 5 criteria (sticky search above count; ~180 ms typing response; native clear restores all 67; zero-match empty state + `0 of 67 backgrounds`; no stale `openId` after filter).
- `.planning/CODEBASE.md` §4.1 (concrete gap enumeration), §4.2 (CSS sufficiency), §4.3 (a11y notes), §4.5 (openId reset rationale), §4.6 (domain pitfalls).
- `.planning/PROJECT.md` Constraints — static frontend only (no build tools), mockup visual parity, JSON data source.

</canonical_refs>

<specifics>
## Specific Ideas

- "Mockup parity is the governing discipline for SRCH" (STATE.md Accumulated Context) — cited throughout. When in doubt on phrasing, attributes, values, defaults: port verbatim from `mockups/design3_accordion.html`.
- Preserve the existing `// ── D-NN: … ──` comment header convention from app.js when demarcating new sections. New decision-IDs from this CONTEXT.md (D-01 through D-20) flow directly into those headers during implementation.
- The two-underscore `window.__setQuery` naming signals "internal dev hook" and matches the existing `window.__setEmpty` precedent (app.js 57–59) exactly — same shape, same exposure, same intent.

</specifics>

<deferred>
## Deferred Ideas

- **Reset `#list.scrollTop` on query clear** — nice UX but deviates from mockup parity. Can be revisited in a future polish cycle.
- **`aria-live="polite"` on `#result-count`** — high-value screen-reader win but crosses the v1-DOM exclusion line this cycle. Revisit in a dedicated a11y cycle.
- **Escape-to-clear keyboard handler on `#search`** — redundant with native `type="search"` Escape in some browsers; could be wired for cross-browser parity in a polish cycle.
- **`window.__setSort(key, asc)` dev hook** — Phase 6 scope.
- **`:focus-visible` ring on `.pill`** — noted as minor a11y gap in CODEBASE.md §4.2; Phase 6 or later polish.
- **Sort pills DOM, 10 pill buttons, `applySort()`, `sortKey` / `sortAsc` state, `baseWage` desc-default quirk** — Phase 6 (SRCH-02-c1, SRCH-03-c1).

</deferred>

---

*Phase: 05-search-filter*
*Context gathered: 2026-04-24*
