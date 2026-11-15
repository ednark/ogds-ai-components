// ogds-task-list + ogds-task-list-step tiles — flattened rendered DOM.
import { a11y, provenance, cost, govCompliance } from './_shared.mjs';

// Flattening rules applied here (see _shared.mjs FLATTENING_NOTE):
// - <ogds-task-list-step> renders as the .ogds-task-list-step element itself
//   (li inside the list; div when standalone) with its shadow content inlined.
// - Per-instance ids (badge, blocked-message) are uniquified with a suffix;
//   aria-describedby follows.
// - The counter is the computed state at mount: N completed of M steps.

function stepCompleted({ id, url, title, savedData = '' }) {
  return `<li class="ogds-task-list-step" role="listitem" status="completed">
  <a class="title" href="${url}" aria-describedby="badge-${id}">
    ${title}<span class="arrow" aria-hidden="true"></span>
  </a>
  <span class="ogds-tag badge" id="badge-${id}"><span class="badge-icon" aria-hidden="true"></span>Completed</span>
  ${savedData}
</li>`;
}

function stepInProgress({ id, url, title, description = '' }) {
  return `<li class="ogds-task-list-step" role="listitem" status="in-progress">
  <a class="title" href="${url}" aria-describedby="badge-${id}">
    ${title}<span class="arrow" aria-hidden="true"></span>
  </a>
  <span class="ogds-tag badge" id="badge-${id}">In progress</span>
  ${description}
</li>`;
}

function stepNotStarted({ id, url, title }) {
  return `<li class="ogds-task-list-step" role="listitem" status="not-started">
  <a class="title" href="${url}" aria-describedby="badge-${id}">
    ${title}<span class="arrow" aria-hidden="true"></span>
  </a>
  <span class="ogds-tag badge" id="badge-${id}">Not started</span>
</li>`;
}

function stepBlocked({ id, title, blockedMessage }) {
  return `<li class="ogds-task-list-step" role="listitem" status="cannot-start-yet">
  <span class="title" aria-describedby="blocked-message-${id}">${title}</span>
  <span class="ogds-tag badge" id="badge-${id}">Cannot start yet</span>
  <p class="blocked-message" id="blocked-message-${id}">${blockedMessage}</p>
</li>`;
}

const DEFAULT_STEPS = [
  stepCompleted({
    id: 1,
    url: '/step-1',
    title: 'Edit your profile',
    savedData: `<dl>
    <dt>Phone number</dt>
    <dd>(410) 123-4567</dd>
    <dt>Email address</dt>
    <dd>example@example.com</dd>
  </dl>`,
  }),
  stepInProgress({ id: 2, url: '/step-2', title: 'Edit your address' }),
  stepNotStarted({ id: 3, url: '/step-3', title: 'Submit additional supporting documents' }),
  stepBlocked({ id: 4, title: 'Sign contractual agreement', blockedMessage: 'Not available until previous tasks are complete.' }),
].join('\n');

function taskListBody(steps, counter) {
  return `<div class="ogds-task-list">
  <section aria-labelledby="counter">
    <div class="header">
      <h2 class="counter" id="counter">${counter}</h2>
      Finish all tasks to submit your application.
    </div>
    <ul class="steps" role="list">
      ${steps}
    </ul>
  </section>
</div>`;
}

const taskListTile = {
  components: ['ogds-task-list', 'ogds-task-list-step'],
  file: 'task-list/default.html',
  title: 'Task List (default)',
  description:
    'Open Government Design System task progress list with completion counter and four step states.',
  body: taskListBody(DEFAULT_STEPS, '1 <span>of</span> 4 <span>tasks completed</span>'),
  meta: {
    file: 'task-list/default.html',
    title: 'Task List (default)',
    _schemaVersion: 2,
    discovery: {
      description:
        'Task progress list: "N of M tasks completed" counter heading plus steps with status badges (not started, in progress, completed, cannot start yet).',
      tier: 'curated',
      tags: ['task list', 'progress', 'steps', 'workflow', 'counter', 'multi-page form'],
      ogdsComponentType: 'task-list',
      ogdsElement: 'ogds-task-list',
      ogdsUsage: 'web-component',
      ogdsClass: 'ogds-task-list',
      section: 'content',
      variant: 'default',
      requiresJs: 'no',
      interaction: ['focus', 'click', 'keyboard'],
      a11y: a11y(),
      govCompliance: govCompliance(),
    },
    selection: {
      useWhen: [
        'Complex or multi-session workflows with 3–6 tasks across pages',
        'Non-sequential task lists where the user chooses what to complete next',
      ],
      avoidWhen: [
        'Single-page forms or strictly linear flows (numbered steps in order are clearer)',
        'Long task lists — the counter and list grow unwieldy past ~6 tasks',
      ],
      guidance: [
        { guidance: false, description: 'Do not treat the badge as a USWDS tag pill — upstream notes the tag pill fails contrast expectations here' },
        { guidance: true, description: 'Show completed tasks\' submitted data (saved-data dl) so users trust their progress' },
      ],
    },
    tradeoffs: {
      sacrifices: [
        {
          capability: 'live counter updates',
          because: 'the upstream component counts step statuses once on slotchange (no MutationObserver) — dynamic status changes after mount are not reflected',
        },
      ],
      note: 'ogds-task-list source comment, ogds-task-list.ts (_onSlotChange)',
    },
    instruction: {
      agentPrompt: `The counter heading (level set by base-heading-level, default h2) reads "N of M tasks completed" — compute N by counting steps with status="completed" at render time; the separator and label are replaceable inline content. Steps are ogds-task-list-step children: status ∈ {not-started, in-progress, completed, cannot-start-yet}; completed steps may carry a saved-data <dl>. Blocked steps (cannot-start-yet) render a non-link title with aria-describedby pointing at the blocked message. The counter is static once rendered — recompute it server-side or on slot change in your app.`,
      relatedComponents: ['task-list-step', 'alert', 'accordion'],
    },
    coordination: {
      prerequisiteComponents: [
        {
          name: 'task-list-step',
          reason: 'The list renders ogds-task-list-step children (embedded flattened in this tile)',
        },
      ],
      incompatibleWith: [],
      compositionCost: cost(3600, { tier: 'moderate', ms: 15 }),
    },
    constraints: {
      preserve: [
        'section[aria-labelledby="counter"] + .counter heading structure',
        'ul.steps[role="list"] with step children',
        'The computed "N of M" counter reflects the rendered steps',
      ],
      portableInvariants: [
        'Progress statement ("N of M completed") visible before the task list',
        'Per-task status communicated by text label, not color alone',
        'Blocked tasks are non-interactive with an explanatory message',
      ],
      editable: [
        'Task titles, urls, descriptions',
        'Counter separator/label strings',
        'Instruction text',
        'Step count (keep 3–6)',
      ],
      limitations: [
        'Do not use for single-page forms or linear step sequences',
        'The dt/dd styling inside saved-data dl is left to the application CSS upstream — provide your own',
      ],
    },
    portability: {
      classMapping: {
        uswds: { base: 'usa-process-list', variants: {} },
      },
    },
    supportedTokenProfiles: [],
    file: 'task-list/default.html',
    title: 'Task List (default)',
    provenance: provenance('ogds-task-list', {
      contractLayer: 'css',
      contractNote:
        'the stylesheet targets .header/.counter/.steps under the root; the counter text is computed state at mount (slotchange), so the flattened tile bakes in "1 of 4"',
    }),
  },
};

// --- standalone step tiles (bare .ogds-task-list-step, no list parent) ---

const stepDefault = {
  component: 'ogds-task-list-step',
  file: 'task-list-step/default.html',
  title: 'Task List Step (default)',
  description:
    'Open Government Design System task list step (in progress) with status badge.',
  body: `<div class="ogds-task-list-step" status="in-progress">
  <a class="title" href="/some-task" aria-describedby="badge">
    Tell us about your employer<span class="arrow" aria-hidden="true"></span>
  </a>
  <span class="ogds-tag badge" id="badge">In progress</span>
  <p>We need a few details to verify your business registration.</p>
</div>`,
  meta: stepMeta('default', 'in-progress', {}),
};

function stepMeta(variant, status, extra) {
  const statusLabels = {
    'not-started': 'Not started',
    'in-progress': 'In progress',
    completed: 'Completed',
    'cannot-start-yet': 'Cannot start yet',
  };
  const descriptions = {
    default:
      'A single task-list step: title link, status badge, optional description — embed inside an ogds-task-list.',
    'with-alert':
      'Task-list step with an embedded warning alert between the badge and the description.',
    'with-saved-data':
      'Completed task-list step showing the user\'s submitted data as a definition list.',
    blocked:
      'Non-interactive task-list step (cannot-start-yet) with a blocked message instead of a link.',
  };
  const useWhen = {
    default: ['One task inside an ogds-task-list'],
    'with-alert': ['A task that needs an inline warning or callout attached to it'],
    'with-saved-data': ['Completed tasks where showing submitted data builds trust'],
    blocked: ['Tasks gated behind a prerequisite the user must finish first'],
  };
  return {
    file: `task-list-step/${variant}.html`,
    title: `Task List Step (${variant})`,
    _schemaVersion: 2,
    discovery: {
      description: descriptions[variant],
      tier: 'curated',
      tags: ['task list', 'step', status, 'badge', 'workflow'],
      ogdsComponentType: 'task-list-step',
      ogdsElement: 'ogds-task-list-step',
      ogdsUsage: 'web-component',
      ogdsClass: 'ogds-task-list-step',
      section: 'content',
      variant,
      requiresJs: 'no',
      interaction: ['focus', 'click', 'keyboard'],
      a11y: a11y(),
      govCompliance: govCompliance(),
    },
    selection: {
      useWhen: useWhen[variant],
      avoidWhen: ['Standalone — steps belong inside an ogds-task-list (upstream docs)'],
    },
    instruction: {
      agentPrompt: `The root element's status attribute (not-started | in-progress | completed | cannot-start-yet) drives the badge colors (the stylesheet keys .ogds-tag.badge off [status="…"]); the badge label defaults per status ("Completed", "In progress", "Not started", "Cannot start yet") and is overridable via the status-label slot. Only completed steps show the check-circle badge icon. Non-blocked steps render the title as a link (href = url) with an aria-hidden arrow; blocked steps render a non-link span with aria-describedby → the blocked message. Embed steps inside an ogds-task-list (role="listitem" comes from the list context); this standalone tile omits the role.`,
      relatedComponents: ['task-list', 'alert'],
    },
    coordination: {
      prerequisiteComponents: [
        { name: 'task-list', reason: 'Steps are authored as children of an ogds-task-list' },
      ],
      incompatibleWith: [],
      compositionCost: cost(1300),
    },
    constraints: {
      preserve: [
        'The .title / .badge (.ogds-tag) structure',
        'Blocked steps: non-link title with aria-describedby → blocked-message',
        'Completed steps: check-circle badge icon (aria-hidden)',
      ],
      portableInvariants: [
        'Task title as a link when actionable, plain text when blocked',
        'Status conveyed by a text label, not color alone',
      ],
      editable: [
        'Title text and url',
        'Badge label (status-label override)',
        'Description, saved-data dl content',
        'Blocked message text',
      ],
      limitations: [
        'This standalone tile omits role="listitem" (the component sets it when absent) because there is no parent list — inside an ogds-task-list the role applies',
        'The dl styling inside saved-data is left to application CSS upstream',
      ],
    },
    portability: { classMapping: {} },
    supportedTokenProfiles: [],
    file: `task-list-step/${variant}.html`,
    title: `Task List Step (${variant})`,
    provenance: provenance('ogds-task-list-step', {
      contractLayer: 'css',
      contractNote:
        'the stylesheet targets :host (.ogds-task-list-step), .title, .ogds-tag.badge and status modifier classes; the blocked branch renders structurally different DOM (span title + blocked message)',
      ...extra.provenance,
    }),
    ...extra.meta,
  };
}

const stepTiles = [stepDefault, {
    component: 'ogds-task-list-step',
    file: 'task-list-step/with-alert.html',
    title: 'Task List Step (with alert)',
    description:
      'Task-list step with an embedded warning alert from the ogds-alert component.',
    body: `<div class="ogds-task-list-step" status="in-progress">
  <a class="title" href="/some-task" aria-describedby="badge">
    Tell us about your employer<span class="arrow" aria-hidden="true"></span>
  </a>
  <span class="ogds-tag badge" id="badge">In progress</span>
  <div class="ogds-alert ogds-alert--warning">
    <div class="ogds-alert__body">
      <div class="ogds-alert__heading" style="display:none;">
        <img class="ogds-alert__icon" aria-hidden="true">
        <div></div>
      </div>
      <p class="ogds-alert__text"><img class="ogds-alert__icon" aria-hidden="true">We need more information before this task can be completed.</p>
    </div>
  </div>
</div>`,
    components: ['ogds-task-list-step', 'ogds-alert'],
    meta: stepMeta('with-alert', 'in-progress', {}),
  },
  {
    component: 'ogds-task-list-step',
    file: 'task-list-step/with-saved-data.html',
    title: 'Task List Step (with saved data)',
    description:
      'Completed task-list step showing submitted data as a definition list.',
    body: `<div class="ogds-task-list-step" status="completed">
  <a class="title" href="/step-1" aria-describedby="badge">
    Edit your profile<span class="arrow" aria-hidden="true"></span>
  </a>
  <span class="ogds-tag badge" id="badge"><span class="badge-icon" aria-hidden="true"></span>Completed</span>
  <dl>
    <dt>Phone number</dt>
    <dd>(410) 123-4567</dd>
  </dl>
</div>`,
    meta: stepMeta('with-saved-data', 'completed', {}),
  },
  {
    component: 'ogds-task-list-step',
    file: 'task-list-step/blocked.html',
    title: 'Task List Step (blocked)',
    description:
      'Non-interactive task-list step (cannot-start-yet) with the default blocked message.',
    body: `<div class="ogds-task-list-step" status="cannot-start-yet">
  <span class="title" aria-describedby="blocked-message">Submit your Maryland Resident Agent details</span>
  <span class="ogds-tag badge" id="badge">Cannot start yet</span>
  <p class="blocked-message" id="blocked-message">Not available until previous tasks are complete.</p>
</div>`,
    meta: stepMeta('blocked', 'cannot-start-yet', {}),
  },
];

export default [taskListTile, ...stepTiles];
