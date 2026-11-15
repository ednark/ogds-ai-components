// ogds-banner tiles — flattened rendered DOM of <ogds-banner>.
import { a11y, provenance, cost, govCompliance, assetDataUri } from './_shared.mjs';

const FLAG = assetDataUri('@uswds/uswds/dist/img/us_flag_small.png');

const EN = {
  label: 'Official website of the United States government',
  text: 'An official website of the United States government',
  action: 'Here’s how you know',
  domainHeading: (tld) => `Official websites use .${tld}`,
  domainText: (tld) =>
    `A <strong>.${tld}</strong> website belongs to an official government organization in the United States.`,
  httpsHeading: (tld) => `Secure .${tld} websites use HTTPS`,
  httpsText: (tld) =>
    `A <strong>lock</strong> <span class="icon-lock" role="img" aria-label="Locked padlock icon"></span> or <strong>https://</strong> means you’ve safely connected to the .${tld} website. Share sensitive information only on official, secure websites.`,
};

const ES = {
  label: 'Un sitio oficial del gobierno de Estados Unidos',
  text: 'Un sitio oficial del gobierno de Estados Unidos',
  action: 'Así es como usted puede verificarlo',
  domainHeading: (tld) => `Los sitios web oficiales usan .${tld}`,
  domainText: (tld) =>
    `Un sitio web <strong>.${tld}</strong> pertenece a una organización oficial del gobierno de Estados Unidos.`,
  httpsHeading: (tld) => `Los sitios web seguros .${tld} usan HTTPS`,
  httpsText: (tld) =>
    `Un <strong>candado</strong> <span class="icon-lock" role="img" aria-label="Locked padlock icon"></span> o <strong>https://</strong> significa que usted se conectó de forma segura a un sitio web .${tld}. Comparta información sensible solo en sitios web oficiales y seguros.`,
};

const SCRIPT = `(function () {
  var btn = document.querySelector('.ogds-banner .usa-accordion__button');
  var content = document.querySelector('.ogds-banner .content');
  btn.addEventListener('click', function () {
    var open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    content.toggleAttribute('hidden', open);
  });
})();`;

function bannerBody({ lang, tld, expanded }) {
  const t = lang === 'es' ? ES : EN;
  const open = expanded ? 'true' : 'false';
  return `<section class="ogds-banner" aria-label="${t.label}"${lang === 'es' ? ' lang="es"' : ''}>
  <div class="usa-accordion">
    <header${expanded ? ' class="expanded"' : ''}>
      <div class="inner">
        <div class="grid-col-auto">
          <img aria-hidden="true" class="header-flag" src="${FLAG}" alt="">
        </div>
        <div class="grid-col-fill tablet:grid-col-auto" aria-hidden="true">
          <p class="header-text">${t.text}</p>
          <p class="header-action">${t.action}</p>
        </div>
        <button type="button" class="usa-accordion__button" aria-expanded="${open}" aria-controls="gov-banner-default">
          <span class="button-text">${t.action}</span>
        </button>
      </div>
    </header>
    <div class="content usa-accordion__content" id="gov-banner-default"${expanded ? '' : ' hidden'}>
      <div class="grid-row grid-gap-lg">
        <div class="guidance tablet:grid-col-6">
          <div class="icon-gov">
            <p>
              <strong>${t.domainHeading(tld)}</strong>
              <br>
              ${t.domainText(tld)}
            </p>
          </div>
        </div>
        <div class="guidance tablet:grid-col-6">
          <div class="icon-https">
            <p>
              <strong>${t.httpsHeading(tld)}</strong><br>
              ${t.httpsText(tld)}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

const baseMeta = (variant, { lang = 'en', expanded = false } = {}) => ({
  file: `banner/${variant}.html`,
  title: `Banner (${variant})`,
  _schemaVersion: 2,
  discovery: {
    description:
      'Official-government-website identification banner with expandable .gov/.mil and HTTPS guidance.',
    tier: 'curated',
    tags: ['banner', 'official website', 'gov', 'mil', 'https', 'identification'],
    ogdsComponentType: 'banner',
    ogdsElement: 'ogds-banner',
    ogdsUsage: 'web-component',
    ogdsClass: 'ogds-banner',
    section: 'navigation',
    variant,
    requiresJs: 'optional',
    interaction: ['click', 'keyboard'],
    a11y: a11y({ forcedColors: true }),
    govCompliance: govCompliance(),
  },
  selection: {
    useWhen: [
      'Top-of-page official-website identification, as required on .gov/.mil sites',
    ],
    avoidWhen: [
      'Page-level messages — use ogds-alert',
      'Site navigation — use ogds-header / ogds-primary-nav',
    ],
  },
  instruction: {
    agentPrompt: `Collapses to a one-line identification strip; the .usa-accordion__button toggles the hidden attribute on .content and its own aria-expanded (the inline script in this tile replicates the upstream toggle()). Language and domain are content strings, not classes: translate the banner/domain/https strings and swap .gov/.mil as a unit. The lock icon span (role="img", aria-label="Locked padlock icon") must stay in the HTTPS guidance. When wiring the real <ogds-banner> element, omit the inline script (single-handling rule).`,
    relatedComponents: ['header', 'alert'],
  },
  coordination: {
    prerequisiteComponents: [],
    incompatibleWith: [],
    compositionCost: cost(3400, { tier: 'moderate', ms: 15 }),
  },
  constraints: {
    preserve: [
      'section with the official-website aria-label',
      'aria-expanded/aria-controls relationship between button and .content',
      'The lock icon span with role="img" and its aria-label',
      'hidden attribute on .content in the collapsed state',
    ],
    portableInvariants: [
      'Official-website identification statement at the top of the page',
      'Expandable HTTPS/domain guidance pair',
    ],
    editable: [
      'Translation strings (banner, domain, https sections)',
      'The .gov/.mil domain in guidance text',
      'Flag image source',
    ],
    limitations: [
      'The US flag and lock icon are protected identity/government assets — restyle the container, never the assets',
      'Upstream bundles its own grid + accordion styles in the banner shadow DOM; the tile carries the same rules inline',
      'Markup correction, documented: the upstream render template omits the id on .content while the button declares aria-controls="gov-banner-default" — the tile adds the id so the aria relationship resolves; the upstream template keeps the dangling reference',
    ],
  },
  portability: {
    classMapping: {
      uswds: { base: 'usa-banner', variants: {} },
    },
  },
  supportedTokenProfiles: ['highContrast'],
});

const variants = [
  { variant: 'default', opts: {} },
  { variant: 'expanded', opts: { expanded: true } },
  { variant: 'mil', opts: { tld: 'mil' } },
  { variant: 'espanol', opts: { lang: 'es' } },
];

export default variants.map(({ variant, opts }) => {
  const t = opts.lang === 'es' ? ES : EN;
  return {
    component: 'ogds-banner',
    file: `banner/${variant}.html`,
    title: `Banner (${variant})`,
    description: `Open Government Design System official-website banner (${variant}).`,
    body: bannerBody({ lang: 'en', tld: 'gov', ...opts }),
    script: SCRIPT,
    meta: {
      ...baseMeta(variant, opts),
      file: `banner/${variant}.html`,
      title: `Banner (${variant})`,
      instruction: {
        ...baseMeta(variant, opts).instruction,
        behavior: {
          requires: 'optional',
          source: 'inline',
          init: 'auto — the inline script binds a click handler on .usa-accordion__button that toggles hidden on .content and aria-expanded on the button',
          fallback: 'collapsed static banner; the domain/HTTPS guidance stays hidden without JS',
        },
      },
      provenance: provenance('ogds-banner', {
        contractLayer: 'both',
        contractNote:
          'the stylesheet styles .usa-accordion__button/.content and the toggle() method owns the hidden/aria-expanded state; EN and ES string tables live in index.ts',
        source:
          'https://github.com/open-government-design-system/ogds-elements — src/components/ogds-banner/ (render template, CSS, EN/ES translation tables) at v1.0.0-beta.2',
      }),
      discovery: {
        ...baseMeta(variant, opts).discovery,
        description:
          variant === 'espanol'
            ? 'Official-government-website identification banner in Spanish, with expandable .gov and HTTPS guidance.'
            : baseMeta(variant, opts).discovery.description,
      },
    },
  };
});
