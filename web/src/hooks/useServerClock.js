import { useEffect, useRef, useState } from 'react';

/**
 * Display clock anchored to the server. We store (serverTime - localTime) once
 * per server response and animate from that offset. This is for DISPLAY only;
 * entry/expiry decisions always come back from the server.
 *
 * The tick is one second: the display shows whole seconds, and a faster tick
 * only re-renders the page for no visible gain.
 */
export function useServerClock(serverTimeIso) {
  const offset = useRef(0);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (serverTimeIso) offset.current = Date.parse(serverTimeIso) - Date.now();
    setNow(Date.now() + offset.current);
  }, [serverTimeIso]);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now() + offset.current), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}
