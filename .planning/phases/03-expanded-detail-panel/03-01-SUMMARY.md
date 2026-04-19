---
plan: 03-01
phase: 03-expanded-detail-panel
objective: "Eager-build expanded .bg-panel DOM (badges + 8 attr-rows) for every background inside buildRow(); remove hardcoded 600px max-height cap."
status: complete
---

# Plan 03-01 Summary

## Completed Tasks

| Task | Description | Commits |
|------|-------------|---------|
| 03-01-01 | Remove `.bg-item.open .bg-panel { max-height: 600px }` rule (D-08) | 02265f4 |
| 03-01-02 | Extend `buildRow()` to append populated `.bg-panel` with 2 badges + 8 attr-rows (D-06, D-11–D-15) | b2504d4 |

## Key Files

### Created
- None (no new files — plan extends existing `app.js` and trims `styles.css`)

### Modified
- `styles.css` — Removed the `.bg-item.open .bg-panel { max-height: 600px }` rule block (4 lines). Base `.bg-panel { max-height: 0; transition: ... }` and all other panel/attr-row CSS preserved verbatim.
- `app.js` — Added three helper functions before `buildRow()`: `formatLevelUp(cell, luMin, luMax)` implements D-15 (positive adds `+/+` and `.positive` class, negative uses raw `/` and `.negative` class, both-null renders em-dash `\u2014`, partial-null substitutes `?`), `buildAttrRow(bg, key, label)` constructs a 4-cell row (`.attr-label`, `.attr-bar-wrap > .attr-bar-fill` with inline width+background from reused `pct()`/`barColor()`, `.attr-vals` via innerHTML verbatim from mockup with `\u2013` en-dash and `?` fallbacks, `.attr-levelup` via `formatLevelUp`), `buildPanel(bg)` builds `.bg-panel > .bg-panel-inner` containing `.panel-badges` (two innerHTML-rendered pills per D-11 with en-dash in Level range) and `.attr-list` iterated over `ATTR_KEYS`. `buildRow()` now calls `item.appendChild(buildPanel(bg))` after `item.appendChild(row)` and before `return item`. The existing row click stub at line ~260 is untouched per plan.

## Known Stubs

None. The `console.log('[click]', bg.id)` stub in the row click handler is documented in the plan as intentionally preserved for Plan 02 to replace — not a regression of this plan.

## Deviations from Plan

None — plan executed exactly as written. One micro-addition inside `formatLevelUp`: explicit `val === 0` branch renders `luMin/luMax` with no color class (neither positive nor negative); this is an edge case not addressed by D-15 and does not affect any current background in `data/backgrounds.json` (all level-up values are non-zero or null), but prevents a silent fall-through with no textContent.

## Self-Check: PASSED

- `styles.css` exists, no `600px` matches remain (grep verified)
- `app.js` exists, `node -c app.js` returns SYNTAX OK
- Commit 02265f4 exists: `git log --oneline` verified
- Commit b2504d4 exists: `git log --oneline` verified
- Data shape validated: 67 backgrounds, expected `startingLevel.{min,max}`, `baseWage`, `attributes.*.{range,average,levelUp}` all present
