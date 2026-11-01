import { q, withTransaction } from '../db.js';
import { toStudent } from './live.js';
import {
  MAX_WARNINGS,
  broadcastSession,
  logProctorEvent,
  submitPaper,
  warningCount,
} from './sessions.js';

// Exam integrity policy.
//
//   warn - recorded and counted. The warning that reaches MAX_WARNINGS submits
//          the paper with reason max_warnings.
//   log  - recorded for the proctor, no penalty.
//
// The browser is controlled by the student, so a client-reported kind is a
// SIGNAL and never proof. The server owns the count and the consequence, which
// is what makes a modified client useless. The kinds below are the whole
// vocabulary: anything not in this table is rejected.
export const TIERS = { WARN: 'warn', LOG: 'log' };

export const INTEGRITY_KINDS = {
  // --- tier: warn --------------------------------------------------------
  // Capture attempts and evidence-stream changes are recorded for review.
  screenshot_key: {
    tier: TIERS.WARN,
    label: 'Screenshot key pressed',
    reason: 'A screenshot key (PrintScreen) was pressed during the exam.',
  },
  tab_blur: {
    tier: TIERS.WARN,
    label: 'Left the exam tab',
    reason: 'You left the exam tab.',
  },
  fullscreen_exit: {
    tier: TIERS.WARN,
    label: 'Exited fullscreen',
    reason: 'You exited fullscreen.',
  },
  clipboard: {
    tier: TIERS.WARN,
    label: 'Clipboard blocked',
    reason: 'Copy, cut and paste are disabled during the exam.',
  },
  context_menu: {
    tier: TIERS.WARN,
    label: 'Context menu blocked',
    reason: 'The right-click menu is disabled during the exam.',
  },
  print: {
    tier: TIERS.WARN,
    label: 'Print blocked',
    reason: 'Printing is disabled during the exam.',
  },
  second_window: {
    tier: TIERS.WARN,
    label: 'Second window detected',
    reason: 'A second window of the exam was opened.',
  },
  second_session: {
    tier: TIERS.WARN,
    label: 'Second session detected',
    reason: 'This exam was signed in from another device or browser.',
  },
  display_change: {
    tier: TIERS.WARN,
    label: 'Display configuration changed',
    reason: 'The display configuration changed during the exam (a second screen, or a resolution change).',
  },

  // --- tier: log ---------------------------------------------------------
  // Too noisy or too unreliable to penalise, but the proctor should see them.
  devtools: {
    tier: TIERS.LOG,
    label: 'Developer tools suspected',
    reason: 'Developer tools appear to be open.',
  },
  // The Windows / macOS key. The operating system consumes the snipping-tool
  // chord (Win+Shift+S) before the page ever sees it, so this bare key press
  // is the only trace of it that a web page can produce. Recorded for the
  // proctor, never penalised.
  os_chord: {
    tier: TIERS.LOG,
    label: 'Operating-system key pressed',
    reason: 'An operating-system key combination was pressed during the exam.',
  },
  network_gap: {
    tier: TIERS.LOG,
    label: 'Connection gap',
    reason: 'The exam client was not reachable for a sustained period.',
  },
};

// The complete kind registry. It includes the server-detected kinds so the
// contract stays one list, but those are never accepted from an HTTP client.
export const REPORTABLE_KINDS = Object.keys(INTEGRITY_KINDS);

// Detected by the server, never reported by the browser.
export const SERVER_ONLY_KINDS = new Set(['second_window', 'second_session', 'network_gap']);

// One user action can produce several different signals. Switching away with
// Alt-Tab blurs the window, leaves fullscreen, and can change the display
// geometry - all within a second. They are the same incident and must cost one
// warning, not one per detector.
export const INCIDENT_KINDS = ['tab_blur', 'fullscreen_exit', 'display_change'];
const INCIDENT_WINDOW_MS = 4000;

// The kinds a browser may report.
export const CLIENT_REPORTABLE_KINDS = REPORTABLE_KINDS.filter((kind) => !SERVER_ONLY_KINDS.has(kind));

export function isKnownKind(kind) {
  return Object.prototype.hasOwnProperty.call(INTEGRITY_KINDS, kind);
}

export function isClientReportable(kind) {
  return isKnownKind(kind) && !SERVER_ONLY_KINDS.has(kind);
}

export function kindInfo(kind) {
  return INTEGRITY_KINDS[kind] || null;
}

/**
 * The policy decision, without any side effect. currentWarnings is the number
 * of warnings the paper already carries, before this event.
 *
 * action: 'warn'   - count it and carry on
 *         'submit' - this warning reached the limit; submit the paper
 *         'log'    - record it, no penalty
 */
export function evaluate(kind, currentWarnings = 0) {
  const info = kindInfo(kind);
  if (!info) return { ok: false, action: 'ignore', error: 'Unknown event.' };

  if (info.tier === TIERS.LOG) {
    return {
      ok: true,
      tier: TIERS.LOG,
      action: 'log',
      label: info.label,
      reason: info.reason,
      warnings: currentWarnings,
    };
  }

  const warnings = currentWarnings + 1;
  return {
    ok: true,
    tier: TIERS.WARN,
    action: warnings >= MAX_WARNINGS ? 'submit' : 'warn',
    label: info.label,
    reason: info.reason,
    warnings,
  };
}

/**
 * End the exam because of a manual or integrity decision. The paper is
 * submitted and graded exactly like a normal hand-in (the score stands), a
 * MISCONDUCT flag is raised for the admin to review, and the student is signed
 * out. This is only called by an explicit admin action.
 */
export async function lockPaper(paper, kind, info) {
  const label = info?.label || 'Integrity violation';
  const reason = info?.reason || 'The exam was ended because of an integrity violation.';

  await q(`UPDATE papers SET lock_reason = $2 WHERE id = $1`, [paper.id, label]);
  const updated = await submitPaper(paper, 'integrity_lockout');

  await q(
    `INSERT INTO flags (kind, subject_type, subject_id, event_id, reason)
     VALUES ('MISCONDUCT', 'student', $1, $2, $3)`,
    [paper.email, paper.event_id, `${label}: ${reason}`],
  );

  toStudent(paper.email, {
    type: 'locked',
    kind,
    label,
    reason,
    at: new Date().toISOString(),
  });

  return { ...updated, lock_reason: label };
}

/**
 * Was this kind recorded on this paper very recently?
 *
 * One incident is one warning. Leaving fullscreen is seen by the client AND
 * by the server heartbeat, and the two must not spend two of the three
 * strikes on the same moment.
 */
export async function recentWarning(paperId, kind, withinMs = 10000) {
  const { rows } = await q(
    `SELECT 1 FROM warnings
      WHERE paper_id = $1 AND kind = $2
        AND created_at > now() - ($3::int * interval '1 millisecond')
      LIMIT 1`,
    [paperId, kind, withinMs],
  );
  return rows.length > 0;
}

/**
 * Record one violation and apply the policy.
 *
 * Returns { ok, kind, tier, warnings, locked, submitted, reason }.
 */
export async function recordViolation(paper, kind, detail = '', options = {}) {
  const info = kindInfo(kind);
  if (!info) return { ok: false, error: 'Unknown event.' };
  if (!paper || paper.status !== 'active') return { ok: false, error: 'No active exam.' };

  const note = detail ? String(detail).slice(0, 500) : '';
  const source = options.source === 'server' ? 'server' : 'client';
  const clientEventId = options.clientEventId
    ? String(options.clientEventId).slice(0, 128)
    : null;
  const base = { ok: true, kind, tier: info.tier, label: info.label };

  // The paper row is the serialization point. Two tabs cannot both observe
  // "warning 2" and both stop short of submitting.
  const outcome = await withTransaction(async (client) => {
    const { rows: paperRows } = await client.query(
      `SELECT * FROM papers WHERE id = $1 FOR UPDATE`,
      [paper.id],
    );
    const locked = paperRows[0];
    if (!locked || locked.status !== 'active') return { inactive: true };

    const count = async () => {
      const { rows } = await client.query(
        `SELECT count(*)::int AS n FROM warnings WHERE paper_id = $1`,
        [paper.id],
      );
      return rows[0].n;
    };

    // The exam is not fullscreen from now on. The heartbeat carries the
    // fullscreen state, so the next heartbeat must not count this again.
    if (kind === 'fullscreen_exit') {
      await client.query(`UPDATE papers SET fullscreen_state = false WHERE id = $1`, [paper.id]);
    }

    // One incident is one warning, however many detectors (or kinds) saw it:
    // the client's blur/fullscreen observers and the server heartbeat.
    if (INCIDENT_KINDS.includes(kind)) {
      const { rows: recent } = await client.query(
        `SELECT 1 FROM warnings
          WHERE paper_id = $1 AND kind = ANY($2::text[])
            AND created_at > now() - ($3::int * interval '1 millisecond')
          LIMIT 1`,
        [paper.id, INCIDENT_KINDS, INCIDENT_WINDOW_MS],
      );
      if (recent.length) return { duplicate: true, warnings: await count(), paper: locked };
    }

    if (info.tier === TIERS.LOG) {
      return { action: 'log', warnings: await count(), paper: locked };
    }

    const { rows: inserted } = await client.query(
      `INSERT INTO warnings (paper_id, kind, detail, source, client_event_id)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [paper.id, kind, note ? { note } : null, source, clientEventId],
    );
    if (!inserted.length) {
      return { duplicate: true, warnings: await count(), paper: locked };
    }

    const warnings = await count();
    return {
      action: warnings >= MAX_WARNINGS ? 'submit' : 'warn',
      warnings,
      paper: locked,
    };
  });

  if (outcome.inactive) return { ok: false, error: 'No active exam.' };
  if (outcome.duplicate) {
    return { ...base, warnings: outcome.warnings, locked: false, submitted: false, duplicate: true };
  }

  await logProctorEvent(outcome.paper, kind, note || info.reason);

  if (outcome.action === 'submit') {
    await submitPaper(outcome.paper, 'max_warnings');
    return {
      ...base,
      warnings: outcome.warnings,
      locked: false,
      submitted: true,
      submit_reason: 'max_warnings',
    };
  }

  await broadcastSession(paper);
  return {
    ...base,
    warnings: outcome.warnings,
    locked: false,
    submitted: false,
  };
}

/**
 * The integrity state of a paper, for the snapshot endpoint and the session
 * view. `locked` is true once the paper was ended by the policy.
 */
export async function integrityState(paper) {
  const warnings = await warningCount(paper.id);
  const locked = paper.status === 'submitted' && paper.submit_reason === 'integrity_lockout';
  return {
    warnings,
    max_warnings: MAX_WARNINGS,
    locked,
    lock_reason: paper.lock_reason || null,
    submit_reason: paper.submit_reason || null,
  };
}
