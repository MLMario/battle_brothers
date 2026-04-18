# Phase 2: Collapsed Row Display - Context

**Gathered:** 2026-04-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Populate each collapsed accordion row with the four remaining slots established by Phase 1's DOM scaffold (D-13): background icon, mini sparkline, wage badge, and expand chevron. Name is already rendered in Phase 1. No real expand/collapse behavior — the panel open/close animation and expanded content all belong to Phase 3.

Phase 2 is a "fill in the blanks" phase: the DOM structure, CSS selectors, sword-emoji fallback plumbing, and `globalMin`/`globalMax` values were all set up in Phase 1. Phase 2 writes the render logic that consumes them.

</domain>

<decisions>
## Implementation Decisions

### Sparkline rendering
- **D-01:** 8 bars per row, one per attribute, in mockup order left→right: HP, MSk, RSk, MDf, RDf, Fat, Res, Ini. Matches CODEBASE.md §2 and preserves visual continuity with Phase 3 expanded bars.
- **D-02:** Each bar is driven by `attribute.average` (not `range.max`). Starting-baseline is what matters for hiring decisions, and averages are what the mockup uses.
- **D-03:** Color formula mirrors the mockup — linear interpolation of `red (192,57,43) → yellow (230,184,0) → green (39,174,96)` on the percentile `(average − globalMin) / (globalMax − globalMin)`. The exact function lives in the mockup and must be ported verbatim into `app.js`.
- **D-04:** Bar **height is variable** by the same percentile — weak stats visibly shrink, strong stats are tall. Color and height both encode percentile (same logic as mockup).
- **D-05:** Reuse the same color/percentile helper in Phase 3 for expanded stat bars — factor it into a single function during Phase 2 so Phase 3 imports, not re-derives.

### Wage badge
- **D-06:** The wage badge renders the base wage value from the JSON (field name verified against `data/backgrounds.json` during planning — likely `baseWage` or similar).
- **D-07:** Badge text format mirrors the mockup exactly. If the mockup shows `50`, render `50`; if it shows `50c` or a range, match that. Single source of truth wins over any independent formatting opinion.
- **D-08:** Edge cases (wage of 0, wage expressed as a range) are handled however the mockup handles them. Do not invent hide-when-zero or custom formatting rules.

### Chevron
- **D-09:** Chevron is **static** in Phase 2 — no rotation, no open-state class. The click handler remains the Phase 1 console.log plumbing stub (D-14 from `01-CONTEXT.md`). Real accordion toggle, rotation animation, and open-state tracking all land in Phase 3.
- **D-10:** Chevron glyph source mirrors the mockup exactly (unicode `▾` or inline SVG — whichever the mockup uses). No substitution.

### Icon rendering
- **D-11:** Every icon `<img>` gets `loading="lazy"` so the browser defers off-screen loads. Cheap on mobile bandwidth; zero JS cost.
- **D-12:** No per-row placeholder behind the image. 36×36 PNGs from same-origin decode in milliseconds; a placeholder adds visual noise for no perceptible benefit. The mockup doesn't have one either.
- **D-13:** Icon sizing is 36×36px with 6px border-radius, consumed from the CSS already ported in Phase 1 (D-16). Markup must use the exact selector(s) the existing CSS targets.
- **D-14:** The sword-emoji fallback wired in Phase 1 (D-11 from `01-CONTEXT.md`) is verified during Phase 2 verification by **temporarily** breaking one icon path in DevTools or a local-only JSON edit to confirm the fallback fires. Do **not** commit a broken path.

### Claude's Discretion
- Exact helper function decomposition in `app.js` (e.g., `makeSparkline(bg)`, `colorFor(pct)`, `renderRow(bg)`) as long as the color/percentile helper is reusable by Phase 3 (D-05).
- Whether to build DOM via `document.createElement` chaining or a small template-literal + single `innerHTML` assignment per row — the mockup uses `createElement`, mirror it unless there's a strong readability win.
- Minor tap-target padding tweaks inside the row if mobile testing shows the chevron or wage badge are awkward to tap, provided the mockup visual remains intact.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design & behavior reference
- `mockups/design3_accordion.html` — Single source of truth for sparkline color math, bar sizing, wage badge markup, chevron glyph, and icon rendering. Port the sparkline/color helper verbatim. All four Phase 2 slots have working reference implementations here.

### Data
- `data/backgrounds.json` — Verify the wage field name before writing the render code (D-06). 8 attributes per background with `average` field used by the sparkline (D-02). Icon paths stored as `icons/Foo.png`, prefixed with `assets/` at render time per 01-CONTEXT.md D-10.

### Project & planning
- `.planning/PROJECT.md` — Constraints (static frontend, no build tools).
- `.planning/REQUIREMENTS.md` — DATA-02 (icon + name + sparkline + wage + chevron per row) and VISU-03 (icon fallback) map to this phase.
- `.planning/ROADMAP.md` §Phase 2 — Goal statement, dependencies (Phase 1), and the five success criteria: 36×36 icons with 6px radius, missing-icon fallback, 8 sparkline bars reflecting averages, wage badge, visible chevron.
- `.planning/CODEBASE.md` §2 — Attribute key list and short labels, color-gradient spec (authoritative RGB values for the red-yellow-green interpolation), icon naming convention including the `Background 70.png` → `Background_70.png` rename already performed in Phase 1 (D-09).
- `.planning/phases/01-foundation-data-loading/01-CONTEXT.md` — Specifically D-10 (icon path prefix), D-11 (sword-emoji fallback), D-13 (DOM scaffold with empty slots), D-14 (click-handler stub), D-15 (globalMin/globalMax precomputed), D-16 (mockup CSS fully ported). Phase 2 builds directly on all of these.

### Asset inventory
- `assets/icons/` — 67 PNG portraits. Used via `<img src="assets/${bg.icon}" loading="lazy">`.

</canonical_refs>

<specifics>
## Specific Ideas

- **Mirror the mockup.** Every one of the four slots (sparkline, wage, chevron, icon) has a working reference in `mockups/design3_accordion.html`. When in doubt about colors, markup, or math: copy from the mockup. Divergence requires justification.
- **Factor the color/percentile helper once.** Phase 3's expanded attribute bars will reuse the exact same red→yellow→green math. Writing it as a single reusable function in Phase 2 avoids a copy-paste pair in Phase 3 (D-05).
- **Don't reintroduce structural churn.** The DOM shape already exists from Phase 1 (D-13). Phase 2 fills slots; it does not rearrange the row.

</specifics>

<deferred>
## Deferred Ideas

- Chevron rotation / open-state class — Phase 3.
- Real expand/collapse panel animation — Phase 3.
- Stat ranges, level-up bonuses, badges in the expanded panel — Phase 3.
- Search / sort pill interactions — v2 (SRCH-01/02/03).
- ARIA attributes, keyboard navigation, screen reader text for the sparkline — v2 (A11Y-01/02/03).
- Result count text and bottom-nav chrome — Phase 4.

</deferred>

---

*Phase: 02-collapsed-row-display*
*Context gathered: 2026-04-18*
