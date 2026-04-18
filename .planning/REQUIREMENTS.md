# Requirements: Battle Brothers Companion

**Defined:** 2026-04-16
**Core Value:** Instant, scannable access to every background's stats so players can compare and make informed hiring decisions

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Data Display

- [x] **DATA-01**: All 67 backgrounds from backgrounds.json render in an accordion list
- [x] **DATA-02**: Each collapsed row shows background icon, name, mini sparkline of stats, wage badge, and expand chevron
- [ ] **DATA-03**: Expanding a row reveals color-coded stat bars (HP, MSk, RSk, MDf, RDf, Fat, Res, Ini) with red-yellow-green gradient
- [ ] **DATA-04**: Expanded panel shows stat ranges (min-max) and averages for each attribute
- [ ] **DATA-05**: Expanded panel shows level-up bonuses (positive/negative) for each attribute
- [ ] **DATA-06**: Expanded panel shows badges for starting level range and base wage

### Visual Design

- [x] **VISU-01**: Dark theme with amber/gold accents matching design3_accordion.html mockup
- [x] **VISU-02**: Mobile-first layout (430px max-width) with responsive scrolling and touch-optimized interactions
- [ ] **VISU-03**: Background icons loaded from assets/icons/ directory with fallback on missing images
- [x] **VISU-04**: CSS custom properties for theming, system font stack, scrollbar customization

### Navigation & Chrome

- [ ] **NAV-01**: Result count displayed (e.g. "67 of 67 backgrounds")
- [ ] **NAV-02**: Bottom navigation bar with Backgrounds (active) and Build (placeholder) tabs
- [ ] **NAV-03**: Empty state displayed when search returns no results

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Build Calculator

- **BUILD-01**: Build tab allows users to create and compare character builds
- **BUILD-02**: Users can select a background and simulate stat growth with level-up choices

### Search & Sort

- **SRCH-01**: Search bar filters backgrounds by name in real time with debounced input
- **SRCH-02**: Sortable pill buttons for each stat (Name, Wage, HP, MSk, RSk, MDf, RDf, Fat, Res, Ini)
- **SRCH-03**: Each pill toggles between ascending and descending sort order with visual indicator

### Accessibility

- **A11Y-01**: ARIA attributes on accordion (role, aria-expanded, aria-controls)
- **A11Y-02**: Keyboard navigation (tab, Enter/Space to expand)
- **A11Y-03**: Screen reader text for sparklines and color-coded bars

## Out of Scope

| Feature | Reason |
|---------|--------|
| Server-side rendering / backend | Static frontend only — no server needed |
| User accounts / saved data | Not needed for a reference tool |
| Real-time wiki sync | Data scraped once; manual updates sufficient |
| Mobile native app | Web-first, accessible from any device |
| Framework migration (React, Vue, etc.) | Vanilla JS matches mockup; no added complexity needed |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 1: Foundation & Data Loading | Complete |
| DATA-02 | Phase 2: Collapsed Row Display | Complete |
| DATA-03 | Phase 3: Expanded Detail Panel | Pending |
| DATA-04 | Phase 3: Expanded Detail Panel | Pending |
| DATA-05 | Phase 3: Expanded Detail Panel | Pending |
| DATA-06 | Phase 3: Expanded Detail Panel | Pending |
| VISU-01 | Phase 1: Foundation & Data Loading | Complete |
| VISU-02 | Phase 1: Foundation & Data Loading | Complete |
| VISU-03 | Phase 2: Collapsed Row Display | Pending |
| VISU-04 | Phase 1: Foundation & Data Loading | Complete |
| NAV-01 | Phase 4: Navigation & Polish | Pending |
| NAV-02 | Phase 4: Navigation & Polish | Pending |
| NAV-03 | Phase 4: Navigation & Polish | Pending |

**Coverage:**
- v1 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0

---
*Requirements defined: 2026-04-16*
*Last updated: 2026-04-16 after roadmap creation*
