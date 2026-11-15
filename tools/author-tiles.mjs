#!/usr/bin/env node
/**
 * author-tiles.mjs — assemble registry tiles from per-component definitions.
 *
 * Each tile module exports an array of tile defs:
 *   { file, title, description, body, script?, extraStyle? }
 * The body is the flattened rendered DOM of the ogds component (slots
 * replaced by the story content); the meta block is authored here too.
 *
 * Assembly: doctype/head + agent-meta JSON block + inline <style> with the
 * component's ground-truth CSS (token subset + transformed component CSS from
 * tools/build-ground-truth.mjs) + body + optional behavior script.
 *
 * Rerunning rewrites all tiles identically — the tile body is data, the
 * assembly is mechanical. Never hand-edit emitted tiles; edit the module,
 * rerun, then re-baseline purity with a provenance citation if a body changed.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { cssFor } from './tiles/_shared.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const pkgVersion = JSON.parse(
  readFileSync(join(ROOT, 'node_modules', '@ogds', 'elements', 'package.json'), 'utf-8'),
).version;

const esc = (s) => JSON.stringify(s, null, 2).replace(/</g, '\\u003c');

export function assembleTile(tile, agentMetaId) {
  const style = (tile.components ?? [tile.component])
    .map((c) => cssFor(c))
    .concat(tile.extraStyle ?? '')
    .filter(Boolean)
    .join('\n\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="description" content="${tile.description}">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${tile.title}</title>
<script type="application/json" id="${agentMetaId}">${esc(tile.meta)}</script>
<style>
/* ${(tile.components ?? [tile.component]).join(' + ')} — derived light-DOM CSS from @ogds/elements@${pkgVersion} (tools/build-ground-truth.mjs). */
${style}
</style>
</head>
<body>
${tile.body.trim()}
${tile.script ? `<script>\n${tile.script.trim()}\n</script>` : ''}
</body>
</html>
`;
}

// --- tile modules ---
const modules = [
  'alert',
  'accordion',
  'accordion-toggle',
  'banner',
  'header',
  'primary-nav',
  'task-list',
];

const tiles = [];
for (const m of modules) {
  const mod = await import(join(ROOT, 'tools', 'tiles', `${m}.mjs`));
  tiles.push(...mod.default);
}

const config = JSON.parse(readFileSync(join(ROOT, 'registry.config.json'), 'utf-8'));
const tileDir = config.tileDir ?? 'infinite';
let written = 0;
for (const tile of tiles) {
  const out = join(ROOT, tileDir, tile.file);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, assembleTile(tile, config.agentMetaId));
  written++;
}
console.log(`wrote ${written} tiles to ${tileDir}/`);
