// ogds-header tiles — flattened desktop-mode rendered DOM of <ogds-header>.
// Desktop (>=64rem) rendering: navbar row (logo + menu button), optional
// secondary nav, primary-nav row. The mobile <dialog> drawer is a different
// render branch (documented in constraints.limitations).
import { a11y, provenance, cost, govCompliance } from './_shared.mjs';

const PRIMARY_NAV = `<div class="ogds-primary-nav" role="navigation" aria-label="Primary navigation">
  <ul>
    <li><a href="#" aria-current="page">Current section</a></li>
    <li>
      <details>
        <summary>Benefits</summary>
        <ul>
          <li><a href="#">Navigation link</a></li>
          <li><a href="#">Navigation link</a></li>
          <li><a href="#">Navigation link</a></li>
          <li><a href="#">Navigation link</a></li>
        </ul>
      </details>
    </li>
    <li>
      <details>
        <summary>Resources</summary>
        <ul>
          <li><a href="#">Navigation link</a></li>
          <li><a href="#">Navigation link</a></li>
          <li><a href="#">Navigation link</a></li>
        </ul>
      </details>
    </li>
    <li><a href="#">Simple link</a></li>
  </ul>
</div>`;

const SECONDARY_LINKS = `<ul class="example-secondary-links">
  <li><a href="#">Secondary link</a></li>
  <li><a href="#">Another secondary link</a></li>
</ul>`;

const SEARCH = `<form class="example-search" role="search">
  <input type="search" aria-label="Search" name="q">
  <button type="submit">Search</button>
</form>`;

// Story demo styles (from ogds-header.stories.ts) — example scaffolding,
// declared in the registry's demo vocabulary, not component classes.
const EXTRA_STYLE = `/* demo styles from ogds-header.stories.ts (site layer, not component CSS) */
.example-search {
  display: flex;
}

.example-search input[type="search"] {
  border: 1px solid var(--ogds-theme-color-base-dark);
  border-radius: 0;
  border-right: none;
  font-family: var(--ogds-theme-button-font-family);
  height: 2.5rem;
  padding-inline: var(--ogds-spacing-1);
}

.example-search button {
  background-color: var(--ogds-theme-button-fill-color);
  border: none;
  border-radius: 0 var(--ogds-theme-button-border-radius)
    var(--ogds-theme-button-border-radius) 0;
  color: var(--ogds-theme-button-text-color);
  cursor: pointer;
  font-family: var(--ogds-theme-button-font-family);
  font-weight: 700;
  height: 2.5rem;
  padding-inline: var(--ogds-spacing-105);
}

.example-search button:hover {
  background-color: var(--ogds-theme-color-primary-dark);
}

.example-secondary-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.example-secondary-links li + li {
  border-inline-start: 1px solid var(--ogds-theme-color-base-lighter);
  margin-inline-start: var(--ogds-spacing-1);
  padding-inline-start: var(--ogds-spacing-1);
}

.example-secondary-links a {
  color: var(--ogds-theme-color-base);
  font-family: var(--ogds-theme-button-font-family);
  font-size: var(--ogds-theme-type-scale-2xs);
  text-decoration: none;
}

.example-secondary-links a:hover {
  color: var(--ogds-theme-color-primary);
  text-decoration: underline;
}`;

function headerBody({ variant, withNotifications, withSecondaryLinks }) {
  const extended = variant === 'extended';
  const secondary = withSecondaryLinks
    ? `${SECONDARY_LINKS}
  ${SEARCH}`
    : SEARCH;
  const navSecondaryDesktop = extended
    ? `<nav class="nav-secondary" part="nav-secondary" aria-label="Secondary navigation">
      ${secondary}
    </nav>`
    : '';
  const navSecondaryInPrimary = extended
    ? ''
    : `<nav class="nav-secondary" part="nav-secondary" aria-label="Secondary navigation">
      ${secondary}
    </nav>
      `;
  const notifications = withNotifications
    ? `<div class="notifications" part="notifications">
      Notifications
    </div>`
    : `<div class="notifications" part="notifications" hidden></div>`;

  return `<div class="ogds-header" role="banner">
  <div class="content">
    <div class="navbar-row" part="navbar">
      <div class="navbar-row-inner" part="navbar-inner">
        <div class="logo" part="logo">
          <div><a href="/">Project name</a></div>
        </div>
        <button type="button" class="menu-btn" part="menu-btn" aria-expanded="false">
          Menu
        </button>
      </div>
      ${navSecondaryDesktop}
    </div>
    <div class="primary-row" part="nav-primary-row">
      ${navSecondaryInPrimary}<div class="primary-row-inner" part="nav-primary-row-inner">
        <div class="nav-primary">
          ${PRIMARY_NAV}
        </div>
        ${notifications}
      </div>
    </div>
  </div>
</div>`;
}

const baseMeta = (variant, opts) => ({
  file: `header/${variant}.html`,
  title: `Header (${variant})`,
  _schemaVersion: 2,
  discovery: {
    description:
      'Responsive site header (logo, menu button, primary nav row; extended adds a secondary nav row) matching the USWDS header patterns.',
    tier: 'curated',
    tags: ['header', 'navigation', 'navbar', 'site header', 'masthead'],
    ogdsComponentType: 'header',
    ogdsElement: 'ogds-header',
    ogdsUsage: 'web-component',
    ogdsClass: 'ogds-header',
    section: 'navigation',
    variant,
    requiresJs: 'no',
    interaction: ['focus', 'click', 'keyboard'],
    a11y: a11y({ reducedMotion: false }),
    govCompliance: govCompliance(),
  },
  selection: {
    useWhen: ['Top-of-page site chrome for a government service or agency site'],
    avoidWhen: ['In-page section navigation — use ogds-primary-nav alone'],
  },
  instruction: {
    agentPrompt: `Two variants: extended (secondary nav aligned with the logo on its own row) and basic (secondary nav folded into the primary-nav row). The logo slot is your site identity; nav-primary expects an ogds-primary-nav. This tile is the desktop (>=64rem) rendering. Below 64rem the component swaps the primary row for a <dialog> drawer opened by the menu button — reproducing that requires the <ogds-header> web component or equivalent JS; the static menu button is inert. Search form and secondary links here are story-level example markup (example-* classes) — replace with your own content.`,
    relatedComponents: ['primary-nav', 'accordion', 'banner'],
  },
  coordination: {
    prerequisiteComponents: [
      {
        name: 'primary-nav',
        reason: 'The nav-primary slot expects an ogds-primary-nav (embedded flattened in this tile)',
      },
    ],
    incompatibleWith: [],
    compositionCost: cost(3200, { tier: 'moderate', ms: 20 }),
  },
  constraints: {
    preserve: [
      'role="banner" on the header root',
      'The navbar/primary-row part structure and the menu button aria-controls="nav" relationship',
      'Secondary nav carries aria-label="Secondary navigation"',
    ],
    portableInvariants: [
      'banner landmark for site chrome',
      'navigation landmark for primary nav',
      'Menu trigger with aria-controls/aria-expanded when a drawer exists',
    ],
    editable: [
      'Logo content and link',
      'Primary nav items',
      'Secondary nav content (links, search form)',
      'variant (extended | basic)',
    ],
    limitations: [
      'This tile is the desktop rendering; the mobile <dialog> drawer (menu button → showModal) exists only in the web component below 64rem',
      'Markup difference, documented: the upstream template renders aria-controls="nav" on the menu button, targeting the mobile-only <dialog id="nav"> — the static desktop tile omits it because the dialog branch is not rendered here; restore the attribute (and the dialog) when wiring the web component or a mobile drawer',
      'The div.logo wrapper is a template structural class (the shadow stylesheet styles it through nested selectors); it is styled by the web component at runtime',
      'Search form styling comes from the story-level example CSS, not the component',
    ],
  },
  portability: {
    classMapping: {
      uswds: { base: 'usa-header', variants: { basic: 'usa-header--basic', extended: 'usa-header--extended' } },
    },
  },
  supportedTokenProfiles: [],
});

const variants = [
  { variant: 'extended', opts: { variant: 'extended', withNotifications: true, withSecondaryLinks: true } },
  { variant: 'basic', opts: { variant: 'basic', withNotifications: false, withSecondaryLinks: false } },
];

export default variants.map(({ variant, opts }) => ({
  components: ['ogds-header', 'ogds-primary-nav'],
  file: `header/${variant}.html`,
  title: `Header (${variant})`,
  description: `Open Government Design System site header (${variant}) with primary nav.`,
  body: headerBody(opts),
  meta: {
    ...baseMeta(variant, opts),
    file: `header/${variant}.html`,
    title: `Header (${variant})`,
    provenance: provenance('ogds-header', {
      contractLayer: 'css',
      contractNote:
        'the stylesheet targets the row/part structure (navbar-row, primary-row, nav-secondary) and full-bleed backgrounds compute from row CSS custom properties; the desktop vs mobile branches render structurally different DOM',
    }),
  },
  extraStyle: EXTRA_STYLE,
}));
