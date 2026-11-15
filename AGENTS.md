# AGENTS.md — OGDS AI Components

## What This Is

A structured component knowledge base for AI coding agents building US
government services with the **Open Government Design System (ogds-elements)**
— a Lit web-component implementation of USWDS 3.x patterns styled with
`@ogds/tokens`. 26 component tiles across 8 component families, with
categorized adaptation metadata (schema v2), coordination metadata, and
compliance facts (Section 508 / WCAG 2.1 AA).

**Web components, flattened.** ogds-elements ships shadow-DOM web components.
Registry tiles are their flattened rendered DOM (shadow content with slot
content realized), so tiles work without any framework. The canonical
consumption path is the `<ogds-*>` element itself — every tile names it in
`discovery.ogdsElement` and states its usage in `discovery.ogdsUsage`
(`web-component` or `css-class` for the light-DOM class path).

## How to Query This Registry

1. **Manifest:** https://raw.githubusercontent.com/ednark/ogds-ai-components/main/agents.json
2. **Index:** https://raw.githubusercontent.com/ednark/ogds-ai-components/main/infinite/components.index.json
3. **Facets:** https://raw.githubusercontent.com/ednark/ogds-ai-components/main/infinite/facets.json
4. **Tile pattern:** https://raw.githubusercontent.com/ednark/ogds-ai-components/main/infinite/{file}
5. **Appearance:** per tile, the sibling `.resolved.html` (computed styles inline)

## Workflow

1. Fetch the index (lean — discovery facets + lean summaries only)
2. Filter in code by section, ogdsComponentType, requiresJs, a11y, govCompliance, costTier, supportedTokenProfiles
3. Fetch only the chosen tiles
4. Parse the `ogds-agent-meta` JSON block inside each tile
5. Check `_schemaVersion` (2) categories:
   - `discovery` — facets (index carries them; compliance/mobileUX blocks are tile-side)
   - `selection` — `useWhen` / `avoidWhen` / `guidance`
   - `instruction` — `agentPrompt`, `behavior` contract
   - `coordination` — `prerequisiteComponents`, `compositionCost`, `agentPromptSequence`
   - `constraints` — `preserve` / `editable` / `limitations` / `portableInvariants`
   - `portability` — `classMapping` (uswds)
6. Adapt within `constraints`; verify `constraints.preserve` in output

## OGDS-Specific Rules

- **The web component is canon.** When `<ogds-*>` elements are available, use
  them; the static tile markup is the no-framework fallback and the
  adaptation baseline. Tile CSS is derived from the package stylesheets —
  never restyle ogds-* classes.
- **Behavior contracts are truthful.** Tiles with interactive behavior carry
  `instruction.behavior` (source: inline) with a dependency-free script.
  When you wire the real `<ogds-*>` element, **omit the inline script**
  (single-handling rule — never double-register handlers).
- **Icons are CSS custom properties.** ogds injects icon data-URIs at runtime
  (--ogds-icon-*, --icon-*); the tile CSS carries them inline. Don't delete
  the decorative `<img>`/`<span>` icon elements — CSS drives them.
- **task-list counter is mount-time.** The "N of M tasks completed" counter is
  computed on slotchange upstream and static in the tile — recompute it
  yourself when statuses change.
- **status attribute drives badge styling** on task-list-step (the stylesheet
  keys `.ogds-tag.badge` off `[status="…"]`) — keep it in sync with the badge
  label.
- Check `govCompliance` (Section 508 / WCAG 2.1 AA).

## Cross-Registry Transfer

- ogds-elements is a USWDS reimplementation — `compatibility.json` maps every
  family to its USWDS counterpart (`ogds-to-uswds`), most as structural
  adaptations (native details → USWDS button+hidden div) with behavior moving
  to `uswds.min.js`.
- Validate output against `constraints.portableInvariants`.

## MCP Server

`node _base/mcp/server.mjs` (or `npm run mcp`) — 9 tools: `search_components`,
`get_component`, `list_facets`, `get_index`, `get_adapter`,
`translate_component`, `get_recipe`, `query_compliance`, `get_versions`

CLI: `node _base/validate-registry.mjs` (lint), `--conformance .` (certification)

## Quality Gates and Declared Gaps

Do not retrieve or deploy a component that:

- Has `requiresJs: "required"` when the delivery context has no JavaScript
- Whose `constraints.limitations` block the delivery context
- Implements a concept declared in `gaps` (registry.config.json) — ogds-elements
  1.0.0-beta.2 ships 7 components; button, form controls, card, footer,
  breadcrumb, link, and table are declared deferred gaps. Use the gap's
  nearestAlternative (plain semantic HTML styled with @ogds/tokens tokens);
  never invent ogds-* component classes.

## Constraint Priority

1. `constraints.portableInvariants` — NEVER modify
2. `constraints.preserve` — NEVER modify
3. `constraints.limitations` — respect
4. `instruction.agentPrompt` — adapt within boundaries
5. `constraints.editable` — prefer

## Version Sync

This registry mirrors **@ogds/elements@1.0.0-beta.2** (npm, exact pin).
Ground truth is the installed package (`groundTruth: installed-package`):
stylesheets under `node_modules/@ogds/elements/src/components/` are
transformed by `tools/build-ground-truth.mjs` into
`infinite/ground-truth/*.css` (never hand-edited). Rerun the script after
bumping the package, then re-baseline tile purity with a provenance citation.

Note: the validator's exact-version check does not recognize prerelease
suffixed pins (`1.0.0-beta.2`), so it reports a pin warning — the pin is
exact; this is a validator vocabulary gap, tracked upstream.

## Before you change a tile: read the findings ledger

`infinite/findings.json` records what was tested, what broke, and what
changed. Check it before editing a tile body, removing an allowlist entry, or
revising the ground-truth derivation. A summary lives at
`registry-health.json`. See `_base/findings-ledger.md` for the schema.
