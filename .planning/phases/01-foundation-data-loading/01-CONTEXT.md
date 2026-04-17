# Phase 1: Foundation & Data Loading - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Create the production `index.html` page shell (dark theme, mobile-first 430px container, CSS custom properties from the mockup), asynchronously load `data/backgrounds.json` via `fetch()`, and render all 67 backgrounds as accordion rows. Phase 1 proves the data pipeline and theming end-to-end — icons, sparklines, wage badges, expanded panels, navigation, search and sort all belong to later phases.

Infrastructure setup (local dev server workflow, initial GitHub repo + Pages deployment) is scoped into this phase so the app is testable on real mobile devices from the earliest increment.

</domain>

<decisions>
## Implementation Decisions

### File organization
- **D-01:** Split into three files at repo root: `index.html`, `styles.css`, `app.js`. No inline `<style>`/`<script>`. The mockup pattern of a single file is rejected — split wins for readability as Phase 2–4 add code.
- **D-02:** `index.html` lives at the repo root (not under `src/` or `public/`). Paths are `data/backgrounds.json` and `assets/icons/...` relative to root.
- **D-03:** Keep all three mockups (`mockups/design1_card_grid.html`, `design2_dense_table.html`, `design3_accordion.html`) — documents design history, no harm.
- **D-04:** `index.html` gets a brief (3–4 line) header comment covering: project name, data source, last-updated date.

### Loading & error UX
- **D-05:** While `fetch()` is in flight, show skeleton rows (~8 grey placeholder rows matching the `.bg-row` shape). No centered spinner.
- **D-06:** Skeleton is shown with a **~150ms delay** — if the fetch resolves sooner, skip the skeleton entirely to avoid flicker on fast loads.
- **D-07:** On fetch failure (network, 404, JSON parse error): render a centered inline message ("Couldn't load backgrounds") plus an amber **Retry** button that re-invokes the fetch flow.
- **D-08:** Log diagnostic details on failure via `console.error` — URL, HTTP status (if available), and the underlying error — so GitHub Pages hiccups are debuggable.

### Icon path handling
- **D-09:** Rename `assets/icons/Background 70.png` → `assets/icons/Background_70.png` on disk AND update the corresponding entry in `data/backgrounds.json`. Eliminates URL-encoding bugs; safer for GitHub Pages.
- **D-10:** JSON stores icon paths as `icons/Foo.png` (no `assets/` prefix). `app.js` prefixes at render time with `assets/${bg.icon}`. Keeps the JSON portable.
- **D-11:** Wire up the missing-icon fallback (sword emoji, matching mockup) in Phase 1 even though no icons render yet — Phase 2 just flips the switch.
- **D-12:** No extra data-layer safety (no schema guards, no stale-data timestamp display). Keep Phase 1 tight.

### Row structure & interactions
- **D-13:** Render the **full mockup DOM structure** for each row: `.bg-item > .bg-row` containing placeholders for icon, `.bg-name`, `.bg-spark`, `.bg-wage`, `.bg-chev`. Empty slots are hidden (via CSS or empty children). Phase 2/3 just populate them — no structural churn.
- **D-14:** Rows are clickable in Phase 1: attach a click handler that `console.log`s the background `id`. Validates event plumbing before Phase 3 wires real accordion behavior.
- **D-15:** Compute `globalMin` / `globalMax` across all 67 backgrounds' attribute averages after fetch, even though nothing visual consumes them yet. Phase 2 sparklines need these values.
- **D-16:** Port the **full CSS from the mockup** into `styles.css` up front. Phases 2–4 reference selectors that already exist; no per-phase CSS diffs.

### Infrastructure, deploy, and test
- **D-17:** Local dev: `python -m http.server 8000` from the repo root. `fetch()` works over `http://localhost:8000`. Documented in README.
- **D-18:** Host: **GitHub Pages from `main` branch, root directory.** Public repo. Deploy happens at the end of Phase 1 (after verification) so every subsequent phase is testable on real mobile devices via the live URL.
- **D-19:** The user creates the GitHub repo and runs the initial `git remote add` / `git push`. Claude does not invoke `gh repo create` or push to a remote Claude did not verify with the user.
- **D-20:** Add a minimal `.gitignore` at repo root: `.claude/settings.local.json`, `.DS_Store`, `Thumbs.db`, `node_modules/`.
- **D-21:** Add a brief `README.md` (~20 lines) covering: what the app is, how to run locally, a live-URL placeholder to fill in after deploy, and a link back to PROJECT.md.
- **D-22:** Testing strategy: **manual browser testing only.** No Playwright, no test framework. Matches the "no build tools" constraint.
- **D-23:** Browser target: latest evergreen Chrome / Safari / Firefox (desktop and mobile). No legacy-browser polyfills.

### Claude's Discretion
- Exact skeleton row visual treatment (shimmer vs. flat grey) within the established dark theme
- The precise DOM representation of empty slot placeholders (hidden children vs. CSS-hidden vs. omitted until populated) as long as D-13's principle holds
- README wording and section order within the ~20-line budget
- Retry button's exact label text and styling within the amber-accent palette

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design & behavior reference
- `mockups/design3_accordion.html` — Sole reference implementation. Complete working accordion (868 lines) including all CSS custom properties, IIFE structure, DOM building, color-coded bar math, debounced search (deferred to v2 but logic lives here), and the sword-emoji icon fallback. Phase 1 ports the CSS wholesale and adapts the JS to use `fetch()` instead of `EMBEDDED_DATA`.

### Data
- `data/backgrounds.json` — Production data source. 67 backgrounds, 8 attributes each with `range.min/max`, `average`, `levelUp.min/max`. Background IDs are snake_case. Icon paths stored as `icons/Foo.png` (relative to `assets/`).

### Project & planning
- `.planning/PROJECT.md` — Core value, constraints ("static frontend only — no build tools"), key decisions table.
- `.planning/REQUIREMENTS.md` — DATA-01, VISU-01, VISU-02, VISU-04 map to this phase.
- `.planning/ROADMAP.md` §Phase 1 — Goal statement, depends-on (nothing), and the five success criteria the phase must satisfy.
- `.planning/CODEBASE.md` §1–4 — Stack confirmation, CSS design tokens table (authoritative values for `--bg`, `--surface`, `--amber`, `--border`, `--nav-h`, etc.), conventions, and the explicit gaps section (Data Loading Gap, Icon Path Mapping Gap, Missing Production Files) that this phase closes.

### Asset inventory
- `assets/icons/` — 67 PNG portraits referenced by background entries. One file (`Background 70.png`) is renamed as part of D-09.

</canonical_refs>

<specifics>
## Specific Ideas

- Single source of truth is the mockup — when in doubt about CSS values, selectors, or JS logic, mirror `mockups/design3_accordion.html`. The production version should look visually indistinguishable from the mockup for any element already implemented in Phase 1.
- GitHub Pages is the early mobile-testing lever — the user cares specifically about validating the layout on real mobile viewports, not just DevTools device emulation. This is the reason deploy is pulled into Phase 1 rather than deferred to Phase 4.
- The click-handler-console-log pattern (D-14) is an explicit plumbing-validation step, not a UX feature — keep it until Phase 3, at which point the real accordion toggle replaces it.

</specifics>

<deferred>
## Deferred Ideas

- Playwright / automated smoke test — out of scope; revisit if the project grows or regressions become painful.
- ARIA / keyboard navigation / screen reader text — explicitly v2 (A11Y-01/02/03 in REQUIREMENTS.md).
- Data-updated timestamp in footer — noted as "nice to have" but not included now.
- JSON schema guard (length === 67 check) — not added in Phase 1; revisit only if data changes start causing silent breakage.
- Build tab functionality — v2 (BUILD-01/02).
- Search and sort — v2 (SRCH-01/02/03).

</deferred>

---

*Phase: 01-foundation-data-loading*
*Context gathered: 2026-04-17*
