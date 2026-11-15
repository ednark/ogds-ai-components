# ogds-ai-components

[Open Government Design System (ogds-elements)](https://github.com/open-government-design-system/ogds-elements)
registry for AI coding agents — part of the
[AI Component Registry](https://github.com/ednark/ai-component-registry-spec)
family (`_base` submodule).

**26 tiles · 8 component families · @ogds/elements@1.0.0-beta.2 (installed-package ground truth)**

ogds-elements is a Lit web-component library implementing USWDS 3.x patterns
with `@ogds/tokens`. This registry tiles its components as self-contained
static HTML: the **flattened rendered DOM** of each component (shadow-DOM
content with slot content realized), with the component's derived light-DOM
CSS inlined so every tile renders by double-click. The canonical consumption
path remains the `<ogds-*>` web component, named per tile in
`discovery.ogdsElement`.

| Family | Tiles | Notes |
|---|---|---|
| `accordion` | 5 | native details/summary; bordered / with-icon / plus / right variants |
| `accordion-toggle` | 2 | expand/collapse-all with label flip (inline behavior script) |
| `alert` | 6 | info / warning / success / error / slim / no-icon |
| `banner` | 4 | official-website banner; en/es, gov/mil, expanded |
| `header` | 2 | extended and basic (desktop rendering) |
| `primary-nav` | 2 | details-based submenus; web-component and css-class usage |
| `task-list` | 1 | "N of M tasks completed" counter + 4 step states |
| `task-list-step` | 3 | default / with-alert / with-saved-data / blocked |

## How agents interface with this registry

Plain HTTP over static files — no server required:

```
1. GET  agents.json                     → manifest: count, URLs, facets
2. GET  infinite/facets.json            → filter vocabulary (tiny)
3. GET  infinite/components.index.json  → lean index — filter IN CODE
4. GET  infinite/{file}                 → tile: source + embedded meta
   (+)  infinite/{variant}.resolved.html → computed-style standalone rendering
```

Prose (useWhen/avoidWhen/agentPrompt/constraints) travels **inside the tile**.
MCP server: `node _base/mcp/server.mjs` (9 tools).

## How the tiles are built (reproducible)

```bash
npm install                          # pins @ogds/elements@1.0.0-beta.2 + puppeteer
node tools/build-ground-truth.mjs    # package CSS → infinite/ground-truth/*.css
node tools/author-tiles.mjs          # tools/tiles/*.mjs → infinite/**.html
node _base/generate-index.mjs        # index + facets + tile-purity baseline
node _base/generate-resolved-view.mjs# computed-style companions
node _base/validate-registry.mjs --conformance .
```

- `tools/build-ground-truth.mjs` mechanically transforms the installed
  package's shadow-DOM stylesheets to light DOM (`:host` → root class,
  `::slotted(X)` → root `> X`, `::part(button)` → root `button`; class names
  unchanged) and subsets the token sheets each component consumes. Outputs are
  generated — never hand-edit.
- `tools/author-tiles.mjs` assembles tiles from `tools/tiles/*.mjs` modules
  (flattened markup + authored agent-meta); rerunning rewrites tiles
  identically.
- Upstream markup defects are corrected in tiles **with documentation** in the
  tile's `constraints.limitations` (see banner's `gov-banner-default` id).

## Status

- Conformance: `node _base/validate-registry.mjs --conformance .` → pass,
  0 errors, 1 benign warning (prerelease pin not recognized as an exact
  version by the validator).
- Recipes and pattern guidance: not yet published (roadmap).
- `compatibility.json` maps every family to USWDS 3.14 (`ogds-to-uswds`).
