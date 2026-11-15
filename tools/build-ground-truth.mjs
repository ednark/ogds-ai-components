#!/usr/bin/env node
/**
 * build-ground-truth.mjs — derive light-DOM stylesheets from the installed
 * @ogds/elements package.
 *
 * ogds-elements components are Lit web components: styles live in shadow-DOM
 * stylesheets using :host / ::slotted selectors (or, for light-DOM components,
 * plain selectors adopted into the document). Registry tiles are static HTML,
 * so this script mechanically transforms the package CSS into a light-DOM
 * stylesheet the tiles and resolved views can consume:
 *
 *   :host              → {rootClass}
 *   :host([attr])      → {rootClass}[attr]
 *   ::slotted(X)       → {rootClass} > X
 *
 * Class names are never rewritten — the classCheck against this stylesheet
 * verifies the same class names the package CSS defines.
 *
 * Inputs (pinned by package.json devDependencies):
 *   node_modules/@ogds/tokens/build/css/*.css          — token sheets
 *   node_modules/@ogds/elements/src/components/<c>/*.css
 *   runtime-injected icon custom properties (ICON_BLOCKS below), resolved
 *   from the package's SVG assets as data URIs
 *
 * Output:
 *   infinite/ground-truth/ogds-tokens.css      — concatenated token sheets
 *   infinite/ground-truth/ogds-components.css  — transformed component CSS
 *
 * Rerun after bumping @ogds/elements. Never hand-edit the outputs.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PKG = join(ROOT, 'node_modules', '@ogds');
const OUT = join(ROOT, 'infinite', 'ground-truth');

const pkgVersion = JSON.parse(
  readFileSync(join(PKG, 'elements', 'package.json'), 'utf-8'),
).version;

// Component tag → root class used by the component's own CSS.
const ROOT_CLASS = {
  'ogds-accordion': '.ogds-accordion',
  'ogds-accordion-toggle': '.ogds-accordion-toggle',
  'ogds-alert': '.ogds-alert',
  'ogds-banner': '.ogds-banner',
  'ogds-header': '.ogds-header',
  'ogds-primary-nav': '.ogds-primary-nav',
  'ogds-task-list': '.ogds-task-list',
  'ogds-task-list-step': '.ogds-task-list-step',
};

// Sub-component CSS files that live in another component's directory but
// transform to their own root class.
const FILE_ROOT = {
  'ogds-task-list-step.css': '.ogds-task-list-step',
};

// Icon custom properties injected at runtime by each component (adopted
// stylesheets or interpolated css`` blocks — not present in the .css files).
// Values resolved from SVG assets as data URIs. Source of truth:
// src/components/<c>/index.ts (alert ~45-48, accordion 57-60, primary-nav
// 62-65, banner 213-219, header localStyles, task-list-step static styles).
const ICON_BLOCKS = {
  'ogds-alert': {
    scope: '.ogds-alert',
    vars: {
      '--ogds-icon-check-circle': '@ogds/elements/src/shared/icons/check_circle.svg',
      '--ogds-icon-warning': '@ogds/elements/src/shared/icons/warning.svg',
      '--ogds-icon-info': '@ogds/elements/src/shared/icons/info.svg',
      '--ogds-icon-error': '@ogds/elements/src/shared/icons/error.svg',
    },
    note: 'alert inlines these as data-URI literals in index.ts; resolved from the same shared icons here',
  },
  'ogds-accordion': {
    scope: 'ogds-accordion, .ogds-accordion',
    vars: {
      '--icon-chevron-pointing-down': '@ogds/elements/src/shared/icons/expand_more.svg',
      '--icon-chevron-pointing-up': '@ogds/elements/src/shared/icons/expand_less.svg',
      '--icon-plus': '@ogds/elements/src/shared/icons/add.svg',
      '--icon-minus': '@ogds/elements/src/shared/icons/remove.svg',
    },
  },
  'ogds-banner': {
    scope: '.ogds-banner',
    vars: {
      '--ogds-icon-close': '@ogds/elements/src/shared/icons/close.svg',
      '--ogds-icon-expand-less': '@ogds/elements/src/shared/icons/expand_less.svg',
      '--ogds-icon-expand-more': '@ogds/elements/src/shared/icons/expand_more.svg',
      '--ogds-icon-gov': '@uswds/uswds/img/icon-dot-gov.svg',
      '--ogds-icon-https': '@uswds/uswds/img/icon-https.svg',
    },
  },
  'ogds-header': {
    scope: '.ogds-header',
    vars: {
      '--ogds-header-icon-close': '@ogds/elements/src/shared/icons/close.svg',
      '--ogds-header-icon-menu': '@ogds/elements/src/shared/icons/menu.svg',
    },
  },
  'ogds-primary-nav': {
    scope: 'ogds-primary-nav, .ogds-primary-nav',
    vars: {
      '--ogds-primary-nav-icon-chevron-down': '@ogds/elements/src/shared/icons/expand_more.svg',
      '--ogds-primary-nav-icon-chevron-up': '@ogds/elements/src/shared/icons/expand_less.svg',
    },
  },
  'ogds-task-list-step': {
    scope: '.ogds-task-list-step',
    vars: {
      '--ogds-icon-check-circle': '@ogds/elements/src/shared/icons/check_circle.svg',
      '--ogds-icon-arrow-forward': '@ogds/elements/src/shared/icons/arrow_forward.svg',
    },
  },
};

function transform(css, rootClass, tag) {
  let out = css
    // :host([attr]) before plain :host
    .replace(/:host\(\[([^\]]+)\]\)/g, `${rootClass}[$1]`)
    .replace(/:host\b/g, rootClass)
    // ::slotted(X) — slotted nodes are direct children of the host
    .replace(/::slotted\(([^)]+)\)/g, `${rootClass} > $1`)
    // ::slotted bare
    .replace(/::slotted\b/g, rootClass);
  // ::part(X): static tiles have no shadow boundary, so the part's element is
  // styled through a descendant selector. Only known case: the toggle button.
  if (tag === 'ogds-accordion-toggle') {
    out = out.replace(
      new RegExp(`${tag}::part\\(button\\)`, 'g'),
      `${rootClass} button`,
    );
  }
  return out;
}

/** Resolve an svg path, falling back to dist/ for package subpath imports
 *  (e.g. @uswds/uswds/img/x.svg resolves to dist/img/x.svg via exports). */
function resolveSvgFile(path) {
  if (existsSync(path)) return path;
  const fallback = path.replace(/\/node_modules\/(@[\w-]+\/[\w-]+)\//, '/node_modules/$1/dist/');
  if (existsSync(fallback)) return fallback;
  throw new Error(`svg not found: ${path}`);
}

function svgDataUri(spec) {
  const svg = readFileSync(resolveSvgFile(join(ROOT, 'node_modules', spec)), 'utf-8').trim();
  return `data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, '%27')}`;
}

// --- tokens ---
const tokenDir = join(PKG, 'tokens', 'build', 'css');
const tokenFiles = readdirSync(tokenDir).filter((f) => f.endsWith('.css')).sort();
const tokenSources = new Map(
  tokenFiles.map((f) => [f, readFileSync(join(tokenDir, f), 'utf-8')]),
);
const tokens = tokenFiles
  .map((f) => `/* --- ${f} --- */\n${tokenSources.get(f).trim()}`)
  .join('\n\n');
const tokensOut = `/*\n * ogds-tokens.css — DO NOT EDIT: generated by tools/build-ground-truth.mjs\n * from @ogds/tokens (bundled with @ogds/elements@${pkgVersion}).\n * Sheets: ${tokenFiles.join(', ')}\n */\n\n${tokens}\n`;

/** varName → declaration text ("--x: value;"), from all token sheets. */
const tokenDecls = new Map();
for (const src of tokenSources.values()) {
  for (const m of src.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    if (!tokenDecls.has(m[1])) tokenDecls.set(m[1], `${m[1]}: ${m[2].trim()};`);
  }
}

/**
 * Emit only the token declarations a component's CSS (transitively) consumes.
 * Unresolved var() references are left alone: component-local custom
 * properties (--icon-*, --theme-alert-*, etc.) are defined by the component
 * sheet itself or are optional overrides with fallbacks.
 */
function subsetTokens(css) {
  const needed = new Set();
  const queue = [...css.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]);
  while (queue.length) {
    const name = queue.pop();
    if (needed.has(name)) continue;
    const decl = tokenDecls.get(name);
    if (!decl) continue; // component-local or host-provided
    needed.add(name);
    for (const m of decl.matchAll(/var\((--[\w-]+)/g)) queue.push(m[1]);
  }
  if (!needed.size) return '';
  const decls = [...needed].sort().map((n) => `  ${tokenDecls.get(n)}`);
  return `/* ogds tokens subset (generated by tools/build-ground-truth.mjs) */\n:root, :host {\n${decls.join('\n')}\n}\n`;
}

// --- components ---
const compDir = join(PKG, 'elements', 'src', 'components');
const components = readdirSync(compDir).filter((f) =>
  existsSync(join(compDir, f)),
);
const parts = [];
for (const comp of components) {
  if (!ROOT_CLASS[comp]) continue;
  const dir = join(compDir, comp);
  const root = ROOT_CLASS[comp];
  // base-variables.css is the alert's bundled copy of the token palette —
  // ogds-tokens.css already carries those values.
  const cssFiles = readdirSync(dir).filter((f) => f.endsWith('.css') && f !== 'base-variables.css');
  const transformedFiles = cssFiles.map((f) => {
    const fileRoot = FILE_ROOT[f] ?? root;
    const transformed = transform(readFileSync(join(dir, f), 'utf-8').trim(), fileRoot, comp);
    // Per-sheet file: what a tile inlines (token subset + this stylesheet +
    // the icon block — keyed by the sheet's own component, since a
    // sub-component's stylesheet lives in its parent's directory).
    const iconComp = FILE_ROOT[f] ? FILE_ROOT[f].slice(1) : comp;
    let sheetCss = transformed;
    if (ICON_BLOCKS[iconComp]) {
      const { scope, vars, note } = ICON_BLOCKS[iconComp];
      const decls = Object.entries(vars)
        .map(([k, spec]) => `  ${k}: url("${svgDataUri(spec)}");`)
        .join('\n');
      sheetCss += `\n\n/* runtime-injected icon variables${note ? ` (${note})` : ''} */\n${scope} {\n${decls}\n}`;
    }
    writeFileSync(
      join(OUT, `ogds-${f.replace(/\.css$/, '')}.css`),
      `${subsetTokens(sheetCss)}\n/* --- ${f} (from @ogds/elements@${pkgVersion}) --- */\n${sheetCss}\n`,
    );
    return transformed;
  });
  let css = transformedFiles.join('\n\n');
  if (ICON_BLOCKS[comp]) {
    const { scope, vars, note } = ICON_BLOCKS[comp];
    const decls = Object.entries(vars)
      .map(([k, spec]) => `  ${k}: url("${svgDataUri(spec)}");`)
      .join('\n');
    css += `\n\n/* runtime-injected icon variables${note ? ` (${note})` : ''} */\n${scope} {\n${decls}\n}`;
  }
  const transformed = transform(css, root, comp);
  parts.push(`/* --- ${comp} (${pkgVersion}) --- */\n${transformed}`);
}
const compOut = `/*\n * ogds-components.css — DO NOT EDIT: generated by tools/build-ground-truth.mjs\n * from @ogds/elements@${pkgVersion} shadow-DOM stylesheets.\n * Transforms: :host → root class; :host([attr]) → root[attr]; ::slotted(X) → root > X.\n * Class names are unchanged from the package CSS.\n */\n\n${parts.join('\n\n')}\n`;

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'ogds-tokens.css'), tokensOut);
writeFileSync(join(OUT, 'ogds-components.css'), compOut);

const stamp = (s) => createHash('sha256').update(s).digest('hex').slice(0, 12);
console.log(`ogds-tokens.css     ${(tokensOut.length / 1024).toFixed(0)} KB  sha256:${stamp(tokensOut)}`);
console.log(`ogds-components.css ${(compOut.length / 1024).toFixed(0)} KB  sha256:${stamp(compOut)}`);
console.log(`from @ogds/elements@${pkgVersion}`);
