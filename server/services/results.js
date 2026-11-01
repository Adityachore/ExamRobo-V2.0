import { q } from '../db.js';

export const RESULTS_VISIBILITIES = ['immediate', 'after_all_submitted', 'manual', 'never'];

export function normalizeResultsVisibility(value) {
  return RESULTS_VISIBILITIES.includes(value) ? value : 'manual';
}

// Pure state machine: the caller always checks that the student submitting is
// actually submitted. `totalPapers` counts every paper of the event, including
// students who never started; `submittedPapers` counts the submitted ones.
export function resultsState(event, { totalPapers = 0, submittedPapers = 0, now = Date.now() } = {}) {
  const visibility = normalizeResultsVisibility(event?.results_visibility);
  const publishedAt = event?.results_published_at || null;
  const expiresAt = event?.results_expires_at || null;
  const expiry = expiresAt ? new Date(expiresAt).getTime() : null;
  const allSubmitted = submittedPapers >= totalPapers;

  if (visibility === 'never') {
    return {
      visibility,
      available: false,
      status: 403,
      code: 'results_unavailable',
      error: 'Results are not available for this exam.',
      published_at: publishedAt,
      expires_at: expiresAt,
    };
  }

  if (visibility === 'immediate') {
    return {
      visibility,
      available: true,
      status: 200,
      code: null,
      error: null,
      published_at: publishedAt,
      expires_at: expiresAt,
      all_submitted: allSubmitted,
    };
  }

  if (visibility === 'after_all_submitted') {
    if (!allSubmitted) {
      return {
        visibility,
        available: false,
        status: 409,
        code: 'results_not_published',
        error: 'Results will be available after all students submit.',
        published_at: publishedAt,
        expires_at: expiresAt,
        all_submitted: false,
        total_papers: totalPapers,
        submitted_papers: submittedPapers,
      };
    }
    return {
      visibility,
      available: true,
      status: 200,
      code: null,
      error: null,
      published_at: publishedAt,
      expires_at: expiresAt,
      all_submitted: true,
      total_papers: totalPapers,
      submitted_papers: submittedPapers,
    };
  }

  // manual
  if (!publishedAt) {
    return {
      visibility,
      available: false,
      status: 409,
      code: 'results_not_published',
      error: 'Results will be published by the exam team.',
      published_at: null,
      expires_at: expiresAt,
      all_submitted: allSubmitted,
    };
  }
  if (expiry !== null && expiry <= now) {
    return {
      visibility,
      available: false,
      status: 403,
      code: 'results_expired',
      error: 'The result window for this exam has closed.',
      published_at: publishedAt,
      expires_at: expiresAt,
      expired: true,
      all_submitted: allSubmitted,
    };
  }
  return {
    visibility,
    available: true,
    status: 200,
    code: null,
    error: null,
    published_at: publishedAt,
    expires_at: expiresAt,
    all_submitted: allSubmitted,
  };
}

export async function resultsStateForEvent(event, now = Date.now()) {
  const { rows } = await q(
    `SELECT count(*)::int AS total,
            count(*) FILTER (WHERE status = 'submitted')::int AS submitted
       FROM papers
      WHERE event_id = $1`,
    [event.id],
  );
  return resultsState(event, {
    totalPapers: rows[0]?.total || 0,
    submittedPapers: rows[0]?.submitted || 0,
    now,
  });
}

// Manual publication is the only mode that needs a publish endpoint.
export function manualPublishReady(state) {
  return state.visibility === 'manual' && !state.available;
}
