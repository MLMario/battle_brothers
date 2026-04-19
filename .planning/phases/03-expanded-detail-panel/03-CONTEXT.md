# Phase 3: Expanded Detail Panel - Context

**Gathered:** 2026-04-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire the accordion open/close behavior and populate the expanded panel (`.bg-panel`) that was scaffolded by the Phase 1 DOM and CSS work. Each panel contains: two header badges (starting level range, base wage) and a list of 8 attribute rows (short label, color-coded bar with width = percentile, avg + min–max text, level-up bonuses). Only one panel is open at a time. Clicking the collapsed `.bg-row` toggles; the Phase 1 `console.log` plumbing stub (P1 D-14) is replaced with the real toggle.

Out of scope: result count text, bottom nav, empty-state, search/sort — all Phase 4 or v2. No ARIA / keyboard work (v2 A11Y).

</domain>

<decisions>
## Implementation Decisions

### Toggle & single-open behavior
- **D-01:** Track the currently-open background via a module-scoped `openId` string (mirrors the mockup). No DOM scan on toggle.
- **D-02:** The click target is `.bg-row` only. Clicks inside the expanded `.bg-panel` do nothing — users can tap badges / select range text without collapsing the panel.
- **D-03:** After opening a panel, call `setTimeout(() => item.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)`. The 50ms delay lets the max-height animation start before scroll begins. Mirrors the mockup exactly.
- **D-04:** Close behavior mirrors the mockup: tapping the same row's `.bg-row` closes it; tapping another row closes the current panel and opens the new one. No tap-outside-to-close, no scroll-to-close.
- **D-05:** Replace the Phase 1 click-handler stub (P1 D-14) that `console.log`s `bg.id`. The new handler takes `(bg, item)` and calls `toggleItem(bg.id, item)`.

### Panel construction timing
- **D-06:** Build all 67 expanded panels **eagerly** inside `buildRow()` at initial render, mirroring the mockup. Each panel subtree is ~40 nodes (2 badges + 8 attr-rows × 4 cells); total DOM cost is negligible on the 430px mobile viewport. No lazy population, no "has this been populated?" flag.

### Animation approach (divergence from mockup)
- **D-07:** **Diverge from the mockup's hardcoded `max-height: 600px`.** On open, set `panel.style.maxHeight = panel.scrollHeight + 'px'` via inline style (overrides the CSS rule). On close, set `panel.style.maxHeight = '0'`. This is clip-free for any realistic content length and future-proofs Phase 3 against any expansion of the attr list.
- **D-08:** **Remove the `max-height: 600px` rule from `.bg-item.open .bg-panel` in `styles.css`.** Inline style handles both directions. Keep the base `.bg-panel { max-height: 0; }` rule so the initial closed state is correct before any JS runs.
- **D-09:** Keep the mockup's transition curve verbatim: `transition: max-height .32s cubic-bezier(.4,0,.2,1)` on `.bg-panel`. No tuning.
- **D-10:** No resize handler. The 430px container is fixed; landscape rotation is not a supported mobile-first target within v1.

### Panel content — badges
- **D-11:** Render two `.panel-badge` pills inside `.panel-badges`, verbatim from the mockup: `Level <span>${startingLevel.min}–${startingLevel.max}</span>` and `Wage <span>${baseWage}g</span>`. Use `innerHTML` for these two (matches the mockup; fixed template with no user-controlled strings). No additional badges in v1.

### Panel content — attribute rows
- **D-12:** Iterate `ATTR_KEYS` (same list already exported from Phase 1 `app.js`) and build one `.attr-row` per attribute. Four cells per row: `.attr-label` (short label), `.attr-bar-wrap > .attr-bar-fill`, `.attr-vals`, `.attr-levelup`.
- **D-13:** Reuse `pct(key, avg)` and `barColor(p)` from Phase 2 (P2 D-05) — do not re-derive. `.attr-bar-fill` gets `width: ${p}%; background: ${color};` inline. Same percentile used for sparkline and expanded bar.
- **D-14:** `.attr-vals` format mirrors the mockup verbatim: `<span class="attr-avg">${avg}</span> <span style="color:#555;font-size:9px">${rangeMin}–${rangeMax}</span>`. Missing `range.min` / `range.max` render as `?`.
- **D-15:** `.attr-levelup` formatting mirrors the mockup verbatim:
  - Both `levelUp.min` and `levelUp.max` null → textContent `'—'`, no color class
  - `val > 0` → `+${luMin}/+${luMax}`, add `.positive` class (green)
  - `val < 0` → `${luMin}/${luMax}` (no `+` prefix, the negative sign is inherent), add `.negative` class (red)
  - Partial null → `?` in place of the missing side
  - Do NOT hide the `.attr-levelup` div when both null — keeping it preserves row alignment.

### Existing stubs to replace / reuse
- **D-16:** Row-level click handler lives on `.bg-row` (where P1 D-14 placed it). Replace its body — do not move the listener.
- **D-17:** The `.bg-item.open` class already drives chevron rotation via existing CSS (P2 D-09). Toggling this class is sufficient — no separate chevron update code.

### Claude's Discretion
- Exact helper-function decomposition for the expanded panel (e.g., `buildPanel(bg)`, `buildAttrRow(bg, key, label)`, `formatLevelUp(luMin, luMax)`) — keep the mockup's overall structure but factor to taste for readability.
- Whether `toggleItem` lives as a standalone function or is inlined inside the click handler — mockup factors it out; mirror unless inlining reads better.
- Exact variable names for previously-open item references (`prev`, `prevItem`, `openItem`, etc.).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design & behavior reference
- `mockups/design3_accordion.html` — Sole reference implementation. Lines 280–381 contain all the panel CSS. Lines 707–793 contain the panel build, attr-row loop, and level-up formatting. Lines 795–815 contain `toggleItem()` with the `openId` tracker and scrollIntoView call. Mirror verbatim except for D-07 (measured `scrollHeight` instead of `600px` cap).

### Data
- `data/backgrounds.json` — Each background has `startingLevel.min/max`, `baseWage`, and per-attribute `range.min/max`, `average`, `levelUp.min/max`. `levelUp` values can be `null` on either side.

### Project & planning
- `.planning/PROJECT.md` — Static frontend, no build tools, mirror mockup.
- `.planning/REQUIREMENTS.md` — DATA-03, DATA-04, DATA-05, DATA-06 all map to this phase.
- `.planning/ROADMAP.md` §Phase 3 — Goal statement, dependencies (Phase 2), and the five success criteria.
- `.planning/CODEBASE.md` §2 — Attribute key list and short labels, color-gradient spec, single-item accordion convention via `openId`.
- `.planning/phases/01-foundation-data-loading/01-CONTEXT.md` — Specifically D-13 (full DOM scaffold including panel slot), D-14 (click-handler stub to replace), D-16 (full mockup CSS already ported — `.bg-panel`, `.panel-badge`, `.attr-row`, `.attr-bar-fill`, `.attr-levelup.positive/.negative` all exist).
- `.planning/phases/02-collapsed-row-display/02-CONTEXT.md` — Specifically D-05 (reusable `pct()` / `barColor()` helpers) and D-09 (chevron rotation via `.bg-item.open` class).

### Current production code
- `app.js` — Lines 72–94 contain `pct()` and `barColor()` helpers to reuse. Lines 259–262 contain the click-handler stub to replace. Lines 214–266 contain `buildRow()` — Phase 3 extends this to append a `.bg-panel` sibling of `.bg-row` inside `.bg-item`.
- `styles.css` — Lines 273–374 mirror the mockup's panel CSS. Line 281 (`.bg-item.open .bg-panel { max-height: 600px; }`) is the rule to remove per D-08.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `pct(key, val)` and `barColor(p)` in `app.js` (P2 D-05): drive `.attr-bar-fill` width and color directly.
- `ATTR_KEYS` array in `app.js`: same 8-attribute iteration for expanded bars as sparkline.
- Full panel CSS in `styles.css` (`.bg-panel`, `.bg-panel-inner`, `.panel-badges`, `.panel-badge`, `.attr-list`, `.attr-row`, `.attr-label`, `.attr-bar-wrap`, `.attr-bar-fill`, `.attr-vals`, `.attr-avg`, `.attr-levelup`, `.attr-levelup.positive`, `.attr-levelup.negative`) — Phase 3 writes no new CSS except removing the 600px cap (D-08).
- `.bg-item.open .chevron { transform: rotate(180deg); }` and `.bg-item.open .bg-row { background: var(--surface-h); }` rules already live in CSS — toggling `.open` drives both.

### Established Patterns
- Imperative DOM construction via `document.createElement` (P2 convention). Exception: the mockup uses `innerHTML` for the two fixed-template panel badges — mirror that (D-11).
- Module-scoped state variables for top-level app state (e.g., `allBgs`, globals). `openId` follows the same pattern.
- Inline `cssText` / `style` for dynamically-computed values (percentile bars). Consistent with `makeSparkline()`.

### Integration Points
- `buildRow(bg)` in `app.js` — extend to append a `.bg-panel` to `.bg-item` after `.bg-row`. Keep the row click handler attached to `.bg-row`.
- The click listener currently at `app.js:260` replaces its body to call the new toggle flow.

</code_context>

<specifics>
## Specific Ideas

- **Mirror the mockup.** Every decision except D-07/D-08 (animation height strategy) tracks the mockup exactly. When writing the panel builder, copy the mockup's structure and only diverge where a decision explicitly says so.
- **Animation divergence reason.** The mockup hardcodes `max-height: 600px` as a "probably big enough" ceiling. Measuring `scrollHeight` is nearly the same code complexity and eliminates the risk of content ever getting clipped — cheap future-proofing against Phase 4 badges or v2 additions.
- **No a11y in this phase.** `aria-expanded`, `role="region"`, keyboard toggle (Space/Enter) are all v2 (A11Y-01/02). Do not pre-emptively add them.

</specifics>

<deferred>
## Deferred Ideas

- ARIA attributes on accordion (`role`, `aria-expanded`, `aria-controls`) — v2 A11Y-01.
- Keyboard navigation (Tab, Enter/Space to expand) — v2 A11Y-02.
- Screen reader text for sparklines and color-coded bars — v2 A11Y-03.
- Landscape-rotation resize handling for measured max-height — not in v1 scope; 430px fixed-width mobile-first target.
- Result count text, bottom nav, empty state — Phase 4.
- Search / sort / pill interactions — v2 SRCH-01/02/03.

</deferred>

---

*Phase: 03-expanded-detail-panel*
*Context gathered: 2026-04-19*
