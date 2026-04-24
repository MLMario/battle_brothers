# Roadmap: Battle Brothers Companion

## Overview

v1.0 MVP shipped 2026-04-24 at https://mlmario.github.io/battle_brothers/ — 67 backgrounds rendered in a mobile-first accordion with icons, sparklines, stat bars, level-up bonuses, and bottom navigation. v2.0 adds the search + sort controls deferred from cycle 1, porting the reference implementation in `mockups/design3_accordion.html` into the shipped `app.js` / `index.html` and activating the dormant CSS already present in `styles.css`. Scope is strictly the three SRCH requirements carried over from cycle 1 — no new visual features, no new data, no new nav.

## Milestones

- ✅ **v1.0 MVP** — Phases 1–4 (shipped 2026-04-24)
- 🚧 **v2.0 Search & Sort** — Phases 5–6 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1–4) — SHIPPED 2026-04-24</summary>

### Phase 1: Foundation
**Goal**: Production shell, verbatim CSS port, zero-dependency static site scaffold
**Requirements**: (v1 cycle-1 — DATA/VISU/NAV set)
**Plans**: shipped

### Phase 2: Data pipeline
**Goal**: `fetch('data/backgrounds.json')` with skeleton + error states; 67 backgrounds rendered
**Requirements**: (v1 cycle-1)
**Plans**: shipped

### Phase 3: Accordion + panels
**Goal**: Per-row icon / name / sparkline / wage / chevron; expanded panels with stat bars, ranges, averages, level-ups, badges
**Requirements**: (v1 cycle-1)
**Plans**: shipped

### Phase 4: Navigation + empty state + deploy
**Goal**: Bottom nav, result count, empty state, GitHub Pages deploy
**Requirements**: (v1 cycle-1)
**Plans**: shipped

**Cycle-1 summary:** 4 phases / 11 plans / 13 requirements (DATA-01..06, VISU-01..04, NAV-01..03). Full shipment detail preserved in `.planning/CYCLE-LOG.md` entry dated 2026-04-24.

</details>

### 🚧 v2.0 Search & Sort (In Progress)

**Milestone Goal:** Users can narrow the 67-background list to what they care about right now — by name (search) or by any attribute (sort pills with direction toggle) — matching the `design3_accordion.html` mockup contract exactly.

- [ ] **Phase 5: Search filter** — Real-time name search with debounced substring match
- [ ] **Phase 6: Sort pills + direction** — 10-attribute sticky pill row with ▲/▼ toggle on re-click

## Phase Details

### Phase 5: Search filter
**Goal**: User can narrow the background list by typing a name fragment, with results updating in real time
**Depends on**: Phase 4 (shipped — requires `#app`, `#list`, `#result-count`, `#empty`, `setEmpty()`, `updateCount()`, `renderList()` all in place)
**Requirements**: SRCH-01-c1
**Success Criteria** (what must be TRUE):
  1. A search input is visible at the top of the page, above the result-count line, sticky to the `#app` top edge when the list scrolls.
  2. Typing `knight` into the search input filters the list to only backgrounds whose `name` contains `knight` (case-insensitive substring match); results update ~180 ms after the last keystroke.
  3. Clearing the search input (including via the native `type="search"` clear button) restores the full list of 67 backgrounds.
  4. When the search yields zero matches, the empty state (`#empty`) appears and the list is hidden; `#result-count` reads `0 of 67 backgrounds`.
  5. Opening an accordion row, then typing a search query that no longer matches that row, does not leave a stale open reference — subsequent renders reach a clean state (no phantom open row after clearing).
**Plans**: 2

Plans:
- [x] 05-01: DOM scaffold + state slots (#controls > #search-wrap, filtered/query) — completed 2026-04-24
- [ ] 05-02: Wire applyFilter + 180ms debounce + wireControls() + __setQuery dev hook

### Phase 6: Sort pills + direction
**Goal**: User can reorder the background list by any of 10 attributes and flip ascending/descending by re-clicking the active pill
**Depends on**: Phase 5 (requires `#controls` scaffold from Phase 5 and `applyFilter` / render pipeline in place so sort can compose with search)
**Requirements**: SRCH-02-c1, SRCH-03-c1
**Success Criteria** (what must be TRUE):
  1. A horizontal row of 10 pill buttons (Name, Wage, HP, MSk, RSk, MDf, RDf, Fat, Res, Ini) is visible below the search input; the row scrolls horizontally on narrow viewports with no visible scrollbar.
  2. On first load, the `Name` pill is active (amber-filled) and displays an `▲` glyph; the list is sorted alphabetically ascending by name.
  3. Clicking any non-active pill switches the sort to that attribute; the pill becomes active (amber fill), and the previously active pill returns to the unfilled state; name defaults to `▲` ascending, every other key defaults to `▼` descending (higher = first).
  4. Clicking the currently active pill toggles direction; the glyph flips between `▲` and `▼` and the list order reverses.
  5. Sort composes correctly with search: narrowing by name and then clicking a stat pill sorts only the filtered subset; clearing search and then sorting applies to all 67 backgrounds.
  6. Changing sort key or direction resets any currently open accordion row so there is no stale-open-id pointing to a row that has since been re-rendered.
**Plans**: TBD

Plans:
- [ ] 06-01: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | shipped | Complete | 2026-04-24 |
| 2. Data pipeline | v1.0 | shipped | Complete | 2026-04-24 |
| 3. Accordion + panels | v1.0 | shipped | Complete | 2026-04-24 |
| 4. Navigation + empty state + deploy | v1.0 | shipped | Complete | 2026-04-24 |
| 5. Search filter | v2.0 | 1/2 | In Progress | - |
| 6. Sort pills + direction | v2.0 | 0/TBD | Not started | - |

---
*Created 2026-04-16; v2.0 milestone opened 2026-04-24*
