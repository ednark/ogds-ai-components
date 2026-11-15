// ogds-accordion-toggle tiles — flattened rendered DOM of
// <ogds-accordion-toggle>, embedded with the accordion it controls.
import { a11y, provenance, cost, govCompliance } from './_shared.mjs';

const ACCORDION_ID = 'accordion-toggle-demo';

const ACCORDION = `<div class="ogds-accordion" id="${ACCORDION_ID}">
  <details>
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
  </details>
</div>`;

const SCRIPT = `(function () {
  var toggle = document.querySelector('.ogds-accordion-toggle button');
  var accordion = document.getElementById('${ACCORDION_ID}');
  function anyOpen() {
    return !!accordion.querySelector('details[open]');
  }
  function render() {
    var open = anyOpen();
    toggle.querySelector('[data-label="expand"]').hidden = open;
    toggle.querySelector('[data-label="collapse"]').hidden = !open;
  }
  toggle.addEventListener('click', function () {
    var open = anyOpen();
    accordion.querySelectorAll('details').forEach(function (d) {
      d.toggleAttribute('open', !open);
    });
    render();
  });
  new MutationObserver(render).observe(accordion, {
    subtree: true,
    attributes: true,
    attributeFilter: ['open'],
  });
  render();
})();`;

function toggleBody(expandLabel, collapseLabel) {
  return `${ACCORDION}
<div class="ogds-accordion-toggle">
  <button type="button" part="button">
    <span data-label="expand">${expandLabel}</span>
    <span data-label="collapse" hidden>${collapseLabel}</span>
  </button>
</div>`;
}

const baseMeta = (variant, expand, collapse) => ({
  file: `accordion-toggle/${variant}.html`,
  title: `Accordion Toggle (${variant})`,
  _schemaVersion: 2,
  discovery: {
    description:
      'Expand/collapse-all button for an ogds-accordion, with labels that flip based on panel state.',
    tier: 'curated',
    tags: ['accordion', 'toggle', 'button', 'expand-all', 'collapse-all'],
    ogdsComponentType: 'accordion-toggle',
    ogdsElement: 'ogds-accordion-toggle',
    ogdsUsage: 'web-component',
    ogdsClass: 'ogds-accordion-toggle',
    section: 'content',
    variant,
    requiresJs: 'required',
    interaction: ['click', 'keyboard'],
    a11y: a11y(),
    govCompliance: govCompliance(),
  },
  selection: {
    useWhen: ['Giving users one control to open or close every panel of an accordion'],
    avoidWhen: ['A single panel — use the native details toggle'],
  },
  instruction: {
    agentPrompt: `The toggle button shows the expand label while every panel is closed and the collapse label once any panel is open; the hidden attribute flips between the two label spans. Wire it to the accordion with the controls relationship (upstream attribute: controls="<accordion-id>"). The inline script replicates the upstream behavior: click toggles all details elements, a MutationObserver keeps the label in sync when panels are toggled individually. When wiring the real <ogds-accordion-toggle> web component, omit this inline script (single-handling rule).`,
    relatedComponents: ['accordion'],
  },
  coordination: {
    prerequisiteComponents: [
      {
        name: 'accordion',
        reason: `The toggle controls an ogds-accordion — this tile embeds one with id="${ACCORDION_ID}"`,
      },
    ],
    incompatibleWith: [],
    compositionCost: cost(2400, { tier: 'moderate', ms: 20 }),
    agentPromptSequence: [
      '1. Place the ogds-accordion with a stable id first',
      `2. Place the toggle after it, pointing controls at "${ACCORDION_ID}"`,
      '3. Keep the label flip in sync with panel state (script or MutationObserver)',
    ],
  },
  constraints: {
    preserve: [
      'The controls relationship between toggle and accordion (upstream: controls attribute = accordion id)',
      'Exactly one visible label at a time (expand vs collapse)',
      'type="button" on the toggle button',
    ],
    portableInvariants: [
      'Button semantics with type="button"',
      'Label reflects the action the click will perform',
    ],
    editable: ['Label strings', 'Controlled accordion content'],
    limitations: [
      'Upstream counts panels only via MutationObserver on the open attribute; dynamic step changes outside the accordion are not observed',
      'Flattening artifact: the upstream shadow-DOM slots (expand-label/collapse-label) are realized as data-label spans so the static tile can flip them',
    ],
  },
  portability: { classMapping: {} },
  supportedTokenProfiles: [],
});

const variants = [
  { variant: 'default', expand: 'Expand All', collapse: 'Collapse All' },
  { variant: 'custom-labels', expand: 'Show All', collapse: 'Hide All' },
];

export default variants.map(({ variant, expand, collapse }) => ({
  components: ['ogds-accordion', 'ogds-accordion-toggle'],
  file: `accordion-toggle/${variant}.html`,
  title: `Accordion Toggle (${variant})`,
  description: `Open Government Design System accordion expand/collapse-all toggle (${variant}).`,
  body: toggleBody(expand, collapse),
  script: SCRIPT,
  meta: {
    ...baseMeta(variant, expand, collapse),
    instruction: {
      ...baseMeta(variant, expand, collapse).instruction,
      behavior: {
        requires: 'required',
        source: 'inline',
        init: 'auto — the inline script at the end of the body binds the click handler and a MutationObserver on panel open state',
        fallback:
          "Without JS the button renders the expand label and panels remain individually collapsible via native <details>",
      },
    },
    provenance: provenance('ogds-accordion-toggle', {
      contractLayer: 'both',
      contractNote:
        'the stylesheet styles ogds-accordion-toggle::part(button) (flattened to .ogds-accordion-toggle button) and the label flip is driven by the open-attribute MutationObserver in index.ts',
    }),
  },
}));
