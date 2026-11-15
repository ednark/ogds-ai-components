// ogds-accordion tiles — flattened light DOM of <ogds-accordion>.
// The component renders nothing itself; it is a styling/ARIA shell over
// native <details> children, so the flattened body is a .ogds-accordion div
// (or the element itself) containing plain <details> elements.
import { a11y, provenance, cost, govCompliance } from './_shared.mjs';

const ITEMS = `<details>
    <summary>First Amendment</summary>
    <p>
      Congress shall make no law respecting an establishment of religion, or
      prohibiting the free exercise thereof; or abridging the freedom of speech,
      or of the press; or the right of the people peaceably to assemble, and to
      petition the Government for a redress of grievances.
    </p>
  </details>
  <details>
    <summary>Second Amendment</summary>
    <p>
      A well regulated Militia, being necessary to the security of a free State,
      the right of the people to keep and bear Arms, shall not be infringed.
    </p>
  </details>
  <details>
    <summary>Third Amendment</summary>
    <p>
      No Soldier shall, in time of peace be quartered in any house, without the
      consent of the Owner, nor in time of war, but in a manner to be prescribed
      by law.
    </p>
  </details>`;

function accordionBody(classes) {
  const cls = ['ogds-accordion', ...classes].join(' ');
  return `<div class="${cls}">
  ${ITEMS}
</div>`;
}

const baseMeta = (variant, classes) => ({
  file: `accordion/${variant}.html`,
  title: `Accordion (${variant})`,
  _schemaVersion: 2,
  discovery: {
    description:
      'Accordion of native <details> panels styled by the Open Government Design System.',
    tier: 'curated',
    tags: ['accordion', 'details', 'disclosure', 'faq', 'expand'],
    ogdsComponentType: 'accordion',
    ogdsElement: 'ogds-accordion',
    ogdsUsage: 'web-component',
    ogdsClass: 'ogds-accordion',
    section: 'content',
    variant,
    requiresJs: 'no',
    interaction: ['click', 'keyboard'],
    a11y: a11y(),
    govCompliance: govCompliance(),
  },
  selection: {
    useWhen: [
      'FAQs, step-by-step instructions, or grouped content that expands in place',
      'Reducing page length without losing content',
    ],
    avoidWhen: [
      'Content users must read to complete a task (hidden content gets missed)',
      'Navigation menus — use ogds-primary-nav',
    ],
  },
  instruction: {
    agentPrompt: `The root div carries class "ogds-accordion${classes ? ` ${classes}` : ''}" and contains plain native <details>/<summary> elements — expand/collapse is the browser's native details behavior, no script needed. Variant classes: bordered, with-icon (chevron), with-icon plus (plus/minus icons), with-icon right (icon on the right). CSS-only usage (frameworks that cannot mount the element): use the same div classes; the chevron/plus icons resolve from the --icon-chevron-pointing-down/up, --icon-plus, --icon-minus custom properties — provide your own url() values when the ogds web components are not loaded.`,
    relatedComponents: ['accordion-toggle', 'task-list'],
  },
  coordination: {
    prerequisiteComponents: [],
    incompatibleWith: [],
    compositionCost: cost(2200),
  },
  constraints: {
    preserve: [
      'ogds-accordion root class',
      'Native <details>/<summary> structure (the styling targets it)',
      'A heading element per panel when using heading semantics',
    ],
    portableInvariants: [
      'details/summary disclosure semantics',
      'summary as the visible trigger',
    ],
    editable: [
      'Panel summaries and content',
      'Number of panels',
      'Variant classes (bordered, with-icon, plus, right)',
      'open attribute per panel (initial state)',
    ],
    limitations: [
      'Do not add role="list"/"listitem" AND heading semantics together — upstream treats use-list-semantics and heading-level as mutually exclusive',
    ],
  },
  portability: {
    classMapping: {
      uswds: {
        base: 'usa-accordion',
        variants: { bordered: 'usa-accordion--bordered' },
      },
    },
  },
  supportedTokenProfiles: [],
});

const variants = [
  { variant: 'default', classes: [] },
  { variant: 'bordered', classes: ['bordered'] },
  { variant: 'with-icon', classes: ['with-icon'] },
  { variant: 'with-icon-plus', classes: ['with-icon plus'] },
  { variant: 'with-icon-right', classes: ['with-icon right'] },
];

export default variants.map(({ variant, classes }) => ({
  component: 'ogds-accordion',
  file: `accordion/${variant}.html`,
  title: `Accordion (${variant})`,
  description: `Open Government Design System accordion (${variant}) built on native details elements.`,
  body: accordionBody(classes),
  meta: {
    ...baseMeta(variant, classes.join(' ')),
    file: `accordion/${variant}.html`,
    title: `Accordion (${variant})`,
    provenance: provenance('ogds-accordion', {
      contractLayer: 'css',
      contractNote:
        'the stylesheet targets details/summary under the .ogds-accordion root (light-DOM adopted styles), so the native structure is load-bearing; expanded content padding uses ::details-content with a .details-content class fallback',
    }),
  },
}));
