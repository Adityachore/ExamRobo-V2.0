// Domain selection (R-015).
//
// A domain-aware event lets the student choose the technical domain(s) the
// exam asks about, before the timer starts. The aptitude part is common to
// everyone and is included exactly once, whatever the student chose.
//
// This module owns the RULES: which categories are common, which are the
// selectable domains, how many of them the student must and may choose, and
// whether a selection is valid. The API, the paper builder, the tests and the
// admin UI all go through here, so they cannot drift apart.
//
// The domain of a question is its category (Aptitude, Logic, Frontend, ...).
// The category list is server-owned (services/competency.js) and the count of
// a category lives in exam_events.question_counts - one place, one truth.

export const DOMAIN_MODES = { FIXED: 'fixed', SELECT: 'select' };

// The rules of an event, normalised. Never throws: a broken configuration
// degrades to the safest reading (fixed mode) instead of breaking the exam.
export function domainRules(event) {
  const mode = event?.domain_mode === DOMAIN_MODES.SELECT ? DOMAIN_MODES.SELECT : DOMAIN_MODES.FIXED;
  const raw = event?.domain_rules && typeof event.domain_rules === 'object' && !Array.isArray(event.domain_rules)
    ? event.domain_rules
    : {};
  const counts = event?.question_counts && typeof event.question_counts === 'object' ? event.question_counts : {};

  const strings = (value) => (Array.isArray(value) ? value.filter((v) => typeof v === 'string' && v.trim()) : []);
  const countOf = (code) => Number(counts[code] || 0);

  const common = strings(raw.common).filter((c) => countOf(c) > 0);
  // A domain without a question count cannot be offered - there is nothing to
  // put in the paper. It stays in the configuration, it just is not selectable.
  const allowed = strings(raw.allowed).filter((c) => countOf(c) > 0 && !common.includes(c));

  const max = Math.min(
    Number.isInteger(raw.max) && raw.max > 0 ? raw.max : allowed.length,
    allowed.length,
  );
  const min = Math.min(
    Number.isInteger(raw.min) && raw.min > 0 ? raw.min : 1,
    max,
  );

  return { mode, common, allowed, min, max };
}

// The rules as the student sees them: codes and names only, never the bank.
export function domainConfig(event) {
  const rules = domainRules(event);
  const counts = event?.question_counts || {};
  const describe = (code) => ({ code, name: code, count: Number(counts[code] || 0) });
  return {
    enabled: rules.mode === DOMAIN_MODES.SELECT && rules.allowed.length > 0,
    common: rules.common.map(describe),
    allowed: rules.allowed.map(describe),
    min: rules.min,
    max: rules.max,
  };
}

// How many questions the paper holds for a selection: the common part plus the
// count of every chosen domain. A fixed event holds the categories of the
// event, whoever looks at it.
export function plannedQuestionCount(event, selection = []) {
  const rules = domainRules(event);
  const counts = event?.question_counts || {};
  if (rules.mode !== 'select') {
    return plannedCategories(event, selection).reduce((sum, c) => sum + Number(counts[c] || 0), 0);
  }
  const common = rules.common.reduce((sum, c) => sum + Number(counts[c] || 0), 0);
  const technical = selection.reduce((sum, c) => sum + Number(counts[c] || 0), 0);
  return common + technical;
}

// The categories the paper holds, in order: the common part first, then the
// chosen domains in the order of the allowed list - the same order for every
// student, so the sections of two papers of one exam read the same.
export function plannedCategories(event, selection = []) {
  const rules = domainRules(event);
  if (rules.mode !== 'select') {
    const counts = event?.question_counts || {};
    return event?.categories?.length ? event.categories : Object.keys(counts);
  }
  const chosen = new Set(selection);
  return [...rules.common, ...rules.allowed.filter((c) => chosen.has(c))];
}

// Validate the selection against the rules of the event.
// Returns { ok: true, selected } or { ok: false, error, code }.
export function validateSelection(event, selection) {
  const rules = domainRules(event);
  if (rules.mode !== DOMAIN_MODES.SELECT) {
    return { ok: true, selected: [] };
  }

  const list = Array.isArray(selection) ? selection : [];
  const cleaned = list.map((v) => String(v ?? '').trim()).filter(Boolean);

  if (!cleaned.length) {
    return {
      ok: false,
      code: 'domains_required',
      error: `Choose at least ${rules.min} technical domain${rules.min === 1 ? '' : 's'} before starting the exam.`,
    };
  }

  const unknown = cleaned.filter((c) => !rules.allowed.includes(c));
  if (unknown.length) {
    return {
      ok: false,
      code: 'unknown_domain',
      error: `Unknown technical domain: ${unknown.join(', ')}.`,
    };
  }

  const duplicate = cleaned.find((c, i) => cleaned.indexOf(c) !== i);
  if (duplicate) {
    return { ok: false, code: 'duplicate_domain', error: `The domain ${duplicate} was chosen twice.` };
  }

  if (cleaned.length < rules.min) {
    return {
      ok: false,
      code: 'too_few_domains',
      error: `Choose at least ${rules.min} technical domain${rules.min === 1 ? '' : 's'}.`,
    };
  }
  if (cleaned.length > rules.max) {
    return {
      ok: false,
      code: 'too_many_domains',
      error: `Choose at most ${rules.max} technical domains.`,
    };
  }

  return { ok: true, selected: cleaned };
}
