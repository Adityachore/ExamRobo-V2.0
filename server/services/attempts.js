import { q, withTransaction } from '../db.js';
import { buildPaperPlan } from './paper.js';
import { paperDuration } from './event-config.js';
import {
  broadcastSession,
  loadPaperById,
  logProctorEvent,
  rosterRemoved,
  submitPaper,
} from './sessions.js';
import { sessionViewById } from './views.js';
import { paperSectionRows } from './sections.js';
import { toStudent } from './live.js';

const RESUMABLE = new Set(['integrity_lockout', 'force_submit', 'time_expired']);

function fail(status, message, code) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}

async function audit(client, actor, action, detail) {
  await client.query(
    `INSERT INTO admin_actions (actor_email, action, event_id, paper_id, target_email, reason, detail)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [
      actor || 'admin',
      action,
      detail.event_id || null,
      detail.paper_id || null,
      detail.email || null,
      detail.reason || null,
      detail.detail || {},
    ],
  );
}

export async function resumePaper(paper, { minutes, reason, actor }) {
  if (!paper) throw fail(404, 'Session not found.', 'not_found');
  if (await rosterRemoved(paper.event_id, paper.email)) {
    throw fail(409, 'Restore this student to the roster before resuming their paper.', 'student_removed');
  }
  if (paper.status !== 'submitted' || !RESUMABLE.has(paper.submit_reason)) {
    throw fail(409, 'This session cannot be resumed.', 'not_resumable');
  }
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 1440) {
    throw fail(400, 'Extension must be between 1 and 1440 minutes.', 'invalid_minutes');
  }
  if (!reason) throw fail(400, 'A reason is required.', 'reason_required');

  await withTransaction(async (client) => {
    const result = await client.query(
      `UPDATE papers
          SET status='active', submitted_at=NULL, submit_reason=NULL, lock_reason=NULL,
              access_revoked_at=NULL, fullscreen_state=NULL, last_seen_at=now(),
              ends_at=GREATEST(now(), ends_at) + ($2::int * interval '1 minute')
        WHERE id=$1 AND status='submitted'
        RETURNING id`,
      [paper.id, minutes],
    );
    if (!result.rowCount) throw fail(409, 'This session cannot be resumed.', 'not_resumable');

    const { rows: sections } = await client.query(
      `SELECT position, completed_at
         FROM paper_sections
        WHERE paper_id = $1
        ORDER BY position
          FOR UPDATE`,
      [paper.id],
    );
    if (sections.some((section) => !section.completed_at)) {
      // Keep completed sections closed; restart the open section's clock.
      await client.query(
        `UPDATE paper_sections SET started_at=NULL, ends_at=NULL WHERE paper_id=$1`,
        [paper.id],
      );
    } else if (sections.length) {
      // Every section was already finished. Reopen the last one so the
      // extension has somewhere to run instead of submitting again instantly.
      const last = sections[sections.length - 1];
      await client.query(
        `UPDATE paper_sections
            SET started_at=NULL, ends_at=NULL, completed_at=NULL
          WHERE paper_id=$1 AND position=$2`,
        [paper.id, last.position],
      );
    }

    await audit(client, actor, 'paper.resume', {
      event_id: paper.event_id,
      paper_id: paper.id,
      email: paper.email,
      reason,
      detail: { minutes },
    });
  });

  const updated = await loadPaperById(paper.id);
  await logProctorEvent(updated, 'resumed', `${minutes} minute extension: ${reason}`);
  await broadcastSession(updated);
  toStudent(updated.email, {
    type: 'resumed',
    minutes,
    reason,
    ends_at: updated.ends_at,
  });
  return sessionViewById(updated.id);
}

export async function restartPaper(paper, event, { reason, actor }) {
  if (!paper) throw fail(404, 'Session not found.', 'not_found');
  if (!reason) throw fail(400, 'A reason is required.', 'reason_required');

  let plan;
  try {
    plan = await buildPaperPlan(event, Math.random, paper.selected_categories || []);
  } catch (err) {
    if (err?.code === 'insufficient_questions') {
      throw fail(409, `Cannot build a fresh paper: ${err.message}.`, 'insufficient_questions');
    }
    if (err?.status === 400) throw fail(400, err.message, err.code);
    throw err;
  }

  const [answers, warnings, sections] = await Promise.all([
    q(`SELECT qno, choice FROM answers WHERE paper_id=$1 ORDER BY qno`, [paper.id]),
    q(`SELECT kind, detail, source, created_at FROM warnings WHERE paper_id=$1 ORDER BY created_at`, [paper.id]),
    paperSectionRows(paper.id),
  ]);

  const now = Date.now();
  const durationMin = paperDuration(event, plan.selected);
  const endsAt = new Date(now + durationMin * 60000);

  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO paper_attempt_history
         (paper_id, attempt_no, event_id, email, variant_ids, selected_categories,
          answers, warnings, section_state, score, submit_reason, started_at, ended_at, reason, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [
        paper.id,
        paper.attempt_no || 1,
        paper.event_id,
        paper.email,
        paper.variant_ids,
        paper.selected_categories || [],
        JSON.stringify(Object.fromEntries(answers.rows.map((row) => [row.qno, row.choice]))),
        JSON.stringify(warnings.rows),
        JSON.stringify(sections),
        paper.score ?? null,
        paper.submit_reason || null,
        paper.started_at || null,
        paper.submitted_at || null,
        reason,
        actor || null,
      ],
    );

    await client.query(`DELETE FROM answers WHERE paper_id=$1`, [paper.id]);
    await client.query(`DELETE FROM warnings WHERE paper_id=$1`, [paper.id]);
    await client.query(`DELETE FROM feedback WHERE paper_id=$1`, [paper.id]);
    await client.query(`DELETE FROM paper_questions WHERE paper_id=$1`, [paper.id]);
    await client.query(`DELETE FROM paper_sections WHERE paper_id=$1`, [paper.id]);

    const updated = await client.query(
      `UPDATE papers
          SET variant_ids=$2, started_at=now(), ends_at=$3, status='active',
              submitted_at=NULL, submit_reason=NULL, lock_reason=NULL, score=NULL,
              current_index=0, fullscreen_state=NULL, last_seen_at=now(),
              access_revoked_at=NULL, attempt_no=attempt_no + 1,
              duration_min=$4, option_orders=$5::jsonb
        WHERE id=$1
        RETURNING attempt_no`,
      [paper.id, plan.variantIds, endsAt, durationMin, JSON.stringify(plan.optionOrders)],
    );

    await client.query(
      `INSERT INTO paper_questions (paper_id, qno, variant_id, skill_id, skill_code, difficulty, category)
       SELECT $1, t.ord - 1, t.variant_id, qq.skill_id, s.code, qq.difficulty, qq.category
         FROM unnest($2::uuid[]) WITH ORDINALITY AS t(variant_id, ord)
         JOIN question_variants v ON v.id = t.variant_id
         JOIN questions qq ON qq.id = v.question_id
         LEFT JOIN skills s ON s.id = qq.skill_id`,
      [paper.id, plan.variantIds],
    );

    const limits = event.section_limits || {};
    for (let position = 0; position < plan.sections.length; position++) {
      const section = plan.sections[position];
      const limit = Number(limits[section.name]);
      if (!(limit > 0)) continue;
      await client.query(
        `INSERT INTO paper_sections (paper_id, position, category, limit_min)
         VALUES ($1,$2,$3,$4)`,
        [paper.id, position, section.name, limit],
      );
    }

    await audit(client, actor, 'paper.restart', {
      event_id: paper.event_id,
      paper_id: paper.id,
      email: paper.email,
      reason,
      detail: { attempt_no: updated.rows[0]?.attempt_no || null },
    });
  });

  const updated = await loadPaperById(paper.id);
  await logProctorEvent(updated, 'restarted', reason);
  await broadcastSession(updated);
  toStudent(updated.email, { type: 'restarted', reason, ends_at: updated.ends_at });
  return sessionViewById(updated.id);
}

export async function removeRosterStudent(eventId, email, { reason, actor }) {
  const { rows } = await q(
    `SELECT * FROM roster_emails WHERE event_id=$1 AND email=$2`,
    [eventId, email],
  );
  if (!rows.length) throw fail(404, 'Student is not on this roster.', 'not_found');

  await q(
    `UPDATE roster_emails
        SET removed_at=now(), removed_reason=$3, removed_by=$4, updated_at=now()
      WHERE event_id=$1 AND email=$2`,
    [eventId, email, reason, actor || null],
  );

  const paper = (await q(`SELECT * FROM papers WHERE event_id=$1 AND email=$2`, [eventId, email])).rows[0];
  if (paper?.status === 'active') {
    await q(`UPDATE papers SET access_revoked_at=now() WHERE id=$1`, [paper.id]);
    await submitPaper(paper, 'removed');
    toStudent(email, { type: 'removed', reason, final: true });
  }

  await withTransaction(async (client) => {
    await audit(client, actor, 'roster.remove', {
      event_id: eventId,
      paper_id: paper?.id || null,
      email,
      reason,
      detail: { paper_submitted: paper?.status === 'active' },
    });
  });

  return { ok: true, email, submitted: paper?.status === 'active' };
}
