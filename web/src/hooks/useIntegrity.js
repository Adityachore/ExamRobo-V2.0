import { useEffect, useRef } from 'react';
import { installIntegrityGuards, createKindThrottle } from '../lib/integrity.js';

/**
 * Wire the browser integrity guards into the exam runner.
 *
 * onViolation(kind, detail) is called for every signal the browser sees.
 * The throttle is per kind: a blur that also hides the tab is one warning,
 * but a screenshot key press is never swallowed by an earlier clipboard
 * event.
 */
export function useIntegrity({ onViolation, onFullscreenChange, enabled = true } = {}) {
  const violationRef = useRef(onViolation);
  violationRef.current = onViolation;
  const fullscreenRef = useRef(onFullscreenChange);
  fullscreenRef.current = onFullscreenChange;

  useEffect(() => {
    if (!enabled) return undefined;
    const throttle = createKindThrottle();
    const guards = installIntegrityGuards({
      onViolation: (kind, detail) => {
        if (!throttle(kind)) return;
        violationRef.current?.(kind, detail);
      },
      onFullscreenChange: (active) => fullscreenRef.current?.(active),
    });
    return guards;
  }, [enabled]);
}
