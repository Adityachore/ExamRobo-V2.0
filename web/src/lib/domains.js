// The technical domains the student picked in the waiting room.
//
// The choice travels to the exam page through session storage. It is scoped to
// the event it was made for, so a choice for yesterday's exam can never leak
// into today's. The server validates the selection again when the paper is
// created - this is a convenience, never the authority.

export const DOMAIN_SELECTION_KEY = 'examrobo.domains';

function clean(domains) {
  return Array.isArray(domains) ? domains.filter((d) => typeof d === 'string') : [];
}

export function saveDomainSelection(eventId, domains) {
  if (!eventId) return;
  try {
    sessionStorage.setItem(
      DOMAIN_SELECTION_KEY,
      JSON.stringify({ eventId, domains: clean(domains) }),
    );
  } catch {
    /* private mode: the selection is simply asked again */
  }
}

export function readDomainSelection(eventId) {
  try {
    const raw = sessionStorage.getItem(DOMAIN_SELECTION_KEY);
    const stored = raw ? JSON.parse(raw) : null;
    // A legacy bare array has no event attached; ignore it rather than risk
    // carrying an old selection into a different exam.
    if (!stored || Array.isArray(stored)) return [];
    if (!eventId || stored.eventId !== eventId) return [];
    return clean(stored.domains);
  } catch {
    return [];
  }
}

export function clearDomainSelection(eventId) {
  try {
    if (!eventId) {
      sessionStorage.removeItem(DOMAIN_SELECTION_KEY);
      return;
    }
    const raw = sessionStorage.getItem(DOMAIN_SELECTION_KEY);
    const stored = raw ? JSON.parse(raw) : null;
    if (!stored || Array.isArray(stored) || stored.eventId === eventId) {
      sessionStorage.removeItem(DOMAIN_SELECTION_KEY);
    }
  } catch {
    /* nothing to clean up */
  }
}
