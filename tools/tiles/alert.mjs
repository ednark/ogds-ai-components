// ogds-alert tiles — flattened rendered DOM of <ogds-alert>.
import { a11y, provenance, cost, govCompliance } from './_shared.mjs';

const BODY_TEXT =
  'Lorem ipsum dolor sit amet, <a href="#">consectetur adipiscing elit</a>, sed do eiusmod.';

function alertBody(type, { heading = 'Informational Alert', slim = false, noIcon = false } = {}) {
  const classes = [`ogds-alert`, `ogds-alert--${type}`];
  if (noIcon) classes.push('ogds-alert--no-icon');
  if (slim) classes.push('ogds-alert--slim');
  const headingBlock = slim
    ? `<div class="ogds-alert__heading" style="display:none;">
      <img class="ogds-alert__icon" aria-hidden="true">
      <div></div>
    </div>`
    : `<div class="ogds-alert__heading">
      <img class="ogds-alert__icon" aria-hidden="true">
      <div>
        <h3>${heading}</h3>
      </div>
    </div>`;
  const icon = slim ? `<img class="ogds-alert__icon" aria-hidden="true">` : '';
  return `<div class="${classes.join(' ')}">
  <div class="ogds-alert__body">
    ${headingBlock}
    <p class="ogds-alert__text">${icon}${BODY_TEXT}</p>
  </div>
</div>`;
}

const types = {
  info: { heading: 'Informational Alert', title: 'Alert (info)' },
  warning: { heading: 'Warning Alert', title: 'Alert (warning)' },
  success: { heading: 'Success Alert', title: 'Alert (success)' },
  error: { heading: 'Error Alert', title: 'Alert (error)' },
};

const tiles = [];

for (const [type, t] of Object.entries(types)) {
  tiles.push({
    component: 'ogds-alert',
    file: `alert/${type}.html`,
    title: t.title,
    description: `Open Government Design System ${type} alert (ogds-alert).`,
    body: alertBody(type, { heading: t.heading }),
    meta: {
      file: `alert/${type}.html`,
      title: t.title,
      _schemaVersion: 2,
      discovery: {
        description: `${type[0].toUpperCase()}${type.slice(1)} alert with left accent bar and icon, from the Open Government Design System web components.`,
        tier: 'curated',
        tags: ['alert', type, 'feedback', 'message', 'notification'],
        ogdsComponentType: 'alert',
        ogdsElement: 'ogds-alert',
        ogdsUsage: 'web-component',
        ogdsClass: 'ogds-alert',
        section: 'feedback',
        variant: type,
        requiresJs: 'no',
        interaction: ['focus'],
        a11y: a11y(),
        govCompliance: govCompliance(),
      },
      selection: {
        useWhen: [
          'Page-level informational, warning, success, or error messages',
          'Status feedback after a form submission or action',
        ],
        avoidWhen: [
          'Field-level validation errors — use inline error text next to the field',
          'Long-form content — use normal page structure',
        ],
      },
      instruction: {
        agentPrompt:
          'The variant is the modifier class on the root div — ogds-alert--info, ogds-alert--warning, ogds-alert--success, or ogds-alert--error; keep it in sync with the message intent. The heading sits in .ogds-alert__heading (use the heading level that fits the page outline); body content flows in .ogds-alert__text. With no heading, the component auto-applies ogds-alert--slim and renders the icon inline in __text — reproduce both changes together. Note: the upstream element does not validate the type attribute; unknown values render an unstyled modifier.',
        relatedComponents: ['task-list-step', 'primary-nav'],
      },
      coordination: {
        prerequisiteComponents: [],
        incompatibleWith: [],
        compositionCost: cost(1400),
      },
      constraints: {
        preserve: [
          'ogds-alert root class plus the variant modifier (ogds-alert--info, ogds-alert--warning, ogds-alert--success, ogds-alert--error)',
          'img.ogds-alert__icon carries aria-hidden="true" (decorative; the color conveys the type)',
          '__body / __heading / __text structural nesting',
        ],
        portableInvariants: [
          'Block-level alert region with a heading element and message text',
          'Decorative icon hidden from assistive technology',
        ],
        editable: [
          'Heading text and heading level (h1–h6)',
          'Body text, links, and nested markup',
          'Variant via the ogds-alert--{type} modifier class',
        ],
        limitations: [
          'Valid type values are info, warning, success, error — there is no emergency variant upstream',
          'Do not stack many alerts on one page',
        ],
      },
      portability: {
        classMapping: {
          uswds: {
            base: 'usa-alert',
            variants: {
              info: 'usa-alert--info',
              warning: 'usa-alert--warning',
              success: 'usa-alert--success',
              error: 'usa-alert--error',
            },
          },
        },
      },
      supportedTokenProfiles: [],
      file: `alert/${type}.html`,
      title: t.title,
      provenance: provenance('ogds-alert', {
        contractLayer: 'css',
        contractNote:
          'the stylesheet targets .ogds-alert__body/__heading/__text under the root modifier class, so the nesting must be reproduced exactly',
      }),
    },
  });
}

// slim — no heading slot: auto ogds-alert--slim, icon inline in __text
tiles.push({
  component: 'ogds-alert',
  file: 'alert/slim.html',
  title: 'Alert (slim)',
  description: 'Open Government Design System alert without a heading (ogds-alert slim layout).',
  body: alertBody('info', { slim: true }),
  meta: {
    file: 'alert/slim.html',
    title: 'Alert (slim)',
    _schemaVersion: 2,
    discovery: {
      description: 'Compact alert without a heading; the icon renders inline with the text.',
      tier: 'curated',
      tags: ['alert', 'slim', 'compact', 'feedback', 'message'],
      ogdsComponentType: 'alert',
      ogdsElement: 'ogds-alert',
      ogdsUsage: 'web-component',
      ogdsClass: 'ogds-alert',
      section: 'feedback',
      variant: 'slim',
      requiresJs: 'no',
      interaction: ['focus'],
      a11y: a11y(),
      govCompliance: govCompliance(),
    },
    selection: {
      useWhen: ['Short, single-sentence notices that do not need a heading'],
      avoidWhen: ['Multi-paragraph messages — use a headed alert variant'],
    },
    instruction: {
      agentPrompt:
        'Slim is the no-heading layout: the element applies ogds-alert--slim automatically and moves the icon inline into .ogds-alert__text. Do not invent a separate slim class usage with a heading; either include a heading (standard layout) or omit it and pair ogds-alert--slim with the inline icon exactly as shown.',
      relatedComponents: [],
    },
    coordination: {
      prerequisiteComponents: [],
      incompatibleWith: [],
      compositionCost: cost(1100),
    },
    constraints: {
      preserve: [
        'ogds-alert--slim modifier together with the heading block hidden (style="display:none")',
        'Inline img.ogds-alert__icon as the first content of .ogds-alert__text',
      ],
      portableInvariants: ['Block-level alert region with message text'],
      editable: ['Body text and links', 'Variant class'],
      limitations: [
        'The hidden .ogds-alert__heading wrapper is part of the rendered DOM — keep it when flattening the web component; drop it only if you restructure to a purpose-built slim template',
      ],
    },
    portability: {
      classMapping: {
        uswds: { base: 'usa-alert usa-alert--slim', variants: {} },
      },
    },
    supportedTokenProfiles: [],
    file: 'alert/slim.html',
    title: 'Alert (slim)',
    provenance: provenance('ogds-alert', {
      contractLayer: 'css',
      contractNote:
        'the slim layout is CSS-driven off the --slim modifier; the hidden heading wrapper in the rendered DOM is what the slotchange logic produces',
    }),
  },
});

// no-icon — the icon img is still rendered; CSS hides it
tiles.push({
  component: 'ogds-alert',
  file: 'alert/no-icon.html',
  title: 'Alert (no icon)',
  description: 'Open Government Design System alert with the decorative icon suppressed (no-icon).',
  body: alertBody('info', { noIcon: true }),
  meta: {
    file: 'alert/no-icon.html',
    title: 'Alert (no icon)',
    _schemaVersion: 2,
    discovery: {
      description: 'Alert variant that hides the decorative type icon via the ogds-alert--no-icon modifier.',
      tier: 'curated',
      tags: ['alert', 'no-icon', 'feedback', 'message'],
      ogdsComponentType: 'alert',
      ogdsElement: 'ogds-alert',
      ogdsUsage: 'web-component',
      ogdsClass: 'ogds-alert',
      section: 'feedback',
      variant: 'no-icon',
      requiresJs: 'no',
      interaction: ['focus'],
      a11y: a11y(),
      govCompliance: govCompliance(),
    },
    selection: {
      useWhen: ['Alerts whose meaning is fully carried by the heading text'],
      avoidWhen: ['Color-only type signaling — without the icon, keep text explicit'],
    },
    instruction: {
      agentPrompt:
        'The no-icon attribute sets the ogds-alert--no-icon modifier; the icon img is still in the DOM and hidden by CSS (display:none on .ogds-alert__icon). Reproduce the markup exactly as shown — do not delete the img element.',
      relatedComponents: [],
    },
    coordination: {
      prerequisiteComponents: [],
      incompatibleWith: [],
      compositionCost: cost(1300),
    },
    constraints: {
      preserve: [
        'ogds-alert--no-icon modifier',
        'img.ogds-alert__icon present in the DOM (hidden by CSS)',
      ],
      portableInvariants: ['Block-level alert region with a heading element and message text'],
      editable: ['Heading text and level', 'Body text and links', 'Variant class'],
      limitations: ['The icon is hidden, not removed — screen readers never saw it (aria-hidden), so removal is also safe but diverges from the rendered DOM'],
    },
    portability: {
      classMapping: { uswds: { base: 'usa-alert', variants: { info: 'usa-alert--info' } } },
    },
    supportedTokenProfiles: [],
    file: 'alert/no-icon.html',
    title: 'Alert (no icon)',
    provenance: provenance('ogds-alert', {
      contractLayer: 'css',
      contractNote: 'the --no-icon modifier hides .ogds-alert__icon and zeroes the text/heading margin-left',
    }),
  },
});

export default tiles;
