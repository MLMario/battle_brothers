---
plan: 02-01
phase: 02-collapsed-row-display
objective: "Port the mockup's sparkline color/percentile math verbatim into app.js and populate every row's empty .bg-spark (Phase 1 scaffold) with 8 height- and color-encoded bars using per-attribute globalMinByAttr / globalMaxByAttr."
status: complete
---

# Plan 02-01 Summary

## Completed Tasks

| Task | Description | Commits |
|------|-------------|---------|
| 02-01-01 | Add ATTR_KEYS {key,label} list, pct(), barColor(), makeSparkline() helpers; wire into buildRow and renderSkeleton | adcc1b1 |

## Key Files

### Created
- `.planning/phases/02-collapsed-row-display/02-01-SUMMARY.md` — This summary.

### Modified
- `app.js` — (1) `ATTR_KEYS` converted from flat string array to 8 `{key,label}` objects in mockup order (HP, MSk, RSk, MDf, RDf, Fat, Res, Ini). (2) `computeGlobalMinMax` loops updated to destructure `{ key }`. (3) Added module-scoped `pct(key, val)` reading `globalMinByAttr` / `globalMaxByAttr`, clamping 0-100, returning 50 on degenerate range (D-05 reusable helper). (4) Added module-scoped `barColor(p)` — verbatim mockup red→yellow→green RGB interpolation (192,57,43 → 230,184,0 → 39,174,96). (5) Added `makeSparkline(bg)` returning a `<div class="bg-sparkline">` with 8 `<div class="spark-bar">` children, each with inline `height:${max(2, round(p*0.16))}px;background:${barColor(p)};`. (6) `buildRow(bg)` now calls `makeSparkline(bg)` instead of emitting an empty `.bg-spark` span. (7) `renderSkeleton()` placeholder now uses `.bg-sparkline` class so skeleton and real rows share the same selector.

## Known Stubs

None introduced by this plan. The `.bg-icon`, `.bg-wage`, and `.bg-chev` slots remain empty placeholders from Phase 1 — those are explicitly scoped to Plans 02-02 (wage) and 02-03 (icon + chevron), tracked in the Phase 1 SUMMARY.

## Deviations from Plan

None — plan executed exactly as written. All acceptance criteria satisfied:
- `node --check app.js` passes
- `ATTR_KEYS` is 8 `{key,label}` objects in mockup order
- `pct(key, val)` reads Phase-1 `globalMinByAttr`/`globalMaxByAttr`, clamps 0-100, returns 50 on hi===lo
- `barColor(p)` matches mockup RGB triples exactly
- `makeSparkline(bg)` returns `.bg-sparkline` div with 8 `.spark-bar` div children, each with inline height and `rgb(...)` background
- `buildRow(bg)` appends `makeSparkline(bg)` result
- `renderSkeleton()` uses `.bg-sparkline` class on the sparkline placeholder
- `computeGlobalMinMax` destructures `{ key }` from `ATTR_KEYS` in both inner loops

## Self-Check: PASSED

- File `app.js` exists and committed in `adcc1b1`.
- File `.planning/phases/02-collapsed-row-display/02-01-SUMMARY.md` exists (this file).
- Commit `adcc1b1` present on current branch (`git log --oneline --all | grep adcc1b1`).
- Grep patterns from Task 1 `<verify>` all confirmed present in `app.js` (`function pct(key, val)`, `function barColor(p)`, `function makeSparkline(bg)`, `192 + (230 - 192)`, `bg-sparkline`, `spark-bar`, `{ key: 'hitpoints'`).
