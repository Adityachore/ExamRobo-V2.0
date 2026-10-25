import { Select, Badge } from './ui.jsx';
import { fmtDateTime } from '../lib/format.js';

export const TWO_HOURS = 2 * 3600 * 1000;

/** Upcoming / Ongoing / Completed from server-provided start and end. */
export function eventStatus(ev, now = Date.now()) {
  if (now < Date.parse(ev.starts_at)) return 'upcoming';
  if (now < Date.parse(ev.ends_at)) return 'ongoing';
  return 'completed';
}

/**
 * UI cue only (the server-side HR_MISTAKE auto-flag is a separate rule).
 * Stale = roster last updated more than 2 h before the reference time, where the
 * reference is "now" for upcoming events and the event start once it has begun.
 * Completed events are never flagged.
 */
export function rosterFreshness(ev, now = Date.now()) {
  if (!ev.roster_updated_at) return 'none';
  if (eventStatus(ev, now) === 'completed') return 'fresh';
  const ref = Math.min(now, Date.parse(ev.starts_at));
  return ref - Date.parse(ev.roster_updated_at) > TWO_HOURS ? 'stale' : 'fresh';
}

export function RosterBadge({ ev }) {
  const f = rosterFreshness(ev);
  if (f === 'none') return <Badge tone="neutral">No roster yet</Badge>;
  if (f === 'stale') return <Badge tone="warn" className="cursor-help"><span title={`Roster last updated ${fmtDateTime(ev.roster_updated_at)}`}>Roster may be stale</span></Badge>;
  return <Badge tone="ok">Updated</Badge>;
}

export function StatusBadge({ status }) {
  const m = { upcoming: ['blue', 'Upcoming'], ongoing: ['ok', 'Ongoing'], completed: ['neutral', 'Completed'] }[status];
  return <Badge tone={m[0]}>{m[1]}</Badge>;
}

export function EventSelect({ events, value, onChange, allLabel, id = 'event-select', label = 'Event' }) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-[13px] font-medium text-muted">{label}</label>
      <Select id={id} value={value ?? ''} onChange={(e) => onChange(e.target.value || null)} className="min-w-56">
        {allLabel && <option value="">{allLabel}</option>}
        {!allLabel && value == null && <option value="">Select an event</option>}
        {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
      </Select>
    </div>
  );
}

// Tabs lives in ui.jsx now: the student result page shows the same
// segmented control as the admin pages.
