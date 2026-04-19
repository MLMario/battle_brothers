---
plan: 03-02
phase: 03-expanded-detail-panel
objective: "Wire accordion toggle: clicking .bg-row opens its panel with measured max-height animation, closes previously-open panel, smooth-scrolls into view; replace Phase 1 console.log stub with real toggleItem() flow."
status: complete
---

# Plan 03-02 Summary

## Completed Tasks

| Task | Description | Commits |
|------|-------------|---------|
| 03-02-01 | Add `openId` module state, `toggleItem(id, item)` function, replace `.bg-row` click handler body (D-01/D-03/D-04/D-05/D-07/D-16) | cb7661b |

## Key Files

### Created
- None (no new files — plan extends existing `app.js`).

### Modified
- `app.js` — Added module-scoped `let openId = null;` alongside the other state declarations (line 11). Added `toggleItem(id, item)` at module scope immediately before `buildRow()` (lines 313–343): queries `.bg-panel` from the passed `item`, reads `.open` to detect current state, closes the previously-open item (looked up via `document.querySelector('.bg-item[data-id="' + openId + '"]')` — production data-id divergence from the mockup's `id="item-..."` pattern) by removing `.open` and resetting its panel `maxHeight` to `'0'`, then either collapses (removes `.open`, sets `maxHeight='0'`, clears `openId`) or expands (adds `.open`, sets `maxHeight = panel.scrollHeight + 'px'` per D-07 measured-height strategy, assigns `openId = id`, and fires a `setTimeout` at 50ms to call `item.scrollIntoView({ behavior: 'smooth', block: 'nearest' })` per D-03). Replaced the click-handler body in `buildRow()` (previously `console.log('[click]', bg.id);`) with `toggleItem(bg.id, item);` — handler still attached to `.bg-row` only (D-02, D-16), no propagation-stop needed because `.bg-panel` is a sibling of `.bg-row`, not an ancestor. No chevron JS (D-17 — CSS rule handles rotation). No resize handler (D-10).

## Known Stubs

None.

## Deviations from Plan

None — plan executed exactly as written. The one pre-specified divergence from the mockup (`document.querySelector('.bg-item[data-id="' + openId + '"]')` instead of `document.getElementById('item-' + openId)`) was itself explicitly dictated by the plan to match production's `data-id` attribute convention, so it is not a deviation from the plan.

## Self-Check: PASSED

- `app.js` exists; `node -c app.js` returns SYNTAX_OK.
- Commit `cb7661b` exists (verified via `git log --oneline`).
- Required patterns present in `app.js` (verified via grep): `let openId = null` (line 11), `function toggleItem(id, item)` (line 313), `panel.scrollHeight` (line 335), `scrollIntoView({ behavior: 'smooth', block: 'nearest' })` (line 339), `toggleItem(bg.id, item)` in click handler (line 392).
- Phase 1 `console.log('[click]', bg.id)` stub fully removed (0 grep matches for `console.log` in `app.js`).
- Post-commit deletion check: no files deleted.
