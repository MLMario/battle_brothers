# CODEBASE.md
> Mode: **Brownfield** | Generated: 2026-04-16

---

## 1. Stack & Architecture

### Technology Stack
- **Frontend**: Static HTML/CSS/JavaScript (vanilla, no frameworks or build tools)
- **Data**: JSON file (`data/backgrounds.json`) scraped from the Battle Brothers Fandom Wiki
- **Assets**: PNG icons (67 files) in `assets/icons/`
- **Hosting**: Static deployment (no server-side component)

### Architecture Pattern
- **Single-page app** rendered entirely client-side with vanilla JS
- **No module system** -- all code lives in a single self-executing IIFE within an HTML file
- **No build pipeline** -- no bundler, transpiler, or package manager (no `package.json`, `node_modules`, etc.)
- **Data-driven rendering**: JSON data drives DOM generation via `document.createElement` calls (imperative DOM construction, not templated)

### Current State
There is **no production source code yet**. The project contains only:
1. A fully working **mockup** (`mockups/design3_accordion.html`) that embeds all 67 backgrounds inline as a JSON literal
2. Two alternative rejected mockups (`design1_card_grid.html`, `design2_dense_table.html`)
3. The **external data file** (`data/backgrounds.json`) that the production app must consume via `fetch()`
4. Icon assets in `assets/icons/`

The mockup is the **sole reference implementation** and serves as both the design specification and the functional prototype.

---

## 2. Conventions & Patterns

### From the Mockup (design3_accordion.html, 868 lines)

**CSS Conventions:**
- CSS custom properties on `:root` for theming (15+ variables covering colors, dimensions)
- Color palette: dark background (`#080808`), gold/amber accent (`#d4a843`), muted text (`#aaaaaa`)
- Mobile-first: `max-width: 430px` container, `100dvh` height, touch-optimized scrolling
- BEM-lite class naming: `.bg-item`, `.bg-row`, `.bg-panel`, `.attr-bar-fill`, `.panel-badge`
- CSS transitions for accordion animation (`max-height .32s cubic-bezier`), pill hover states, bar fills
- No external fonts -- system font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`)
- Scrollbar customization (thin, dark track)

**JavaScript Conventions:**
- Strict mode IIFE wrapping all code
- State stored in module-scoped variables: `allBgs`, `filtered`, `sortKey`, `sortAsc`, `query`, `openId`, `globalMin`, `globalMax`
- Imperative DOM construction via `document.createElement` (no `innerHTML` for dynamic content except badges)
- Debounced search input (180ms timer)
- Single-item accordion: only one item open at a time (`openId` tracking)
- Event delegation on pill container for sort interactions
- Lazy image loading with fallback to sword emoji icon on error

**Data Conventions:**
- 8 attribute keys: `hitpoints`, `meleeSkill`, `rangedSkill`, `meleeDefense`, `rangedDefense`, `fatigue`, `resolve`, `initiative`
- Each attribute has: `range.min`, `range.max`, `average`, `levelUp.min`, `levelUp.max`
- `null` used for missing/inapplicable level-up modifiers
- Background IDs are snake_case (`adventurous_noble`, `killer_on_the_run`)
- Icon paths are relative to `assets/`: `icons/Background_06.png`, `icons/Barbarian.png`
- Short labels: HP, MSk, RSk, MDf, RDf, Fat, Res, Ini

**Color-Coded Stat Bars:**
- Percentage-based coloring relative to global min/max averages across all backgrounds
- Gradient: red (`rgb(192,57,43)`) at 0% through yellow (`rgb(230,184,0)`) at 50% to green (`rgb(39,174,96)`) at 100%
- Same color logic used for both sparkline bars (collapsed) and full attribute bars (expanded)

### Key Design Tokens (CSS Variables)
| Variable | Value | Usage |
|----------|-------|-------|
| `--bg` | `#080808` | Page background |
| `--surface` | `#141414` | Row background |
| `--surface-h` | `#1e1e1e` | Row hover/active |
| `--expanded` | `#1a1a1a` | Expanded panel background |
| `--amber` | `#d4a843` | Primary accent (active pills, badges, nav) |
| `--amber-dim` | `#9a7520` | Dimmed accent (focus borders) |
| `--border` | `#222` | Separator lines |
| `--nav-h` | `52px` | Bottom navigation height |

---

## 3. Structure

```
battle_brothers/
|-- .claude/
|   |-- settings.local.json     # Claude Code settings (model, permissions)
|-- .planning/
|   |-- PROJECT.md              # Project requirements and decisions
|   |-- config.json             # GSD Light planning config
|   |-- CODEBASE.md             # This file
|-- assets/
|   |-- icons/                  # 67 PNG portraits (mixed naming conventions)
|       |-- Background_06.png   # Numbered generic backgrounds
|       |-- Background 70.png   # Note: space in filename (not underscore)
|       |-- Barbarian.png       # Named character backgrounds
|       |-- Butcher_02.png      # Named with suffix
|       |-- ...
|-- data/
|   |-- backgrounds.json        # 6708 lines, 67 backgrounds, wiki-scraped data
|-- mockups/
|   |-- design1_card_grid.html  # Rejected mockup: card grid layout
|   |-- design2_dense_table.html# Rejected mockup: dense table layout
|   |-- design3_accordion.html  # SELECTED mockup: accordion layout (868 lines)
```

### Key Files for Active Requirements

| File | Role | Lines |
|------|------|-------|
| `mockups/design3_accordion.html` | Complete working reference implementation | 868 |
| `data/backgrounds.json` | Production data source (67 backgrounds, 8 attrs each) | 6,708 |
| `assets/icons/` | 67 PNG icon portraits | -- |
| `.planning/PROJECT.md` | Requirements definition | 68 |

### What Needs to Be Created (does not exist yet)
- `index.html` -- Production entry point
- Potentially separate `styles.css` and `app.js` files (or combined in a single HTML file, per the constraint "no build tools or frameworks required")

---

## 4. Concerns & Gaps

### Data Loading Gap (Critical)
The mockup embeds all background data as a ~4KB inline JSON literal (`EMBEDDED_DATA`). The production version **must** load from `data/backgrounds.json` via `fetch()`. This requires:
- Async initialization (the mockup uses synchronous inline data)
- Loading state handling (spinner or skeleton while data loads)
- Error handling if the JSON fails to load
- CORS consideration if served from a different origin (unlikely for static hosting)

### Icon Path Mapping Gap (Medium)
- The mockup references icons as `../assets/${bg.icon}` (relative path from `mockups/` directory)
- The JSON stores paths like `icons/Background_06.png` (relative to `assets/`)
- Production `index.html` at root will need paths like `assets/${bg.icon}`
- One filename contains a space (`Background 70.png` for the Anatomist) which could cause issues if not URL-encoded

### Missing Production Files (Critical -- All Active Requirements Depend on This)
No production source files exist. The entire `index.html` (with CSS/JS) needs to be created. However, the mockup provides a nearly complete reference implementation. The production work is primarily:
1. Extract the mockup code into production files
2. Replace `EMBEDDED_DATA` with `fetch('data/backgrounds.json')`
3. Adjust icon paths for root-level serving
4. Add a loading state

### Single-File vs Multi-File Decision (Low)
PROJECT.md says "Static frontend only (HTML/CSS/JS) -- no build tools or frameworks required." It is not specified whether this should be a single `index.html` with inline CSS/JS (matching the mockup pattern) or separated into `index.html`, `styles.css`, and `app.js`. The mockup precedent favors a single file.

### No Accessibility Considerations
The mockup lacks:
- ARIA attributes on the accordion (no `role="button"`, `aria-expanded`, `aria-controls`)
- Keyboard navigation (no `tabindex`, no Enter/Space handlers on rows)
- Screen reader text for sparklines and color-coded bars
- Focus management when accordion items expand/collapse

These are not in the Active requirements but represent a quality gap.

### No Testing Infrastructure
No tests, no test framework, no CI/CD. For a static vanilla JS project this is typical and not blocking, but there is no way to verify the 67 backgrounds render correctly beyond manual inspection.

### Sparkline Data Accuracy
The sparkline bars and stat bars both derive from `globalMin`/`globalMax` averages computed at runtime. If data changes (e.g., wiki updates), the visual representation auto-adjusts. However, there is no validation that the JSON data matches the wiki -- it was scraped once on 2026-03-13.
