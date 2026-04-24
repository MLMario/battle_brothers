# Requirements: Battle Brothers Companion

**Defined:** 2026-04-24 (cycle 2 — SRCH)
**Core Value:** Instant, scannable access to every background's stats so players can compare and make informed hiring decisions without leaving the game.

## v1 Requirements

This cycle's scope is tightly bounded to the three search/sort items deferred from cycle 1. All three carry the `-c1` suffix to mark their provenance (carried over from cycle 1). The dormant CSS for these controls already ships in `styles.css`; the reference implementation lives in `mockups/design3_accordion.html` lines 455–480 (DOM), 530–548 (state), 560–617 (sort/filter), 817–855 (event wiring).

### Search

- [ ] **SRCH-01-c1**: User can type in a search input to filter the 67 backgrounds by name in real time (case-insensitive substring match, 180ms debounce, name-only — not id)

### Sort

- [ ] **SRCH-02-c1**: User can sort the background list by any of 10 attributes via a horizontal row of sticky sort pills (Name, Wage, HP, MSk, RSk, MDf, RDf, Fat, Res, Ini) with a visible active-pill amber fill state
- [ ] **SRCH-03-c1**: User can toggle ascending / descending sort direction by re-clicking the active pill; the pill displays an ▲ (asc) or ▼ (desc) arrow glyph reflecting current direction

## v2 Requirements

None. User explicitly declared this cycle's scope as "implement the deferred items and nothing else."

## Out of Scope

Inherited from PROJECT.md cycle-1 exclusions, plus this cycle's scope boundary:

| Feature | Reason |
|---------|--------|
| Build tab functionality | v1 UI placeholder only; no calculator in v1 (cycle 1 decision) |
| Server-side rendering or backend | Static frontend only per Tech constraint |
| User accounts or saved data | Out of domain for a reference tool |
| Real-time data updates from the wiki | Scraped once per release |
| New visual features, new data fields, new navigation | Explicit cycle-2 scope boundary: "deferred items and nothing else" |
| Fuzzy search / prefix search / search across non-name fields | Mockup contract is substring match on name only; preserve parity |
| Accessibility refactor of existing v1 DOM | Known v1 gap; not re-opened this cycle |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SRCH-01-c1 | Phase 5 | Pending |
| SRCH-02-c1 | Phase 6 | Pending |
| SRCH-03-c1 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 3 total
- Mapped to phases: 3 ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-24*
*Last updated: 2026-04-24 after cycle-2 roadmap creation (Phases 5 & 6)*
