# Roadmap: Battle Brothers Companion

## Overview

This roadmap delivers the v1 Battle Brothers Companion -- a mobile-first static webpage displaying all 67 backgrounds in an accordion interface. The build progresses through four phases: first establishing the page foundation with data loading and core theming, then rendering collapsed row content with icons and sparklines, then building out the expanded detail panel with stat bars and badges, and finally adding navigation chrome and empty-state handling. Each phase produces a visually testable increment. Search and sort functionality (SRCH-01 through SRCH-03) has been deferred to v2.

## Phase Checklist

- [x] Phase 1: Foundation & Data Loading
- [x] Phase 2: Collapsed Row Display
- [ ] Phase 3: Expanded Detail Panel
- [ ] Phase 4: Navigation & Polish

---

## Phase 1: Foundation & Data Loading

**Goal:** Create the production `index.html` with the dark-themed page shell, CSS custom properties, mobile-first layout, and async data loading from `data/backgrounds.json`. Render all 67 backgrounds as clickable accordion rows (name only) to prove the data pipeline works end-to-end.

**Depends on:** Nothing (first phase)

**Requirements:**
- DATA-01: All 67 backgrounds from backgrounds.json render in an accordion list
- VISU-01: Dark theme with amber/gold accents matching design3_accordion.html mockup
- VISU-02: Mobile-first layout (430px max-width) with responsive scrolling and touch-optimized interactions
- VISU-04: CSS custom properties for theming, system font stack, scrollbar customization

**Success Criteria:**
1. Opening `index.html` in a browser loads and parses `data/backgrounds.json` via `fetch()` without errors
2. Exactly 67 accordion rows are rendered in the DOM (verifiable via DevTools: `document.querySelectorAll('.bg-item').length === 67`)
3. Page background is `#080808`, row surfaces are `#141414`, accent color is `#d4a843` -- matching the mockup's dark theme
4. Container is capped at `430px` max-width and centered; page scrolls smoothly on mobile viewports
5. CSS custom properties (at minimum `--bg`, `--surface`, `--amber`, `--border`, `--nav-h`) are defined on `:root` and used throughout styles

**Plans:** *(created during plan-phase)*

---

## Phase 2: Collapsed Row Display

**Goal:** Populate each collapsed accordion row with the background icon, name, mini sparkline bars, wage badge, and expand/collapse chevron so that the list is scannable at a glance.

**Depends on:** Phase 1

**Requirements:**
- DATA-02: Each collapsed row shows background icon, name, mini sparkline of stats, wage badge, and expand chevron
- VISU-03: Background icons loaded from assets/icons/ directory with fallback on missing images

**Success Criteria:**
1. Each row displays the correct PNG icon from `assets/icons/` at 36x36px with 6px border-radius
2. Missing or broken icon images show a fallback (sword emoji or placeholder) instead of a broken image
3. Mini sparkline bars appear for each row showing 8 colored bars reflecting the background's stat averages relative to global min/max
4. Wage badge displays the correct base wage value from the JSON data for each background
5. Chevron icon is visible on each row and rotates or changes on expand/collapse

**Plans:** *(created during plan-phase)*

---

## Phase 3: Expanded Detail Panel

**Goal:** Build the expanded accordion panel that reveals when a row is clicked, showing full stat bars with color-coded fills, stat ranges, level-up bonuses, and info badges. Only one panel open at a time.

**Depends on:** Phase 2

**Requirements:**
- DATA-03: Expanding a row reveals color-coded stat bars (HP, MSk, RSk, MDf, RDf, Fat, Res, Ini) with red-yellow-green gradient
- DATA-04: Expanded panel shows stat ranges (min-max) and averages for each attribute
- DATA-05: Expanded panel shows level-up bonuses (positive/negative) for each attribute
- DATA-06: Expanded panel shows badges for starting level range and base wage

**Success Criteria:**
1. Clicking a collapsed row smoothly animates open a detail panel; clicking again (or clicking another row) collapses it
2. Eight stat bars are displayed with widths proportional to the background's average relative to global min/max, colored on a red-yellow-green gradient
3. Each attribute row shows the min-max range and average value as text labels
4. Level-up bonuses are displayed per attribute, with `null` values handled gracefully (shown as "--" or omitted)
5. Starting level range and base wage appear as styled badges in the expanded panel

**Plans:** *(created during plan-phase)*

---

## Phase 4: Navigation & Polish

**Goal:** Add the top result count, bottom navigation bar, and empty-state display. This phase completes the v1 feature set and prepares the app for future v2 additions (search, sort, build tab).

**Depends on:** Phase 3

**Requirements:**
- NAV-01: Result count displayed (e.g. "67 of 67 backgrounds")
- NAV-02: Bottom navigation bar with Backgrounds (active) and Build (placeholder) tabs
- NAV-03: Empty state displayed when search returns no results

**Success Criteria:**
1. A result count reading "67 of 67 backgrounds" is visible at the top of the accordion list
2. A fixed bottom navigation bar is rendered with "Backgrounds" tab styled as active and "Build" tab styled as a placeholder
3. The bottom nav bar does not overlap accordion content (scroll area accounts for nav height via `--nav-h`)
4. When zero backgrounds match (testable by temporarily filtering the data), a friendly empty-state message is displayed instead of a blank list
5. All 13 v1 requirements are met and the page matches the mockup's visual design when compared side-by-side

**Plans:** *(created during plan-phase)*

---

## Progress

| Phase | Name | Status | Started | Completed |
|-------|------|--------|---------|-----------|
| 1 | Foundation & Data Loading | Complete | 2026-04-16 | 2026-04-17 |
| 2 | Collapsed Row Display | Complete | 2026-04-18 | 2026-04-18 |
| 3 | Expanded Detail Panel | Not Started | - | - |
| 4 | Navigation & Polish | Not Started | - | - |

---
*Roadmap created: 2026-04-16*
*Last updated: 2026-04-18*
