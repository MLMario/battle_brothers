# Phase 4: Navigation & Polish - Context

**Gathered:** 2026-04-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Add the three remaining v1 UI elements on top of the Phase 1–3 accordion: a top result count (`#result-count`), a fixed bottom navigation bar (`#bottom-nav` with Backgrounds active + Build placeholder), and an empty-state block (`#empty`) that can be toggled when 0 rows are displayed. No search, no sort, no Build-tab functionality, no ARIA / keyboard work — all v2.

The CSS for every Phase 4 target (`#result-count`, `#bottom-nav`, `.nav-tab`, `.nav-tab.active`, `#empty`, `#empty svg`) was fully ported in Phase 1 (P1 D-16) and already sits in `styles.css`. Phase 4 is almost entirely markup + a small amount of JS wiring — no new CSS work except incidental adjustments if something is wrong.

</domain>

<decisions>
## Implementation Decisions

### DOM structure
- **D-01:** Do **not** reintroduce the mockup's `#list-wrap`. Phase 3's gap-closure (commit 835ae10) made `#list` the scroll container directly with `overflow-y: auto` and `padding-bottom: calc(var(--nav-h) + 4px)`. Phase 4 keeps that structure intact — no churn on a working scroll.
- **D-02:** `#result-count` is a sibling of `#list` inside `#app`, placed **before** `#list`. It stays pinned above the scrolling list (not inside the scroller) — matches the mockup's sibling relationship.
- **D-03:** `#empty` is a sibling of `#list` inside `#app`. Toggle `display` between `#list` and `#empty`: when empty is shown, `#list` is hidden (and vice versa). The mockup's `#empty` CSS already has `display: none` as its default.
- **D-04:** `#bottom-nav` is a sibling of `#list` inside `#app`. CSS is `position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); max-width: 430px` — already in `styles.css:373`. No change needed beyond adding the markup.
- **D-05:** Do **not** port the mockup's `#controls` block (`#search`, `#pills`, pill buttons). The dormant CSS stays in `styles.css`; v2 SRCH phases add DOM + behavior together when real search/sort lands.

### Result count
- **D-06:** Text format is **`"67 of 67 backgrounds"`** verbatim from ROADMAP §Phase 4 success-criterion 1 and REQUIREMENTS.md NAV-01. The `"X of Y"` pattern reads naturally once v2 search filters to e.g. `"12 of 67 backgrounds"`.
- **D-07:** Populated via a small helper `updateCount(filtered, total)` that writes `` `${filtered} of ${total} backgrounds` `` to `#result-count.textContent`. In v1 the single call is `updateCount(allBgs.length, allBgs.length)`. v2 search/sort will call it on every filter change.
- **D-08:** First populated **after `fetch()` resolves**, before the initial row render. Prevents any `0 of 0` flash during loading.
- **D-09:** No loading-state count text. While the fetch is in flight the element is empty (or `textContent = ''`) — the skeleton rows already signal loading; a second loading signal is noise.

### Empty state
- **D-10:** Content mirrors the mockup verbatim: inline SVG magnifying-glass icon (mockup lines 488–490) plus the text `"No backgrounds found"`. No divergence.
- **D-11:** Wire a helper `setEmpty(show: boolean)` that toggles `#empty` visibility and hides/shows `#list`. In v1 `setEmpty(false)` is the only state actually used at runtime; v2 search/sort will call `setEmpty(filtered.length === 0)` on every filter change.
- **D-12:** Expose the helper globally for verification: `window.__setEmpty = setEmpty`. Allows success-criterion 4 to be tested in DevTools without mutating `data/backgrounds.json`. Not a production entry point — the double-underscore prefix flags it as dev-only.
- **D-13:** Verification procedure for success-criterion 4: in DevTools console run `window.__setEmpty(true)`, confirm the empty-state visual renders and `#list` disappears; run `window.__setEmpty(false)`, confirm list returns. Document this in the phase verification.

### Bottom nav
- **D-14:** Two `.nav-tab` divs as children of `<nav id="bottom-nav">`, matching mockup lines 496–514 verbatim. First tab has `.active` class with the 4-path people SVG + text `"Backgrounds"`. Second tab has no `.active` class with the 3-line card/window SVG + text `"Build"`.
- **D-15:** SVG icons are inlined **verbatim from the mockup** (people icon lines 498–503, card/window icon lines 507–511). CSS already sizes `.nav-tab svg` at 20×20.
- **D-16:** **No click handlers** on either tab. Build is a v2 placeholder — styled as inactive (`color: #555` via base `.nav-tab`) which visually communicates its placeholder status. Backgrounds is already the active view; nothing to navigate to. No `cursor: not-allowed`, no toast, no scroll-to-top.
- **D-17:** Nav is rendered **eagerly** on `DOMContentLoaded` — does not depend on the fetch completing. The bar is visible during skeleton loading and error states, so users always see chrome.

### Claude's Discretion
- Exact helper placement within `app.js` (top-level vs nested) for `updateCount` and `setEmpty`, as long as they're accessible from the render flow.
- Whether `window.__setEmpty` is assigned right at function definition or inside an `if (DEV)` guard — v1 has no build tool so there's no real production/dev split; a single unconditional assignment is fine.
- Markup details for the empty SVG (whitespace, attribute order) as long as it renders identically to the mockup.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design & behavior reference
- `mockups/design3_accordion.html` — Sole reference implementation.
  - Lines 149–155: `#result-count` CSS (already in `styles.css:143`).
  - Lines 384–435: `#bottom-nav` + `.nav-tab` CSS (already in `styles.css:373`).
  - Lines 437–449: `#empty` CSS (already in `styles.css:427`).
  - Lines 482: `#result-count` markup location (sibling above list).
  - Lines 487–492: `#empty` markup (SVG magnifying-glass + "No backgrounds found").
  - Lines 496–514: `#bottom-nav` markup with both `.nav-tab` elements and inline SVGs.

### Data
- `data/backgrounds.json` — 67 backgrounds; `allBgs.length` drives the initial `updateCount(67, 67)` call.

### Project & planning
- `.planning/PROJECT.md` — Static frontend, no build tools, mirror mockup, dark theme / amber accents.
- `.planning/REQUIREMENTS.md` — NAV-01 (result count), NAV-02 (bottom nav with Backgrounds active + Build placeholder), NAV-03 (empty state) all map to this phase. v1 closes at 13/13 requirements after Phase 4.
- `.planning/ROADMAP.md` §Phase 4 — Goal statement, dependency (Phase 3), and five success criteria.
- `.planning/CODEBASE.md` §2 — Design tokens (`--nav-h: 52px` in particular), CSS conventions.
- `.planning/phases/01-foundation-data-loading/01-CONTEXT.md` — Specifically D-13 (full DOM scaffold principle; extended here with sibling elements), D-16 (full mockup CSS already ported — every Phase 4 CSS selector already exists).
- `.planning/phases/03-expanded-detail-panel/03-CONTEXT.md` — Specifically D-10 (no resize handler / 430px fixed) still holds for Phase 4. Bottom-nav overlap with panel content is handled by `#list` padding-bottom (`--nav-h + 4px`), already in place.

### Current production code
- `index.html` — Currently 20 lines; `<main id="list">` sits alone inside `#app`. Phase 4 adds `#result-count` before `#list`, and `#empty` + `#bottom-nav` after `#list`. Changes `<main>` structure — consider whether `#app` remains a bare `<div>` or gains semantic wrappers (Claude's discretion within existing conventions).
- `styles.css` — Lines 143–148 (`#result-count`), 151–161 (`#list` scroll-container with `padding-bottom: calc(var(--nav-h) + 4px)`), 373–435 (`#bottom-nav` + `.nav-tab`), 427–438 (`#empty`). All present; Phase 4 writes no new CSS.
- `app.js` — Currently 456 lines; fetch + render flow ends by calling `buildRow` 67 times into `#list`. Phase 4 inserts an `updateCount(allBgs.length, allBgs.length)` call after data load succeeds and defines `setEmpty` + `window.__setEmpty` exports.

### Gap-closure history
- `.planning/phases/03-expanded-detail-panel/03-03-PLAN.md` (commit 880cf66) — Retargeted scroll container from `#list-wrap` to `#list`. Phase 4 respects that structure (D-01).

</canonical_refs>

<specifics>
## Specific Ideas

- **Mirror the mockup for all Phase 4 markup.** Empty SVG, nav SVGs, nav text, empty text, class names — all verbatim. Divergence requires explicit justification (and none is present in Phase 4).
- **`window.__setEmpty` as verification hook.** v1 has no path to an empty result naturally; the dev hook exists precisely to satisfy success-criterion 4 without corrupting `data/backgrounds.json`. Ship it as production code, not conditional.
- **Phase 4 closes v1.** After verification, REQUIREMENTS.md coverage goes from 10/13 to 13/13. No v2 affordances beyond the `updateCount` / `setEmpty` helpers (which are free drop-ins for v2 SRCH work).
- **Bottom nav stays visible during loading/error states.** The nav renders on `DOMContentLoaded`, independent of fetch. Users always see chrome. Only `#list` / `#empty` / skeleton swap based on data state.

</specifics>

<deferred>
## Deferred Ideas

- Build tab functionality — v2 BUILD-01/02.
- Search / sort / pill interactions (and `#controls` DOM) — v2 SRCH-01/02/03.
- ARIA attributes / keyboard navigation / screen reader text — v2 A11Y-01/02/03.
- Scroll-to-top on Backgrounds-tab re-tap — nice polish, not in scope.
- "Coming soon" toast / cursor:not-allowed feedback on Build tab — rejected as over-engineering for a placeholder.
- Loading-state count text — intentionally empty during fetch; skeleton rows already signal loading.
- Data-updated timestamp, JSON schema guard, Playwright smoke tests — carried forward from P1 as v2+ concerns; nothing new added in Phase 4.

</deferred>

---

*Phase: 04-navigation-polish*
*Context gathered: 2026-04-19*
