// The technical domains the student picked in the waiting room.
//
// The choice travels to the exam page through the session storage. The server
// validates the selection again when the paper is created - this is a
// convenience, never the authority.

export const DOMAIN_SELECTION_KEY = 'examrobo.domains';

export function saveDomainSelection(domains) {
  try {
    sessionStorage.setItem(DOMAIN_SELECTION_KEY, JSON.stringify(domains));
  } catch {
    /* private mode: the selection is simply asked again */
  }
}

export function readDomainSelection() {
  try {
    const raw = sessionStorage.getItem(DOMAIN_SELECTION_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((d) => typeof d === 'string') : [];
  } catch {
    return [];
  }
}

export function clearDomainSelection() {
  try {
    sessionStorage.removeItem(DOMAIN_SELECTION_KEY);
  } catch {
    /* nothing to clean up */
  }
}
