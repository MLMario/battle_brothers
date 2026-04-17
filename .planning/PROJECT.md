# Battle Brothers Companion

## What This Is

A mobile-first webpage that displays all 67 Battle Brothers character backgrounds with their stats in an accordion-style interface. Players can search, sort by any attribute, and expand rows to see detailed stat ranges, level-up bonuses, and color-coded attribute bars. Built as a quick reference tool for comparing backgrounds during gameplay.

## Core Value

Instant, scannable access to every background's stats so players can compare and make informed hiring decisions without leaving the game.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

- [ ] Display all 67 backgrounds from backgrounds.json in an accordion list
- [ ] Each collapsed row shows icon, name, mini sparkline, wage badge, and chevron
- [ ] Expanding a row reveals detailed stat bars (HP, MSk, RSk, MDf, RDf, Fat, Res, Ini) with color-coded fills
- [ ] Expanded panel shows stat ranges (min-max), averages, and level-up bonuses
- [ ] Search bar filters backgrounds by name in real time
- [ ] Sortable pill buttons for each stat (Name, Wage, HP, MSk, RSk, MDf, RDf, Fat, Res, Ini) with ascending/descending toggle
- [ ] Dark theme with amber/gold accents matching the accordion mockup (design3_accordion.html)
- [ ] Mobile-first layout (430px max-width) with responsive scrolling
- [ ] Background icons loaded from assets/icons/ directory
- [ ] Result count displayed (e.g. "67 of 67 backgrounds")
- [ ] Bottom navigation bar with Backgrounds and Build tabs
- [ ] Empty state when search returns no results
- [ ] Badges in expanded panel showing starting level and base wage

### Out of Scope

- Build tab functionality — UI placeholder only, no build calculator in v1
- Server-side rendering or backend — static frontend only
- User accounts or saved data
- Real-time data updates from the wiki

## Context

- Data source: backgrounds.json scraped from the Battle Brothers fandom wiki (67 backgrounds, 8 attributes each with min/max ranges, averages, and level-up modifiers)
- Design reference: mockups/design3_accordion.html (self-contained HTML mockup with embedded data and all CSS/JS)
- Icons: 60+ PNG portraits in assets/icons/ (36x36px display, 6px border-radius)
- The mockup already contains a working implementation with embedded data — the production version should load from the external JSON file instead

## Constraints

- **Tech**: Static frontend only (HTML/CSS/JS) — no build tools or frameworks required
- **Design**: Must match the accordion mockup's visual design closely (dark theme, gold accents, mobile-first)
- **Data**: Must consume backgrounds.json as the data source rather than embedding data inline

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Accordion layout (design3) | User selected from 3 mockup options | -- Pending |
| Static frontend, no framework | Simplicity; mockup is vanilla HTML/CSS/JS | -- Pending |
| External JSON loading | Separation of data from presentation; easier to update stats | -- Pending |

---
*Last updated: 2026-04-16 after project initialization*
