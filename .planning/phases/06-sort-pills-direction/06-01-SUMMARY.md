---
plan: 06-01
phase: 06-sort-pills-direction
objective: "Land the #pills-wrap > #pills DOM scaffold inside #controls in index.html, reserve the two new module-scope state variables (sortKey, sortAsc) in app.js, and add the single new .pill:focus-visible CSS rule. Structural prerequisite for Plan 06-02, which wires the sort pipeline, pill-click handler, and dev hook."
status: complete
---

# Plan 06-01 Summary

## Completed Tasks

| Task | Description | Commits |
|------|-------------|---------|
| 06-01-01 | Insert `#pills-wrap > #pills` DOM into `index.html` — 14-line block as sibling of `#search-wrap` inside `#controls`, 10 `<button class="pill" data-key="…" aria-pressed="…">` children in exact order (Name, Wage, HP, MSk, RSk, MDf, RDf, Fat, Res, Ini), Name pill preset with `.active` + `aria-pressed="true"` + `<span class="arrow">▲</span>` (literal U+25B2) | a5f1bd4 |
| 06-01-02 | Reserve `let sortKey = 'name';` and `let sortAsc = true;` module-scope state in `app.js` after the Phase 5 D-19 block, demarcated with a new `// ── Phase 6 D-19: sort state (consumed by applySort + pill handler in 06-02) ──` header; updated stale `// Phase 6 state (sortKey, sortAsc) intentionally absent.` comment for accuracy (optional discretion item) | 5116a72 |
| 06-01-03 | Add single new `.pill:focus-visible { outline: 2px solid var(--amber); outline-offset: 2px; }` rule to `styles.css` immediately after the existing `.pill .arrow` rule (inserted at lines 142–145, before the RESULT COUNT section) | f9fd6b2 |

## Key Files

### Created

- None — plan modifies existing files only.

### Modified

- `index.html` — Inserted 14-line `<div id="pills-wrap">` block at lines 24–37, as a sibling of `#search-wrap` inside `#controls`, matching the 6-space sibling indentation. Contains `<div id="pills">` with 10 `<button class="pill" data-key="…" aria-pressed="…">` children. The Name pill carries `class="pill active"`, `aria-pressed="true"`, and a `<span class="arrow">▲</span>` child (arrow verified as U+25B2 BLACK UP-POINTING TRIANGLE via codepoint check). The other 9 pills carry `class="pill"`, `aria-pressed="false"`, and no arrow child. No per-pill `aria-label`, no `tabindex`, no inline `onclick`. Activates the dormant `#pills-wrap`, `#pills`, `.pill`, `.pill.active`, `.pill .arrow` rules that have been shipping dormant in `styles.css` lines 96–140 since Phase 1.
- `app.js` — Appended 4 lines (1 comment header + 2 declarations + 1 blank) after line 15 (`let query = '';`): `// ── Phase 6 D-19: sort state (consumed by applySort + pill handler in 06-02) ──` followed by `let sortKey = 'name';` and `let sortAsc = true;`. Additionally updated the pre-existing module-state subheader comment from `// Phase 6 state (sortKey, sortAsc) intentionally absent.` to `// All module state for v2.0 Search & Sort is now declared (Phases 5 + 6).` for accuracy (optional discretion item flagged in the plan). No behavior change — these are reserved state slots; Plan 06-02 wires them.
- `styles.css` — Inserted a single new 4-line rule at lines 142–145, immediately after the existing `.pill .arrow { … }` rule (ends line 140) and before the `/* ── RESULT COUNT ── */` section header (now line 147). The rule uses `var(--amber)` (token already defined in `:root` at line 9 as `#d4a843`), `outline` (not `border`, so no layout shift), and `outline-offset: 2px`. No other CSS edits.

## Decisions Implemented

- **D-07** — `#pills-wrap > #pills` inserted as sibling AFTER `#search-wrap` INSIDE `#controls`; `#controls` remains the sole sticky container, `#pills-wrap` provides horizontal overflow scroll.
- **D-08** — 10 pills render in exact order: Name, Wage, HP, MSk, RSk, MDf, RDf, Fat, Res, Ini.
- **D-09** — Each pill is a `<button class="pill" data-key="…">` element (not `<div>`/`<span>`/`<a>`) — preserves free keyboard activation and focus ring. `data-key` values are exactly the strings consumed by Plan 06-02's `sortValue()`: `name`, `baseWage`, `hitpoints`, `meleeSkill`, `rangedSkill`, `meleeDefense`, `rangedDefense`, `fatigue`, `resolve`, `initiative`.
- **D-10** — Name pill ships active-state baked into initial HTML: `class="pill active"` + `aria-pressed="true"` + `<span class="arrow">▲</span>` child. Other 9 pills render with `class="pill"` + `aria-pressed="false"` + no arrow child. Eliminates first-paint flicker.
- **D-14** — Every pill carries `aria-pressed="true|false"` reflecting its active state. This is the one intentional mockup deviation (mockup lines 468–478 have no `aria-pressed`); justified by D-14 since these are NEW DOM (the "no a11y refactor of existing v1 DOM" exclusion does not apply).
- **D-15** — Did NOT add per-pill `aria-label`. Visible button text + `aria-pressed` already conveys label + state to screen readers; duplicating would produce double-announcement.
- **D-17** — No custom `tabindex`, no keyboard handlers on pills. `<button>` + default browser activation (Enter / Space) is sufficient.
- **D-18** — Single new CSS rule `.pill:focus-visible { outline: 2px solid var(--amber); outline-offset: 2px; }` added. Uses `var(--amber)` (NOT `--amber-dim`, NOT hard-coded hex). Uses `outline` (NOT `border`).
- **D-19** — Module-scope `let sortKey = 'name';` and `let sortAsc = true;` added at IIFE scope, immediately after the Phase 5 D-19 block. Initial values match D-10 hard-coded HTML (Name pill active, ▲ ASC) and the D-01 `sortAsc = key === 'name'` default-direction rule.
- **D-20** — `sortKey` / `sortAsc` are NOT exposed on `window`. Matches Phase 5 precedent (`query` / `filtered` also not exposed). Comment header convention `// ── Phase N D-NN: … ──` followed exactly.
- **D-27** — Exactly ONE new CSS rule added (the `.pill:focus-visible` rule from D-18). No other CSS edits: no new `:root` tokens, no modifications to existing `#pills-wrap`, `#pills`, `.pill`, `.pill:active`, `.pill.active`, `.pill .arrow`, or any other rule.
- **D-28** — No changes to `:root` tokens. `--ctrl-h: 88px` remains unused (harmless per CODEBASE.md §4.5).
- **D-29** — Name pill's arrow glyph is the literal Unicode character `▲` (U+25B2 BLACK UP-POINTING TRIANGLE), inserted as text content of a `<span class="arrow">` child. NOT an HTML entity (`&#9650;` / `&#x25B2;`), NOT a CSS `content:` pseudo-element. Codepoint verified via `node -e` script post-edit.

## NOT Implemented (Plan 06-02 Scope)

The following are explicitly deferred to Plan 06-02 per the plan's scope boundary:

- `sortValue(bg, key)` helper (mockup lines 593–607).
- `applySort()` helper (mockup lines 608–616) and its single-line insertion inside `applyFilter()`.
- Delegated pill-click handler on `#pills` (D-11, D-12, D-13 — iterate pills, update `.active` + `aria-pressed` + arrow span).
- Extension of `wireControls()` with the pill-click listener (D-25).
- `window.__setSort(key, asc)` dev hook (D-21..D-24).
- Initial `applyFilter()` call at end of `load()` success branch (D-26).

## Deviations from Plan

### Rule 1 (correctness): reverted REQUIREMENTS.md SRCH-02-c1 completion mark

- **Found during:** state-update step after SUMMARY creation.
- **Issue:** `06-01-PLAN.md` frontmatter declares `requirements: [SRCH-02-c1]`. Per the executor protocol, the state-update step ran `lgsd-tools requirements mark-complete SRCH-02-c1`, flipping the `[ ]` to `[x]` and setting the traceability row to `Complete`. However, the plan's own `<success_criteria>` block explicitly states that "Success Criteria SC-1 … and SC-2 … are **partially delivered** by this plan" and that clicking pills "currently does nothing (correct for this plan; wiring arrives in Plan 06-02)". REQUIREMENTS.md SRCH-02-c1 reads *"User can sort the background list by any of 10 attributes …"* — actual sort behavior does not exist yet; it lands in Plan 06-02. Marking the requirement complete at 06-01 would be factually incorrect.
- **Fix:** Edited `.planning/REQUIREMENTS.md` to restore `[ ] SRCH-02-c1` and set the traceability row status to `In Progress`. Plan 06-02 will re-mark it complete upon shipping the handler, `applySort`, `sortValue`, and `__setSort`.
- **Files modified:** `.planning/REQUIREMENTS.md`.
- **Commit:** Folded into the final metadata commit (see below) — this edit touches only documentation state, consistent with the metadata-commit contract.
- **Root cause:** The plan's frontmatter conflates "requirement this plan **contributes to**" with "requirement this plan **completes**". A future planning refinement could distinguish these (e.g. `contributes_to:` vs. `completes:`), but that is out of scope for 06-01.

### Rule 2 (correctness): fixed stale STATE.md body text

- **Found during:** post-tooling state-update step.
- **Issue:** After running `lgsd-tools state advance-plan`, the tool (a) mistakenly interpreted 06-01 as the final plan of the cycle because the Current Position text body still referenced Phase 5 ("Plan: 2 of 2 in current phase (05-01 complete)") and (b) set `status: verifying` in the frontmatter. The text body also retained "50% (1 / 2 plans)" and a stale Velocity block dating from the 05-01 commit, while 05-02 was already shipped (commit `ffaac0c`). The frontmatter progress data (`completed_plans: 3`, `percent: 75`) after `state update-progress` conflicted with the body narrative.
- **Fix:** Updated `.planning/STATE.md` body surgically: (a) `Current focus` → Phase 6; (b) `Current Position` block → Phase 6 of 6 / Plan 1 of 2 / Status "Ready to execute 06-02"; (c) progress bar → `[████████░░] 75% (3 / 4 plans)`; (d) Velocity totals refreshed (3 plans, 328 s total, 109 s avg); (e) By-Phase table now shows Phase 5 complete (2/2) and Phase 6 in progress (1/2); (f) Per-plan log now includes 05-01, 05-02, 06-01 in one contiguous table (the previous append had placed 05-02 and 06-01 as trailing lines outside the table); (g) `status: verifying` → `status: executing` in frontmatter (cycle is not done — Plan 06-02 remains); (h) Resume file → `.planning/phases/06-sort-pills-direction/06-02-PLAN.md`.
- **Files modified:** `.planning/STATE.md`.
- **Commit:** Folded into the final metadata commit.
- **Root cause:** `state advance-plan` currently relies on the body-text "Plan: N of M" header to determine phase boundaries, and the header had not been updated by prior plan commits, so the counter incremented along the wrong axis. Out of scope to rework the tool here; surgical body edit restores consistency with the authoritative frontmatter progress block.

The mockup deviation for `aria-pressed="true|false"` on every pill is itself a planned decision (D-14), not an executor-introduced deviation. The optional-discretion update to the stale `// Phase 6 state … intentionally absent.` comment on `app.js` line 5 was explicitly flagged in the plan's action block as acceptable ("You MAY update it to … — Either choice is fine; no behavior impact") and is likewise not a deviation.

## Known Stubs

**Pills render but clicking them does nothing.**

- File: `index.html` lines 24–37; backing state `app.js` lines 17–19.
- Reason: This is the explicit Plan 06-01 contract per the plan's `<verify>` block item 9 ("clicking a pill currently does nothing — correct for this plan; wiring arrives in Plan 06-02") and the `<output>` block hand-off note. Plan 06-01 lands the DOM, the state slots, and the focus-visible CSS only. The delegated click handler, `applySort()` / `sortValue()` helpers, and `window.__setSort` dev hook all ship in Plan 06-02.
- Resolution plan: **06-02-PLAN.md** (next plan in this phase).

## Hand-off Note for Plan 06-02

Pills DOM is live with the Name-active preset; `sortKey = 'name'` / `sortAsc = true` state is reserved at module scope; the `.pill:focus-visible` CSS rule shipped. Plan 06-02 adds:

1. `sortValue(bg, key)` helper per D-03 — `name → bg.name.toLowerCase()`, `baseWage → bg.baseWage`, any attribute key → `bg.attributes[key].average ?? 0`. No `Math.abs()` on `rangedDefense` (negative values are legitimate).
2. `applySort()` helper per D-04/D-05 — in-place mutation of module-scope `filtered`, bare `<`/`>` comparator with `sortAsc` flip, no secondary tie-breaker (ES2019+ stable sort preserves insertion order on ties).
3. `applySort()` invocation inserted inside `applyFilter()` between the `filtered = …` assignment (app.js line 446–448) and `renderList(filtered)` (line 451) — the "single line insertion" promised by Phase 5 D-05.
4. Delegated pill-click handler per D-11/D-12/D-13 — attach `'click'` listener on `#pills` (not per-pill); `e.target.closest('.pill')` null-guard; same-key toggles direction, different-key switches key with `sortAsc = key === 'name'` default; `openId = null` reset; shared pill-UI-update routine (swap `.active` class, `aria-pressed`, `<span class="arrow">▲|▼</span>`); call `applyFilter()`.
5. Extend `wireControls()` with the pill-click listener (D-25). `wireControls()` is still called exactly once from `load()`'s success branch (no change to call site).
6. `window.__setSort(key, asc)` dev hook per D-21..D-24 — two-arg signature; validate `key` against the 10 known keys (`console.warn` + no-op on invalid); valid keys set `sortKey`/`sortAsc`/`openId=null`, run shared pill-UI-update routine, call `applyFilter()` synchronously (no debounce).
7. One `applyFilter()` call at end of `load()` success branch per D-26 — belt-and-suspenders to guarantee name-sorted initial order even if the JSON arrives un-sorted (Phase 5 Plan 05-02 already landed this call at load() line 508 for the empty-query initial render; Phase 6 inherits it — verify whether an additional call is needed, likely no change required since `applyFilter()` will invoke `applySort()` after Plan 06-02's pipeline edit).

No CSS or DOM edits are anticipated for Plan 06-02 — it is JS-only.

## Self-Check: PASSED

Verified after writing this SUMMARY:

- `index.html` exists and contains `<div id="pills-wrap">` + `<div id="pills">` as siblings of `#search-wrap` inside `#controls` (verified by inspecting the file — `#pills-wrap` opens at line 24, closes at line 37, between `#search-wrap`'s closing `</div>` on line 23 and `#controls`'s closing `</div>` on line 38).
- `index.html` contains exactly 10 `<button class="pill" data-key="…">` elements in the mandated order (`name`, `baseWage`, `hitpoints`, `meleeSkill`, `rangedSkill`, `meleeDefense`, `rangedDefense`, `fatigue`, `resolve`, `initiative`).
- Arrow glyph codepoint verified as `U+25B2` via `node -e` script that reads index.html and extracts the codepoint of the single character inside `<span class="arrow">…</span>`.
- `app.js` contains `let sortKey = 'name';` and `let sortAsc = true;` at lines 18–19, immediately after `let query = '';` (line 15) and before `const DATA_URL` (line 21), demarcated by the D-19 comment header at line 17.
- `app.js` passes `node -c app.js` syntax check.
- `styles.css` contains the `.pill:focus-visible { outline: 2px solid var(--amber); outline-offset: 2px; }` rule at lines 142–145, immediately after `.pill .arrow` (line 140) and before `#result-count` (line 148). `git diff styles.css` shows exactly this one rule added and nothing else.
- Commit `a5f1bd4` (Task 1 — index.html pills DOM) found in `git log`.
- Commit `5116a72` (Task 2 — app.js sort state) found in `git log`.
- Commit `f9fd6b2` (Task 3 — styles.css focus-visible rule) found in `git log`.
- No `__setSort`, `sortValue`, `applySort`, or pill-click handler added to `app.js` — grep confirms (only the new `let sortKey`/`let sortAsc` declarations and the comment header).
- No other CSS files modified; no `:root` token changes.
