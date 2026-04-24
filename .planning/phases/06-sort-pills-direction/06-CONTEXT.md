---
phase: 06-sort-pills-direction
phase_name: Sort pills + direction
gathered: 2026-04-24
status: Ready for planning
---

# Phase 6: Sort pills + direction - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Add a horizontal row of 10 sticky sort pills (Name, Wage, HP, MSk, RSk, MDf, RDf, Fat, Res, Ini) below Phase 5's search input inside the existing `#controls` container. Clicking a non-active pill switches the sort key; re-clicking the currently active pill toggles ascending / descending direction. Sort composes with the Phase 5 search pipeline — `applyFilter()` invokes `applySort()` so the rendered subset is both filtered AND ordered on every state change. Lands `sortKey` / `sortAsc` state, the `applySort` + `sortValue` helpers, the delegated pill-click handler, and the `window.__setSort` dev hook. Delivers SRCH-02-c1 and SRCH-03-c1; closes the v2.0 Search & Sort milestone.

</domain>

<decisions>
## Implementation Decisions

### Default sort direction per key (baseWage parity)
- **D-01:** Mockup parity on first-click direction — default ASC for `name`, default DESC for every other key (9 of 10). Governing rule: `sortAsc = key === 'name'` (mockup line 827). `baseWage` therefore defaults DESC (most expensive first) on its first click even though lower wage = cheaper mercenary. CODEBASE.md §4.6 explicitly recommends parity for this cycle; file as a UX nit for a future polish cycle if users complain. Do NOT fork from the mockup contract.

### Sort stability and tie-breaker
- **D-02:** Bare `a < b` / `a > b` comparison via `sortValue()`. No secondary tie-breaker. ES2019+ mandates stable `Array.prototype.sort`, so ties preserve the `allBgs` insertion order (which in turn reflects `backgrounds.json` on-disk order). Matches mockup verbatim.
- **D-03:** `sortValue(bg, key)` contract (mockup lines 593–607):
  - `name` → `bg.name.toLowerCase()`
  - `baseWage` → `bg.baseWage`
  - any of the 8 attribute keys → `bg.attributes[key].average ?? 0`
  Do NOT wrap `rangedDefense.average` in `Math.abs()` — it is legitimately negative (e.g. Adventurous Noble = `-5`); numeric comparison handles sign correctly (CODEBASE.md §4.1 + §4.4).

### Pipeline composition
- **D-04:** `applyFilter()` from Phase 5 grows a single line: immediately after populating `filtered` and BEFORE `renderList` + `updateCount` + `setEmpty`, call `applySort()` which sorts `filtered` in place. This is the "single line insertion" promised by Phase 5 D-05. One entry point for any state change that requires a re-render.
- **D-05:** `applySort()` operates on the module-scope `filtered` array (no-arg, in-place mutation) — matches app.js convention where all helpers read module state directly rather than receiving args.
- **D-06:** Pill clicks re-run the full `applyFilter()` (not `applySort + renderList` alone). Accepts one redundant filter pass over 67 items (trivial cost) in exchange for a single predictable re-render entry point.

### Pill DOM scaffold
- **D-07:** `#pills-wrap > #pills` inserts as a sibling AFTER `#search-wrap` inside `#controls` (mockup lines 468–478 verbatim). `#controls` remains the sole sticky container; `#pills-wrap` provides horizontal overflow scroll.
- **D-08:** 10 pills render in this exact order: Name, Wage, HP, MSk, RSk, MDf, RDf, Fat, Res, Ini. Matches ROADMAP.md SC-1 and mockup order.
- **D-09:** Each pill is a `<button class="pill" data-key="…">` element. Mockup uses `<button>` (not `<div>` / `<span>`) — preserves free keyboard activation and focus ring without extra ARIA. `data-key` values are the exact strings used by `sortValue()`: `name`, `baseWage`, `hitpoints`, `meleeSkill`, `rangedSkill`, `meleeDefense`, `rangedDefense`, `fatigue`, `resolve`, `initiative`.
- **D-10:** Name pill ships with the active-state baked into initial HTML: `<button class="pill active" data-key="name" aria-pressed="true">Name <span class="arrow">▲</span></button>`. First paint shows the correct active pill + glyph without waiting for JS. The other 9 pills render as `<button class="pill" data-key="…" aria-pressed="false">…</button>` — no `<span class="arrow">` child, no `.active` class. Eliminates first-paint flicker and aligns with ROADMAP SC-2.

### Pill click handler (delegated)
- **D-11:** Single delegated `click` listener attached to `#pills` (not to each `.pill`). Matches mockup pattern (lines 818–844) and the one documented exception in CODEBASE.md §2: "Event wiring is direct … EXCEPT where the mockup uses delegation (`pills` click handler — copy that pattern for SRCH-02)."
- **D-12:** Handler logic, in order:
  1. `const pill = e.target.closest('.pill'); if (!pill) return;` — null-guard per app.js defensive convention.
  2. `const key = pill.dataset.key;`
  3. If `key === sortKey`: `sortAsc = !sortAsc`. Else: `sortKey = key; sortAsc = (key === 'name');` — applies the D-01 default-direction rule.
  4. `openId = null;` — per SC-6 and Phase 5 D-10 precedent; the prior open row's `<article>` will be destroyed by the re-render.
  5. Update pill UI (see D-13).
  6. Call `applyFilter()` — which invokes `applySort()` → `renderList(filtered)` → `updateCount(filtered.length, allBgs.length)` → `setEmpty(...)`.
- **D-13:** Pill UI update routine (reusable — called from D-12 handler AND from `__setSort`): iterate every `.pill`, set `.active` class + `aria-pressed` in sync (active pill = `.active` + `aria-pressed="true"`; all others = no `.active` + `aria-pressed="false"`), remove any existing `<span class="arrow">` child from every pill, then append a fresh `<span class="arrow">` to the newly active pill with text content `▲` (if `sortAsc`) or `▼` (if `!sortAsc`).

### Pill accessibility
- **D-14:** Every pill carries `aria-pressed="true|false"` reflecting its active state. Updated in lockstep with the `.active` class by the D-13 routine. New DOM — respects the REQUIREMENTS.md out-of-scope line "Accessibility refactor of existing v1 DOM" (Phase 5 D-11 precedent for accepting a11y on new DOM).
- **D-15:** Do NOT add per-pill `aria-label`. Visible button text + `aria-pressed` already conveys label + state to screen readers; duplicating would produce double-announcement.
- **D-16:** Do NOT add `aria-live` to `#result-count`. Crosses the v1-DOM exclusion line — Phase 5 D-12 precedent holds; revisit in a dedicated a11y cycle.
- **D-17:** No custom keyboard handlers on pills. `<button>` + default browser activation (Enter / Space) is sufficient; tab focus walks pills in order; focus on off-screen pills triggers native browser scroll-into-view.
- **D-18:** Add a single new CSS rule to `styles.css`: `.pill:focus-visible { outline: 2px solid var(--amber); outline-offset: 2px; }` (or equivalent using an existing amber token — check `:root` and use the correct variable name). This is the ONLY new CSS rule required; all other pill styles already ship dormant (styles.css lines 110–140 per CODEBASE.md §4.2). CODEBASE.md §4.2 flagged this as a minor a11y gap; new-DOM-adjacent so acceptable this cycle.

### State additions (inside IIFE, after Phase 5's `filtered` / `query`)
- **D-19:** Add module-scope state `let sortKey = 'name';` and `let sortAsc = true;` immediately after the Phase 5 additions. Initial values match D-10's hard-coded HTML (Name pill active, ▲ ASC).
- **D-20:** Do NOT expose `sortKey` / `sortAsc` on `window` beyond the `__setSort` dev hook (D-21..D-24). Matches Phase 5 precedent (`query` / `filtered` are not exposed).

### Dev hook — `window.__setSort`
- **D-21:** Signature: `window.__setSort = (key, asc) => { … };`. Both arguments are required. Mirrors the `__setEmpty` / `__setQuery` precedent from Phase 5 (D-15 / D-16 / D-17).
- **D-22:** Behavior: validate `key` against the 10 known keys (`['name','baseWage','hitpoints','meleeSkill','rangedSkill','meleeDefense','rangedDefense','fatigue','resolve','initiative']`). On invalid key: `console.warn('__setSort: unknown key', key);` and return (no-op). On valid key: set `sortKey = key; sortAsc = !!asc; openId = null;`, run the D-13 pill UI update routine, call `applyFilter()` synchronously. No debounce to bypass (pills have none), but the synchronous `applyFilter()` matches the `__setQuery` pattern of "verifiable without `await sleep(...)`".
- **D-23:** Partial-arg forms are NOT supported — `__setSort('hp')` is treated as `asc === undefined → !!asc === false → DESC` via coercion, which is technically defined but fragile. Verification scripts MUST pass both args explicitly. Simplicity > clever defaults.
- **D-24:** Always exposed on `window` — no hostname / env gating. Matches Phase 5 D-17. Static GitHub Pages site has no meaningful prod / dev split.

### Wire-up
- **D-25:** Extend the existing `wireControls()` function (shipped by Phase 5 at plan 05-02) with the delegated pill-click listener on `#pills`. `wireControls()` is still called exactly once from the `.then()` success branch of `load()`, after `renderList` — unchanged from Phase 5.
- **D-26:** At the end of `load()`'s success branch (after `wireControls()`), make one call to `applyFilter()` so the initial render reflects `sortKey='name', sortAsc=true`. The Name pill's hard-coded HTML active state (D-10) already matches; this call guarantees the data order is correct on first paint in case the JSON arrived in a non-name-sorted order. (In practice the JSON is already name-sorted, so this is belt-and-suspenders.)

### CSS additions
- **D-27:** Exactly ONE new CSS rule this phase: the `.pill:focus-visible` rule from D-18. No other CSS edits. The dormant `#pills-wrap`, `#pills`, `.pill`, `.pill:active`, `.pill.active`, `.pill .arrow` rules (styles.css lines 96–140 per CODEBASE.md §4.2) are sufficient without modification.
- **D-28:** No changes to `:root` tokens. `--ctrl-h: 88px` remains unused (harmless — see CODEBASE.md §4.5).

### Arrow glyph rendering
- **D-29:** Arrow glyphs are literal Unicode characters `▲` (U+25B2) and `▼` (U+25BC). Inserted as the text content of a `<span class="arrow">` child element, dynamically added / removed by JS (D-13). Matches mockup verbatim. No HTML entities, no CSS `content:` pseudo-element, no data-attribute content swap.

### Claude's Discretion
- Exact internal factoring of the D-13 pill UI update routine (inline vs. named helper like `updatePillUI()`). Either shape is fine as long as it is called from both the click handler and `__setSort`.
- Exact placement of the new helpers (`sortValue`, `applySort`) in `app.js`. The CODEBASE.md §3 insertion point "between `renderList` (line 429) and `load` (line 432)" remains the natural home, adjacent to Phase 5's `applyFilter`.
- Comment header style for the new section — follow the existing `// ── Section ──` + `// ── D-NN: ... ──` convention already established through Phases 1–5. New D-IDs from this CONTEXT flow directly into those headers.
- Whether to factor the "known sort keys" list into a module-scope constant (e.g. `const SORT_KEYS = [...]`) that feeds both the `__setSort` validation (D-22) and any future reflection needs. Either constant or inline array literal is fine; follow app.js precedent (e.g. `ATTR_KEYS` is already a module-scope constant — matching that style is the recommended discretion but not locked).
- Whether to apply `pill.setAttribute('aria-pressed', ...)` or `pill.ariaPressed = ...` in the D-13 routine — both are equivalent; follow whichever idiom app.js already uses for attribute updates.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Reference implementation (mockup-parity — governing)
- `mockups/design3_accordion.html` lines 468–478 — `#pills-wrap` / `#pills` DOM structure with all 10 `<button class="pill" data-key="…">` entries.
- `mockups/design3_accordion.html` lines 530–548 — module state block; Phase 6 adds `sortKey`, `sortAsc` from this reference.
- `mockups/design3_accordion.html` lines 593–607 — `sortValue(bg, key)` contract: string-lowercased name, scalar baseWage, attribute `.average` with `?? 0` fallback.
- `mockups/design3_accordion.html` lines 608–616 — `applySort()` comparator using bare `<` / `>` and `sortAsc` flip.
- `mockups/design3_accordion.html` lines 818–844 — delegated pill-click handler: same-key toggles direction; different-key switches key and applies `sortAsc = key === 'name'` default; `.active` class + `.arrow` span management.
- `mockups/design3_accordion.html` line 827 — the single canonical default-direction rule: `sortAsc = key === 'name'`.

### Phase 5 outputs (compose-with targets)
- `.planning/phases/05-search-filter/05-CONTEXT.md` — Phase 5 decisions that Phase 6 composes onto: pipeline shape (D-05), `filtered` as single source of truth (D-06), `openId = null` reset on state change (D-10), dev-hook pattern (D-15..D-18), state insertion point (D-19..D-20).
- `app.js` (as shipped after plan 05-02) — `applyFilter` body, `wireControls` function, `filtered` / `query` module state, `window.__setQuery` dev hook. Phase 6 extends these in place.

### Current shipped code (insertion targets)
- `app.js` lines 5–12 — module-scope state block (Phase 5 appended `filtered`, `query`; Phase 6 appends `sortKey`, `sortAsc`).
- `app.js` lines 422–429 — `renderList(arr)`. Accepts any array; unchanged by this phase.
- `app.js` lines 432–466 — `load()` with Phase 5's `wireControls()` call in the success branch. Phase 6 extends `wireControls()` with the pill-click listener; adds one `applyFilter()` call at end of success branch for initial sort (D-26).
- `app.js` — the Phase 5 `applyFilter` body, located between `renderList` (line 429) and `load` (line 432). Phase 6 inserts `applySort()` + `sortValue()` adjacent to `applyFilter`, and inserts a single `applySort()` invocation inside `applyFilter` before the render step.
- `index.html` — inside `#controls` (added by Phase 5 plan 05-01), insert `#pills-wrap > #pills` as a sibling AFTER `#search-wrap`.
- `styles.css` lines 96–140 — dormant pill / pills-wrap selectors already shipped. Phase 6 adds ONLY the `.pill:focus-visible` rule (D-18).

### Requirements and roadmap
- `.planning/REQUIREMENTS.md` SRCH-02-c1 — 10-attribute sort pill row with visible amber active-pill fill state.
- `.planning/REQUIREMENTS.md` SRCH-03-c1 — direction toggle on re-click of active pill; ▲/▼ glyph reflects current direction.
- `.planning/ROADMAP.md` Phase 6 Success Criteria — 6 criteria (10-pill row with horizontal scroll + hidden scrollbar; Name active ▲ ASC on first load; non-active click switches key with per-key default direction; active click toggles direction; sort composes with search; sort-change resets `openId`).
- `.planning/CODEBASE.md` §4.1 — concrete gap enumeration: exact pill HTML, `sortValue` contract, pill-click contract, data-key values.
- `.planning/CODEBASE.md` §4.2 — CSS sufficiency statement ("YES, with one caveat"); confirms the `.pill:focus-visible` gap.
- `.planning/CODEBASE.md` §4.3 — pill a11y notes (`aria-pressed` recommendation; `<button>` keyboard-activation inheritance).
- `.planning/CODEBASE.md` §4.4 — data parity check: `rangedDefense.average` can be negative; no `Math.abs()`.
- `.planning/CODEBASE.md` §4.5 — stale-`openId` rationale; confirms the D-12 step-4 reset is required.
- `.planning/CODEBASE.md` §4.6 — domain pitfalls; explicitly flags baseWage DESC default for sign-off (D-01 accepts parity).
- `.planning/PROJECT.md` Constraints — static frontend only; mockup visual parity; JSON data source.
- `.planning/PROJECT.md` Accumulated Context / STATE.md — "Mockup parity is the governing discipline for SRCH"; direction defaults and glyph rendering locked by mockup.

</canonical_refs>

<specifics>
## Specific Ideas

- "Mockup parity is the governing discipline for SRCH" (STATE.md Accumulated Context) — inherited from Phase 5 and reaffirmed here. Every ambiguity (default direction per key, glyph characters, DOM structure, comparator behavior) resolves to mockup lines 468–478 / 530–548 / 593–617 / 817–844 verbatim.
- The mockup's line 827 rule `sortAsc = key === 'name'` is the single canonical source for per-key default direction. D-01 captures the user-visible consequence (Wage defaults DESC even though low wage = cheap mercenary) and explicitly accepts parity for this cycle.
- Preserve the existing `// ── D-NN: … ──` comment header convention from app.js. Phase 6 D-IDs continue independently from Phase 5 (each CONTEXT.md carries its own D-01..D-NN sequence).
- The two-underscore `window.__setSort` naming signals "internal dev hook" and matches the `window.__setEmpty` / `window.__setQuery` precedent exactly — same shape, same exposure, same intent, same synchronous-bypass-debounce semantics for scripted verification.

</specifics>

<deferred>
## Deferred Ideas

- **baseWage special-cased to default ASC (cheapest first)** — ships mockup parity (DESC) this cycle per D-01. File as a UX nit for a future polish cycle if users report it surprising (CODEBASE.md §4.6 recommendation).
- **Secondary tie-breaker on equal averages (name-ASC secondary sort)** — stable ES2019+ sort + mockup parity carry the day this cycle. Revisit if users report ordering non-determinism.
- **`aria-live="polite"` on `#result-count`** — crosses the v1-DOM exclusion line (D-16 / Phase 5 D-12). Revisit in a dedicated a11y cycle along with `aria-expanded` on accordion rows and other v1 gaps enumerated in CODEBASE.md §4.5.
- **Auto-scroll the active pill into view when sort changes programmatically** — no mockup precedent; not required by any success criterion; user-triggered scroll + native focus-scroll behavior is sufficient.
- **Secondary sort keys (e.g. sort by HP with wage as tiebreak)** — out of scope; no requirement, no mockup precedent.
- **Escape-to-clear keyboard handler on `#search`** — carried over from Phase 5 deferred list; not reopened.
- **Refactor of the `applyFilter` / `applySort` pair into a single pipeline builder** — one entry point is fine; premature abstraction otherwise.

</deferred>

---

*Phase: 06-sort-pills-direction*
*Context gathered: 2026-04-24*
