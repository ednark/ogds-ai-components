// ogds-primary-nav tiles — flattened light DOM of <ogds-primary-nav>.
// The component renders nothing itself; it is a behavior + styling shell over
// the authored <ul> of <li> items (plain links or details/summary submenus).
import { a11y, provenance, cost, govCompliance } from './_shared.mjs';

const NAV_UL = `<ul>
  <li><a href="#" aria-current="page">Current section</a></li>
  <li>
    <details>
      <summary>Benefits</summary>
      <ul>
        <li><a href="#">Apply for benefits</a></li>
        <li><a href="#">Check application status</a></li>
        <li><a href="#">Manage your account</a></li>
      </ul>
    </details>
  </li>
  <li>
    <details>
      <summary>Resources</summary>
      <ul>
        <li><a href="#">Guides</a></li>
        <li><a href="#">FAQ</a></li>
      </ul>
    </details>
  </li>
  <li><a href="#">About</a></li>
  <li><a href="#">Contact</a></li>
</ul>`;

const SCRIPT = `(function () {
  var nav = document.querySelector('.ogds-primary-nav');
  if (!nav) return;
  var submenus = Array.prototype.slice.call(nav.querySelectorAll(':scope > ul > li > details'));
  var instanceName = 'ogds-primary-nav-1';
  submenus.forEach(function (d) {
    if (!d.hasAttribute('name')) d.setAttribute('name', instanceName);
  });
  document.addEventListener('click', function (event) {
    submenus.forEach(function (details) {
      if (details.open && event.target && !details.contains(event.target)) {
        details.open = false;
      }
    });
  });
  nav.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    var openSubmenus = submenus.filter(function (d) { return d.open; });
    if (!openSubmenus.length) return;
    var active = document.activeElement;
    var target = openSubmenus.find(function (d) { return d.contains(active); }) || openSubmenus[0];
    target.open = false;
    var summary = target.querySelector(':scope > summary');
    if (summary) summary.focus();
  });
})();`;

const baseMeta = (variant, usage) => ({
  file: `primary-nav/${variant}.html`,
  title: `Primary Nav (${variant})`,
  _schemaVersion: 2,
  discovery: {
    description:
      'Responsive primary navigation: stacked list below the desktop breakpoint, horizontal bar with exclusive-open dropdown submenus at >=64rem.',
    tier: 'curated',
    tags: ['navigation', 'nav', 'menu', 'submenu', 'dropdown'],
    ogdsComponentType: 'primary-nav',
    ogdsElement: 'ogds-primary-nav',
    ogdsUsage: usage,
    ogdsClass: 'ogds-primary-nav',
    section: 'navigation',
    variant,
    requiresJs: 'optional',
    interaction: ['click', 'keyboard', 'hover'],
    a11y: a11y(),
    govCompliance: govCompliance(),
  },
  selection: {
    useWhen: ['Primary section navigation for a government site header'],
    avoidWhen: ['Footer link lists or breadcrumb trails'],
  },
  instruction: {
    agentPrompt: `Author the nav as a single top-level <ul> of <li> items: plain links as <a>, submenus as <details><summary>…</summary><ul>…</ul></details>. Submenus open and close natively (details); no script is required for basic operation. Add aria-current="page" to the current page's <a> to get the current-page indicator. The inline script replicates the upstream behaviors that need JS: exclusive-open via a shared name attribute on top-level details, click-outside closing, and Escape closing + refocusing the summary. Mark the current page in your own app logic. When wiring the real <ogds-primary-nav> element, omit the inline script (single-handling rule).`,
    relatedComponents: ['header', 'accordion'],
  },
  coordination: {
    prerequisiteComponents: [],
    incompatibleWith: [],
    compositionCost: cost(2000),
  },
  constraints: {
    preserve: [
      'navigation role and aria-label (the element sets them if absent)',
      'Single top-level <ul>; submenus only as details/summary',
      'aria-current="page" as the current-page marker',
    ],
    portableInvariants: [
      'navigation landmark',
      'details/summary submenu disclosure',
      'aria-current="page" semantics',
    ],
    editable: [
      'Nav items, labels, and hrefs',
      'Number of submenus and their links',
      'Current-page assignment',
    ],
    limitations: [
      'Hiding the nav behind a menu button on narrow viewports is ogds-header\'s job, not this component\'s',
      'The exclusive-open name attribute value is instance-scoped upstream via a per-instance counter; this static tile hardcodes the first instance',
    ],
  },
  portability: {
    classMapping: {
      uswds: { base: 'usa-nav', variants: {} },
    },
  },
  supportedTokenProfiles: [],
});

const variants = [
  {
    variant: 'default',
    usage: 'web-component',
    root: `<nav class="ogds-primary-nav" role="navigation" aria-label="Primary navigation">
  ${NAV_UL}
</nav>`,
  },
  {
    variant: 'class-only',
    usage: 'css-class',
    root: `<div class="ogds-primary-nav" role="navigation" aria-label="Primary navigation">
  ${NAV_UL}
</div>`,
  },
];

export default variants.map(({ variant, usage, root }) => ({
  component: 'ogds-primary-nav',
  file: `primary-nav/${variant}.html`,
  title: `Primary Nav (${variant})`,
  description: `Open Government Design System primary navigation (${variant}).`,
  body: root,
  script: SCRIPT,
  meta: {
    ...baseMeta(variant, usage),
    file: `primary-nav/${variant}.html`,
    title: `Primary Nav (${variant})`,
    instruction: {
      ...baseMeta(variant, usage).instruction,
      behavior: {
        requires: 'optional',
        source: 'inline',
        init: 'auto — the inline script assigns the shared name attribute to top-level details and binds document click-outside + Escape handling',
        fallback:
          'Submenus open and close via native details/summary with no JS; exclusive-open, click-outside, and Escape behaviors are lost',
      },
    },
    provenance: provenance('ogds-primary-nav', {
      contractLayer: 'both',
      contractNote:
        'the stylesheet targets .ogds-primary-nav (light-DOM adopted styles) and connectedCallback assigns role/aria-label, the details name attributes, and the click/Escape listeners',
    }),
  },
}));
