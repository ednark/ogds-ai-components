// Shared metadata builders for ogds-ai-components tiles.
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const GT = join(ROOT, 'infinite', 'ground-truth');

export const pkgVersion = JSON.parse(
  readFileSync(join(ROOT, 'node_modules', '@ogds', 'elements', 'package.json'), 'utf-8'),
).version;

/** Inline CSS for a component: token subset + transformed component CSS. */
export function cssFor(component) {
  return readFileSync(join(GT, `ogds-${component}.css`), 'utf-8').trim();
}

/** Base64 data URI for a binary asset shipped by a dependency. */
export function assetDataUri(spec) {
  const buf = readFileSync(join(ROOT, 'node_modules', spec));
  return `data:image/${spec.endsWith('.svg') ? 'svg+xml' : 'png'};base64,${buf.toString('base64')}`;
}

export const DS_VERSION = '1.0.0-beta.2';

export function a11y(overrides = {}) {
  return {
    wcag21AA: true,
    keyboardNav: true,
    screenReader: true,
    reducedMotion: true,
    forcedColors: false,
    ariaAttributes: true,
    ...overrides,
  };
}

export function provenance(component, extra = {}) {
  return {
    observed: '2026-11-15',
    method: 'design-system documentation',
    tier: 'design-system-source',
    source: `https://github.com/open-government-design-system/ogds-elements — src/components/${component}/ (render template, CSS, stories) at v${DS_VERSION}`,
    designSystemVersion: DS_VERSION,
    ...extra,
  };
}

export function cost(tokens, { tier = 'cheap', ms = 10, model = 'haiku' } = {}) {
  return {
    costTier: tier,
    estimatedTokens: tokens,
    renderingTimeMs: ms,
    recommendedModel: model,
  };
}

export function govCompliance() {
  return ['Section 508', 'WCAG 2.1 AA'];
}

/**
 * Flattening note: registry tiles are the flattened rendered DOM of each
 * component (shadow-DOM content with slot fallback content realized). Where
 * per-shadow-root ids (badge, blocked-message) collide when flattened, they
 * are uniquified with a numeric suffix — an artifact of flattening, not a
 * component change. State it in constraints.limitations where relevant.
 */
export const FLATTENING_NOTE =
  'This tile is the flattened rendered DOM of <{tag}> (shadow-DOM content with slot content realized; per-instance ids uniquified where flattening would collide). The canonical consumption path is the <{tag}> web component itself.';
