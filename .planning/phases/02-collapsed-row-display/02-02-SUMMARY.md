---
plan: 02-02
phase: 02-collapsed-row-display
objective: "Reconcile the Phase 1 flat-span scaffold into the mockup's nested row structure, then populate the three remaining collapsed-row slots: icon (with fallback), wage badge, and static chevron."
status: complete
---

# Plan 02-02 Summary

## Completed Tasks

| Task | Description | Commits |
|------|-------------|---------|
| 02-02-01 | Rewrite buildRow to mockup-shape nested DOM (img.bg-icon + .bg-main{.bg-name,.bg-sparkline} + .bg-row-right{.wage-badge,.chevron}); update renderSkeleton to match the nested shape | bd26b69 |

## Key Files

### Created
- `.planning/phases/02-collapsed-row-display/02-02-SUMMARY.md` — This summary.

### Modified
- `app.js` — (1) `buildRow(bg)` rewritten: replaces the five flat `<span>` slots with the mockup's nested structure. Creates `<img class="bg-icon" loading="lazy" alt="${bg.name}" src="${iconUrl(bg)}">`, wires `wireIconFallback(img)` for the sword-emoji fallback (VISU-03), wraps name + sparkline inside `<div class="bg-main">` (using `<div class="bg-name">` per mockup, not `<span>`), and wraps wage + chevron inside `<div class="bg-row-right">`. Wage badge is `<div class="wage-badge">${bg.baseWage}g</div>` (D-06/D-07). Static chevron is `<div class="chevron">\u25BE</div>` (D-09/D-10) — no rotation class, no open-state toggle. D-14 `console.log('[click]', bg.id)` click handler preserved verbatim. (2) `renderSkeleton()` restructured to emit the same nested shape (icon `<div>` + `.bg-main` with name+sparkline + `.bg-row-right` with wage+chevron) so skeleton → real-row transition is layout-continuous. Legacy Phase 1 class names `bg-spark`, `bg-wage`, `bg-chev` no longer appear anywhere in `app.js`.

## Known Stubs

None. All DATA-02 deliverables (icon + name + sparkline + wage + chevron) and VISU-03 (icon fallback via `wireIconFallback`) are fully populated. The static-chevron state and Phase-1 click-log handler are intentional Phase 2 scope — not stubs — and will be replaced in Phase 3 (expand/collapse behavior, chevron rotation, accordion panel). The expanded `.bg-panel` is not emitted; that belongs to Phase 3 (02-CONTEXT <deferred>) and does not block Phase 2 completion.

## Deviations from Plan

None — plan executed exactly as written. All acceptance criteria satisfied:
- `node --check app.js` passes
- `buildRow(bg)` emits `<article class="bg-item" data-id="${bg.id}">` with one `<div class="bg-row">` containing three direct children: `<img class="bg-icon">`, `<div class="bg-main">`, `<div class="bg-row-right">`
- `<img class="bg-icon">` has `loading="lazy"`, `alt=bg.name`, `src="assets/${bg.icon}"` (via `iconUrl`), and `wireIconFallback(img)` is attached
- `.bg-main` contains `<div class="bg-name">` + the `makeSparkline(bg)` element
- `.bg-row-right` contains `<div class="wage-badge">${bg.baseWage}g</div>` + `<div class="chevron">\u25BE</div>`
- Chevron has no rotation/open-state class (static per D-09)
- Row click handler still logs `'[click]', bg.id` (Phase 1 plumbing unchanged per D-14)
- Legacy class names `bg-spark`, `bg-wage`, `bg-chev` removed from both `buildRow` and `renderSkeleton`
- `renderSkeleton` mirrors the new nested shape for continuity
- Sanity counts: `grep -c '"baseWage"' data/backgrounds.json` = 67, `grep -c '"icon"' data/backgrounds.json` = 67

## Self-Check: PASSED

- File `app.js` exists and the commit `bd26b69` is present on the current branch (`git log --oneline --all | grep bd26b69`).
- File `.planning/phases/02-collapsed-row-display/02-02-SUMMARY.md` exists (this file).
- Grep patterns from Task 1 `<verify>` all confirmed present in `app.js`: `img.className = 'bg-icon'`, `img.loading = 'lazy'`, `wireIconFallback(img)`, `bg-main`, `bg-row-right`, `wage-badge`, `bg.baseWage`, `chevron`, `\u25BE`.
- Legacy class names `bg-spark`, `bg-wage`, `bg-chev` absent from `app.js` (grep returns no matches).
- No unintentional file deletions in `bd26b69`.
