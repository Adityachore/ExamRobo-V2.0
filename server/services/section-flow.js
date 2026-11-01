import { q, withTransaction } from '../db.js';
import { sectionViewOf } from './sections.js';
import { submitPaper } from './sessions.js';

const earlier = (a, b) => (a.getTime() <= b.getTime() ? a : b);

async function startSection(client, row, at, paperEndsAt) {
  const startsAt = new Date(at);
  const plannedEnd = new Date(startsAt.getTime() + Number(row.limit_min) * 60000);
  const endsAt = earlier(plannedEnd, new Date(paperEndsAt));
  await client.query(
    `UPDATE paper_sections
        SET started_at = $3, ends_at = $4
      WHERE paper_id = $1 AND category = $2`,
    [row.paper_id, row.category, startsAt, endsAt],
  );
  row.started_at = startsAt;
  row.ends_at = endsAt;
}

async function completeSection(client, row, at) {
  const completedAt = at ? new Date(at) : new Date();
  await client.query(
    `UPDATE paper_sections
        SET completed_at = $3
      WHERE paper_id = $1 AND category = $2`,
    [row.paper_id, row.category, completedAt],
  );
  row.completed_at = completedAt;
}

/**
 * Move a paper through its sections. Called on every authoritative read and by
 * the background sweeper.
 *
 * - The first section starts when the paper is created (or on the first call
 *   for an older paper).
 * - An expired section is completed at its own deadline and the next section
 *   starts at that same instant, so server latency never steals section time.
 * - `finishCategory` completes the active section early and starts the next one
 *   immediately. Finishing the last section submits the paper.
 * - A paper whose last section expired is submitted with reason time_expired.
 *
 * A conflict is returned when a finish request names a section that is not the
 * active one. Nothing is submitted for a conflict.
 */
export async function advancePaperSections(paper, { finishCategory = null } = {}) {
  if (!paper) return { paper: null, sections: [], active: null, conflict: null, submittedReason: null };

  const outcome = await withTransaction(async (client) => {
    const { rows: paperRows } = await client.query(
      `SELECT * FROM papers WHERE id = $1 FOR UPDATE`,
      [paper.id],
    );
    const locked = paperRows[0];
    if (!locked || locked.status !== 'active') {
      return { paper: locked || paper, rows: [], conflict: null, reason: null };
    }

    const { rows } = await client.query(
      `SELECT paper_id, position, category, limit_min, started_at, ends_at, completed_at
         FROM paper_sections
        WHERE paper_id = $1
        ORDER BY position
          FOR UPDATE`,
      [paper.id],
    );
    if (!rows.length) {
      return { paper: locked, rows, conflict: null, reason: null, legacy: true };
    }

    const now = Date.now();
    let current = rows.find((row) => row.started_at && !row.completed_at) || null;
    if (!current) {
      const first = rows.find((row) => !row.started_at && !row.completed_at);
      if (first) {
        await startSection(client, first, new Date(now), locked.ends_at);
        current = first;
      }
    }
    if (!current) {
      return { paper: locked, rows, conflict: null, reason: 'student' };
    }

    let finishedByStudent = false;
    if (finishCategory) {
      if (finishCategory !== current.category) {
        const requested = rows.find((row) => row.category === finishCategory) || current;
        return {
          paper: locked,
          rows,
          conflict: {
            requested: sectionViewOf(requested, now),
            active: sectionViewOf(current, now),
          },
          reason: null,
        };
      }

      const endsAt = new Date(current.ends_at).getTime();
      if (endsAt <= now) {
        // The clock already ended it. Let the automatic path decide the reason,
        // so a late click cannot turn a timeout into an early finish.
      } else {
        await completeSection(client, current, new Date(now));
        current = null;
        finishedByStudent = true;
      }
    }

    let nextStart = finishedByStudent ? now : null;
    let reason = null;
    for (;;) {
      if (current) {
        const endsAt = new Date(current.ends_at).getTime();
        if (endsAt > now) break;
        await completeSection(client, current, new Date(endsAt));
        nextStart = endsAt;
        current = null;
      }

      const next = rows.find((row) => !row.started_at && !row.completed_at);
      if (!next) {
        reason = finishedByStudent ? 'student' : 'time_expired';
        break;
      }

      await startSection(client, next, new Date(nextStart ?? now), locked.ends_at);
      current = next;
      nextStart = null;

      if (finishedByStudent) {
        finishedByStudent = false;
        break;
      }
    }

    return { paper: locked, rows, conflict: null, reason };
  });

  let finalPaper = outcome.paper;
  if (outcome.reason) finalPaper = await submitPaper(finalPaper, outcome.reason);

  const now = Date.now();
  const sections = outcome.rows.map((row) => sectionViewOf(row, now));
  const activeRow = outcome.rows.find((row) => {
    if (!row.started_at || row.completed_at) return false;
    return !row.ends_at || new Date(row.ends_at).getTime() > now;
  }) || null;

  return {
    paper: finalPaper,
    sections,
    active: activeRow ? sectionViewOf(activeRow, now) : null,
    conflict: outcome.conflict,
    submittedReason: outcome.reason,
  };
}

// Section deadlines must still move while nobody is polling (a closed laptop, a
// dead network). The paper deadline has its own sweeper; this one advances and,
// for the last section, submits.
export function startSectionSweeper(intervalMs = 4000) {
  const timer = setInterval(async () => {
    try {
      const { rows } = await q(
        `SELECT p.*
           FROM papers p
          WHERE p.status = 'active'
            AND EXISTS (
              SELECT 1 FROM paper_sections ps
               WHERE ps.paper_id = p.id
                 AND ps.started_at IS NOT NULL
                 AND ps.completed_at IS NULL
                 AND ps.ends_at <= now()
            )
          LIMIT 50`,
      );
      for (const paper of rows) await advancePaperSections(paper);
    } catch (err) {
      console.error('[sections] section sweep failed:', err.message);
    }
  }, intervalMs);
  timer.unref?.();
  return timer;
}
