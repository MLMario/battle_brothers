# Phase 3: Expanded Detail Panel - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-19
**Phase:** 03-expanded-detail-panel
**Areas discussed:** Toggle & single-open behavior, Panel construction timing, Animation approach, Level-up & edge-case formatting

---

## Gray area selection

| Option | Description | Selected |
|--------|-------------|----------|
| Toggle & single-open behavior | openId tracker, click target, scroll, close triggers | ✓ |
| Panel construction timing | Eager vs. lazy panel build | ✓ |
| Animation approach | Mockup 600px cap vs. measured height vs. higher cap | ✓ |
| Level-up & edge-case formatting | Null handling, sign conventions, attr-vals, badges | ✓ |

---

## Toggle & single-open behavior

### Open tracker

| Option | Description | Selected |
|--------|-------------|----------|
| openId module var (Recommended) | Mirror mockup: module-scoped `openId` + `.bg-item.open` class | ✓ |
| DOM scan via .open class | `querySelector('.bg-item.open')` each time, no state | |

**User's choice:** openId module var

### Click target

| Option | Description | Selected |
|--------|-------------|----------|
| Row only (Recommended) | Only `.bg-row` has click handler; panel clicks do nothing | ✓ |
| Whole .bg-item | Clicks anywhere in item toggle (including inside panel) | |

**User's choice:** Row only

### Scroll-into-view

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, mirror mockup (Recommended) | setTimeout 50ms → scrollIntoView({smooth, nearest}) | ✓ |
| No scroll | User manages scroll manually | |

**User's choice:** Yes, mirror mockup

### Close trigger

| Option | Description | Selected |
|--------|-------------|----------|
| Same row or any other row (Recommended) | Mockup behavior: only row clicks close | ✓ |
| Add tap-outside to close | Document-level listener for outside taps | |

**User's choice:** Same row or any other row

---

## Panel construction timing

| Option | Description | Selected |
|--------|-------------|----------|
| Eager, in buildRow (Recommended) | Build all 67 panels at render time (mockup) | ✓ |
| Lazy on first open | Build panel shell only; populate on first tap | |

**User's choice:** Eager, in buildRow

---

## Animation approach

| Option | Description | Selected |
|--------|-------------|----------|
| Mockup max-height:600px (Recommended) | Hardcoded 600px ceiling with cubic-bezier .32s | |
| Measure content height | scrollHeight-based inline max-height, clip-free | ✓ |
| Raise ceiling to 800px | Keep CSS-only, bump cap | |

**User's choice:** Measure content height
**Notes:** Divergence from mockup. Followed up with measurement-strategy and transition-curve questions.

### Measurement follow-up

| Option | Description | Selected |
|--------|-------------|----------|
| Set on open, 0 on close (Recommended) | Inline maxHeight = scrollHeight on open, '0' on close | ✓ |
| Set on open, re-measure on resize | Plus resize listener for landscape rotation | |

**User's choice:** Set on open, 0 on close

### Transition curve

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — .32s cubic-bezier(.4,0,.2,1) (Recommended) | Mockup's CSS transition, no change | ✓ |
| Tune it | Adjust duration/curve | |

**User's choice:** Yes, keep mockup transition

---

## Level-up & edge-case formatting

### Level-up column

| Option | Description | Selected |
|--------|-------------|----------|
| Mirror mockup verbatim (Recommended) | '—' both null, +X/+Y positive, X/Y negative, ? partial | ✓ |
| Always show signed values | '+X/+Y' and '−X/−Y' consistently | |
| Hide level-up column when both null | Omit div instead of rendering '—' | |

**User's choice:** Mirror mockup verbatim

### Attr-vals cell

| Option | Description | Selected |
|--------|-------------|----------|
| Mirror mockup verbatim (Recommended) | avg (primary) + min–max (#555 9px) | ✓ |
| Tweak format | Change ordering or typography | |

**User's choice:** Mirror mockup verbatim

### Panel badges

| Option | Description | Selected |
|--------|-------------|----------|
| Mirror mockup verbatim (Recommended) | innerHTML template for Level + Wage badges | ✓ |
| Use createElement (no innerHTML) | Construct badges imperatively | |

**User's choice:** Mirror mockup verbatim

---

## Claude's Discretion

- Exact helper-function decomposition for panel builder (`buildPanel`, `buildAttrRow`, `formatLevelUp`, etc.)
- Whether `toggleItem` is a standalone function or inlined in the click handler
- Variable names for previously-open item references

## Deferred Ideas

- ARIA / keyboard / screen reader text — v2 A11Y-01/02/03
- Landscape-rotation resize handler — not in v1 scope
- Result count, bottom nav, empty state — Phase 4
- Search / sort — v2 SRCH-01/02/03
