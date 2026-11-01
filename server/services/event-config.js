import { domainRules, plannedCategories } from './domains.js';

const DEFAULT_INSTRUCTIONS = 'Stay in fullscreen. Do not switch tabs.';
const asObject = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : null;
const asStrings = (value) =>
  Array.isArray(value)
    ? value.map((v) => String(v ?? '').trim()).filter(Boolean)
    : [];
const asPositiveInt = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

function duplicateOf(list) {
  return list.find((value, index) => list.indexOf(value) !== index) || null;
}

function dateValue(value) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function questionRange(event) {
  const counts = asObject(event?.question_counts) || {};
  const rules = domainRules(event);
  if (rules.mode !== 'select') {
    const total = Object.values(counts).reduce((sum, value) => sum + Number(value || 0), 0);
    return { min: total, max: total, common: total, variable: false };
  }
  const common = rules.common.reduce((sum, code) => sum + Number(counts[code] || 0), 0);
  const sorted = rules.allowed
    .map((code) => Number(counts[code] || 0))
    .sort((a, b) => a - b);
  const low = sorted.slice(0, rules.min).reduce((sum, value) => sum + value, 0);
  const high = sorted.slice(-rules.max).reduce((sum, value) => sum + value, 0);
  return { min: common + low, max: common + high, common, variable: true };
}

export function derivedDuration(sectionLimits, domainMode, rules) {
  const limits = asObject(sectionLimits) || {};
  const minutes = (code) => asPositiveInt(limits[code]) || 0;
  if (domainMode !== 'select') {
    const total = Object.values(limits).reduce((sum, value) => sum + (asPositiveInt(value) || 0), 0);
    return total || null;
  }
  const common = asStrings(rules?.common).reduce((sum, code) => sum + minutes(code), 0);
  const allowed = asStrings(rules?.allowed)
    .map(minutes)
    .sort((a, b) => b - a)
    .slice(0, asPositiveInt(rules?.max) || 1);
  return common + allowed.reduce((sum, value) => sum + value, 0);
}

// The shortest and longest paper of an event. The event window is independent;
// these are the paper deadlines, which always use the full section limits.
export function paperMinuteRange(event) {
  const limits = asObject(event?.section_limits) || {};
  const rules = domainRules(event);
  const minutes = (code) => asPositiveInt(limits[code]) || 0;
  const stored = asPositiveInt(event?.duration_min) || 0;

  if (rules.mode !== 'select') {
    const total = Object.values(limits).reduce(
      (sum, value) => sum + (asPositiveInt(value) || 0),
      0,
    ) || stored;
    return { min: total, max: total };
  }

  const common = rules.common.reduce((sum, code) => sum + minutes(code), 0);
  const allowed = rules.allowed.map(minutes).sort((a, b) => a - b);
  const low = allowed.slice(0, rules.min).reduce((sum, value) => sum + value, 0);
  const high = allowed.slice(-rules.max).reduce((sum, value) => sum + value, 0);
  return { min: common + low, max: common + high };
}

// The duration of one paper. A fixed event is the same for everyone; a
// domain-aware event is the common sections plus the sections the student
// actually chose. Legacy events without section limits keep their stored
// duration.
export function paperDuration(event, selection = []) {
  const limits = asObject(event?.section_limits) || {};
  const categories = plannedCategories(event, selection);
  const total = categories.reduce(
    (sum, code) => sum + (asPositiveInt(limits[code]) || 0),
    0,
  );
  return total || asPositiveInt(event?.duration_min) || 0;
}

export function normalizeEventInput(body = {}, base = {}) {
  const fields = {};
  const source = asObject(body) || {};
  const current = asObject(base) || {};

  const name = String(source.name ?? current.name ?? '').trim();
  if (!name) fields.name = 'Name is required.';

  const startsAt = dateValue(source.starts_at ?? current.starts_at);
  if (!startsAt) fields.starts_at = 'Start date and time are required.';

  const instructions = String(
    source.instructions ?? current.instructions ?? DEFAULT_INSTRUCTIONS,
  ).trim();
  if (!instructions) fields.instructions = 'Instructions are required.';
  if (instructions.length > 8000) fields.instructions = 'Instructions are too long.';

  const configInput = source.config !== undefined ? source.config : current.question_counts;
  const config = asObject(configInput);
  if (!config || !Object.keys(config).length) {
    fields.config = 'Add at least one category.';
  }

  const cleanConfig = {};
  if (config) {
    for (const [rawCategory, rawCount] of Object.entries(config)) {
      const category = String(rawCategory || '').trim();
      const count = asPositiveInt(rawCount);
      if (!category) {
        fields.config = 'Category names cannot be blank.';
        break;
      }
      if (!count) {
        fields.config = `Question count for ${category} must be at least 1.`;
        break;
      }
      cleanConfig[category] = count;
    }
  }

  const modeInput = source.domain_mode ?? current.domain_mode ?? 'fixed';
  const domainMode = modeInput === 'select' ? 'select' : 'fixed';

  const rulesInput =
    source.domain_rules !== undefined
      ? asObject(source.domain_rules) || {}
      : asObject(current.domain_rules) || {};
  const common = [...new Set(asStrings(rulesInput.common))];
  const allowed = [...new Set(asStrings(rulesInput.allowed))];

  let min = 1;
  let max = 1;
  let domainRulesValue = {};

  if (domainMode === 'select') {
    if (duplicateOf(asStrings(rulesInput.common))) {
      fields.domain_rules = 'A common category is listed twice.';
    } else if (duplicateOf(asStrings(rulesInput.allowed))) {
      fields.domain_rules = 'A selectable domain is listed twice.';
    }
    const overlap = common.find((code) => allowed.includes(code));
    if (overlap) fields.domain_rules = `${overlap} cannot be both common and selectable.`;
    if (!allowed.length) fields.domain_rules = 'Choose at least one selectable domain.';

    min = asPositiveInt(rulesInput.min ?? 1);
    max = asPositiveInt(rulesInput.max ?? allowed.length ?? 1);
    if (!min) fields.domain_rules = 'The minimum number of domains must be a whole number above 0.';
    if (!max) fields.domain_rules = 'The maximum number of domains must be a whole number above 0.';
    if (min && max && min > max) {
      fields.domain_rules = 'The maximum number of domains must not be smaller than the minimum.';
    }
    if (min && max && max > allowed.length) {
      fields.domain_rules = 'The maximum cannot be larger than the number of selectable domains.';
    }

    const assigned = [...new Set([...common, ...allowed])];
    const unassigned = Object.keys(cleanConfig).filter((code) => !assigned.includes(code));
    if (unassigned.length) {
      fields.domain_rules = `${unassigned.join(', ')} must be either common or selectable.`;
    }
    for (const code of assigned) {
      if (!(Number(cleanConfig[code] || 0) > 0)) {
        fields.domain_rules = `Set a question count for ${code} - it is part of the domain selection.`;
        break;
      }
    }
    domainRulesValue = { common, allowed, min: min || 1, max: max || 1 };
  }

  const sectionInput =
    source.section_limits !== undefined
      ? source.section_limits
      : source.module_minutes !== undefined
        ? source.module_minutes
        : current.section_limits !== undefined
          ? current.section_limits
          : current.module_minutes;
  const sectionObject = asObject(sectionInput) || {};
  const sectionLimits = {};
  const configuredCategories =
    domainMode === 'select'
      ? [...new Set([...common, ...allowed])]
      : Object.keys(cleanConfig);

  if (!Object.keys(sectionObject).length) {
    fields.section_limits = 'Add a time limit for every section.';
  } else {
    for (const category of configuredCategories) {
      const minutes = asPositiveInt(sectionObject[category]);
      if (!minutes) {
        fields.section_limits = `Set a time limit for ${category}.`;
        break;
      }
      sectionLimits[category] = minutes;
    }
    const unknown = Object.keys(sectionObject).filter(
      (category) => !configuredCategories.includes(category),
    );
    if (unknown.length) fields.section_limits = `Unknown section: ${unknown.join(', ')}.`;
  }

  // duration_min is the event window, not the paper deadline. An explicit value
  // wins; when it is omitted, it is derived from the section limits (the total a
  // paper can run).
  const explicitDuration = asPositiveInt(source.duration_min ?? current.duration_min);
  const derived = Object.keys(sectionLimits).length
    ? derivedDuration(sectionLimits, domainMode, { common, allowed, min, max })
    : null;
  const durationMin = explicitDuration || derived;
  if (!durationMin) {
    fields.duration_min = 'The event window must be at least 1 minute.';
  }

  const visibilityInput = String(
    source.results_visibility ?? current.results_visibility ?? 'manual',
  );
  const resultsVisibility = ['immediate', 'after_all_submitted', 'manual', 'never'].includes(
    visibilityInput,
  )
    ? visibilityInput
    : null;
  if (!resultsVisibility) fields.results_visibility = 'Choose a valid results visibility.';

  return {
    ok: Object.keys(fields).length === 0,
    fields,
    value: {
      name,
      starts_at: startsAt,
      duration_min: durationMin,
      categories:
        domainMode === 'select'
          ? [...new Set([...common, ...allowed])]
          : Object.keys(cleanConfig),
      question_counts: cleanConfig,
      domain_mode: domainMode,
      domain_rules: domainRulesValue,
      section_limits: sectionLimits,
      results_visibility: resultsVisibility || 'manual',
      instructions,
    },
  };
}

export function unknownCategories(value, known) {
  const all = [
    ...Object.keys(value.question_counts || {}),
    ...asStrings(value.domain_rules?.common),
    ...asStrings(value.domain_rules?.allowed),
    ...Object.keys(value.section_limits || {}),
  ];
  return [...new Set(all)].filter((code) => !known.has(code));
}
